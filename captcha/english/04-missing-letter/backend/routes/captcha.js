/**
 * Missing Letter CAPTCHA — API 라우트
 *   POST /api/missing-letter/start | /attempt | /verify
 *   GET  /api/missing-letter/token/:token | /health
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

/** 정답을 감추고, 빈칸 마스크(masked)만 내려준다. */
function buildClientQuestion(q) {
  const masked = q.word.split('').map((ch, i) => (q.blanks.includes(i) ? null : ch));
  return {
    id: q.id, stage: q.stage, order: q.order,
    length: q.word.length, masked, blanks: q.blanks,
    options: q.options, image: q.image, category: q.category,
    prompt: q.prompt, hint: q.hint,
  };
}

/** 서버 채점: 빈칸에 넣은 글자들이 정답 단어와 일치하는지 */
function judge(q, selectedLetters) {
  const sel = Array.isArray(selectedLetters) ? selectedLetters : [];
  const targets = q.blanks.map((i) => q.word[i]);
  let wrongOrder = 0;
  for (let i = 0; i < targets.length; i++) if ((sel[i] || '').toLowerCase() !== targets[i].toLowerCase()) wrongOrder += 1;
  return { correct: wrongOrder === 0 && sel.length === targets.length, targets, wrongOrderCount: wrongOrder };
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
      `INSERT INTO missing_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'missing-letter', 'in_progress', :ip, :ua)`, { sid: sessionId, ip, ua });
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

    const verdict = judge(q, selectedLetters);
    const ok = verdict.correct ? 1 : 0;
    const single = q.blanks.length === 1;
    const selLetter = single ? (selectedLetters[0] ?? null) : null;

    // 3단계 오답 유형
    let confused = null;
    if (q.stage === 3 && q.wrongTypes && selLetter && selLetter !== q.word[q.blanks[0]]) {
      confused = q.wrongTypes[selLetter] || 'other';
    }

    await tryQuery(
      `INSERT INTO missing_attempt (
         session_id, question_id, stage, is_correct,
         target_word, target_category, solve_time_ms, first_select_time_ms, hesitation_time_ms,
         wrong_attempt_count, retry_count, hovered_letters_json, wrong_letters_json,
         blank_position, target_letter, selected_letter, confused_letter_type, category_hint_used,
         blank_positions_json, target_letters_json, selected_letters_json, letter_order_json, wrong_order_count,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :target_word, :target_category, :solve_time_ms, :first_select_time_ms, :hesitation_time_ms,
         :wrong_attempt_count, :retry_count, :hovered_letters_json, :wrong_letters_json,
         :blank_position, :target_letter, :selected_letter, :confused_letter_type, :category_hint_used,
         :blank_positions_json, :target_letters_json, :selected_letters_json, :letter_order_json, :wrong_order_count,
         :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: q.stage, is_correct: ok,
        target_word: q.word, target_category: q.category,
        solve_time_ms: metrics.solveTimeMs ?? null,
        first_select_time_ms: metrics.firstSelectTimeMs ?? null,
        hesitation_time_ms: metrics.hesitationTimeMs ?? null,
        wrong_attempt_count: metrics.wrongAttemptCount ?? 0,
        retry_count: metrics.retryCount ?? 0,
        hovered_letters_json: metrics.hoveredLetters ? JSON.stringify(metrics.hoveredLetters) : null,
        wrong_letters_json: metrics.wrongLetters ? JSON.stringify(metrics.wrongLetters) : null,
        blank_position: single ? q.blanks[0] : null,
        target_letter: single ? q.word[q.blanks[0]] : null,
        selected_letter: selLetter,
        confused_letter_type: confused,
        category_hint_used: q.stage === 5 ? 1 : null,
        blank_positions_json: JSON.stringify(q.blanks),
        target_letters_json: JSON.stringify(verdict.targets),
        selected_letters_json: JSON.stringify(selectedLetters),
        letter_order_json: metrics.letterOrder ? JSON.stringify(metrics.letterOrder) : null,
        wrong_order_count: verdict.wrongOrderCount,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE missing_session SET total_answered = total_answered + 1, total_correct = total_correct + :inc
        WHERE session_id = :sid`, { inc: ok, sid: sessionId });
    memRecord(sessionId, q.stage, !!ok);

    res.json({ correct: !!ok });
  } catch (err) { console.error('[attempt]', err.message); res.status(500).json({ error: 'attempt_failed', message: err.message }); }
});

// ─────────────── VERIFY ───────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM missing_attempt WHERE session_id = :sid GROUP BY stage`, { sid: sessionId });

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
      `UPDATE missing_session SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`, { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId });
    sessionQuestions.delete(sessionId);
    res.json({ passed, totalCorrect, totalQuestions: 25, stageResults, token });
  } catch (err) { console.error('[verify]', err.message); res.status(500).json({ error: 'verify_failed', message: err.message }); }
});

router.get('/token/:token', async (req, res) => {
  const dbRes = await tryQuery(`SELECT session_id FROM missing_session WHERE pass_token = :t AND status='passed' LIMIT 1`, { t: req.params.token });
  res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
});
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
