/**
 * Flag Puzzle CAPTCHA — API 라우트 (세계 국기 이미지 퍼즐)
 * ---------------------------------------------------------------
 *  POST  /start / /attempt / /verify , GET /token/:token , /health
 *
 *  유형: 'puzzle' — 실제 국기 이미지를 격자로 자른 조각을 퍼즐판에 배치.
 *  answers = { slotId: pieceId } 는 서버에만 있고, 채점도 서버에서 한다.
 *  방해 조각(다른 나라 국기 크롭) 선택 여부까지 행동 데이터로 수집.
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const {
  generateQuestionSet,
  TOTAL_QUESTIONS,
  STAGE_PASS_THRESHOLD,
  TOTAL_PASS_THRESHOLD,
} = require('../data/questions');

// ── 캡챠별 설정 ──
const CONFIG = {
  captchaType: 'flag-puzzle',
  tableSession: 'flag_session',
  tableAttempt: 'flag_attempt',
};

const router = express.Router();
const uuid = () => crypto.randomUUID();

/**
 * ★ 세션별 랜덤 문제 저장소
 * /start 마다 generateQuestionSet() 으로 국가·방해조각이 랜덤인 25문제를
 * 새로 만들어 여기 보관한다. 정답(answers)이 세션마다 다르므로
 * 채점은 반드시 이 저장소의 문제로 한다. (오래된 세션은 자동 정리)
 */
const sessionQuestions = new Map(); // sessionId -> Question[]
const SESSION_CAP = 500;
function storeQuestions(sessionId, questions) {
  if (sessionQuestions.size >= SESSION_CAP) {
    const oldest = sessionQuestions.keys().next().value;
    sessionQuestions.delete(oldest);
  }
  sessionQuestions.set(sessionId, questions);
}
function getSessionQuestion(sessionId, questionId) {
  const list = sessionQuestions.get(sessionId);
  if (!list) return null;
  return list.find((q) => q.id === questionId) || null;
}

/** DB 폴백(in-memory) */
const mem = new Map();
function memSession(id) { if (!mem.has(id)) mem.set(id, { stages: {}, totalCorrect: 0 }); return mem.get(id); }
function memRecord(id, stage, correct) {
  const s = memSession(id);
  if (!s.stages[stage]) s.stages[stage] = { correct: 0, answered: 0 };
  s.stages[stage].answered += 1;
  if (correct) { s.stages[stage].correct += 1; s.totalCorrect += 1; }
}
async function tryQuery(sql, params) {
  try { return await pool.query(sql, params); }
  catch (err) {
    if (!tryQuery._warned) { console.warn('⚠️  DB 저장 건너뜀(메모리 폴백). .env 의 DB_PASSWORD 확인:', err.code || err.message); tryQuery._warned = true; }
    return null;
  }
}

/** 프론트로 내려줄 때 정답(answers)과 동치 그룹 정보는 제거한다. */
function sanitizeQuestion(q) {
  const { answers, equivalentGroups, ...safe } = q;
  return safe;
}

/** 퍼즐 채점 (서버 전용)
 *  equivalentGroups: 시각적으로 똑같아 구분이 불가능한 조각 묶음.
 *  (예: 중국 국기의 빨간 단색 3조각, 삼색기의 같은 색 조각)
 *  같은 그룹 조각은 어느 칸에 넣어도 정답으로 인정한다. 단, 한 조각을
 *  여러 칸에 중복 제출하는 것은 부정으로 보고 오답 처리한다.
 */
function judge(question, payload) {
  const placements = payload.placements && typeof payload.placements === 'object' ? payload.placements : {};
  const ans = question.answers;                 // { slotId: pieceId }
  const slots = Object.keys(ans);

  // 조각 id → 동치 그룹 키 (그룹이 없으면 자기 자신)
  const groupOf = {};
  (question.equivalentGroups || []).forEach((group, i) => {
    group.forEach((p) => { groupOf[p] = 'g' + i; });
  });
  const keyOf = (pieceId) => groupOf[pieceId] || pieceId;

  let wrongPlacement = 0;
  let missed = 0;
  for (const s of slots) {
    if (!placements[s]) missed += 1;
    else if (keyOf(String(placements[s])) !== keyOf(ans[s])) wrongPlacement += 1;
  }

  // 방해 조각: 정답에 쓰이는 어떤 그룹에도 속하지 않는 조각을 놓은 경우
  const answerKeys = new Set(Object.values(ans).map(keyOf));
  let distractorSelected = 0;
  for (const pieceId of Object.values(placements)) {
    if (!answerKeys.has(keyOf(String(pieceId)))) distractorSelected += 1;
  }

  // 같은 조각을 여러 칸에 중복 사용하면 부정 제출
  const placedIds = Object.values(placements).map(String);
  const hasDuplicate = new Set(placedIds).size !== placedIds.length;

  const filled = Object.keys(placements).length;
  const completionRate = slots.length ? Number(((slots.length - missed - wrongPlacement) / slots.length).toFixed(3)) : 0;

  return {
    correct: !hasDuplicate && wrongPlacement === 0 && missed === 0 && distractorSelected === 0 && filled === slots.length,
    wrongPlacementCount: wrongPlacement,
    missedPieceCount: missed,
    distractorSelectedCount: distractorSelected,
    completionRate,
    target: ans,
  };
}

/** 정답은 숨기고 통계성 정보만 전달 */
function publicVerdict(v) {
  return {
    wrongPlacementCount: v.wrongPlacementCount,
    missedPieceCount: v.missedPieceCount,
    distractorSelectedCount: v.distractorSelectedCount,
    completionRate: v.completionRate,
  };
}

// ─────────────────────────── START ───────────────────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);

    // ★ 매 세션 랜덤 생성: 국가 구성·순서·방해조각·빈칸 위치가 판마다 다르다.
    const questions = generateQuestionSet();
    storeQuestions(sessionId, questions);

    await tryQuery(
      `INSERT INTO ${CONFIG.tableSession} (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, :ctype, 'in_progress', :ip, :ua)`,
      { sid: sessionId, ctype: CONFIG.captchaType, ip, ua }
    );
    memSession(sessionId);

    const payload = {
      sessionId, captchaType: CONFIG.captchaType, totalStages: 5, questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD, totalPassThreshold: TOTAL_PASS_THRESHOLD,
      questions: questions.map(sanitizeQuestion),
    };
    // 개발/테스트 전용: CAPTCHA_DEBUG=1 일 때만 정답을 함께 반환 (운영에선 절대 켜지 말 것)
    if (process.env.CAPTCHA_DEBUG === '1') {
      payload.debugAnswers = questions.map((q) => ({ id: q.id, answers: q.answers, equivalentGroups: q.equivalentGroups || null }));
    }
    res.json(payload);
  } catch (err) {
    console.error('[start] error:', err.message);
    res.status(500).json({ error: 'start_failed', message: err.message });
  }
});

// ─────────────────────────── ATTEMPT ───────────────────────────
router.post('/attempt', async (req, res) => {
  try {
    const { sessionId, questionId, metrics = {} } = req.body || {};
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request', message: 'sessionId, questionId 필요' });
    // ★ 문제·정답은 세션별 랜덤 생성본에서 찾는다 (서버 재시작 시 세션 만료)
    if (!sessionQuestions.has(sessionId)) {
      return res.status(410).json({ error: 'session_expired', message: '세션이 만료됐어요. 새로 시작해 주세요.' });
    }
    const question = getSessionQuestion(sessionId, questionId);
    if (!question) return res.status(404).json({ error: 'question_not_found' });

    const verdict = judge(question, req.body);
    const correct = verdict.correct ? 1 : 0;

    await tryQuery(
      `INSERT INTO ${CONFIG.tableAttempt} (
         session_id, question_id, stage, question_type, is_correct,
         target_country_code, target_country_name_ko, piece_count,
         solve_time_ms, first_select_time_ms, hesitation_time_ms, wrong_attempt_count,
         drag_distance, drag_path_json, regrab_count, swap_count, selection_order_json,
         placements_json, target_placements_json,
         wrong_placement_count, missed_piece_count, distractor_selected_count, completion_rate,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :question_type, :is_correct,
         :target_country_code, :target_country_name_ko, :piece_count,
         :solve_time_ms, :first_select_time_ms, :hesitation_time_ms, :wrong_attempt_count,
         :drag_distance, :drag_path_json, :regrab_count, :swap_count, :selection_order_json,
         :placements_json, :target_placements_json,
         :wrong_placement_count, :missed_piece_count, :distractor_selected_count, :completion_rate,
         :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: question.stage,
        question_type: question.type, is_correct: correct,
        target_country_code: question.countryCode ?? null,
        target_country_name_ko: question.countryLabel ?? null,
        piece_count: question.pieces ? question.pieces.length : null,
        solve_time_ms: metrics.solveTimeMs ?? null,
        first_select_time_ms: metrics.firstSelectTimeMs ?? null,
        hesitation_time_ms: metrics.hesitationTimeMs ?? null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        drag_distance: metrics.dragDistance ?? null,
        drag_path_json: metrics.dragPath ? JSON.stringify(metrics.dragPath) : null,
        regrab_count: metrics.regrabCount ?? 0,
        swap_count: metrics.swapCount ?? 0,
        selection_order_json: metrics.selectionOrder ? JSON.stringify(metrics.selectionOrder) : null,
        placements_json: req.body.placements ? JSON.stringify(req.body.placements) : null,
        target_placements_json: JSON.stringify(verdict.target),
        wrong_placement_count: verdict.wrongPlacementCount,
        missed_piece_count: verdict.missedPieceCount,
        distractor_selected_count: verdict.distractorSelectedCount,
        completion_rate: verdict.completionRate,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE ${CONFIG.tableSession} SET total_answered = total_answered + 1, total_correct = total_correct + :inc WHERE session_id = :sid`,
      { inc: correct, sid: sessionId }
    );
    memRecord(sessionId, question.stage, !!correct);
    res.json({ correct: !!correct, verdict: publicVerdict(verdict) });
  } catch (err) {
    console.error('[attempt] error:', err.message);
    res.status(500).json({ error: 'attempt_failed', message: err.message });
  }
});

// ─────────────────────────── VERIFY ───────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM ${CONFIG.tableAttempt} WHERE session_id = :sid GROUP BY stage`,
      { sid: sessionId }
    );
    let totalCorrect = 0; const stageResults = {};
    if (dbRes && dbRes[0] && dbRes[0].length) {
      for (const r of dbRes[0]) {
        const c = Number(r.correct); totalCorrect += c;
        stageResults[r.stage] = { correct: c, answered: Number(r.answered), passed: c >= STAGE_PASS_THRESHOLD };
      }
    } else {
      const s = memSession(sessionId); totalCorrect = s.totalCorrect;
      for (const stage of Object.keys(s.stages)) {
        const r = s.stages[stage];
        stageResults[stage] = { correct: r.correct, answered: r.answered, passed: r.correct >= STAGE_PASS_THRESHOLD };
      }
    }
    const passed = totalCorrect >= TOTAL_PASS_THRESHOLD;
    const token = passed ? uuid() : null;
    await tryQuery(
      `UPDATE ${CONFIG.tableSession} SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW() WHERE session_id = :sid`,
      { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId }
    );
    res.json({ passed, totalCorrect, totalQuestions: TOTAL_QUESTIONS, stageResults, token });
  } catch (err) {
    console.error('[verify] error:', err.message);
    res.status(500).json({ error: 'verify_failed', message: err.message });
  }
});

// ────────────────────── TOKEN 유효성 확인 ──────────────────────
router.get('/token/:token', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT session_id, status, finished_at FROM ${CONFIG.tableSession} WHERE pass_token = :t AND status = 'passed' LIMIT 1`,
      { t: req.params.token }
    );
    res.json({ valid: rows.length > 0 });
  } catch (err) { res.status(500).json({ error: 'token_check_failed' }); }
});

// ─────────────────────────── HEALTH ───────────────────────────
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(503).json({ ok: false, db: 'down', message: err.message }); }
});

module.exports = router;
