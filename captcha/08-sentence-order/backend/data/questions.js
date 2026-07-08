/**
 * Sentence Order CAPTCHA — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 섞인 단어 카드를 순서대로 배열해 영어 문장을 완성하는 캡챠. (영어 어순 학습)
 *
 * 단계 흐름:
 *   1단계  3단어 문장 (그림 힌트)     I like apples.
 *   2단계  4단어 문장                She has a cat.
 *   3단계  5단어 문장                The cat is on the...
 *   4단계  방해 단어 포함             필요 없는 단어를 남겨야 함
 *   5단계  그림 없이 한국어 뜻만       뜻을 보고 어순 완성
 *
 * sentence : 정답 문장 (⚠️ 서버 전용). words = sentence.split(' ')
 * cards    : 화면에 뿌릴 섞인 단어 카드 (4단계는 방해 단어 포함)
 * image    : 그림 힌트 / meaning : 한국어 뜻 (5단계)
 */

const Q = (o) => Object.assign({ image: null, meaning: null }, o);

const QUESTIONS = [
  // ── 1단계: 3단어 (그림 힌트) ──
  Q({ id: 'o1-q1', stage: 1, order: 1, sentence: 'I like apples', image: '🍎',
      cards: ['like', 'I', 'apples'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '나는 사과를 좋아해요.' }),
  Q({ id: 'o1-q2', stage: 1, order: 2, sentence: 'I am happy', image: '😊',
      cards: ['am', 'happy', 'I'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '나는 행복해요.' }),
  Q({ id: 'o1-q3', stage: 1, order: 3, sentence: 'Dogs can run', image: '🐶',
      cards: ['run', 'Dogs', 'can'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '강아지는 달릴 수 있어요.' }),
  Q({ id: 'o1-q4', stage: 1, order: 4, sentence: 'Birds can fly', image: '🐦',
      cards: ['can', 'fly', 'Birds'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '새는 날 수 있어요.' }),
  Q({ id: 'o1-q5', stage: 1, order: 5, sentence: 'I like milk', image: '🥛',
      cards: ['milk', 'like', 'I'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '나는 우유를 좋아해요.' }),

  // ── 2단계: 4단어 ──
  Q({ id: 'o2-q1', stage: 2, order: 1, sentence: 'She has a cat', image: '🐱',
      cards: ['a', 'She', 'cat', 'has'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '그녀는 고양이가 있어요.' }),
  Q({ id: 'o2-q2', stage: 2, order: 2, sentence: 'This is my bag', image: '🎒',
      cards: ['my', 'This', 'bag', 'is'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '이것은 내 가방이에요.' }),
  Q({ id: 'o2-q3', stage: 2, order: 3, sentence: 'He is my friend', image: '🧑',
      cards: ['is', 'friend', 'He', 'my'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '그는 내 친구예요.' }),
  Q({ id: 'o2-q4', stage: 2, order: 4, sentence: 'I have two dogs', image: '🐶',
      cards: ['two', 'have', 'dogs', 'I'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '나는 강아지 두 마리가 있어요.' }),
  Q({ id: 'o2-q5', stage: 2, order: 5, sentence: 'The ball is red', image: '🔴',
      cards: ['is', 'The', 'red', 'ball'],
      prompt: '단어를 순서대로 놓아 문장을 만들어보세요.', hint: '공은 빨간색이에요.' }),

  // ── 3단계: 5단어 ──
  Q({ id: 'o3-q1', stage: 3, order: 1, sentence: 'The cat is sleeping now', image: '🐱',
      cards: ['sleeping', 'The', 'now', 'cat', 'is'],
      prompt: '조금 긴 문장도 순서대로 만들어보세요.', hint: '고양이가 지금 자고 있어요.' }),
  Q({ id: 'o3-q2', stage: 3, order: 2, sentence: 'The book is on the desk'.split(' ').slice(0,5).join(' '), image: '📘',
      cards: ['book', 'The', 'on', 'is', 'the'],
      prompt: '조금 긴 문장도 순서대로 만들어보세요.', hint: '책이 위에 있어요. (The book is on the)' }),
  Q({ id: 'o3-q3', stage: 3, order: 3, sentence: 'I go to school today', image: '🏫',
      cards: ['to', 'I', 'today', 'go', 'school'],
      prompt: '조금 긴 문장도 순서대로 만들어보세요.', hint: '나는 오늘 학교에 가요.' }),
  Q({ id: 'o3-q4', stage: 3, order: 4, sentence: 'We play soccer after school', image: '⚽',
      cards: ['after', 'play', 'We', 'school', 'soccer'],
      prompt: '조금 긴 문장도 순서대로 만들어보세요.', hint: '우리는 방과 후에 축구를 해요.' }),
  Q({ id: 'o3-q5', stage: 3, order: 5, sentence: 'She reads a book every day'.split(' ').slice(0,5).join(' '), image: '📖',
      cards: ['reads', 'She', 'book', 'a', 'every'],
      prompt: '조금 긴 문장도 순서대로 만들어보세요.', hint: '그녀는 책을 읽어요. (She reads a book every)' }),

  // ── 4단계: 방해 단어 포함 ──
  Q({ id: 'o4-q1', stage: 4, order: 1, sentence: 'I like apples', image: '🍎', meaning: '나는 사과를 좋아해요.',
      cards: ['like', 'I', 'apples', 'dog'],
      prompt: '필요한 단어만 골라 문장을 만들어보세요.', hint: '필요 없는 단어는 남겨요!' }),
  Q({ id: 'o4-q2', stage: 4, order: 2, sentence: 'She has a cat', image: '🐱', meaning: '그녀는 고양이가 있어요.',
      cards: ['a', 'She', 'cat', 'has', 'run'],
      prompt: '필요한 단어만 골라 문장을 만들어보세요.', hint: '필요 없는 단어는 남겨요!' }),
  Q({ id: 'o4-q3', stage: 4, order: 3, sentence: 'The ball is red', image: '🔴', meaning: '공은 빨간색이에요.',
      cards: ['is', 'The', 'red', 'ball', 'blue'],
      prompt: '필요한 단어만 골라 문장을 만들어보세요.', hint: '필요 없는 단어는 남겨요!' }),
  Q({ id: 'o4-q4', stage: 4, order: 4, sentence: 'I am happy', image: '😊', meaning: '나는 행복해요.',
      cards: ['am', 'happy', 'I', 'sad'],
      prompt: '필요한 단어만 골라 문장을 만들어보세요.', hint: '필요 없는 단어는 남겨요!' }),
  Q({ id: 'o4-q5', stage: 4, order: 5, sentence: 'Birds can fly', image: '🐦', meaning: '새는 날 수 있어요.',
      cards: ['can', 'fly', 'Birds', 'swim'],
      prompt: '필요한 단어만 골라 문장을 만들어보세요.', hint: '필요 없는 단어는 남겨요!' }),

  // ── 5단계: 그림 없이 한국어 뜻만 ──
  Q({ id: 'o5-q1', stage: 5, order: 1, sentence: 'I like apples', meaning: '나는 사과를 좋아해요.',
      cards: ['apples', 'I', 'like'],
      prompt: '뜻을 보고 영어 문장을 만들어보세요.', hint: '그림 없이 도전!' }),
  Q({ id: 'o5-q2', stage: 5, order: 2, sentence: 'He is my friend', meaning: '그는 내 친구예요.',
      cards: ['my', 'He', 'friend', 'is'],
      prompt: '뜻을 보고 영어 문장을 만들어보세요.', hint: '그림 없이 도전!' }),
  Q({ id: 'o5-q3', stage: 5, order: 3, sentence: 'This is my bag', meaning: '이것은 내 가방이에요.',
      cards: ['bag', 'This', 'my', 'is'],
      prompt: '뜻을 보고 영어 문장을 만들어보세요.', hint: '그림 없이 도전!' }),
  Q({ id: 'o5-q4', stage: 5, order: 4, sentence: 'I have two dogs', meaning: '나는 강아지 두 마리가 있어요.',
      cards: ['dogs', 'I', 'two', 'have'],
      prompt: '뜻을 보고 영어 문장을 만들어보세요.', hint: '그림 없이 도전!' }),
  Q({ id: 'o5-q5', stage: 5, order: 5, sentence: 'I go to school today', meaning: '나는 오늘 학교에 가요.',
      cards: ['school', 'I', 'today', 'go', 'to'],
      prompt: '뜻을 보고 영어 문장을 만들어보세요.', hint: '그림 없이 도전!' }),
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

function getQuestionById(id) { return QUESTIONS.find((q) => q.id === id); }

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionById };
