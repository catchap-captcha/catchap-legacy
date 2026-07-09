/**
 * 방위 맞추기 — 문제 은행 (5단계 × 5문제 = 25문제) · 4학년 심화 · 드래그 중심 · 이모지 없음
 * ---------------------------------------------------------------
 *   1단계 방위 개념       방위 약자·개념 ↔ 뜻 연결          (connect·드래그)
 *   2단계 기준점 방향     학교의 특정 방향 건물에 핀         (place·드래그)
 *   3단계 방향 분류       여러 건물을 방향별로 분류          (sort·드래그)
 *   4단계 8방위          북동·남서 등 대각선 건물에 핀       (place·드래그)
 *   5단계 경로 추론       방향을 이어 이동한 도착지에 핀      (place·드래그)
 *
 *  지도(그리드): 학교가 한가운데. 북쪽↑
 *      도서관   병원   우체국
 *      공원     학교   경찰서
 *      시장     소방서 은행
 */

const MAP = [
  { id: 'library', label: '도서관', x: 6,  y: 5,  w: 24, h: 24 },
  { id: 'hospital',label: '병원',   x: 38, y: 5,  w: 24, h: 24 },
  { id: 'post',    label: '우체국', x: 70, y: 5,  w: 24, h: 24 },
  { id: 'park',    label: '공원',   x: 6,  y: 34, w: 24, h: 24 },
  { id: 'school',  label: '학교',   x: 38, y: 34, w: 24, h: 24 },
  { id: 'police',  label: '경찰서', x: 70, y: 34, w: 24, h: 24 },
  { id: 'market',  label: '시장',   x: 6,  y: 63, w: 24, h: 24 },
  { id: 'fire',    label: '소방서', x: 38, y: 63, w: 24, h: 24 },
  { id: 'bank',    label: '은행',   x: 70, y: 63, w: 24, h: 24 },
];
const placeQ = (o) => ({ type: 'place', mapStyle: true, compass: true, zones: MAP, start: { x: 48, y: 96 },
  arrow: '지도의 핀을 알맞은 건물 위로 끌어다 놓아요', ...o });

const QUESTIONS = [
  // ───────── 1단계 : 방위 개념 (connect) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'connect',
    prompt: '방위 약자를 우리말 방향으로 끌어다 연결하세요.', hint: 'N은 북쪽(North)이에요.',
    left: [ { id: 'a', text: 'N' }, { id: 'b', text: 'S' }, { id: 'c', text: 'E' } ],
    right: [ { id: 'x', text: '북쪽' }, { id: 'y', text: '남쪽' }, { id: 'z', text: '동쪽' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q2', stage: 1, order: 2, type: 'connect',
    prompt: '설명을 알맞은 방향으로 끌어다 연결하세요.', hint: '해가 뜨는 쪽이 동쪽이에요.',
    left: [ { id: 'a', text: '해가 뜨는 쪽' }, { id: 'b', text: '해가 지는 쪽' }, { id: 'c', text: '나침반 바늘이 가리키는 쪽' } ],
    right: [ { id: 'x', text: '동쪽' }, { id: 'y', text: '서쪽' }, { id: 'z', text: '북쪽' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q3', stage: 1, order: 3, type: 'connect',
    prompt: '지도에서의 위치를 방향으로 끌어다 연결하세요.', hint: '지도는 위쪽이 북쪽이에요.',
    left: [ { id: 'a', text: '지도의 위쪽' }, { id: 'b', text: '지도의 아래쪽' }, { id: 'c', text: '지도의 오른쪽' } ],
    right: [ { id: 'x', text: '북쪽' }, { id: 'y', text: '남쪽' }, { id: 'z', text: '동쪽' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q4', stage: 1, order: 4, type: 'connect',
    prompt: '대각선 방위(8방위)를 뜻으로 끌어다 연결하세요.', hint: '두 방향 사이의 이름이에요.',
    left: [ { id: 'a', text: '북동쪽' }, { id: 'b', text: '남서쪽' }, { id: 'c', text: '북서쪽' } ],
    right: [ { id: 'x', text: '북쪽과 동쪽 사이' }, { id: 'y', text: '남쪽과 서쪽 사이' }, { id: 'z', text: '북쪽과 서쪽 사이' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l1-q5', stage: 1, order: 5, type: 'connect',
    prompt: '방위를 서로 반대 방향으로 끌어다 연결하세요.', hint: '마주 보는 방향끼리 이어요.',
    left: [ { id: 'a', text: '북쪽의 반대' }, { id: 'b', text: '동쪽의 반대' }, { id: 'c', text: '북동쪽의 반대' } ],
    right: [ { id: 'x', text: '남쪽' }, { id: 'y', text: '서쪽' }, { id: 'z', text: '남서쪽' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },

  // ───────── 2단계 : 기준점 방향 (place) ─────────
  placeQ({ id: 'l2-q1', stage: 2, order: 1, prompt: '학교의 동쪽에 있는 건물에 핀을 놓아보세요.', hint: '동쪽은 나침반에서 오른쪽이에요.', reference: 'school', answer: 'police' }),
  placeQ({ id: 'l2-q2', stage: 2, order: 2, prompt: '학교의 북쪽에 있는 건물에 핀을 놓아보세요.', hint: '북쪽은 지도의 위쪽이에요.', reference: 'school', answer: 'hospital' }),
  placeQ({ id: 'l2-q3', stage: 2, order: 3, prompt: '학교의 서쪽에 있는 건물에 핀을 놓아보세요.', hint: '서쪽은 왼쪽이에요.', reference: 'school', answer: 'park' }),
  placeQ({ id: 'l2-q4', stage: 2, order: 4, prompt: '병원의 남쪽에 있는 건물에 핀을 놓아보세요.', hint: '병원 바로 아래 칸이에요.', reference: 'hospital', answer: 'school' }),
  placeQ({ id: 'l2-q5', stage: 2, order: 5, prompt: '경찰서의 남쪽에 있는 건물에 핀을 놓아보세요.', hint: '경찰서 바로 아래 칸이에요.', reference: 'police', answer: 'bank' }),

  // ───────── 3단계 : 방향 분류 (sort) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'sort', mapRef: { zones: MAP, highlight: 'school' },
    prompt: '아래 지도에서 학교를 기준으로 각 건물이 어느 쪽에 있는지 끌어다 분류하세요.', hint: '학교는 지도 한가운데예요.',
    bins: [ { id: 'n', label: '북쪽' }, { id: 's', label: '남쪽' }, { id: 'e', label: '동쪽' }, { id: 'w', label: '서쪽' } ],
    items: [ { id: 'i1', text: '병원' }, { id: 'i2', text: '소방서' }, { id: 'i3', text: '경찰서' }, { id: 'i4', text: '공원' } ],
    answers: { i1: 'n', i2: 's', i3: 'e', i4: 'w' } },
  { id: 'l3-q2', stage: 3, order: 2, type: 'sort', mapRef: { zones: MAP, highlight: 'library' },
    prompt: '아래 지도에서 도서관을 기준으로 각 건물이 어느 쪽에 있는지 끌어다 분류하세요.', hint: '도서관은 지도 왼쪽 위 모서리예요.',
    bins: [ { id: 'e', label: '동쪽' }, { id: 's', label: '남쪽' } ],
    items: [ { id: 'i1', text: '병원' }, { id: 'i2', text: '우체국' }, { id: 'i3', text: '공원' }, { id: 'i4', text: '시장' } ],
    answers: { i1: 'e', i2: 'e', i3: 's', i4: 's' } },
  { id: 'l3-q3', stage: 3, order: 3, type: 'sort', mapRef: { zones: MAP, highlight: 'bank' },
    prompt: '아래 지도에서 은행을 기준으로 각 건물이 어느 쪽에 있는지 끌어다 분류하세요.', hint: '은행은 지도 오른쪽 아래 모서리예요.',
    bins: [ { id: 'n', label: '북쪽' }, { id: 'w', label: '서쪽' } ],
    items: [ { id: 'i1', text: '경찰서' }, { id: 'i2', text: '우체국' }, { id: 'i3', text: '소방서' }, { id: 'i4', text: '시장' } ],
    answers: { i1: 'n', i2: 'n', i3: 'w', i4: 'w' } },
  { id: 'l3-q4', stage: 3, order: 4, type: 'sort', mapRef: { zones: MAP, highlight: 'market' },
    prompt: '아래 지도에서 시장을 기준으로 각 건물이 어느 쪽에 있는지 끌어다 분류하세요.', hint: '시장은 지도 왼쪽 아래 모서리예요.',
    bins: [ { id: 'n', label: '북쪽' }, { id: 'e', label: '동쪽' } ],
    items: [ { id: 'i1', text: '공원' }, { id: 'i2', text: '도서관' }, { id: 'i3', text: '소방서' }, { id: 'i4', text: '은행' } ],
    answers: { i1: 'n', i2: 'n', i3: 'e', i4: 'e' } },
  { id: 'l3-q5', stage: 3, order: 5, type: 'sort', mapRef: { zones: MAP, highlight: 'hospital' },
    prompt: '아래 지도에서 병원을 기준으로 각 건물이 어느 쪽에 있는지 끌어다 분류하세요.', hint: '병원은 지도 위쪽 가운데예요.',
    bins: [ { id: 's', label: '남쪽' }, { id: 'w', label: '서쪽' }, { id: 'e', label: '동쪽' } ],
    items: [ { id: 'i1', text: '학교' }, { id: 'i2', text: '소방서' }, { id: 'i3', text: '도서관' }, { id: 'i4', text: '우체국' } ],
    answers: { i1: 's', i2: 's', i3: 'w', i4: 'e' } },

  // ───────── 4단계 : 8방위 (place) ─────────
  placeQ({ id: 'l4-q1', stage: 4, order: 1, prompt: '학교의 북동쪽에 있는 건물에 핀을 놓아보세요.', hint: '북쪽과 동쪽 사이, 오른쪽 위 모서리예요.', reference: 'school', answer: 'post' }),
  placeQ({ id: 'l4-q2', stage: 4, order: 2, prompt: '학교의 북서쪽에 있는 건물에 핀을 놓아보세요.', hint: '북쪽과 서쪽 사이, 왼쪽 위 모서리예요.', reference: 'school', answer: 'library' }),
  placeQ({ id: 'l4-q3', stage: 4, order: 3, prompt: '학교의 남동쪽에 있는 건물에 핀을 놓아보세요.', hint: '남쪽과 동쪽 사이, 오른쪽 아래 모서리예요.', reference: 'school', answer: 'bank' }),
  placeQ({ id: 'l4-q4', stage: 4, order: 4, prompt: '학교의 남서쪽에 있는 건물에 핀을 놓아보세요.', hint: '남쪽과 서쪽 사이, 왼쪽 아래 모서리예요.', reference: 'school', answer: 'market' }),
  placeQ({ id: 'l4-q5', stage: 4, order: 5, prompt: '공원의 북쪽에 있는 건물에 핀을 놓아보세요.', hint: '공원 바로 위 칸이에요.', reference: 'park', answer: 'library' }),

  // ───────── 5단계 : 경로 추론 (place) ─────────
  placeQ({ id: 'l5-q1', stage: 5, order: 1, prompt: '학교에서 북쪽으로 한 칸, 동쪽으로 한 칸 이동한 곳에 핀을 놓아보세요.', hint: '위로 한 칸(병원), 오른쪽으로 한 칸이에요.', reference: 'school', answer: 'post' }),
  placeQ({ id: 'l5-q2', stage: 5, order: 2, prompt: '학교에서 남쪽으로 한 칸, 서쪽으로 한 칸 이동한 곳에 핀을 놓아보세요.', hint: '아래로 한 칸(소방서), 왼쪽으로 한 칸이에요.', reference: 'school', answer: 'market' }),
  placeQ({ id: 'l5-q3', stage: 5, order: 3, prompt: '도서관에서 동쪽으로 두 칸 이동한 곳에 핀을 놓아보세요.', hint: '맨 윗줄에서 오른쪽 끝까지 가요.', reference: 'library', answer: 'post' }),
  placeQ({ id: 'l5-q4', stage: 5, order: 4, prompt: '우체국에서 남쪽으로 두 칸 이동한 곳에 핀을 놓아보세요.', hint: '오른쪽 줄에서 맨 아래까지 내려가요.', reference: 'post', answer: 'bank' }),
  placeQ({ id: 'l5-q5', stage: 5, order: 5, prompt: '시장에서 북쪽으로 한 칸, 동쪽으로 한 칸 이동한 곳에 핀을 놓아보세요.', hint: '위로 한 칸(공원), 오른쪽으로 한 칸이에요.', reference: 'market', answer: 'school' }),
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
