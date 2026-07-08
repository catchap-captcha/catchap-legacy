/* ============================================================================
 *  CatChap · Sound Match CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *  사용법:
 *    <link rel="stylesheet" href="widget/catchap-sound-match.css">
 *    <script src="widget/catchap-sound-match.js"></script>
 *    <script>
 *      CatChapSoundMatch.mount('#captcha-mount', {
 *        apiBase: '/api/sound-match',
 *        onProgress: (info) => {}, onPass: (r) => {}, onFail: (r) => {},
 *      });
 *    </script>
 *
 *  오디오:  <audioBase>/<word>.m4a 파일을 재생. 파일이 없으면
 *          브라우저 SpeechSynthesis(영어 TTS)로 자동 폴백.
 * ========================================================================== */
(function (global) {
  'use strict';

  const now = () => Date.now();
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  function createInstance(container, opts) {
    const cfg = Object.assign(
      { apiBase: '/api/sound-match', audioBase: '/assets/audio', onProgress: null, onPass: null, onFail: null },
      opts || {}
    );

    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0, audioBase: cfg.audioBase };

    const root = el('div', 'csm-root');
    container.innerHTML = '';
    container.appendChild(root);

    // ── 오디오 재생 (파일 → 실패 시 TTS 폴백) ──
    function playWord(word) {
      return new Promise((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        try {
          const audio = new Audio(state.audioBase + '/' + encodeURIComponent(word) + '.m4a');
          audio.onended = finish;
          audio.onerror = () => speak(word, finish);
          const p = audio.play();
          if (p && p.catch) p.catch(() => speak(word, finish));
        } catch (_) {
          speak(word, finish);
        }
      });
    }
    function speak(word, cb) {
      try {
        if (!('speechSynthesis' in global)) return cb();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        u.rate = 0.85;
        u.onend = cb;
        u.onerror = cb;
        global.speechSynthesis.cancel();
        global.speechSynthesis.speak(u);
      } catch (_) { cb(); }
    }
    async function playSequence(words, onStep) {
      for (let i = 0; i < words.length; i++) {
        if (onStep) onStep(i);
        await playWord(words[i]);
        await new Promise((r) => setTimeout(r, 350));
      }
      if (onStep) onStep(-1);
    }

    // ── 부팅 ──
    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'csm-card', '<p class="csm-hint">잠깐만요… 소리를 준비하고 있어요 🐱🔊</p>'));
      try {
        const res = await fetch(cfg.apiBase + '/start', { method: 'POST' });
        const data = await res.json();
        state.sessionId = data.sessionId;
        state.questions = data.questions;
        if (data.audioBase) state.audioBase = data.audioBase;
        state.index = 0;
        state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'csm-card');
        c.appendChild(el('p', 'csm-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'csm-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const btn = el('button', 'csm-btn', '다시 시도');
        btn.onclick = start;
        c.appendChild(btn);
        root.appendChild(c);
      }
    }

    // ── 문제 렌더 ──
    function renderQuestion() {
      const q = state.questions[state.index];
      if (!q) return finish();
      root.innerHTML = '';

      const top = el('div', 'csm-top');
      top.appendChild(el('span', 'csm-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'csm-progress');
      const fill = el('div', 'csm-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%';
      prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'csm-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'csm-card');
      card.appendChild(el('h3', 'csm-prompt', q.prompt));
      card.appendChild(el('p', 'csm-hint', q.hint || ''));

      // 문제별 상태 (행동 데이터)
      const qs = {
        question: q,
        startTime: now(),
        audioPlayCount: 0,
        lastAudioEnd: null,
        firstSelectTime: null,
        wrongAttemptCount: 0,
        hoveredOptions: new Set(),
        maxAudioPlayReached: false,
        // 답
        selectedWord: null,
        selectedImageId: null,
        selectedSequence: [],   // sequence
        selectionOrder: [],
        timePerSelection: [],
        lastSelectTime: now(),
      };

      const isSeq = q.type === 'sequence';
      const words = isSeq ? q.audioSequence : [q.audioWord];

      // 오디오 영역
      const aw = el('div', 'csm-audio-wrap');
      const play = el('button', 'csm-play', '🔊');
      const info = el('div', 'csm-audio-info', isSeq ? `단어 ${words.length}개를 들려줄게요` : '버튼을 눌러 소리를 들어요');
      aw.appendChild(play);
      // 시퀀스 진행 점
      let dots = null;
      if (isSeq) {
        dots = el('div', 'csm-seq-dots');
        words.forEach(() => dots.appendChild(el('span', 'csm-seq-dot')));
        aw.appendChild(dots);
      }
      aw.appendChild(info);
      card.appendChild(aw);

      const maxPlays = q.maxAudioPlays || Infinity;
      play.onclick = async () => {
        if (qs.audioPlayCount >= maxPlays) return;
        qs.audioPlayCount += 1;
        play.classList.add('csm-playing');
        play.disabled = true;
        if (isSeq) {
          await playSequence(words, (i) => {
            dots.querySelectorAll('.csm-seq-dot').forEach((d, di) => d.classList.toggle('csm-on', di === i));
          });
        } else {
          await playWord(words[0]);
        }
        qs.lastAudioEnd = now();
        play.classList.remove('csm-playing');
        if (qs.audioPlayCount >= maxPlays) {
          qs.maxAudioPlayReached = true;
          play.disabled = true;
          info.textContent = '오디오를 모두 사용했어요. 그림을 골라요!';
        } else {
          play.disabled = false;
          info.textContent = q.maxAudioPlays
            ? `다시 듣기 ${maxPlays - qs.audioPlayCount}회 남음`
            : '한 번 더 듣고 싶으면 눌러요';
        }
      };

      // 보기 그리드
      const grid = el('div', 'csm-options' + (q.options.length > 2 ? ' csm-cols-4' : ''));
      qs.optEls = {};
      q.options.forEach((o) => {
        const opt = el('div', 'csm-opt');
        opt.dataset.word = o.word;
        opt.dataset.id = o.id;
        opt.appendChild(el('div', 'csm-emoji', o.image));
        if (q.showLabel) opt.appendChild(el('div', 'csm-label', o.word));
        opt.addEventListener('mouseenter', () => qs.hoveredOptions.add(o.word));
        opt.onclick = () => onPick(q, qs, o, opt);
        grid.appendChild(opt);
        qs.optEls[o.id] = opt;
      });
      card.appendChild(grid);

      // 하단 액션
      const actions = el('div', 'csm-actions');
      const left = el('div', null);
      if (isSeq) {
        const reset = el('button', 'csm-reset', '순서 다시 고르기');
        reset.onclick = () => resetSeq(q, qs);
        left.appendChild(reset);
      }
      const feedback = el('div', 'csm-feedback', '');
      const submit = el('button', 'csm-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback;
      qs.submitEl = submit;
      qs.refreshSubmit = () => { submit.disabled = !isAnswerReady(q, qs); };
      submit.onclick = () => onSubmit(q, qs);

      const leftWrap = el('div', null);
      leftWrap.style.display = 'flex';
      leftWrap.style.flexDirection = 'column';
      leftWrap.appendChild(feedback);
      if (isSeq) leftWrap.appendChild(left);
      actions.appendChild(leftWrap);
      actions.appendChild(submit);
      card.appendChild(actions);

      root.appendChild(card);

      // 문제 시작 시 자동으로 한 번 들려주기
      setTimeout(() => play.click(), 350);
    }

    function isAnswerReady(q, qs) {
      if (q.type === 'sequence') return qs.selectedSequence.length === q.audioSequence.length;
      return !!qs.selectedWord;
    }

    // 단일 선택 / 시퀀스 선택
    function onPick(q, qs, o, opt) {
      const t = now();
      if (qs.firstSelectTime == null) qs.firstSelectTime = t;

      if (q.type === 'sequence') {
        if (opt.classList.contains('csm-picked')) return; // 이미 고른 그림
        const orderNum = qs.selectedSequence.length + 1;
        qs.selectedSequence.push(o.word);
        qs.selectionOrder.push({ word: o.word, order: orderNum, t: t - qs.startTime });
        qs.timePerSelection.push(t - qs.lastSelectTime);
        qs.lastSelectTime = t;
        opt.classList.add('csm-picked', 'csm-selected');
        const badge = el('span', 'csm-order-badge', String(orderNum));
        opt.appendChild(badge);
      } else {
        // 단일: 이전 선택 해제
        if (qs.selectedImageId && qs.optEls[qs.selectedImageId]) {
          qs.optEls[qs.selectedImageId].classList.remove('csm-selected');
        }
        if (qs.selectedWord && qs.selectedWord !== o.word) qs.wrongAttemptCount += 0; // 재선택은 오답아님
        qs.selectedWord = o.word;
        qs.selectedImageId = o.id;
        opt.classList.add('csm-selected');
      }
      qs.refreshSubmit();
    }

    function resetSeq(q, qs) {
      qs.selectedSequence = [];
      qs.selectionOrder = [];
      qs.timePerSelection = [];
      qs.lastSelectTime = now();
      Object.values(qs.optEls).forEach((opt) => {
        opt.classList.remove('csm-picked', 'csm-selected');
        const b = opt.querySelector('.csm-order-badge');
        if (b) b.remove();
      });
      qs.refreshSubmit();
    }

    // ── 제출 ──
    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const t = now();
      const solveTimeMs = t - qs.startTime;

      const payload = {
        sessionId: state.sessionId,
        questionId: q.id,
        selectedWord: qs.selectedWord,
        selectedImageId: qs.selectedImageId,
        selectedSequence: qs.selectedSequence,
        metrics: {
          solveTimeMs,
          audioPlayCount: qs.audioPlayCount,
          timeAfterAudioMs: qs.lastAudioEnd ? t - qs.lastAudioEnd : null,
          firstSelectTimeMs: qs.firstSelectTime ? qs.firstSelectTime - qs.startTime : null,
          hesitationTimeMs: qs.firstSelectTime && qs.lastAudioEnd ? qs.firstSelectTime - qs.lastAudioEnd : null,
          wrongAttemptCount: qs.wrongAttemptCount,
          hoveredOptions: Array.from(qs.hoveredOptions),
          maxAudioPlayReached: qs.maxAudioPlayReached,
          firstSelectedImage: qs.selectionOrder[0] ? qs.selectionOrder[0].word : qs.selectedWord,
          selectionOrder: qs.selectionOrder,
          timePerSelection: qs.timePerSelection,
          retryCount: 0,
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
        qs.feedbackEl.className = 'csm-feedback csm-no';
        qs.submitEl.disabled = false;
        return;
      }

      if (result.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '잘 들었어요! 🎉';
        qs.feedbackEl.className = 'csm-feedback csm-ok';
      } else {
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로! 💪';
        qs.feedbackEl.className = 'csm-feedback csm-no';
      }

      if (typeof cfg.onProgress === 'function') {
        cfg.onProgress({ index: state.index, total: state.questions.length, correct: result.correct, totalCorrect: state.totalCorrect, stage: q.stage });
      }

      setTimeout(() => { state.index += 1; renderQuestion(); }, 750);
    }

    // ── 종료 → 검증 ──
    async function finish() {
      root.innerHTML = '';
      root.appendChild(el('div', 'csm-card', '<p class="csm-hint">채점 중이에요… 🐾</p>'));
      let result;
      try {
        const res = await fetch(cfg.apiBase + '/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }),
        });
        result = await res.json();
      } catch (err) {
        root.innerHTML = '';
        root.appendChild(el('div', 'csm-card', '<p class="csm-hint">채점 연결에 실패했어요 😿</p>'));
        return;
      }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }

    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'csm-card csm-done');
      done.appendChild(el('div', 'csm-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));

      const summary = el('div', 'csm-stage-summary');
      const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) {
        const r = sr[s];
        if (!r) continue;
        summary.appendChild(el('span', 'csm-summary-pill' + (r.passed ? '' : ' csm-fail'), `${s}단계 ${r.correct}/${r.answered}`));
      }
      done.appendChild(summary);

      const btn = el('button', 'csm-btn csm-ghostbtn', '다시 도전하기');
      btn.onclick = start;
      done.appendChild(btn);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapSoundMatch = {
    mount(target, opts) {
      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (!container) throw new Error('CatChapSoundMatch: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(container, opts);
    },
  };

  global.CatChapSoundMatch = CatChapSoundMatch;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapSoundMatch;
})(typeof window !== 'undefined' ? window : this);
