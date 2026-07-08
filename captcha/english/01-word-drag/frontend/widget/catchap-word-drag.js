/* ============================================================================
 *  CatChap · Word Drag CAPTCHA — 위젯 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *  사용법:
 *    <link rel="stylesheet" href="widget/catchap-word-drag.css">
 *    <script src="widget/catchap-word-drag.js"></script>
 *    <script>
 *      CatChapWordDrag.mount('#captcha-mount', {
 *        apiBase: '/api/word-drag',        // 백엔드 주소
 *        onProgress: (info) => { ... },    // 매 문제 채점 후 콜백
 *        onPass: (result) => { ... },      // 통과(토큰 발급)
 *        onFail: (result) => { ... },      // 실패
 *      });
 *    </script>
 *
 *  마우스/터치(태블릿) 모두 지원. 드래그로 놓거나, 탭해서 선택하는 것도 가능.
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
      { apiBase: '/api/word-drag', onProgress: null, onPass: null, onFail: null },
      opts || {}
    );

    const state = {
      sessionId: null,
      questions: [],
      index: 0,
      totalCorrect: 0,
      cfg,
    };

    const root = el('div', 'cwd-root');
    container.innerHTML = '';
    container.appendChild(root);

    // ── 부팅: 세션 시작 ──
    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cwd-card', '<p class="cwd-hint">잠깐만요… 문제를 준비하고 있어요 🐱</p>'));
      try {
        const res = await fetch(cfg.apiBase + '/start', { method: 'POST' });
        const data = await res.json();
        state.sessionId = data.sessionId;
        state.questions = data.questions;
        state.index = 0;
        state.totalCorrect = 0;
        renderQuestion();
      } catch (err) {
        root.innerHTML = '';
        const c = el('div', 'cwd-card');
        c.appendChild(el('p', 'cwd-prompt', '앗, 연결에 문제가 생겼어요 😿'));
        c.appendChild(el('p', 'cwd-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const btn = el('button', 'cwd-btn', '다시 시도');
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

      // 상단 진행 바
      const top = el('div', 'cwd-top');
      top.appendChild(el('span', 'cwd-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'cwd-progress');
      const fill = el('div', 'cwd-progress-fill');
      fill.style.width = ((state.index) / state.questions.length) * 100 + '%';
      prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'cwd-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'cwd-card');
      card.appendChild(el('h3', 'cwd-prompt', q.prompt));
      card.appendChild(el('p', 'cwd-hint', q.hint || ''));

      // 문제별 상태 (행동 데이터 수집용)
      const qs = {
        question: q,
        startTime: now(),
        dragPath: [],
        dragDistance: 0,
        hoverTimeMs: 0,
        hoveredWords: new Set(),
        wrongAttemptCount: 0,
        regrabCount: 0,
        firstSelectedWord: null,
        selectionOrder: [],
        dragOrder: [],
        firstTargetSelected: null,
        timePerMatch: {},
        matchStart: now(),
        // 유형별 현재 답
        selectedWord: null,       // single
        matches: {},              // multi  { slot: word }
        selectedWords: [],        // category
      };

      if (q.type === 'single') buildSingle(card, q, qs);
      else if (q.type === 'multi') buildMulti(card, q, qs);
      else if (q.type === 'category') buildCategory(card, q, qs);

      // 하단 액션
      const actions = el('div', 'cwd-actions');
      const feedback = el('div', 'cwd-feedback', '');
      const submit = el('button', 'cwd-btn', state.index === state.questions.length - 1 ? '제출하기' : '다음 문제 →');
      submit.disabled = true;
      qs.feedbackEl = feedback;
      qs.submitEl = submit;
      qs.refreshSubmit = () => { submit.disabled = !isAnswerReady(q, qs); };

      submit.onclick = () => onSubmit(q, qs);
      actions.appendChild(feedback);
      actions.appendChild(submit);
      card.appendChild(actions);

      root.appendChild(card);
    }

    function isAnswerReady(q, qs) {
      if (q.type === 'single') return !!qs.selectedWord;
      if (q.type === 'multi') return Object.keys(qs.matches).length === q.targets.length;
      if (q.type === 'category') return qs.selectedWords.length > 0;
      return false;
    }

    // ── 1~3단계: 그림 1개 + 정답 1개 ──
    function buildSingle(card, q, qs) {
      const pics = el('div', 'cwd-pics');
      const pic = el('div', 'cwd-pic');
      pic.appendChild(el('div', 'cwd-emoji', q.images[0]));
      const label = el('div', 'cwd-slot-label', '');
      pic.appendChild(label);
      pics.appendChild(pic);
      card.appendChild(pics);

      const words = el('div', 'cwd-words');
      q.options.forEach((w) => words.appendChild(makeChip(w, qs)));
      card.appendChild(words);

      registerDropZone(pic, qs, (word, chip) => {
        // 이전 선택 되돌리기
        releaseChip(qs);
        qs.selectedWord = word;
        label.textContent = word;
        chip.classList.add('cwd-placed');
        qs.placedChip = chip;
        pic.classList.add('cwd-slot-filled');
        recordSelect(qs, word);
        qs.refreshSubmit();
      });
    }

    // ── 4단계: 여러 그림 각각 매칭 ──
    function buildMulti(card, q, qs) {
      const pics = el('div', 'cwd-pics');
      const slotEls = {};
      q.targets.forEach((t) => {
        const pic = el('div', 'cwd-pic');
        pic.dataset.slot = t.slot;
        pic.appendChild(el('div', 'cwd-emoji', t.image));
        const label = el('div', 'cwd-slot-label', '');
        pic.appendChild(label);
        pics.appendChild(pic);
        slotEls[t.slot] = { pic, label };

        registerDropZone(pic, qs, (word, chip) => {
          // 같은 단어가 다른 슬롯에 있었다면 제거
          for (const s of Object.keys(qs.matches)) {
            if (qs.matches[s] === word) {
              delete qs.matches[s];
              slotEls[s].label.textContent = '';
              slotEls[s].pic.classList.remove('cwd-slot-filled');
            }
          }
          // 이 슬롯에 이미 있던 칩 되돌리기
          if (qs.matches[t.slot]) {
            const prev = qs.chipMap[qs.matches[t.slot]];
            if (prev) prev.classList.remove('cwd-placed');
          }
          qs.matches[t.slot] = word;
          label.textContent = word;
          pic.classList.add('cwd-slot-filled');
          chip.classList.add('cwd-placed');
          if (!qs.firstTargetSelected) qs.firstTargetSelected = t.slot;
          if (!qs.dragOrder.includes(t.slot)) qs.dragOrder.push(t.slot);
          qs.timePerMatch[t.slot] = now() - qs.matchStart;
          recordSelect(qs, word);
          qs.refreshSubmit();
        });
      });
      card.appendChild(pics);

      const words = el('div', 'cwd-words');
      qs.chipMap = {};
      q.options.forEach((w) => {
        const chip = makeChip(w, qs);
        qs.chipMap[w] = chip;
        words.appendChild(chip);
      });
      card.appendChild(words);
    }

    // ── 5단계: 카테고리 상자 ──
    function buildCategory(card, q, qs) {
      if (q.category) card.appendChild(el('div', 'cwd-cat-tag', `🏷️ ${q.category} 단어만 담기`));

      const basket = el('div', 'cwd-basket');
      const empty = el('div', 'cwd-basket-empty', '여기로 단어를 끌어다 놓아요');
      basket.appendChild(empty);
      card.appendChild(basket);

      const words = el('div', 'cwd-words');
      qs.chipMap = {};
      q.options.forEach((w) => {
        const chip = makeChip(w, qs);
        qs.chipMap[w] = chip;
        words.appendChild(chip);
      });
      card.appendChild(words);

      registerDropZone(basket, qs, (word, chip) => {
        if (qs.selectedWords.includes(word)) return;
        qs.selectedWords.push(word);
        qs.selectionOrder.push({ word, t: now() - qs.startTime });
        empty.style.display = 'none';
        // 상자 안 칩 (클릭하면 도로 빼기)
        const inBasket = el('span', 'cwd-chip cwd-selected', word);
        inBasket.style.cursor = 'pointer';
        inBasket.title = '빼려면 누르세요';
        inBasket.onclick = () => {
          qs.selectedWords = qs.selectedWords.filter((x) => x !== word);
          inBasket.remove();
          chip.classList.remove('cwd-placed');
          if (qs.selectedWords.length === 0) empty.style.display = '';
          qs.refreshSubmit();
        };
        basket.appendChild(inBasket);
        chip.classList.add('cwd-placed');
        recordSelect(qs, word);
        qs.refreshSubmit();
      });
    }

    // ── 단어 칩 생성 + 드래그 소스 등록 ──
    function makeChip(word, qs) {
      const chip = el('div', 'cwd-chip', word);
      chip.dataset.word = word;
      attachDrag(chip, qs);
      return chip;
    }

    function recordSelect(qs, word) {
      if (!qs.firstSelectedWord) qs.firstSelectedWord = word;
    }

    function releaseChip(qs) {
      if (qs.placedChip) {
        qs.placedChip.classList.remove('cwd-placed');
        qs.placedChip = null;
      }
    }

    // ── 드롭존 관리 (드래그·탭 공통) ──
    const dropZones = [];
    function registerDropZone(node, qs, onDrop) {
      dropZones.push({ node, qs, onDrop });
      // (드래그 전용) 탭으로 답 칸에 넣는 기능은 제거 — 오직 드래그로만 이동
    }
    function zonesFor(qs) { return dropZones.filter((z) => z.qs === qs); }

    // ── 포인터 드래그 (마우스+터치 통합) ──
    function attachDrag(chip, qs) {
      let ghost = null;
      let dragging = false;
      let lastPt = null;
      let grabbed = false;

      const onDown = (e) => {
        if (chip.classList.contains('cwd-placed')) return;
        e.preventDefault();
        grabbed = true;
        dragging = false;
        const p = point(e);
        lastPt = p;
        qs.dragStartTime = now();
        chip.setPointerCapture && chip.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };

      const onMove = (e) => {
        if (!grabbed) return;
        const p = point(e);
        if (!dragging) {
          // 살짝 움직여야 드래그로 판정 (탭과 구분)
          if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) < 6) return;
          dragging = true;
          chip.classList.add('cwd-dragging');
          ghost = el('div', 'cwd-ghost', chip.dataset.word);
          document.body.appendChild(ghost);
          qs.hoveredWords.add(chip.dataset.word);
        }
        qs.dragDistance += Math.hypot(p.x - lastPt.x, p.y - lastPt.y);
        qs.dragPath.push({ x: Math.round(p.x), y: Math.round(p.y), t: now() - qs.startTime });
        lastPt = p;
        ghost.style.left = p.x + 'px';
        ghost.style.top = p.y + 'px';
        highlightZoneUnder(qs, p);
      };

      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false;
        chip.classList.remove('cwd-dragging');
        if (ghost) { ghost.remove(); ghost = null; }

        if (!dragging) {
          // 탭만 한 경우 아무 동작 안 함 (드래그로만 이동 가능)
          return;
        }
        qs.dragEndTime = now();
        clearZoneHot(qs);
        const p = point(e);
        const zone = zoneUnder(qs, p);
        if (zone) {
          zone.onDrop(chip.dataset.word, chip);
        } else {
          qs.regrabCount += 1; // 목표 밖에 떨어뜨림
        }
      };

      chip.addEventListener('pointerdown', onDown);
    }

    function togglePick(chip, qs) {
      if (qs.pendingChip === chip) {
        chip.classList.remove('cwd-selected');
        qs.pendingChip = null;
      } else {
        if (qs.pendingChip) qs.pendingChip.classList.remove('cwd-selected');
        chip.classList.add('cwd-selected');
        qs.pendingChip = chip;
      }
    }

    function highlightZoneUnder(qs, p) {
      clearZoneHot(qs);
      const z = zoneUnder(qs, p);
      if (z) z.node.classList.add('cwd-drop-hot');
    }
    function clearZoneHot(qs) {
      zonesFor(qs).forEach((z) => z.node.classList.remove('cwd-drop-hot'));
    }
    function zoneUnder(qs, p) {
      return zonesFor(qs).find((z) => {
        const r = z.node.getBoundingClientRect();
        return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
      });
    }
    function point(e) {
      return { x: e.clientX, y: e.clientY };
    }

    // ── 제출 → 채점 ──
    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const solveTimeMs = now() - qs.startTime;

      const payload = {
        sessionId: state.sessionId,
        questionId: q.id,
        selectedWord: qs.selectedWord,
        matches: qs.matches,
        selectedWords: qs.selectedWords,
        metrics: {
          solveTimeMs,
          dragStartTime: qs.dragStartTime || null,
          dragEndTime: qs.dragEndTime || null,
          dragDistance: Math.round(qs.dragDistance),
          hoverTimeMs: qs.hoverTimeMs,
          dragPath: qs.dragPath.slice(0, 500),
          hoveredWords: Array.from(qs.hoveredWords),
          wrongAttemptCount: qs.wrongAttemptCount,
          regrabCount: qs.regrabCount,
          firstSelectedWord: qs.firstSelectedWord,
          selectionOrder: qs.selectionOrder,
          dragOrder: qs.dragOrder,
          firstTargetSelected: qs.firstTargetSelected,
          timePerMatch: qs.timePerMatch,
          retryCount: qs.regrabCount,
        },
      };

      let result;
      try {
        const res = await fetch(cfg.apiBase + '/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      } catch (err) {
        qs.feedbackEl.textContent = '전송에 실패했어요. 다시 눌러주세요.';
        qs.feedbackEl.className = 'cwd-feedback cwd-no';
        qs.submitEl.disabled = false;
        return;
      }

      if (result.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = '잘했어요! 🎉';
        qs.feedbackEl.className = 'cwd-feedback cwd-ok';
      } else {
        qs.feedbackEl.textContent = '아쉬워요, 다음 문제로 가볼까요? 💪';
        qs.feedbackEl.className = 'cwd-feedback cwd-no';
      }

      if (typeof cfg.onProgress === 'function') {
        cfg.onProgress({
          index: state.index,
          total: state.questions.length,
          correct: result.correct,
          totalCorrect: state.totalCorrect,
          stage: q.stage,
        });
      }

      // 잠깐 피드백 보여준 뒤 다음 문제
      setTimeout(() => {
        state.index += 1;
        renderQuestion();
      }, 750);
    }

    // ── 전체 종료 → 검증 ──
    async function finish() {
      root.innerHTML = '';
      root.appendChild(el('div', 'cwd-card', '<p class="cwd-hint">채점 중이에요… 🐾</p>'));
      let result;
      try {
        const res = await fetch(cfg.apiBase + '/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: state.sessionId }),
        });
        result = await res.json();
      } catch (err) {
        root.innerHTML = '';
        root.appendChild(el('div', 'cwd-card', '<p class="cwd-hint">채점 연결에 실패했어요 😿</p>'));
        return;
      }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }

    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'cwd-card cwd-done');
      done.appendChild(el('div', 'cwd-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 사람인 게 확인됐어요' : '조금 더 도전해볼까요?'));
      done.appendChild(
        el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`)
      );

      const summary = el('div', 'cwd-stage-summary');
      const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) {
        const r = sr[s];
        if (!r) continue;
        const pill = el('span', 'cwd-summary-pill' + (r.passed ? '' : ' cwd-fail'),
          `${s}단계 ${r.correct}/${r.answered}`);
        summary.appendChild(pill);
      }
      done.appendChild(summary);

      const btn = el('button', 'cwd-btn cwd-ghostbtn', '다시 도전하기');
      btn.onclick = start;
      done.appendChild(btn);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapWordDrag = {
    mount(target, opts) {
      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (!container) throw new Error('CatChapWordDrag: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(container, opts);
    },
  };

  global.CatChapWordDrag = CatChapWordDrag;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapWordDrag;
})(typeof window !== 'undefined' ? window : this);
