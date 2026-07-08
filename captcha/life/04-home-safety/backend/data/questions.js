/**
 * 우리집 안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제) · 드래그형
 * ---------------------------------------------------------------
 * 단계 흐름:
 *   1단계  위험 물건 담기       위험한 물건을 상자로 드래그          (pick, 1개)
 *   2단계  안전/위험 구분       두 상자로 분류 드래그               (sort)
 *   3단계  위험 물건 치우기     방 안 위험 물건을 안전 상자로 드래그  (pick, 1개)
 *   4단계  장소별 위험 찾기     장소 그림에서 위험한 것 담기          (pick, 1개)
 *   5단계  복합 장면 위험 찾기  위험한 것을 모두 드래그해 담기         (pick, 여러개)
 *
 * type 값:
 *   'pick'  → 아이템을 상자 하나로 드래그. answers = 정답 아이템 id 배열
 *   'sort'  → 아이템을 여러 상자로 분류.   answers = { itemId: binId }
 *
 * ⚠️ answers 는 검증용이라 프론트로 절대 내려가지 않는다.(sanitizeQuestion)
 */

const SAFE_DANGER_BINS = [
  { id: 'b_safe', emoji: '🙂', label: '안전해요' },
  { id: 'b_danger', emoji: '⚠️', label: '위험해요' },
];

const QUESTIONS = [
  // ───────────────────── 1단계 : 위험 물건 담기 (pick 1개) ─────────────────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'pick',
    prompt: '집 안에서 위험한 물건을 상자에 담아보세요.',
    hint: '손을 다치게 하는 물건을 찾아요.',
    target: '위험한 물건 상자 📦',
    items: [
      { id: 'i1', emoji: '📖', text: '책' },
      { id: 'i2', emoji: '🧸', text: '인형' },
      { id: 'i3', emoji: '🔪', text: '칼' },
      { id: 'i4', emoji: '📓', text: '공책' },
    ],
    answers: ['i3'],
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'pick',
    prompt: '위험한 물건을 상자에 담아보세요.',
    hint: '뾰족한 것을 조심해요.',
    target: '위험한 물건 상자 📦',
    items: [
      { id: 'i1', emoji: '🧸', text: '곰인형' },
      { id: 'i2', emoji: '✂️', text: '가위' },
      { id: 'i3', emoji: '🖍️', text: '크레용' },
      { id: 'i4', emoji: '🧱', text: '블록' },
    ],
    answers: ['i2'],
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'pick',
    prompt: '위험한 물건을 찾아 담아보세요.',
    hint: '전기가 흐르는 곳이에요.',
    target: '위험한 물건 상자 📦',
    items: [
      { id: 'i1', emoji: '🏀', text: '공' },
      { id: 'i2', emoji: '🔌', text: '콘센트' },
      { id: 'i3', emoji: '📕', text: '그림책' },
      { id: 'i4', emoji: '🧣', text: '담요' },
    ],
    answers: ['i2'],
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'pick',
    prompt: '위험한 물건을 담아보세요.',
    hint: '뜨거워서 데일 수 있어요.',
    target: '위험한 물건 상자 📦',
    items: [
      { id: 'i1', emoji: '🍲', text: '뜨거운 냄비' },
      { id: 'i2', emoji: '🍽️', text: '접시' },
      { id: 'i3', emoji: '🥄', text: '수저' },
      { id: 'i4', emoji: '🥤', text: '컵' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'pick',
    prompt: '위험한 물건을 찾아 담아보세요.',
    hint: '불이 붙는 물건이에요.',
    target: '위험한 물건 상자 📦',
    items: [
      { id: 'i1', emoji: '🔥', text: '라이터' },
      { id: 'i2', emoji: '🍬', text: '사탕' },
      { id: 'i3', emoji: '✏️', text: '색연필' },
      { id: 'i4', emoji: '🧸', text: '인형' },
    ],
    answers: ['i1'],
  },

  // ───────────────────── 2단계 : 안전/위험 구분 (sort) ─────────────────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'sort',
    prompt: '안전한 물건과 위험한 물건을 나눠 담아보세요.',
    hint: '다칠 수 있으면 위험해요.',
    bins: SAFE_DANGER_BINS,
    items: [
      { id: 'i1', emoji: '🧸', text: '인형' },
      { id: 'i2', emoji: '✂️', text: '가위' },
      { id: 'i3', emoji: '📖', text: '책' },
      { id: 'i4', emoji: '🍲', text: '뜨거운 냄비' },
    ],
    answers: { i1: 'b_safe', i2: 'b_danger', i3: 'b_safe', i4: 'b_danger' },
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'sort',
    prompt: '두 상자에 알맞게 나눠 담아보세요.',
    hint: '불과 칼은 위험해요.',
    bins: SAFE_DANGER_BINS,
    items: [
      { id: 'i1', emoji: '🧱', text: '블록' },
      { id: 'i2', emoji: '🔪', text: '칼' },
      { id: 'i3', emoji: '🖍️', text: '크레용' },
      { id: 'i4', emoji: '🔥', text: '성냥' },
    ],
    answers: { i1: 'b_safe', i2: 'b_danger', i3: 'b_safe', i4: 'b_danger' },
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'sort',
    prompt: '안전한 물건과 위험한 물건을 나눠보세요.',
    hint: '전기와 뜨거운 것을 조심해요.',
    bins: SAFE_DANGER_BINS,
    items: [
      { id: 'i1', emoji: '🧣', text: '담요' },
      { id: 'i2', emoji: '🥢', text: '콘센트에 젓가락' },
      { id: 'i3', emoji: '🏀', text: '공' },
      { id: 'i4', emoji: '♨️', text: '다리미' },
    ],
    answers: { i1: 'b_safe', i2: 'b_danger', i3: 'b_safe', i4: 'b_danger' },
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'sort',
    prompt: '알맞은 상자에 나눠 담아보세요.',
    hint: '깨지거나 뜨거우면 위험해요.',
    bins: SAFE_DANGER_BINS,
    items: [
      { id: 'i1', emoji: '📕', text: '그림책' },
      { id: 'i2', emoji: '🔷', text: '깨진 유리' },
      { id: 'i3', emoji: '🛏️', text: '베개' },
      { id: 'i4', emoji: '🫖', text: '뜨거운 물' },
    ],
    answers: { i1: 'b_safe', i2: 'b_danger', i3: 'b_safe', i4: 'b_danger' },
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'sort',
    prompt: '안전한 물건과 위험한 물건을 나눠보세요.',
    hint: '약과 불은 어른과 함께 다뤄요.',
    bins: SAFE_DANGER_BINS,
    items: [
      { id: 'i1', emoji: '🧸', text: '곰인형' },
      { id: 'i2', emoji: '💊', text: '약병' },
      { id: 'i3', emoji: '✏️', text: '색연필' },
      { id: 'i4', emoji: '🪔', text: '라이터' },
    ],
    answers: { i1: 'b_safe', i2: 'b_danger', i3: 'b_safe', i4: 'b_danger' },
  },

  // ───────────────────── 3단계 : 위험 물건 치우기 (pick 1개) ─────────────────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'pick',
    prompt: '방 안에서 위험한 물건을 안전 상자에 치워보세요.',
    hint: '바닥에 있으면 밟아서 다쳐요.',
    target: '안전 상자 🧺',
    items: [
      { id: 'i1', emoji: '🔷', text: '바닥의 유리조각' },
      { id: 'i2', emoji: '📖', text: '책상 위 책' },
      { id: 'i3', emoji: '🧸', text: '침대 위 인형' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'pick',
    prompt: '위험한 물건을 안전 상자로 치워보세요.',
    hint: '뜨거운 것을 조심해요.',
    target: '안전 상자 🧺',
    items: [
      { id: 'i1', emoji: '♨️', text: '켜진 다리미' },
      { id: 'i2', emoji: '🛋️', text: '쿠션' },
      { id: 'i3', emoji: '📕', text: '그림책' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'pick',
    prompt: '위험한 물건을 치워보세요.',
    hint: '벌어진 날을 조심해요.',
    target: '안전 상자 🧺',
    items: [
      { id: 'i1', emoji: '✂️', text: '벌어진 가위' },
      { id: 'i2', emoji: '🧣', text: '담요' },
      { id: 'i3', emoji: '📓', text: '공책' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'pick',
    prompt: '위험한 물건을 안전 상자로 치워보세요.',
    hint: '함부로 먹으면 위험해요.',
    target: '안전 상자 🧺',
    items: [
      { id: 'i1', emoji: '💊', text: '약 봉지' },
      { id: 'i2', emoji: '🧱', text: '블록' },
      { id: 'i3', emoji: '🧸', text: '인형' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'pick',
    prompt: '위험한 물건을 치워보세요.',
    hint: '불이 붙는 물건이에요.',
    target: '안전 상자 🧺',
    items: [
      { id: 'i1', emoji: '🔥', text: '성냥' },
      { id: 'i2', emoji: '🖍️', text: '크레용' },
      { id: 'i3', emoji: '🎨', text: '색종이' },
    ],
    answers: ['i1'],
  },

  // ───────────────────── 4단계 : 장소별 위험 찾기 (pick 1개) ─────────────────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'pick',
    prompt: '이 장소에서 위험한 곳을 찾아 담아보세요.',
    scenario: '🛁 욕실이에요.',
    hint: '미끄러지기 쉬운 곳이에요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '💧', text: '젖은 바닥' },
      { id: 'i2', emoji: '🧻', text: '수건' },
      { id: 'i3', emoji: '🪥', text: '칫솔' },
      { id: 'i4', emoji: '🧼', text: '비누' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'pick',
    prompt: '부엌에서 위험한 곳을 찾아 담아보세요.',
    scenario: '🍳 부엌이에요.',
    hint: '불이 켜져 있어요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '🔥', text: '켜진 가스레인지' },
      { id: 'i2', emoji: '🍽️', text: '접시' },
      { id: 'i3', emoji: '🧊', text: '냉장고' },
      { id: 'i4', emoji: '🍚', text: '밥그릇' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'pick',
    prompt: '거실에서 위험한 곳을 찾아보세요.',
    scenario: '🛋️ 거실이에요.',
    hint: '전기 근처에 물은 위험해요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '🥤', text: '콘센트 옆 물컵' },
      { id: 'i2', emoji: '🛋️', text: '소파' },
      { id: 'i3', emoji: '📺', text: '텔레비전' },
      { id: 'i4', emoji: '🪴', text: '화분' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'pick',
    prompt: '방에서 위험한 곳을 찾아 담아보세요.',
    scenario: '🛏️ 방이에요.',
    hint: '발에 걸려 넘어질 수 있어요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '🔌', text: '바닥에 늘어진 전선' },
      { id: 'i2', emoji: '📚', text: '책' },
      { id: 'i3', emoji: '🛏️', text: '이불' },
      { id: 'i4', emoji: '🧸', text: '인형' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'pick',
    prompt: '현관에서 위험한 곳을 찾아보세요.',
    scenario: '🚪 현관이에요.',
    hint: '미끄러운 물기를 조심해요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '💧', text: '미끄러운 물기' },
      { id: 'i2', emoji: '👟', text: '신발' },
      { id: 'i3', emoji: '☂️', text: '우산' },
      { id: 'i4', emoji: '🔑', text: '열쇠' },
    ],
    answers: ['i1'],
  },

  // ───────────────────── 5단계 : 복합 장면 위험 찾기 (pick 여러개) ─────────────────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'pick',
    prompt: '집 안에서 위험한 곳을 모두 찾아 담아보세요.',
    scenario: '🏠 집 안 그림이에요. 위험한 것을 모두 담아요.',
    hint: '위험한 것이 두 개 있어요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '🥤', text: '콘센트 근처 물컵' },
      { id: 'i2', emoji: '🔥', text: '켜진 가스레인지' },
      { id: 'i3', emoji: '🧸', text: '인형' },
      { id: 'i4', emoji: '📕', text: '그림책' },
    ],
    answers: ['i1', 'i2'],
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'pick',
    prompt: '위험한 것을 모두 찾아 담아보세요.',
    scenario: '🍽️ 식탁 위 그림이에요.',
    hint: '뾰족하거나 뜨거운 것을 찾아요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '🔪', text: '칼' },
      { id: 'i2', emoji: '🍲', text: '뜨거운 냄비' },
      { id: 'i3', emoji: '🍽️', text: '접시' },
      { id: 'i4', emoji: '🥄', text: '수저' },
    ],
    answers: ['i1', 'i2'],
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'pick',
    prompt: '위험한 것을 모두 담아보세요.',
    scenario: '🗄️ 서랍 속 그림이에요.',
    hint: '약과 불은 위험해요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '💊', text: '약병' },
      { id: 'i2', emoji: '🪔', text: '라이터' },
      { id: 'i3', emoji: '🧱', text: '블록' },
      { id: 'i4', emoji: '🖍️', text: '크레용' },
    ],
    answers: ['i1', 'i2'],
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'pick',
    prompt: '위험한 곳을 모두 찾아 담아보세요.',
    scenario: '🧺 바닥 그림이에요.',
    hint: '깨진 것과 젖은 곳을 조심해요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '🔷', text: '깨진 유리' },
      { id: 'i2', emoji: '💧', text: '젖은 바닥' },
      { id: 'i3', emoji: '🧣', text: '담요' },
      { id: 'i4', emoji: '🛏️', text: '베개' },
    ],
    answers: ['i1', 'i2'],
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'pick',
    prompt: '위험한 것을 모두 담아보세요.',
    scenario: '🏠 거실 그림이에요.',
    hint: '뜨겁거나 불이 붙는 것을 찾아요.',
    target: '위험한 곳 상자 📦',
    items: [
      { id: 'i1', emoji: '♨️', text: '켜진 다리미' },
      { id: 'i2', emoji: '🔥', text: '성냥' },
      { id: 'i3', emoji: '🎨', text: '색종이' },
      { id: 'i4', emoji: '🧸', text: '인형' },
    ],
    answers: ['i1', 'i2'],
  },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

function getQuestionsByStage(stage) {
  return QUESTIONS.filter((q) => q.stage === Number(stage));
}
function getQuestionById(id) {
  return QUESTIONS.find((q) => q.id === id);
}

module.exports = {
  QUESTIONS,
  STAGE_PASS_THRESHOLD,
  TOTAL_PASS_THRESHOLD,
  getQuestionsByStage,
  getQuestionById,
};
