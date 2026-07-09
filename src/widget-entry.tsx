// src/widget-entry.tsx
// Entry point for the standalone embeddable bundle (see vite.widget.config.ts).
// Built separately from the main app — this is the only file that touches
// `window`, so the main SPA build stays untouched.
import { CatChapGuard } from "./widget/mount";

declare global {
  interface Window {
    CatChapGuard: typeof CatChapGuard;
  }
}

window.CatChapGuard = CatChapGuard;
