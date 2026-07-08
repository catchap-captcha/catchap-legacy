/* ============================================================================
 *  CatChap · Word Memory Match CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *    CatChapWordMemoryMatch.mount('#captcha-mount', {
 *      apiBase:'/api/word-memory-match', onProgress, onPass, onFail });
 *  카드를 뒤집어 그림↔단어 짝을 맞춤. 짝 판정은 서버 /match 가 수행(정답 비노출).
 * ========================================================================== */
(function (global) {
  'use strict';
  const now = () => Date.now();
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/word-memory-match', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };
    const root = el('div', 'cmm-root'); container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cmm-card', '<p class="cmm-hint">잠깐만요… 카드를 섞고 있어요 🐱🃏</p>'));
      try {
        const data = await (await fetch(cfg.apiBase + '/start', { method: 'POST' })).json();
        state.sessionId = data.sessionId; state.questions = data.questions; state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cmm-card');
        c.appendChild(el('p', 'cmm-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cmm-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const b = el('button', 'cmm-btn', '다시 시도'); b.onclick = start; c.appendChild(b); root.appendChild(c);
      }
    }

    function colsFor(n) { return n <= 4 ? 2 : (n <= 6 ? 3 : 4); }

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';

      const top = el('div', 'cmm-top');
      top.appendChild(el('span', 'cmm-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cmm-progress'); const fill = el('div', 'cmm-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%'; prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cmm-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cmm-card');
      card.appendChild(el('h3', 'cmm-prompt', q.prompt));
      card.appendChild(el('p', 'cmm-hint', q.hint || ''));

      // 상태 바
      const status = el('div', 'cmm-status');
      const matchPill = el('span', 'cmm-pill', `✅ 맞춘 짝 0 / ${q.pairCount}`);
      status.appendChild(matchPill);
      let timerPill = null;
      if (q.timeLimitMs) { timerPill = el('span', 'cmm-pill cmm-timer', `⏰ ${Math.ceil(q.timeLimitMs / 1000)}초`); status.appendChild(timerPill); }
      card.appendChild(status);

      // 보드
      const board = el('div', 'cmm-board');
      board.style.gridTemplateColumns = `repeat(${colsFor(q.board.length)}, minmax(74px, 1fr))`;
      board.style.maxWidth = colsFor(q.board.length) * 110 + 'px';
      board.style.margin = '0 auto';
      card.appendChild(board);

      const qs = {
        question: q, startTime: now(), finished: false,
        flipped: [], lock: true, // 미리보기 동안 잠금
        matchedCount: 0,
        cardOpenOrder: [], openedCounts: {}, everOpened: new Set(),
        reopenCount: 0, cardOpenCount: 0, memoryAttemptCount: 0,
        wrongPairCount: 0, confusedPairs: [],
        firstOpenTime: null, firstMatchTime: null,
        matchPill, timerPill, tiles: {},
      };

      q.board.forEach((c) => {
        const tile = el('div', 'cmm-tile');
        tile.dataset.id = c.id;
        const inner = el('div', 'cmm-tile-inner');
        const back = el('div', 'cmm-face cmm-back', '❓');
        const front = el('div', 'cmm-face cmm-front');
        front.appendChild(c.type === 'image' ? el('span', 'cmm-emoji', c.value) : el('span', 'cmm-word', c.value));
        inner.appendChild(back); inner.appendChild(front);
        tile.appendChild(inner);
        tile.onclick = () => onFlip(qs, c, tile);
        board.appendChild(tile);
        qs.tiles[c.id] = { tile, card: c };
      });

      // 하단
      const actions = el('div', 'cmm-actions');
      const feedback = el('div', 'cmm-feedback', '');
      const reset = el('button', 'cmm-btn cmm-ghostbtn', '카드 다시 섞기');
      reset.onclick = () => { renderQuestion(); }; // 같은 문제 다시 (retry 성격)
      qs.feedbackEl = feedback;
      actions.appendChild(feedback); actions.appendChild(reset);
      card.appendChild(actions);
      root.appendChild(card);

      // 시작 전 5초간 카드를 보여주고 뒤집기
      startPreview(qs);
    }

    // ── 미리보기: 모든 카드를 잠깐 보여준 뒤 뒤집는다 ──
    function startPreview(qs) {
      const PREVIEW_MS = 5000;
      qs.lock = true;
      Object.values(qs.tiles).forEach(({ tile }) => tile.classList.add('cmm-flipped'));
      let remain = Math.ceil(PREVIEW_MS / 1000);
      const show = () => { qs.feedbackEl.textContent = `👀 카드를 기억하세요! ${remain}초`; qs.feedbackEl.className = 'cmm-feedback'; };
      show();
      qs.previewInterval = setInterval(() => { remain -= 1; if (remain > 0) show(); }, 1000);
      qs.previewTimeout = setTimeout(() => {
        clearInterval(qs.previewInterval);
        Object.values(qs.tiles).forEach(({ tile }) => { if (!tile.classList.contains('cmm-matched')) tile.classList.remove('cmm-flipped'); });
        qs.feedbackEl.textContent = '이제 짝을 찾아보세요! 🔎';
        qs.startTime = now();   // 풀이 시간/타이머는 미리보기 이후부터
        qs.lock = false;
        if (qs.question.timeLimitMs) startTimer(qs);
      }, PREVIEW_MS);
    }

    function startTimer(qs) {
      const end = qs.startTime + qs.question.timeLimitMs;
      qs.timerId = setInterval(() => {
        const remain = end - now();
        if (remain <= 0) {
          qs.timerPill.textContent = '⏰ 0초';
          qs.timerPill.classList.add('cmm-danger');
          clearInterval(qs.timerId);
          submitAttempt(qs, 0);
          return;
        }
        qs.timerPill.textContent = `⏰ ${Math.ceil(remain / 1000)}초`;
        if (remain < 10000) qs.timerPill.classList.add('cmm-danger');
      }, 250);
    }

    function onFlip(qs, cardData, tile) {
      if (qs.lock || qs.finished) return;
      if (tile.classList.contains('cmm-flipped') || tile.classList.contains('cmm-matched')) return;

      const t = now();
      if (qs.firstOpenTime == null) qs.firstOpenTime = t - qs.startTime;
      tile.classList.add('cmm-flipped');
      qs.flipped.push({ cardData, tile });
      qs.cardOpenOrder.push(cardData.id);
      qs.openedCounts[cardData.id] = (qs.openedCounts[cardData.id] || 0) + 1;
      qs.cardOpenCount += 1;
      if (qs.everOpened.has(cardData.id)) qs.reopenCount += 1; else qs.everOpened.add(cardData.id);

      if (qs.flipped.length === 2) checkPair(qs);
    }

    async function checkPair(qs) {
      qs.lock = true;
      qs.memoryAttemptCount += 1;
      const [a, b] = qs.flipped;
      let resp;
      try {
        resp = await (await fetch(cfg.apiBase + '/match', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: state.sessionId, questionId: qs.question.id, cardA: a.cardData.id, cardB: b.cardData.id }),
        })).json();
      } catch (err) { resp = { match: false }; }

      if (resp.match) {
        a.tile.classList.add('cmm-matched'); b.tile.classList.add('cmm-matched');
        a.tile.classList.remove('cmm-flipped'); b.tile.classList.remove('cmm-flipped');
        qs.matchedCount = resp.matchedCount != null ? resp.matchedCount : qs.matchedCount + 1;
        if (qs.firstMatchTime == null) qs.firstMatchTime = now() - qs.startTime;
        qs.matchPill.textContent = `✅ 맞춘 짝 ${qs.matchedCount} / ${qs.question.pairCount}`;
        qs.flipped = []; qs.lock = false;
        if (resp.complete || qs.matchedCount >= qs.question.pairCount) {
          qs.feedbackEl.textContent = '모두 맞췄어요! 🎉'; qs.feedbackEl.className = 'cmm-feedback cmm-ok';
          setTimeout(() => submitAttempt(qs), 500);
        }
      } else {
        qs.wrongPairCount += 1;
        // 4단계: 헷갈린 값 기록
        if (qs.question.stage === 4) qs.confusedPairs.push([a.cardData.value, b.cardData.value]);
        a.tile.classList.add('cmm-wrong'); b.tile.classList.add('cmm-wrong');
        setTimeout(() => {
          a.tile.classList.remove('cmm-flipped', 'cmm-wrong');
          b.tile.classList.remove('cmm-flipped', 'cmm-wrong');
          qs.flipped = []; qs.lock = false;
        }, 850);
      }
    }

    async function submitAttempt(qs, forcedRemaining) {
      if (qs.finished) return;
      qs.finished = true;
      if (qs.timerId) clearInterval(qs.timerId);
      if (qs.previewInterval) clearInterval(qs.previewInterval);
      if (qs.previewTimeout) clearTimeout(qs.previewTimeout);
      const q = qs.question;
      const remainingTimeMs = q.timeLimitMs ? (forcedRemaining != null ? forcedRemaining : Math.max(0, q.timeLimitMs - (now() - qs.startTime))) : null;

      const payload = {
        sessionId: state.sessionId, questionId: q.id,
        metrics: {
          solveTimeMs: now() - qs.startTime,
          cardOpenOrder: qs.cardOpenOrder, cardOpenCount: qs.cardOpenCount,
          reopenCount: qs.reopenCount, memoryAttemptCount: qs.memoryAttemptCount,
          firstOpenTimeMs: qs.firstOpenTime, firstMatchTimeMs: qs.firstMatchTime,
          confusedPairs: qs.confusedPairs, remainingTimeMs,
        },
      };
      let res;
      try { res = await (await fetch(cfg.apiBase + '/attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(); }
      catch (err) { qs.feedbackEl.textContent = '전송에 실패했어요.'; qs.feedbackEl.className = 'cmm-feedback cmm-no'; return; }

      if (res.correct) { state.totalCorrect += 1; qs.feedbackEl.textContent = '통과! 🎉'; qs.feedbackEl.className = 'cmm-feedback cmm-ok'; }
      else { qs.feedbackEl.textContent = `아쉬워요 (${res.matchedCount}/${res.pairCount}) 💪`; qs.feedbackEl.className = 'cmm-feedback cmm-no'; }

      if (typeof cfg.onProgress === 'function') cfg.onProgress({ index: state.index, total: state.questions.length, correct: res.correct, totalCorrect: state.totalCorrect, stage: q.stage });
      setTimeout(() => { state.index += 1; renderQuestion(); }, 950);
    }

    async function finish() {
      root.innerHTML = ''; root.appendChild(el('div', 'cmm-card', '<p class="cmm-hint">채점 중이에요… 🐾</p>'));
      let result;
      try { result = await (await fetch(cfg.apiBase + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })).json(); }
      catch (err) { root.innerHTML = ''; root.appendChild(el('div', 'cmm-card', '<p class="cmm-hint">채점 연결에 실패했어요 😿</p>')); return; }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }
    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cmm-card cmm-done');
      done.appendChild(el('div', 'cmm-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 통과`));
      const summary = el('div', 'cmm-stage-summary'); const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cmm-summary-pill' + (r.passed ? '' : ' cmm-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const b = el('button', 'cmm-btn cmm-ghostbtn', '다시 도전하기'); b.onclick = start; done.appendChild(b);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapWordMemoryMatch = {
    mount(target, opts) {
      const c = typeof target === 'string' ? document.querySelector(target) : target;
      if (!c) throw new Error('CatChapWordMemoryMatch: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(c, opts);
    },
  };
  global.CatChapWordMemoryMatch = CatChapWordMemoryMatch;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapWordMemoryMatch;
})(typeof window !== 'undefined' ? window : this);
