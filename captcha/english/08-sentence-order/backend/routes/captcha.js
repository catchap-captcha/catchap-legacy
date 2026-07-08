/**
 * Sentence Order CAPTCHA — API 라우트
 *   POST /api/sentence-order/start | /attempt | /verify
 *   GET  /api/sentence-order/token/:token | /health
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

/** 정답 문장은 감추고, 섞인 카드 + 칸 수만 내려준다. */
function buildClientQuestion(q) {
  return {
    id: q.id, stage: q.stage, order: q.order,
    cards: q.cards, slots: q.sentence.split(' ').length,
    image: q.image, meaning: q.meaning,
    prompt: q.prompt, hint: q.hint,
  };
}

/** 방해 단어(멀티셋 차집합) 계산 */
function distractorsOf(q) {
  const need = {}; for (const w of q.sentence.split(' ')) need[w] = (need[w] || 0) + 1;
  const distr = [];
  for (const c of q.cards) { if (need[c] > 0) need[c] -= 1; else distr.push(c); }
  return distr;
}

/** 서버 채점: 단어 순서가 정답 문장과 일치하는지 */
function judge(q, selected) {
  const sel = Array.isArray(selected) ? selected.map((x) => (x == null ? '' : String(x))) : [];
  const target = q.sentence.split(' ');
  let wrongOrder = 0;
  for (let i = 0; i < target.length; i++) if ((sel[i] || '') !== target[i]) wrongOrder += 1;
  const need = {}; for (const w of target) need[w] = (need[w] || 0) + 1;
  let distractorSelected = 0;
  for (const w of sel) { if (!w) continue; if (need[w] > 0) need[w] -= 1; else distractorSelected += 1; }
  return {
    correct: sel.length === target.length && wrongOrder === 0,
    wrongOrderCount: wrongOrder, distractorSelectedCount: distractorSelected,
  };
}

// ─────────────── START ───────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);
    await tryQuery(
      `INSERT INTO sentence_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'sentence-order', 'in_progress', :ip, :ua)`, { sid: sessionId, ip, ua });
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
    const { sessionId, questionId, selectedWords = [], metrics = {} } = req.body || {};
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request' });
    const q = getQuestionById(questionId);
    if (!q) return res.status(404).json({ error: 'question_not_found' });

    const v = judge(q, selectedWords);
    const ok = v.correct ? 1 : 0;

    await tryQuery(
      `INSERT INTO sentence_attempt (
         session_id, question_id, stage, is_correct,
         target_sentence, word_count, shuffled_cards_json, selected_word_order_json,
         wrong_order_count, distractor_words_json, distractor_selected_count,
         drag_order_json, drag_path_json, swap_count, regrab_count, retry_count, solve_time_ms, metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :target_sentence, :word_count, :shuffled_cards_json, :selected_word_order_json,
         :wrong_order_count, :distractor_words_json, :distractor_selected_count,
         :drag_order_json, :drag_path_json, :swap_count, :regrab_count, :retry_count, :solve_time_ms, :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: q.stage, is_correct: ok,
        target_sentence: q.sentence, word_count: q.sentence.split(' ').length,
        shuffled_cards_json: JSON.stringify(q.cards),
        selected_word_order_json: JSON.stringify(selectedWords),
        wrong_order_count: v.wrongOrderCount,
        distractor_words_json: JSON.stringify(distractorsOf(q)),
        distractor_selected_count: v.distractorSelectedCount,
        drag_order_json: metrics.dragOrder ? JSON.stringify(metrics.dragOrder) : null,
        drag_path_json: metrics.dragPath ? JSON.stringify(metrics.dragPath) : null,
        swap_count: metrics.swapCount ?? 0,
        regrab_count: metrics.regrabCount ?? 0,
        retry_count: metrics.retryCount ?? 0,
        solve_time_ms: metrics.solveTimeMs ?? null,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE sentence_session SET total_answered = total_answered + 1, total_correct = total_correct + :inc
        WHERE session_id = :sid`, { inc: ok, sid: sessionId });
    memRecord(sessionId, q.stage, !!ok);

    res.json({ correct: !!ok, result: { wrongOrderCount: v.wrongOrderCount, distractorSelectedCount: v.distractorSelectedCount } });
  } catch (err) { console.error('[attempt]', err.message); res.status(500).json({ error: 'attempt_failed', message: err.message }); }
});

// ─────────────── VERIFY ───────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM sentence_attempt WHERE session_id = :sid GROUP BY stage`, { sid: sessionId });

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
      `UPDATE sentence_session SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`, { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId });
    res.json({ passed, totalCorrect, totalQuestions: QUESTIONS.length, stageResults, token });
  } catch (err) { console.error('[verify]', err.message); res.status(500).json({ error: 'verify_failed', message: err.message }); }
});

router.get('/token/:token', async (req, res) => {
  const dbRes = await tryQuery(`SELECT session_id FROM sentence_session WHERE pass_token = :t AND status='passed' LIMIT 1`, { t: req.params.token });
  res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
});
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
