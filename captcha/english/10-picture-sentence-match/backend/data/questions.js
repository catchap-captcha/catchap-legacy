/**
 * Picture Sentence Match CAPTCHA — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 그림을 보고 맞는 영어 문장을 고르거나, 그림↔문장을 연결하는 캡챠. (초등 4학년 수준)
 *
 * 단계 흐름 (난이도 상승):
 *   1단계  그림 1 + 문장 2개 중 선택 (현재진행형)          pick
 *   2단계  그림 1 + 문장 3개 중 선택 (과거형·전치사)        pick
 *   3단계  유사 문장 4개 중 선택 — 주어/시제/위치 혼동      pick
 *   4단계  그림 2개 ↔ 문장 2개 연결 (비교급·과거형)         connect
 *   5단계  그림 3개 ↔ 문장 3개 연결 (긴 문장·복합)          connect
 *
 * type 'pick'    : image + sentences[{id,text}] + answer(정답 id, 서버 전용)
 * type 'connect' : items[{id,image}] + sentences[{id,text}] + answers{itemId:sentenceId} (서버 전용)
 * sentenceType   : 현재진행형/과거형/비교급/전치사/복수 등 (분석용)
 */

const QUESTIONS = [
  // ── 1단계: 문장 2개 중 선택 (현재진행형) ──
  { id: 'v1-q1', stage: 1, order: 1, type: 'pick', sentenceType: '현재진행형', image: '😴🐱',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '고양이가 지금 무엇을 하고 있나요?',
    sentences: [ { id: 'a', text: 'The cat is sleeping on the sofa.' }, { id: 'b', text: 'The cat is running in the park.' } ],
    answer: 'a' },
  { id: 'v1-q2', stage: 1, order: 2, type: 'pick', sentenceType: '현재진행형', image: '🏃🐶',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '강아지가 무엇을 하고 있나요?',
    sentences: [ { id: 'a', text: 'The dog is running fast.' }, { id: 'b', text: 'The dog is eating dinner.' } ],
    answer: 'a' },
  { id: 'v1-q3', stage: 1, order: 3, type: 'pick', sentenceType: '현재진행형', image: '📖👧',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '소녀가 무엇을 하고 있나요?',
    sentences: [ { id: 'a', text: 'The girl is reading a book.' }, { id: 'b', text: 'The girl is drawing a picture.' } ],
    answer: 'a' },
  { id: 'v1-q4', stage: 1, order: 4, type: 'pick', sentenceType: '현재진행형', image: '🏊',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '무엇을 하고 있나요?',
    sentences: [ { id: 'a', text: 'The boy is swimming in the pool.' }, { id: 'b', text: 'The boy is flying a kite.' } ],
    answer: 'a' },
  { id: 'v1-q5', stage: 1, order: 5, type: 'pick', sentenceType: '현재진행형', image: '🎤',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '무엇을 하고 있나요?',
    sentences: [ { id: 'a', text: 'She is singing a song.' }, { id: 'b', text: 'She is washing the dishes.' } ],
    answer: 'a' },

  // ── 2단계: 문장 3개 중 선택 (과거형 · 전치사) ──
  { id: 'v2-q1', stage: 2, order: 1, type: 'pick', sentenceType: '과거형', image: '🌧️☂️',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '어제 있었던 일이에요.',
    sentences: [ { id: 'a', text: 'It rained yesterday.' }, { id: 'b', text: 'It is sunny today.' }, { id: 'c', text: 'It will snow tomorrow.' } ],
    answer: 'a' },
  { id: 'v2-q2', stage: 2, order: 2, type: 'pick', sentenceType: '전치사', image: '📘🪑',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '책이 어디에 있나요?',
    sentences: [ { id: 'a', text: 'The book is on the desk.' }, { id: 'b', text: 'The book is under the chair.' }, { id: 'c', text: 'The book is in the bag.' } ],
    answer: 'a' },
  { id: 'v2-q3', stage: 2, order: 3, type: 'pick', sentenceType: '과거형', image: '🍽️🐶',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '강아지가 한 일이에요.',
    sentences: [ { id: 'a', text: 'The dog ate all the food.' }, { id: 'b', text: 'The dog slept all day.' }, { id: 'c', text: 'The bird flew away.' } ],
    answer: 'a' },
  { id: 'v2-q4', stage: 2, order: 4, type: 'pick', sentenceType: '복수', image: '🐦🐦🐦',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '새가 몇 마리인가요?',
    sentences: [ { id: 'a', text: 'There are three birds in the tree.' }, { id: 'b', text: 'There is one bird in the tree.' }, { id: 'c', text: 'There are two cats on the roof.' } ],
    answer: 'a' },
  { id: 'v2-q5', stage: 2, order: 5, type: 'pick', sentenceType: '비교급', image: '🦒',
    prompt: '그림에 맞는 문장을 골라보세요.', hint: '기린은 어떤가요?',
    sentences: [ { id: 'a', text: 'The giraffe is taller than the tree.' }, { id: 'b', text: 'The giraffe is shorter than the cat.' }, { id: 'c', text: 'The giraffe is smaller than a mouse.' } ],
    answer: 'a' },

  // ── 3단계: 유사 문장 4개 (주어/시제/위치 혼동) ──
  { id: 'v3-q1', stage: 3, order: 1, type: 'pick', sentenceType: '현재진행형', image: '😴🐱',
    prompt: '비슷한 문장을 잘 읽고 골라보세요.', hint: '주어와 동작을 모두 확인!',
    sentences: [ { id: 'a', text: 'The cat is sleeping on the bed.' }, { id: 'b', text: 'The cat is sleeping under the bed.' }, { id: 'c', text: 'The dog is sleeping on the bed.' }, { id: 'd', text: 'The cat is sitting on the bed.' } ],
    answer: 'a' },
  { id: 'v3-q2', stage: 3, order: 2, type: 'pick', sentenceType: '시제', image: '🏫👦',
    prompt: '비슷한 문장을 잘 읽고 골라보세요.', hint: '지금 하는 일이에요 (현재진행형).',
    sentences: [ { id: 'a', text: 'He is going to school now.' }, { id: 'b', text: 'He went to school yesterday.' }, { id: 'c', text: 'He will go to school tomorrow.' }, { id: 'd', text: 'She is going to school now.' } ],
    answer: 'a' },
  { id: 'v3-q3', stage: 3, order: 3, type: 'pick', sentenceType: '전치사', image: '⚽🪑',
    prompt: '비슷한 문장을 잘 읽고 골라보세요.', hint: '공이 정확히 어디에 있나요?',
    sentences: [ { id: 'a', text: 'The ball is under the chair.' }, { id: 'b', text: 'The ball is on the chair.' }, { id: 'c', text: 'The ball is next to the chair.' }, { id: 'd', text: 'The ball is behind the chair.' } ],
    answer: 'a' },
  { id: 'v3-q4', stage: 3, order: 4, type: 'pick', sentenceType: '비교급', image: '🐘🐭',
    prompt: '비슷한 문장을 잘 읽고 골라보세요.', hint: '누가 더 큰가요?',
    sentences: [ { id: 'a', text: 'The elephant is bigger than the mouse.' }, { id: 'b', text: 'The mouse is bigger than the elephant.' }, { id: 'c', text: 'The elephant is smaller than the mouse.' }, { id: 'd', text: 'The mouse is taller than the elephant.' } ],
    answer: 'a' },
  { id: 'v3-q5', stage: 3, order: 5, type: 'pick', sentenceType: '소유·복수', image: '🐶🐶👧',
    prompt: '비슷한 문장을 잘 읽고 골라보세요.', hint: '몇 마리이고 누구의 것인가요?',
    sentences: [ { id: 'a', text: 'She has two dogs.' }, { id: 'b', text: 'She has one dog.' }, { id: 'c', text: 'He has two dogs.' }, { id: 'd', text: 'She has two cats.' } ],
    answer: 'a' },

  // ── 4단계: 그림 2 ↔ 문장 2 연결 (비교급 · 과거형) ──
  { id: 'v4-q1', stage: 4, order: 1, type: 'connect', sentenceType: '현재진행형',
    prompt: '그림과 문장을 알맞게 연결해보세요.', hint: '문장을 끌어 그림 옆에 놓아요.',
    items: [ { id: 'p1', image: '😴🐱' }, { id: 'p2', image: '🏃🐶' } ],
    sentences: [ { id: 's1', text: 'The dog is running in the yard.' }, { id: 's2', text: 'The cat is sleeping on the sofa.' } ],
    answers: { p1: 's2', p2: 's1' } },
  { id: 'v4-q2', stage: 4, order: 2, type: 'connect', sentenceType: '비교급',
    prompt: '그림과 문장을 알맞게 연결해보세요.', hint: '문장을 끌어 그림 옆에 놓아요.',
    items: [ { id: 'p1', image: '🐘' }, { id: 'p2', image: '🐆' } ],
    sentences: [ { id: 's1', text: 'The cheetah runs faster than a dog.' }, { id: 's2', text: 'The elephant is bigger than a car.' } ],
    answers: { p1: 's2', p2: 's1' } },
  { id: 'v4-q3', stage: 4, order: 3, type: 'connect', sentenceType: '과거형',
    prompt: '그림과 문장을 알맞게 연결해보세요.', hint: '문장을 끌어 그림 옆에 놓아요.',
    items: [ { id: 'p1', image: '🌧️' }, { id: 'p2', image: '☀️' } ],
    sentences: [ { id: 's1', text: 'It was sunny last weekend.' }, { id: 's2', text: 'It rained hard yesterday.' } ],
    answers: { p1: 's2', p2: 's1' } },
  { id: 'v4-q4', stage: 4, order: 4, type: 'connect', sentenceType: '전치사',
    prompt: '그림과 문장을 알맞게 연결해보세요.', hint: '문장을 끌어 그림 옆에 놓아요.',
    items: [ { id: 'p1', image: '📘🪑' }, { id: 'p2', image: '🐱📦' } ],
    sentences: [ { id: 's1', text: 'The cat is hiding in the box.' }, { id: 's2', text: 'The book is on the chair.' } ],
    answers: { p1: 's2', p2: 's1' } },
  { id: 'v4-q5', stage: 4, order: 5, type: 'connect', sentenceType: '현재진행형',
    prompt: '그림과 문장을 알맞게 연결해보세요.', hint: '문장을 끌어 그림 옆에 놓아요.',
    items: [ { id: 'p1', image: '🏊' }, { id: 'p2', image: '🎤' } ],
    sentences: [ { id: 's1', text: 'The girl is singing on the stage.' }, { id: 's2', text: 'The boy is swimming in the pool.' } ],
    answers: { p1: 's2', p2: 's1' } },

  // ── 5단계: 그림 3 ↔ 문장 3 연결 (긴 문장 · 복합) ──
  { id: 'v5-q1', stage: 5, order: 1, type: 'connect', sentenceType: '현재진행형',
    prompt: '그림 3개와 문장 3개를 모두 연결해보세요.', hint: '문장을 끝까지 읽고 연결해요.',
    items: [ { id: 'p1', image: '😴🐱' }, { id: 'p2', image: '🏃🐶' }, { id: 'p3', image: '🕊️' } ],
    sentences: [ { id: 's1', text: 'The bird is flying over the trees.' }, { id: 's2', text: 'The cat is sleeping on the warm bed.' }, { id: 's3', text: 'The dog is running after the ball.' } ],
    answers: { p1: 's2', p2: 's3', p3: 's1' } },
  { id: 'v5-q2', stage: 5, order: 2, type: 'connect', sentenceType: '과거형',
    prompt: '그림 3개와 문장 3개를 모두 연결해보세요.', hint: '지난 일(과거형)이에요.',
    items: [ { id: 'p1', image: '🍕' }, { id: 'p2', image: '📺' }, { id: 'p3', image: '📖' } ],
    sentences: [ { id: 's1', text: 'She read a book before bed.' }, { id: 's2', text: 'We ate pizza for lunch.' }, { id: 's3', text: 'They watched TV last night.' } ],
    answers: { p1: 's2', p2: 's3', p3: 's1' } },
  { id: 'v5-q3', stage: 5, order: 3, type: 'connect', sentenceType: '전치사',
    prompt: '그림 3개와 문장 3개를 모두 연결해보세요.', hint: '위치를 나타내는 말을 잘 봐요.',
    items: [ { id: 'p1', image: '📘🔛🪑' }, { id: 'p2', image: '📘⬇️🪑' }, { id: 'p3', image: '📘👜' } ],
    sentences: [ { id: 's1', text: 'The book is inside the bag.' }, { id: 's2', text: 'The book is on top of the desk.' }, { id: 's3', text: 'The book is under the desk.' } ],
    answers: { p1: 's2', p2: 's3', p3: 's1' } },
  { id: 'v5-q4', stage: 5, order: 4, type: 'connect', sentenceType: '비교급',
    prompt: '그림 3개와 문장 3개를 모두 연결해보세요.', hint: '무엇과 비교하는지 확인해요.',
    items: [ { id: 'p1', image: '🐘' }, { id: 'p2', image: '🦒' }, { id: 'p3', image: '🐆' } ],
    sentences: [ { id: 's1', text: 'The cheetah is the fastest of the three.' }, { id: 's2', text: 'The elephant is heavier than the others.' }, { id: 's3', text: 'The giraffe is taller than the elephant.' } ],
    answers: { p1: 's2', p2: 's3', p3: 's1' } },
  { id: 'v5-q5', stage: 5, order: 5, type: 'connect', sentenceType: '복합',
    prompt: '그림 3개와 문장 3개를 모두 연결해보세요.', hint: '주어와 동작을 끝까지 읽어요.',
    items: [ { id: 'p1', image: '🍳👩' }, { id: 'p2', image: '🧹👦' }, { id: 'p3', image: '🌱💧' } ],
    sentences: [ { id: 's1', text: 'The boy is cleaning his room.' }, { id: 's2', text: 'Mom is cooking in the kitchen.' }, { id: 's3', text: 'They are watering the plants.' } ],
    answers: { p1: 's2', p2: 's1', p3: 's3' } },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

function getQuestionById(id) { return QUESTIONS.find((q) => q.id === id); }

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionById };
