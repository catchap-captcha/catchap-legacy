// backend/data/loadProblems.js
// Loads public/problems/*.json (snapshotted from capcha_service's
// problemPools.ts by scripts/generate-problems.mjs) into memory once at
// startup — this is the API's entire "database" for GET /api/problem.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROBLEMS_DIR = path.join(__dirname, "../../public/problems");

const byType = new Map();
let all = [];

for (const file of readdirSync(PROBLEMS_DIR)) {
  if (file === "all.json" || !file.endsWith(".json")) continue;
  const type = file.replace(/\.json$/, "");
  const problems = JSON.parse(readFileSync(path.join(PROBLEMS_DIR, file), "utf8"));
  byType.set(type, problems);
  all = all.concat(problems);
}

export function getAvailableTypes() {
  return [...byType.keys()];
}

export function getRandomProblem(type) {
  const pool = type ? byType.get(type) : all;
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function findProblemById(id) {
  return all.find((p) => p.id === id) ?? null;
}
