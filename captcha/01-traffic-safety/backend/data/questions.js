/**
 * 교통안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 단계 흐름:
 *   1단계  안전 행동 선택      안전한 교통 행동 고르기            (single)
 *   2단계  위험 행동 찾기      위험한 행동 고르기                 (single)
 *   3단계  안전한 위치 선택    안전하게 있어야 할 곳 고르기        (single)
 *   4단계  길 건너기 순서 배열  행동 카드를 순서대로 배열          (order)
 *   5단계  복합 상황 판단      상황을 보고 가장 안전한 행동 선택   (single)
 *
 * type 값:
 *   'single'   → 보기 중 하나 선택. answer = 정답 옵션 id
 *   'order'    → 카드 순서 배열. correctSequence = 정답 카드 id 순서
 *
 * ⚠️ answer / correctSequence 는 검증용이라 프론트로 절대 내려가지 않는다.
 *    (routes/captcha.js 의 sanitizeQuestion() 에서 제거됨)
 */

const QUESTIONS = [
  // ───────────────────── 1단계 : 안전 행동 선택 ─────────────────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'single',
    prompt: '길을 건널 때 안전한 행동을 골라보세요.',
    hint: '신호등을 잘 보고 골라요.',
    options: [
      { id: 'o1', emoji: '🟢', text: '초록불에 건너기' },
      { id: 'o2', emoji: '🔴', text: '빨간불에 뛰어가기' },
      { id: 'o3', emoji: '🚗', text: '차도에서 장난치기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'single',
    prompt: '횡단보도를 건널 때 바른 행동은?',
    hint: '차가 멈췄는지 확인해요.',
    options: [
      { id: 'o1', emoji: '👀', text: '좌우를 살피고 건너기' },
      { id: 'o2', emoji: '📱', text: '휴대폰을 보며 건너기' },
      { id: 'o3', emoji: '🏃', text: '뒤돌아보며 뛰기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'single',
    prompt: '차에 탈 때 안전한 행동을 골라보세요.',
    hint: '몸을 지켜주는 것을 떠올려요.',
    options: [
      { id: 'o1', emoji: '🔒', text: '안전벨트 매기' },
      { id: 'o2', emoji: '🚪', text: '달리는 차에서 문 열기' },
      { id: 'o3', emoji: '🪟', text: '창밖으로 손 내밀기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'single',
    prompt: '걸을 때 안전한 곳은 어디일까요?',
    hint: '사람이 다니는 길을 떠올려요.',
    options: [
      { id: 'o1', emoji: '🚶', text: '인도(보도)로 걷기' },
      { id: 'o2', emoji: '🛣️', text: '차도 한가운데로 걷기' },
      { id: 'o3', emoji: '🚧', text: '공사장 안으로 걷기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'single',
    prompt: '자전거를 탈 때 안전한 행동은?',
    hint: '머리를 지켜주는 것을 떠올려요.',
    options: [
      { id: 'o1', emoji: '⛑️', text: '헬멧을 쓰고 타기' },
      { id: 'o2', emoji: '🙌', text: '두 손 놓고 타기' },
      { id: 'o3', emoji: '🌙', text: '불 없이 밤에 빠르게 타기' },
    ],
    answer: 'o1',
  },

  // ───────────────────── 2단계 : 위험 행동 찾기 ─────────────────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'single',
    prompt: '위험한 행동을 찾아보세요.',
    hint: '신호를 어기면 위험해요.',
    options: [
      { id: 'o1', emoji: '🚸', text: '횡단보도로 건너기' },
      { id: 'o2', emoji: '🟢', text: '신호등을 보고 건너기' },
      { id: 'o3', emoji: '🔴', text: '빨간불에 뛰어가기' },
    ],
    answer: 'o3',
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'single',
    prompt: '하면 안 되는 위험한 행동은?',
    hint: '차 사이는 안 보여요.',
    options: [
      { id: 'o1', emoji: '🚗', text: '주차된 차 사이로 갑자기 뛰어나가기' },
      { id: 'o2', emoji: '🚦', text: '신호를 기다리기' },
      { id: 'o3', emoji: '🤚', text: '손을 들고 건너기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'single',
    prompt: '위험한 행동을 골라보세요.',
    hint: '공은 차도로 굴러가기 쉬워요.',
    options: [
      { id: 'o1', emoji: '🏞️', text: '공원에서 공놀이하기' },
      { id: 'o2', emoji: '⚽', text: '차도에서 공놀이하기' },
      { id: 'o3', emoji: '🛝', text: '놀이터에서 놀기' },
    ],
    answer: 'o2',
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'single',
    prompt: '버스를 기다릴 때 위험한 행동은?',
    hint: '차도 쪽은 위험해요.',
    options: [
      { id: 'o1', emoji: '🚏', text: '정류장 안에서 기다리기' },
      { id: 'o2', emoji: '🛣️', text: '차도로 내려가 기웃거리기' },
      { id: 'o3', emoji: '🧍', text: '줄 서서 기다리기' },
    ],
    answer: 'o2',
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'single',
    prompt: '길에서 위험한 행동을 찾아보세요.',
    hint: '앞을 못 보면 위험해요.',
    options: [
      { id: 'o1', emoji: '👀', text: '앞을 보며 걷기' },
      { id: 'o2', emoji: '🎧', text: '이어폰 크게 켜고 게임하며 걷기' },
      { id: 'o3', emoji: '🚸', text: '횡단보도 앞에서 멈추기' },
    ],
    answer: 'o2',
  },

  // ───────────────────── 3단계 : 안전한 위치 선택 ─────────────────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'single',
    prompt: '길을 건너기 전, 어디에 서 있어야 할까요?',
    hint: '차도에서 한 발 물러나요.',
    options: [
      { id: 'o1', emoji: '🟨', text: '보도(인도) 위 안전선 안쪽' },
      { id: 'o2', emoji: '🛣️', text: '차도로 한 발 내려간 곳' },
      { id: 'o3', emoji: '🚗', text: '차와 차 사이' },
    ],
    answer: 'o1',
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'single',
    prompt: '초록불이 켜졌어요. 어디로 건너야 안전할까요?',
    hint: '하얀 줄무늬 길을 찾아요.',
    options: [
      { id: 'o1', emoji: '🚸', text: '횡단보도 위로' },
      { id: 'o2', emoji: '↔️', text: '횡단보도 옆 빈 도로로' },
      { id: 'o3', emoji: '🏃', text: '가장 가까운 아무 곳으로' },
    ],
    answer: 'o1',
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'single',
    prompt: '길이 어두운 밤, 어디로 다니는 게 안전할까요?',
    hint: '밝은 곳이 안전해요.',
    options: [
      { id: 'o1', emoji: '💡', text: '가로등이 있는 밝은 인도' },
      { id: 'o2', emoji: '🌑', text: '불 꺼진 골목 안쪽' },
      { id: 'o3', emoji: '🛣️', text: '차가 다니는 도로 가장자리' },
    ],
    answer: 'o1',
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'single',
    prompt: '지하철을 기다릴 때 안전한 위치는?',
    hint: '노란 선을 떠올려요.',
    options: [
      { id: 'o1', emoji: '🟡', text: '노란 안전선 뒤' },
      { id: 'o2', emoji: '🚉', text: '선로 바로 앞' },
      { id: 'o3', emoji: '🏃', text: '문이 열리기 전 뛰어들기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'single',
    prompt: '골목에서 차가 다닐 때, 아이는 어디로 가야 할까요?',
    hint: '벽 쪽으로 붙어요.',
    options: [
      { id: 'o1', emoji: '🧱', text: '길 가장자리 벽 쪽으로 붙기' },
      { id: 'o2', emoji: '🛣️', text: '길 한가운데로 걷기' },
      { id: 'o3', emoji: '🚗', text: '차 뒤에 숨기' },
    ],
    answer: 'o1',
  },

  // ───────────────────── 4단계 : 길 건너기 순서 배열 (order) ─────────────────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'order',
    prompt: '길을 건너는 순서를 바르게 놓아보세요.',
    hint: '멈추고 → 확인하고 → 건너요.',
    cards: [
      { id: 'c1', text: '멈추기' },
      { id: 'c2', text: '초록불 확인하기' },
      { id: 'c3', text: '좌우 살피기' },
      { id: 'c4', text: '횡단보도 건너기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'order',
    prompt: '횡단보도를 건너는 순서를 놓아보세요.',
    hint: '손을 들어 운전자에게 보여줘요.',
    cards: [
      { id: 'c1', text: '보도에 멈춰 서기' },
      { id: 'c2', text: '손 들기' },
      { id: 'c3', text: '차가 멈췄는지 확인' },
      { id: 'c4', text: '천천히 건너기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'order',
    prompt: '버스에서 내려 집에 가는 순서예요.',
    hint: '버스가 완전히 떠난 뒤 건너요.',
    cards: [
      { id: 'c1', text: '버스에서 내리기' },
      { id: 'c2', text: '인도에서 기다리기' },
      { id: 'c3', text: '버스가 지나갈 때까지 기다리기' },
      { id: 'c4', text: '횡단보도로 건너기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'order',
    prompt: '자전거를 타기 전 준비 순서를 놓아보세요.',
    hint: '안전 장비부터 챙겨요.',
    cards: [
      { id: 'c1', text: '헬멧 쓰기' },
      { id: 'c2', text: '브레이크 확인' },
      { id: 'c3', text: '주변 살피기' },
      { id: 'c4', text: '출발하기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'order',
    prompt: '신호등이 있는 길을 건너는 순서예요.',
    hint: '깜빡이면 기다려요.',
    cards: [
      { id: 'c1', text: '빨간불에 멈추기' },
      { id: 'c2', text: '초록불로 바뀌길 기다리기' },
      { id: 'c3', text: '좌우 살피기' },
      { id: 'c4', text: '건너기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },

  // ───────────────────── 5단계 : 복합 상황 판단 (single + 상황) ─────────────────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'single',
    prompt: '상황을 보고 가장 안전한 행동을 골라보세요.',
    scenario: '🚗 좁은 골목길에서 차가 천천히 다가오고 있어요.',
    hint: '차를 먼저 보내요.',
    options: [
      { id: 'o1', emoji: '🛑', text: '멈추고 차가 지나간 뒤 이동한다' },
      { id: 'o2', emoji: '🏃', text: '바로 뛰어서 지나간다' },
      { id: 'o3', emoji: '👬', text: '친구를 따라 무작정 건넌다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'single',
    prompt: '이럴 때 어떻게 해야 안전할까요?',
    scenario: '🟢 초록불인데 저 멀리 차가 빠르게 오고 있어요.',
    hint: '차가 멈추는지 꼭 확인해요.',
    options: [
      { id: 'o1', emoji: '👀', text: '차가 멈추는지 확인하고 건넌다' },
      { id: 'o2', emoji: '🏃', text: '초록불이니 그냥 뛰어 건넌다' },
      { id: 'o3', emoji: '📱', text: '휴대폰을 보며 건넌다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'single',
    prompt: '가장 안전한 행동은 무엇일까요?',
    scenario: '⚽ 공이 차도로 굴러갔어요.',
    hint: '차도로 뛰어들면 위험해요.',
    options: [
      { id: 'o1', emoji: '🧑', text: '어른에게 도움을 요청한다' },
      { id: 'o2', emoji: '🏃', text: '바로 차도로 뛰어가 줍는다' },
      { id: 'o3', emoji: '🙈', text: '차 사이로 몰래 들어간다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'single',
    prompt: '비 오는 날, 가장 안전한 행동은?',
    scenario: '🌧️ 비가 와서 우산을 썼더니 앞이 잘 안 보여요.',
    hint: '우산을 살짝 들어 앞을 봐요.',
    options: [
      { id: 'o1', emoji: '☂️', text: '우산을 들어 앞을 보며 천천히 건넌다' },
      { id: 'o2', emoji: '🏃', text: '우산으로 앞을 가린 채 뛴다' },
      { id: 'o3', emoji: '🚗', text: '차가 서줄 거라 믿고 그냥 건넌다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'single',
    prompt: '가장 안전한 행동을 골라보세요.',
    scenario: '🚧 인도에 공사가 있어 막혀 있어요.',
    hint: '무리해서 차도로 나가지 않아요.',
    options: [
      { id: 'o1', emoji: '↩️', text: '어른과 함께 안전한 길로 돌아간다' },
      { id: 'o2', emoji: '🛣️', text: '차도로 내려가 빠르게 지나간다' },
      { id: 'o3', emoji: '🧗', text: '공사 울타리를 넘어간다' },
    ],
    answer: 'o1',
  },
];

/** 단계별 통과 기준 (맞아야 하는 최소 문제 수) */
const STAGE_PASS_THRESHOLD = 4; // 단계별 5문제 중 4문제 이상

/** 전체 통과 기준 (25문제 중 최소 정답 수) */
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
