/**
 * Grammar Choice CAPTCHA — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 문장 빈칸에 맞는 문법 요소를 골라 넣는 캡챠. (초등 4학년 수준 문법)
 *
 * 단계 흐름 (문법 주제별, 난이도 상승):
 *   1단계  be동사 과거형        was / were
 *   2단계  일반동사 과거형       played / went / ate (규칙 + 불규칙)
 *   3단계  현재진행형           be + ~ing
 *   4단계  비교급 · 조동사       bigger / faster / can
 *   5단계  전치사 · 의문사       on/under, When/Where/Who (가장 어려움)
 *
 * sentence : '___' 가 빈칸인 문장 (화면 표시용)
 * answer   : 정답 (⚠️ 서버 전용 — 클라이언트로 안 내려감)
 * options  : 보기 (드래그해서 빈칸에 넣기)
 * grammarType : 문법 유형 태그 (분석용)
 */

const Q = (o) => Object.assign({ image: null }, o);

const QUESTIONS = [
  // ── 1단계: be동사 과거형 (was / were) ──
  Q({ id: 'g1-q1', stage: 1, order: 1, grammarType: 'be동사 과거형', image: '😊',
      sentence: 'Yesterday I ___ happy.', options: ['was', 'were', 'am'], answer: 'was',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '어제 있었던 일이에요 (과거).' }),
  Q({ id: 'g1-q2', stage: 1, order: 2, grammarType: 'be동사 과거형', image: '🏫',
      sentence: 'They ___ at school yesterday.', options: ['were', 'was', 'are'], answer: 'were',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'They(여럿) 다음엔?' }),
  Q({ id: 'g1-q3', stage: 1, order: 3, grammarType: 'be동사 과거형', image: '🤒',
      sentence: 'She ___ sick last night.', options: ['was', 'were', 'is'], answer: 'was',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '지난밤 = 과거!' }),
  Q({ id: 'g1-q4', stage: 1, order: 4, grammarType: 'be동사 과거형', image: '🏞️',
      sentence: 'We ___ in the park an hour ago.', options: ['were', 'was', 'are'], answer: 'were',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'We 다음엔? (한 시간 전 = 과거)' }),
  Q({ id: 'g1-q5', stage: 1, order: 5, grammarType: 'be동사 과거형', image: '🎬',
      sentence: 'The movie ___ fun yesterday.', options: ['was', 'were', 'is'], answer: 'was',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '하나(영화) + 과거!' }),

  // ── 2단계: 일반동사 과거형 (규칙 + 불규칙) ──
  Q({ id: 'g2-q1', stage: 2, order: 1, grammarType: '동사 과거형', image: '⚽',
      sentence: 'I ___ soccer yesterday.', options: ['played', 'play', 'plays'], answer: 'played',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '어제 한 일 (과거형 -ed).' }),
  Q({ id: 'g2-q2', stage: 2, order: 2, grammarType: '동사 과거형', image: '🚌',
      sentence: 'She ___ to school yesterday.', options: ['went', 'go', 'goes'], answer: 'went',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'go의 과거형은?' }),
  Q({ id: 'g2-q3', stage: 2, order: 3, grammarType: '동사 과거형', image: '🍕',
      sentence: 'We ___ pizza last night.', options: ['ate', 'eat', 'eats'], answer: 'ate',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'eat의 과거형은?' }),
  Q({ id: 'g2-q4', stage: 2, order: 4, grammarType: '동사 과거형', image: '✉️',
      sentence: 'He ___ a letter yesterday.', options: ['wrote', 'write', 'writes'], answer: 'wrote',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'write의 과거형은?' }),
  Q({ id: 'g2-q5', stage: 2, order: 5, grammarType: '동사 과거형', image: '📺',
      sentence: 'They ___ TV last night.', options: ['watched', 'watch', 'watches'], answer: 'watched',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '규칙 과거형 -ed!' }),

  // ── 3단계: 현재진행형 (be + ~ing) ──
  Q({ id: 'g3-q1', stage: 3, order: 1, grammarType: '현재진행형', image: '👶',
      sentence: 'Look! The baby ___ crying.', options: ['is', 'are', 'am'], answer: 'is',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '지금 하고 있어요. (하나)' }),
  Q({ id: 'g3-q2', stage: 3, order: 2, grammarType: '현재진행형', image: '🧒',
      sentence: 'The children ___ playing outside.', options: ['are', 'is', 'am'], answer: 'are',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'children은 여럿!' }),
  Q({ id: 'g3-q3', stage: 3, order: 3, grammarType: '현재진행형', image: '📖',
      sentence: 'I ___ reading a book now.', options: ['am', 'is', 'are'], answer: 'am',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'I 다음엔?' }),
  Q({ id: 'g3-q4', stage: 3, order: 4, grammarType: '현재진행형', image: '🎤',
      sentence: 'She is ___ a song now.', options: ['singing', 'sing', 'sang'], answer: 'singing',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'be동사 다음엔 ~ing!' }),
  Q({ id: 'g3-q5', stage: 3, order: 5, grammarType: '현재진행형', image: '⚽',
      sentence: 'We are ___ soccer now.', options: ['playing', 'play', 'played'], answer: 'playing',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: 'be동사 다음엔 ~ing!' }),

  // ── 4단계: 비교급 · 조동사 ──
  Q({ id: 'g4-q1', stage: 4, order: 1, grammarType: '비교급', image: '🐘',
      sentence: 'An elephant is ___ than a cat.', options: ['bigger', 'big', 'biggest'], answer: 'bigger',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '둘을 비교해요 (-er than).' }),
  Q({ id: 'g4-q2', stage: 4, order: 2, grammarType: '비교급', image: '🐆',
      sentence: 'A cheetah is ___ than a dog.', options: ['faster', 'fast', 'fastest'], answer: 'faster',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '더 빠른! (-er than)' }),
  Q({ id: 'g4-q3', stage: 4, order: 3, grammarType: '비교급', image: '📦',
      sentence: 'This box is ___ than that one.', options: ['heavier', 'heavy', 'heaviest'], answer: 'heavier',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '무게를 비교해요 (-ier than).' }),
  Q({ id: 'g4-q4', stage: 4, order: 4, grammarType: '조동사', image: '🐦',
      sentence: 'Birds ___ fly high.', options: ['can', 'cans', 'do'], answer: 'can',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '~할 수 있다!' }),
  Q({ id: 'g4-q5', stage: 4, order: 5, grammarType: '비교급', image: '📏',
      sentence: 'He is ___ than his brother.', options: ['taller', 'tall', 'tallest'], answer: 'taller',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '키를 비교해요 (-er than).' }),

  // ── 5단계: 전치사 · 의문사 (가장 어려움) ──
  Q({ id: 'g5-q1', stage: 5, order: 1, grammarType: '전치사', image: '🐱',
      sentence: 'The cat is ___ the box.', options: ['on', 'in', 'under'], answer: 'on',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '고양이가 상자 위에 있어요.' }),
  Q({ id: 'g5-q2', stage: 5, order: 2, grammarType: '의문사', image: '🎂',
      sentence: '___ is your birthday?', options: ['When', 'What', 'Who'], answer: 'When',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '"언제"인지 물어봐요.' }),
  Q({ id: 'g5-q3', stage: 5, order: 3, grammarType: '의문사', image: '🚶',
      sentence: '___ are you going?', options: ['Where', 'What', 'When'], answer: 'Where',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '"어디로" 가는지 물어봐요.' }),
  Q({ id: 'g5-q4', stage: 5, order: 4, grammarType: '전치사', image: '⚽',
      sentence: 'The ball is ___ the table.', options: ['under', 'on', 'next'], answer: 'under',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '공이 탁자 아래에 있어요.' }),
  Q({ id: 'g5-q5', stage: 5, order: 5, grammarType: '의문사', image: '👧',
      sentence: '___ is that girl?', options: ['Who', 'What', 'Where'], answer: 'Who',
      prompt: '빈칸에 들어갈 알맞은 말을 골라보세요.', hint: '"누구"인지 물어봐요.' }),
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

function getQuestionById(id) { return QUESTIONS.find((q) => q.id === id); }

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionById };
