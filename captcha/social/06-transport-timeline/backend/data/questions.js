/**
 * 교통수단 변화 순서 — 문제 은행 (5단계 × 5문제 = 25문제) · 4학년 심화 · 드래그 중심 · 이모지 없음
 * ---------------------------------------------------------------
 *   1단계 옛날/오늘날 구분  교통수단을 시대로 분류            (sort·드래그)
 *   2단계 3개 순서 배열    오래된 순서로 정렬                (order·드래그)
 *   3단계 5개 순서 배열    발달 순서로 정렬                 (order·드래그)
 *   4단계 시설·변화 연결   교통수단·발달 결과 연결           (connect·드래그)
 *   5단계 장점/문제점 구분  교통 발달의 영향 분류             (sort·드래그)
 */

const QUESTIONS = [
  // ───────── 1단계 : 옛날/오늘날 구분 (sort) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'sort',
    prompt: '교통수단을 옛날 것과 오늘날 것으로 끌어다 분류하세요.', hint: '기계 없이 움직였는지 생각해요.',
    bins: [ { id: 'old', label: '옛날' }, { id: 'now', label: '오늘날' } ],
    items: [ { id: 'i1', text: '수레(달구지)' }, { id: 'i2', text: '고속철도(KTX)' }, { id: 'i3', text: '가마' }, { id: 'i4', text: '전기차' } ],
    answers: { i1: 'old', i2: 'now', i3: 'old', i4: 'now' } },
  { id: 'l1-q2', stage: 1, order: 2, type: 'sort',
    prompt: '물 위 교통수단을 옛날과 오늘날로 끌어다 분류하세요.', hint: '노와 돛으로 움직였는지 생각해요.',
    bins: [ { id: 'old', label: '옛날' }, { id: 'now', label: '오늘날' } ],
    items: [ { id: 'i1', text: '나룻배' }, { id: 'i2', text: '여객선' }, { id: 'i3', text: '돛단배' }, { id: 'i4', text: '쾌속선(모터보트)' } ],
    answers: { i1: 'old', i2: 'now', i3: 'old', i4: 'now' } },
  { id: 'l1-q3', stage: 1, order: 3, type: 'sort',
    prompt: '이동 방법을 옛날과 오늘날로 끌어다 분류하세요.', hint: '사람·동물의 힘인지, 기계의 힘인지 생각해요.',
    bins: [ { id: 'old', label: '옛날' }, { id: 'now', label: '오늘날' } ],
    items: [ { id: 'i1', text: '걸어서 이동' }, { id: 'i2', text: '지하철 타기' }, { id: 'i3', text: '말 타기' }, { id: 'i4', text: '비행기 타기' } ],
    answers: { i1: 'old', i2: 'now', i3: 'old', i4: 'now' } },
  { id: 'l1-q4', stage: 1, order: 4, type: 'sort',
    prompt: '옛날 통신 방법과 오늘날 통신 방법으로 끌어다 분류하세요.', hint: '연기·사람으로 전했는지 생각해요.',
    bins: [ { id: 'old', label: '옛날' }, { id: 'now', label: '오늘날' } ],
    items: [ { id: 'i1', text: '봉수(연기·불)' }, { id: 'i2', text: '휴대전화' }, { id: 'i3', text: '파발(사람이 전달)' }, { id: 'i4', text: '인터넷' } ],
    answers: { i1: 'old', i2: 'now', i3: 'old', i4: 'now' } },
  { id: 'l1-q5', stage: 1, order: 5, type: 'sort',
    prompt: '땅 위 교통수단을 옛날과 오늘날로 끌어다 분류하세요.', hint: '느리게 다녔는지, 빠르게 다니는지 생각해요.',
    bins: [ { id: 'old', label: '옛날' }, { id: 'now', label: '오늘날' } ],
    items: [ { id: 'i1', text: '소달구지' }, { id: 'i2', text: '자동차' }, { id: 'i3', text: '인력거' }, { id: 'i4', text: '고속버스' } ],
    answers: { i1: 'old', i2: 'now', i3: 'old', i4: 'now' } },

  // ───────── 2단계 : 3개 순서 배열 (order) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'order',
    prompt: '오래된 교통수단부터 순서대로 선택하세요.', hint: '기계 없이 다니던 것이 가장 오래됐어요.',
    cards: [ { id: 'c1', text: '수레' }, { id: 'c2', text: '기차' }, { id: 'c3', text: '자동차' } ],
    correctSequence: ['c1', 'c2', 'c3'] },
  { id: 'l2-q2', stage: 2, order: 2, type: 'order',
    prompt: '오래된 것부터 순서대로 선택하세요.', hint: '내 힘, 동물의 힘, 기계의 힘 중 무엇이 먼저였을지 생각해요.',
    cards: [ { id: 'c1', text: '걸어서 이동' }, { id: 'c2', text: '말 타기' }, { id: 'c3', text: '기차 타기' } ],
    correctSequence: ['c1', 'c2', 'c3'] },
  { id: 'l2-q3', stage: 2, order: 3, type: 'order',
    prompt: '배의 발달 순서대로 선택하세요.', hint: '배를 움직이는 힘이 어떻게 달라졌는지 생각해요.',
    cards: [ { id: 'c1', text: '나룻배' }, { id: 'c2', text: '돛단배' }, { id: 'c3', text: '여객선' } ],
    correctSequence: ['c1', 'c2', 'c3'] },
  { id: 'l2-q4', stage: 2, order: 4, type: 'order',
    prompt: '오래된 것부터 순서대로 선택하세요.', hint: '오래전부터 쓰던 것과 최근에 나온 것을 생각해요.',
    cards: [ { id: 'c1', text: '자동차' }, { id: 'c2', text: '고속철도' }, { id: 'c3', text: '전기차' } ],
    correctSequence: ['c1', 'c2', 'c3'] },
  { id: 'l2-q5', stage: 2, order: 5, type: 'order',
    prompt: '통신 수단의 발달 순서대로 선택하세요.', hint: '소식을 멀리 전하는 방법이 어떻게 발전했는지 생각해요.',
    cards: [ { id: 'c1', text: '봉수(연기)' }, { id: 'c2', text: '유선 전화' }, { id: 'c3', text: '인터넷' } ],
    correctSequence: ['c1', 'c2', 'c3'] },

  // ───────── 3단계 : 5개 순서 배열 (order) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'order',
    prompt: '교통수단의 변화를 옛날부터 오늘날까지 순서대로 선택하세요.', hint: '무엇으로 움직이는지 생각하며 오래된 것부터 놓아요.',
    cards: [ { id: 'c1', text: '걷기' }, { id: 'c2', text: '수레' }, { id: 'c3', text: '기차' }, { id: 'c4', text: '자동차' }, { id: 'c5', text: '고속철도' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 'l3-q2', stage: 3, order: 2, type: 'order',
    prompt: '옛날부터 오늘날까지 순서대로 선택하세요.', hint: '사람의 힘에서 동물, 그다음 기계의 힘으로 발전했어요.',
    cards: [ { id: 'c1', text: '걷기' }, { id: 'c2', text: '말' }, { id: 'c3', text: '수레' }, { id: 'c4', text: '자전거' }, { id: 'c5', text: '오토바이' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 'l3-q3', stage: 3, order: 3, type: 'order',
    prompt: '배의 발달 순서대로 선택하세요.', hint: '점점 더 크고 튼튼한 배로 발전했어요.',
    cards: [ { id: 'c1', text: '뗏목' }, { id: 'c2', text: '나룻배' }, { id: 'c3', text: '돛단배' }, { id: 'c4', text: '증기선' }, { id: 'c5', text: '대형 여객선' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 'l3-q4', stage: 3, order: 4, type: 'order',
    prompt: '땅 위 교통수단의 발달 순서대로 선택하세요.', hint: '느린 것부터 빠른 것까지예요.',
    cards: [ { id: 'c1', text: '가마' }, { id: 'c2', text: '수레' }, { id: 'c3', text: '증기 기차' }, { id: 'c4', text: '자동차' }, { id: 'c5', text: '고속철도(KTX)' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 'l3-q5', stage: 3, order: 5, type: 'order',
    prompt: '먼 거리 이동 수단의 발달 순서대로 선택하세요.', hint: '더 멀리, 더 빠르게 갈 수 있게 발전했어요.',
    cards: [ { id: 'c1', text: '걷기' }, { id: 'c2', text: '말' }, { id: 'c3', text: '기차' }, { id: 'c4', text: '자동차' }, { id: 'c5', text: '비행기' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4', 'c5'] },

  // ───────── 4단계 : 시설·변화 연결 (connect) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'connect',
    prompt: '교통수단을 이용하는 시설로 끌어다 연결하세요.', hint: '어디에서 타고 내리는지 생각해요.',
    left: [ { id: 'a', text: '비행기' }, { id: 'b', text: '기차' }, { id: 'c', text: '배' } ],
    right: [ { id: 'x', text: '공항' }, { id: 'y', text: '기차역' }, { id: 'z', text: '항구' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'connect',
    prompt: '교통수단의 발달로 달라진 생활 모습을 끌어다 연결하세요.', hint: '무엇이 편리해졌는지 생각해요.',
    left: [ { id: 'a', text: '고속철도' }, { id: 'b', text: '자동차' }, { id: 'c', text: '비행기' } ],
    right: [ { id: 'x', text: '먼 도시도 몇 시간이면 오가요' }, { id: 'y', text: '원하는 곳으로 편하게 이동해요' }, { id: 'z', text: '외국까지 빠르게 갈 수 있어요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'connect',
    prompt: '자연환경에 맞는 교통수단을 끌어다 연결하세요.', hint: '갯벌·산·눈에 어울리는 것을 생각해요.',
    left: [ { id: 'a', text: '갯벌이 넓은 바닷가' }, { id: 'b', text: '높고 가파른 산' }, { id: 'c', text: '눈이 많은 고장' } ],
    right: [ { id: 'x', text: '갯배·경운기' }, { id: 'y', text: '케이블카' }, { id: 'z', text: '설상차(눈 위 차)' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'connect',
    prompt: '교통 발달이 가져온 변화를 끌어다 연결하세요.', hint: '시간·운반·여행을 떠올려요.',
    left: [ { id: 'a', text: '이동 시간' }, { id: 'b', text: '물건 운반' }, { id: 'c', text: '여행' } ],
    right: [ { id: 'x', text: '훨씬 짧아졌어요' }, { id: 'y', text: '멀리까지 빠르게 보내요' }, { id: 'z', text: '먼 곳도 쉽게 다녀와요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'connect',
    prompt: '미래의 교통·통신 수단을 특징으로 끌어다 연결하세요.', hint: '앞으로 달라질 모습을 생각해요.',
    left: [ { id: 'a', text: '자율주행차' }, { id: 'b', text: '수소·전기차' }, { id: 'c', text: '화상 통화' } ],
    right: [ { id: 'x', text: '사람이 운전하지 않아도 달려요' }, { id: 'y', text: '매연이 적어 환경에 좋아요' }, { id: 'z', text: '멀리 있어도 얼굴 보며 이야기해요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },

  // ───────── 5단계 : 장점/문제점 구분 (sort) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'sort',
    prompt: '교통 발달의 영향을 좋은 점과 문제점으로 끌어다 분류하세요.', hint: '편리한 점과 나쁜 점을 나눠요.',
    bins: [ { id: 'good', label: '좋은 점' }, { id: 'bad', label: '문제점' } ],
    items: [ { id: 'i1', text: '빠르게 이동할 수 있다' }, { id: 'i2', text: '교통 체증이 생긴다' }, { id: 'i3', text: '공기가 오염될 수 있다' }, { id: 'i4', text: '먼 곳도 쉽게 갈 수 있다' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'bad', i4: 'good' } },
  { id: 'l5-q2', stage: 5, order: 2, type: 'sort',
    prompt: '교통 발달의 영향을 좋은 점과 문제점으로 끌어다 분류하세요.', hint: '생활이 어떻게 바뀌었는지 생각해요.',
    bins: [ { id: 'good', label: '좋은 점' }, { id: 'bad', label: '문제점' } ],
    items: [ { id: 'i1', text: '물건을 멀리까지 빠르게 보낸다' }, { id: 'i2', text: '교통사고가 늘 수 있다' }, { id: 'i3', text: '여행이 편리해졌다' }, { id: 'i4', text: '소음이 심해진다' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },
  { id: 'l5-q3', stage: 5, order: 3, type: 'sort',
    prompt: '교통 발달의 영향을 좋은 점과 문제점으로 끌어다 분류하세요.', hint: '환경과 편리함을 떠올려요.',
    bins: [ { id: 'good', label: '좋은 점' }, { id: 'bad', label: '문제점' } ],
    items: [ { id: 'i1', text: '먼 지역 사람과 쉽게 만난다' }, { id: 'i2', text: '매연으로 환경이 나빠진다' }, { id: 'i3', text: '주차 공간이 부족해진다' }, { id: 'i4', text: '응급 환자를 빨리 옮긴다' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'bad', i4: 'good' } },
  { id: 'l5-q4', stage: 5, order: 4, type: 'sort',
    prompt: '교통 발달로 생긴 변화를 좋은 점과 문제점으로 끌어다 분류하세요.', hint: '도움이 되는지 불편한지 생각해요.',
    bins: [ { id: 'good', label: '좋은 점' }, { id: 'bad', label: '문제점' } ],
    items: [ { id: 'i1', text: '지역끼리 교류가 활발해진다' }, { id: 'i2', text: '도로가 막혀 시간이 오래 걸린다' }, { id: 'i3', text: '기름을 많이 써 자원이 준다' }, { id: 'i4', text: '신선한 식품을 빨리 배달받는다' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'bad', i4: 'good' } },
  { id: 'l5-q5', stage: 5, order: 5, type: 'sort',
    prompt: '깨끗한 교통을 위한 노력과 문제점을 끌어다 분류하세요.', hint: '환경을 지키는 노력인지 문제인지 생각해요.',
    bins: [ { id: 'good', label: '노력(좋은 점)' }, { id: 'bad', label: '문제점' } ],
    items: [ { id: 'i1', text: '전기차·수소차를 이용한다' }, { id: 'i2', text: '대기오염이 심해진다' }, { id: 'i3', text: '대중교통을 함께 이용한다' }, { id: 'i4', text: '자동차가 많아 사고 위험이 커진다' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
