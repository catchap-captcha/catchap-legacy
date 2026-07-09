/**
 * 우리 동네 지도 기호 찾기 — 문제 은행 (5단계 × 5문제 = 25문제) · 4학년 심화 · 드래그 중심 · 이모지 없음
 * ---------------------------------------------------------------
 *   1단계 기호의 뜻       지도 기호 ↔ 나타내는 곳 연결        (connect·드래그)
 *   2단계 기호 분류       기호를 종류별로 분류               (sort·드래그)
 *   3단계 조건 기호 찾기  조건에 맞는 기호를 모두 담기         (pick·드래그)
 *   4단계 지도의 약속     범례·방위표·축척·등고선 뜻 연결       (connect·드래그)
 *   5단계 땅의 생김새     높은 땅/낮은 땅·자연/인공 분류        (sort·드래그)
 *
 *  ※ 방향으로 위치를 찾는 '핀 옮기기'는 2번(방위) 캡챠에서 다루고,
 *    이 캡챠는 '지도 기호·범례·땅의 표현'을 읽는 능력에 집중한다.
 */

const QUESTIONS = [
  // ───────── 1단계 : 기호의 뜻 (connect) · 지도 기호표의 실제 기호 이미지만 사용 ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'connect',
    prompt: '지도 기호를 나타내는 곳으로 끌어다 연결하세요.', hint: '생활에서 자주 가는 곳이에요.',
    left: [ { id: 'a', text: '병원 기호', img: 'assets/symbols/hospital.png' }, { id: 'b', text: '학교 기호', img: 'assets/symbols/school.png' }, { id: 'c', text: '은행 기호', img: 'assets/symbols/bank.png' } ],
    right: [ { id: 'x', text: '아픈 사람을 치료하는 곳' }, { id: 'y', text: '학생이 공부하는 곳' }, { id: 'z', text: '돈을 맡기고 찾는 곳' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q2', stage: 1, order: 2, type: 'connect',
    prompt: '지도 기호를 나타내는 곳으로 끌어다 연결하세요.', hint: '무엇을 하는 곳인지 생각해요.',
    left: [ { id: 'a', text: '우체국 기호', img: 'assets/symbols/post-office.png' }, { id: 'b', text: '교회 기호', img: 'assets/symbols/church.png' }, { id: 'c', text: '사찰 기호', img: 'assets/symbols/temple.png' } ],
    right: [ { id: 'x', text: '편지·소포를 부치는 곳' }, { id: 'y', text: '예배를 드리는 곳' }, { id: 'z', text: '부처님을 모신 절' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q3', stage: 1, order: 3, type: 'connect',
    prompt: '농사와 관련된 기호를 뜻으로 끌어다 연결하세요.', hint: '무엇을 기르는 땅인지 생각해요.',
    left: [ { id: 'a', text: '논 기호', img: 'assets/symbols/rice-paddy.png' }, { id: 'b', text: '밭 기호', img: 'assets/symbols/field.png' }, { id: 'c', text: '과수원 기호', img: 'assets/symbols/orchard.png' } ],
    right: [ { id: 'x', text: '벼를 기르는 곳' }, { id: 'y', text: '채소를 기르는 곳' }, { id: 'z', text: '과일나무를 기르는 곳' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q4', stage: 1, order: 4, type: 'connect',
    prompt: '지도 기호를 하는 일로 끌어다 연결하세요.', hint: '안전·행정·휴식을 떠올려요.',
    left: [ { id: 'a', text: '소방서 기호', img: 'assets/symbols/fire-station.png' }, { id: 'b', text: '시·군·구청 기호', img: 'assets/symbols/district-office.png' }, { id: 'c', text: '온천 기호', img: 'assets/symbols/hot-spring.png' } ],
    right: [ { id: 'x', text: '불을 끄고 사람을 구하는 곳' }, { id: 'y', text: '지역 살림을 맡아 처리하는 곳' }, { id: 'z', text: '땅속에서 더운물이 솟는 곳' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q5', stage: 1, order: 5, type: 'connect',
    prompt: '지도 기호를 나타내는 곳으로 끌어다 연결하세요.', hint: '무엇을 만들고, 무엇을 막는지 생각해요.',
    left: [ { id: 'a', text: '공장 기호', img: 'assets/symbols/factory.png' }, { id: 'b', text: '명승고적 기호', img: 'assets/symbols/landmark.png' }, { id: 'c', text: '제방 기호', img: 'assets/symbols/embankment.png' } ],
    right: [ { id: 'x', text: '물건을 만드는 곳' }, { id: 'y', text: '경치가 좋고 옛 유적이 있는 곳' }, { id: 'z', text: '물이 넘치지 않게 쌓은 둑' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },

  // ───────── 2단계 : 기호 분류 (sort) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'sort',
    prompt: '지도 기호를 종류에 맞게 끌어다 분류하세요.', hint: '건물인지, 자연인지, 교통인지 생각해요.',
    bins: [ { id: 'build', label: '건물·시설' }, { id: 'nature', label: '자연' }, { id: 'traffic', label: '교통' } ],
    items: [ { id: 'i1', text: '학교' }, { id: 'i2', text: '산' }, { id: 'i3', text: '철도' }, { id: 'i4', text: '병원' }, { id: 'i5', text: '강' } ],
    answers: { i1: 'build', i2: 'nature', i3: 'traffic', i4: 'build', i5: 'nature' } },
  { id: 'l2-q2', stage: 2, order: 2, type: 'sort',
    prompt: '지도 기호를 종류에 맞게 끌어다 분류하세요.', hint: '무엇을 나타내는 기호인지 생각해요.',
    bins: [ { id: 'build', label: '건물·시설' }, { id: 'nature', label: '자연' }, { id: 'traffic', label: '교통' } ],
    items: [ { id: 'i1', text: '우체국' }, { id: 'i2', text: '바다' }, { id: 'i3', text: '도로' }, { id: 'i4', text: '소방서' }, { id: 'i5', text: '하천' } ],
    answers: { i1: 'build', i2: 'nature', i3: 'traffic', i4: 'build', i5: 'nature' } },
  { id: 'l2-q3', stage: 2, order: 3, type: 'sort',
    prompt: '지도 기호를 땅의 쓰임에 맞게 끌어다 분류하세요.', hint: '농사 땅인지, 자연인지, 건물인지 생각해요.',
    bins: [ { id: 'land', label: '땅의 이용(논밭 등)' }, { id: 'nature', label: '자연' }, { id: 'build', label: '건물' } ],
    items: [ { id: 'i1', text: '논' }, { id: 'i2', text: '산' }, { id: 'i3', text: '시청' }, { id: 'i4', text: '과수원' }, { id: 'i5', text: '강' } ],
    answers: { i1: 'land', i2: 'nature', i3: 'build', i4: 'land', i5: 'nature' } },
  { id: 'l2-q4', stage: 2, order: 4, type: 'sort',
    prompt: '지도 기호를 건물과 교통으로 끌어다 분류하세요.', hint: '머무는 곳인지, 다니는 길인지 생각해요.',
    bins: [ { id: 'build', label: '건물·시설' }, { id: 'traffic', label: '교통' } ],
    items: [ { id: 'i1', text: '병원' }, { id: 'i2', text: '다리' }, { id: 'i3', text: '도서관' }, { id: 'i4', text: '철도' } ],
    answers: { i1: 'build', i2: 'traffic', i3: 'build', i4: 'traffic' } },
  { id: 'l2-q5', stage: 2, order: 5, type: 'sort',
    prompt: '지도 기호를 자연과 사람이 만든 것으로 끌어다 분류하세요.', hint: '원래 있던 것인지, 사람이 만든 것인지 생각해요.',
    bins: [ { id: 'nature', label: '자연' }, { id: 'man', label: '사람이 만든 것' } ],
    items: [ { id: 'i1', text: '산' }, { id: 'i2', text: '다리' }, { id: 'i3', text: '강' }, { id: 'i4', text: '도로' }, { id: 'i5', text: '바다' } ],
    answers: { i1: 'nature', i2: 'man', i3: 'nature', i4: 'man', i5: 'nature' } },

  // ───────── 3단계 : 조건 기호 찾기 (pick) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'pick', target: '공공기관 기호 담기', boxHint: '공공기관 기호만 이 상자로 끌어와요',
    prompt: '공공기관을 나타내는 기호를 모두 골라 담아보세요.', hint: '나라·지역이 운영하는 곳이에요.',
    items: [ { id: 'i1', text: '경찰서' }, { id: 'i2', text: '소방서' }, { id: 'i3', text: '우체국' }, { id: 'i4', text: '은행' }, { id: 'i5', text: '시장' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q2', stage: 3, order: 2, type: 'pick', target: '자연을 나타내는 기호 담기', boxHint: '자연 기호만 이 상자로 끌어와요',
    prompt: '자연을 나타내는 기호를 모두 골라 담아보세요.', hint: '사람이 만들지 않은 것이에요.',
    items: [ { id: 'i1', text: '산' }, { id: 'i2', text: '강' }, { id: 'i3', text: '바다' }, { id: 'i4', text: '학교' }, { id: 'i5', text: '도로' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q3', stage: 3, order: 3, type: 'pick', target: '농사와 관련된 기호 담기', boxHint: '농사 관련 기호만 끌어와요',
    prompt: '농사와 관련된 기호를 모두 골라 담아보세요.', hint: '먹을 것을 기르는 땅이에요.',
    items: [ { id: 'i1', text: '논' }, { id: 'i2', text: '밭' }, { id: 'i3', text: '과수원' }, { id: 'i4', text: '항구' }, { id: 'i5', text: '병원' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q4', stage: 3, order: 4, type: 'pick', target: '교통과 관련된 기호 담기', boxHint: '교통 관련 기호만 끌어와요',
    prompt: '교통과 관련된 기호를 모두 골라 담아보세요.', hint: '오가는 길·수단을 떠올려요.',
    items: [ { id: 'i1', text: '도로' }, { id: 'i2', text: '철도' }, { id: 'i3', text: '다리' }, { id: 'i4', text: '산' }, { id: 'i5', text: '논' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q5', stage: 3, order: 5, type: 'pick', target: '물과 관련된 기호 담기', boxHint: '물과 관련된 기호만 끌어와요',
    prompt: '물과 관련된 기호를 모두 골라 담아보세요.', hint: '물이 있는 곳이에요.',
    items: [ { id: 'i1', text: '강' }, { id: 'i2', text: '바다' }, { id: 'i3', text: '항구' }, { id: 'i4', text: '산' }, { id: 'i5', text: '밭' } ],
    answers: ['i1', 'i2', 'i3'] },

  // ───────── 4단계 : 지도의 약속 (connect) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'connect',
    prompt: '지도의 약속을 뜻으로 끌어다 연결하세요.', hint: '지도를 읽는 데 필요한 것이에요.',
    left: [ { id: 'a', text: '범례' }, { id: 'b', text: '방위표' }, { id: 'c', text: '축척' } ],
    right: [ { id: 'x', text: '기호와 그 뜻을 모아 놓은 것' }, { id: 'y', text: '동서남북 방향을 알려주는 표시' }, { id: 'z', text: '실제 거리를 줄인 정도' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'connect',
    prompt: '지도에서 땅의 높낮이 표현을 뜻으로 끌어다 연결하세요.', hint: '색과 선으로 높이를 나타내요.',
    left: [ { id: 'a', text: '등고선' }, { id: 'b', text: '초록색' }, { id: 'c', text: '갈색' } ],
    right: [ { id: 'x', text: '높이가 같은 곳을 이은 선' }, { id: 'y', text: '낮은 땅' }, { id: 'z', text: '높은 땅' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'connect',
    prompt: '지도에 대한 설명을 알맞게 끌어다 연결하세요.', hint: '지도가 무엇인지 생각해요.',
    left: [ { id: 'a', text: '지도' }, { id: 'b', text: '기호' }, { id: 'c', text: '방위' } ],
    right: [ { id: 'x', text: '위에서 내려다본 모습을 줄여 그린 것' }, { id: 'y', text: '실제 모습을 간단히 나타낸 약속' }, { id: 'z', text: '동서남북 같은 방향' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'connect',
    prompt: '등고선이 알려주는 것을 끌어다 연결하세요.', hint: '선의 간격을 생각해요.',
    left: [ { id: 'a', text: '등고선이 촘촘함' }, { id: 'b', text: '등고선이 넓게 벌어짐' }, { id: 'c', text: '등고선 안쪽 가장 좁은 곳' } ],
    right: [ { id: 'x', text: '경사가 급함' }, { id: 'y', text: '경사가 완만함' }, { id: 'z', text: '가장 높은 봉우리' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'connect',
    prompt: '지도의 종류를 설명으로 끌어다 연결하세요.', hint: '무엇을 나타내는 지도인지 생각해요.',
    left: [ { id: 'a', text: '위성사진 지도' }, { id: 'b', text: '그림지도' }, { id: 'c', text: '안내도' } ],
    right: [ { id: 'x', text: '실제 모습을 사진으로 보여줘요' }, { id: 'y', text: '중요한 것을 그림으로 나타내요' }, { id: 'z', text: '길과 시설의 위치를 알려줘요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },

  // ───────── 5단계 : 땅의 생김새 (sort) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'sort',
    prompt: '땅을 높은 곳과 낮은 곳으로 끌어다 분류하세요.', hint: '어디가 더 솟아 있는지 생각해요.',
    bins: [ { id: 'high', label: '높은 땅' }, { id: 'low', label: '낮은 땅' } ],
    items: [ { id: 'i1', text: '산꼭대기' }, { id: 'i2', text: '넓은 들판' }, { id: 'i3', text: '언덕' }, { id: 'i4', text: '강가' } ],
    answers: { i1: 'high', i2: 'low', i3: 'high', i4: 'low' } },
  { id: 'l5-q2', stage: 5, order: 2, type: 'sort',
    prompt: '지도 색으로 나타낸 높낮이를 끌어다 분류하세요.', hint: '초록은 낮은 땅, 갈색은 높은 땅이에요.',
    bins: [ { id: 'high', label: '높은 땅(갈색)' }, { id: 'low', label: '낮은 땅(초록색)' } ],
    items: [ { id: 'i1', text: '갈색으로 칠한 곳' }, { id: 'i2', text: '초록색으로 칠한 곳' }, { id: 'i3', text: '높은 산봉우리' }, { id: 'i4', text: '바닷가 평야' } ],
    answers: { i1: 'high', i2: 'low', i3: 'high', i4: 'low' } },
  { id: 'l5-q3', stage: 5, order: 3, type: 'sort',
    prompt: '지도 요소를 자연과 사람이 만든 것으로 끌어다 분류하세요.', hint: '원래 있던 것인지 생각해요.',
    bins: [ { id: 'nature', label: '자연' }, { id: 'man', label: '사람이 만든 것' } ],
    items: [ { id: 'i1', text: '강' }, { id: 'i2', text: '다리' }, { id: 'i3', text: '산' }, { id: 'i4', text: '도로' } ],
    answers: { i1: 'nature', i2: 'man', i3: 'nature', i4: 'man' } },
  { id: 'l5-q4', stage: 5, order: 4, type: 'sort',
    prompt: '지형을 물과 땅으로 끌어다 분류하세요.', hint: '물이 있는 곳과 흙이 있는 곳을 나눠요.',
    bins: [ { id: 'water', label: '물' }, { id: 'ground', label: '땅' } ],
    items: [ { id: 'i1', text: '바다' }, { id: 'i2', text: '산' }, { id: 'i3', text: '호수' }, { id: 'i4', text: '들판' }, { id: 'i5', text: '강' } ],
    answers: { i1: 'water', i2: 'ground', i3: 'water', i4: 'ground', i5: 'water' } },
  { id: 'l5-q5', stage: 5, order: 5, type: 'sort',
    prompt: '지도 기호를 자연·건물·교통으로 끌어다 분류하세요.', hint: '지금까지 배운 것을 떠올려요.',
    bins: [ { id: 'nature', label: '자연' }, { id: 'build', label: '건물' }, { id: 'traffic', label: '교통' } ],
    items: [ { id: 'i1', text: '산' }, { id: 'i2', text: '학교' }, { id: 'i3', text: '철도' }, { id: 'i4', text: '바다' }, { id: 'i5', text: '다리' } ],
    answers: { i1: 'nature', i2: 'build', i3: 'traffic', i4: 'nature', i5: 'traffic' } },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
