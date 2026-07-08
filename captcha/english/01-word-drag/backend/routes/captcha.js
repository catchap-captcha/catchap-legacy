/**
 * Word Drag CAPTCHA — API 라우트
 * ---------------------------------------------------------------
 *  POST  /api/word-drag/start            새 세션 시작 → 문제 25개(정답 제거) 반환
 *  POST  /api/word-drag/attempt          문제 1개 제출 → 정답 여부 + 행동데이터 저장
 *  POST  /api/word-drag/verify           세션 종료 → 통과/실패 판정 + 토큰 발급
 *  GET   /api/word-drag/token/:token     발급된 토큰 유효성 확인(서버 간 검증용)
 *  GET   /api/word-drag/health           헬스체크
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
 * (.env 에 DB_PASSWORD 를 넣으면 자동으로 DB 에 영구 저장됨)
 */
const mem = new Map(); // sessionId -> { stages: {stage:{correct,answered}}, totalCorrect }
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
/** DB 쿼리를 시도하되 실패해도 요청을 죽이지 않는다. 실패 시 null 반환. */
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
  const { answer, answers, wrongTypes, ...safe } = q;
  return safe;
}

/** 제출된 답이 정답인지 서버에서 판정 (프론트를 믿지 않음) */
function judge(question, payload) {
  if (question.type === 'single') {
    const selected = String(payload.selectedWord || '');
    return { correct: selected === question.answer, target: question.answer };
  }
  if (question.type === 'multi') {
    const map = payload.matches || {}; // { slot: word }
    let correctMatches = 0;
    const slots = Object.keys(question.answers);
    for (const slot of slots) {
      if (map[slot] === question.answers[slot]) correctMatches += 1;
    }
    return {
      correct: correctMatches === slots.length,
      correctMatchCount: correctMatches,
      wrongMatchCount: slots.length - correctMatches,
      matchCount: Object.keys(map).length,
    };
  }
  if (question.type === 'category') {
    const selected = Array.isArray(payload.selectedWords) ? payload.selectedWords : [];
    const answerSet = new Set(question.answers);
    const selectedSet = new Set(selected);
    let wrongCat = 0;
    let missed = 0;
    for (const w of selectedSet) if (!answerSet.has(w)) wrongCat += 1;
    for (const w of answerSet) if (!selectedSet.has(w)) missed += 1;
    const total = answerSet.size + wrongCat; // 정답 수 + 잘못 넣은 수
    const score = total === 0 ? 1 : Math.max(0, (answerSet.size - missed - wrongCat) / answerSet.size);
    return {
      correct: wrongCat === 0 && missed === 0,
      wrongCategoryCount: wrongCat,
      missedCorrectCount: missed,
      categoryUnderstandingScore: Number(score.toFixed(3)),
      correctWords: question.answers,
    };
  }
  return { correct: false };
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
      `INSERT INTO captcha_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'word-drag', 'in_progress', :ip, :ua)`,
      { sid: sessionId, ip, ua }
    );
    memSession(sessionId);

    res.json({
      sessionId,
      totalStages: 5,
      questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD,
      totalPassThreshold: TOTAL_PASS_THRESHOLD,
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

    // 5단계 유형별로 값이 다를 수 있으므로 안전하게 뽑아 저장.
    await tryQuery(
      `INSERT INTO captcha_attempt (
         session_id, question_id, stage, is_correct,
         solve_time_ms, drag_start_time, drag_end_time, drag_distance, hover_time_ms, drag_path_json,
         selected_word, target_word, first_selected_word, wrong_attempt_count, regrab_count,
         hovered_words_json, wrong_word_type,
         match_count, correct_match_count, wrong_match_count, drag_order_json,
         first_target_selected, time_per_match_json, retry_count,
         selected_words_json, correct_words_json, wrong_category_count, missed_correct_count,
         selection_order_json, category_understanding_score, metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :solve_time_ms, :drag_start_time, :drag_end_time, :drag_distance, :hover_time_ms, :drag_path_json,
         :selected_word, :target_word, :first_selected_word, :wrong_attempt_count, :regrab_count,
         :hovered_words_json, :wrong_word_type,
         :match_count, :correct_match_count, :wrong_match_count, :drag_order_json,
         :first_target_selected, :time_per_match_json, :retry_count,
         :selected_words_json, :correct_words_json, :wrong_category_count, :missed_correct_count,
         :selection_order_json, :category_understanding_score, :metrics_json
       )`,
      {
        session_id: sessionId,
        question_id: questionId,
        stage: question.stage,
        is_correct: correct,
        solve_time_ms: metrics.solveTimeMs ?? null,
        drag_start_time: metrics.dragStartTime ?? null,
        drag_end_time: metrics.dragEndTime ?? null,
        drag_distance: metrics.dragDistance ?? null,
        hover_time_ms: metrics.hoverTimeMs ?? null,
        drag_path_json: metrics.dragPath ? JSON.stringify(metrics.dragPath) : null,
        selected_word: req.body.selectedWord ?? null,
        target_word: verdict.target ?? null,
        first_selected_word: metrics.firstSelectedWord ?? null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        regrab_count: metrics.regrabCount ?? 0,
        hovered_words_json: metrics.hoveredWords ? JSON.stringify(metrics.hoveredWords) : null,
        wrong_word_type: computeWrongWordType(question, req.body) ?? null,
        match_count: verdict.matchCount ?? null,
        correct_match_count: verdict.correctMatchCount ?? null,
        wrong_match_count: verdict.wrongMatchCount ?? null,
        drag_order_json: metrics.dragOrder ? JSON.stringify(metrics.dragOrder) : null,
        first_target_selected: metrics.firstTargetSelected ?? null,
        time_per_match_json: metrics.timePerMatch ? JSON.stringify(metrics.timePerMatch) : null,
        retry_count: metrics.retryCount ?? 0,
        selected_words_json: req.body.selectedWords ? JSON.stringify(req.body.selectedWords) : null,
        correct_words_json: verdict.correctWords ? JSON.stringify(verdict.correctWords) : null,
        wrong_category_count: verdict.wrongCategoryCount ?? null,
        missed_correct_count: verdict.missedCorrectCount ?? null,
        selection_order_json: metrics.selectionOrder ? JSON.stringify(metrics.selectionOrder) : null,
        category_understanding_score: verdict.categoryUnderstandingScore ?? null,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    // 세션 카운터 갱신 (DB + 메모리 폴백)
    await tryQuery(
      `UPDATE captcha_session
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

/** 3단계에서 아이가 고른 오답이 어떤 유사 유형이었는지 태깅 */
function computeWrongWordType(question, payload) {
  if (question.stage !== 3 || !question.wrongTypes) return null;
  const sel = payload.selectedWord;
  if (!sel || sel === question.answer) return null;
  return question.wrongTypes[sel] || 'other';
}

/** 정답 단어를 노출하지 않고 통계성 정보만 클라이언트로 전달 */
function publicVerdict(v) {
  const out = {};
  if (v.correctMatchCount != null) out.correctMatchCount = v.correctMatchCount;
  if (v.wrongMatchCount != null) out.wrongMatchCount = v.wrongMatchCount;
  if (v.wrongCategoryCount != null) out.wrongCategoryCount = v.wrongCategoryCount;
  if (v.missedCorrectCount != null) out.missedCorrectCount = v.missedCorrectCount;
  if (v.categoryUnderstandingScore != null) out.categoryUnderstandingScore = v.categoryUnderstandingScore;
  return out;
}

// ─────────────────────────── VERIFY ───────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });

    // 세션의 실제 정답 수 + 단계별 통과 여부를 DB 기준으로 재계산.
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM captcha_attempt
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
      // DB 폴백: 메모리 집계 사용
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
      `UPDATE captcha_session
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
    const [rows] = await pool.query(
      `SELECT session_id, status, finished_at FROM captcha_session
        WHERE pass_token = :t AND status = 'passed' LIMIT 1`,
      { t: req.params.token }
    );
    res.json({ valid: rows.length > 0 });
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
    res.status(503).json({ ok: false, db: 'down', message: err.message });
  }
});

module.exports = router;
