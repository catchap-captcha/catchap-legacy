/* ============================================================================
 *  CatChap · Word Category Sort CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *    CatChapWordCategorySort.mount('#captcha-mount', {
 *      apiBase:'/api/word-category-sort', onProgress, onPass, onFail });
 *  단어 칩을 카테고리 상자로 드래그(또는 탭)해 분류. 서버가 채점.
 * ========================================================================== */
(function (global) {
  'use strict';
  const now = () => Date.now();
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/word-category-sort', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };
    const root = el('div', 'cws-root'); container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cws-card', '<p class="cws-hint">잠깐만요… 단어를 준비하고 있어요 🐱📦</p>'));
      try {
        const data = await (await fetch(cfg.apiBase + '/start', { method: 'POST' })).json();
        state.sessionId = data.sessionId; state.questions = data.questions; state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cws-card');
        c.appendChild(el('p', 'cws-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cws-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const b = el('button', 'cws-btn', '다시 시도'); b.onclick = start; c.appendChild(b); root.appendChild(c);
      }
    }

    const dropZones = []; // { node, itemsEl, cat, qs }

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';
      dropZones.length = 0;

      const top = el('div', 'cws-top');
      top.appendChild(el('span', 'cws-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cws-progress'); const fill = el('div', 'cws-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%'; prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cws-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cws-card');
      card.appendChild(el('h3', 'cws-prompt', q.prompt));
      card.appendChild(el('p', 'cws-hint', q.hint || ''));

      const qs = {
        question: q, startTime: now(),
        placement: {},   // word -> catId | 'none'
        chipEls: {},
        pendingChip: null,
        regrabCount: 0, categorySwitchCount: 0,
        dragOrder: [], selectionOrder: [],
      };
      q.words.forEach((x) => { qs.placement[x.word] = 'none'; });

      // 카테고리 상자
      const boxes = el('div', 'cws-boxes');
      q.categories.forEach((cat) => {
        const box = el('div', 'cws-box');
        box.appendChild(el('div', 'cws-box-label', `🗂️ ${cat.label}`));
        const items = el('div', 'cws-box-items');
        const empty = el('div', 'cws-box-empty', '여기로 끌어와요');
        items.appendChild(empty);
        box.appendChild(items);
        boxes.appendChild(box);
        registerZone(box, items, cat.id, qs, empty);
      });
      card.appendChild(boxes);

      // 트레이
      card.appendChild(el('p', 'cws-tray-label', '단어 꾸러미'));
      const tray = el('div', 'cws-tray');
      card.appendChild(tray);
      registerZone(tray, tray, 'none', qs, null);

      // 칩 생성 → 트레이에 배치
      q.words.forEach((x) => {
        const chip = el('div', 'cws-chip');
        chip.dataset.word = x.word;
        chip.appendChild(el('span', 'cws-emoji', x.emoji));
        chip.appendChild(document.createTextNode(x.word));
        attachDrag(chip, qs);
        tray.appendChild(chip);
        qs.chipEls[x.word] = chip;
      });

      // 하단
      const actions = el('div', 'cws-actions');
      const feedback = el('div', 'cws-feedback', '');
      const btns = el('div', 'cws-btns');
      const resetBtn = el('button', 'cws-btn cws-ghostbtn', '다시 담기');
      const submit = el('button', 'cws-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      qs.feedbackEl = feedback; qs.submitEl = submit;
      qs.refreshSubmit = () => {
        // 최소 한 개라도 상자에 넣으면 제출 가능
        submit.disabled = !Object.values(qs.placement).some((c) => c !== 'none');
      };
      submit.disabled = true;
      resetBtn.onclick = () => resetAll(qs, tray);
      submit.onclick = () => onSubmit(q, qs);
      btns.appendChild(resetBtn); btns.appendChild(submit);
      actions.appendChild(feedback); actions.appendChild(btns);
      card.appendChild(actions);
      root.appendChild(card);
    }

    function registerZone(node, itemsEl, cat, qs, emptyEl) {
      const zone = { node, itemsEl, cat, qs, emptyEl };
      dropZones.push(zone);
      // (드래그 전용) 탭으로 상자에 넣는 기능은 제거 — 오직 드래그로만 이동
    }
    function zonesFor(qs) { return dropZones.filter((z) => z.qs === qs); }

    function moveChip(qs, chip, zone) {
      const word = chip.dataset.word;
      const prev = qs.placement[word];
      if (prev === zone.cat) return;
      if (prev !== 'none' && zone.cat !== 'none') qs.categorySwitchCount += 1;
      // 이전 상자의 empty 표시 복구
      updateEmpty(qs);
      zone.itemsEl.appendChild(chip);
      qs.placement[word] = zone.cat;
      chip.classList.toggle('cws-in-box', zone.cat !== 'none');
      if (zone.cat !== 'none') {
        qs.dragOrder.push(word);
        qs.selectionOrder.push({ word, cat: zone.cat, t: now() - qs.startTime });
      }
      updateEmpty(qs);
      qs.refreshSubmit();
    }
    function updateEmpty(qs) {
      zonesFor(qs).forEach((z) => {
        if (!z.emptyEl) return;
        const hasChip = z.itemsEl.querySelector('.cws-chip');
        z.emptyEl.style.display = hasChip ? 'none' : '';
      });
    }
    function resetAll(qs, tray) {
      qs.question.words.forEach((x) => {
        const chip = qs.chipEls[x.word];
        tray.appendChild(chip); chip.classList.remove('cws-in-box');
        qs.placement[x.word] = 'none';
      });
      qs.feedbackEl.textContent = ''; qs.feedbackEl.className = 'cws-feedback';
      updateEmpty(qs); qs.refreshSubmit();
    }

    // ── 포인터 드래그 (word-drag 와 동일 방식) ──
    function attachDrag(chip, qs) {
      let ghost = null, dragging = false, lastPt = null, grabbed = false;
      const onDown = (e) => {
        e.preventDefault(); grabbed = true; dragging = false;
        lastPt = { x: e.clientX, y: e.clientY };
        chip.setPointerCapture && chip.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };
      const onMove = (e) => {
        if (!grabbed) return;
        const p = { x: e.clientX, y: e.clientY };
        if (!dragging) {
          if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) < 6) return;
          dragging = true; chip.classList.add('cws-dragging');
          ghost = el('div', 'cws-ghost'); ghost.innerHTML = chip.innerHTML; document.body.appendChild(ghost);
        }
        lastPt = p; ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
        highlightUnder(qs, p);
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false; chip.classList.remove('cws-dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        if (!dragging) { return; } // 탭만 한 경우 아무 동작 안 함 (드래그로만 이동)
        clearHot(qs);
        const zone = zoneUnder(qs, { x: e.clientX, y: e.clientY });
        if (zone) moveChip(qs, chip, zone); else qs.regrabCount += 1;
      };
      chip.addEventListener('pointerdown', onDown);
    }
    function togglePick(chip, qs) {
      if (qs.pendingChip === chip) { chip.classList.remove('cws-selected'); qs.pendingChip = null; }
      else { if (qs.pendingChip) qs.pendingChip.classList.remove('cws-selected'); chip.classList.add('cws-selected'); qs.pendingChip = chip; }
    }
    function highlightUnder(qs, p) { clearHot(qs); const z = zoneUnder(qs, p); if (z) z.node.classList.add('cws-drop-hot'); }
    function clearHot(qs) { zonesFor(qs).forEach((z) => z.node.classList.remove('cws-drop-hot')); }
    function zoneUnder(qs, p) {
      return zonesFor(qs).find((z) => {
        const r = z.node.getBoundingClientRect();
        return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
      });
    }

    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const selectedMap = {};
      q.words.forEach((x) => { selectedMap[x.word] = qs.placement[x.word]; });
      const payload = {
        sessionId: state.sessionId, questionId: q.id, selectedMap,
        metrics: {
          solveTimeMs: now() - qs.startTime,
          dragOrder: qs.dragOrder, selectionOrder: qs.selectionOrder,
          regrabCount: qs.regrabCount, categorySwitchCount: qs.categorySwitchCount,
        },
      };
      let res;
      try { res = await (await fetch(cfg.apiBase + '/attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(); }
      catch (err) { qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.'; qs.feedbackEl.className = 'cws-feedback cws-no'; qs.submitEl.disabled = false; return; }

      if (res.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '잘 분류했어요! 🎉'; qs.feedbackEl.className = 'cws-feedback cws-ok';
      } else {
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로! 💪'; qs.feedbackEl.className = 'cws-feedback cws-no';
      }
      if (typeof cfg.onProgress === 'function') cfg.onProgress({ index: state.index, total: state.questions.length, correct: res.correct, totalCorrect: state.totalCorrect, stage: q.stage, result: res.result });
      setTimeout(() => { state.index += 1; renderQuestion(); }, 850);
    }

    async function finish() {
      root.innerHTML = ''; root.appendChild(el('div', 'cws-card', '<p class="cws-hint">채점 중이에요… 🐾</p>'));
      let result;
      try { result = await (await fetch(cfg.apiBase + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })).json(); }
      catch (err) { root.innerHTML = ''; root.appendChild(el('div', 'cws-card', '<p class="cws-hint">채점 연결에 실패했어요 😿</p>')); return; }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }
    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cws-card cws-done');
      done.appendChild(el('div', 'cws-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));
      const summary = el('div', 'cws-stage-summary'); const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cws-summary-pill' + (r.passed ? '' : ' cws-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const b = el('button', 'cws-btn cws-ghostbtn', '다시 도전하기'); b.onclick = start; done.appendChild(b);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapWordCategorySort = {
    mount(target, opts) {
      const c = typeof target === 'string' ? document.querySelector(target) : target;
      if (!c) throw new Error('CatChapWordCategorySort: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(c, opts);
    },
  };
  global.CatChapWordCategorySort = CatChapWordCategorySort;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapWordCategorySort;
})(typeof window !== 'undefined' ? window : this);
