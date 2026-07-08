/**
 * 전기 안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 조작: 전기 주변 위험 물건을 안전 상자로 '드래그'해 치우기(pick) / 행동 분류(sort).
 *   1단계  위험 물건 1개 치우기
 *   2단계  위험 물건 여러 개 치우기
 *   3단계  안전/위험 물건 구분(위험한 것만 담기)
 *   4단계  전기 사용 행동 분류(안전/위험)
 *   5단계  방 안 전기 위험 정리(여러 개)
 *
 * type: 'pick' → answers = 담아야 할 id 배열 / 'sort' → answers = { itemId: binId }
 */

const SAFE_DANGER_BINS = [
  { id: 'b_safe', emoji: '🙂', label: '안전해요' },
  { id: 'b_danger', emoji: '⚠️', label: '위험해요' },
];

const QUESTIONS = [
  // ───────── 1단계 : 위험 물건 1개 치우기 (pick) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'pick', prompt: '콘센트 주변의 위험한 물건을 치워보세요.', hint: '전기 옆에 물은 위험해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🥤', text: '콘센트 옆 물컵' }, { id: 'i2', emoji: '📖', text: '책' }, { id: 'i3', emoji: '✏️', text: '연필' }], answers: ['i1'] },
  { id: 'l1-q2', stage: 1, order: 2, type: 'pick', prompt: '전기 주변 위험한 물건을 치워보세요.', hint: '젖은 것은 전기와 위험해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '💧', text: '멀티탭 위 젖은 수건' }, { id: 'i2', emoji: '🧸', text: '인형' }, { id: 'i3', emoji: '📓', text: '공책' }], answers: ['i1'] },
  { id: 'l1-q3', stage: 1, order: 3, type: 'pick', prompt: '위험한 물건을 치워보세요.', hint: '먼지는 불이 날 수 있어요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🌫️', text: '먼지 쌓인 플러그' }, { id: 'i2', emoji: '🖍️', text: '크레용' }, { id: 'i3', emoji: '🧱', text: '블록' }], answers: ['i1'] },
  { id: 'l1-q4', stage: 1, order: 4, type: 'pick', prompt: '위험한 물건을 치워보세요.', hint: '전선이 벗겨지면 위험해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🧵', text: '벗겨진 전선' }, { id: 'i2', emoji: '🍎', text: '사과' }, { id: 'i3', emoji: '📕', text: '그림책' }], answers: ['i1'] },
  { id: 'l1-q5', stage: 1, order: 5, type: 'pick', prompt: '충전기 주변 위험한 물건을 치워보세요.', hint: '충전기를 덮으면 뜨거워져요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🧣', text: '충전기 위 이불' }, { id: 'i2', emoji: '🧸', text: '인형' }, { id: 'i3', emoji: '🎨', text: '색종이' }], answers: ['i1'] },

  // ───────── 2단계 : 위험 물건 여러 개 치우기 (pick 다중) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'pick', prompt: '전기 주변의 위험한 물건을 모두 치워보세요.', hint: '위험한 것이 세 개예요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🥤', text: '콘센트 옆 물컵' }, { id: 'i2', emoji: '🌫️', text: '멀티탭 위 먼지' }, { id: 'i3', emoji: '🧣', text: '충전기 위 이불' }, { id: 'i4', emoji: '🧸', text: '인형' }], answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q2', stage: 2, order: 2, type: 'pick', prompt: '위험한 물건을 모두 안전 상자에 넣어보세요.', hint: '물·젖은 손·벗겨진 전선을 조심해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '💧', text: '젖은 걸레' }, { id: 'i2', emoji: '🧵', text: '벗겨진 전선' }, { id: 'i3', emoji: '🥤', text: '음료수 컵' }, { id: 'i4', emoji: '📖', text: '책' }], answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q3', stage: 2, order: 3, type: 'pick', prompt: '전기 화재를 일으킬 수 있는 것을 모두 치워보세요.', hint: '먼지·과부하·이불을 조심해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🌫️', text: '먼지 낀 콘센트' }, { id: 'i2', emoji: '🔌', text: '문어발 멀티탭' }, { id: 'i3', emoji: '🧣', text: '전선 위 담요' }, { id: 'i4', emoji: '🧱', text: '블록' }], answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q4', stage: 2, order: 4, type: 'pick', prompt: '위험한 물건을 모두 치워보세요.', hint: '전기 옆 물과 금속을 조심해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🥤', text: '콘센트 옆 물' }, { id: 'i2', emoji: '🍴', text: '콘센트에 꽂은 포크' }, { id: 'i3', emoji: '💧', text: '젖은 손수건' }, { id: 'i4', emoji: '🧸', text: '곰인형' }], answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q5', stage: 2, order: 5, type: 'pick', prompt: '위험한 물건을 모두 안전 상자에 넣어보세요.', hint: '뜨거워지거나 불이 날 것을 조심해요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🔌', text: '과열된 멀티탭' }, { id: 'i2', emoji: '🧵', text: '낡은 전선' }, { id: 'i3', emoji: '🧣', text: '충전기 덮은 옷' }, { id: 'i4', emoji: '📓', text: '공책' }], answers: ['i1', 'i2', 'i3'] },

  // ───────── 3단계 : 안전/위험 물건 구분 (위험한 것만 담기, safe 방해물 포함) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'pick', prompt: '위험한 물건만 골라 안전 상자에 넣어보세요.', hint: '안전한 물건은 그대로 두어요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🥤', text: '물컵' }, { id: 'i2', emoji: '📖', text: '책' }, { id: 'i3', emoji: '🌫️', text: '먼지 쌓인 멀티탭' }, { id: 'i4', emoji: '🧸', text: '인형' }, { id: 'i5', emoji: '🧵', text: '벗겨진 전선' }], answers: ['i1', 'i3', 'i5'] },
  { id: 'l3-q2', stage: 3, order: 2, type: 'pick', prompt: '전기 옆에서 위험한 것만 골라 담아보세요.', hint: '일반 물건은 두어요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '💧', text: '젖은 수건' }, { id: 'i2', emoji: '🖍️', text: '크레용' }, { id: 'i3', emoji: '🍴', text: '금속 포크' }, { id: 'i4', emoji: '📓', text: '공책' }, { id: 'i5', emoji: '🔌', text: '문어발 멀티탭' }], answers: ['i1', 'i3', 'i5'] },
  { id: 'l3-q3', stage: 3, order: 3, type: 'pick', prompt: '위험한 것만 골라 치워보세요.', hint: '불이 나거나 감전될 것을 골라요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🌫️', text: '먼지 낀 플러그' }, { id: 'i2', emoji: '🧱', text: '블록' }, { id: 'i3', emoji: '🥤', text: '콘센트 옆 음료' }, { id: 'i4', emoji: '🎨', text: '색종이' }, { id: 'i5', emoji: '🧣', text: '전선 위 담요' }], answers: ['i1', 'i3', 'i5'] },
  { id: 'l3-q4', stage: 3, order: 4, type: 'pick', prompt: '위험한 물건만 골라 담아보세요.', hint: '안전한 물건은 남겨요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🧵', text: '낡은 전선' }, { id: 'i2', emoji: '📕', text: '그림책' }, { id: 'i3', emoji: '💧', text: '젖은 걸레' }, { id: 'i4', emoji: '🧸', text: '토끼 인형' }, { id: 'i5', emoji: '🔌', text: '과열 멀티탭' }], answers: ['i1', 'i3', 'i5'] },
  { id: 'l3-q5', stage: 3, order: 5, type: 'pick', prompt: '위험한 것만 골라 안전 상자에 넣어보세요.', hint: '전기 사고를 낼 것을 골라요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🍴', text: '콘센트 속 포크' }, { id: 'i2', emoji: '📖', text: '동화책' }, { id: 'i3', emoji: '🌫️', text: '먼지 낀 콘센트' }, { id: 'i4', emoji: '🖍️', text: '색연필' }, { id: 'i5', emoji: '🥤', text: '콘센트 옆 물컵' }], answers: ['i1', 'i3', 'i5'] },

  // ───────── 4단계 : 전기 사용 행동 분류 (sort 안전/위험) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'sort', prompt: '전기 사용 행동을 안전/위험으로 나눠보세요.', hint: '젖은 손은 위험해요.', bins: SAFE_DANGER_BINS,
    items: [{ id: 'i1', emoji: '💧', text: '젖은 손으로 콘센트 만지기' }, { id: 'i2', emoji: '🔌', text: '플러그를 바르게 뽑기' }, { id: 'i3', emoji: '🧸', text: '콘센트에 장난감 넣기' }, { id: 'i4', emoji: '🧑', text: '어른에게 도움 요청하기' }],
    answers: { i1: 'b_danger', i2: 'b_safe', i3: 'b_danger', i4: 'b_safe' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'sort', prompt: '행동을 안전/위험으로 나눠보세요.', hint: '전선을 잡아당기면 위험해요.', bins: SAFE_DANGER_BINS,
    items: [{ id: 'i1', emoji: '🧶', text: '전선을 잡아당겨 뽑기' }, { id: 'i2', emoji: '✋', text: '플러그 머리를 잡고 뽑기' }, { id: 'i3', emoji: '🍴', text: '콘센트에 젓가락 넣기' }, { id: 'i4', emoji: '🔌', text: '안 쓰는 플러그 뽑아두기' }],
    answers: { i1: 'b_danger', i2: 'b_safe', i3: 'b_danger', i4: 'b_safe' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'sort', prompt: '행동을 안전/위험으로 나눠보세요.', hint: '물 근처 전기는 위험해요.', bins: SAFE_DANGER_BINS,
    items: [{ id: 'i1', emoji: '🛁', text: '욕실에서 젖은 손으로 드라이기' }, { id: 'i2', emoji: '🧼', text: '손을 말리고 사용하기' }, { id: 'i3', emoji: '🔌', text: '문어발로 많이 꽂기' }, { id: 'i4', emoji: '🧑', text: '고장난 건 어른께 말하기' }],
    answers: { i1: 'b_danger', i2: 'b_safe', i3: 'b_danger', i4: 'b_safe' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'sort', prompt: '행동을 안전/위험으로 나눠보세요.', hint: '함부로 만지면 위험해요.', bins: SAFE_DANGER_BINS,
    items: [{ id: 'i1', emoji: '⚡', text: '벗겨진 전선 맨손으로 만지기' }, { id: 'i2', emoji: '🧤', text: '고장난 전선은 만지지 않기' }, { id: 'i3', emoji: '💦', text: '콘센트에 물 뿌리기' }, { id: 'i4', emoji: '🔌', text: '쓰고 나면 플러그 뽑기' }],
    answers: { i1: 'b_danger', i2: 'b_safe', i3: 'b_danger', i4: 'b_safe' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'sort', prompt: '행동을 안전/위험으로 나눠보세요.', hint: '전기 근처 장난은 위험해요.', bins: SAFE_DANGER_BINS,
    items: [{ id: 'i1', emoji: '🔩', text: '콘센트 구멍에 물건 넣기' }, { id: 'i2', emoji: '🧑', text: '어른과 함께 사용하기' }, { id: 'i3', emoji: '🧣', text: '전선을 이불로 덮기' }, { id: 'i4', emoji: '🧹', text: '콘센트 먼지 닦아두기' }],
    answers: { i1: 'b_danger', i2: 'b_safe', i3: 'b_danger', i4: 'b_safe' } },

  // ───────── 5단계 : 방 안 전기 위험 정리 (pick 다중, 4개) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'pick', prompt: '방 안의 전기 위험 요소를 모두 정리해보세요.', hint: '위험한 것이 네 개예요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🔌', text: '멀티탭에 너무 많은 플러그' }, { id: 'i2', emoji: '🥤', text: '콘센트 옆 물컵' }, { id: 'i3', emoji: '🧵', text: '벗겨진 전선' }, { id: 'i4', emoji: '🧣', text: '충전기 위 이불' }, { id: 'i5', emoji: '🧸', text: '인형' }], answers: ['i1', 'i2', 'i3', 'i4'] },
  { id: 'l5-q2', stage: 5, order: 2, type: 'pick', prompt: '전기 위험 요소를 모두 정리해보세요.', hint: '일반 물건은 두어요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🌫️', text: '먼지 낀 콘센트' }, { id: 'i2', emoji: '💧', text: '젖은 걸레' }, { id: 'i3', emoji: '🍴', text: '콘센트 속 포크' }, { id: 'i4', emoji: '🔌', text: '문어발 멀티탭' }, { id: 'i5', emoji: '📖', text: '책' }], answers: ['i1', 'i2', 'i3', 'i4'] },
  { id: 'l5-q3', stage: 5, order: 3, type: 'pick', prompt: '방 안 위험 요소를 모두 정리해보세요.', hint: '불이 나거나 감전될 것을 모두 담아요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🧣', text: '전선 위 담요' }, { id: 'i2', emoji: '🥤', text: '음료수 컵' }, { id: 'i3', emoji: '🧵', text: '낡은 전선' }, { id: 'i4', emoji: '🔌', text: '과열 멀티탭' }, { id: 'i5', emoji: '🎨', text: '색종이' }], answers: ['i1', 'i2', 'i3', 'i4'] },
  { id: 'l5-q4', stage: 5, order: 4, type: 'pick', prompt: '전기 위험을 모두 치워보세요.', hint: '안전한 것은 남겨요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '💧', text: '젖은 수건' }, { id: 'i2', emoji: '🌫️', text: '먼지 낀 플러그' }, { id: 'i3', emoji: '🍴', text: '금속 젓가락' }, { id: 'i4', emoji: '🧣', text: '충전기 덮은 옷' }, { id: 'i5', emoji: '🧸', text: '곰인형' }], answers: ['i1', 'i2', 'i3', 'i4'] },
  { id: 'l5-q5', stage: 5, order: 5, type: 'pick', prompt: '방 안의 전기 위험 요소를 모두 정리해보세요.', hint: '위험한 것 네 개를 모두 담아요.', target: '안전 상자 🧺',
    items: [{ id: 'i1', emoji: '🔌', text: '과부하 멀티탭' }, { id: 'i2', emoji: '🥤', text: '콘센트 옆 물' }, { id: 'i3', emoji: '🧵', text: '벗겨진 전선' }, { id: 'i4', emoji: '🌫️', text: '먼지 쌓인 콘센트' }, { id: 'i5', emoji: '📓', text: '공책' }], answers: ['i1', 'i2', 'i3', 'i4'] },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
