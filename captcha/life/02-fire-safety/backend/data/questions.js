/**
 * 화재안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 단계 흐름:
 *   1단계  안전 행동 선택      불이 났을 때 할 행동 고르기         (single)
 *   2단계  위험 행동 제외      하면 안 되는 행동 고르기            (single)
 *   3단계  행동-이유 연결      행동과 이유를 선으로 연결            (connect)
 *   4단계  대피 순서 배열      화재 대피 순서를 배열               (order)
 *   5단계  상황별 대처 선택    상황을 보고 안전한 행동 판단         (single)
 *
 * type 값:
 *   'single'   → 보기 중 하나 선택. answer = 정답 옵션 id
 *   'connect'  → 왼쪽 항목 ↔ 오른쪽 항목 연결. answers = { leftId: rightId }
 *   'order'    → 카드 순서 배열. correctSequence = 정답 카드 id 순서
 *
 * ⚠️ answer / answers / correctSequence 는 검증용이라 프론트로 절대 안 내려간다.
 */

const QUESTIONS = [
  // ───────────────────── 1단계 : 안전 행동 선택 ─────────────────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'single',
    prompt: '불이 났을 때 해야 할 행동을 골라보세요.',
    hint: '어른에게 빨리 알려요.',
    options: [
      { id: 'o1', emoji: '🗣️', text: '어른에게 알리기' },
      { id: 'o2', emoji: '🙈', text: '이불 속에 숨기' },
      { id: 'o3', emoji: '🧸', text: '장난감부터 챙기기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'single',
    prompt: '연기가 가득할 때 바른 행동은?',
    hint: '연기는 위로 올라가요.',
    options: [
      { id: 'o1', emoji: '🧎', text: '낮은 자세로 이동하기' },
      { id: 'o2', emoji: '🏃', text: '똑바로 서서 뛰기' },
      { id: 'o3', emoji: '🤸', text: '연기 쪽으로 다가가기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'single',
    prompt: '불이 났을 때 신고는 어디로 할까요?',
    hint: '소방관 아저씨 번호예요.',
    options: [
      { id: 'o1', emoji: '🚒', text: '119에 신고하기' },
      { id: 'o2', emoji: '👮', text: '112에 신고하기' },
      { id: 'o3', emoji: '📞', text: '114에 전화하기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'single',
    prompt: '옷에 불이 붙었을 때 해야 할 행동은?',
    hint: '멈추고, 엎드리고, 뒹굴어요.',
    options: [
      { id: 'o1', emoji: '🤾', text: '멈춰서 엎드려 굴러 끄기' },
      { id: 'o2', emoji: '🏃', text: '더 빨리 뛰어다니기' },
      { id: 'o3', emoji: '🙌', text: '손을 흔들며 소리만 지르기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'single',
    prompt: '대피할 때 안전한 행동을 골라보세요.',
    hint: '계단으로 내려가요.',
    options: [
      { id: 'o1', emoji: '🚶', text: '계단으로 대피하기' },
      { id: 'o2', emoji: '🛗', text: '엘리베이터 타기' },
      { id: 'o3', emoji: '🚪', text: '방문 잠그고 기다리기' },
    ],
    answer: 'o1',
  },

  // ───────────────────── 2단계 : 위험 행동 제외 ─────────────────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'single',
    prompt: '불이 났을 때 하면 안 되는 행동을 찾아보세요.',
    hint: '엘리베이터는 멈출 수 있어요.',
    options: [
      { id: 'o1', emoji: '🚶', text: '계단으로 대피하기' },
      { id: 'o2', emoji: '🧎', text: '낮은 자세로 이동하기' },
      { id: 'o3', emoji: '🛗', text: '엘리베이터 타기' },
    ],
    answer: 'o3',
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'single',
    prompt: '위험한 행동을 골라보세요.',
    hint: '불 구경은 위험해요.',
    options: [
      { id: 'o1', emoji: '🏃', text: '빨리 밖으로 대피하기' },
      { id: 'o2', emoji: '👀', text: '불이 난 곳을 구경하기' },
      { id: 'o3', emoji: '📞', text: '119에 신고하기' },
    ],
    answer: 'o2',
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'single',
    prompt: '하면 안 되는 행동은 무엇일까요?',
    hint: '연기를 마시면 위험해요.',
    options: [
      { id: 'o1', emoji: '😮‍💨', text: '연기를 크게 들이마시며 이동' },
      { id: 'o2', emoji: '🧣', text: '옷으로 코와 입 막기' },
      { id: 'o3', emoji: '🧎', text: '낮게 엎드려 이동' },
    ],
    answer: 'o1',
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'single',
    prompt: '대피할 때 위험한 행동을 찾아보세요.',
    hint: '물건보다 몸이 먼저예요.',
    options: [
      { id: 'o1', emoji: '🎮', text: '게임기를 챙기러 다시 들어가기' },
      { id: 'o2', emoji: '🚪', text: '문을 닫고 빠져나오기' },
      { id: 'o3', emoji: '🗣️', text: '가족을 불러 함께 나가기' },
    ],
    answer: 'o1',
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'single',
    prompt: '문을 열기 전 위험한 행동은?',
    hint: '문이 뜨거우면 열면 안 돼요.',
    options: [
      { id: 'o1', emoji: '✋', text: '뜨거운 문을 그냥 벌컥 열기' },
      { id: 'o2', emoji: '🤚', text: '손등으로 문 온도 확인하기' },
      { id: 'o3', emoji: '🪟', text: '다른 탈출로 찾아보기' },
    ],
    answer: 'o1',
  },

  // ───────────────────── 3단계 : 행동-이유 선 연결 (connect) ─────────────────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'connect',
    prompt: '알맞은 행동과 이유를 연결해보세요.',
    hint: '왼쪽을 누르고, 알맞은 오른쪽을 눌러요.',
    left: [
      { id: 'a1', text: '낮은 자세로 이동하기' },
      { id: 'a2', text: '119에 신고하기' },
      { id: 'a3', text: '계단으로 대피하기' },
    ],
    right: [
      { id: 'b1', text: '연기를 덜 마시려고' },
      { id: 'b2', text: '도움을 요청하려고' },
      { id: 'b3', text: '안전하게 내려가려고' },
    ],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' },
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'connect',
    prompt: '행동과 이유를 알맞게 연결해보세요.',
    hint: '왜 그렇게 하는지 생각해요.',
    left: [
      { id: 'a1', text: '코와 입을 막기' },
      { id: 'a2', text: '문 손잡이 온도 확인' },
      { id: 'a3', text: '옷에 불이 붙으면 구르기' },
    ],
    right: [
      { id: 'b1', text: '연기를 안 마시려고' },
      { id: 'b2', text: '문 밖 불을 확인하려고' },
      { id: 'b3', text: '불을 끄려고' },
    ],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' },
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'connect',
    prompt: '알맞은 짝을 연결해보세요.',
    hint: '안전을 위한 행동이에요.',
    left: [
      { id: 'a1', text: '엘리베이터 대신 계단' },
      { id: 'a2', text: '밖으로 나와 다시 안 들어가기' },
      { id: 'a3', text: '대피 후 인원 확인' },
    ],
    right: [
      { id: 'b1', text: '멈추면 갇힐 수 있어서' },
      { id: 'b2', text: '다시 위험해질 수 있어서' },
      { id: 'b3', text: '빠진 사람을 알기 위해' },
    ],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' },
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'connect',
    prompt: '행동과 이유를 연결해보세요.',
    hint: '소방 도구의 쓰임을 떠올려요.',
    left: [
      { id: 'a1', text: '소화기 사용' },
      { id: 'a2', text: '화재경보기 누르기' },
      { id: 'a3', text: '젖은 수건으로 입 막기' },
    ],
    right: [
      { id: 'b1', text: '작은 불을 끄려고' },
      { id: 'b2', text: '사람들에게 알리려고' },
      { id: 'b3', text: '연기를 걸러내려고' },
    ],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' },
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'connect',
    prompt: '알맞은 이유와 연결해보세요.',
    hint: '침착하게 생각해요.',
    left: [
      { id: 'a1', text: '침착하게 대피하기' },
      { id: 'a2', text: '연기 반대 방향으로 가기' },
      { id: 'a3', text: '창문에서 도움 요청' },
    ],
    right: [
      { id: 'b1', text: '넘어지지 않으려고' },
      { id: 'b2', text: '안전한 쪽으로 나가려고' },
      { id: 'b3', text: '구조대가 찾도록' },
    ],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' },
  },

  // ───────────────────── 4단계 : 대피 순서 배열 (order) ─────────────────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'order',
    prompt: '불이 났을 때 행동 순서를 바르게 놓아보세요.',
    hint: '알리고 → 낮게 → 대피 → 신고예요.',
    cards: [
      { id: 'c1', text: '어른에게 알리기' },
      { id: 'c2', text: '낮은 자세로 이동하기' },
      { id: 'c3', text: '안전한 곳으로 대피하기' },
      { id: 'c4', text: '119에 신고하기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'order',
    prompt: '화재 대피 순서를 놓아보세요.',
    hint: '입을 막고 낮게 움직여요.',
    cards: [
      { id: 'c1', text: '"불이야!" 외치기' },
      { id: 'c2', text: '코와 입 막기' },
      { id: 'c3', text: '낮은 자세로 계단 이동' },
      { id: 'c4', text: '건물 밖으로 대피' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'order',
    prompt: '문을 열기 전후 순서를 놓아보세요.',
    hint: '문이 뜨거운지 먼저 확인해요.',
    cards: [
      { id: 'c1', text: '문 손잡이 온도 확인' },
      { id: 'c2', text: '안전하면 천천히 열기' },
      { id: 'c3', text: '연기 없는 길로 이동' },
      { id: 'c4', text: '밖으로 대피' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'order',
    prompt: '소화기 사용 순서를 놓아보세요.',
    hint: '안전핀부터 뽑아요.',
    cards: [
      { id: 'c1', text: '안전핀 뽑기' },
      { id: 'c2', text: '노즐을 불 쪽으로 향하기' },
      { id: 'c3', text: '손잡이 누르기' },
      { id: 'c4', text: '빗자루 쓸듯 뿌리기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'order',
    prompt: '대피 후 행동 순서를 놓아보세요.',
    hint: '밖에서 다시 들어가지 않아요.',
    cards: [
      { id: 'c1', text: '안전한 곳으로 모이기' },
      { id: 'c2', text: '빠진 사람 확인하기' },
      { id: 'c3', text: '소방관에게 알리기' },
      { id: 'c4', text: '다시 들어가지 않기' },
    ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'],
  },

  // ───────────────────── 5단계 : 상황별 대처 선택 (single + 상황) ─────────────────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'single',
    prompt: '상황을 보고 안전한 행동을 골라보세요.',
    scenario: '🍳 부엌에서 냄비에 불이 났어요.',
    hint: '가까이 가지 않아요.',
    options: [
      { id: 'o1', emoji: '🧑', text: '어른에게 알리고 멀리 떨어진다' },
      { id: 'o2', emoji: '✋', text: '가까이 가서 만져본다' },
      { id: 'o3', emoji: '💧', text: '기름불에 물을 무조건 붓는다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'single',
    prompt: '가장 안전한 행동은?',
    scenario: '🚪 방문 손잡이가 뜨거워요.',
    hint: '문 밖에 불이 있을 수 있어요.',
    options: [
      { id: 'o1', emoji: '🪟', text: '문을 열지 않고 다른 길을 찾는다' },
      { id: 'o2', emoji: '🚪', text: '그냥 문을 벌컥 연다' },
      { id: 'o3', emoji: '🛌', text: '침대에 숨는다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'single',
    prompt: '이럴 때 어떻게 해야 할까요?',
    scenario: '🔌 콘센트에서 타는 냄새와 연기가 나요.',
    hint: '만지지 말고 알려요.',
    options: [
      { id: 'o1', emoji: '🗣️', text: '만지지 말고 어른에게 바로 알린다' },
      { id: 'o2', emoji: '💦', text: '물을 뿌린다' },
      { id: 'o3', emoji: '🤚', text: '플러그를 맨손으로 세게 뽑는다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'single',
    prompt: '가장 안전한 행동을 골라보세요.',
    scenario: '🏢 복도에 연기가 가득 차 있어요.',
    hint: '연기가 적은 아래로 낮게 이동해요.',
    options: [
      { id: 'o1', emoji: '🧎', text: '낮은 자세로 벽을 짚고 이동한다' },
      { id: 'o2', emoji: '🏃', text: '똑바로 서서 뛴다' },
      { id: 'o3', emoji: '🛗', text: '엘리베이터로 내려간다' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'single',
    prompt: '나갈 수 없을 때 안전한 행동은?',
    scenario: '🚪 문 밖이 불과 연기로 막혀 나갈 수 없어요.',
    hint: '틈을 막고 구조를 기다려요.',
    options: [
      { id: 'o1', emoji: '🧴', text: '젖은 수건으로 문틈을 막고 창가에서 구조 요청' },
      { id: 'o2', emoji: '🔥', text: '연기 속으로 무작정 뛰어든다' },
      { id: 'o3', emoji: '🙈', text: '옷장 안에 숨는다' },
    ],
    answer: 'o1',
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
