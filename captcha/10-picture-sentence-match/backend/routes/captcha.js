/**
 * Picture Sentence Match CAPTCHA — API 라우트
 *   POST /api/picture-sentence-match/start | /attempt | /verify
 *   GET  /api/picture-sentence-match/token/:token | /health
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionById } = require('../data/questions');

const router = express.Router();
const uuid = () => crypto.randomUUID();

// ── DB 폴백 ──
const mem = new Map();
function memSession(id) { if (!mem.has(id)) mem.set(id, { stages: {}, totalCorrect: 0 }); return mem.get(id); }
function memRecord(id, stage, ok) {
  const s = memSession(id);
  if (!s.stages[stage]) s.stages[stage] = { correct: 0, answered: 0 };
  s.stages[stage].answered += 1; if (ok) { s.stages[stage].correct += 1; s.totalCorrect += 1; }
}
async function tryQuery(sql, params) {
  try { return await pool.query(sql, params); }
  catch (err) {
    if (!tryQuery._warned) { console.warn('⚠️  DB 저장 건너뜀(메모리 폴백):', err.code || err.message); tryQuery._warned = true; }
    return null;
  }
}

/** 정답(answer/answers)은 감춘다. */
function buildClientQuestion(q) {
  const { answer, answers, ...safe } = q;
  return safe;
}

/** 서버 채점 */
function judge(q, payload) {
  if (q.type === 'pick') {
    const sel = String(payload.selectedSentenceId || '');
    const selText = (q.sentences.find((s) => s.id === sel) || {}).text || null;
    return { correct: sel === q.answer, selectedText: selText, targetText: (q.sentences.find((s) => s.id === q.answer) || {}).text };
  }
  if (q.type === 'connect') {
    const map = payload.selectedMap && typeof payload.selectedMap === 'object' ? payload.selectedMap : {};
    let correctMatch = 0;
    const itemIds = Object.keys(q.answers);
    for (const it of itemIds) if (map[it] === q.answers[it]) correctMatch += 1;
    return {
      correct: correctMatch === itemIds.length,
      correctMatchCount: correctMatch,
      wrongMatchCount: itemIds.length - correctMatch,
    };
  }
  return { correct: false };
}

// ─────────────── START ───────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);
    await tryQuery(
      `INSERT INTO picmatch_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'picture-sentence-match', 'in_progress', :ip, :ua)`, { sid: sessionId, ip, ua });
    memSession(sessionId);
    res.json({
      sessionId, totalStages: 5, questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD, totalPassThreshold: TOTAL_PASS_THRESHOLD,
      questions: QUESTIONS.map(buildClientQuestion),
    });
  } catch (err) { console.error('[start]', err.message); res.status(500).json({ error: 'start_failed', message: err.message }); }
});

// ─────────────── ATTEMPT ───────────────
router.post('/attempt', async (req, res) => {
  try {
    const { sessionId, questionId, metrics = {} } = req.body || {};
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request' });
    const q = getQuestionById(questionId);
    if (!q) return res.status(404).json({ error: 'question_not_found' });

    const v = judge(q, req.body);
    const ok = v.correct ? 1 : 0;
    const targetMap = q.type === 'connect' ? q.answers : null;

    await tryQuery(
      `INSERT INTO picmatch_attempt (
         session_id, question_id, stage, is_correct,
         image_id, target_sentence, selected_sentence, sentence_type,
         target_map_json, selected_map_json, correct_match_count, wrong_match_count, connection_path_json,
         wrong_attempt_count, hovered_options_json, first_select_time_ms, solve_time_ms, retry_count, metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :image_id, :target_sentence, :selected_sentence, :sentence_type,
         :target_map_json, :selected_map_json, :correct_match_count, :wrong_match_count, :connection_path_json,
         :wrong_attempt_count, :hovered_options_json, :first_select_time_ms, :solve_time_ms, :retry_count, :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: q.stage, is_correct: ok,
        image_id: q.image || null,
        target_sentence: v.targetText ?? null,
        selected_sentence: v.selectedText ?? null,
        sentence_type: q.sentenceType || null,
        target_map_json: targetMap ? JSON.stringify(targetMap) : null,
        selected_map_json: req.body.selectedMap ? JSON.stringify(req.body.selectedMap) : null,
        correct_match_count: v.correctMatchCount ?? null,
        wrong_match_count: v.wrongMatchCount ?? null,
        connection_path_json: metrics.connectionPath ? JSON.stringify(metrics.connectionPath) : null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        hovered_options_json: metrics.hoveredOptions ? JSON.stringify(metrics.hoveredOptions) : null,
        first_select_time_ms: metrics.firstSelectTimeMs ?? null,
        solve_time_ms: metrics.solveTimeMs ?? null,
        retry_count: metrics.retryCount ?? 0,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE picmatch_session SET total_answered = total_answered + 1, total_correct = total_correct + :inc
        WHERE session_id = :sid`, { inc: ok, sid: sessionId });
    memRecord(sessionId, q.stage, !!ok);

    const out = { correct: !!ok };
    if (v.correctMatchCount != null) out.result = { correctMatchCount: v.correctMatchCount, wrongMatchCount: v.wrongMatchCount };
    res.json(out);
  } catch (err) { console.error('[attempt]', err.message); res.status(500).json({ error: 'attempt_failed', message: err.message }); }
});

// ─────────────── VERIFY ───────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM picmatch_attempt WHERE session_id = :sid GROUP BY stage`, { sid: sessionId });

    let totalCorrect = 0; const stageResults = {};
    if (dbRes && dbRes[0] && dbRes[0].length) {
      for (const r of dbRes[0]) { const c = Number(r.correct); totalCorrect += c;
        stageResults[r.stage] = { correct: c, answered: Number(r.answered), passed: c >= STAGE_PASS_THRESHOLD }; }
    } else {
      const s = memSession(sessionId); totalCorrect = s.totalCorrect;
      for (const st of Object.keys(s.stages)) { const r = s.stages[st];
        stageResults[st] = { correct: r.correct, answered: r.answered, passed: r.correct >= STAGE_PASS_THRESHOLD }; }
    }
    const passed = totalCorrect >= TOTAL_PASS_THRESHOLD;
    const token = passed ? uuid() : null;
    await tryQuery(
      `UPDATE picmatch_session SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`, { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId });
    res.json({ passed, totalCorrect, totalQuestions: QUESTIONS.length, stageResults, token });
  } catch (err) { console.error('[verify]', err.message); res.status(500).json({ error: 'verify_failed', message: err.message }); }
});

router.get('/token/:token', async (req, res) => {
  const dbRes = await tryQuery(`SELECT session_id FROM picmatch_session WHERE pass_token = :t AND status='passed' LIMIT 1`, { t: req.params.token });
  res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
});
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
