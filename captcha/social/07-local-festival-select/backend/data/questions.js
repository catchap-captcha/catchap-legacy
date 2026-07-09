/**
 * 지역 축제 포스터 찾기 — 문제 은행 (5단계 × 5문제 = 25문제) · 4학년 심화 · 유형 다양화(드래그 최소화)
 * ---------------------------------------------------------------
 *   1단계 축제 주제        축제와 가장 관련 깊은 주제 고르기     (single·객관식 탭)
 *   2단계 특산물 연결      특산물 ↔ 어울리는 축제 연결          (connect·드래그)
 *   3단계 계절 순서        축제를 봄→여름→가을→겨울 순서로 배열 (order·순서 탭)
 *   4단계 목적·효과        축제를 여는 목적·효과 고르기          (single·객관식 탭)
 *   5단계 축제 기획        지역 특징에 맞는 카드 모두 담기       (pick·드래그)
 *
 *  ※ 예전에는 5단계가 모두 드래그(연결·분류·담기)였는데, 탭으로 푸는
 *    객관식·순서 배열을 넣어 조작 방식을 다양하게 바꿨다.
 */

const QUESTIONS = [
  // ───────── 1단계 : 축제 주제 (single·객관식) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'single', optionLayout: 'grid',
    prompt: '‘태백 눈꽃 축제’는 무엇과 가장 관련이 깊을까요?', hint: '축제 이름 속 낱말을 살펴봐요.',
    options: [ { id: 'a', text: '봄·꽃' }, { id: 'b', text: '겨울·눈' }, { id: 'c', text: '바다·갯벌' }, { id: 'd', text: '단풍 든 산' } ],
    answer: 'b' },
  { id: 'l1-q2', stage: 1, order: 2, type: 'single', optionLayout: 'grid',
    prompt: '‘보령 머드 축제’에서 즐기는 것은 무엇일까요?', hint: '‘머드’는 진흙이라는 뜻이에요.',
    options: [ { id: 'a', text: '겨울 눈썰매' }, { id: 'b', text: '산속 단풍' }, { id: 'c', text: '등불 구경' }, { id: 'd', text: '갯벌 진흙' } ],
    answer: 'd' },
  { id: 'l1-q3', stage: 1, order: 3, type: 'single', optionLayout: 'grid',
    prompt: '봄에 열리는 ‘진해 군항제’로 특히 유명한 것은?', hint: '봄에 피는 분홍빛 꽃이에요.',
    options: [ { id: 'a', text: '벚꽃' }, { id: 'b', text: '얼음낚시' }, { id: 'c', text: '갯벌 체험' }, { id: 'd', text: '인삼 캐기' } ],
    answer: 'a' },
  { id: 'l1-q4', stage: 1, order: 4, type: 'single', optionLayout: 'grid',
    prompt: '‘산천어(빙어) 축제’는 주로 어디에서 열릴까요?', hint: '겨울에 무엇을 뚫고 낚시할지 생각해요.',
    options: [ { id: 'a', text: '뜨거운 바닷가' }, { id: 'b', text: '넓은 사막' }, { id: 'c', text: '얼어붙은 강·호수' }, { id: 'd', text: '높은 빌딩 옥상' } ],
    answer: 'c' },
  { id: 'l1-q5', stage: 1, order: 5, type: 'single', optionLayout: 'grid',
    prompt: '‘안동 탈춤 축제’에서 볼 수 있는 것은?', hint: '옛날부터 이어온 전통 공연이에요.',
    options: [ { id: 'a', text: '자동차 경주' }, { id: 'b', text: '전통 탈춤 공연' }, { id: 'c', text: '로봇 대회' }, { id: 'd', text: '불꽃 쏘기' } ],
    answer: 'b' },

  // ───────── 2단계 : 특산물 연결 (connect·드래그) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'connect',
    prompt: '특산물을 어울리는 축제로 끌어다 연결하세요.', hint: '무엇으로 유명한 축제인지 생각해요.',
    left: [ { id: 'a', text: '딸기' }, { id: 'b', text: '인삼' }, { id: 'c', text: '고추' } ],
    right: [ { id: 'x', text: '딸기 축제' }, { id: 'y', text: '인삼 축제' }, { id: 'z', text: '고추 축제' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l2-q2', stage: 2, order: 2, type: 'connect',
    prompt: '지역의 특산물을 축제로 끌어다 연결하세요.', hint: '그 지역에서 많이 나는 것이에요.',
    left: [ { id: 'a', text: '제주 감귤' }, { id: 'b', text: '영덕 대게' }, { id: 'c', text: '보성 녹차' } ],
    right: [ { id: 'x', text: '감귤 축제' }, { id: 'y', text: '대게 축제' }, { id: 'z', text: '녹차 축제' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l2-q3', stage: 2, order: 3, type: 'connect',
    prompt: '특산물을 축제로 끌어다 연결하세요.', hint: '바다·강·논에서 나는 것을 생각해요.',
    left: [ { id: 'a', text: '방어' }, { id: 'b', text: '햅쌀' }, { id: 'c', text: '새우' } ],
    right: [ { id: 'x', text: '방어 축제' }, { id: 'y', text: '햅쌀(쌀) 축제' }, { id: 'z', text: '새우 축제' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l2-q4', stage: 2, order: 4, type: 'connect',
    prompt: '특산물을 축제로 끌어다 연결하세요.', hint: '과일과 채소 축제를 떠올려요.',
    left: [ { id: 'a', text: '사과' }, { id: 'b', text: '포도' }, { id: 'c', text: '마늘' } ],
    right: [ { id: 'x', text: '사과 축제' }, { id: 'y', text: '포도 축제' }, { id: 'z', text: '마늘 축제' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l2-q5', stage: 2, order: 5, type: 'connect',
    prompt: '지역과 그 지역 특산물 축제를 끌어다 연결하세요.', hint: '지역 이름과 대표 먹거리를 떠올려요.',
    left: [ { id: 'a', text: '금산' }, { id: 'b', text: '횡성' }, { id: 'c', text: '광양' } ],
    right: [ { id: 'x', text: '인삼 축제' }, { id: 'y', text: '한우 축제' }, { id: 'z', text: '매화 축제' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },

  // ───────── 3단계 : 계절 순서 배열 (order·순서 탭) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'order',
    prompt: '축제를 열리는 계절 순서(봄→여름→가을→겨울)대로 선택하세요.', hint: '각 축제가 어느 계절에 열리는지 생각해요.',
    cards: [ { id: 'summer', text: '보령 머드 축제' }, { id: 'winter', text: '태백 눈꽃 축제' }, { id: 'spring', text: '진해 벚꽃 축제' }, { id: 'autumn', text: '내장산 단풍 축제' } ],
    correctSequence: [ 'spring', 'summer', 'autumn', 'winter' ] },
  { id: 'l3-q2', stage: 3, order: 2, type: 'order',
    prompt: '축제를 열리는 계절 순서(봄→여름→가을→겨울)대로 선택하세요.', hint: '꽃·과일·얼음이 언제인지 떠올려요.',
    cards: [ { id: 'autumn', text: '마산 국화 축제' }, { id: 'spring', text: '광양 매화 축제' }, { id: 'winter', text: '화천 얼음낚시 축제' }, { id: 'summer', text: '정남진 수박 축제' } ],
    correctSequence: [ 'spring', 'summer', 'autumn', 'winter' ] },
  { id: 'l3-q3', stage: 3, order: 3, type: 'order',
    prompt: '축제를 열리는 계절 순서(봄→여름→가을→겨울)대로 선택하세요.', hint: '진달래·물놀이·사과·빙어를 생각해요.',
    cards: [ { id: 'winter', text: '인제 빙어 축제' }, { id: 'autumn', text: '청송 사과 축제' }, { id: 'spring', text: '영취산 진달래 축제' }, { id: 'summer', text: '유성 물놀이 축제' } ],
    correctSequence: [ 'spring', 'summer', 'autumn', 'winter' ] },
  { id: 'l3-q4', stage: 3, order: 4, type: 'order',
    prompt: '축제를 열리는 계절 순서(봄→여름→가을→겨울)대로 선택하세요.', hint: '유채꽃·옥수수·코스모스·눈을 떠올려요.',
    cards: [ { id: 'spring', text: '제주 유채꽃 축제' }, { id: 'summer', text: '홍천 옥수수 축제' }, { id: 'winter', text: '대관령 눈꽃 축제' }, { id: 'autumn', text: '구리 코스모스 축제' } ],
    correctSequence: [ 'spring', 'summer', 'autumn', 'winter' ] },
  { id: 'l3-q5', stage: 3, order: 5, type: 'order',
    prompt: '축제를 열리는 계절 순서(봄→여름→가을→겨울)대로 선택하세요.', hint: '벚꽃·갯벌·햅쌀·산천어를 생각해요.',
    cards: [ { id: 'autumn', text: '이천 햅쌀 축제' }, { id: 'summer', text: '서천 갯벌 축제' }, { id: 'spring', text: '경주 벚꽃 축제' }, { id: 'winter', text: '화천 산천어 축제' } ],
    correctSequence: [ 'spring', 'summer', 'autumn', 'winter' ] },

  // ───────── 4단계 : 목적·효과 (single·객관식) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'single', optionLayout: 'grid',
    prompt: '지역 축제를 여는 목적으로 알맞은 것은?', hint: '우리 고장에 도움이 되는 일을 생각해요.',
    options: [ { id: 'a', text: '학교 시험을 보려고' }, { id: 'b', text: '우리 고장을 널리 알리려고' }, { id: 'c', text: '도로를 새로 만들려고' }, { id: 'd', text: '세금을 더 걷으려고' } ],
    answer: 'b' },
  { id: 'l4-q2', stage: 4, order: 2, type: 'single', optionLayout: 'grid',
    prompt: '축제가 지역 경제에 주는 좋은 점은?', hint: '사람이 많이 오면 무엇이 생길까요?',
    options: [ { id: 'a', text: '관광객이 늘어 소득이 생겨요' }, { id: 'b', text: '인구가 갑자기 줄어요' }, { id: 'c', text: '공장이 모두 문을 닫아요' }, { id: 'd', text: '물건값만 크게 올라요' } ],
    answer: 'a' },
  { id: 'l4-q3', stage: 4, order: 3, type: 'single', optionLayout: 'grid',
    prompt: '전통 축제를 여는 가장 큰 뜻은?', hint: '옛것을 잘 지키는 일이에요.',
    options: [ { id: 'a', text: '최신 기술을 팔려고' }, { id: 'b', text: '아파트를 지으려고' }, { id: 'c', text: '옛 문화를 이어가려고' }, { id: 'd', text: '외국어를 배우려고' } ],
    answer: 'c' },
  { id: 'l4-q4', stage: 4, order: 4, type: 'single', optionLayout: 'grid',
    prompt: '축제를 준비할 때 지켜야 할 점으로 알맞은 것은?', hint: '깨끗하고 안전한 축제를 생각해요.',
    options: [ { id: 'a', text: '쓰레기를 아무 데나 버려요' }, { id: 'b', text: '밤새 시끄럽게 해요' }, { id: 'c', text: '주민은 신경 쓰지 않아요' }, { id: 'd', text: '쓰레기를 줄이고 잘 치워요' } ],
    answer: 'd' },
  { id: 'l4-q5', stage: 4, order: 5, type: 'single', optionLayout: 'grid',
    prompt: '축제가 관광객에게 주는 좋은 점은?', hint: '놀러 온 사람이 무엇을 얻을까요?',
    options: [ { id: 'a', text: '즐거운 볼거리와 체험을 줘요' }, { id: 'b', text: '무거운 세금을 물려요' }, { id: 'c', text: '긴 줄서기 벌을 줘요' }, { id: 'd', text: '시험 성적을 매겨요' } ],
    answer: 'a' },

  // ───────── 5단계 : 축제 기획 (pick·드래그) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'pick', target: '사과 축제에 어울리는 카드 담기', boxHint: '사과와 관련된 것만 끌어와요',
    prompt: '사과가 유명한 지역이에요. 축제에 어울리는 카드를 모두 골라 담아보세요.', hint: '사과와 관련된 활동만 담아요.',
    items: [ { id: 'i1', text: '사과 따기 체험' }, { id: 'i2', text: '사과 요리 만들기' }, { id: 'i3', text: '사과 판매장' }, { id: 'i4', text: '생선회 시식' }, { id: 'i5', text: '눈썰매장' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l5-q2', stage: 5, order: 2, type: 'pick', target: '바닷가 축제에 어울리는 카드 담기', boxHint: '바다와 관련된 것만 끌어와요',
    prompt: '바닷가 어촌 마을이에요. 축제에 어울리는 카드를 모두 골라 담아보세요.', hint: '바다와 관련된 활동만 담아요.',
    items: [ { id: 'i1', text: '조개 캐기 체험' }, { id: 'i2', text: '수산물 시장' }, { id: 'i3', text: '바다 낚시 체험' }, { id: 'i4', text: '사과 따기' }, { id: 'i5', text: '스키 강습' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l5-q3', stage: 5, order: 3, type: 'pick', target: '겨울 산촌 축제에 어울리는 카드 담기', boxHint: '겨울·눈과 관련된 것만 끌어와요',
    prompt: '눈이 많은 겨울 산촌이에요. 축제에 어울리는 카드를 모두 골라 담아보세요.', hint: '겨울·눈과 관련된 활동만 담아요.',
    items: [ { id: 'i1', text: '눈 조각 만들기' }, { id: 'i2', text: '눈썰매 타기' }, { id: 'i3', text: '얼음낚시' }, { id: 'i4', text: '해수욕' }, { id: 'i5', text: '수박 먹기 대회' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l5-q4', stage: 5, order: 4, type: 'pick', target: '역사·전통 축제에 어울리는 카드 담기', boxHint: '전통과 관련된 것만 끌어와요',
    prompt: '전통과 역사가 깊은 고장이에요. 축제에 어울리는 카드를 모두 골라 담아보세요.', hint: '옛 문화를 알리는 활동만 담아요.',
    items: [ { id: 'i1', text: '전통 탈춤 공연' }, { id: 'i2', text: '한복 입기 체험' }, { id: 'i3', text: '전통 놀이 마당' }, { id: 'i4', text: '스마트폰 게임 대회' }, { id: 'i5', text: '롤러코스터 타기' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l5-q5', stage: 5, order: 5, type: 'pick', target: '녹차밭 마을 축제에 어울리는 카드 담기', boxHint: '녹차와 관련된 것만 끌어와요',
    prompt: '넓은 녹차밭이 있는 마을이에요. 축제에 어울리는 카드를 모두 골라 담아보세요.', hint: '녹차와 관련된 활동만 담아요.',
    items: [ { id: 'i1', text: '찻잎 따기 체험' }, { id: 'i2', text: '전통 차 마시기' }, { id: 'i3', text: '녹차 디저트 만들기' }, { id: 'i4', text: '감자 캐기' }, { id: 'i5', text: '스키장 이용' } ],
    answers: ['i1', 'i2', 'i3'] },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
