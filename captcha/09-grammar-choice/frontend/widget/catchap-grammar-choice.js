/* ============================================================================
 *  CatChap · Grammar Choice CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *    CatChapGrammarChoice.mount('#captcha-mount', {
 *      apiBase:'/api/grammar-choice', onProgress, onPass, onFail });
 *  보기 카드를 문장 빈칸으로 드래그(또는 탭)해 넣음. 서버가 채점.
 * ========================================================================== */
(function (global) {
  'use strict';
  const now = () => Date.now();
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/grammar-choice', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };
    const root = el('div', 'cgc-root'); container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cgc-card', '<p class="cgc-hint">잠깐만요… 문장을 준비하고 있어요 🐱✏️</p>'));
      try {
        const data = await (await fetch(cfg.apiBase + '/start', { method: 'POST' })).json();
        state.sessionId = data.sessionId; state.questions = data.questions; state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cgc-card');
        c.appendChild(el('p', 'cgc-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cgc-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const b = el('button', 'cgc-btn', '다시 시도'); b.onclick = start; c.appendChild(b); root.appendChild(c);
      }
    }

    const dropZones = [];

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';
      dropZones.length = 0;

      const top = el('div', 'cgc-top');
      top.appendChild(el('span', 'cgc-stage-chip', `⭐ ${q.stage}단계`));
      top.appendChild(el('span', 'cgc-grammar-tag', `📚 ${q.grammarType}`));
      const prog = el('div', 'cgc-progress'); const fill = el('div', 'cgc-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%'; prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cgc-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cgc-card');
      card.appendChild(el('h3', 'cgc-prompt', q.prompt));
      card.appendChild(el('p', 'cgc-hint', q.hint || ''));
      if (q.image) card.appendChild(el('div', 'cgc-image', q.image));

      const qs = {
        question: q, startTime: now(), firstSelectTime: null,
        selected: null,          // 채워진 tile id
        tileEls: {}, blankEl: null,
        wrongAttemptCount: 0, retryCount: 0,
        hoveredOptions: new Set(),
      };

      // 문장 렌더 (___ 를 빈칸 요소로)
      const sentence = el('div', 'cgc-sentence');
      q.sentence.split(' ').forEach((tok) => {
        if (tok.startsWith('___')) {
          const blank = el('div', 'cgc-blank', '?');
          // (드래그 전용) 빈칸 탭으로 빼는 기능 제거 — 카드를 끌어서 넣어요
          sentence.appendChild(blank);
          qs.blankEl = blank;
          registerZone(blank, 'blank', qs);
          const tail = tok.slice(3); // "___." 같은 문장부호
          if (tail) sentence.appendChild(el('span', null, tail));
        } else {
          sentence.appendChild(el('span', null, tok));
        }
      });
      card.appendChild(sentence);
      card.appendChild(el('p', 'cgc-drag-guide', '✋ 알맞은 카드를 끌어서 빈칸에 놓아요'));

      // 보기 트레이
      card.appendChild(el('p', 'cgc-tray-label', '보기 카드'));
      const tray = el('div', 'cgc-tray');
      card.appendChild(tray);
      qs.trayEl = tray;
      registerZone(tray, 'tray', qs);

      q.options.forEach((opt, i) => {
        const t = el('div', 'cgc-tile', opt);
        t.dataset.id = i;
        t.addEventListener('mouseenter', () => qs.hoveredOptions.add(opt));
        attachDrag(t, { id: i, word: opt }, qs);
        tray.appendChild(t);
        qs.tileEls[i] = t;
      });

      const actions = el('div', 'cgc-actions');
      const feedback = el('div', 'cgc-feedback', '');
      const btns = el('div', 'cgc-btns');
      const resetBtn = el('button', 'cgc-btn cgc-ghostbtn', '다시 고르기');
      const submit = el('button', 'cgc-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback; qs.submitEl = submit;
      qs.refreshSubmit = () => { submit.disabled = qs.selected == null; };
      resetBtn.onclick = () => { qs.retryCount += 1; clearBlank(qs); };
      submit.onclick = () => onSubmit(q, qs);
      btns.appendChild(resetBtn); btns.appendChild(submit);
      actions.appendChild(feedback); actions.appendChild(btns);
      card.appendChild(actions);
      root.appendChild(card);
    }

    function registerZone(node, cat, qs) { dropZones.push({ node, cat, qs }); }
    function zonesFor(qs) { return dropZones.filter((z) => z.qs === qs); }

    function fillBlank(qs, tileId) {
      if (qs.firstSelectTime == null) qs.firstSelectTime = now();
      if (qs.selected != null && qs.selected !== tileId) {
        // 기존 카드 트레이로
        const prev = qs.tileEls[qs.selected];
        qs.trayEl.appendChild(prev); prev.classList.remove('cgc-in-blank');
      }
      qs.selected = tileId;
      const tileEl = qs.tileEls[tileId];
      qs.blankEl.textContent = '';
      qs.blankEl.appendChild(tileEl);
      qs.blankEl.classList.add('cgc-filled');
      tileEl.classList.add('cgc-in-blank');
      qs.refreshSubmit();
    }
    function clearBlank(qs) {
      if (qs.selected == null) return;
      const tileEl = qs.tileEls[qs.selected];
      qs.trayEl.appendChild(tileEl); tileEl.classList.remove('cgc-in-blank');
      qs.selected = null;
      qs.blankEl.textContent = '?';
      qs.blankEl.classList.remove('cgc-filled', 'cgc-ok', 'cgc-no');
      qs.feedbackEl.textContent = ''; qs.feedbackEl.className = 'cgc-feedback';
      qs.refreshSubmit();
    }

    function attachDrag(tileEl, tile, qs) {
      let ghost = null, dragging = false, lastPt = null, grabbed = false;
      const onDown = (e) => {
        e.preventDefault(); grabbed = true; dragging = false;
        lastPt = { x: e.clientX, y: e.clientY };
        tileEl.setPointerCapture && tileEl.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };
      const onMove = (e) => {
        if (!grabbed) return;
        const p = { x: e.clientX, y: e.clientY };
        if (!dragging) {
          if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) < 6) return;
          dragging = true; tileEl.classList.add('cgc-dragging');
          ghost = el('div', 'cgc-ghost', tile.word); document.body.appendChild(ghost);
        }
        lastPt = p;
        ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
        zonesFor(qs).forEach((z) => z.node.classList.remove('cgc-drop-hot'));
        const z = zoneUnder(qs, p); if (z) z.node.classList.add('cgc-drop-hot');
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false; tileEl.classList.remove('cgc-dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        if (!dragging) {
          // 탭만 한 경우 아무 동작 안 함 (드래그로만 이동 가능)
          return;
        }
        zonesFor(qs).forEach((z) => z.node.classList.remove('cgc-drop-hot'));
        const zone = zoneUnder(qs, { x: e.clientX, y: e.clientY });
        if (!zone) return;
        if (zone.cat === 'blank') fillBlank(qs, tile.id);
        else if (qs.selected === tile.id) clearBlank(qs);
      };
      tileEl.addEventListener('pointerdown', onDown);
    }
    function zoneUnder(qs, p) {
      const zs = zonesFor(qs).slice().sort((a, b) => (a.cat === 'tray' ? 1 : 0) - (b.cat === 'tray' ? 1 : 0));
      return zs.find((z) => {
        const r = z.node.getBoundingClientRect();
        return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
      });
    }

    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const t = now();
      const selectedAnswer = qs.selected != null ? q.options[qs.selected] : null;
      const payload = {
        sessionId: state.sessionId, questionId: q.id, selectedAnswer,
        metrics: {
          solveTimeMs: t - qs.startTime,
          firstSelectTimeMs: qs.firstSelectTime ? qs.firstSelectTime - qs.startTime : null,
          hesitationTimeMs: qs.firstSelectTime ? qs.firstSelectTime - qs.startTime : null,
          wrongAttemptCount: qs.wrongAttemptCount, retryCount: qs.retryCount,
          hoveredOptions: Array.from(qs.hoveredOptions),
        },
      };
      let res;
      try { res = await (await fetch(cfg.apiBase + '/attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(); }
      catch (err) { qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.'; qs.feedbackEl.className = 'cgc-feedback cgc-no'; qs.submitEl.disabled = false; return; }

      if (res.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '문법 박사네요! 🎉'; qs.feedbackEl.className = 'cgc-feedback cgc-ok';
        qs.blankEl.classList.add('cgc-ok');
      } else {
        qs.wrongAttemptCount += 1;
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로! 💪'; qs.feedbackEl.className = 'cgc-feedback cgc-no';
        qs.blankEl.classList.add('cgc-no');
      }
      if (typeof cfg.onProgress === 'function') cfg.onProgress({ index: state.index, total: state.questions.length, correct: res.correct, totalCorrect: state.totalCorrect, stage: q.stage });
      setTimeout(() => { state.index += 1; renderQuestion(); }, 850);
    }

    async function finish() {
      root.innerHTML = ''; root.appendChild(el('div', 'cgc-card', '<p class="cgc-hint">채점 중이에요… 🐾</p>'));
      let result;
      try { result = await (await fetch(cfg.apiBase + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })).json(); }
      catch (err) { root.innerHTML = ''; root.appendChild(el('div', 'cgc-card', '<p class="cgc-hint">채점 연결에 실패했어요 😿</p>')); return; }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }
    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cgc-card cgc-done');
      done.appendChild(el('div', 'cgc-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));
      const summary = el('div', 'cgc-stage-summary'); const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cgc-summary-pill' + (r.passed ? '' : ' cgc-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const b = el('button', 'cgc-btn cgc-ghostbtn', '다시 도전하기'); b.onclick = start; done.appendChild(b);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapGrammarChoice = {
    mount(target, opts) {
      const c = typeof target === 'string' ? document.querySelector(target) : target;
      if (!c) throw new Error('CatChapGrammarChoice: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(c, opts);
    },
  };
  global.CatChapGrammarChoice = CatChapGrammarChoice;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapGrammarChoice;
})(typeof window !== 'undefined' ? window : this);
