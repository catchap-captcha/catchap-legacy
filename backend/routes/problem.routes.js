// backend/routes/problem.routes.js
import { Router } from "express";
import { getProblem, getTypes } from "../controllers/problem.controller.js";

const router = Router();
router.get("/problem", getProblem);
router.get("/types", getTypes);

export default router;
