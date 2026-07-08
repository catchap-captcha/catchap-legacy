/**
 * Alphabet Trace CAPTCHA — API 라우트
 * ---------------------------------------------------------------
 *  POST  /api/alphabet-trace/start          새 세션 시작 → 문제 25개(가이드 포함) 반환
 *  POST  /api/alphabet-trace/attempt        그리기 제출 → 서버 채점 + 과정데이터 저장
 *  POST  /api/alphabet-trace/verify         세션 종료 → 통과/실패 판정 + 토큰 발급
 *  GET   /api/alphabet-trace/token/:token   발급 토큰 유효성 확인
 *  GET   /api/alphabet-trace/health         헬스체크
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/pool');
const {
  QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionById,
} = require('../data/questions');
const { getStrokes, getBox } = require('../data/letters');
const { scoreDrawing } = require('../data/letters');

const router = express.Router();
const uuid = () => crypto.randomUUID();

// ── DB 폴백(in-memory) ──
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
    if (!tryQuery._warned) {
      console.warn('⚠️  DB 저장 건너뜀(메모리 폴백 사용). .env 의 DB_PASSWORD 확인:', err.code || err.message);
      tryQuery._warned = true;
    }
    return null;
  }
}

/** 프론트 렌더링에 필요한 정보(가이드 좌표 포함)를 붙여 내려준다.
 *  따라쓰기 가이드는 화면에 어차피 보이는 정보라 유출 이슈 없음. */
function buildClientQuestion(q) {
  const strokes = getStrokes(q.letter);
  const guideIdxs = q.guideStrokes || strokes.map((_, i) => i);
  return {
    id: q.id, stage: q.stage, order: q.order, letter: q.letter,
    box: getBox(q.letter), guideStyle: q.guideStyle,
    prompt: q.prompt, hint: q.hint, showExample: q.showExample,
    strokes,                 // 전체 획 좌표 (예시/완성 렌더용)
    guideStrokes: guideIdxs, // 가이드로 표시할 획
  };
}

// ─────────────────────────── START ───────────────────────────
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuid();
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
    const ua = (req.headers['user-agent'] || '').toString().slice(0, 512);

    await tryQuery(
      `INSERT INTO trace_session (session_id, captcha_type, status, ip_address, user_agent)
       VALUES (:sid, 'alphabet-trace', 'in_progress', :ip, :ua)`,
      { sid: sessionId, ip, ua }
    );
    memSession(sessionId);

    res.json({
      sessionId,
      totalStages: 5,
      questionsPerStage: 5,
      stagePassThreshold: STAGE_PASS_THRESHOLD,
      totalPassThreshold: TOTAL_PASS_THRESHOLD,
      questions: QUESTIONS.map(buildClientQuestion),
    });
  } catch (err) {
    console.error('[start] error:', err.message);
    res.status(500).json({ error: 'start_failed', message: err.message });
  }
});

// ─────────────────────────── ATTEMPT ───────────────────────────
router.post('/attempt', async (req, res) => {
  try {
    const { sessionId, questionId, path = [], strokes = [], metrics = {} } = req.body || {};
    if (!sessionId || !questionId) {
      return res.status(400).json({ error: 'bad_request', message: 'sessionId, questionId 필요' });
    }
    const question = getQuestionById(questionId);
    if (!question) return res.status(404).json({ error: 'question_not_found' });

    // 서버에서 형태 채점 (채점 대상 획은 scoreStrokes, 없으면 전체)
    const score = scoreDrawing(question.letter, question.scoreStrokes, path, {
      strokeCount: metrics.strokeCount ?? (Array.isArray(strokes) ? strokes.length : null),
    });
    const passed = score.isPassed ? 1 : 0;

    const providedPartType = question.stage === 4
      ? `strokes:${(question.guideStrokes || []).join(',')}` : null;
    const letterRecognitionScore = question.stage === 5 ? score.shapeSimilarityScore : null;

    await tryQuery(
      `INSERT INTO trace_attempt (
         session_id, question_id, stage, target_letter, is_passed,
         trace_path_json, stroke_order_json, stroke_count, start_position, end_position,
         drawing_time_ms, pause_count, pause_duration_ms, retry_count,
         completion_rate, guide_deviation, off_path_ratio, shape_similarity_score,
         direction_accuracy, correct_start_point,
         provided_part_type, wrong_direction_count, letter_recognition_score, metrics_json
       ) VALUES (
         :session_id, :question_id, :stage, :target_letter, :is_passed,
         :trace_path_json, :stroke_order_json, :stroke_count, :start_position, :end_position,
         :drawing_time_ms, :pause_count, :pause_duration_ms, :retry_count,
         :completion_rate, :guide_deviation, :off_path_ratio, :shape_similarity_score,
         :direction_accuracy, :correct_start_point,
         :provided_part_type, :wrong_direction_count, :letter_recognition_score, :metrics_json
       )`,
      {
        session_id: sessionId,
        question_id: questionId,
        stage: question.stage,
        target_letter: question.letter,
        is_passed: passed,
        trace_path_json: JSON.stringify(path || []),
        stroke_order_json: JSON.stringify(strokes || []),
        stroke_count: score.strokeCount ?? null,
        start_position: score.startPosition ? JSON.stringify(score.startPosition) : null,
        end_position: score.endPosition ? JSON.stringify(score.endPosition) : null,
        drawing_time_ms: metrics.drawingTimeMs ?? null,
        pause_count: metrics.pauseCount ?? null,
        pause_duration_ms: metrics.pauseDurationMs ?? null,
        retry_count: metrics.retryCount ?? 0,
        completion_rate: score.completionRate ?? null,
        guide_deviation: score.guideDeviation ?? null,
        off_path_ratio: score.offPathRatio ?? null,
        shape_similarity_score: score.shapeSimilarityScore ?? null,
        direction_accuracy: score.directionAccuracy ?? null,
        correct_start_point: score.correctStartPoint == null ? null : (score.correctStartPoint ? 1 : 0),
        provided_part_type: providedPartType,
        wrong_direction_count: metrics.wrongDirectionCount ?? null,
        letter_recognition_score: letterRecognitionScore,
        metrics_json: JSON.stringify(metrics || {}),
      }
    );

    await tryQuery(
      `UPDATE trace_session
          SET total_answered = total_answered + 1, total_correct = total_correct + :inc
        WHERE session_id = :sid`,
      { inc: passed, sid: sessionId }
    );
    memRecord(sessionId, question.stage, !!passed);

    // 아이에게 피드백용 점수만 전달 (형태 유사도/완성도)
    res.json({
      passed: !!passed,
      score: {
        completionRate: score.completionRate,
        shapeSimilarityScore: score.shapeSimilarityScore,
        guideDeviation: score.guideDeviation,
      },
    });
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
      `SELECT stage, SUM(is_passed) AS correct, COUNT(*) AS answered
         FROM trace_attempt WHERE session_id = :sid GROUP BY stage`,
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
      `UPDATE trace_session
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
    const dbRes = await tryQuery(
      `SELECT session_id FROM trace_session WHERE pass_token = :t AND status = 'passed' LIMIT 1`,
      { t: req.params.token }
    );
    res.json({ valid: !!(dbRes && dbRes[0] && dbRes[0].length) });
  } catch (err) {
    res.status(500).json({ error: 'token_check_failed' });
  }
});

// ─────────────────────────── HEALTH ───────────────────────────
router.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'up' }); }
  catch (err) { res.status(200).json({ ok: true, db: 'down (memory fallback)', message: err.code || err.message }); }
});

module.exports = router;
