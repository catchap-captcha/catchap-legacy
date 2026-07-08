/**
 * Word Category Sort CAPTCHA — API 라우트
 *   POST /api/word-category-sort/start | /attempt | /verify
 *   GET  /api/word-category-sort/token/:token | /health
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const {
  generateQuestions, EMOJI, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, WORD_CORRECT_RATIO,
} = require('../data/questions');

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

/** 정답 매핑(cat)은 제거하고, 단어+이모지만 내려준다. */
function buildClientQuestion(q) {
  return {
    id: q.id, stage: q.stage, order: q.order,
    categories: q.categories,
    words: q.words.map((x) => ({ word: x.word, emoji: EMOJI[x.word] || '❓' })),
    hasDistractor: q.words.some((x) => x.cat === 'none') && q.stage >= 5,
    prompt: q.prompt, hint: q.hint,
  };
}

/**
 * 서버 채점.
 * selectedMap: { word: chosenCategoryId | 'none' }  (상자에 안 넣은 단어는 'none')
 */
function judge(q, selectedMap) {
  const map = selectedMap && typeof selectedMap === 'object' ? selectedMap : {};
  let correct = 0, wrongCategory = 0, distractorSelected = 0, missed = 0;
  const correctWords = [], selectedWords = [], missedWords = [], wrongWords = [], distractorWords = [];

  for (const { word, cat } of q.words) {
    const chosen = map[word] || 'none';
    if (cat === 'none') distractorWords.push(word);
    if (cat !== 'none') correctWords.push(word);
    if (chosen !== 'none') selectedWords.push(word);

    if (chosen === cat) {
      correct += 1;
    } else {
      if (cat === 'none' && chosen !== 'none') { distractorSelected += 1; wrongWords.push(word); }
      else if (cat !== 'none' && chosen === 'none') { missed += 1; missedWords.push(word); }
      else { wrongCategory += 1; wrongWords.push(word); } // 다른 상자에 잘못
    }
  }
  const total = q.words.length;
  const ratio = total ? correct / total : 0;
  const isCorrect = ratio >= WORD_CORRECT_RATIO && distractorSelected === 0; // 방해단어 넣으면 실패
  return {
    isCorrect, correctSortCount: correct, wrongSortCount: total - correct,
    wrongCategoryCount: wrongCategory, distractorSelectedCount: distractorSelected, missedCorrectCount: missed,
    correctWords, selectedWords, missedWords, wrongWords, distractorWords, ratio: +ratio.toFixed(3),
  };
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
      `INSERT INTO sort_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'word-category-sort', 'in_progress', :ip, :ua)`, { sid: sessionId, ip, ua });
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
    const { sessionId, questionId, selectedMap = {}, metrics = {} } = req.body || {};
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request' });
    const q = getSessionQuestion(sessionId, questionId);
    if (!q) return res.status(404).json({ error: 'question_not_found' });

    const v = judge(q, selectedMap);
    const ok = v.isCorrect ? 1 : 0;
    const wordCatMap = {}; q.words.forEach((x) => { wordCatMap[x.word] = x.cat; });

    await tryQuery(
      `INSERT INTO sort_attempt (
         session_id, question_id, stage, is_correct,
         categories_json, target_category, word_category_map_json, selected_category_map_json,
         correct_words_json, selected_words_json, missed_correct_words_json, wrong_selected_words_json, distractor_words_json,
         correct_sort_count, wrong_sort_count, wrong_category_count, distractor_selected_count, missed_correct_count,
         category_switch_count, regrab_count, drag_order_json, selection_order_json, drag_path_json, solve_time_ms,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_correct,
         :categories_json, :target_category, :word_category_map_json, :selected_category_map_json,
         :correct_words_json, :selected_words_json, :missed_correct_words_json, :wrong_selected_words_json, :distractor_words_json,
         :correct_sort_count, :wrong_sort_count, :wrong_category_count, :distractor_selected_count, :missed_correct_count,
         :category_switch_count, :regrab_count, :drag_order_json, :selection_order_json, :drag_path_json, :solve_time_ms,
         :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: q.stage, is_correct: ok,
        categories_json: JSON.stringify(q.categories),
        target_category: q.categories.length === 1 ? q.categories[0].id : null,
        word_category_map_json: JSON.stringify(wordCatMap),
        selected_category_map_json: JSON.stringify(selectedMap),
        correct_words_json: JSON.stringify(v.correctWords),
        selected_words_json: JSON.stringify(v.selectedWords),
        missed_correct_words_json: JSON.stringify(v.missedWords),
        wrong_selected_words_json: JSON.stringify(v.wrongWords),
        distractor_words_json: JSON.stringify(v.distractorWords),
        correct_sort_count: v.correctSortCount, wrong_sort_count: v.wrongSortCount,
        wrong_category_count: v.wrongCategoryCount, distractor_selected_count: v.distractorSelectedCount,
        missed_correct_count: v.missedCorrectCount,
        category_switch_count: metrics.categorySwitchCount ?? null,
        regrab_count: metrics.regrabCount ?? 0,
        drag_order_json: metrics.dragOrder ? JSON.stringify(metrics.dragOrder) : null,
        selection_order_json: metrics.selectionOrder ? JSON.stringify(metrics.selectionOrder) : null,
        drag_path_json: metrics.dragPath ? JSON.stringify(metrics.dragPath) : null,
        solve_time_ms: metrics.solveTimeMs ?? null,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE sort_session SET total_answered = total_answered + 1, total_correct = total_correct + :inc
        WHERE session_id = :sid`, { inc: ok, sid: sessionId });
    memRecord(sessionId, q.stage, !!ok);

    res.json({
      correct: !!ok,
      result: { correctSortCount: v.correctSortCount, wrongCategoryCount: v.wrongCategoryCount,
                distractorSelectedCount: v.distractorSelectedCount, missedCorrectCount: v.missedCorrectCount, ratio: v.ratio },
    });
  } catch (err) { console.error('[attempt]', err.message); res.status(500).json({ error: 'attempt_failed', message: err.message }); }
});

// ─────────────── VERIFY ───────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_correct) AS correct, COUNT(*) AS answered
         FROM sort_attempt WHERE session_id = :sid GROUP BY stage`, { sid: sessionId });

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
      `UPDATE sort_session SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`, { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId });
    sessionQuestions.delete(sessionId);
    res.json({ passed, totalCorrect, totalQuestions: 25, stageResults, token });
  } catch (err) { console.error('[verify]', err.message); res.status(500).json({ error: 'verify_failed', message: err.message }); }
});

router.get('/token/:token', async (req, res) => {
  const dbRes = await tryQuery(`SELECT session_id FROM sort_session WHERE pass_token = :t AND status='passed' LIMIT 1`, { t: req.params.token });
  res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
});
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
