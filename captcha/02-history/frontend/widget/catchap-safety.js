/* ============================================================================
 *  CatChap · 생활안전 캡챠 공통 위젯 엔진 (Vanilla JS, 의존성 없음)
 * ----------------------------------------------------------------------------
 *  교통/화재/손씻기/우리집안전/긴급번호 5종이 이 엔진 하나를 공유한다.
 *  각 캡챠 폴더의 frontend/widget/ 아래로 그대로 복사되어 들어간다(자기완결형).
 *
 *  지원하는 문제 유형(type):
 *    'single'   보기 중 하나 선택(탭)                안전/위험 행동, 상황 판단
 *    'order'    카드를 순서대로 배열(탭)              길 건너기·대피·손씻기 순서
 *    'connect'  왼쪽 항목 ↔ 오른쪽 항목 연결(탭)      행동-이유 연결
 *    'pick'     아이템을 상자 하나로 드래그해 담기      위험 물건 치우기·모두 찾기
 *    'sort'     아이템을 여러 상자로 분류 드래그        안전/위험 구분, 112/119 분류
 *
 *  사용법:
 *    <link rel="stylesheet" href="widget/catchap-safety.css">
 *    <script src="widget/catchap-safety.js"></script>
 *    <script>
 *      CatChapSafety.mount('#captcha-mount', {
 *        apiBase: '/api/home-safety',
 *        onProgress: (info) => { ... },
 *        onPass: (result) => { ... },
 *        onFail: (result) => { ... },
 *      });
 *    </script>
 *
 *  드래그는 마우스/터치 통합(pointer). 드래그가 어려우면 "탭 → 상자 탭"으로도 담긴다.
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
  // 정답이 카드/보기 순서로 새어나가지 않도록 클라이언트에서 섞는다.
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createInstance(container, opts) {
    const cfg = Object.assign(
      { apiBase: '/api/home-safety', onProgress: null, onPass: null, onFail: null },
      opts || {}
    );

    const state = { sessionId: null, questions: [], index: 0, totalCorrect: 0, cfg };

    const root = el('div', 'csl-root');
    container.innerHTML = '';
    container.appendChild(root);

    // ── 부팅: 세션 시작 ──
    async function start() {
      root.innerHTML = '';
      root.appendChild(el('div', 'csl-card', '<p class="csl-hint">잠깐만요… 문제를 준비하고 있어요</p>'));
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
        const c = el('div', 'csl-card');
        c.appendChild(el('p', 'csl-prompt', '앗, 연결에 문제가 생겼어요'));
        c.appendChild(el('p', 'csl-hint', '백엔드 서버가 켜져 있는지 확인해 주세요.'));
        const btn = el('button', 'csl-btn', '다시 시도');
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
      dropZones.length = 0; // 새 문제마다 드롭존 초기화

      const top = el('div', 'csl-top');
      top.appendChild(el('span', 'csl-stage-chip', `⭐ ${q.stage}단계`));
      const prog = el('div', 'csl-progress');
      const fill = el('div', 'csl-progress-fill');
      fill.style.width = (state.index / state.questions.length) * 100 + '%';
      prog.appendChild(fill);
      top.appendChild(prog);
      top.appendChild(el('span', 'csl-count', `${state.index + 1} / ${state.questions.length}`));
      root.appendChild(top);

      const card = el('div', 'csl-card');
      if (q.countryLabel) card.appendChild(el('div', 'csl-country', q.countryLabel));
      card.appendChild(el('h3', 'csl-prompt', q.prompt));
      if (q.scenario) card.appendChild(el('div', 'csl-scenario', q.scenario));

      // 문제별 행동 데이터 수집 상태
      const qs = {
        question: q,
        startTime: now(),
        firstSelectTime: null,
        wrongAttemptCount: 0,
        regrabCount: 0,
        reconnectCount: 0,
        dragDistance: 0,
        dragPath: [],
        selectionOrder: [],
        pendingChip: null,
        _tagMap: {},
        // 유형별 현재 답
        selectedOption: null,   // single
        sequence: [],           // order
        pairs: {},              // connect { leftId: rightId }
        picked: [],             // pick   [itemId...]
        bins: {},               // sort   { itemId: binId }
        touched: [],            // touch  [elementId...]
        droppedZone: null,      // place  놓인 존 id
        reachedDest: false,     // route  도착 여부
        routePath: [],          // route  이동 경로(정규화 %)
        placements: {},         // puzzle { slotId: pieceId }
        requiredSlots: 0,       // puzzle 채워야 하는 칸 수
        swapCount: 0,           // puzzle 조각 교체 횟수
      };

      if (q.type === 'single') buildSingle(card, q, qs);
      else if (q.type === 'order') buildOrder(card, q, qs);
      else if (q.type === 'connect') buildConnect(card, q, qs);
      else if (q.type === 'pick') buildPick(card, q, qs);
      else if (q.type === 'sort') buildSort(card, q, qs);
      else if (q.type === 'touch') buildTouch(card, q, qs);
      else if (q.type === 'place') buildPlace(card, q, qs);
      else if (q.type === 'route') buildRoute(card, q, qs);
      else if (q.type === 'puzzle') buildPuzzle(card, q, qs);

      const actions = el('div', 'csl-actions');
      const feedback = el('div', 'csl-feedback', '');
      const last = state.index === state.questions.length - 1;
      const submit = el('button', 'csl-btn', last ? '제출하기' : '다음 문제 →');
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
      if (q.type === 'single') return !!qs.selectedOption;
      if (q.type === 'order') return qs.sequence.length === q.cards.length;
      if (q.type === 'connect') return Object.keys(qs.pairs).length === q.left.length;
      if (q.type === 'pick') return qs.picked.length > 0;
      if (q.type === 'sort') return Object.keys(qs.bins).length === q.items.length;
      if (q.type === 'touch') return qs.touched.length > 0;
      if (q.type === 'place') return qs.droppedZone != null;
      if (q.type === 'route') return qs.reachedDest === true;
      if (q.type === 'puzzle') return Object.keys(qs.placements).length === qs.requiredSlots;
      return false;
    }

    function markFirst(qs) {
      if (qs.firstSelectTime == null) qs.firstSelectTime = now() - qs.startTime;
    }

    // ── single : 정답 카드를 정답 상자로 드래그 (다시 끌어다 놓으면 변경) ──
    function buildSingle(card, q, qs) {
      const drop = el('div', 'csl-dropbox');
      drop.appendChild(el('div', 'csl-dropbox-label', '정답을 여기로 끌어다 놓아요'));
      const slot = el('div', 'csl-dropbox-items');
      const empty = el('div', 'csl-dropbox-empty', '아래 카드를 끌어와요');
      drop.appendChild(empty);
      drop.appendChild(slot);
      card.appendChild(drop);

      const chips = el('div', 'csl-chips');
      const chipById = {};
      shuffle(q.options.slice()).forEach((opt) => {
        const c = makeChip(opt, qs);
        chipById[opt.id] = c;
        chips.appendChild(c);
      });
      card.appendChild(chips);

      registerDropZone(drop, qs, (id) => {
        qs.selectedOption = id;
        empty.style.display = 'none';
        slot.innerHTML = '';
        const opt = q.options.find((o) => o.id === id);
        slot.appendChild(el('span', 'csl-chip csl-in-box', opt.text));
        Object.values(chipById).forEach((c) => c.classList.remove('csl-picked-active'));
        if (chipById[id]) chipById[id].classList.add('csl-picked-active');
        qs.refreshSubmit();
      });
    }

    // ── order : 카드를 순서대로 배열 (탭하면 다음 슬롯에 채워짐) ──
    function buildOrder(card, q, qs) {
      const slots = el('div', 'csl-slots');
      const slotEls = [];
      for (let i = 0; i < q.cards.length; i++) {
        const slot = el('div', 'csl-slot');
        slot.appendChild(el('span', 'csl-slot-no', String(i + 1)));
        slot.appendChild(el('span', 'csl-slot-body', ''));
        slots.appendChild(slot);
        slotEls.push(slot);
      }
      card.appendChild(slots);
      card.appendChild(el('div', 'csl-order-arrow', '⬇️ 순서대로 카드를 눌러 담아요'));

      const pool = el('div', 'csl-pool');
      const cardEls = {};
      shuffle(q.cards).forEach((c) => {
        const cardBtn = el('button', 'csl-card-item', c.text);
        cardBtn.dataset.id = c.id;
        cardEls[c.id] = cardBtn;
        cardBtn.onclick = () => {
          markFirst(qs);
          if (qs.sequence.includes(c.id)) return;
          const pos = qs.sequence.length;
          qs.sequence.push(c.id);
          slotEls[pos].querySelector('.csl-slot-body').textContent = c.text;
          slotEls[pos].classList.add('csl-filled');
          slotEls[pos].dataset.cardId = c.id;
          cardBtn.classList.add('csl-used');
          slotEls[pos].onclick = () => {
            const cid = slotEls[pos].dataset.cardId;
            if (!cid) return;
            const idx = qs.sequence.indexOf(cid);
            if (idx === -1) return;
            const removed = qs.sequence.splice(idx);
            removed.forEach((rid) => cardEls[rid].classList.remove('csl-used'));
            for (let k = idx; k < slotEls.length; k++) {
              slotEls[k].querySelector('.csl-slot-body').textContent = '';
              slotEls[k].classList.remove('csl-filled');
              slotEls[k].removeAttribute('data-card-id');
              slotEls[k].onclick = null;
            }
            qs.regrabCount += 1;
            qs.refreshSubmit();
          };
          qs.refreshSubmit();
        };
        pool.appendChild(cardBtn);
      });
      card.appendChild(pool);
    }

    // ── connect : 왼쪽 낱말에서 오른쪽 '뜻'으로 선을 그어 연결 (다시 그으면 변경) ──
    function buildConnect(card, q, qs) {
      const SVGNS = 'http://www.w3.org/2000/svg';
      const palette = ['#7c5cf5', '#ff9a3d', '#34c759', '#4a9dff', '#e0518f'];
      const wrap = el('div', 'csl-connect csl-connect-lines');
      const svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'csl-line-layer');
      const leftCol = el('div', 'csl-col');
      const rightCol = el('div', 'csl-col');
      const leftEls = {}, rightEls = {};
      let activeLeft = null;

      q.left.forEach((it) => {
        const b = el('div', 'csl-conn-item csl-conn-left');
        b.dataset.id = it.id;
        b.appendChild(el('span', 'csl-conn-text', it.text));
        b.appendChild(el('span', 'csl-anchor csl-anchor-r', ''));
        leftEls[it.id] = b; leftCol.appendChild(b);
      });
      shuffle(q.right.slice()).forEach((it) => {
        const b = el('div', 'csl-conn-item csl-conn-right');
        b.dataset.id = it.id;
        b.appendChild(el('span', 'csl-anchor csl-anchor-l', ''));
        b.appendChild(el('span', 'csl-conn-text', it.text));
        rightEls[it.id] = b; rightCol.appendChild(b);
      });
      wrap.appendChild(svg); wrap.appendChild(leftCol); wrap.appendChild(rightCol);
      card.appendChild(wrap);

      const lines = {}; // leftId -> <line>
      const colorOf = (leftId) => palette[q.left.findIndex((x) => x.id === leftId) % palette.length];
      function anchorPos(elem, side) {
        const r = elem.getBoundingClientRect(), w = wrap.getBoundingClientRect();
        return { x: (side === 'r' ? r.right : r.left) - w.left, y: r.top + r.height / 2 - w.top };
      }
      function drawLine(leftId, rightId) {
        const p1 = anchorPos(leftEls[leftId], 'r'), p2 = anchorPos(rightEls[rightId], 'l');
        let ln = lines[leftId];
        if (!ln) { ln = document.createElementNS(SVGNS, 'line'); ln.setAttribute('stroke-width', '4'); ln.setAttribute('stroke-linecap', 'round'); svg.appendChild(ln); lines[leftId] = ln; }
        ln.setAttribute('x1', p1.x); ln.setAttribute('y1', p1.y); ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y);
        ln.setAttribute('stroke', colorOf(leftId));
      }
      function clearPairing(leftId) {
        const oldR = qs.pairs[leftId];
        if (oldR && rightEls[oldR]) { rightEls[oldR].classList.remove('csl-conn-paired'); rightEls[oldR].style.borderColor = ''; }
        delete qs.pairs[leftId];
        if (leftEls[leftId]) { leftEls[leftId].classList.remove('csl-conn-paired'); leftEls[leftId].style.borderColor = ''; }
        if (lines[leftId]) { lines[leftId].remove(); delete lines[leftId]; }
      }
      function pair(leftId, rightId) {
        markFirst(qs);
        for (const l of Object.keys(qs.pairs)) { if (qs.pairs[l] === rightId && l !== leftId) { clearPairing(l); qs.reconnectCount += 1; } }
        if (qs.pairs[leftId]) { clearPairing(leftId); qs.reconnectCount += 1; }
        qs.pairs[leftId] = rightId;
        const c = colorOf(leftId);
        leftEls[leftId].classList.add('csl-conn-paired'); leftEls[leftId].style.borderColor = c;
        rightEls[rightId].classList.add('csl-conn-paired'); rightEls[rightId].style.borderColor = c;
        drawLine(leftId, rightId);
        qs.refreshSubmit();
      }
      function rightUnder(x, y) {
        const t = document.elementFromPoint(x, y), z = t && t.closest('.csl-conn-right');
        return (z && rightEls[z.dataset.id]) ? z.dataset.id : null;
      }

      // 왼쪽에서 선 끌어 긋기 (마우스+터치)
      let temp = null, fromLeft = null, moved = false, lastPt = null;
      const onMove = (e) => {
        if (fromLeft == null) return;
        const p = { x: e.clientX, y: e.clientY };
        if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) >= 4) moved = true;
        qs.dragDistance += Math.hypot(p.x - lastPt.x, p.y - lastPt.y);
        if (qs.dragPath.length < 500) qs.dragPath.push({ x: Math.round(p.x), y: Math.round(p.y), t: now() - qs.startTime });
        lastPt = p;
        const w = wrap.getBoundingClientRect();
        temp.setAttribute('x2', p.x - w.left); temp.setAttribute('y2', p.y - w.top);
        const rid = rightUnder(p.x, p.y);
        Object.values(rightEls).forEach((r) => r.classList.remove('csl-drop-hot'));
        if (rid) rightEls[rid].classList.add('csl-drop-hot');
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        Object.values(rightEls).forEach((r) => r.classList.remove('csl-drop-hot'));
        if (temp) { temp.remove(); temp = null; }
        const rid = rightUnder(e.clientX, e.clientY);
        if (rid) { pair(fromLeft, rid); activeLeft = null; Object.values(leftEls).forEach((x) => x.classList.remove('csl-active')); }
        else if (!moved) { activeLeft = fromLeft; Object.values(leftEls).forEach((x) => x.classList.remove('csl-active')); leftEls[fromLeft].classList.add('csl-active'); }
        else { qs.regrabCount += 1; }
        fromLeft = null;
      };
      Object.values(leftEls).forEach((b) => {
        b.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          fromLeft = b.dataset.id; moved = false; lastPt = { x: e.clientX, y: e.clientY }; markFirst(qs);
          b.setPointerCapture && b.setPointerCapture(e.pointerId);
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
          const p1 = anchorPos(b, 'r');
          temp = document.createElementNS(SVGNS, 'line');
          temp.setAttribute('stroke', colorOf(fromLeft)); temp.setAttribute('stroke-width', '4');
          temp.setAttribute('stroke-linecap', 'round'); temp.setAttribute('stroke-dasharray', '7 5');
          temp.setAttribute('x1', p1.x); temp.setAttribute('y1', p1.y); temp.setAttribute('x2', p1.x); temp.setAttribute('y2', p1.y);
          svg.appendChild(temp);
        });
      });
      // 탭 폴백: 왼쪽 탭(선택) → 오른쪽 탭(연결)
      Object.values(rightEls).forEach((b) => {
        b.addEventListener('click', () => { if (activeLeft) { leftEls[activeLeft].classList.remove('csl-active'); pair(activeLeft, b.dataset.id); activeLeft = null; } });
      });
      // 창 크기 변하면 선 위치 다시 계산
      window.addEventListener('resize', () => { Object.keys(qs.pairs).forEach((l) => drawLine(l, qs.pairs[l])); });
    }

    // ── pick : 아이템을 상자 하나로 드래그해 담기 ──
    function buildPick(card, q, qs) {
      const box = el('div', 'csl-dropbox');
      box.appendChild(el('div', 'csl-dropbox-label', q.target || '여기로 끌어다 놓기 📦'));
      const boxItems = el('div', 'csl-dropbox-items');
      const empty = el('div', 'csl-dropbox-empty', '위험한 것을 이 상자로 끌어와요');
      box.appendChild(empty);
      box.appendChild(boxItems);
      card.appendChild(box);

      const chips = el('div', 'csl-chips');
      shuffle(q.items).forEach((it) => chips.appendChild(makeChip(it, qs)));
      card.appendChild(chips);

      registerDropZone(box, qs, (id, chip) => {
        if (qs.picked.includes(id)) return;
        qs.picked.push(id);
        qs.selectionOrder.push({ id, t: now() - qs.startTime });
        empty.style.display = 'none';
        const tag = el('span', 'csl-chip csl-in-box', chip.innerHTML);
        tag.title = '빼려면 누르세요';
        tag.onclick = () => {
          qs.picked = qs.picked.filter((x) => x !== id);
          tag.remove(); chip.classList.remove('csl-chip-used');
          if (qs.picked.length === 0) empty.style.display = '';
          qs.refreshSubmit();
        };
        boxItems.appendChild(tag);
        chip.classList.add('csl-chip-used');
        qs.refreshSubmit();
      });
    }

    // ── sort : 아이템을 여러 상자로 분류 드래그 ──
    function buildSort(card, q, qs) {
      const bins = el('div', 'csl-bins');
      q.bins.forEach((b) => {
        const bin = el('div', 'csl-bin');
        bin.appendChild(el('div', 'csl-bin-label', (b.emoji ? b.emoji + ' ' : '') + b.label));
        const items = el('div', 'csl-bin-items');
        bin.appendChild(items);
        bins.appendChild(bin);
        registerDropZone(bin, qs, (id, chip) => {
          if (qs._tagMap[id]) qs._tagMap[id].remove(); // 이전 상자에서 제거
          qs.bins[id] = b.id;
          qs.selectionOrder.push({ id, bin: b.id, t: now() - qs.startTime });
          const tag = el('span', 'csl-chip csl-in-box', chip.innerHTML);
          tag.title = '빼려면 누르세요';
          tag.onclick = () => {
            delete qs.bins[id]; tag.remove(); chip.classList.remove('csl-chip-used');
            delete qs._tagMap[id]; qs.refreshSubmit();
          };
          qs._tagMap[id] = tag;
          items.appendChild(tag);
          chip.classList.add('csl-chip-used');
          qs.refreshSubmit();
        });
      });
      card.appendChild(bins);

      const chips = el('div', 'csl-chips');
      shuffle(q.items).forEach((it) => chips.appendChild(makeChip(it, qs)));
      card.appendChild(chips);
    }

    // ── touch : 스마트폰 화면에서 위험 요소를 탭해 선택(멀티) ──
    function buildTouch(card, q, qs) {
      const phone = el('div', 'csl-phone' + (q.screenStyle === 'chat' ? ' csl-phone-chat' : ''));
      phone.appendChild(el('div', 'csl-phone-bar', q.screenTitle || '📱 화면'));
      const screen = el('div', 'csl-phone-screen');
      q.elements.forEach((elm) => {
        const row = el('button', 'csl-screen-el' + (q.screenStyle === 'chat' ? ' csl-msg' : ''));
        row.dataset.id = elm.id;
        if (elm.emoji) row.appendChild(el('span', 'csl-screen-emoji', elm.emoji));
        row.appendChild(el('span', 'csl-screen-text', elm.text));
        row.onclick = () => {
          markFirst(qs);
          const i = qs.touched.indexOf(elm.id);
          if (i >= 0) { qs.touched.splice(i, 1); row.classList.remove('csl-touched'); }
          else { qs.touched.push(elm.id); row.classList.add('csl-touched'); qs.selectionOrder.push({ id: elm.id, t: now() - qs.startTime }); }
          qs.refreshSubmit();
        };
        screen.appendChild(row);
      });
      phone.appendChild(screen);
      card.appendChild(phone);
    }

    // ── place : 장면에서 캐릭터를 안전 구역으로 드래그 ──
    function buildPlace(card, q, qs) {
      const scene = el('div', 'csl-scene');
      const zoneEls = [];
      (q.zones || []).forEach((z) => {
        const zn = el('div', 'csl-zone' + (z.moving ? ' csl-zone-moving' : ''));
        zn.dataset.id = z.id;
        zn.style.left = z.x + '%'; zn.style.top = z.y + '%';
        zn.style.width = z.w + '%'; zn.style.height = z.h + '%';
        zn.appendChild(el('span', 'csl-zone-label', (z.emoji ? z.emoji + ' ' : '') + (z.label || '')));
        scene.appendChild(zn);
        zoneEls.push(zn);
      });
      const ch = el('div', 'csl-char', q.character || '🧒');
      const start = q.start || { x: 46, y: 78 };
      ch.style.left = start.x + '%'; ch.style.top = start.y + '%';
      scene.appendChild(ch);
      card.appendChild(scene);
      card.appendChild(el('div', 'csl-order-arrow', '🧒 아이를 안전한 곳으로 끌어다 놓아요'));

      attachSceneDrag(ch, scene, qs, (c) => {
        let hit = null;
        for (const z of (q.zones || [])) {
          if (c.x >= z.x && c.x <= z.x + z.w && c.y >= z.y && c.y <= z.y + z.h) { hit = z.id; break; }
        }
        qs.droppedZone = hit;
        zoneEls.forEach((zn) => zn.classList.toggle('csl-zone-picked', zn.dataset.id === hit));
        if (!hit) qs.regrabCount += 1;
        qs.refreshSubmit();
      });
    }

    // ── route : 캐릭터를 위험 구역을 피해 목적지까지 드래그 (경로 기록) ──
    function buildRoute(card, q, qs) {
      const scene = el('div', 'csl-scene');
      (q.dangerZones || []).forEach((z) => {
        const zn = el('div', 'csl-zone csl-zone-danger');
        zn.style.left = z.x + '%'; zn.style.top = z.y + '%';
        zn.style.width = z.w + '%'; zn.style.height = z.h + '%';
        zn.appendChild(el('span', 'csl-zone-label', (z.emoji ? z.emoji + ' ' : '') + (z.label || '위험')));
        scene.appendChild(zn);
      });
      const dz = q.dest;
      const dest = el('div', 'csl-zone csl-zone-dest');
      dest.style.left = dz.x + '%'; dest.style.top = dz.y + '%';
      dest.style.width = dz.w + '%'; dest.style.height = dz.h + '%';
      dest.appendChild(el('span', 'csl-zone-label', (dz.emoji ? dz.emoji + ' ' : '') + (dz.label || '도착')));
      scene.appendChild(dest);

      const ch = el('div', 'csl-char', q.character || '🧒');
      const start = q.start || { x: 8, y: 85 };
      ch.style.left = start.x + '%'; ch.style.top = start.y + '%';
      scene.appendChild(ch);
      card.appendChild(scene);
      card.appendChild(el('div', 'csl-order-arrow', '🧒 위험한 곳을 피해 도착 지점까지 끌고 가요'));

      qs.routePath = [{ x: start.x, y: start.y }];
      attachSceneDrag(ch, scene, qs, (c) => {
        qs.reachedDest = c.x >= dz.x && c.x <= dz.x + dz.w && c.y >= dz.y && c.y <= dz.y + dz.h;
        if (!qs.reachedDest) qs.regrabCount += 1;
        qs.refreshSubmit();
      }, (pt) => { if (qs.routePath.length < 600) qs.routePath.push(pt); });
    }

    // ── puzzle : 실제 사진(국기 등)을 격자로 잘라 조각을 퍼즐판에 드래그 ──
    //   q.image  = 완성 이미지 경로 (예: 'flags/kr.svg')
    //   q.grid   = { cols, rows }  퍼즐판 격자
    //   q.pieces = [{ id, img, col, row }]  조각(크롭 위치). 방해 조각은 다른 이미지 사용
    //   q.prefilled = { slotId: pieceId }  미리 채워진 칸 (2단계 '빠진 조각 넣기')
    //   q.preview   = false 면 완성 이미지 힌트를 숨김 (5단계)
    //   슬롯 id 는 s0..sN (행 우선). 정답 answers = { slotId: pieceId } 는 서버에만 있음.
    function cropStyle(node, img, col, row, cols, rows) {
      node.style.backgroundImage = `url("${img}")`;
      node.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
      const px = cols > 1 ? (col / (cols - 1)) * 100 : 0;
      const py = rows > 1 ? (row / (rows - 1)) * 100 : 0;
      node.style.backgroundPosition = `${px}% ${py}%`;
    }

    function buildPuzzle(card, q, qs) {
      const cols = q.grid.cols, rows = q.grid.rows;
      const total = cols * rows;
      const prefilled = q.prefilled || {};
      qs.requiredSlots = total - Object.keys(prefilled).length;
      const pieceById = {};
      q.pieces.forEach((p) => { pieceById[p.id] = p; });

      const board = el('div', 'csl-board');
      board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      const cellEls = {};

      for (let i = 0; i < total; i++) {
        const slotId = 's' + i;
        const col = i % cols, row = Math.floor(i / cols);
        const cell = el('div', 'csl-cell');
        const ghost = el('div', 'csl-cell-ghost');
        if (q.preview !== false) cropStyle(ghost, q.image, col, row, cols, rows);
        const face = el('div', 'csl-cell-piece');
        cell.appendChild(ghost);
        cell.appendChild(face);
        board.appendChild(cell);
        cellEls[slotId] = { cell, face };

        if (prefilled[slotId]) {
          const p = pieceById[prefilled[slotId]];
          cropStyle(face, p.img, p.col, p.row, cols, rows);
          cell.classList.add('csl-cell-locked', 'csl-cell-filled');
          continue;
        }

        registerDropZone(cell, qs, (pieceId, chip) => {
          markFirst(qs);
          const p = pieceById[pieceId];
          if (!p) return;
          // 이 조각이 다른 칸에 있었다면 그 칸 비우기
          for (const s of Object.keys(qs.placements)) {
            if (qs.placements[s] === pieceId) {
              delete qs.placements[s];
              cellEls[s].face.style.backgroundImage = '';
              cellEls[s].cell.classList.remove('csl-cell-filled');
            }
          }
          // 칸에 이미 조각이 있으면 되돌리고 교체로 집계
          if (qs.placements[slotId]) {
            const prevChip = qs.chipMap[qs.placements[slotId]];
            if (prevChip) prevChip.classList.remove('csl-chip-used');
            qs.swapCount += 1;
          }
          qs.placements[slotId] = pieceId;
          qs.selectionOrder.push({ slot: slotId, piece: pieceId, t: now() - qs.startTime });
          cropStyle(cellEls[slotId].face, p.img, p.col, p.row, cols, rows);
          cell.classList.add('csl-cell-filled');
          chip.classList.add('csl-chip-used');
          qs.refreshSubmit();
        });

        // 채워진 칸을 (조각 선택 없이) 누르면 조각을 도로 빼기
        cell.addEventListener('click', () => {
          if (qs.pendingChip || !qs.placements[slotId]) return;
          const backChip = qs.chipMap[qs.placements[slotId]];
          if (backChip) backChip.classList.remove('csl-chip-used');
          delete qs.placements[slotId];
          cellEls[slotId].face.style.backgroundImage = '';
          cell.classList.remove('csl-cell-filled');
          qs.regrabCount += 1;
          qs.refreshSubmit();
        });
      }
      card.appendChild(board);
      card.appendChild(el('div', 'csl-order-arrow', '🧩 조각을 끌어서 알맞은 칸에 놓아요'));

      // 조각 더미 (미리 채워진 조각 제외, 섞어서)
      const tray = el('div', 'csl-pieces');
      qs.chipMap = {};
      const prefilledIds = new Set(Object.values(prefilled));
      const chipAspect = `${3 * rows} / ${2 * cols}`; // 판(3:2)의 셀 비율과 동일
      shuffle(q.pieces.filter((p) => !prefilledIds.has(p.id))).forEach((p) => {
        const chip = el('div', 'csl-chip csl-piece-chip');
        chip.dataset.id = p.id;
        chip.style.aspectRatio = chipAspect;
        cropStyle(chip, p.img, p.col, p.row, cols, rows);
        qs.chipMap[p.id] = chip;
        attachDrag(chip, qs);
        tray.appendChild(chip);
      });
      card.appendChild(tray);
    }

    // ── 장면 안에서 캐릭터 토큰 드래그 (좌표 %) ──
    function attachSceneDrag(ch, scene, qs, onDrop, onTrack) {
      let grabbed = false, lastClient = null;
      const toPct = (cx, cy) => {
        const r = scene.getBoundingClientRect();
        return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 };
      };
      const clamp = (v) => Math.max(0, Math.min(100, v));
      const onDown = (e) => {
        e.preventDefault(); grabbed = true; markFirst(qs);
        lastClient = { x: e.clientX, y: e.clientY };
        ch.setPointerCapture && ch.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };
      const onMove = (e) => {
        if (!grabbed) return;
        const p = toPct(e.clientX, e.clientY);
        const cx = clamp(p.x), cy = clamp(p.y);
        ch.classList.add('csl-char-dragging');
        ch.style.left = cx + '%'; ch.style.top = cy + '%';
        qs.dragDistance += Math.hypot(e.clientX - lastClient.x, e.clientY - lastClient.y);
        lastClient = { x: e.clientX, y: e.clientY };
        const pt = { x: Math.round(cx * 10) / 10, y: Math.round(cy * 10) / 10 };
        if (onTrack) onTrack(pt);
        if (qs.dragPath.length < 600) qs.dragPath.push({ x: Math.round(cx), y: Math.round(cy), t: now() - qs.startTime });
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false; ch.classList.remove('csl-char-dragging');
        const p = toPct(e.clientX, e.clientY);
        onDrop({ x: clamp(p.x), y: clamp(p.y) });
      };
      ch.addEventListener('pointerdown', onDown);
    }

    // ── 드래그 가능한 아이템 칩 ──
    function makeChip(it, qs) {
      const chip = el('div', 'csl-chip');
      chip.dataset.id = it.id;
      if (it.emoji) chip.appendChild(el('span', 'csl-chip-emoji', it.emoji));
      chip.appendChild(el('span', 'csl-chip-text', it.text));
      attachDrag(chip, qs);
      return chip;
    }

    // ── 드롭존 관리 (드래그·탭 공통) ──
    const dropZones = [];
    function registerDropZone(node, qs, onDrop) {
      dropZones.push({ node, qs, onDrop });
      node.addEventListener('click', () => {
        if (qs.pendingChip) {
          const chip = qs.pendingChip;
          qs.pendingChip.classList.remove('csl-picked-active');
          qs.pendingChip = null;
          onDrop(chip.dataset.id, chip);
        }
      });
    }
    const zonesFor = (qs) => dropZones.filter((z) => z.qs === qs);
    function zoneUnder(qs, p) {
      return zonesFor(qs).find((z) => {
        const r = z.node.getBoundingClientRect();
        return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
      });
    }
    function highlightZoneUnder(qs, p) { clearZoneHot(qs); const z = zoneUnder(qs, p); if (z) z.node.classList.add('csl-drop-hot'); }
    function clearZoneHot(qs) { zonesFor(qs).forEach((z) => z.node.classList.remove('csl-drop-hot')); }
    const point = (e) => ({ x: e.clientX, y: e.clientY });

    // ── 포인터 드래그 (마우스+터치 통합) ──
    function attachDrag(chip, qs) {
      let ghost = null, dragging = false, lastPt = null, grabbed = false;
      const onDown = (e) => {
        if (chip.classList.contains('csl-chip-used')) return;
        e.preventDefault();
        grabbed = true; dragging = false;
        lastPt = point(e); markFirst(qs);
        chip.setPointerCapture && chip.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };
      const onMove = (e) => {
        if (!grabbed) return;
        const p = point(e);
        if (!dragging) {
          if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) < 6) return;
          dragging = true;
          chip.classList.add('csl-chip-dragging');
          // 이미지 조각(퍼즐)도 그대로 보이도록 칩을 복제해 고스트로 사용
          ghost = chip.cloneNode(true);
          ghost.className = chip.className + ' csl-ghost';
          ghost.classList.remove('csl-chip-dragging');
          ghost.style.width = chip.offsetWidth + 'px';
          ghost.style.height = chip.offsetHeight + 'px';
          document.body.appendChild(ghost);
        }
        qs.dragDistance += Math.hypot(p.x - lastPt.x, p.y - lastPt.y);
        if (qs.dragPath.length < 500) qs.dragPath.push({ x: Math.round(p.x), y: Math.round(p.y), t: now() - qs.startTime });
        lastPt = p;
        ghost.style.left = p.x + 'px';
        ghost.style.top = p.y + 'px';
        highlightZoneUnder(qs, p);
      };
      const onUp = (e) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        grabbed = false;
        chip.classList.remove('csl-chip-dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        if (!dragging) { togglePick(chip, qs); return; }
        clearZoneHot(qs);
        const zone = zoneUnder(qs, point(e));
        if (zone) zone.onDrop(chip.dataset.id, chip);
        else qs.regrabCount += 1;
      };
      chip.addEventListener('pointerdown', onDown);
    }
    function togglePick(chip, qs) {
      if (qs.pendingChip === chip) { chip.classList.remove('csl-picked-active'); qs.pendingChip = null; }
      else {
        if (qs.pendingChip) qs.pendingChip.classList.remove('csl-picked-active');
        chip.classList.add('csl-picked-active'); qs.pendingChip = chip;
      }
    }

    // ── 제출 → 서버 채점 ──
    async function onSubmit(q, qs) {
      qs.submitEl.disabled = true;
      const solveTimeMs = now() - qs.startTime;

      const payload = {
        sessionId: state.sessionId,
        questionId: q.id,
        selectedOption: qs.selectedOption,
        sequence: qs.sequence,
        pairs: qs.pairs,
        picked: qs.picked,
        bins: qs.bins,
        touched: qs.touched,
        droppedZone: qs.droppedZone,
        reachedDest: qs.reachedDest,
        route: qs.routePath,
        placements: qs.placements,
        metrics: {
          swapCount: qs.swapCount,
          solveTimeMs,
          firstSelectTimeMs: qs.firstSelectTime,
          hesitationTimeMs: qs.firstSelectTime,
          wrongAttemptCount: qs.wrongAttemptCount,
          regrabCount: qs.regrabCount,
          reconnectCount: qs.reconnectCount,
          dragDistance: Math.round(qs.dragDistance),
          dragPath: qs.dragPath.slice(0, 500),
          selectionOrder: qs.selectionOrder,
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
        qs.feedbackEl.className = 'csl-feedback csl-no';
        qs.submitEl.disabled = false;
        return;
      }

      if (result.correct) {
        state.totalCorrect += 1;
        qs.feedbackEl.textContent = q.successText || '정답이에요! 잘했어요';
        qs.feedbackEl.className = 'csl-feedback csl-ok';
      } else {
        qs.feedbackEl.textContent = q.failText || '아쉬워요, 다시 한번 볼까요';
        qs.feedbackEl.className = 'csl-feedback csl-no';
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

      setTimeout(() => { state.index += 1; renderQuestion(); }, 800);
    }

    // ── 전체 종료 → 검증 ──
    async function finish() {
      root.innerHTML = '';
      root.appendChild(el('div', 'csl-card', '<p class="csl-hint">채점 중이에요…</p>'));
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
        root.appendChild(el('div', 'csl-card', '<p class="csl-hint">채점 연결에 실패했어요</p>'));
        return;
      }
      renderDone(result);
      if (result.passed && typeof cfg.onPass === 'function') cfg.onPass(result);
      if (!result.passed && typeof cfg.onFail === 'function') cfg.onFail(result);
    }

    function renderDone(result) {
      root.innerHTML = '';
      const done = el('div', 'csl-card csl-done');
      done.appendChild(el('div', 'csl-mascot', result.passed ? '🐱✨' : '🐱💧'));
      done.appendChild(el('h3', null, result.passed ? '통과! 안전을 잘 배웠어요' : '조금 더 도전해볼까요?'));
      done.appendChild(el('p', null, `총 ${result.totalCorrect} / ${result.totalQuestions} 문제 정답`));

      const summary = el('div', 'csl-stage-summary');
      const sr = result.stageResults || {};
      for (let s = 1; s <= 5; s++) {
        const r = sr[s];
        if (!r) continue;
        const pill = el('span', 'csl-summary-pill' + (r.passed ? '' : ' csl-fail'),
          `${s}단계 ${r.correct}/${r.answered}`);
        summary.appendChild(pill);
      }
      done.appendChild(summary);

      const btn = el('button', 'csl-btn csl-ghostbtn', '다시 도전하기');
      btn.onclick = start;
      done.appendChild(btn);
      root.appendChild(done);
    }

    start();
    return { restart: start, getState: () => state };
  }

  const CatChapSafety = {
    mount(target, opts) {
      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (!container) throw new Error('CatChapSafety: mount 대상을 찾을 수 없어요 → ' + target);
      return createInstance(container, opts);
    },
  };

  global.CatChapSafety = CatChapSafety;
  if (typeof module !== 'undefined' && module.exports) module.exports = CatChapSafety;
})(typeof window !== 'undefined' ? window : this);
