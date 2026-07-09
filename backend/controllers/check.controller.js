// backend/controllers/check.controller.js
// The reused captcha components already decide correct/retry client-side
// (see CaptchaHandlers in src/components/captcha/types.ts, and
// CaptchaResult = "correct" | "retry") — this endpoint just lets the caller
// report that outcome to the server so it can be tracked/verified.
import { findProblemById } from "../data/loadProblems.js";

const stats = { correct: 0, retry: 0 };

export function postCheck(req, res) {
  const { problemId, type, result } = req.body ?? {};
  if (result !== "correct" && result !== "retry") {
    return res.status(400).json({ error: 'result must be "correct" or "retry"' });
  }

  stats[result] += 1;
  const problem = problemId ? findProblemById(problemId) : null;

  res.json({
    ok: true,
    problemId: problemId ?? null,
    type: type ?? problem?.type ?? null,
    result,
    stats,
  });
}
