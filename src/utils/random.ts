// src/utils/random.ts
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Reshuffles until the order actually differs from the input (unless arr.length < 2,
// where no permutation can differ). Prevents short arrays from occasionally
// shuffling back to the original, unsolved-looking order.
export function shuffleDistinct<T>(arr: T[]): T[] {
  if (arr.length < 2) return [...arr];
  let result = shuffle(arr);
  while (result.every((v, i) => v === arr[i])) {
    result = shuffle(arr);
  }
  return result;
}

const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

// Lays out the entire pool in one pass: every "easy" item (shuffled among
// themselves) first, then every "medium", then every "hard" — so a session
// that plays straight through always gets strictly harder, never repeats,
// and never skips anything. Items missing a difficulty tag are shuffled in
// at the end.
export function orderByDifficulty<T extends { difficulty?: string }>(pool: T[]): T[] {
  const tiers: T[][] = DIFFICULTY_ORDER.map(() => []);
  const untiered: T[] = [];

  for (const item of pool) {
    const tierIndex = DIFFICULTY_ORDER.indexOf(item.difficulty ?? "");
    if (tierIndex === -1) untiered.push(item);
    else tiers[tierIndex].push(item);
  }

  return [...tiers.flatMap((tier) => shuffle(tier)), ...shuffle(untiered)];
}
