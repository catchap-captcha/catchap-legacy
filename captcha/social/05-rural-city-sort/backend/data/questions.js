/**
 * 촌락과 도시 구분 — 문제 은행 (5단계 × 5문제 = 25문제) · 4학년 심화 · 드래그 중심 · 이모지 없음
 * ---------------------------------------------------------------
 *   1단계 촌락/도시 구분   모습을 촌락·도시로 분류           (sort·드래그)
 *   2단계 촌락 모두 찾기   촌락(농촌·어촌·산지촌) 모습 담기   (pick·드래그)
 *   3단계 도시 모두 찾기   도시 모습·특징·문제 담기          (pick·드래그)
 *   4단계 촌락 종류 구분   농촌·어촌·산지촌으로 분류          (sort·드래그)
 *   5단계 상호 관계·문제   교류·문제해결을 연결              (connect·드래그)
 */

const QUESTIONS = [
  // ───────── 1단계 : 촌락/도시 구분 (sort) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'sort',
    prompt: '각 모습을 촌락과 도시로 끌어다 분류하세요.', hint: '자연에서 일하는 곳인지, 건물이 많은 곳인지 생각해요.',
    bins: [ { id: 'chon', label: '촌락' }, { id: 'do', label: '도시' } ],
    items: [ { id: 'i1', text: '넓은 논밭' }, { id: 'i2', text: '고층 빌딩' }, { id: 'i3', text: '고기잡이배가 있는 항구' }, { id: 'i4', text: '지하철역' } ],
    answers: { i1: 'chon', i2: 'do', i3: 'chon', i4: 'do' } },
  { id: 'l1-q2', stage: 1, order: 2, type: 'sort',
    prompt: '각 모습을 촌락과 도시로 끌어다 분류하세요.', hint: '한적한 곳과 붐비는 곳으로 나눠요.',
    bins: [ { id: 'chon', label: '촌락' }, { id: 'do', label: '도시' } ],
    items: [ { id: 'i1', text: '젖소를 키우는 목장' }, { id: 'i2', text: '백화점' }, { id: 'i3', text: '과수원' }, { id: 'i4', text: '회사 건물이 모인 거리' } ],
    answers: { i1: 'chon', i2: 'do', i3: 'chon', i4: 'do' } },
  { id: 'l1-q3', stage: 1, order: 3, type: 'sort',
    prompt: '각 모습을 촌락과 도시로 끌어다 분류하세요.', hint: '인구가 적은 곳과 많은 곳을 생각해요.',
    bins: [ { id: 'chon', label: '촌락' }, { id: 'do', label: '도시' } ],
    items: [ { id: 'i1', text: '갯벌' }, { id: 'i2', text: '아파트 단지' }, { id: 'i3', text: '산비탈의 밭' }, { id: 'i4', text: '지하상가' } ],
    answers: { i1: 'chon', i2: 'do', i3: 'chon', i4: 'do' } },
  { id: 'l1-q4', stage: 1, order: 4, type: 'sort',
    prompt: '각 모습을 촌락과 도시로 끌어다 분류하세요.', hint: '자연을 이용하는 곳과 시설이 많은 곳을 나눠요.',
    bins: [ { id: 'chon', label: '촌락' }, { id: 'do', label: '도시' } ],
    items: [ { id: 'i1', text: '어선이 드나드는 포구' }, { id: 'i2', text: '넓은 도로와 신호등' }, { id: 'i3', text: '비닐하우스' }, { id: 'i4', text: '큰 병원과 공연장' } ],
    answers: { i1: 'chon', i2: 'do', i3: 'chon', i4: 'do' } },
  { id: 'l1-q5', stage: 1, order: 5, type: 'sort',
    prompt: '생활 모습을 촌락과 도시로 끌어다 분류하세요.', hint: '무엇을 하며 사는지 생각해요.',
    bins: [ { id: 'chon', label: '촌락' }, { id: 'do', label: '도시' } ],
    items: [ { id: 'i1', text: '가축을 기른다' }, { id: 'i2', text: '회사에 다닌다' }, { id: 'i3', text: '바다에서 김을 기른다' }, { id: 'i4', text: '지하철로 출근한다' } ],
    answers: { i1: 'chon', i2: 'do', i3: 'chon', i4: 'do' } },

  // ───────── 2단계 : 촌락 모두 찾기 (pick) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'pick', target: '촌락의 모습 담기', boxHint: '촌락의 모습만 이 상자로 끌어와요',
    prompt: '촌락의 모습을 모두 골라 담아보세요.', hint: '자연과 함께 일하는 곳이에요.',
    items: [ { id: 'i1', text: '논' }, { id: 'i2', text: '밭' }, { id: 'i3', text: '항구' }, { id: 'i4', text: '지하철역' }, { id: 'i5', text: '고층 빌딩' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q2', stage: 2, order: 2, type: 'pick', target: '촌락 사람들이 하는 일 담기', boxHint: '촌락에서 하는 일만 끌어와요',
    prompt: '촌락 사람들이 주로 하는 일을 모두 골라 담아보세요.', hint: '자연에서 얻는 일을 떠올려요.',
    items: [ { id: 'i1', text: '벼농사 짓기' }, { id: 'i2', text: '바다에서 고기잡기' }, { id: 'i3', text: '가축 기르기' }, { id: 'i4', text: '회사에서 서류 작성' }, { id: 'i5', text: '택시 운전' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q3', stage: 2, order: 3, type: 'pick', target: '어촌에서 볼 수 있는 것 담기', boxHint: '어촌에서 볼 수 있는 것만 끌어와요',
    prompt: '어촌에서 볼 수 있는 것을 모두 골라 담아보세요.', hint: '바닷가 마을을 떠올려요.',
    items: [ { id: 'i1', text: '등대' }, { id: 'i2', text: '고기잡이배' }, { id: 'i3', text: '김·굴 양식장' }, { id: 'i4', text: '스키장' }, { id: 'i5', text: '백화점' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q4', stage: 2, order: 4, type: 'pick', target: '농촌에서 볼 수 있는 것 담기', boxHint: '농촌에서 볼 수 있는 것만 끌어와요',
    prompt: '농촌에서 볼 수 있는 것을 모두 골라 담아보세요.', hint: '농사를 짓는 마을을 떠올려요.',
    items: [ { id: 'i1', text: '넓은 논' }, { id: 'i2', text: '비닐하우스' }, { id: 'i3', text: '과수원' }, { id: 'i4', text: '지하철' }, { id: 'i5', text: '대형 마트' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q5', stage: 2, order: 5, type: 'pick', target: '산지촌에서 볼 수 있는 것 담기', boxHint: '산지촌에서 볼 수 있는 것만 끌어와요',
    prompt: '산지촌(산골 마을)에서 볼 수 있는 것을 모두 골라 담아보세요.', hint: '산에서 얻는 것을 떠올려요.',
    items: [ { id: 'i1', text: '계단식 밭' }, { id: 'i2', text: '목재(나무) 생산' }, { id: 'i3', text: '산나물·약초 캐기' }, { id: 'i4', text: '항구' }, { id: 'i5', text: '아파트' } ],
    answers: ['i1', 'i2', 'i3'] },

  // ───────── 3단계 : 도시 모두 찾기 (pick) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'pick', target: '도시의 모습 담기', boxHint: '도시의 모습만 끌어와요',
    prompt: '도시의 모습을 모두 골라 담아보세요.', hint: '사람과 건물이 많아요.',
    items: [ { id: 'i1', text: '아파트' }, { id: 'i2', text: '지하철' }, { id: 'i3', text: '회사 건물' }, { id: 'i4', text: '논' }, { id: 'i5', text: '어촌 포구' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q2', stage: 3, order: 2, type: 'pick', target: '도시가 발달한 까닭 담기', boxHint: '도시가 발달한 까닭만 끌어와요',
    prompt: '도시에 사람이 많이 모여 사는 까닭을 모두 골라 담아보세요.', hint: '살기 편리한 점을 떠올려요.',
    items: [ { id: 'i1', text: '일자리가 많다' }, { id: 'i2', text: '교통이 편리하다' }, { id: 'i3', text: '편의시설이 많다' }, { id: 'i4', text: '논밭이 넓다' }, { id: 'i5', text: '사람이 거의 없다' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q3', stage: 3, order: 3, type: 'pick', target: '도시에서 많이 하는 일 담기', boxHint: '도시에서 많이 하는 일만 끌어와요',
    prompt: '도시에서 주로 하는 일을 모두 골라 담아보세요.', hint: '회사·상업·서비스 일을 떠올려요.',
    items: [ { id: 'i1', text: '회사에서 일하기' }, { id: 'i2', text: '가게에서 물건 팔기' }, { id: 'i3', text: '버스·택시 운전하기' }, { id: 'i4', text: '벼농사 짓기' }, { id: 'i5', text: '고기잡이하기' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q4', stage: 3, order: 4, type: 'pick', target: '도시의 문제 담기', boxHint: '도시에서 생기는 문제만 끌어와요',
    prompt: '도시에 사람이 많이 모여 생기는 문제를 모두 골라 담아보세요.', hint: '너무 붐빌 때 생기는 일을 생각해요.',
    items: [ { id: 'i1', text: '교통이 혼잡하다' }, { id: 'i2', text: '집이 부족하다' }, { id: 'i3', text: '환경이 오염된다' }, { id: 'i4', text: '일손이 부족하다' }, { id: 'i5', text: '인구가 줄어든다' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l3-q5', stage: 3, order: 5, type: 'pick', target: '도시의 시설 담기', boxHint: '도시에서 볼 수 있는 시설만 끌어와요',
    prompt: '도시에서 볼 수 있는 시설을 모두 골라 담아보세요.', hint: '많은 사람이 이용하는 시설이에요.',
    items: [ { id: 'i1', text: '지하철역' }, { id: 'i2', text: '큰 종합병원' }, { id: 'i3', text: '공연장' }, { id: 'i4', text: '갯벌' }, { id: 'i5', text: '축사' } ],
    answers: ['i1', 'i2', 'i3'] },

  // ───────── 4단계 : 촌락 종류 구분 (sort) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'sort',
    prompt: '하는 일을 촌락 종류에 맞게 끌어다 분류하세요.', hint: '들·바다·산 중 어디에서 하는 일인지 생각해요.',
    bins: [ { id: 'nong', label: '농촌' }, { id: 'eo', label: '어촌' }, { id: 'san', label: '산지촌' } ],
    items: [ { id: 'i1', text: '벼농사' }, { id: 'i2', text: '고기잡이' }, { id: 'i3', text: '버섯 재배' }, { id: 'i4', text: '과수원 가꾸기' }, { id: 'i5', text: '김 양식' } ],
    answers: { i1: 'nong', i2: 'eo', i3: 'san', i4: 'nong', i5: 'eo' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'sort',
    prompt: '모습을 촌락 종류에 맞게 끌어다 분류하세요.', hint: '어디에서 볼 수 있는 모습인지 생각해요.',
    bins: [ { id: 'nong', label: '농촌' }, { id: 'eo', label: '어촌' }, { id: 'san', label: '산지촌' } ],
    items: [ { id: 'i1', text: '비닐하우스' }, { id: 'i2', text: '등대' }, { id: 'i3', text: '목재 생산' }, { id: 'i4', text: '축사' }, { id: 'i5', text: '조개 캐기' } ],
    answers: { i1: 'nong', i2: 'eo', i3: 'san', i4: 'nong', i5: 'eo' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'sort',
    prompt: '얻는 것을 촌락 종류에 맞게 끌어다 분류하세요.', hint: '들·바다·산에서 나는 것을 생각해요.',
    bins: [ { id: 'nong', label: '농촌' }, { id: 'eo', label: '어촌' }, { id: 'san', label: '산지촌' } ],
    items: [ { id: 'i1', text: '쌀·채소' }, { id: 'i2', text: '생선·조개' }, { id: 'i3', text: '버섯·산나물' }, { id: 'i4', text: '과일' }, { id: 'i5', text: '미역·김' } ],
    answers: { i1: 'nong', i2: 'eo', i3: 'san', i4: 'nong', i5: 'eo' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'sort',
    prompt: '일하는 모습을 촌락 종류에 맞게 끌어다 분류하세요.', hint: '누가 무엇을 하는지 생각해요.',
    bins: [ { id: 'nong', label: '농촌' }, { id: 'eo', label: '어촌' }, { id: 'san', label: '산지촌' } ],
    items: [ { id: 'i1', text: '트랙터로 밭 갈기' }, { id: 'i2', text: '그물로 물고기 잡기' }, { id: 'i3', text: '벌 키워 꿀 얻기' }, { id: 'i4', text: '모내기하기' }, { id: 'i5', text: '양식장 돌보기' } ],
    answers: { i1: 'nong', i2: 'eo', i3: 'san', i4: 'nong', i5: 'eo' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'sort',
    prompt: '시설을 촌락 종류에 맞게 끌어다 분류하세요.', hint: '들·바다·산에 어울리는 시설을 생각해요.',
    bins: [ { id: 'nong', label: '농촌' }, { id: 'eo', label: '어촌' }, { id: 'san', label: '산지촌' } ],
    items: [ { id: 'i1', text: '정미소(쌀 찧는 곳)' }, { id: 'i2', text: '방파제' }, { id: 'i3', text: '목재 저장소' }, { id: 'i4', text: '농산물 저장 창고' }, { id: 'i5', text: '수산물 위판장' } ],
    answers: { i1: 'nong', i2: 'eo', i3: 'san', i4: 'nong', i5: 'eo' } },

  // ───────── 5단계 : 상호 관계·문제 해결 (connect) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'connect',
    prompt: '지역이 주는 것을 알맞게 끌어다 연결하세요.', hint: '각 지역이 무엇을 제공하는지 생각해요.',
    left: [ { id: 'a', text: '농촌' }, { id: 'b', text: '어촌' }, { id: 'c', text: '도시' } ],
    right: [ { id: 'x', text: '쌀·채소 같은 곡식과 농산물' }, { id: 'y', text: '생선·해산물' }, { id: 'z', text: '일자리와 편의시설' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l5-q2', stage: 5, order: 2, type: 'connect',
    prompt: '촌락과 도시의 교류 방법을 설명으로 끌어다 연결하세요.', hint: '서로 오가며 돕는 모습이에요.',
    left: [ { id: 'a', text: '농산물 직거래 장터' }, { id: 'b', text: '농촌 체험 마을' }, { id: 'c', text: '자매결연' } ],
    right: [ { id: 'x', text: '싱싱한 농산물을 싸게 사고팔아요' }, { id: 'y', text: '도시 사람이 농촌 생활을 체험해요' }, { id: 'z', text: '두 지역이 서로 돕기로 약속해요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l5-q3', stage: 5, order: 3, type: 'connect',
    prompt: '도시 문제와 알맞은 해결 방법을 끌어다 연결하세요.', hint: '문제를 줄이는 방법을 생각해요.',
    left: [ { id: 'a', text: '교통 혼잡' }, { id: 'b', text: '주택 부족' }, { id: 'c', text: '쓰레기 증가' } ],
    right: [ { id: 'x', text: '대중교통과 자전거를 이용해요' }, { id: 'y', text: '새 주택과 신도시를 지어요' }, { id: 'z', text: '분리배출과 재활용을 늘려요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l5-q4', stage: 5, order: 4, type: 'connect',
    prompt: '촌락 문제와 알맞은 해결 방법을 끌어다 연결하세요.', hint: '촌락에 부족한 것을 채워요.',
    left: [ { id: 'a', text: '일손 부족' }, { id: 'b', text: '시설 부족' }, { id: 'c', text: '인구 감소' } ],
    right: [ { id: 'x', text: '농기계를 쓰고 귀촌을 도와요' }, { id: 'y', text: '의료·문화 시설을 늘려요' }, { id: 'z', text: '체험 마을로 관광객을 불러요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
  { id: 'l5-q5', stage: 5, order: 5, type: 'connect',
    prompt: '촌락 종류와 특징을 끌어다 연결하세요.', hint: '자연환경을 어떻게 이용하는지 생각해요.',
    left: [ { id: 'a', text: '농촌' }, { id: 'b', text: '어촌' }, { id: 'c', text: '산지촌' } ],
    right: [ { id: 'x', text: '넓은 들에서 농사를 지어요' }, { id: 'y', text: '바다에서 물고기를 잡거나 길러요' }, { id: 'z', text: '산에서 임산물을 얻어요' } ],
    answers: { a: 'x', b: 'y', c: 'z' } },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
