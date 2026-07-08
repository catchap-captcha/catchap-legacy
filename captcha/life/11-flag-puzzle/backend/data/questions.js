/**
 * Flag Puzzle 캡챠 — 랜덤 문제 생성기 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * ★ 매 세션(/start)마다 단계별 국가 풀에서 5개국을 랜덤으로 뽑아
 *   문제를 새로 생성한다. 방해 조각도 매번 다른 나라에서 랜덤으로
 *   잘라오고, 2단계의 빈칸 위치도 랜덤이다.
 *   → 같은 판이 반복되지 않아 캡챠로서 예측이 어렵다.
 *
 * 단계 흐름:
 *   1단계  국가명 + 2조각 퍼즐        (2×1 / 1×2, 미리보기 있음)
 *   2단계  국가명 + 빠진 조각 넣기     (2×2 중 1칸 비움 + 방해 조각 3개)
 *   3단계  국가명 + 4조각 퍼즐        (2×2 전체 배치)
 *   4단계  국가명 + 방해 조각 포함     (2×2 정답 4조각 + 다른 나라 조각 2개)
 *   5단계  국가명 + 복합 퍼즐         (3×2 = 6조각 + 방해 2개, 미리보기 없음)
 *
 * equivalentGroups: 같은 색·모양이라 구분이 불가능한 조각 묶음.
 *   같은 그룹끼리는 어느 칸에 넣어도 정답 처리된다. (routes/captcha.js)
 */

const FLAG = (code) => `flags/${code}.svg`;

// ── 사용 가능한 국기 (frontend/flags/*.svg 에 실제 이미지 존재) ──
const NAMES = {
  kr: '한국', jp: '일본', fr: '프랑스', de: '독일', it: '이탈리아',
  nl: '네덜란드', es: '스페인', ca: '캐나다', us: '미국', br: '브라질',
  gb: '영국', au: '호주', cn: '중국', mx: '멕시코', za: '남아프리카공화국',
  gr: '그리스', tr: '튀르키예', se: '스웨덴', ch: '스위스', in: '인도',
};
const HINTS = {
  kr: '태극과 건곤감리를 떠올려요.',
  jp: '가운데 빨간 원을 떠올려요.',
  fr: '파랑-하양-빨강 세로 순서예요.',
  de: '검정-빨강-노랑 가로 순서예요.',
  it: '초록-하양-빨강 세로 순서예요.',
  nl: '빨강-하양-파랑 가로 순서예요.',
  es: '빨강-노랑-빨강 가로 순서예요.',
  ca: '가운데 단풍잎을 떠올려요.',
  us: '별과 줄무늬를 떠올려요.',
  br: '초록 바탕에 노란 마름모를 떠올려요.',
  gb: '유니언잭의 선들을 떠올려요.',
  au: '남십자성 별들을 떠올려요.',
  cn: '노란 별들은 왼쪽 위에 있어요.',
  mx: '가운데 독수리 문양을 떠올려요.',
  za: 'Y자 모양을 떠올려요.',
  gr: '파란 줄무늬를 떠올려요.',
  tr: '달과 별을 떠올려요.',
  se: '노란 십자가를 떠올려요.',
  ch: '하얀 십자가를 떠올려요.',
  in: '가운데 물레바퀴를 떠올려요.',
};
const ALL_CODES = Object.keys(NAMES);

// ── 랜덤 유틸 ──
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const sample = (arr, n) => shuffle(arr).slice(0, n);
const randInt = (n) => Math.floor(Math.random() * n);
const pickOne = (arr) => arr[randInt(arr.length)];

/** cols×rows 격자의 정답 조각 + 배치 생성 (slot s{i} ↔ piece p{i}) */
function gridPuzzle(code, cols, rows) {
  const pieces = [];
  const answers = {};
  for (let i = 0; i < cols * rows; i++) {
    pieces.push({ id: 'p' + i, img: FLAG(code), col: i % cols, row: Math.floor(i / cols) });
    answers['s' + i] = 'p' + i;
  }
  return { image: FLAG(code), grid: { cols, rows }, pieces, answers };
}

/** 다른 나라 국기에서 랜덤하게 잘라 온 방해 조각 count개 */
function randomDistractors(excludeCode, count, cols, rows) {
  const others = sample(ALL_CODES.filter((c) => c !== excludeCode), count);
  return others.map((c, i) => ({ id: 'd' + (i + 1), img: FLAG(c), col: randInt(cols), row: randInt(rows) }));
}

/** 동치 그룹 프리셋 (격자별로 똑같이 보이는 조각) */
const EQ = {
  V22: [['p0', 'p2'], ['p1', 'p3']],           // 세로 삼색기 2×2 (위아래 동일)
  H22: [['p0', 'p1'], ['p2', 'p3']],           // 가로 삼색기 2×2 (좌우 동일)
  CN22: [['p1', 'p2', 'p3']],                   // 중국 2×2 (빨간 단색 3조각)
  US22: [['p2', 'p3']],                         // 미국 2×2 (아래 줄무늬)
  US32: [['p1', 'p2'], ['p3', 'p4', 'p5']],     // 미국 3×2 (윗줄·아랫줄 줄무늬)
  VBAND32: [['p0', 'p3'], ['p2', 'p5']],        // 세로 3분할기 3×2 (양쪽 단색 기둥)
  ES32: [['p1', 'p2'], ['p4', 'p5']],           // 스페인 3×2 (문장 없는 오른쪽 구간)
};

// ── 단계별 국가 풀 ──
// 1단계: 2조각 (반으로 나눠도 두 조각이 서로 구분되는 국기)
const STAGE1_POOL = [
  { code: 'kr', cols: 2, rows: 1 },
  { code: 'jp', cols: 2, rows: 1 },
  { code: 'fr', cols: 2, rows: 1 },
  { code: 'it', cols: 2, rows: 1 },
  { code: 'de', cols: 1, rows: 2 },
  { code: 'nl', cols: 1, rows: 2 },
  { code: 'es', cols: 1, rows: 2 },
  { code: 'cn', cols: 2, rows: 1 },
  { code: 'tr', cols: 2, rows: 1 },
  { code: 'ca', cols: 2, rows: 1 },
  { code: 'ch', cols: 2, rows: 1 },
];
// 2단계: 빠진 조각 넣기 (empty = 비울 수 있는 칸 후보; 단색 칸은 제외)
const STAGE2_POOL = [
  { code: 'jp', empty: [0, 1, 2, 3] },
  { code: 'ca', empty: [0, 1, 2, 3] },
  { code: 'br', empty: [0, 1, 2, 3] },
  { code: 'us', empty: [0] },              // 별(캔턴) 조각만 특징적
  { code: 'kr', empty: [0, 1, 2, 3] },
  { code: 'cn', empty: [0] },              // 별 조각만 특징적
  { code: 'gb', empty: [0, 1, 2, 3] },
  { code: 'mx', empty: [0, 1, 2, 3] },
  { code: 'au', empty: [0, 1, 2, 3] },
  { code: 'za', empty: [0, 1, 2, 3] },
];
// 3단계: 4조각 퍼즐 (2×2)
const STAGE3_POOL = [
  { code: 'fr', eq: EQ.V22 },
  { code: 'it', eq: EQ.V22 },
  { code: 'de', eq: EQ.H22 },
  { code: 'nl', eq: EQ.H22 },
  { code: 'es' },
  { code: 'jp' },
  { code: 'kr' },
  { code: 'ca' },
  { code: 'br' },
  { code: 'mx' },
  { code: 'cn', eq: EQ.CN22 },
  { code: 'us', eq: EQ.US22 },
];
// 4단계: 4조각 + 방해 2조각 (2×2)
const STAGE4_POOL = [
  { code: 'ca' },
  { code: 'us', eq: EQ.US22 },
  { code: 'br' },
  { code: 'kr' },
  { code: 'cn', eq: EQ.CN22 },
  { code: 'mx' },
  { code: 'za' },
  { code: 'gb' },
  { code: 'au' },
];
// 5단계: 6조각 + 방해 2조각 (3×2, 미리보기 없음)
const STAGE5_POOL = [
  { code: 'us', eq: EQ.US32 },
  { code: 'gb' },
  { code: 'br' },
  { code: 'kr' },
  { code: 'au' },
  { code: 'mx', eq: EQ.VBAND32 },
  { code: 'ca', eq: EQ.VBAND32 },
  { code: 'es', eq: EQ.ES32 },
  { code: 'za' },
];

/**
 * ★ 조각 id 랜덤화 (봇 방지 핵심)
 * 기본 생성은 s0→p0, s1→p1… 규칙이라 id 만 보고 정답을 만들 수 있다.
 * 그래서 문제마다 조각 id 를 통째로 섞어 배정한다. 방해 조각도 'd' 접두사
 * 대신 같은 p* 네임스페이스를 쓰므로 id 로는 방해 조각을 구분할 수 없다.
 * answers / prefilled / equivalentGroups 도 함께 새 id 로 치환한다.
 */
function randomizeIds(q) {
  const oldIds = q.pieces.map((p) => p.id);
  const newIds = shuffle(oldIds.map((_, i) => 'p' + i));
  const map = {};
  oldIds.forEach((old, i) => { map[old] = newIds[i]; });

  q.pieces = shuffle(q.pieces.map((p) => ({ ...p, id: map[p.id] })));
  q.answers = Object.fromEntries(Object.entries(q.answers).map(([s, pid]) => [s, map[pid]]));
  if (q.prefilled) q.prefilled = Object.fromEntries(Object.entries(q.prefilled).map(([s, pid]) => [s, map[pid]]));
  if (q.equivalentGroups) q.equivalentGroups = q.equivalentGroups.map((g) => g.map((pid) => map[pid]));
  return q;
}

/** 문제 하나 조립 */
function makeQ(id, stage, order, code, base, extra = {}) {
  const nameKo = NAMES[code];
  return {
    id, stage, order, type: 'puzzle',
    countryCode: code,
    countryLabel: nameKo,
    prompt: `${nameKo} 국기를 완성해보세요.`,
    hint: HINTS[code] || '',
    successText: `정답이에요! ${nameKo} 국기를 완성했어요.`,
    failText: `아쉬워요! ${nameKo} 국기를 다시 떠올려봐요.`,
    ...base,
    ...extra,
  };
}

/**
 * ★ 세션마다 호출: 단계별 풀에서 랜덤으로 5개국씩 뽑아 25문제를 생성.
 *   (routes/captcha.js 의 /start 에서 호출되고, 세션별로 저장되어 채점에 쓰인다)
 */
function generateQuestionSet() {
  const qs = [];

  // ── 1단계: 2조각 ──
  sample(STAGE1_POOL, 5).forEach((e, i) => {
    qs.push(randomizeIds(makeQ(`l1-q${i + 1}`, 1, i + 1, e.code, gridPuzzle(e.code, e.cols, e.rows))));
  });

  // ── 2단계: 빠진 조각 넣기 (빈칸 위치도 랜덤 + 방해 3개) ──
  sample(STAGE2_POOL, 5).forEach((e, i) => {
    const b = gridPuzzle(e.code, 2, 2);
    b.pieces.push(...randomDistractors(e.code, 3, 2, 2));
    const empty = pickOne(e.empty);
    const prefilled = {};
    for (let s = 0; s < 4; s++) if (s !== empty) prefilled['s' + s] = 'p' + s;
    qs.push(randomizeIds(makeQ(`l2-q${i + 1}`, 2, i + 1, e.code,
      { ...b, prefilled, answers: { ['s' + empty]: 'p' + empty } },
      { prompt: `${NAMES[e.code]} 국기의 빠진 조각을 넣어보세요.` })));
  });

  // ── 3단계: 4조각 퍼즐 ──
  sample(STAGE3_POOL, 5).forEach((e, i) => {
    qs.push(randomizeIds(makeQ(`l3-q${i + 1}`, 3, i + 1, e.code, gridPuzzle(e.code, 2, 2),
      { prompt: `섞인 조각을 맞춰 ${NAMES[e.code]} 국기를 완성해보세요.`, ...(e.eq ? { equivalentGroups: e.eq } : {}) })));
  });

  // ── 4단계: 방해 조각 포함 ──
  sample(STAGE4_POOL, 5).forEach((e, i) => {
    const b = gridPuzzle(e.code, 2, 2);
    b.pieces.push(...randomDistractors(e.code, 2, 2, 2));
    qs.push(randomizeIds(makeQ(`l4-q${i + 1}`, 4, i + 1, e.code, b,
      { prompt: `필요한 조각만 골라 ${NAMES[e.code]} 국기를 완성해보세요.`, ...(e.eq ? { equivalentGroups: e.eq } : {}) })));
  });

  // ── 5단계: 복합 퍼즐 (미리보기 없음) ──
  sample(STAGE5_POOL, 5).forEach((e, i) => {
    const b = gridPuzzle(e.code, 3, 2);
    b.pieces.push(...randomDistractors(e.code, 2, 3, 2));
    qs.push(randomizeIds(makeQ(`l5-q${i + 1}`, 5, i + 1, e.code, { ...b, preview: false },
      { prompt: `국가 이름을 보고 ${NAMES[e.code]} 국기를 완성해보세요.`, ...(e.eq ? { equivalentGroups: e.eq } : {}) })));
  });

  return qs;
}

const TOTAL_QUESTIONS = 25;
const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

module.exports = {
  generateQuestionSet,
  TOTAL_QUESTIONS,
  STAGE_PASS_THRESHOLD,
  TOTAL_PASS_THRESHOLD,
  NAMES,
};
