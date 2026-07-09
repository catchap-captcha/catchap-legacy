// backend/routes/check.routes.js
import { Router } from "express";
import { postCheck } from "../controllers/check.controller.js";

const router = Router();
router.post("/check", postCheck);

export default router;
