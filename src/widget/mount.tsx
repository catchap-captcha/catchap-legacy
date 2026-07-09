// src/widget/mount.tsx
// Public embed API. A host page adds a container element and calls
// CatChapGuard.render(container, options) — mirrors the shape of
// reCAPTCHA's grecaptcha.render(container, {sitekey, callback}).
import { createRoot, type Root } from "react-dom/client";
import CatChapGuardWidget from "./CatChapGuardWidget";
import { categories } from "../game/categories";
import type { Difficulty } from "../components/captcha/types";

export interface CatChapGuardOptions {
  // Chapter key, e.g. "fact-opinion", "sentence-order" (see CatChapGuard.categories
  // for the full list). Omit to get a random chapter.
  category?: string;
  difficulty?: Difficulty;
  onSuccess?: () => void;
  onRetry?: () => void;
}

export interface CatChapGuardInstance {
  // Unmounts the widget and removes it from the container.
  destroy: () => void;
  // Swaps in a fresh problem (new random pick) without a full remount.
  reset: () => void;
}

const STYLE_ID = "catchap-guard-styles";

// Injected once per page so a bare <script> embed doesn't need a separate
// stylesheet link — only the handful of classes the captcha components
// actually use (see src/index.css for the full, app-only version).
const WIDGET_CSS = `
.catchap-guard-widget, .catchap-guard-widget * { box-sizing: border-box; }
@keyframes catchap-fade-in-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes catchap-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
.catchap-guard-widget .captcha-fade-in { animation: catchap-fade-in-up 0.35s ease; }
.catchap-guard-widget .captcha-shake { animation: catchap-shake 0.4s ease; }
`;

function ensureStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = WIDGET_CSS;
  document.head.appendChild(style);
}

function resolveContainer(target: string | HTMLElement): HTMLElement {
  const el = typeof target === "string" ? document.getElementById(target) ?? document.querySelector(target) : target;
  if (!el) throw new Error(`CatChapGuard.render: container "${target}" was not found`);
  return el as HTMLElement;
}

function renderInto(root: Root, options: CatChapGuardOptions, instanceKey: number) {
  root.render(<CatChapGuardWidget key={instanceKey} {...options} />);
}

function render(target: string | HTMLElement, options: CatChapGuardOptions = {}): CatChapGuardInstance {
  ensureStylesInjected();
  const container = resolveContainer(target);
  const root = createRoot(container);
  let instanceKey = 0;
  renderInto(root, options, instanceKey);

  return {
    destroy: () => root.unmount(),
    reset: () => {
      instanceKey += 1;
      renderInto(root, options, instanceKey);
    },
  };
}

export const CatChapGuard = {
  render,
  // The chapter keys accepted by options.category, for host sites building
  // their own chapter picker.
  categories: categories.map((c) => ({ key: c.key, label: c.shortTitle, emoji: c.emoji })),
};
