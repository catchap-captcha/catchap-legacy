/* ============================================================================
 *  CatChap · Alphabet Trace CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *  사용법:
 *    <link rel="stylesheet" href="widget/catchap-alphabet-trace.css">
 *    <script src="widget/catchap-alphabet-trace.js"></script>
 *    <script>
 *      CatChapAlphabetTrace.mount('#captcha-mount', {
 *        apiBase: '/api/alphabet-trace',
 *        onProgress: (info)=>{}, onPass: (r)=>{}, onFail: (r)=>{},
 *      });
 *    </script>
 *
 *  캔버스에 손/마우스로 획을 그리면 정규화(0~100) 좌표로 수집해 서버가 채점.
 * ========================================================================== */
(function (global) {
  'use strict';

  const now = () => Date.now();
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  // 캔버스 기하
  const CW = 300, CH = 340, PAD = 34;
  const nx2px = (nx) => PAD + (nx / 100) * (CW - 2 * PAD);
  const ny2px = (ny) => PAD + (ny / 100) * (CH - 2 * PAD);
  const px2nx = (px) => ((px - PAD) / (CW - 2 * PAD)) * 100;
  const px2ny = (py) => ((py - PAD) / (CH - 2 * PAD)) * 100;

  function setupCanvas(canvas, w, h) {
    const dpr = Math.min(global.devicePixelRatio || 1, 3);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    return ctx;
  }

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/alphabet-trace', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };

    const root = el('div', 'cat-root');
    container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cat-card', '<p class="cat-hint">잠깐만요… 알파벳을 준비하고 있어요 🐱✏️</p>'));
      try {
        const res = await fetch(cfg.apiBase + '/start', { method: 'POST' });
        const data = await res.json();
        state.sessionId = data.sessionId;
        state.questions = data.questions;
        state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cat-card');
        c.appendChild(el('p', 'cat-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cat-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const btn = el('button', 'cat-btn', '다시 시도'); btn.onclick = start; c.appendChild(btn);
        root.appendChild(c);
      }
    }

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';

      const top = el('div', 'cat-top');
      top.appendChild(el('span', 'cat-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cat-progress');
      const fill = el('div', 'cat-progress-fill'); fill.style.width = (state.index / state.questions.length) * 100 + '%';
      prog.appendChild(fill); top.appendChild(prog);
      top.appendChild(el('span', 'cat-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cat-card');
      card.appendChild(el('h3', 'cat-prompt', q.prompt));
      card.appendChild(el('p', 'cat-hint', q.hint || ''));

      // 5단계: 상단 예시 글자
      if (q.showExample) {
        const ex = el('div', 'cat-example');
        ex.appendChild(el('span', 'cat-ex-label', '이렇게 →'));
        const exCanvas = el('canvas');
        const exW = 90, exH = 100;
        const exctx = setupCanvas(exCanvas, exW, exH);
        drawExample(exctx, q.strokes, exW, exH);
        ex.appendChild(exCanvas);
        card.appendChild(ex);
      }

      // 그리기 캔버스
      const wrap = el('div', 'cat-canvas-wrap');
      const frame = el('div', 'cat-canvas-frame');
      const canvas = el('canvas');
      const ctx = setupCanvas(canvas, CW, CH);
      frame.appendChild(canvas);
      wrap.appendChild(frame);
      wrap.appendChild(el('div', 'cat-canvas-hint', guideHintText(q.guideStyle)));
      card.appendChild(wrap);

      // 문제 상태
      const qs = {
        question: q, ctx, frame,
        strokes: [],        // [{ px:[{x,y}], norm:[[nx,ny]] }]
        current: null,
        drawing: false,
        firstTime: null, lastTime: null,
        pauseCount: 0, pauseDurationMs: 0, lastMoveTime: null,
        retryCount: 0, hasDrawn: false,
      };
      renderCanvas(qs);

      bindDrawing(qs, canvas);

      // 하단
      const actions = el('div', 'cat-actions');
      const feedback = el('div', 'cat-feedback', '');
      const btns = el('div', 'cat-btns');
      const clearBtn = el('button', 'cat-btn cat-ghostbtn', '지우기');
      const submit = el('button', 'cat-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback; qs.submitEl = submit;
      qs.refreshSubmit = () => { submit.disabled = !qs.hasDrawn; };
      clearBtn.onclick = () => { qs.retryCount += 1; clearDrawing(qs); };
      submit.onclick = () => onSubmit(q, qs);
      btns.appendChild(clearBtn); btns.appendChild(submit);
      actions.appendChild(feedback); actions.appendChild(btns);
      card.appendChild(actions);

      root.appendChild(card);
    }

    function guideHintText(style) {
      return ({
        dotted: '점선 위를 따라 그려요',
        faint: '흐린 글자 위에 진하게 그려요',
        arrow: '● 초록 점에서 시작해 화살표 방향으로',
        partial: '이미 있는 부분에 이어서 그려요',
        blank: '가이드 없이 직접 그려요!',
      })[style] || '';
    }

    // ── 캔버스 렌더 ──
    function renderCanvas(qs) {
      const { ctx, question: q } = qs;
      ctx.clearRect(0, 0, CW, CH);
      drawGuide(ctx, q);
      // 사용자 획
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 8;
      for (const s of qs.strokes) drawPolyPx(ctx, s.px);
      if (qs.current) drawPolyPx(ctx, qs.current.px);
    }

    function drawPolyPx(ctx, pts) {
      if (!pts || pts.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (pts.length === 1) { ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1); }
      ctx.stroke();
    }

    function drawGuide(ctx, q) {
      const idxs = q.guideStrokes || q.strokes.map((_, i) => i);
      if (q.guideStyle === 'blank') return;

      if (q.guideStyle === 'dotted' || q.guideStyle === 'arrow') {
        ctx.save();
        ctx.setLineDash([2, 9]); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(249,154,61,0.6)';
        for (const i of idxs) drawStrokeNorm(ctx, q.strokes[i]);
        ctx.restore();
        if (q.guideStyle === 'arrow') {
          for (const i of idxs) drawArrowMarks(ctx, q.strokes[i]);
        }
      } else if (q.guideStyle === 'faint') {
        ctx.save();
        ctx.lineWidth = 13; ctx.strokeStyle = 'rgba(150,140,130,0.28)';
        for (const i of idxs) drawStrokeNorm(ctx, q.strokes[i]);
        ctx.restore();
      } else if (q.guideStyle === 'partial') {
        ctx.save();
        ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(120,120,120,0.55)';
        for (const i of idxs) drawStrokeNorm(ctx, q.strokes[i]);
        ctx.restore();
      }
    }

    function drawStrokeNorm(ctx, stroke) {
      if (!stroke || !stroke.length) return;
      ctx.beginPath();
      ctx.moveTo(nx2px(stroke[0][0]), ny2px(stroke[0][1]));
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(nx2px(stroke[i][0]), ny2px(stroke[i][1]));
      ctx.stroke();
    }

    function drawArrowMarks(ctx, stroke) {
      if (!stroke || stroke.length < 2) return;
      // 시작점 (초록 원)
      ctx.save();
      ctx.fillStyle = '#34c759';
      ctx.beginPath();
      ctx.arc(nx2px(stroke[0][0]), ny2px(stroke[0][1]), 7, 0, Math.PI * 2);
      ctx.fill();
      // 끝 화살표
      const a = stroke[stroke.length - 2], b = stroke[stroke.length - 1];
      const ax = nx2px(a[0]), ay = ny2px(a[1]), bx = nx2px(b[0]), by = ny2px(b[1]);
      const ang = Math.atan2(by - ay, bx - ax);
      const L = 13;
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx - L * Math.cos(ang - 0.5), by - L * Math.sin(ang - 0.5));
      ctx.moveTo(bx, by); ctx.lineTo(bx - L * Math.cos(ang + 0.5), by - L * Math.sin(ang + 0.5));
      ctx.stroke();
      ctx.restore();
    }

    function drawExample(ctx, strokes, w, h) {
      ctx.clearRect(0, 0, w, h);
      const pad = 14;
      const mx = (nx) => pad + (nx / 100) * (w - 2 * pad);
      const my = (ny) => pad + (ny / 100) * (h - 2 * pad);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 6;
      for (const s of strokes) {
        if (!s.length) continue;
        ctx.beginPath(); ctx.moveTo(mx(s[0][0]), my(s[0][1]));
        for (let i = 1; i < s.length; i++) ctx.lineTo(mx(s[i][0]), my(s[i][1]));
        ctx.stroke();
      }
    }

    // ── 그리기 입력 ──
    function bindDrawing(qs, canvas) {
      const localPt = (e) => {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const onDown = (e) => {
        e.preventDefault();
        qs.drawing = true;
        const p = localPt(e);
        qs.current = { px: [p], norm: [[+px2nx(p.x).toFixed(1), +px2ny(p.y).toFixed(1)]] };
        const t = now();
        if (qs.firstTime == null) qs.firstTime = t;
        qs.lastMoveTime = t; qs.lastTime = t;
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      };
      const onMove = (e) => {
        if (!qs.drawing) return;
        const p = localPt(e);
        const t = now();
        // 멈춤 감지
        if (qs.lastMoveTime && t - qs.lastMoveTime > 250) {
          qs.pauseCount += 1; qs.pauseDurationMs += (t - qs.lastMoveTime);
        }
        qs.lastMoveTime = t; qs.lastTime = t;
        qs.current.px.push(p);
        qs.current.norm.push([+px2nx(p.x).toFixed(1), +px2ny(p.y).toFixed(1)]);
        renderCanvas(qs);
      };
      const onUp = () => {
        if (!qs.drawing) return;
        qs.drawing = false;
        if (qs.current && qs.current.px.length) {
          qs.strokes.push(qs.current);
          qs.hasDrawn = true;
          qs.refreshSubmit();
        }
        qs.current = null;
        renderCanvas(qs);
      };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', (e) => { if (qs.drawing) onUp(e); });
    }

    function clearDrawing(qs) {
      qs.strokes = []; qs.current = null; qs.hasDrawn = false;
      qs.firstTime = null; qs.lastTime = null; qs.pauseCount = 0; qs.pauseDurationMs = 0;
      qs.feedbackEl.textContent = ''; qs.feedbackEl.className = 'cat-feedback';
      qs.frame.classList.remove('cat-ok', 'cat-no');
      qs.refreshSubmit();
      renderCanvas(qs);
    }

    // ── 제출 ──
    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const path = [];
      const strokes = [];
      for (const s of qs.strokes) { strokes.push(s.norm); for (const p of s.norm) path.push(p); }

      const payload = {
        sessionId: state.sessionId,
        questionId: q.id,
        path,
        strokes,
        metrics: {
          drawingTimeMs: qs.firstTime && qs.lastTime ? qs.lastTime - qs.firstTime : null,
          strokeCount: qs.strokes.length,
          pauseCount: qs.pauseCount,
          pauseDurationMs: qs.pauseDurationMs,
          retryCount: qs.retryCount,
          wrongDirectionCount: 0,
        },
      };

      let result;
      try {
        const res = await fetch(cfg.apiBase + '/attempt', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        result = await res.json();
      } catch (err) {
        qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.';
        qs.feedbackEl.className = 'cat-feedback cat-no';
        qs.submitEl.disabled = false; return;
      }

      if (result.passed) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = `잘 썼어요! 🎉 (완성도 ${Math.round((result.score.completionRate || 0) * 100)}%)`;
        qs.feedbackEl.className = 'cat-feedback cat-ok';
        qs.frame.classList.add('cat-ok');
      } else {
        qs.feedbackEl.textContent = `조금 더 또박또박! 💪 (완성도 ${Math.round((result.score.completionRate || 0) * 100)}%)`;
        qs.feedbackEl.className = 'cat-feedback cat-no';
        qs.frame.classList.add('cat-no');
      }

      if (typeof cfg.onProgress === 'function') {
        cfg.onProgress({ index: state.index, total: state.questions.length, correct: result.passed, totalCorrect: state.totalCorrect, stage: q.stage, score: result.score });
      }

      setTimeout(() => { state.index += 1; renderQuestion(); }, 900);
    }

    // ── 종료 ──
    async function finish() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cat-card', '<p class="cat-hint">채점 중이에요… 🐾</p>'));
      let result;
      try {
        const res = await fetch(cfg.apiBase + '/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }),
        });
        result = await res.json();
      } catch (err) {
        root.innerHTML = '';
        root.appendChild(el('div', 'cat-card', '<p class="cat-hint">채점 연결에 실패했어요 😿</p>'));
        return;
      }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }

    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cat-card cat-done');
      done.appendChild(el('div', 'cat-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 연습해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 글자 통과`));
      const summary = el('div', 'cat-stage-summary');
      const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cat-summary-pill' + (r.passed ? '' : ' cat-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const btn = el('button', 'cat-btn cat-ghostbtn', '다시 도전하기'); btn.onclick = start;
      done.appendChild(btn);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapAlphabetTrace = {
    mount(target, opts) {
      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (!container) throw new Error('CatChapAlphabetTrace: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(container, opts);
    },
  };

  global.CatChapAlphabetTrace = CatChapAlphabetTrace;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapAlphabetTrace;
})(typeof window !== 'undefined' ? window : this);
