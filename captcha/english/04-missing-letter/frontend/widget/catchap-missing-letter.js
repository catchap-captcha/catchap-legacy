/* ============================================================================
 *  CatChap · Missing Letter CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *    CatChapMissingLetter.mount('#captcha-mount', { apiBase:'/api/missing-letter',
 *      onProgress, onPass, onFail });
 *  빈칸을 탭하거나 보기 알파벳을 탭하면 순서대로 채워지고, 서버가 채점.
 * ========================================================================== */
(function (global) {
  'use strict';
  const now = () => Date.now();
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  function createInstance(container, opts) {
    const cfg = Object.assign({ apiBase: '/api/missing-letter', onProgress: null, onPass: null, onFail: null }, opts || {});
    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0 };
    const root = el('div', 'cml-root'); container.innerHTML = ''; container.appendChild(root);

    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cml-card', '<p class="cml-hint">잠깐만요… 단어를 준비하고 있어요 🐱🔤</p>'));
      try {
        const data = await (await fetch(cfg.apiBase + '/start', { method: 'POST' })).json();
        state.sessionId = data.sessionId; state.questions = data.questions; state.index = 0; state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cml-card');
        c.appendChild(el('p', 'cml-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cml-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const b = el('button', 'cml-btn', '다시 시도'); b.onclick = start; c.appendChild(b); root.appendChild(c);
      }
    }

    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';

      const top = el('div', 'cml-top');
      top.appendChild(el('span', 'cml-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cml-progress'); const fill = el('div', 'cml-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%'; prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cml-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cml-card');
      card.appendChild(el('h3', 'cml-prompt', q.prompt));
      card.appendChild(el('p', 'cml-hint', q.hint || ''));

      if (q.image) card.appendChild(el('div', 'cml-image', q.image));
      else if (q.category) { const t = el('div', 'cml-cat-tag'); t.appendChild(el('span', null, `🏷️ ${q.category} 단어`)); card.appendChild(t); }

      // 문제 상태
      const qs = {
        question: q, startTime: now(), firstSelectTime: null,
        fills: {},        // blankIndex -> letter
        activeBlank: q.blanks[0],
        wrongAttemptCount: 0, retryCount: 0,
        hoveredLetters: new Set(), letterOrder: [],
      };

      // 단어 슬롯
      const wordEl = el('div', 'cml-word');
      qs.slotEls = {};
      for (let i = 0; i < q.length; i++) {
        if (q.masked[i] == null) {
          const slot = el('div', 'cml-slot cml-blank', '');
          slot.dataset.idx = i;
          slot.onclick = () => { if (qs.fills[i] != null) clearBlank(qs, i); else setActive(qs, i); };
          wordEl.appendChild(slot); qs.slotEls[i] = slot;
        } else {
          wordEl.appendChild(el('div', 'cml-slot cml-fixed', q.masked[i]));
        }
      }
      card.appendChild(wordEl);
      setActive(qs, q.blanks[0]);

      // 보기
      const opts = el('div', 'cml-options');
      qs.optEls = [];
      q.options.forEach((letter, oi) => {
        const o = el('div', 'cml-opt', letter);
        o.dataset.oi = oi;
        o.addEventListener('mouseenter', () => qs.hoveredLetters.add(letter));
        o.onclick = () => fillNext(qs, letter, o);
        opts.appendChild(o); qs.optEls.push(o);
      });
      card.appendChild(opts);

      // 하단
      const actions = el('div', 'cml-actions');
      const feedback = el('div', 'cml-feedback', '');
      const btns = el('div', 'cml-btns');
      const clearBtn = el('button', 'cml-btn cml-ghostbtn', '지우기');
      const submit = el('button', 'cml-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback; qs.submitEl = submit;
      qs.refreshSubmit = () => { submit.disabled = q.blanks.some((b) => qs.fills[b] == null); };
      clearBtn.onclick = () => { qs.retryCount += 1; clearAll(qs); };
      submit.onclick = () => onSubmit(q, qs);
      btns.appendChild(clearBtn); btns.appendChild(submit);
      actions.appendChild(feedback); actions.appendChild(btns);
      card.appendChild(actions);
      root.appendChild(card);
    }

    function setActive(qs, idx) {
      qs.activeBlank = idx;
      for (const b of qs.question.blanks) {
        const s = qs.slotEls[b];
        s.classList.toggle('cml-active', b === idx && qs.fills[b] == null);
      }
    }
    function nextEmptyBlank(qs) { return qs.question.blanks.find((b) => qs.fills[b] == null); }

    function fillNext(qs, letter, optEl) {
      if (!qs.firstSelectTime) qs.firstSelectTime = now();
      const target = qs.fills[qs.activeBlank] == null ? qs.activeBlank : nextEmptyBlank(qs);
      if (target == null) return; // 다 참
      qs.fills[target] = letter;
      qs.letterOrder.push({ blank: target, letter, t: now() - qs.startTime });
      const slot = qs.slotEls[target];
      slot.textContent = letter; slot.classList.add('cml-filled'); slot.classList.remove('cml-active');
      const nb = nextEmptyBlank(qs);
      if (nb != null) setActive(qs, nb);
      refreshOptUsage(qs);
      qs.refreshSubmit();
    }
    function clearBlank(qs, idx) {
      qs.fills[idx] = null;
      const slot = qs.slotEls[idx]; slot.textContent = ''; slot.classList.remove('cml-filled', 'cml-ok', 'cml-no');
      setActive(qs, idx); refreshOptUsage(qs); qs.refreshSubmit();
    }
    function clearAll(qs) {
      for (const b of qs.question.blanks) { qs.fills[b] = null; const s = qs.slotEls[b]; s.textContent = ''; s.classList.remove('cml-filled', 'cml-ok', 'cml-no'); }
      qs.feedbackEl.textContent = ''; qs.feedbackEl.className = 'cml-feedback';
      setActive(qs, qs.question.blanks[0]); refreshOptUsage(qs); qs.refreshSubmit();
    }
    // 4단계 중복 옵션(o,o)을 고려해 사용량 표시
    function refreshOptUsage(qs) {
      const used = {};
      for (const b of qs.question.blanks) { const l = qs.fills[b]; if (l != null) used[l] = (used[l] || 0) + 1; }
      const seen = {};
      qs.optEls.forEach((o) => {
        const l = o.textContent; seen[l] = (seen[l] || 0) + 1;
        o.classList.toggle('cml-used', (used[l] || 0) >= seen[l]);
      });
    }

    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const selectedLetters = q.blanks.map((b) => qs.fills[b]);
      const t = now();
      const payload = {
        sessionId: state.sessionId, questionId: q.id, selectedLetters,
        metrics: {
          solveTimeMs: t - qs.startTime,
          firstSelectTimeMs: qs.firstSelectTime ? qs.firstSelectTime - qs.startTime : null,
          hesitationTimeMs: qs.firstSelectTime ? qs.firstSelectTime - qs.startTime : null,
          wrongAttemptCount: qs.wrongAttemptCount, retryCount: qs.retryCount,
          hoveredLetters: Array.from(qs.hoveredLetters), letterOrder: qs.letterOrder,
        },
      };
      let result;
      try { result = await (await fetch(cfg.apiBase + '/attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(); }
      catch (err) { qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.'; qs.feedbackEl.className = 'cml-feedback cml-no'; qs.submitEl.disabled = false; return; }

      if (result.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '잘했어요! 🎉'; qs.feedbackEl.className = 'cml-feedback cml-ok';
        q.blanks.forEach((b) => qs.slotEls[b].classList.add('cml-ok'));
      } else {
        qs.wrongAttemptCount += 1;
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로! 💪'; qs.feedbackEl.className = 'cml-feedback cml-no';
        q.blanks.forEach((b) => qs.slotEls[b].classList.add('cml-no'));
      }
      if (typeof cfg.onProgress === 'function') cfg.onProgress({ index: state.index, total: state.questions.length, correct: result.correct, totalCorrect: state.totalCorrect, stage: q.stage });
      setTimeout(() => { state.index += 1; renderQuestion(); }, 800);
    }

    async function finish() {
      root.innerHTML = ''; root.appendChild(el('div', 'cml-card', '<p class="cml-hint">채점 중이에요… 🐾</p>'));
      let result;
      try { result = await (await fetch(cfg.apiBase + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })).json(); }
      catch (err) { root.innerHTML = ''; root.appendChild(el('div', 'cml-card', '<p class="cml-hint">채점 연결에 실패했어요 😿</p>')); return; }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }
    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cml-card cml-done');
      done.appendChild(el('div', 'cml-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));
      const summary = el('div', 'cml-stage-summary'); const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) { const r = sr[s]; if (!r) continue; summary.appendChild(el('span', 'cml-summary-pill' + (r.passed ? '' : ' cml-fail'), `${s}단계 ${r.correct}/${r.answered}`)); }
      done.appendChild(summary);
      const b = el('button', 'cml-btn cml-ghostbtn', '다시 도전하기'); b.onclick = start; done.appendChild(b);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapMissingLetter = {
    mount(target, opts) {
      const c = typeof target === 'string' ? document.querySelector(target) : target;
      if (!c) throw new Error('CatChapMissingLetter: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(c, opts);
    },
  };
  global.CatChapMissingLetter = CatChapMissingLetter;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapMissingLetter;
})(typeof window !== 'undefined' ? window : this);
