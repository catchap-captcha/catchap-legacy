/**
 * Sound Match CAPTCHA — API 라우트
 * ---------------------------------------------------------------
 *  POST  /api/sound-match/start          새 세션 시작 → 문제 25개(정답 제거) 반환
 *  POST  /api/sound-match/attempt        문제 1개 제출 → 정답 여부 + 행동데이터 저장
 *  POST  /api/sound-match/verify         세션 종료 → 통과/실패 판정 + 토큰 발급
 *  GET   /api/sound-match/token/:token   발급된 토큰 유효성 확인
 *  GET   /api/sound-match/health         헬스체크
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const {
  generateQuestions,
  STAGE_PASS_THRESHOLD,
  TOTAL_PASS_THRESHOLD,
} = require('../data/questions');

const router = express.Router();
const uuid = () => crypto.randomUUID();

// ── 세션별 랜덤 문제 저장소 (게임 시작마다 새로 생성) ──
const sessionQuestions = new Map(); // sessionId -> Map(qid -> question)
function getSessionQuestion(sid, qid) {
  const m = sessionQuestions.get(sid);
  return m ? m.get(qid) : null;
}

/**
 * DB 폴백(in-memory) 저장소.
 * MySQL 연결이 아직 설정되지 않았어도 데모/위젯이 그대로 동작하도록,
 * DB 쓰기가 실패하면 메모리에 채점 결과를 담아둔다.
 */
const mem = new Map();
function memSession(id) {
  if (!mem.has(id)) mem.set(id, { stages: {}, totalCorrect: 0 });
  return mem.get(id);
}
function memRecord(id, stage, correct) {
  const s = memSession(id);
  if (!s.stages[stage]) s.stages[stage] = { correct: 0, answered: 0 };
  s.stages[stage].answered += 1;
  if (correct) { s.stages[stage].correct += 1; s.totalCorrect += 1; }
}
async function tryQuery(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (!tryQuery._warned) {
      console.warn('⚠️  DB 저장 건너뜀(메모리 폴백 사용). .env 의 DB_PASSWORD 확인:', err.code || err.message);
      tryQuery._warned = true;
    }
    return null;
  }
}

/** 프론트로 내려줄 때 정답 관련 필드는 제거한다. */
function sanitizeQuestion(q) {
  const { answer, answerSequence, wrongTypes, ...safe } = q;
  return safe;
}

/** 제출된 답이 정답인지 서버에서 판정 */
function judge(question, payload) {
  if (question.type === 'pick') {
    const selected = String(payload.selectedWord || '');
    return { correct: selected === question.answer, target: question.answer };
  }
  if (question.type === 'sequence') {
    const seq = Array.isArray(payload.selectedSequence) ? payload.selectedSequence : [];
    const ans = question.answerSequence;
    let wrongOrder = 0;
    const len = Math.max(seq.length, ans.length);
    for (let i = 0; i < len; i++) if (seq[i] !== ans[i]) wrongOrder += 1;
    return {
      correct: wrongOrder === 0 && seq.length === ans.length,
      wrongOrderCount: wrongOrder,
      target: ans,
    };
  }
  return { correct: false };
}

/** 3단계에서 아이가 고른 오답의 유사 유형 태깅 */
function computeWrongWordType(question, payload) {
  if (question.stage !== 3 || !question.wrongTypes) return null;
  const sel = payload.selectedWord;
  if (!sel || sel === question.answer) return null;
  return question.wrongTypes[sel] || 'other';
}

// ─────────────────────────── START ───────────────────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);

    // 게임 시작마다 랜덤 문제 생성 → 세션에 저장 (채점은 이 세트 기준)
    const questions = generateQuestions();
    sessionQuestions.set(sessionId, new Map(questions.map((qq) => [qq.id, qq])));

    await tryQuery(
      `INSERT INTO sound_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'sound-match', 'in_progress', :ip, :ua)`,
      { sid: sessionId, ip, ua }
    );
    memSession(sessionId);

    res.json({
      sessionId,
      totalStages: 5,
      questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD,
      totalPassThreshold: TOTAL_PASS_THRESHOLD,
      audioBase: '/assets/audio', // 오디오 파일 경로 (<word>.m4a)
      questions: questions.map(sanitizeQuestion),
    });
  } catch (err) {
    console.error('[start] error:', err.message);
    res.status(500).json({ error: 'start_failed', message: err.message });
  }
});

// ─────────────────────────── ATTEMPT ───────────────────────────
router.post('/attempt', async (req, res) => {
  try {
    const { sessionId, questionId, metrics = {} } = req.body || {};
    if (!sessionId || !questionId) {
      return res.status(400).json({ error: 'bad_request', message: 'sessionId, questionId 필요' });
    }
    const question = getSessionQuestion(sessionId, questionId);
    if (!question) return res.status(404).json({ error: 'question_not_found' });

    const verdict = judge(question, req.body);
    const correct = verdict.correct ? 1 : 0;
    const confusedPair = question.confusedPair ? question.confusedPair.join('|') : null;

    await tryQuery(
      `INSERT INTO sound_attempt (
         session_id, question_id, stage, is_correct,
         target_word, selected_word, selected_image_id, audio_play_count,
         solve_time_ms, time_after_audio_ms, first_select_time_ms, wrong_attempt_count,
         confused_pair, wrong_word_type, hovered_option_json, retry_count,
         max_audio_play_reached, hesitation_time_ms,
         target_sequence_json, selected_sequence_json, sequence_correct,
         first_selected_image, selection_order_json, time_per_selection_json, wrong_order_count,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :target_word, :selected_word, :selected_image_id, :audio_play_count,
         :solve_time_ms, :time_after_audio_ms, :first_select_time_ms, :wrong_attempt_count,
         :confused_pair, :wrong_word_type, :hovered_option_json, :retry_count,
         :max_audio_play_reached, :hesitation_time_ms,
         :target_sequence_json, :selected_sequence_json, :sequence_correct,
         :first_selected_image, :selection_order_json, :time_per_selection_json, :wrong_order_count,
         :metrics_json
       )`,
      {
        session_id: sessionId,
        question_id: questionId,
        stage: question.stage,
        is_correct: correct,
        target_word: question.audioWord || (question.audioSequence ? question.audioSequence.join(',') : null),
        selected_word: req.body.selectedWord ?? null,
        selected_image_id: req.body.selectedImageId ?? null,
        audio_play_count: metrics.audioPlayCount ?? 0,
        solve_time_ms: metrics.solveTimeMs ?? null,
        time_after_audio_ms: metrics.timeAfterAudioMs ?? null,
        first_select_time_ms: metrics.firstSelectTimeMs ?? null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        confused_pair: confusedPair,
        wrong_word_type: computeWrongWordType(question, req.body),
        hovered_option_json: metrics.hoveredOptions ? JSON.stringify(metrics.hoveredOptions) : null,
        retry_count: metrics.retryCount ?? 0,
        max_audio_play_reached: metrics.maxAudioPlayReached ? 1 : 0,
        hesitation_time_ms: metrics.hesitationTimeMs ?? null,
        target_sequence_json: question.answerSequence ? JSON.stringify(question.answerSequence) : null,
        selected_sequence_json: req.body.selectedSequence ? JSON.stringify(req.body.selectedSequence) : null,
        sequence_correct: question.type === 'sequence' ? correct : null,
        first_selected_image: metrics.firstSelectedImage ?? null,
        selection_order_json: metrics.selectionOrder ? JSON.stringify(metrics.selectionOrder) : null,
        time_per_selection_json: metrics.timePerSelection ? JSON.stringify(metrics.timePerSelection) : null,
        wrong_order_count: verdict.wrongOrderCount ?? null,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE sound_session
          SET total_answered = total_answered + 1,
              total_correct  = total_correct + :inc
        WHERE session_id = :sid`,
      { inc: correct, sid: sessionId }
    );
    memRecord(sessionId, question.stage, !!correct);

    res.json({ correct: !!correct, verdict: publicVerdict(verdict) });
  } catch (err) {
    console.error('[attempt] error:', err.message);
    res.status(500).json({ error: 'attempt_failed', message: err.message });
  }
});

function publicVerdict(v) {
  const out = {};
  if (v.wrongOrderCount != null) out.wrongOrderCount = v.wrongOrderCount;
  return out;
}

// ─────────────────────────── VERIFY ───────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });

    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM sound_attempt
        WHERE session_id = :sid
        GROUP BY stage`,
      { sid: sessionId }
    );

    let totalCorrect = 0;
    const stageResults = {};
    if (dbRes && dbRes[0] && dbRes[0].length) {
      for (const r of dbRes[0]) {
        const c = Number(r.correct);
        totalCorrect += c;
        stageResults[r.stage] = { correct: c, answered: Number(r.answered), passed: c >= STAGE_PASS_THRESHOLD };
      }
    } else {
      const s = memSession(sessionId);
      totalCorrect = s.totalCorrect;
      for (const stage of Object.keys(s.stages)) {
        const r = s.stages[stage];
        stageResults[stage] = { correct: r.correct, answered: r.answered, passed: r.correct >= STAGE_PASS_THRESHOLD };
      }
    }

    const passed = totalCorrect >= TOTAL_PASS_THRESHOLD;
    const token = passed ? uuid() : null;

    await tryQuery(
      `UPDATE sound_session
          SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`,
      { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId }
    );

    sessionQuestions.delete(sessionId);
    res.json({ passed, totalCorrect, totalQuestions: 25, stageResults, token });
  } catch (err) {
    console.error('[verify] error:', err.message);
    res.status(500).json({ error: 'verify_failed', message: err.message });
  }
});

// ────────────────────── TOKEN 유효성 확인 ──────────────────────
router.get('/token/:token', async (req, res) => {
  try {
    const dbRes = await tryQuery(
      `SELECT session_id FROM sound_session
        WHERE pass_token = :t AND status = 'passed' LIMIT 1`,
      { t: req.params.token }
    );
    res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
  } catch (err) {
    res.status(500).json({ error: 'token_check_failed' });
  }
});

// ─────────────────────────── HEALTH ───────────────────────────
router.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (err) {
    res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message });
  }
});

module.exports = router;
