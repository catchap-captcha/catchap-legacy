/* ============================================================================
 *  CatChap · Picture Sentence Match CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *    CatChapPictureSentenceMatch.mount('#captcha-mount', {
 *      apiBase:'/api/picture-sentence-match', onProgress, onPass, onFail });
 *  1~3단계: 그림에 맞는 문장 카드 선택.
 *  4~5단계: 문장 카드를 그림 옆 칸으로 드래그해 연결. 서버가 채점.
 * ========================================================================== */
(function (global) {
  'use strict';
  const now = () => Date.now();
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/picture-sentence-match', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };
    const root = el('div', 'cpm-root'); container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cpm-card', '<p class="cpm-hint">잠깐만요… 그림과 문장을 준비하고 있어요 🐱🖼️</p>'));
      try {
        const data = await (await fetch(cfg.apiBase + '/start', { method: 'POST' })).json();
        state.sessionId = data.sessionId; state.questions = data.questions; state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cpm-card');
        c.appendChild(el('p', 'cpm-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cpm-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const b = el('button', 'cpm-btn', '다시 시도'); b.onclick = start; c.appendChild(b); root.appendChild(c);
      }
    }

    const dropZones = [];

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';
      dropZones.length = 0;

      const top = el('div', 'cpm-top');
      top.appendChild(el('span', 'cpm-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cpm-progress'); const fill = el('div', 'cpm-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%'; prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cpm-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cpm-card');
      card.appendChild(el('h3', 'cpm-prompt', q.prompt));
      card.appendChild(el('p', 'cpm-hint', q.hint || ''));

      const qs = {
        question: q, startTime: now(), firstSelectTime: null,
        selectedSentenceId: null,        // pick
        placement: {},                   // connect: itemId -> tileId(=sentence id)
        tileEls: {}, dropEls: {},
        wrongAttemptCount: 0, retryCount: 0,
        hoveredOptions: new Set(), connectionPath: [],
      };

      if (q.type === 'pick') buildPick(card, q, qs);
      else buildConnect(card, q, qs);

      const actions = el('div', 'cpm-actions');
      const feedback = el('div', 'cpm-feedback', '');
      const btns = el('div', 'cpm-btns');
      if (q.type === 'connect') {
        const resetBtn = el('button', 'cpm-btn cpm-ghostbtn', '다시 연결하기');
        resetBtn.onclick = () => { qs.retryCount += 1; resetConnect(qs); };
        btns.appendChild(resetBtn);
      }
      const submit = el('button', 'cpm-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback; qs.submitEl = submit;
      qs.refreshSubmit = () => {
        if (q.type === 'pick') submit.disabled = !qs.selectedSentenceId;
        else submit.disabled = q.items.some((it) => qs.placement[it.id] == null);
      };
      submit.onclick = () => onSubmit(q, qs);
      btns.appendChild(submit);
      actions.appendChild(feedback); actions.appendChild(btns);
      card.appendChild(actions);
      root.appendChild(card);
    }

    // ── 1~3단계: 문장 카드 선택 ──
    function buildPick(card, q, qs) {
      if (q.image) card.appendChild(el('div', 'cpm-image', q.image));
      const choices = el('div', 'cpm-choices');
      qs.choiceEls = {};
      q.sentences.forEach((s) => {
        const c = el('div', 'cpm-choice', s.text);
        c.dataset.id = s.id;
        c.addEventListener('mouseenter', () => qs.hoveredOptions.add(s.text));
        c.onclick = () => {
          if (qs.firstSelectTime == null) qs.firstSelectTime = now();
          if (qs.selectedSentenceId && qs.choiceEls[qs.selectedSentenceId]) qs.choiceEls[qs.selectedSentenceId].classList.remove('cpm-selected');
          qs.selectedSentenceId = s.id;
          c.classList.add('cpm-selected');
          qs.refreshSubmit();
        };
        choices.appendChild(c);
        qs.choiceEls[s.id] = c;
      });
      card.appendChild(choices);
    }

    // ── 4~5단계: 문장 카드 → 그림 옆 칸 드래그 ──
    function buildConnect(card, q, qs) {
      const rows = el('div', 'cpm-rows');
      q.items.forEach((it) => {
        const row = el('div', 'cpm-row');
        row.appendChild(el('div', 'cpm-pic', it.image));
        row.appendChild(el('span', 'cpm-link', '↔'));
        const drop = el('div', 'cpm-drop', '여기에 문장을 놓아요');
        drop.dataset.item = it.id;
        // (드래그 전용) 칸 탭으로 빼는 기능 제거 — 문장 카드를 끌어서 연결해요
        row.appendChild(drop);
        rows.appendChild(row);
        qs.dropEls[it.id] = drop;
        dropZones.push({ node: drop, cat: it.id, qs });
      });
      card.appendChild(rows);
      card.appendChild(el('p', 'cpm-drag-guide', '✋ 문장 카드를 끌어서 알맞은 그림 옆에 놓아요'));

      card.appendChild(el('p', 'cpm-tray-label', '문장 카드'));
      const tray = el('div', 'cpm-tray');
      card.appendChild(tray);
      qs.trayEl = tray;
      dropZones.push({ node: tray, cat: 'tray', qs });

      q.sentences.forEach((s) => {
        const t = el('div', 'cpm-tile', s.text);
        t.dataset.id = s.id;
        t.addEventListener('mouseenter', () => qs.hoveredOptions.add(s.text));
        attachDrag(t, s, qs);
        tray.appendChild(t);
        qs.tileEls[s.id] = t;
      });
    }

    function zonesFor(qs) { return dropZones.filter((z) => z.qs === qs); }
    function itemOfTile(qs, tileId) {
      for (const it of Object.keys(qs.placement)) if (qs.placement[it] === tileId) return it;
      return null;
    }
    function placeInDrop(qs, tileId, itemId) {
      if (qs.placement[itemId] === tileId) return;
      if (qs.firstSelectTime == null) qs.firstSelectTime = now();
      // 이 타일이 다른 칸에 있으면 제거
      const prevItem = itemOfTile(qs, tileId);
      if (prevItem) { qs.placement[prevItem] = null; qs.dropEls[prevItem].textContent = '여기에 문장을 놓아요'; qs.dropEls[prevItem].classList.remove('cpm-filled'); }
      // 이 칸에 다른 타일이 있으면 트레이로
      const occupant = qs.placement[itemId];
      if (occupant != null) {
        qs.trayEl.appendChild(qs.tileEls[occupant]);
        qs.tileEls[occupant].classList.remove('cpm-in-drop');
      }
      qs.placement[itemId] = tileId;
      const drop = qs.dropEls[itemId];
      drop.textContent = '';
      drop.appendChild(qs.tileEls[tileId]);
      drop.classList.add('cpm-filled');
      qs.tileEls[tileId].classList.add('cpm-in-drop');
      qs.connectionPath.push({ item: itemId, sentence: tileId, t: now() - qs.startTime });
      qs.refreshSubmit();
    }
    function returnToTray(qs, itemId) {
      const tid = qs.placement[itemId];
      if (tid == null) return;
      qs.placement[itemId] = null;
      qs.trayEl.appendChild(qs.tileEls[tid]);
      qs.tileEls[tid].classList.remove('cpm-in-drop');
      const drop = qs.dropEls[itemId];
      drop.textContent = '여기에 문장을 놓아요';
      drop.classList.remove('cpm-filled', 'cpm-ok', 'cpm-no');
      qs.refreshSubmit();
    }
    function resetConnect(qs) {
      Object.keys(qs.dropEls).forEach((it) => returnToTray(qs, it));
      qs.feedbackEl.textContent = ''; qs.feedbackEl.className = 'cpm-feedback';
      qs.refreshSubmit();
    }

    function attachDrag(tileEl, s, qs) {
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
          dragging = true; tileEl.classList.add('cpm-dragging');
          ghost = el('div', 'cpm-ghost', s.text); document.body.appendChild(ghost);
        }
        lastPt = p;
        ghost.style.left = p.x + 'px'; ghost.style.top = p.y + 'px';
        zonesFor(qs).forEach((z) => z.node.classList.remove('cpm-drop-hot'));
        const z = zoneUnder(qs, p); if (z) z.node.classList.add('cpm-drop-hot');
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false; tileEl.classList.remove('cpm-dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        if (!dragging) {
          // 탭만 한 경우 아무 동작 안 함 (문장 카드는 드래그로만 연결)
          return;
        }
        zonesFor(qs).forEach((z) => z.node.classList.remove('cpm-drop-hot'));
        const zone = zoneUnder(qs, { x: e.clientX, y: e.clientY });
        if (!zone) return;
        if (zone.cat === 'tray') { const inItem = itemOfTile(qs, s.id); if (inItem) returnToTray(qs, inItem); }
        else placeInDrop(qs, s.id, zone.cat);
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
      const payload = {
        sessionId: state.sessionId, questionId: q.id,
        selectedSentenceId: qs.selectedSentenceId,
        selectedMap: q.type === 'connect' ? qs.placement : undefined,
        metrics: {
          solveTimeMs: t - qs.startTime,
          firstSelectTimeMs: qs.firstSelectTime ? qs.firstSelectTime - qs.startTime : null,
          wrongAttemptCount: qs.wrongAttemptCount, retryCount: qs.retryCount,
          hoveredOptions: Array.from(qs.hoveredOptions),
          connectionPath: qs.connectionPath,
        },
      };
      let res;
      try { res = await (await fetch(cfg.apiBase + '/attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(); }
      catch (err) { qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.'; qs.feedbackEl.className = 'cpm-feedback cpm-no'; qs.submitEl.disabled = false; return; }

      if (res.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '문장을 잘 읽었어요! 🎉'; qs.feedbackEl.className = 'cpm-feedback cpm-ok';
        if (q.type === 'pick' && qs.choiceEls[qs.selectedSentenceId]) qs.choiceEls[qs.selectedSentenceId].classList.add('cpm-ok');
        if (q.type === 'connect') Object.values(qs.dropEls).forEach((d) => d.classList.add('cpm-ok'));
      } else {
        qs.wrongAttemptCount += 1;
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로! 💪'; qs.feedbackEl.className = 'cpm-feedback cpm-no';
        if (q.type === 'pick' && qs.choiceEls[qs.selectedSentenceId]) qs.choiceEls[qs.selectedSentenceId].classList.add('cpm-no');
        if (q.type === 'connect') Object.values(qs.dropEls).forEach((d) => d.classList.add('cpm-no'));
      }
      if (typeof cfg.onProgress === 'function') cfg.onProgress({ index: state.index, total: state.questions.length, correct: res.correct, totalCorrect: state.totalCorrect, stage: q.stage, result: res.result });
      setTimeout(() => { state.index += 1; renderQuestion(); }, 850);
    }

    async function finish() {
      root.innerHTML = ''; root.appendChild(el('div', 'cpm-card', '<p class="cpm-hint">채점 중이에요… 🐾</p>'));
      let result;
      try { result = await (await fetch(cfg.apiBase + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })).json(); }
      catch (err) { root.innerHTML = ''; root.appendChild(el('div', 'cpm-card', '<p class="cpm-hint">채점 연결에 실패했어요 😿</p>')); return; }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }
    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cpm-card cpm-done');
      done.appendChild(el('div', 'cpm-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));
      const summary = el('div', 'cpm-stage-summary'); const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cpm-summary-pill' + (r.passed ? '' : ' cpm-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const b = el('button', 'cpm-btn cpm-ghostbtn', '다시 도전하기'); b.onclick = start; done.appendChild(b);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapPictureSentenceMatch = {
    mount(target, opts) {
      const c = typeof target === 'string' ? document.querySelector(target) : target;
      if (!c) throw new Error('CatChapPictureSentenceMatch: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(c, opts);
    },
  };
  global.CatChapPictureSentenceMatch = CatChapPictureSentenceMatch;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapPictureSentenceMatch;
})(typeof window !== 'undefined' ? window : this);
