/**
 * 긴급 전화번호 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제) · 드래그형
 * ---------------------------------------------------------------
 * 단계 흐름:
 *   1단계  번호 분류        상황 카드를 알맞은 번호 상자로 드래그      (sort, 112/119/114)
 *   2단계  상황-번호 연결   여러 상황을 112/119 상자로 분류 드래그     (sort)
 *   3단계  여러 상황 분류   상황 카드들을 112/119 상자로 분류          (sort)
 *   4단계  잘못된 신고 구분  '필요해요/필요없어요' 상자로 분류          (sort)
 *   5단계  복합 상황 판단   상황을 보고 알맞은 대처 카드를 담기         (pick)
 *
 * type 값:
 *   'sort'  → 아이템을 여러 상자로 분류.   answers = { itemId: binId }
 *   'pick'  → 아이템을 상자 하나로 드래그. answers = 정답 아이템 id 배열
 *
 * ⚠️ answers 는 검증용이라 프론트로 절대 내려가지 않는다.(sanitizeQuestion)
 */

const NUM_BINS = [
  { id: 'b_112', emoji: '👮', label: '112 (경찰)' },
  { id: 'b_119', emoji: '🚒', label: '119 (소방·구급)' },
  { id: 'b_114', emoji: '📞', label: '114 (안내)' },
];
const NUM2_BINS = [
  { id: 'b_112', emoji: '👮', label: '112 (경찰)' },
  { id: 'b_119', emoji: '🚒', label: '119 (소방·구급)' },
];
const NEED_BINS = [
  { id: 'b_need', emoji: '🚨', label: '긴급전화 필요해요' },
  { id: 'b_no', emoji: '🙅', label: '필요 없어요' },
];

const QUESTIONS = [
  // ───────────────────── 1단계 : 번호 분류 (sort, 112/119/114) ─────────────────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'sort',
    prompt: '상황에 맞는 번호 상자에 넣어보세요.',
    hint: '불은 소방서로!',
    bins: NUM_BINS,
    items: [{ id: 'i1', emoji: '🔥', text: '불이 났어요' }],
    answers: { i1: 'b_119' },
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'sort',
    prompt: '상황에 맞는 번호 상자에 넣어보세요.',
    hint: '도둑은 경찰에게!',
    bins: NUM_BINS,
    items: [{ id: 'i1', emoji: '🦹', text: '도둑을 봤어요' }],
    answers: { i1: 'b_112' },
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'sort',
    prompt: '상황에 맞는 번호 상자에 넣어보세요.',
    hint: '다치면 구급대가 와요.',
    bins: NUM_BINS,
    items: [{ id: 'i1', emoji: '🤕', text: '사람이 다쳤어요' }],
    answers: { i1: 'b_119' },
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'sort',
    prompt: '상황에 맞는 번호 상자에 넣어보세요.',
    hint: '교통사고도 119예요.',
    bins: NUM_BINS,
    items: [{ id: 'i1', emoji: '🚗', text: '교통사고가 났어요' }],
    answers: { i1: 'b_119' },
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'sort',
    prompt: '상황에 맞는 번호 상자에 넣어보세요.',
    hint: '낯선 사람이 위협하면 경찰!',
    bins: NUM_BINS,
    items: [{ id: 'i1', emoji: '😨', text: '낯선 사람이 따라와요' }],
    answers: { i1: 'b_112' },
  },

  // ───────────────────── 2단계 : 상황-번호 연결 (sort, 112/119) ─────────────────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'sort',
    prompt: '상황에 맞는 번호 상자에 나눠 담아보세요.',
    hint: '불·다침은 119, 도둑·싸움은 112.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🔥', text: '불이 났어요' },
      { id: 'i2', emoji: '🦹', text: '도둑을 봤어요' },
      { id: 'i3', emoji: '🤕', text: '사람이 다쳤어요' },
      { id: 'i4', emoji: '🥊', text: '누가 싸워요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112' },
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'sort',
    prompt: '알맞은 번호로 분류해 담아보세요.',
    hint: '연기·부상은 119.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🏠', text: '집에서 연기가 나요' },
      { id: 'i2', emoji: '👛', text: '지갑을 소매치기 당했어요' },
      { id: 'i3', emoji: '🩹', text: '계단에서 굴러 다쳤어요' },
      { id: 'i4', emoji: '👤', text: '수상한 사람이 있어요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112' },
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'sort',
    prompt: '상황을 번호 상자로 나눠 담아보세요.',
    hint: '가스·화상은 119.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🫧', text: '가스 냄새가 나요' },
      { id: 'i2', emoji: '🥊', text: '누가 때려요' },
      { id: 'i3', emoji: '🔥', text: '손을 데었어요' },
      { id: 'i4', emoji: '🚸', text: '누가 억지로 데려가려 해요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112' },
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'sort',
    prompt: '알맞은 번호로 담아보세요.',
    hint: '아프거나 불나면 119.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🌲', text: '산에 불이 났어요' },
      { id: 'i2', emoji: '🔫', text: '강도가 나타났어요' },
      { id: 'i3', emoji: '❤️', text: '가슴이 아파 쓰러졌어요' },
      { id: 'i4', emoji: '🎒', text: '가방을 도둑맞았어요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112' },
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'sort',
    prompt: '상황을 번호 상자로 나눠 담아보세요.',
    hint: '쓰러짐·화재는 119.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🏢', text: '건물에 불이 났어요' },
      { id: 'i2', emoji: '🤛', text: '누가 폭력을 써요' },
      { id: 'i3', emoji: '😵', text: '갑자기 쓰러졌어요' },
      { id: 'i4', emoji: '🚪', text: '도둑이 집에 들어왔어요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112' },
  },

  // ───────────────────── 3단계 : 여러 상황 분류 (sort, 112/119, 더 많이) ─────────────────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'sort',
    prompt: '여러 상황을 알맞은 번호 상자에 모두 나눠 담아보세요.',
    hint: '천천히 하나씩 생각해요.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🔥', text: '불이 났어요' },
      { id: 'i2', emoji: '🦹', text: '도둑을 봤어요' },
      { id: 'i3', emoji: '🤕', text: '사람이 다쳤어요' },
      { id: 'i4', emoji: '🚗', text: '교통사고가 났어요' },
      { id: 'i5', emoji: '👊', text: '누가 위협해요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_119', i5: 'b_112' },
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'sort',
    prompt: '상황을 번호별로 모두 분류해 담아보세요.',
    hint: '몸이 아프면 119예요.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🫧', text: '가스가 새요' },
      { id: 'i2', emoji: '👛', text: '소매치기를 당했어요' },
      { id: 'i3', emoji: '🥵', text: '열이 심해 쓰러졌어요' },
      { id: 'i4', emoji: '🔥', text: '주방에 불이 났어요' },
      { id: 'i5', emoji: '👤', text: '수상한 사람이 따라와요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_119', i5: 'b_112' },
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'sort',
    prompt: '모든 상황을 알맞은 번호로 나눠 담아보세요.',
    hint: '도난·폭력은 112.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🩹', text: '피가 많이 나요' },
      { id: 'i2', emoji: '🚪', text: '집에 도둑이 들어왔어요' },
      { id: 'i3', emoji: '🌲', text: '산불이 번져요' },
      { id: 'i4', emoji: '🥊', text: '싸움이 났어요' },
      { id: 'i5', emoji: '🚑', text: '숨을 못 쉬어요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112', i5: 'b_119' },
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'sort',
    prompt: '상황을 번호 상자로 모두 분류해 담아보세요.',
    hint: '불·구조는 119.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🏢', text: '건물에서 연기가 나요' },
      { id: 'i2', emoji: '🔫', text: '강도를 만났어요' },
      { id: 'i3', emoji: '🚗', text: '차 사고로 다쳤어요' },
      { id: 'i4', emoji: '🎒', text: '가방을 도둑맞았어요' },
      { id: 'i5', emoji: '😵', text: '친구가 정신을 잃었어요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112', i5: 'b_119' },
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'sort',
    prompt: '모든 상황을 알맞은 번호로 담아보세요.',
    hint: '위협·범죄는 112.',
    bins: NUM2_BINS,
    items: [
      { id: 'i1', emoji: '🔥', text: '옷에 불이 붙었어요' },
      { id: 'i2', emoji: '🚸', text: '누가 억지로 데려가려 해요' },
      { id: 'i3', emoji: '❤️', text: '가슴을 아파해요' },
      { id: 'i4', emoji: '💰', text: '돈을 빼앗겼어요' },
      { id: 'i5', emoji: '🌫️', text: '집에 연기가 가득해요' },
    ],
    answers: { i1: 'b_119', i2: 'b_112', i3: 'b_119', i4: 'b_112', i5: 'b_119' },
  },

  // ───────────────────── 4단계 : 잘못된 신고 구분 (sort, 필요/불필요) ─────────────────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'sort',
    prompt: '긴급전화가 필요한 상황과 아닌 상황을 나눠 담아보세요.',
    hint: '장난전화는 하면 안 돼요.',
    bins: NEED_BINS,
    items: [
      { id: 'i1', emoji: '🔥', text: '불이 났어요' },
      { id: 'i2', emoji: '🤕', text: '사람이 다쳤어요' },
      { id: 'i3', emoji: '😐', text: '심심해서 전화하고 싶어요' },
      { id: 'i4', emoji: '🎮', text: '게임하다 짜증나서' },
    ],
    answers: { i1: 'b_need', i2: 'b_need', i3: 'b_no', i4: 'b_no' },
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'sort',
    prompt: '필요한 신고와 아닌 것을 나눠 담아보세요.',
    hint: '진짜 위험할 때만 걸어요.',
    bins: NEED_BINS,
    items: [
      { id: 'i1', emoji: '🦹', text: '강도가 나타났어요' },
      { id: 'i2', emoji: '🚗', text: '교통사고가 났어요' },
      { id: 'i3', emoji: '😜', text: '장난으로 전화하기' },
      { id: 'i4', emoji: '😪', text: '심심해서 전화하기' },
    ],
    answers: { i1: 'b_need', i2: 'b_need', i3: 'b_no', i4: 'b_no' },
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'sort',
    prompt: '긴급전화가 필요한지 나눠 담아보세요.',
    hint: '급하지 않으면 필요 없어요.',
    bins: NEED_BINS,
    items: [
      { id: 'i1', emoji: '🌫️', text: '집에 연기가 가득해요' },
      { id: 'i2', emoji: '😵', text: '사람이 쓰러졌어요' },
      { id: 'i3', emoji: '🍫', text: '배고파서 전화하기' },
      { id: 'i4', emoji: '📺', text: '만화 얘기하려고' },
    ],
    answers: { i1: 'b_need', i2: 'b_need', i3: 'b_no', i4: 'b_no' },
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'sort',
    prompt: '필요한 상황과 아닌 상황을 나눠 담아보세요.',
    hint: '위험이 아니면 필요 없어요.',
    bins: NEED_BINS,
    items: [
      { id: 'i1', emoji: '🫧', text: '가스가 새요' },
      { id: 'i2', emoji: '🚪', text: '도둑이 들어왔어요' },
      { id: 'i3', emoji: '💬', text: '친구랑 수다 떨려고' },
      { id: 'i4', emoji: '☀️', text: '날씨가 궁금해서' },
    ],
    answers: { i1: 'b_need', i2: 'b_need', i3: 'b_no', i4: 'b_no' },
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'sort',
    prompt: '긴급전화가 필요한지 나눠 담아보세요.',
    hint: '진짜 급할 때만!',
    bins: NEED_BINS,
    items: [
      { id: 'i1', emoji: '🏢', text: '건물에 불이 났어요' },
      { id: 'i2', emoji: '🚸', text: '누가 유괴하려 해요' },
      { id: 'i3', emoji: '📚', text: '숙제를 물어보려고' },
      { id: 'i4', emoji: '😑', text: '그냥 심심해서' },
    ],
    answers: { i1: 'b_need', i2: 'b_need', i3: 'b_no', i4: 'b_no' },
  },

  // ───────────────────── 5단계 : 복합 상황 판단 (pick, 알맞은 대처 담기) ─────────────────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'pick',
    prompt: '상황을 보고 알맞은 대처를 상자에 담아보세요.',
    scenario: '🚗 길에서 사람이 다치고 차 사고도 났어요.',
    hint: '도움을 요청해요.',
    target: '알맞은 대처 상자 ✅',
    items: [
      { id: 'i1', emoji: '🚑', text: '119에 도움을 요청한다' },
      { id: 'i2', emoji: '😜', text: '장난으로 112에 전화한다' },
      { id: 'i3', emoji: '🚶', text: '그냥 지나간다' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'pick',
    prompt: '알맞은 대처를 담아보세요.',
    scenario: '🔥 집에서 불이 나고 연기가 가득해요.',
    hint: '먼저 대피하고 신고해요.',
    target: '알맞은 대처 상자 ✅',
    items: [
      { id: 'i1', emoji: '🚒', text: '대피한 뒤 119에 신고한다' },
      { id: 'i2', emoji: '👀', text: '불을 가까이서 구경한다' },
      { id: 'i3', emoji: '🙈', text: '이불 속에 숨는다' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'pick',
    prompt: '알맞은 대처를 상자에 담아보세요.',
    scenario: '🦹 낯선 사람이 집에 들어오려고 해요.',
    hint: '문을 잠그고 경찰에!',
    target: '알맞은 대처 상자 ✅',
    items: [
      { id: 'i1', emoji: '👮', text: '문을 잠그고 112에 신고한다' },
      { id: 'i2', emoji: '🚪', text: '문을 열어준다' },
      { id: 'i3', emoji: '🧸', text: '같이 논다' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'pick',
    prompt: '알맞은 대처를 담아보세요.',
    scenario: '🤕 친구가 계단에서 굴러 크게 다쳤어요.',
    hint: '어른을 부르고 119!',
    target: '알맞은 대처 상자 ✅',
    items: [
      { id: 'i1', emoji: '🧑‍🚒', text: '어른을 부르고 119에 신고한다' },
      { id: 'i2', emoji: '😰', text: '마구 흔들어 깨운다' },
      { id: 'i3', emoji: '🏃', text: '혼자 억지로 옮긴다' },
    ],
    answers: ['i1'],
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'pick',
    prompt: '알맞은 대처를 상자에 담아보세요.',
    scenario: '🫧 집에서 가스 냄새가 심하게 나요.',
    hint: '불을 켜면 안 돼요!',
    target: '알맞은 대처 상자 ✅',
    items: [
      { id: 'i1', emoji: '🚨', text: '불을 켜지 말고 어른께 알린 뒤 119' },
      { id: 'i2', emoji: '💡', text: '불을 켜서 확인한다' },
      { id: 'i3', emoji: '😐', text: '창문도 안 열고 그냥 둔다' },
    ],
    answers: ['i1'],
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
