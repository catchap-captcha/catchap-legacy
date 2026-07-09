// src/api/client.ts
// Thin wrapper around the REST API in backend/routes. Relative paths so it
// works same-origin when backend/server.js serves this app's own dist/.
import type { CaptchaProblem, CaptchaResult } from "../components/captcha/types";

export async function fetchProblem(type?: string): Promise<CaptchaProblem> {
  const url = type ? `/api/problem?type=${encodeURIComponent(type)}` : "/api/problem";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET /api/problem failed: ${res.status}`);
  return res.json();
}

export function reportCheck(problemId: string | undefined, type: string, result: CaptchaResult): void {
  if (!problemId) return;
  // Fire-and-forget: the component has already decided correct/retry
  // client-side (see CaptchaHandlers in components/captcha/types.ts), this
  // just lets the server log/track the outcome.
  fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, type, result }),
  }).catch(() => {
    // Best-effort reporting only; a dropped check call shouldn't block play.
  });
}
