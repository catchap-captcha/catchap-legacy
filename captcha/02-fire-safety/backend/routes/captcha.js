/**
 * 생활안전 캡챠 — API 라우트 (화재안전)
 * ---------------------------------------------------------------
 *  POST  /start          새 세션 시작 → 문제 25개(정답 제거) 반환
 *  POST  /attempt        문제 1개 제출 → 서버 채점 + 행동데이터 저장
 *  POST  /verify         세션 종료 → 통과/실패 판정 + 토큰 발급
 *  GET   /token/:token   발급된 토큰 유효성 확인(서버 간 검증용)
 *  GET   /health         헬스체크
 *
 *  ⚙️ 이 파일에서 캡챠별로 다른 값은 아래 CONFIG 뿐이다. (3종 공통 엔진)
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const {
  QUESTIONS,
  STAGE_PASS_THRESHOLD,
  TOTAL_PASS_THRESHOLD,
  getQuestionById,
} = require('../data/questions');

// ── 캡챠별 설정 (여기만 캡챠마다 다름) ──
const CONFIG = {
  captchaType: 'fire-safety',
  tableSession: 'fire_session',
  tableAttempt: 'fire_attempt',
};

const router = express.Router();
const uuid = () => crypto.randomUUID();

/** DB 폴백(in-memory): MySQL 미설정 시에도 데모/채점이 동작하도록. */
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
  const { answer, answers, correctSequence, ...safe } = q;
  return safe;
}

/** 제출된 답이 정답인지 서버에서 판정 (프론트를 믿지 않음) */
function judge(question, payload) {
  if (question.type === 'single') {
    const selected = String(payload.selectedOption || '');
    return { correct: selected === question.answer, target: question.answer };
  }
  if (question.type === 'order') {
    const seq = Array.isArray(payload.sequence) ? payload.sequence.map(String) : [];
    const target = question.correctSequence;
    let wrongOrder = 0;
    for (let i = 0; i < target.length; i++) if (seq[i] !== target[i]) wrongOrder += 1;
    return {
      correct: wrongOrder === 0 && seq.length === target.length,
      wrongOrderCount: wrongOrder,
      target,
    };
  }
  if (question.type === 'connect') {
    const pairs = payload.pairs && typeof payload.pairs === 'object' ? payload.pairs : {};
    const ans = question.answers;
    let correctPairs = 0;
    const keys = Object.keys(ans);
    for (const k of keys) if (pairs[k] === ans[k]) correctPairs += 1;
    return {
      correct: correctPairs === keys.length,
      correctConnectionCount: correctPairs,
      wrongConnectionCount: keys.length - correctPairs,
      target: ans,
    };
  }
  return { correct: false };
}

/** 정답을 노출하지 않고 통계성 정보만 클라이언트로 전달 */
function publicVerdict(v) {
  const out = {};
  if (v.wrongOrderCount != null) out.wrongOrderCount = v.wrongOrderCount;
  if (v.correctConnectionCount != null) out.correctConnectionCount = v.correctConnectionCount;
  if (v.wrongConnectionCount != null) out.wrongConnectionCount = v.wrongConnectionCount;
  return out;
}

// ─────────────────────────── START ───────────────────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);

    await tryQuery(
      `INSERT INTO ${CONFIG.tableSession} (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, :ctype, 'in_progress', :ip, :ua)`,
      { sid: sessionId, ctype: CONFIG.captchaType, ip, ua }
    );
    memSession(sessionId);

    res.json({
      sessionId,
      captchaType: CONFIG.captchaType,
      totalStages: 5,
      questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD,
      totalPassThreshold: TOTAL_PASS_THRESHOLD,
      questions: QUESTIONS.map(sanitizeQuestion),
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
    const question = getQuestionById(questionId);
    if (!question) return res.status(404).json({ error: 'question_not_found' });

    const verdict = judge(question, req.body);
    const correct = verdict.correct ? 1 : 0;

    await tryQuery(
      `INSERT INTO ${CONFIG.tableAttempt} (
         session_id, question_id, stage, question_type, is_correct,
         solve_time_ms, first_select_time_ms, hesitation_time_ms, wrong_attempt_count,
         selected_action, target_action,
         selected_sequence_json, target_sequence_json, wrong_order_count, regrab_count,
         selected_pairs_json, target_pairs_json, wrong_connection_count, reconnect_count,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :question_type, :is_correct,
         :solve_time_ms, :first_select_time_ms, :hesitation_time_ms, :wrong_attempt_count,
         :selected_action, :target_action,
         :selected_sequence_json, :target_sequence_json, :wrong_order_count, :regrab_count,
         :selected_pairs_json, :target_pairs_json, :wrong_connection_count, :reconnect_count,
         :metrics_json
       )`,
      {
        session_id: sessionId,
        question_id: questionId,
        stage: question.stage,
        question_type: question.type,
        is_correct: correct,
        solve_time_ms: metrics.solveTimeMs ?? null,
        first_select_time_ms: metrics.firstSelectTimeMs ?? null,
        hesitation_time_ms: metrics.hesitationTimeMs ?? null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        selected_action: req.body.selectedOption ?? null,
        target_action: verdict.target && typeof verdict.target === 'string' ? verdict.target : null,
        selected_sequence_json: req.body.sequence ? JSON.stringify(req.body.sequence) : null,
        target_sequence_json: question.type === 'order' ? JSON.stringify(verdict.target) : null,
        wrong_order_count: verdict.wrongOrderCount ?? null,
        regrab_count: metrics.regrabCount ?? 0,
        selected_pairs_json: req.body.pairs ? JSON.stringify(req.body.pairs) : null,
        target_pairs_json: question.type === 'connect' ? JSON.stringify(verdict.target) : null,
        wrong_connection_count: verdict.wrongConnectionCount ?? null,
        reconnect_count: metrics.reconnectCount ?? 0,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE ${CONFIG.tableSession}
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

// ─────────────────────────── VERIFY ───────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });

    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM ${CONFIG.tableAttempt}
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
      `UPDATE ${CONFIG.tableSession}
          SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`,
      { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId }
    );

    res.json({ passed, totalCorrect, totalQuestions: QUESTIONS.length, stageResults, token });
  } catch (err) {
    console.error('[verify] error:', err.message);
    res.status(500).json({ error: 'verify_failed', message: err.message });
  }
});

// ────────────────────── TOKEN 유효성 확인 ──────────────────────
router.get('/token/:token', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT session_id, status, finished_at FROM ${CONFIG.tableSession}
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
