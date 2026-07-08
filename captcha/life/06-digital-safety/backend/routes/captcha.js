/**
 * 생활안전 캡챠 — 통합 API 라우트 (모든 조작 유형 지원)
 * ---------------------------------------------------------------
 *  POST  /start / /attempt / /verify , GET /token/:token , /health
 *
 *  지원 유형: single / connect / pick / sort / touch / place / route
 *  ⚙️ 캡챠별로 다른 값은 아래 CONFIG 뿐이다. (06~10 공통 엔진)
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
  captchaType: 'digital-safety',
  tableSession: 'digital_session',
  tableAttempt: 'digital_attempt',
};

const router = express.Router();
const uuid = () => crypto.randomUUID();

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

/** 프론트로 내려줄 때 정답 관련 필드 제거 (place 의 answer=안전존 id, touch 의 answers 등) */
function sanitizeQuestion(q) {
  const { answer, answers, correctSequence, ...safe } = q;
  return safe;
}

const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

/** 서버 채점 (프론트를 믿지 않음) */
function judge(question, payload) {
  switch (question.type) {
    case 'single': {
      const sel = String(payload.selectedOption || '');
      return { correct: sel === question.answer, target: question.answer };
    }
    case 'connect': {
      const pairs = payload.pairs && typeof payload.pairs === 'object' ? payload.pairs : {};
      const ans = question.answers; const keys = Object.keys(ans);
      let ok = 0;
      for (const k of keys) if (pairs[k] === ans[k]) ok += 1;
      return { correct: ok === keys.length, correctConnectionCount: ok, wrongConnectionCount: keys.length - ok, target: ans };
    }
    case 'pick':
    case 'touch': {
      const arr = question.type === 'pick' ? payload.picked : payload.touched;
      const picked = Array.isArray(arr) ? arr.map(String) : [];
      const ans = new Set(question.answers); const ps = new Set(picked);
      let wrong = 0, missed = 0;
      for (const p of ps) if (!ans.has(p)) wrong += 1;
      for (const a of ans) if (!ps.has(a)) missed += 1;
      return { correct: wrong === 0 && missed === 0, wrongSelectedCount: wrong, missedCount: missed, target: question.answers };
    }
    case 'sort': {
      const bins = payload.bins && typeof payload.bins === 'object' ? payload.bins : {};
      const ans = question.answers; const keys = Object.keys(ans);
      let wrong = 0;
      for (const k of keys) if (bins[k] !== ans[k]) wrong += 1;
      return { correct: wrong === 0 && Object.keys(bins).length === keys.length, wrongSortCount: wrong, target: ans };
    }
    case 'place': {
      const dz = String(payload.droppedZone || '');
      return { correct: dz === question.answer, targetZone: question.answer, droppedZone: dz };
    }
    case 'route': {
      const path = Array.isArray(payload.route) ? payload.route : [];
      let danger = 0;
      for (const p of path) for (const z of (question.dangerZones || [])) if (inRect(p, z)) { danger += 1; break; }
      const last = path[path.length - 1];
      const reached = last ? inRect(last, question.dest) : false;
      return { correct: reached && danger === 0, reachedDest: reached, dangerTouchedCount: danger };
    }
    default: return { correct: false };
  }
}

/** 정답 비노출, 통계성 정보만 전달 */
function publicVerdict(v) {
  const out = {};
  ['correctConnectionCount', 'wrongConnectionCount', 'wrongSelectedCount', 'missedCount',
   'wrongSortCount', 'reachedDest', 'dangerTouchedCount'].forEach((k) => { if (v[k] != null) out[k] = v[k]; });
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
      sessionId, captchaType: CONFIG.captchaType, totalStages: 5, questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD, totalPassThreshold: TOTAL_PASS_THRESHOLD,
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
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request', message: 'sessionId, questionId 필요' });
    const question = getQuestionById(questionId);
    if (!question) return res.status(404).json({ error: 'question_not_found' });

    const verdict = judge(question, req.body);
    const correct = verdict.correct ? 1 : 0;

    // 선택/드래그 결과를 유형에 맞는 컬럼에 저장 (없으면 null)
    const pickedArr = question.type === 'touch' ? req.body.touched : req.body.picked;

    await tryQuery(
      `INSERT INTO ${CONFIG.tableAttempt} (
         session_id, question_id, stage, question_type, is_correct,
         solve_time_ms, first_select_time_ms, hesitation_time_ms, wrong_attempt_count,
         drag_distance, drag_path_json, regrab_count, reconnect_count, selection_order_json,
         selected_option, target_option,
         selected_pairs_json, target_pairs_json, wrong_connection_count,
         selected_items_json, target_items_json, wrong_selected_count, missed_count,
         selected_bins_json, target_bins_json, wrong_sort_count,
         dropped_zone, target_zone,
         reached_dest, danger_touched_count, route_path_json,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :question_type, :is_correct,
         :solve_time_ms, :first_select_time_ms, :hesitation_time_ms, :wrong_attempt_count,
         :drag_distance, :drag_path_json, :regrab_count, :reconnect_count, :selection_order_json,
         :selected_option, :target_option,
         :selected_pairs_json, :target_pairs_json, :wrong_connection_count,
         :selected_items_json, :target_items_json, :wrong_selected_count, :missed_count,
         :selected_bins_json, :target_bins_json, :wrong_sort_count,
         :dropped_zone, :target_zone,
         :reached_dest, :danger_touched_count, :route_path_json,
         :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: question.stage,
        question_type: question.type, is_correct: correct,
        solve_time_ms: metrics.solveTimeMs ?? null,
        first_select_time_ms: metrics.firstSelectTimeMs ?? null,
        hesitation_time_ms: metrics.hesitationTimeMs ?? null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        drag_distance: metrics.dragDistance ?? null,
        drag_path_json: metrics.dragPath ? JSON.stringify(metrics.dragPath) : null,
        regrab_count: metrics.regrabCount ?? 0,
        reconnect_count: metrics.reconnectCount ?? 0,
        selection_order_json: metrics.selectionOrder ? JSON.stringify(metrics.selectionOrder) : null,
        selected_option: req.body.selectedOption ?? null,
        target_option: question.type === 'single' ? (verdict.target ?? null) : null,
        selected_pairs_json: req.body.pairs ? JSON.stringify(req.body.pairs) : null,
        target_pairs_json: question.type === 'connect' ? JSON.stringify(verdict.target) : null,
        wrong_connection_count: verdict.wrongConnectionCount ?? null,
        selected_items_json: pickedArr ? JSON.stringify(pickedArr) : null,
        target_items_json: (question.type === 'pick' || question.type === 'touch') ? JSON.stringify(verdict.target) : null,
        wrong_selected_count: verdict.wrongSelectedCount ?? null,
        missed_count: verdict.missedCount ?? null,
        selected_bins_json: req.body.bins ? JSON.stringify(req.body.bins) : null,
        target_bins_json: question.type === 'sort' ? JSON.stringify(verdict.target) : null,
        wrong_sort_count: verdict.wrongSortCount ?? null,
        dropped_zone: verdict.droppedZone ?? null,
        target_zone: question.type === 'place' ? (verdict.targetZone ?? null) : null,
        reached_dest: verdict.reachedDest == null ? null : (verdict.reachedDest ? 1 : 0),
        danger_touched_count: verdict.dangerTouchedCount ?? null,
        route_path_json: req.body.route ? JSON.stringify(req.body.route) : null,
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
