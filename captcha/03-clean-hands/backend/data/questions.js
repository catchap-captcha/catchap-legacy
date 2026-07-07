/**
 * 손씻기 위생 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 단계 흐름:
 *   1단계  올바른 행동 선택    손 씻는 올바른 행동 고르기          (single)
 *   2단계  순서 2개 배열       물 묻히기 → 비누칠 등 2단계         (order)
 *   3단계  순서 3개 배열       물 → 비누 → 헹구기 3단계            (order)
 *   4단계  잘못된 행동 제외    손 씻기에 안 맞는 행동 찾기          (single)
 *   5단계  전체 순서 배열      손 씻기 5단계 전체 배열              (order)
 *
 * type 값:
 *   'single'   → 보기 중 하나 선택. answer = 정답 옵션 id
 *   'order'    → 카드 순서 배열. correctSequence = 정답 카드 id 순서
 */

const QUESTIONS = [
  // ───────────────────── 1단계 : 올바른 행동 선택 ─────────────────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'single',
    prompt: '손을 깨끗하게 하는 행동을 골라보세요.',
    hint: '비누를 사용해요.',
    options: [
      { id: 'o1', emoji: '🧼', text: '비누로 손 씻기' },
      { id: 'o2', emoji: '🍚', text: '손 안 씻고 밥 먹기' },
      { id: 'o3', emoji: '👕', text: '옷에 손 닦기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'single',
    prompt: '언제 손을 씻어야 할까요?',
    hint: '밥 먹기 전을 떠올려요.',
    options: [
      { id: 'o1', emoji: '🍽️', text: '밥 먹기 전에' },
      { id: 'o2', emoji: '🎮', text: '게임 이길 때만' },
      { id: 'o3', emoji: '😴', text: '절대 씻지 않기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'single',
    prompt: '올바른 손 씻기 행동은?',
    hint: '거품을 충분히 내요.',
    options: [
      { id: 'o1', emoji: '🫧', text: '거품을 내서 30초 문지르기' },
      { id: 'o2', emoji: '⚡', text: '물만 1초 스치기' },
      { id: 'o3', emoji: '🙅', text: '손끝만 살짝 적시기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'single',
    prompt: '화장실을 다녀온 뒤 바른 행동은?',
    hint: '꼭 씻어야 해요.',
    options: [
      { id: 'o1', emoji: '🧼', text: '비누로 손을 깨끗이 씻기' },
      { id: 'o2', emoji: '🏃', text: '그냥 뛰어나가기' },
      { id: 'o3', emoji: '🧻', text: '휴지로만 닦고 끝내기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'single',
    prompt: '손을 씻은 뒤 바른 행동은?',
    hint: '깨끗한 수건에 말려요.',
    options: [
      { id: 'o1', emoji: '🧻', text: '깨끗한 수건으로 물기 닦기' },
      { id: 'o2', emoji: '👖', text: '더러운 바지에 닦기' },
      { id: 'o3', emoji: '💦', text: '젖은 채로 그냥 두기' },
    ],
    answer: 'o1',
  },

  // ───────────────────── 2단계 : 순서 2개 배열 (order) ─────────────────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'order',
    prompt: '먼저 해야 할 행동을 앞에 놓아보세요.',
    hint: '물을 먼저 묻혀요.',
    cards: [
      { id: 'c1', text: '손에 물 묻히기' },
      { id: 'c2', text: '비누칠하기' },
    ],
    correctSequence: ['c1', 'c2'],
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'order',
    prompt: '손 씻기 순서를 놓아보세요.',
    hint: '문지른 뒤 헹궈요.',
    cards: [
      { id: 'c1', text: '비누로 문지르기' },
      { id: 'c2', text: '물로 헹구기' },
    ],
    correctSequence: ['c1', 'c2'],
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'order',
    prompt: '어떤 순서가 맞을까요?',
    hint: '헹군 뒤 말려요.',
    cards: [
      { id: 'c1', text: '물로 헹구기' },
      { id: 'c2', text: '수건으로 말리기' },
    ],
    correctSequence: ['c1', 'c2'],
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'order',
    prompt: '손 씻기 시작 순서를 놓아보세요.',
    hint: '수도를 먼저 틀어요.',
    cards: [
      { id: 'c1', text: '수도꼭지 틀기' },
      { id: 'c2', text: '손에 물 묻히기' },
    ],
    correctSequence: ['c1', 'c2'],
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'order',
    prompt: '올바른 순서를 놓아보세요.',
    hint: '비누를 묻힌 뒤 거품을 내요.',
    cards: [
      { id: 'c1', text: '비누 묻히기' },
      { id: 'c2', text: '거품 내기' },
    ],
    correctSequence: ['c1', 'c2'],
  },

  // ───────────────────── 3단계 : 순서 3개 배열 (order) ─────────────────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'order',
    prompt: '손 씻기 순서를 맞춰보세요.',
    hint: '물 → 비누 → 헹구기예요.',
    cards: [
      { id: 'c1', text: '손에 물 묻히기' },
      { id: 'c2', text: '비누칠하기' },
      { id: 'c3', text: '물로 헹구기' },
    ],
    correctSequence: ['c1', 'c2', 'c3'],
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'order',
    prompt: '올바른 순서로 놓아보세요.',
    hint: '헹군 뒤에 말려요.',
    cards: [
      { id: 'c1', text: '비누로 문지르기' },
      { id: 'c2', text: '물로 헹구기' },
      { id: 'c3', text: '수건으로 말리기' },
    ],
    correctSequence: ['c1', 'c2', 'c3'],
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'order',
    prompt: '손 씻기 3단계를 놓아보세요.',
    hint: '수도를 틀고 시작해요.',
    cards: [
      { id: 'c1', text: '수도꼭지 틀기' },
      { id: 'c2', text: '손에 물 묻히기' },
      { id: 'c3', text: '비누칠하기' },
    ],
    correctSequence: ['c1', 'c2', 'c3'],
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'order',
    prompt: '알맞은 순서를 놓아보세요.',
    hint: '거품을 낸 뒤 문질러요.',
    cards: [
      { id: 'c1', text: '비누 묻히기' },
      { id: 'c2', text: '거품 내서 문지르기' },
      { id: 'c3', text: '물로 헹구기' },
    ],
    correctSequence: ['c1', 'c2', 'c3'],
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'order',
    prompt: '손을 씻고 마무리하는 순서예요.',
    hint: '말린 뒤 수도를 잠가요.',
    cards: [
      { id: 'c1', text: '물로 헹구기' },
      { id: 'c2', text: '수건으로 말리기' },
      { id: 'c3', text: '수도꼭지 잠그기' },
    ],
    correctSequence: ['c1', 'c2', 'c3'],
  },

  // ───────────────────── 4단계 : 잘못된 행동 제외 (single) ─────────────────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'single',
    prompt: '손 씻기에 알맞지 않은 행동을 찾아보세요.',
    hint: '옷에 닦으면 안 돼요.',
    options: [
      { id: 'o1', emoji: '💧', text: '손에 물 묻히기' },
      { id: 'o2', emoji: '🧼', text: '비누로 문지르기' },
      { id: 'o3', emoji: '👖', text: '대충 옷에 닦기' },
    ],
    answer: 'o3',
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'single',
    prompt: '올바른 손 씻기가 아닌 것은?',
    hint: '물만 스치면 안 돼요.',
    options: [
      { id: 'o1', emoji: '⚡', text: '물에 1초만 담갔다 빼기' },
      { id: 'o2', emoji: '🫧', text: '거품 내서 문지르기' },
      { id: 'o3', emoji: '🧻', text: '깨끗이 헹구고 말리기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'single',
    prompt: '손 씻기에 맞지 않는 행동을 골라보세요.',
    hint: '비누를 건너뛰면 안 돼요.',
    options: [
      { id: 'o1', emoji: '🚫', text: '비누 없이 물로만 대충 씻기' },
      { id: 'o2', emoji: '🧼', text: '비누로 골고루 문지르기' },
      { id: 'o3', emoji: '🖐️', text: '손가락 사이도 씻기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'single',
    prompt: '위생에 좋지 않은 행동은?',
    hint: '더러운 수건은 안 돼요.',
    options: [
      { id: 'o1', emoji: '🧽', text: '더럽고 축축한 걸레로 닦기' },
      { id: 'o2', emoji: '🧻', text: '깨끗한 수건으로 닦기' },
      { id: 'o3', emoji: '💨', text: '손 건조기로 말리기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'single',
    prompt: '손 씻기에 알맞지 않은 행동을 찾아보세요.',
    hint: '거품을 바로 씻어내면 안 돼요.',
    options: [
      { id: 'o1', emoji: '⏱️', text: '거품 내자마자 바로 헹구기' },
      { id: 'o2', emoji: '🔄', text: '손등과 손바닥 모두 문지르기' },
      { id: 'o3', emoji: '💅', text: '손톱 밑도 깨끗이 씻기' },
    ],
    answer: 'o1',
  },

  // ───────────────────── 5단계 : 전체 손씻기 순서 배열 (order, 5칸) ─────────────────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'order',
    prompt: '손 씻기 순서를 처음부터 끝까지 바르게 놓아보세요.',
    hint: '물 → 비누 → 문지르기 → 헹구기 → 말리기',
    cards: [
      { id: 'c1', text: '손에 물 묻히기' },
      { id: 'c2', text: '비누칠하기' },
      { id: 'c3', text: '손바닥과 손등 문지르기' },
      { id: 'c4', text: '물로 깨끗이 헹구기' },
      { id: 'c5', text: '수건으로 말리기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'],
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'order',
    prompt: '전체 손 씻기 순서를 놓아보세요.',
    hint: '수도를 틀고 시작해요.',
    cards: [
      { id: 'c1', text: '수도꼭지 틀기' },
      { id: 'c2', text: '손에 물 묻히기' },
      { id: 'c3', text: '비누로 거품 내기' },
      { id: 'c4', text: '30초 문지르기' },
      { id: 'c5', text: '물로 헹구기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'],
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'order',
    prompt: '손 씻기 전체 과정을 순서대로 놓아보세요.',
    hint: '손가락 사이까지 문질러요.',
    cards: [
      { id: 'c1', text: '손에 물 묻히기' },
      { id: 'c2', text: '비누칠하기' },
      { id: 'c3', text: '손가락 사이 문지르기' },
      { id: 'c4', text: '물로 헹구기' },
      { id: 'c5', text: '수건으로 말리기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'],
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'order',
    prompt: '올바른 손 씻기 순서를 완성해보세요.',
    hint: '마지막엔 수도를 잠가요.',
    cards: [
      { id: 'c1', text: '손에 물 묻히기' },
      { id: 'c2', text: '비누로 문지르기' },
      { id: 'c3', text: '물로 헹구기' },
      { id: 'c4', text: '수건으로 말리기' },
      { id: 'c5', text: '수도꼭지 잠그기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'],
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'order',
    prompt: '손 씻기 5단계를 처음부터 끝까지 놓아보세요.',
    hint: '손톱 밑도 잊지 말아요.',
    cards: [
      { id: 'c1', text: '손에 물 묻히기' },
      { id: 'c2', text: '비누 거품 내기' },
      { id: 'c3', text: '손톱 밑까지 문지르기' },
      { id: 'c4', text: '흐르는 물로 헹구기' },
      { id: 'c5', text: '깨끗한 수건으로 말리기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'],
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
