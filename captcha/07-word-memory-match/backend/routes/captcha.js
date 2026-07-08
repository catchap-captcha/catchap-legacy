/**
 * Word Memory Match CAPTCHA — API 라우트
 *   POST /api/word-memory-match/start   세션 시작 → 문제(카드 board, 짝 비노출) 반환
 *   POST /api/word-memory-match/match   카드 2장 짝 판정 (서버 권위) → {match}
 *   POST /api/word-memory-match/attempt 문제 종료 → 통과 판정 + 행동데이터 저장
 *   POST /api/word-memory-match/verify  세션 종료 → 통과/실패 + 토큰
 *   GET  /api/word-memory-match/token/:token | /health
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

// ── DB 폴백(세션 집계) ──
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

// ── 문제별 진행 상태 (카드 짝 판정은 서버가 관리) ──
const progress = new Map(); // `${sid}:${qid}` -> { matched:Set, wrongPairCount, opened:{} }
function progKey(sid, qid) { return sid + ':' + qid; }
function getProgress(sid, qid) {
  const k = progKey(sid, qid);
  if (!progress.has(k)) progress.set(k, { matched: new Set(), wrongPairCount: 0, opened: {} });
  return progress.get(k);
}

/** 짝 정보(key) 를 감추고 카드 board 만 내려준다. */
function buildClientQuestion(q) {
  return {
    id: q.id, stage: q.stage, order: q.order,
    pairCount: q.pairs.length,
    timeLimitMs: q.timeLimitMs || null,
    board: q.board.map((c) => ({ id: c.id, type: c.type, value: c.value })), // key 제거
    prompt: promptFor(q.stage), hint: hintFor(q.stage),
  };
}
function promptFor(stage) {
  return ({
    1: '그림과 맞는 영어 단어 카드를 찾아보세요.',
    2: '그림 카드와 영어 단어 카드를 짝지어보세요.',
    3: '카드를 뒤집어 그림과 영어 단어의 짝을 찾아보세요.',
    4: '비슷한 단어를 잘 보고 알맞은 짝을 찾아보세요.',
    5: '시간 안에 그림과 영어 단어의 짝을 모두 찾아보세요.',
  })[stage] || '그림과 영어 단어의 짝을 찾아보세요.';
}
function hintFor(stage) {
  return ({
    1: '카드를 눌러 뒤집어요.',
    2: '카드 2장을 열어 같은 뜻이면 짝!',
    3: '어디에 무엇이 있었는지 기억해요.',
    4: '철자가 비슷한 단어를 조심해요.',
    5: '시간이 가기 전에 서둘러요! ⏰',
  })[stage] || '';
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
      `INSERT INTO memory_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'word-memory-match', 'in_progress', :ip, :ua)`, { sid: sessionId, ip, ua });
    memSession(sessionId);
    res.json({
      sessionId, totalStages: 5, questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD, totalPassThreshold: TOTAL_PASS_THRESHOLD,
      questions: questions.map(buildClientQuestion),
    });
  } catch (err) { console.error('[start]', err.message); res.status(500).json({ error: 'start_failed', message: err.message }); }
});

// ─────────────── MATCH (서버 권위 짝 판정) ───────────────
router.post('/match', (req, res) => {
  try {
    const { sessionId, questionId, cardA, cardB } = req.body || {};
    const q = getSessionQuestion(sessionId, questionId);
    if (!sessionId || !q) return res.status(400).json({ error: 'bad_request' });
    const a = q.board.find((c) => c.id === cardA);
    const b = q.board.find((c) => c.id === cardB);
    if (!a || !b || a.id === b.id) return res.status(400).json({ error: 'invalid_cards' });

    const prog = getProgress(sessionId, questionId);
    prog.opened[a.id] = (prog.opened[a.id] || 0) + 1;
    prog.opened[b.id] = (prog.opened[b.id] || 0) + 1;

    const isMatch = a.key === b.key && a.type !== b.type;
    if (isMatch) prog.matched.add(a.key);
    else prog.wrongPairCount += 1;

    res.json({
      match: isMatch,
      key: isMatch ? a.key : null,
      matchedCount: prog.matched.size,
      pairCount: q.pairs.length,
      complete: prog.matched.size === q.pairs.length,
    });
  } catch (err) { console.error('[match]', err.message); res.status(500).json({ error: 'match_failed', message: err.message }); }
});

// ─────────────── ATTEMPT (문제 종료) ───────────────
router.post('/attempt', async (req, res) => {
  try {
    const { sessionId, questionId, metrics = {} } = req.body || {};
    if (!sessionId || !questionId) return res.status(400).json({ error: 'bad_request' });
    const q = getSessionQuestion(sessionId, questionId);
    if (!q) return res.status(404).json({ error: 'question_not_found' });

    const prog = getProgress(sessionId, questionId);
    const pairCount = q.pairs.length;
    const matchedCount = prog.matched.size;
    const ok = matchedCount === pairCount ? 1 : 0;

    await tryQuery(
      `INSERT INTO memory_attempt (
         session_id, question_id, stage, is_passed,
         target_pairs_json, pair_count, matched_pairs_json, matched_count, wrong_pair_count,
         confused_pair_json, similar_word_pairs_json,
         card_open_order_json, opened_cards_json, card_open_count, reopen_count, memory_attempt_count,
         first_open_time_ms, first_match_time_ms, hesitation_time_ms, solve_time_ms, time_limit_ms, remaining_time_ms,
         metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :is_passed,
         :target_pairs_json, :pair_count, :matched_pairs_json, :matched_count, :wrong_pair_count,
         :confused_pair_json, :similar_word_pairs_json,
         :card_open_order_json, :opened_cards_json, :card_open_count, :reopen_count, :memory_attempt_count,
         :first_open_time_ms, :first_match_time_ms, :hesitation_time_ms, :solve_time_ms, :time_limit_ms, :remaining_time_ms,
         :metrics_json
       )`,
      {
        session_id: sessionId, question_id: questionId, stage: q.stage, is_passed: ok,
        target_pairs_json: JSON.stringify(q.pairs.map((p) => p.key)),
        pair_count: pairCount,
        matched_pairs_json: JSON.stringify([...prog.matched]),
        matched_count: matchedCount,
        wrong_pair_count: prog.wrongPairCount,
        confused_pair_json: metrics.confusedPairs ? JSON.stringify(metrics.confusedPairs) : (q.similarPairs ? JSON.stringify(q.similarPairs) : null),
        similar_word_pairs_json: q.similarPairs ? JSON.stringify(q.similarPairs) : null,
        card_open_order_json: metrics.cardOpenOrder ? JSON.stringify(metrics.cardOpenOrder) : null,
        opened_cards_json: JSON.stringify(prog.opened),
        card_open_count: metrics.cardOpenCount ?? Object.values(prog.opened).reduce((a, b) => a + b, 0),
        reopen_count: metrics.reopenCount ?? 0,
        memory_attempt_count: metrics.memoryAttemptCount ?? (matchedCount + prog.wrongPairCount),
        first_open_time_ms: metrics.firstOpenTimeMs ?? null,
        first_match_time_ms: metrics.firstMatchTimeMs ?? null,
        hesitation_time_ms: metrics.hesitationTimeMs ?? null,
        solve_time_ms: metrics.solveTimeMs ?? null,
        time_limit_ms: q.timeLimitMs || null,
        remaining_time_ms: metrics.remainingTimeMs ?? null,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE memory_session SET total_answered = total_answered + 1, total_correct = total_correct + :inc
        WHERE session_id = :sid`, { inc: ok, sid: sessionId });
    memRecord(sessionId, q.stage, !!ok);
    progress.delete(progKey(sessionId, questionId));

    res.json({ correct: !!ok, matchedCount, pairCount, wrongPairCount: prog.wrongPairCount });
  } catch (err) { console.error('[attempt]', err.message); res.status(500).json({ error: 'attempt_failed', message: err.message }); }
});

// ─────────────── VERIFY ───────────────
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'bad_request' });
    const dbRes = await tryQuery(
      `SELECT stage, SUM(is_passed) AS correct, COUNT(*) AS answered
         FROM memory_attempt WHERE session_id = :sid GROUP BY stage`, { sid: sessionId });

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
      `UPDATE memory_session SET status = :status, pass_token = :token, total_correct = :tc, finished_at = NOW()
        WHERE session_id = :sid`, { status: passed ? 'passed' : 'failed', token, tc: totalCorrect, sid: sessionId });
    sessionQuestions.delete(sessionId);
    res.json({ passed, totalCorrect, totalQuestions: 25, stageResults, token });
  } catch (err) { console.error('[verify]', err.message); res.status(500).json({ error: 'verify_failed', message: err.message }); }
});

router.get('/token/:token', async (req, res) => {
  const dbRes = await tryQuery(`SELECT session_id FROM memory_session WHERE pass_token = :t AND status='passed' LIMIT 1`, { t: req.params.token });
  res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
});
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
