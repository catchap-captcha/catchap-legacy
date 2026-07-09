// backend/server.js
// Single Express server: serves the built frontend (dist/, a self-contained
// single-file build — see vite.config.ts) plus public/ (problem JSON data),
// and exposes the REST API other sites can call directly. CORS is left open
// so an external page can embed the widget or verify a solve server-to-server.
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import healthRoutes from "./routes/health.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import checkRoutes from "./routes/check.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4900;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", problemRoutes);
app.use("/api", checkRoutes);

// public/ (problems/*.json) is checked first, then dist/ (the built demo
// page) — both are plain static-file roots, no conflict since public/ has
// no index.html of its own.
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../dist")));

app.listen(PORT, () => {
  console.log(`CatChap 국어 캡차`);
  console.log(`데모 : http://localhost:${PORT}/`);
  console.log(`API  : http://localhost:${PORT}/api/health`);
});
