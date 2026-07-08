/**
 * 날씨 안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 조작: 왼쪽 '날씨/상황' 카드와 오른쪽 '행동/준비물' 카드를 선으로 연결(connect).
 *   1단계  날씨 1개 연결
 *   2단계  날씨 2개 연결
 *   3단계  날씨-준비물 연결
 *   4단계  위험 행동 제외(안전한 행동에만 연결, 오른쪽에 위험 행동이 섞임)
 *   5단계  복합 날씨 연결(상황 속 여러 필요를 준비물에 연결)
 *
 * type: 'connect' → answers = { leftId: rightId } (오른쪽에 정답보다 많은 보기 가능)
 * ⚠️ answers 는 프론트로 내려가지 않는다.(sanitizeQuestion)
 */

const QUESTIONS = [
  // ───────── 1단계 : 날씨 1개 연결 ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'connect', prompt: '날씨와 알맞은 행동을 연결해보세요.', hint: '비가 오면 무엇을 쓸까요?',
    left: [{ id: 'a1', text: '☔ 비가 와요' }],
    right: [{ id: 'b1', text: '우산 쓰기' }, { id: 'b2', text: '반팔 입기' }],
    answers: { a1: 'b1' } },
  { id: 'l1-q2', stage: 1, order: 2, type: 'connect', prompt: '날씨와 알맞은 행동을 연결해보세요.', hint: '더운 날엔 무엇을 할까요?',
    left: [{ id: 'a1', text: '☀️ 더워요' }],
    right: [{ id: 'b1', text: '물 자주 마시기' }, { id: 'b2', text: '두꺼운 외투 입기' }],
    answers: { a1: 'b1' } },
  { id: 'l1-q3', stage: 1, order: 3, type: 'connect', prompt: '날씨와 알맞은 행동을 연결해보세요.', hint: '추운 날엔 무엇을 입을까요?',
    left: [{ id: 'a1', text: '❄️ 추워요' }],
    right: [{ id: 'b1', text: '따뜻한 외투 입기' }, { id: 'b2', text: '슬리퍼 신기' }],
    answers: { a1: 'b1' } },
  { id: 'l1-q4', stage: 1, order: 4, type: 'connect', prompt: '날씨와 알맞은 행동을 연결해보세요.', hint: '햇볕이 강할 때는?',
    left: [{ id: 'a1', text: '🌞 햇볕이 강해요' }],
    right: [{ id: 'b1', text: '모자 쓰기' }, { id: 'b2', text: '맨발로 뛰기' }],
    answers: { a1: 'b1' } },
  { id: 'l1-q5', stage: 1, order: 5, type: 'connect', prompt: '날씨와 알맞은 행동을 연결해보세요.', hint: '천둥번개가 칠 때는?',
    left: [{ id: 'a1', text: '⛈️ 천둥번개가 쳐요' }],
    right: [{ id: 'b1', text: '건물 안으로 들어가기' }, { id: 'b2', text: '나무 아래 서 있기' }],
    answers: { a1: 'b1' } },

  // ───────── 2단계 : 날씨 2개 연결 ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'connect', prompt: '날씨에 맞는 행동을 선으로 연결해보세요.', hint: '두 가지 날씨를 연결해요.',
    left: [{ id: 'a1', text: '☔ 비가 와요' }, { id: 'a2', text: '❄️ 눈이 와요' }],
    right: [{ id: 'b1', text: '우산 쓰기' }, { id: 'b2', text: '미끄럼 조심하기' }, { id: 'b3', text: '선크림 바르기' }],
    answers: { a1: 'b1', a2: 'b2' } },
  { id: 'l2-q2', stage: 2, order: 2, type: 'connect', prompt: '날씨에 맞는 행동을 연결해보세요.', hint: '더위와 추위를 구분해요.',
    left: [{ id: 'a1', text: '☀️ 폭염이에요' }, { id: 'a2', text: '❄️ 한파예요' }],
    right: [{ id: 'b1', text: '그늘에서 쉬기' }, { id: 'b2', text: '목도리 하기' }, { id: 'b3', text: '창문 활짝 열기' }],
    answers: { a1: 'b1', a2: 'b2' } },
  { id: 'l2-q3', stage: 2, order: 3, type: 'connect', prompt: '날씨에 맞는 행동을 연결해보세요.', hint: '바람과 안개를 생각해요.',
    left: [{ id: 'a1', text: '🌫️ 안개가 짙어요' }, { id: 'a2', text: '💨 바람이 세요' }],
    right: [{ id: 'b1', text: '천천히 조심히 걷기' }, { id: 'b2', text: '모자 끈 꽉 매기' }, { id: 'b3', text: '우산 거꾸로 들기' }],
    answers: { a1: 'b1', a2: 'b2' } },
  { id: 'l2-q4', stage: 2, order: 4, type: 'connect', prompt: '날씨에 맞는 행동을 연결해보세요.', hint: '비와 더위를 구분해요.',
    left: [{ id: 'a1', text: '🌧️ 장마예요' }, { id: 'a2', text: '🌞 햇볕이 강해요' }],
    right: [{ id: 'b1', text: '장화 신기' }, { id: 'b2', text: '모자 쓰기' }, { id: 'b3', text: '얇은 옷만 입고 비 맞기' }],
    answers: { a1: 'b1', a2: 'b2' } },
  { id: 'l2-q5', stage: 2, order: 5, type: 'connect', prompt: '날씨에 맞는 행동을 연결해보세요.', hint: '눈길과 미세먼지를 생각해요.',
    left: [{ id: 'a1', text: '⛄ 눈이 쌓였어요' }, { id: 'a2', text: '😷 미세먼지가 많아요' }],
    right: [{ id: 'b1', text: '천천히 걷기' }, { id: 'b2', text: '마스크 쓰기' }, { id: 'b3', text: '창문 열고 오래 놀기' }],
    answers: { a1: 'b1', a2: 'b2' } },

  // ───────── 3단계 : 날씨-준비물 연결 ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'connect', prompt: '날씨에 맞는 준비물을 연결해보세요.', hint: '무엇을 챙겨야 할까요?',
    left: [{ id: 'a1', text: '😷 미세먼지' }, { id: 'a2', text: '🌞 강한 햇볕' }, { id: 'a3', text: '❄️ 눈' }],
    right: [{ id: 'b1', text: '마스크' }, { id: 'b2', text: '물병' }, { id: 'b3', text: '장갑' }, { id: 'b4', text: '부채' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l3-q2', stage: 3, order: 2, type: 'connect', prompt: '날씨에 맞는 준비물을 연결해보세요.', hint: '비·추위·더위를 생각해요.',
    left: [{ id: 'a1', text: '☔ 비' }, { id: 'a2', text: '❄️ 추위' }, { id: 'a3', text: '☀️ 더위' }],
    right: [{ id: 'b1', text: '우산' }, { id: 'b2', text: '목도리' }, { id: 'b3', text: '모자' }, { id: 'b4', text: '장화만' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l3-q3', stage: 3, order: 3, type: 'connect', prompt: '날씨에 맞는 준비물을 연결해보세요.', hint: '눈·비·먼지를 생각해요.',
    left: [{ id: 'a1', text: '⛄ 눈' }, { id: 'a2', text: '🌧️ 소나기' }, { id: 'a3', text: '😷 미세먼지' }],
    right: [{ id: 'b1', text: '장갑' }, { id: 'b2', text: '우비' }, { id: 'b3', text: '마스크' }, { id: 'b4', text: '선풍기' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l3-q4', stage: 3, order: 4, type: 'connect', prompt: '날씨에 맞는 준비물을 연결해보세요.', hint: '햇볕·비·추위를 생각해요.',
    left: [{ id: 'a1', text: '🌞 자외선' }, { id: 'a2', text: '☔ 비' }, { id: 'a3', text: '❄️ 한파' }],
    right: [{ id: 'b1', text: '선크림' }, { id: 'b2', text: '우산' }, { id: 'b3', text: '핫팩' }, { id: 'b4', text: '아이스크림' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l3-q5', stage: 3, order: 5, type: 'connect', prompt: '날씨에 맞는 준비물을 연결해보세요.', hint: '더위·눈·먼지를 생각해요.',
    left: [{ id: 'a1', text: '☀️ 폭염' }, { id: 'a2', text: '⛄ 폭설' }, { id: 'a3', text: '😷 황사' }],
    right: [{ id: 'b1', text: '물병' }, { id: 'b2', text: '장화' }, { id: 'b3', text: '마스크' }, { id: 'b4', text: '반바지만' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },

  // ───────── 4단계 : 위험 행동 제외 (안전한 행동에만 연결) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'connect', prompt: '안전한 행동만 골라 날씨와 연결해보세요.', hint: '위험한 행동에는 연결하지 않아요.',
    left: [{ id: 'a1', text: '🌀 태풍이 와요' }, { id: 'a2', text: '☀️ 폭염이에요' }],
    right: [{ id: 'b1', text: '집 안에 있기' }, { id: 'b2', text: '밖에서 뛰어놀기' }, { id: 'b3', text: '물 자주 마시기' }, { id: 'b4', text: '뙤약볕에서 운동하기' }],
    answers: { a1: 'b1', a2: 'b3' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'connect', prompt: '안전한 행동만 연결해보세요.', hint: '위험한 행동은 피해요.',
    left: [{ id: 'a1', text: '⛈️ 번개가 쳐요' }, { id: 'a2', text: '❄️ 눈길이에요' }],
    right: [{ id: 'b1', text: '실내로 들어가기' }, { id: 'b2', text: '나무 밑에 서기' }, { id: 'b3', text: '천천히 걷기' }, { id: 'b4', text: '얼음판에서 뛰기' }],
    answers: { a1: 'b1', a2: 'b3' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'connect', prompt: '안전한 행동만 연결해보세요.', hint: '위험한 행동에는 잇지 않아요.',
    left: [{ id: 'a1', text: '🌊 큰 파도가 쳐요' }, { id: 'a2', text: '😷 미세먼지가 많아요' }],
    right: [{ id: 'b1', text: '물에서 멀리 있기' }, { id: 'b2', text: '깊은 물에 들어가기' }, { id: 'b3', text: '마스크 쓰기' }, { id: 'b4', text: '창문 활짝 열기' }],
    answers: { a1: 'b1', a2: 'b3' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'connect', prompt: '안전한 행동만 연결해보세요.', hint: '위험한 행동은 제외해요.',
    left: [{ id: 'a1', text: '💨 강풍이 불어요' }, { id: 'a2', text: '🌧️ 비가 많이 와요' }],
    right: [{ id: 'b1', text: '간판에서 떨어져 걷기' }, { id: 'b2', text: '우산 들고 뛰기' }, { id: 'b3', text: '물웅덩이 피해 걷기' }, { id: 'b4', text: '하천 가까이 가기' }],
    answers: { a1: 'b1', a2: 'b3' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'connect', prompt: '안전한 행동만 연결해보세요.', hint: '위험한 행동에는 연결하지 않아요.',
    left: [{ id: 'a1', text: '🥵 폭염이에요' }, { id: 'a2', text: '🧊 빙판길이에요' }],
    right: [{ id: 'b1', text: '그늘에서 쉬기' }, { id: 'b2', text: '한낮에 오래 뛰기' }, { id: 'b3', text: '손잡이 잡고 걷기' }, { id: 'b4', text: '뛰어서 미끄러지기' }],
    answers: { a1: 'b1', a2: 'b3' } },

  // ───────── 5단계 : 복합 날씨 연결 ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'connect', prompt: '오늘 날씨에 맞는 준비물을 연결해보세요.',
    scenario: '🌧️💨 비가 오고 바람이 불어요. 미세먼지도 많아요.', hint: '필요한 것끼리 연결해요.',
    left: [{ id: 'a1', text: '비를 막으려면' }, { id: 'a2', text: '발을 지키려면' }, { id: 'a3', text: '먼지를 막으려면' }],
    right: [{ id: 'b1', text: '우산' }, { id: 'b2', text: '장화' }, { id: 'b3', text: '마스크' }, { id: 'b4', text: '선글라스' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l5-q2', stage: 5, order: 2, type: 'connect', prompt: '오늘 날씨에 맞게 연결해보세요.',
    scenario: '☀️🥵 아주 덥고 자외선이 강해요.', hint: '더위와 햇볕을 막아요.',
    left: [{ id: 'a1', text: '더위를 식히려면' }, { id: 'a2', text: '햇볕을 막으려면' }, { id: 'a3', text: '눈을 보호하려면' }],
    right: [{ id: 'b1', text: '물 마시기' }, { id: 'b2', text: '모자' }, { id: 'b3', text: '선글라스' }, { id: 'b4', text: '목도리' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l5-q3', stage: 5, order: 3, type: 'connect', prompt: '오늘 날씨에 맞게 연결해보세요.',
    scenario: '❄️⛄ 눈이 많이 오고 아주 추워요.', hint: '추위와 미끄럼을 대비해요.',
    left: [{ id: 'a1', text: '손을 따뜻하게' }, { id: 'a2', text: '목을 따뜻하게' }, { id: 'a3', text: '미끄럼 방지' }],
    right: [{ id: 'b1', text: '장갑' }, { id: 'b2', text: '목도리' }, { id: 'b3', text: '미끄럼 방지 신발' }, { id: 'b4', text: '슬리퍼' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l5-q4', stage: 5, order: 4, type: 'connect', prompt: '오늘 날씨에 맞게 연결해보세요.',
    scenario: '🌫️😷 안개가 짙고 미세먼지도 심해요.', hint: '호흡과 안전을 지켜요.',
    left: [{ id: 'a1', text: '먼지를 막으려면' }, { id: 'a2', text: '안전하게 걸으려면' }, { id: 'a3', text: '눈에 잘 띄려면' }],
    right: [{ id: 'b1', text: '마스크' }, { id: 'b2', text: '천천히 걷기' }, { id: 'b3', text: '밝은 색 옷' }, { id: 'b4', text: '검은 옷' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
  { id: 'l5-q5', stage: 5, order: 5, type: 'connect', prompt: '오늘 날씨에 맞게 연결해보세요.',
    scenario: '⛈️🌧️ 비가 쏟아지고 천둥번개가 쳐요.', hint: '비를 막고 안전한 곳으로!',
    left: [{ id: 'a1', text: '비를 막으려면' }, { id: 'a2', text: '번개를 피하려면' }, { id: 'a3', text: '발을 지키려면' }],
    right: [{ id: 'b1', text: '우산·우비' }, { id: 'b2', text: '건물 안으로' }, { id: 'b3', text: '장화' }, { id: 'b4', text: '큰 나무 아래' }],
    answers: { a1: 'b1', a2: 'b2', a3: 'b3' } },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
