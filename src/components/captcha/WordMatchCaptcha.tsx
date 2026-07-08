// src/components/captcha/WordMatchCaptcha.tsx
import PairMatchCaptcha from "./PairMatchCaptcha";
import type { WordMatchProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: WordMatchProblem;
}

export default function WordMatchCaptcha({ problem, onSuccess, onRetry }: Props) {
  const tag = problem.relation === "synonym" ? "비슷한말" : "반대말";
  return (
    <PairMatchCaptcha
      promptTag={tag}
      instruction={`${tag}끼리 선으로 이어요.`}
      pairs={problem.pairs.map((p) => ({ left: p.word, right: p.partner }))}
      onSuccess={onSuccess}
      onRetry={onRetry}
    />
  );
}
