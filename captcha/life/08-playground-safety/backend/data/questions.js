/**
 * 놀이터 안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 조작: 놀이터 장면에서 아이 캐릭터(🧒)를 안전한 구역으로 '드래그'.
 *   1단계  안전 위치 이동        안전한 곳으로 아이 옮기기
 *   2단계  위험 구역 피하기      위험 구역을 피해 안전한 곳으로
 *   3단계  놀이기구별 안전 위치   기구마다 다른 안전 위치 찾기
 *   4단계  움직이는 위험 피하기   움직이는 그네를 피해 이동
 *   5단계  복합 놀이터           여러 위험을 피해 친구 곁으로
 *
 * type: 'place' → zones[{id,x,y,w,h,label,emoji,moving?}], start{x,y}, answer=안전 zone id
 *   좌표는 장면 대비 % 단위. answer 는 프론트로 내려가지 않는다.(sanitizeQuestion)
 */

const QUESTIONS = [
  // ───────── 1단계 : 안전 위치 이동 ─────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'place', character: '🧒',
    prompt: '그네는 앞뒤로 크게 움직여 위험해요. 아이를 안전한 곳으로 옮겨보세요.',
    hint: '그네 앞은 부딪히기 쉬워요.',
    start: { x: 48, y: 82 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '그네 앞', x: 10, y: 14, w: 34, h: 40 },
      { id: 'z2', emoji: '🌳', label: '벤치 쪽', x: 62, y: 52, w: 30, h: 34 },
    ],
    answer: 'z2',
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'place', character: '🧒',
    prompt: '아이를 안전한 곳으로 옮겨보세요.',
    hint: '시소 밑은 눌릴 수 있어요.',
    start: { x: 48, y: 84 },
    zones: [
      { id: 'z1', emoji: '🎠', label: '시소 아래', x: 12, y: 16, w: 32, h: 38 },
      { id: 'z2', emoji: '🌷', label: '화단 옆 길', x: 60, y: 54, w: 30, h: 32 },
    ],
    answer: 'z2',
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'place', character: '🧒',
    prompt: '아이를 안전한 곳으로 옮겨보세요.',
    hint: '미끄럼틀 아래 출구는 부딪혀요.',
    start: { x: 46, y: 84 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '미끄럼틀 출구', x: 12, y: 16, w: 34, h: 40 },
      { id: 'z2', emoji: '🪑', label: '대기 벤치', x: 62, y: 56, w: 30, h: 30 },
    ],
    answer: 'z2',
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'place', character: '🧒',
    prompt: '아이를 안전한 곳으로 옮겨보세요.',
    hint: '정글짐 바로 아래는 떨어질 수 있어요.',
    start: { x: 50, y: 84 },
    zones: [
      { id: 'z1', emoji: '🧗', label: '정글짐 아래', x: 14, y: 14, w: 34, h: 42 },
      { id: 'z2', emoji: '🌳', label: '나무 그늘', x: 64, y: 54, w: 28, h: 32 },
    ],
    answer: 'z2',
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'place', character: '🧒',
    prompt: '아이를 안전한 곳으로 옮겨보세요.',
    hint: '모래 놀이터에서 던지는 곳은 피해요.',
    start: { x: 48, y: 84 },
    zones: [
      { id: 'z1', emoji: '⛱️', label: '모래 던지는 곳', x: 12, y: 16, w: 34, h: 38 },
      { id: 'z2', emoji: '🪑', label: '쉼터 의자', x: 62, y: 56, w: 30, h: 30 },
    ],
    answer: 'z2',
  },

  // ───────── 2단계 : 위험 구역 피하기 (위험 2 + 안전 1) ─────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'place', character: '🧒',
    prompt: '위험한 곳을 피해 안전한 곳으로 이동해보세요.',
    hint: '그네 앞과 미끄럼틀 아래는 위험해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '그네 앞', x: 8, y: 12, w: 30, h: 30 },
      { id: 'z2', emoji: '🛝', label: '미끄럼틀 아래', x: 58, y: 12, w: 32, h: 30 },
      { id: 'z3', emoji: '🌳', label: '넓은 잔디', x: 34, y: 60, w: 34, h: 30 },
    ],
    answer: 'z3',
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'place', character: '🧒',
    prompt: '위험한 곳을 피해 안전한 곳으로 이동해보세요.',
    hint: '움직이는 기구 근처는 피해요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🎠', label: '회전 놀이기구', x: 8, y: 12, w: 32, h: 32 },
      { id: 'z2', emoji: '🎠', label: '시소 아래', x: 60, y: 12, w: 30, h: 32 },
      { id: 'z3', emoji: '🪑', label: '벤치 쪽', x: 36, y: 62, w: 30, h: 28 },
    ],
    answer: 'z3',
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'place', character: '🧒',
    prompt: '위험한 곳을 피해 안전한 곳으로 이동해보세요.',
    hint: '차가 다니는 길과 공사장은 위험해요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🚗', label: '주차장 입구', x: 8, y: 12, w: 30, h: 30 },
      { id: 'z2', emoji: '🚧', label: '공사장', x: 60, y: 12, w: 30, h: 30 },
      { id: 'z3', emoji: '🌳', label: '놀이터 안쪽', x: 36, y: 62, w: 30, h: 28 },
    ],
    answer: 'z3',
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'place', character: '🧒',
    prompt: '위험한 곳을 피해 안전한 곳으로 이동해보세요.',
    hint: '물웅덩이와 미끄러운 곳은 피해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '💧', label: '미끄러운 물웅덩이', x: 8, y: 12, w: 32, h: 30 },
      { id: 'z2', emoji: '🕳️', label: '깊게 팬 곳', x: 60, y: 12, w: 30, h: 30 },
      { id: 'z3', emoji: '🌷', label: '평평한 산책로', x: 36, y: 62, w: 30, h: 28 },
    ],
    answer: 'z3',
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'place', character: '🧒',
    prompt: '위험한 곳을 피해 안전한 곳으로 이동해보세요.',
    hint: '높은 곳과 담장 위는 위험해요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🧱', label: '담장 위', x: 8, y: 12, w: 30, h: 28 },
      { id: 'z2', emoji: '🪜', label: '높은 사다리', x: 60, y: 12, w: 30, h: 30 },
      { id: 'z3', emoji: '🪑', label: '낮은 쉼터', x: 36, y: 62, w: 30, h: 28 },
    ],
    answer: 'z3',
  },

  // ───────── 3단계 : 놀이기구별 안전 위치 ─────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'place', character: '🧒',
    prompt: '미끄럼틀 아래는 위험해요. 어디로 가야 안전할까요?',
    hint: '미끄럼틀은 옆 계단에서 차례를 기다려요.',
    start: { x: 88, y: 85 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '미끄럼틀 출구 아래', x: 38, y: 48, w: 32, h: 42 },
      { id: 'z2', emoji: '🚶', label: '옆 계단 대기 줄', x: 8, y: 14, w: 28, h: 32 },
      { id: 'z3', emoji: '⬆️', label: '미끄럼틀 꼭대기', x: 62, y: 12, w: 30, h: 28 },
    ],
    answer: 'z2',
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'place', character: '🧒',
    prompt: '그네를 안전하게 기다리려면 어디에 있어야 할까요?',
    hint: '그네가 오가는 앞뒤는 피해요.',
    start: { x: 50, y: 88 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '그네 앞뒤', x: 34, y: 40, w: 32, h: 50 },
      { id: 'z2', emoji: '🚶', label: '그네 옆 대기선', x: 8, y: 14, w: 26, h: 34 },
      { id: 'z3', emoji: '➡️', label: '그네 바로 뒤', x: 66, y: 40, w: 26, h: 44 },
    ],
    answer: 'z2',
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'place', character: '🧒',
    prompt: '시소를 안전하게 기다리는 곳은 어디일까요?',
    hint: '시소가 내려오는 아래는 위험해요.',
    start: { x: 50, y: 88 },
    zones: [
      { id: 'z1', emoji: '🎠', label: '시소가 내려오는 곳', x: 36, y: 44, w: 30, h: 46 },
      { id: 'z2', emoji: '🚶', label: '옆에서 차례 대기', x: 8, y: 14, w: 28, h: 32 },
      { id: 'z3', emoji: '⬇️', label: '시소 밑 그늘', x: 64, y: 46, w: 28, h: 44 },
    ],
    answer: 'z2',
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'place', character: '🧒',
    prompt: '정글짐에서 안전한 위치를 찾아보세요.',
    hint: '위에서 사람이 내려오는 아래는 위험해요.',
    start: { x: 50, y: 88 },
    zones: [
      { id: 'z1', emoji: '🧗', label: '오르는 사람 바로 아래', x: 36, y: 44, w: 30, h: 46 },
      { id: 'z2', emoji: '🚶', label: '한 발 물러난 대기선', x: 8, y: 14, w: 30, h: 32 },
      { id: 'z3', emoji: '⬆️', label: '꼭대기 난간', x: 66, y: 12, w: 26, h: 30 },
    ],
    answer: 'z2',
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'place', character: '🧒',
    prompt: '회전 놀이기구 옆 안전한 곳은 어디일까요?',
    hint: '돌아가는 기구에 손발이 닿으면 위험해요.',
    start: { x: 50, y: 88 },
    zones: [
      { id: 'z1', emoji: '🎡', label: '돌아가는 기구 바로 옆', x: 34, y: 42, w: 32, h: 48 },
      { id: 'z2', emoji: '🚶', label: '멈춤선 밖 대기', x: 8, y: 14, w: 30, h: 32 },
      { id: 'z3', emoji: '🔄', label: '기구 손잡이 근처', x: 66, y: 44, w: 26, h: 44 },
    ],
    answer: 'z2',
  },

  // ───────── 4단계 : 움직이는 위험 피하기 (그네가 움직임) ─────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'place', character: '🧒',
    prompt: '그네가 움직이고 있어요. 부딪히지 않게 안전한 곳으로 이동하세요.',
    hint: '움직이는 그네에서 멀리 떨어져요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '움직이는 그네', x: 30, y: 14, w: 36, h: 42, moving: true },
      { id: 'z2', emoji: '🌳', label: '멀리 떨어진 그늘', x: 70, y: 60, w: 26, h: 30 },
    ],
    answer: 'z2',
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'place', character: '🧒',
    prompt: '공이 굴러오고 있어요. 안전한 곳으로 피하세요.',
    hint: '공이 지나는 길은 비켜요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '⚽', label: '공이 굴러오는 길', x: 28, y: 16, w: 38, h: 40, moving: true },
      { id: 'z2', emoji: '🪑', label: '길 옆 벤치', x: 70, y: 60, w: 26, h: 30 },
    ],
    answer: 'z2',
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'place', character: '🧒',
    prompt: '자전거가 지나가요. 부딪히지 않게 이동하세요.',
    hint: '자전거 길에서 벗어나요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🚲', label: '자전거가 지나는 길', x: 28, y: 16, w: 38, h: 40, moving: true },
      { id: 'z2', emoji: '🌳', label: '잔디밭 안쪽', x: 70, y: 60, w: 26, h: 30 },
    ],
    answer: 'z2',
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'place', character: '🧒',
    prompt: '회전문처럼 도는 기구가 있어요. 안전하게 피하세요.',
    hint: '도는 기구에서 멀어져요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🎠', label: '빠르게 도는 기구', x: 30, y: 14, w: 36, h: 42, moving: true },
      { id: 'z2', emoji: '🪑', label: '멀리 있는 쉼터', x: 70, y: 60, w: 26, h: 30 },
    ],
    answer: 'z2',
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'place', character: '🧒',
    prompt: '킥보드가 빠르게 지나가요. 안전한 곳으로 이동하세요.',
    hint: '빠른 것이 지나는 길을 피해요.',
    start: { x: 12, y: 86 },
    zones: [
      { id: 'z1', emoji: '🛴', label: '킥보드가 지나는 길', x: 28, y: 16, w: 38, h: 40, moving: true },
      { id: 'z2', emoji: '🌳', label: '나무 옆 안전지대', x: 70, y: 60, w: 26, h: 30 },
    ],
    answer: 'z2',
  },

  // ───────── 5단계 : 복합 놀이터 (위험 3 + 안전 1) ─────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'place', character: '🧒',
    prompt: '여러 위험한 곳을 피해 친구가 있는 안전한 곳으로 이동하세요.',
    hint: '그네·미끄럼틀·시소 근처를 모두 피해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '그네 앞', x: 6, y: 12, w: 26, h: 30 },
      { id: 'z2', emoji: '🛝', label: '미끄럼틀 아래', x: 40, y: 12, w: 26, h: 30 },
      { id: 'z3', emoji: '🎠', label: '시소 옆', x: 72, y: 12, w: 24, h: 30 },
      { id: 'z4', emoji: '🧑‍🤝‍🧑', label: '친구가 있는 곳', x: 38, y: 64, w: 28, h: 28 },
    ],
    answer: 'z4',
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'place', character: '🧒',
    prompt: '위험 요소를 모두 피해 안전한 곳으로 이동하세요.',
    hint: '차·공사장·물웅덩이를 피해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '🚗', label: '주차장', x: 6, y: 12, w: 26, h: 30 },
      { id: 'z2', emoji: '🚧', label: '공사장', x: 40, y: 12, w: 26, h: 30 },
      { id: 'z3', emoji: '💧', label: '물웅덩이', x: 72, y: 12, w: 24, h: 30 },
      { id: 'z4', emoji: '🌳', label: '안전한 잔디밭', x: 38, y: 64, w: 28, h: 28 },
    ],
    answer: 'z4',
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'place', character: '🧒',
    prompt: '움직이는 기구들을 피해 선생님이 계신 곳으로 이동하세요.',
    hint: '움직이는 것 셋을 모두 피해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '🛝', label: '움직이는 그네', x: 6, y: 12, w: 26, h: 30, moving: true },
      { id: 'z2', emoji: '⚽', label: '굴러오는 공', x: 40, y: 12, w: 26, h: 30, moving: true },
      { id: 'z3', emoji: '🚲', label: '지나는 자전거', x: 72, y: 12, w: 24, h: 30, moving: true },
      { id: 'z4', emoji: '🧑‍🏫', label: '선생님 곁', x: 38, y: 64, w: 28, h: 28 },
    ],
    answer: 'z4',
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'place', character: '🧒',
    prompt: '높고 미끄러운 위험을 피해 안전한 곳으로 이동하세요.',
    hint: '담장·사다리·빙판을 피해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '🧱', label: '높은 담장', x: 6, y: 12, w: 26, h: 30 },
      { id: 'z2', emoji: '🪜', label: '흔들리는 사다리', x: 40, y: 12, w: 26, h: 30 },
      { id: 'z3', emoji: '🧊', label: '미끄러운 빙판', x: 72, y: 12, w: 24, h: 30 },
      { id: 'z4', emoji: '🪑', label: '평평한 쉼터', x: 38, y: 64, w: 28, h: 28 },
    ],
    answer: 'z4',
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'place', character: '🧒',
    prompt: '모든 위험을 피해 부모님이 계신 안전한 곳으로 이동하세요.',
    hint: '위험한 곳 세 군데를 모두 피해요.',
    start: { x: 10, y: 86 },
    zones: [
      { id: 'z1', emoji: '🕳️', label: '깊게 팬 곳', x: 6, y: 12, w: 26, h: 30 },
      { id: 'z2', emoji: '🎠', label: '도는 기구', x: 40, y: 12, w: 26, h: 30, moving: true },
      { id: 'z3', emoji: '🚗', label: '차 다니는 길', x: 72, y: 12, w: 24, h: 30 },
      { id: 'z4', emoji: '👨‍👩‍👧', label: '부모님 곁', x: 38, y: 64, w: 28, h: 28 },
    ],
    answer: 'z4',
  },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
