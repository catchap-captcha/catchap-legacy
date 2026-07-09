// backend/controllers/problem.controller.js
import { getAvailableTypes, getRandomProblem } from "../data/loadProblems.js";

export function getProblem(req, res) {
  const { type } = req.query;
  if (type && !getAvailableTypes().includes(type)) {
    return res.status(400).json({ error: `unknown type "${type}"`, availableTypes: getAvailableTypes() });
  }
  const problem = getRandomProblem(type);
  if (!problem) return res.status(404).json({ error: "no problems available" });
  res.json(problem);
}

export function getTypes(req, res) {
  res.json({ types: getAvailableTypes() });
}
