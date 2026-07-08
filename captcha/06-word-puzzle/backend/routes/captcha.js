/**
 * Word Puzzle CAPTCHA — API 라우트
 *   POST /api/word-puzzle/start | /attempt | /verify
 *   GET  /api/word-puzzle/token/:token | /health
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const { generateQuestions, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD } = require('../data/questions');

const router = express.Router();
const uuid = () => crypto.randomUUID();

// ── 세션별 랜덤 문제 저장소 (게임 시작마다 새로 생성) ──
const sessionQuestions = new Map(); // sessionId -> Map(qid -> question)
function getSessionQuestion(sid, qid) {
  const m = sessionQuestions.get(sid);
  return m ? m.get(qid) : null;
}

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

/** 정답 단어는 감추고, 섞인 알파벳 + 칸 수만 내려준다. */
function buildClientQuestion(q) {
  return {
    id: q.id, stage: q.stage, order: q.order,
    letters: q.letters, slots: q.word.length,
    image: q.image, category: q.category,
    prompt: q.prompt, hint: q.hint,
  };
}

/** 정답 단어에서 방해 알파벳(멀티셋 차집합)을 계산 */
function distractorsOf(q) {
  const need = {}; for (const ch of q.word) need[ch] = (need[ch] || 0) + 1;
  const distr = [];
  for (const l of q.letters) { if (need[l] > 0) need[l] -= 1; else distr.push(l); }
  return distr;
}

/** 서버 채점 */
function judge(q, selected) {
  const sel = Array.isArray(selected) ? selected.map((x) => (x == null ? '' : String(x))) : [];
  const target = q.word.split('');
  let wrongOrder = 0;
  for (let i = 0; i < target.length; i++) if ((sel[i] || '').toLowerCase() !== target[i].toLowerCase()) wrongOrder += 1;
  // 방해 알파벳을 몇 개 골라 넣었는지
  const need = {}; for (const ch of q.word) need[ch] = (need[ch] || 0) + 1;
  let distractorSelected = 0;
  for (const l of sel) { const ll = (l || '').toLowerCase(); if (need[ll] > 0) need[ll] -= 1; else if (ll) distractorSelected += 1; }
  const correct = sel.length === target.length && wrongOrder === 0;
  return { correct, wrongOrderCount: wrongOrder, distractorSelectedCount: distractorSelected };
}

// ─────────────── START ───────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);

    // 게임 시작마다 랜덤 문제 생성 → 세션에 저장 (채점은 이 세트 기준)
    const questions = generateQuestions();
    sessionQuestions.set(sessionId, new Map(questions.map((qq) => [qq.id, qq])));
    await tryQuery(
      `INSERT INTO puzzle_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'word-puzzle', 'in_progress', :ip, :ua)`, { sid: sessionId, ip, ua });
    memSession(sessionId);
    res.json({
      sessionId, totalStages: 5, questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD, totalPassThreshold: TOTAL_PASS_THRESHOLD,
      questions: questions.map(buildClientQuestion),
    });
  } catch (err) { console.error('[start]', err.message); res.status(500).json({ error: 'start_failed', message: err.message }); }
});

// ─────────────── ATTEMPT ───────────────
router.post('/attempt', async (req, res) => {
  try {
    const { sessionId, questionId, selectedLetters = [], metrics = {} } = req.body || {};
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request' });
    const q = getSessionQuestion(sessionId, questionId);
    if (!q) return res.status(404).json({ error: 'question_not_found' });

    const v = judge(q, selectedLetters);
    const ok = v.correct ? 1 : 0;
    const distractors = distractorsOf(q);
    const correctLetters = q.word.split('');

    await tryQuery(
      `INSERT INTO puzzle_attempt (
         session_id, question_id, stage, is_correct,
         target_word, target_category, word_length, shuffled_letters_json, selected_letters_json,
         letter_drag_order_json, wrong_order_count, swap_count, regrab_count, retry_count,
         drag_path_json, solve_time_ms, completion_time_ms,
         correct_letters_json, distractor_letters_json, distractor_selected_count, hint_used, metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :target_word, :target_category, :word_length, :shuffled_letters_json, :selected_letters_json,
         :letter_drag_order_json, :wrong_order_count, :swap_count, :regrab_count, :retry_count,
         :drag_path_json, :solve_time_ms, :completion_time_ms,
         :correct_letters_json, :distractor_letters_json, :distractor_selected_count, :hint_used, :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: q.stage, is_correct: ok,
        target_word: q.word, target_category: q.category, word_length: q.word.length,
        shuffled_letters_json: JSON.stringify(q.letters),
        selected_letters_json: JSON.stringify(selectedLetters),
        letter_drag_order_json: metrics.letterDragOrder ? JSON.stringify(metrics.letterDragOrder) : null,
        wrong_order_count: v.wrongOrderCount,
        swap_count: metrics.swapCount ?? 0,
        regrab_count: metrics.regrabCount ?? 0,
        retry_count: metrics.retryCount ?? 0,
        drag_path_json: metrics.dragPath ? JSON.stringify(metrics.dragPath) : null,
        solve_time_ms: metrics.solveTimeMs ?? null,
        completion_time_ms: metrics.completionTimeMs ?? metrics.solveTimeMs ?? null,
        correct_letters_json: JSON.stringify(correctLetters),
        distractor_letters_json: JSON.stringify(distractors),
        distractor_selected_count: v.distractorSelectedCount,
        hint_used: q.stage === 5 ? 1 : null,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE puzzle_session SET total_answered = total_answered + 1, total_correct = total_correct + :inc
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
         FROM puzzle_attempt WHERE session_id = :sid GROUP BY stage`, { sid: sessionId });

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
      `UPDATE puzzle_session SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`, { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId });
    sessionQuestions.delete(sessionId);
    res.json({ passed, totalCorrect, totalQuestions: 25, stageResults, token });
  } catch (err) { console.error('[verify]', err.message); res.status(500).json({ error: 'verify_failed', message: err.message }); }
});

router.get('/token/:token', async (req, res) => {
  const dbRes = await tryQuery(`SELECT session_id FROM puzzle_session WHERE pass_token = :t AND status='passed' LIMIT 1`, { t: req.params.token });
  res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
});
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
