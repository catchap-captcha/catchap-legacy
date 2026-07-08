/**
 * 미아 안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 조작이 단계마다 다르게 섞임:
 *   1단계  안전 장소 선택        (single)
 *   2단계  안전 장소로 이동      (place — 캐릭터 드래그)
 *   3단계  위험 장소 피하기      (route — 경로 드래그)
 *   4단계  장소-행동 연결        (connect — 선 연결)
 *   5단계  복합 지도 경로        (route — 경로 드래그)
 *
 * place: zones[{id,x,y,w,h,label,emoji}], start, answer=안전 zone id
 * route: dest{x,y,w,h,label}, dangerZones[{x,y,w,h,label,emoji}], start
 *   (route 는 서버가 경로를 재검증: 목적지 도달 && 위험구역 0)
 */

const QUESTIONS = [
  // ───────── 1단계 : 안전 장소 선택 (single) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'single', prompt: '길을 잃었을 때 도움을 받을 수 있는 곳을 골라보세요.', hint: '어른들이 도와주는 곳이에요.',
    options: [{ id: 'o1', emoji: '👮', text: '경찰서' }, { id: 'o2', emoji: '🚗', text: '모르는 사람 차' }, { id: 'o3', emoji: '🌑', text: '어두운 골목' }], answer: 'o1' },
  { id: 'l1-q2', stage: 1, order: 2, type: 'single', prompt: '마트에서 길을 잃었어요. 어디로 가야 할까요?', hint: '직원이 있는 곳을 찾아요.',
    options: [{ id: 'o1', emoji: '🛎️', text: '안내데스크' }, { id: 'o2', emoji: '🚪', text: '마트 밖 주차장' }, { id: 'o3', emoji: '🚗', text: '낯선 아저씨를 따라가기' }], answer: 'o1' },
  { id: 'l1-q3', stage: 1, order: 3, type: 'single', prompt: '도움을 요청하기 좋은 안전한 사람을 골라보세요.', hint: '제복을 입은 사람을 찾아요.',
    options: [{ id: 'o1', emoji: '👮', text: '경찰관·안전요원' }, { id: 'o2', emoji: '🕶️', text: '따라오라는 낯선 사람' }, { id: 'o3', emoji: '🚗', text: '태워주겠다는 사람' }], answer: 'o1' },
  { id: 'l1-q4', stage: 1, order: 4, type: 'single', prompt: '길을 잃었을 때 안전한 장소를 골라보세요.', hint: '사람이 많고 밝은 곳이 안전해요.',
    options: [{ id: 'o1', emoji: '🏪', text: '편의점(직원에게 도움 요청)' }, { id: 'o2', emoji: '🌑', text: '사람 없는 어두운 길' }, { id: 'o3', emoji: '🅿️', text: '지하 주차장' }], answer: 'o1' },
  { id: 'l1-q5', stage: 1, order: 5, type: 'single', prompt: '학교 근처에서 길을 잃으면 누구에게 도움을 청할까요?', hint: '믿을 수 있는 어른이에요.',
    options: [{ id: 'o1', emoji: '🧑‍🏫', text: '선생님·학교 보안관' }, { id: 'o2', emoji: '🚗', text: '차에 타라는 사람' }, { id: 'o3', emoji: '🎁', text: '선물 준다는 낯선 사람' }], answer: 'o1' },

  // ───────── 2단계 : 안전 장소로 이동 (place) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'place', character: '🧒', prompt: '마트에서 부모님을 잃어버렸어요. 아이를 안전한 도움 장소로 옮겨보세요.', hint: '직원이 있는 안내데스크로!', start: { x: 48, y: 84 },
    zones: [{ id: 'z1', emoji: '🛎️', label: '안내데스크', x: 60, y: 14, w: 30, h: 32 }, { id: 'z2', emoji: '🚗', label: '주차장', x: 10, y: 14, w: 30, h: 32 }], answer: 'z1' },
  { id: 'l2-q2', stage: 2, order: 2, type: 'place', character: '🧒', prompt: '아이를 안전한 도움 장소로 이동시켜보세요.', hint: '경찰서로 가면 안전해요.', start: { x: 48, y: 84 },
    zones: [{ id: 'z1', emoji: '👮', label: '경찰서', x: 60, y: 14, w: 30, h: 32 }, { id: 'z2', emoji: '🌑', label: '어두운 골목', x: 10, y: 14, w: 30, h: 32 }], answer: 'z1' },
  { id: 'l2-q3', stage: 2, order: 3, type: 'place', character: '🧒', prompt: '아이를 안전한 곳으로 옮겨보세요.', hint: '사람 많은 편의점이 안전해요.', start: { x: 48, y: 84 },
    zones: [{ id: 'z1', emoji: '🏪', label: '편의점', x: 60, y: 14, w: 30, h: 32 }, { id: 'z2', emoji: '🚗', label: '모르는 사람 차', x: 10, y: 14, w: 30, h: 32 }], answer: 'z1' },
  { id: 'l2-q4', stage: 2, order: 4, type: 'place', character: '🧒', prompt: '놀이공원에서 길을 잃었어요. 안전한 곳으로 이동하세요.', hint: '미아보호소로 가요.', start: { x: 48, y: 84 },
    zones: [{ id: 'z1', emoji: '🧸', label: '미아보호소', x: 60, y: 14, w: 30, h: 32 }, { id: 'z2', emoji: '🚪', label: '출구 밖', x: 10, y: 14, w: 30, h: 32 }], answer: 'z1' },
  { id: 'l2-q5', stage: 2, order: 5, type: 'place', character: '🧒', prompt: '지하철역에서 길을 잃었어요. 안전한 곳으로 이동하세요.', hint: '역무원이 있는 곳으로!', start: { x: 48, y: 84 },
    zones: [{ id: 'z1', emoji: '🎫', label: '역무실(직원)', x: 60, y: 14, w: 30, h: 32 }, { id: 'z2', emoji: '🚇', label: '선로 쪽', x: 10, y: 14, w: 30, h: 32 }], answer: 'z1' },

  // ───────── 3단계 : 위험 장소 피하기 (route) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'route', character: '🧒', prompt: '위험한 곳을 피해 안전한 안내데스크까지 가보세요.', hint: '주차장과 어두운 골목을 지나지 않아요.', start: { x: 8, y: 86 },
    dest: { x: 74, y: 8, w: 22, h: 22, emoji: '🛎️', label: '안내데스크' },
    dangerZones: [{ x: 30, y: 36, w: 24, h: 24, emoji: '🚗', label: '주차장' }, { x: 54, y: 58, w: 24, h: 24, emoji: '🌑', label: '어두운 골목' }] },
  { id: 'l3-q2', stage: 3, order: 2, type: 'route', character: '🧒', prompt: '위험한 곳을 피해 경찰서까지 가보세요.', hint: '낯선 차와 공사장을 피해요.', start: { x: 8, y: 86 },
    dest: { x: 74, y: 8, w: 22, h: 22, emoji: '👮', label: '경찰서' },
    dangerZones: [{ x: 28, y: 30, w: 24, h: 24, emoji: '🚗', label: '모르는 사람 차' }, { x: 52, y: 56, w: 26, h: 24, emoji: '🚧', label: '공사장' }] },
  { id: 'l3-q3', stage: 3, order: 3, type: 'route', character: '🧒', prompt: '위험한 곳을 피해 편의점까지 가보세요.', hint: '어두운 길과 하천을 피해요.', start: { x: 8, y: 86 },
    dest: { x: 74, y: 10, w: 22, h: 22, emoji: '🏪', label: '편의점' },
    dangerZones: [{ x: 32, y: 40, w: 24, h: 22, emoji: '🌑', label: '어두운 길' }, { x: 56, y: 60, w: 24, h: 22, emoji: '🌊', label: '하천' }] },
  { id: 'l3-q4', stage: 3, order: 4, type: 'route', character: '🧒', prompt: '위험한 곳을 피해 미아보호소까지 가보세요.', hint: '주차장과 출구 밖은 피해요.', start: { x: 8, y: 86 },
    dest: { x: 74, y: 8, w: 22, h: 22, emoji: '🧸', label: '미아보호소' },
    dangerZones: [{ x: 30, y: 34, w: 24, h: 24, emoji: '🅿️', label: '주차장' }, { x: 54, y: 58, w: 24, h: 24, emoji: '🚪', label: '출구 밖' }] },
  { id: 'l3-q5', stage: 3, order: 5, type: 'route', character: '🧒', prompt: '위험한 곳을 피해 역무실까지 가보세요.', hint: '선로와 인적 드문 통로를 피해요.', start: { x: 8, y: 86 },
    dest: { x: 74, y: 10, w: 22, h: 22, emoji: '🎫', label: '역무실' },
    dangerZones: [{ x: 30, y: 38, w: 24, h: 22, emoji: '🚇', label: '선로 쪽' }, { x: 54, y: 58, w: 24, h: 22, emoji: '🕳️', label: '빈 통로' }] },

  // ───────── 4단계 : 장소-행동 연결 (connect) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'connect', prompt: '도움 받을 장소와 알맞은 행동을 연결해보세요.', hint: '장소마다 할 말이 달라요.',
    left: [{ id: 'a1', text: '👮 경찰서' }, { id: 'a2', text: '🛎️ 마트 안내데스크' }, { id: 'a3', text: '🚗 모르는 사람 차' }],
    right: [{ id: 'b1', text: '길을 잃었다고 말하기' }, { id: 'b2', text: '부모님을 찾아달라고 하기' }, { id: 'b3', text: '타지 않기' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'connect', prompt: '장소와 알맞은 행동을 연결해보세요.', hint: '누구에게 무엇을 말할지 생각해요.',
    left: [{ id: 'a1', text: '🧑‍🏫 학교' }, { id: 'a2', text: '🏪 편의점' }, { id: 'a3', text: '🎁 선물 준다는 사람' }],
    right: [{ id: 'b1', text: '선생님께 도움 요청하기' }, { id: 'b2', text: '직원에게 도움 요청하기' }, { id: 'b3', text: '따라가지 않기' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'connect', prompt: '장소와 알맞은 행동을 연결해보세요.', hint: '안전한 사람에게 도움을 청해요.',
    left: [{ id: 'a1', text: '🧸 미아보호소' }, { id: 'a2', text: '👮 경찰관' }, { id: 'a3', text: '🌑 어두운 골목' }],
    right: [{ id: 'b1', text: '이름과 부모님 알려주기' }, { id: 'b2', text: '도와달라고 말하기' }, { id: 'b3', text: '들어가지 않기' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'connect', prompt: '장소와 알맞은 행동을 연결해보세요.', hint: '연락과 도움을 떠올려요.',
    left: [{ id: 'a1', text: '🎫 역무실' }, { id: 'a2', text: '📞 공중전화' }, { id: 'a3', text: '🚕 낯선 차' }],
    right: [{ id: 'b1', text: '역무원에게 도움 요청' }, { id: 'b2', text: '112·부모님께 전화' }, { id: 'b3', text: '절대 타지 않기' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'connect', prompt: '장소와 알맞은 행동을 연결해보세요.', hint: '제자리·도움·거절을 생각해요.',
    left: [{ id: 'a1', text: '📍 잃어버린 그 자리' }, { id: 'a2', text: '🛎️ 안내센터' }, { id: 'a3', text: '🍬 사탕 주는 낯선 사람' }],
    right: [{ id: 'b1', text: '그 자리에서 잠시 기다리기' }, { id: 'b2', text: '방송으로 찾아달라 하기' }, { id: 'b3', text: '받지 않고 자리 피하기' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },

  // ───────── 5단계 : 복합 지도 경로 (route, 위험 3곳) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'route', character: '🧒', prompt: '놀이공원에서 부모님을 잃어버렸어요. 안전한 안내센터까지 가는 길을 그려보세요.', hint: '위험한 곳 세 군데를 모두 피해요.', start: { x: 8, y: 88 },
    dest: { x: 76, y: 8, w: 20, h: 20, emoji: '🛎️', label: '안내센터' },
    dangerZones: [{ x: 26, y: 30, w: 20, h: 20, emoji: '🚪', label: '출구 밖' }, { x: 50, y: 52, w: 20, h: 20, emoji: '🅿️', label: '주차장' }, { x: 30, y: 66, w: 20, h: 18, emoji: '🚗', label: '모르는 사람 차' }] },
  { id: 'l5-q2', stage: 5, order: 2, type: 'route', character: '🧒', prompt: '지하철역에서 안전한 역무실까지 가는 길을 그려보세요.', hint: '선로·출구 밖·어두운 통로를 피해요.', start: { x: 8, y: 88 },
    dest: { x: 76, y: 8, w: 20, h: 20, emoji: '🎫', label: '역무실' },
    dangerZones: [{ x: 26, y: 30, w: 20, h: 20, emoji: '🚇', label: '선로' }, { x: 50, y: 52, w: 20, h: 20, emoji: '🚪', label: '출구 밖' }, { x: 30, y: 66, w: 20, h: 18, emoji: '🌑', label: '어두운 통로' }] },
  { id: 'l5-q3', stage: 5, order: 3, type: 'route', character: '🧒', prompt: '큰 마트에서 안내데스크까지 안전한 길을 그려보세요.', hint: '주차장·창고·낯선 차를 피해요.', start: { x: 8, y: 88 },
    dest: { x: 76, y: 8, w: 20, h: 20, emoji: '🛎️', label: '안내데스크' },
    dangerZones: [{ x: 26, y: 30, w: 20, h: 20, emoji: '🅿️', label: '주차장' }, { x: 50, y: 52, w: 20, h: 20, emoji: '📦', label: '창고' }, { x: 30, y: 66, w: 20, h: 18, emoji: '🚗', label: '낯선 차' }] },
  { id: 'l5-q4', stage: 5, order: 4, type: 'route', character: '🧒', prompt: '길에서 경찰서까지 안전하게 가는 길을 그려보세요.', hint: '공사장·하천·어두운 골목을 피해요.', start: { x: 8, y: 88 },
    dest: { x: 76, y: 8, w: 20, h: 20, emoji: '👮', label: '경찰서' },
    dangerZones: [{ x: 26, y: 30, w: 20, h: 20, emoji: '🚧', label: '공사장' }, { x: 50, y: 52, w: 20, h: 20, emoji: '🌊', label: '하천' }, { x: 30, y: 66, w: 20, h: 18, emoji: '🌑', label: '어두운 골목' }] },
  { id: 'l5-q5', stage: 5, order: 5, type: 'route', character: '🧒', prompt: '축제 장소에서 미아보호소까지 안전한 길을 그려보세요.', hint: '인파 밖·차도·빈 골목을 피해요.', start: { x: 8, y: 88 },
    dest: { x: 76, y: 8, w: 20, h: 20, emoji: '🧸', label: '미아보호소' },
    dangerZones: [{ x: 26, y: 30, w: 20, h: 20, emoji: '🚗', label: '차도' }, { x: 50, y: 52, w: 20, h: 20, emoji: '🚪', label: '행사장 밖' }, { x: 30, y: 66, w: 20, h: 18, emoji: '🌑', label: '빈 골목' }] },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
