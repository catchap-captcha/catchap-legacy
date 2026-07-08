/* ============================================================================
 *  CatChap · Sentence Order CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *    CatChapSentenceOrder.mount('#captcha-mount', {
 *      apiBase:'/api/sentence-order', onProgress, onPass, onFail });
 *  섞인 단어 카드를 문장 순서대로 드래그(또는 탭)해 배열. 서버가 채점.
 * ========================================================================== */
(function (global) {
  'use strict';
  const now = () => Date.now();
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/sentence-order', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };
    const root = el('div', 'cso-root'); container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cso-card', '<p class="cso-hint">잠깐만요… 문장을 준비하고 있어요 🐱📝</p>'));
      try {
        const data = await (await fetch(cfg.apiBase + '/start', { method: 'POST' })).json();
        state.sessionId = data.sessionId; state.questions = data.questions; state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cso-card');
        c.appendChild(el('p', 'cso-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cso-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const b = el('button', 'cso-btn', '다시 시도'); b.onclick = start; c.appendChild(b); root.appendChild(c);
      }
    }

    const dropZones = [];

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';
      dropZones.length = 0;

      const top = el('div', 'cso-top');
      top.appendChild(el('span', 'cso-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cso-progress'); const fill = el('div', 'cso-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%'; prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cso-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      // 문장 해석(한국어)과 상단 안내 문구를 분리
      const translation = q.meaning || (q.stage <= 3 ? q.hint : '');
      const topHint = q.meaning ? q.hint : (q.stage <= 3 ? '' : q.hint);

      const card = el('div', 'cso-card');
      card.appendChild(el('h3', 'cso-prompt', q.prompt));
      if (topHint) card.appendChild(el('p', 'cso-hint', topHint));
      if (q.image) card.appendChild(el('div', 'cso-image', q.image));

      const qs = {
        question: q, startTime: now(),
        tiles: q.cards.map((w, i) => ({ id: i, word: w })),
        slotChip: new Array(q.slots).fill(null),
        tileEls: {}, slotEls: [],
        swapCount: 0, regrabCount: 0, retryCount: 0,
        dragOrder: [], dragPath: [],
      };

      // 문장 슬롯 + 마침표
      const slots = el('div', 'cso-slots');
      for (let i = 0; i < q.slots; i++) {
        const slot = el('div', 'cso-slot');
        slot.dataset.slot = i;
        // (드래그 전용) 슬롯 탭으로 빼는 기능 제거 — 카드를 끌어서 옮겨요
        slots.appendChild(slot); qs.slotEls.push(slot);
        registerZone(slot, i, qs);
      }
      slots.appendChild(el('span', 'cso-period', '.'));
      card.appendChild(slots);
      card.appendChild(el('p', 'cso-drag-guide', '✋ 단어 카드를 끌어서 위 칸에 순서대로 놓아요'));

      // 문장 해석(한국어)을 안내선 아래에 조금 크게 표시
      if (translation) {
        const tr = el('div', 'cso-translation');
        tr.appendChild(el('span', null, `💬 ${translation}`));
        card.appendChild(tr);
      }

      // 트레이
      card.appendChild(el('p', 'cso-tray-label', '단어 카드'));
      const tray = el('div', 'cso-tray');
      card.appendChild(tray);
      qs.trayEl = tray;
      registerZone(tray, 'tray', qs);

      qs.tiles.forEach((tile) => {
        const t = el('div', 'cso-tile', tile.word);
        t.dataset.id = tile.id;
        attachDrag(t, tile, qs);
        tray.appendChild(t);
        qs.tileEls[tile.id] = t;
      });

      const actions = el('div', 'cso-actions');
      const feedback = el('div', 'cso-feedback', '');
      const btns = el('div', 'cso-btns');
      const resetBtn = el('button', 'cso-btn cso-ghostbtn', '다시 놓기');
      const submit = el('button', 'cso-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback; qs.submitEl = submit;
      qs.refreshSubmit = () => { submit.disabled = qs.slotChip.some((x) => x == null); };
      resetBtn.onclick = () => { qs.retryCount += 1; resetAll(qs); };
      submit.onclick = () => onSubmit(q, qs);
      btns.appendChild(resetBtn); btns.appendChild(submit);
      actions.appendChild(feedback); actions.appendChild(btns);
      card.appendChild(actions);
      root.appendChild(card);
    }

    function registerZone(node, cat, qs) { dropZones.push({ node, cat, qs }); }
    function zonesFor(qs) { return dropZones.filter((z) => z.qs === qs); }
    function tileLocation(qs, tileId) { const s = qs.slotChip.indexOf(tileId); return s === -1 ? 'tray' : s; }
    function removeFromCurrent(qs, tileId) {
      const s = qs.slotChip.indexOf(tileId);
      if (s !== -1) { qs.slotChip[s] = null; qs.slotEls[s].classList.remove('cso-filled'); }
    }
    function placeInSlot(qs, tileId, slotIndex) {
      if (qs.slotChip[slotIndex] === tileId) return;
      const occupant = qs.slotChip[slotIndex];
      removeFromCurrent(qs, tileId);
      if (occupant != null) {
        qs.slotChip[slotIndex] = null;
        qs.trayEl.appendChild(qs.tileEls[occupant]);
        qs.tileEls[occupant].classList.remove('cso-in-slot');
        qs.swapCount += 1;
      }
      qs.slotChip[slotIndex] = tileId;
      const tileEl = qs.tileEls[tileId];
      qs.slotEls[slotIndex].appendChild(tileEl);
      qs.slotEls[slotIndex].classList.add('cso-filled');
      tileEl.classList.add('cso-in-slot');
      qs.dragOrder.push({ word: qs.tiles[tileId].word, slot: slotIndex, t: now() - qs.startTime });
      qs.refreshSubmit();
    }
    function returnToTray(qs, tileId) {
      removeFromCurrent(qs, tileId);
      const tileEl = qs.tileEls[tileId];
      qs.trayEl.appendChild(tileEl);
      tileEl.classList.remove('cso-in-slot');
      qs.refreshSubmit();
    }
    function autoFill(qs, tileId) {
      const empty = qs.slotChip.indexOf(null);
      if (empty === -1) return;
      placeInSlot(qs, tileId, empty);
    }
    function resetAll(qs) {
      qs.tiles.forEach((tile) => returnToTray(qs, tile.id));
      qs.feedbackEl.textContent = ''; qs.feedbackEl.className = 'cso-feedback';
      qs.slotEls.forEach((s) => s.classList.remove('cso-ok', 'cso-no'));
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
          dragging = true; tileEl.classList.add('cso-dragging');
          ghost = el('div', 'cso-ghost', tile.word); document.body.appendChild(ghost);
        }
        lastPt = p;
        qs.dragPath.push({ x: Math.round(p.x), y: Math.round(p.y), t: now() - qs.startTime });
        ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
        clearHot(qs); const z = zoneUnder(qs, p); if (z) z.node.classList.add('cso-drop-hot');
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false; tileEl.classList.remove('cso-dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        if (!dragging) {
          // 탭만 한 경우 아무 동작 안 함 (드래그로만 이동 가능)
          return;
        }
        clearHot(qs);
        const zone = zoneUnder(qs, { x: e.clientX, y: e.clientY });
        if (!zone) { qs.regrabCount += 1; return; }
        if (zone.cat === 'tray') returnToTray(qs, tile.id);
        else placeInSlot(qs, tile.id, zone.cat);
      };
      tileEl.addEventListener('pointerdown', onDown);
    }
    function clearHot(qs) { zonesFor(qs).forEach((z) => z.node.classList.remove('cso-drop-hot')); }
    function zoneUnder(qs, p) {
      const zs = zonesFor(qs).slice().sort((a, b) => (a.cat === 'tray' ? 1 : 0) - (b.cat === 'tray' ? 1 : 0));
      return zs.find((z) => {
        const r = z.node.getBoundingClientRect();
        return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
      });
    }

    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const selectedWords = qs.slotChip.map((id) => (id == null ? null : qs.tiles[id].word));
      const payload = {
        sessionId: state.sessionId, questionId: q.id, selectedWords,
        metrics: {
          solveTimeMs: now() - qs.startTime,
          dragOrder: qs.dragOrder, swapCount: qs.swapCount,
          regrabCount: qs.regrabCount, retryCount: qs.retryCount,
          dragPath: qs.dragPath.slice(0, 500),
        },
      };
      let res;
      try { res = await (await fetch(cfg.apiBase + '/attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(); }
      catch (err) { qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.'; qs.feedbackEl.className = 'cso-feedback cso-no'; qs.submitEl.disabled = false; return; }

      if (res.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '멋진 문장이에요! 🎉'; qs.feedbackEl.className = 'cso-feedback cso-ok';
        qs.slotEls.forEach((s) => s.classList.add('cso-ok'));
      } else {
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로! 💪'; qs.feedbackEl.className = 'cso-feedback cso-no';
        qs.slotEls.forEach((s) => s.classList.add('cso-no'));
      }
      if (typeof cfg.onProgress === 'function') cfg.onProgress({ index: state.index, total: state.questions.length, correct: res.correct, totalCorrect: state.totalCorrect, stage: q.stage, result: res.result });
      setTimeout(() => { state.index += 1; renderQuestion(); }, 850);
    }

    async function finish() {
      root.innerHTML = ''; root.appendChild(el('div', 'cso-card', '<p class="cso-hint">채점 중이에요… 🐾</p>'));
      let result;
      try { result = await (await fetch(cfg.apiBase + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })).json(); }
      catch (err) { root.innerHTML = ''; root.appendChild(el('div', 'cso-card', '<p class="cso-hint">채점 연결에 실패했어요 😿</p>')); return; }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }
    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cso-card cso-done');
      done.appendChild(el('div', 'cso-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));
      const summary = el('div', 'cso-stage-summary'); const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cso-summary-pill' + (r.passed ? '' : ' cso-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const b = el('button', 'cso-btn cso-ghostbtn', '다시 도전하기'); b.onclick = start; done.appendChild(b);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapSentenceOrder = {
    mount(target, opts) {
      const c = typeof target === 'string' ? document.querySelector(target) : target;
      if (!c) throw new Error('CatChapSentenceOrder: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(c, opts);
    },
  };
  global.CatChapSentenceOrder = CatChapSentenceOrder;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapSentenceOrder;
})(typeof window !== 'undefined' ? window : this);
