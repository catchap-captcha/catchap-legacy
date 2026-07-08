/**
 * Alphabet Trace CAPTCHA — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 어린이 교육용 알파벳 "따라쓰기/쓰기" 캡챠.
 *
 * 단계 흐름:
 *   1단계  점선 따라쓰기        점선 알파벳 위를 따라 그림
 *   2단계  흐린 글자 따라쓰기    흐린 회색 글자 위를 따라 그림
 *   3단계  시작점·방향 따라쓰기  시작점/화살표를 보고 획 순서대로 그림
 *   4단계  일부만 보고 완성      일부 획만 보여주고 나머지 완성
 *   5단계  보고 직접 쓰기        위 예시를 보고 빈 칸에 직접 그림
 *
 * guideStyle : 캔버스에 가이드를 어떻게 그릴지
 *   'dotted' | 'faint' | 'arrow' | 'partial' | 'blank'
 * guideStrokes : 화면에 가이드로 보여줄 stroke 인덱스 (null = 전체)
 * scoreStrokes : 채점 대상 stroke 인덱스 (null = 전체). 4단계는 "그려야 할" 획만.
 * showExample  : 5단계처럼 상단에 예시 글자를 크게 보여줄지
 *
 * 추천 난이도 순서:  쉬움 L,T,I,O,C / 보통 A,B,D,E,F / 어려움 H,P / 헷갈림 b,d,p,q,g
 * (획/좌표 정의와 채점은 letters.js 참고)
 */

const q = (o) => Object.assign({ guideStrokes: null, scoreStrokes: null, showExample: false }, o);

const QUESTIONS = [
  // ── 1단계: 점선 따라쓰기 (쉬운 글자) ──
  q({ id: 't1-q1', stage: 1, order: 1, letter: 'L', guideStyle: 'dotted',
      prompt: '점선을 따라 알파벳을 그려보세요.', hint: '점선 위를 그대로 따라가요.' }),
  q({ id: 't1-q2', stage: 1, order: 2, letter: 'T', guideStyle: 'dotted',
      prompt: '점선을 따라 알파벳을 그려보세요.', hint: '점선 위를 그대로 따라가요.' }),
  q({ id: 't1-q3', stage: 1, order: 3, letter: 'I', guideStyle: 'dotted',
      prompt: '점선을 따라 알파벳을 그려보세요.', hint: '점선 위를 그대로 따라가요.' }),
  q({ id: 't1-q4', stage: 1, order: 4, letter: 'O', guideStyle: 'dotted',
      prompt: '점선을 따라 알파벳을 그려보세요.', hint: '동그라미를 따라 그려요.' }),
  q({ id: 't1-q5', stage: 1, order: 5, letter: 'C', guideStyle: 'dotted',
      prompt: '점선을 따라 알파벳을 그려보세요.', hint: '점선 위를 그대로 따라가요.' }),

  // ── 2단계: 흐린 글자 따라쓰기 ──
  q({ id: 't2-q1', stage: 2, order: 1, letter: 'A', guideStyle: 'faint',
      prompt: '흐린 글자를 따라 알파벳을 완성해보세요.', hint: '흐린 글씨 위에 진하게 그려요.' }),
  q({ id: 't2-q2', stage: 2, order: 2, letter: 'B', guideStyle: 'faint',
      prompt: '흐린 글자를 따라 알파벳을 완성해보세요.', hint: '흐린 글씨 위에 진하게 그려요.' }),
  q({ id: 't2-q3', stage: 2, order: 3, letter: 'D', guideStyle: 'faint',
      prompt: '흐린 글자를 따라 알파벳을 완성해보세요.', hint: '흐린 글씨 위에 진하게 그려요.' }),
  q({ id: 't2-q4', stage: 2, order: 4, letter: 'E', guideStyle: 'faint',
      prompt: '흐린 글자를 따라 알파벳을 완성해보세요.', hint: '흐린 글씨 위에 진하게 그려요.' }),
  q({ id: 't2-q5', stage: 2, order: 5, letter: 'F', guideStyle: 'faint',
      prompt: '흐린 글자를 따라 알파벳을 완성해보세요.', hint: '흐린 글씨 위에 진하게 그려요.' }),

  // ── 3단계: 시작점·방향 따라쓰기 (화살표) ──
  q({ id: 't3-q1', stage: 3, order: 1, letter: 'L', guideStyle: 'arrow',
      prompt: '시작점에서 출발해서 화살표 방향대로 그려보세요.', hint: '● 시작점에서 화살표 방향으로!' }),
  q({ id: 't3-q2', stage: 3, order: 2, letter: 'T', guideStyle: 'arrow',
      prompt: '시작점에서 출발해서 화살표 방향대로 그려보세요.', hint: '● 시작점에서 화살표 방향으로!' }),
  q({ id: 't3-q3', stage: 3, order: 3, letter: 'C', guideStyle: 'arrow',
      prompt: '시작점에서 출발해서 화살표 방향대로 그려보세요.', hint: '● 시작점에서 화살표 방향으로!' }),
  q({ id: 't3-q4', stage: 3, order: 4, letter: 'E', guideStyle: 'arrow',
      prompt: '시작점에서 출발해서 화살표 방향대로 그려보세요.', hint: '● 시작점에서 화살표 방향으로!' }),
  q({ id: 't3-q5', stage: 3, order: 5, letter: 'H', guideStyle: 'arrow',
      prompt: '시작점에서 출발해서 화살표 방향대로 그려보세요.', hint: '● 시작점에서 화살표 방향으로!' }),

  // ── 4단계: 일부만 보고 완성 (가이드는 일부 획, 채점은 나머지 획) ──
  q({ id: 't4-q1', stage: 4, order: 1, letter: 'D', guideStyle: 'partial',
      guideStrokes: [0], scoreStrokes: [1],
      prompt: '빠진 부분을 그려 알파벳을 완성해보세요.', hint: '세로선만 있어요. 둥근 부분을 그려요.' }),
  q({ id: 't4-q2', stage: 4, order: 2, letter: 'B', guideStyle: 'partial',
      guideStrokes: [0], scoreStrokes: [1, 2],
      prompt: '빠진 부분을 그려 알파벳을 완성해보세요.', hint: '세로선만 있어요. 두 개의 배를 그려요.' }),
  q({ id: 't4-q3', stage: 4, order: 3, letter: 'P', guideStyle: 'partial',
      guideStrokes: [0], scoreStrokes: [1],
      prompt: '빠진 부분을 그려 알파벳을 완성해보세요.', hint: '세로선만 있어요. 위 둥근 부분을 그려요.' }),
  q({ id: 't4-q4', stage: 4, order: 4, letter: 'E', guideStyle: 'partial',
      guideStrokes: [0, 1], scoreStrokes: [2, 3],
      prompt: '빠진 부분을 그려 알파벳을 완성해보세요.', hint: '가운데와 아래 가로선을 그려요.' }),
  q({ id: 't4-q5', stage: 4, order: 5, letter: 'A', guideStyle: 'partial',
      guideStrokes: [0, 1], scoreStrokes: [2],
      prompt: '빠진 부분을 그려 알파벳을 완성해보세요.', hint: '가운데 가로선을 그려요.' }),

  // ── 5단계: 보고 직접 쓰기 (빈 캔버스 + 상단 예시, 헷갈리는 글자) ──
  q({ id: 't5-q1', stage: 5, order: 1, letter: 'A', guideStyle: 'blank', showExample: true,
      prompt: '위의 알파벳을 보고 빈칸에 직접 써보세요.', hint: '가이드 없이 직접 그려요!' }),
  q({ id: 't5-q2', stage: 5, order: 2, letter: 'b', guideStyle: 'blank', showExample: true,
      prompt: '위의 알파벳을 보고 빈칸에 직접 써보세요.', hint: '소문자 b! 막대는 왼쪽, 배는 오른쪽 아래.' }),
  q({ id: 't5-q3', stage: 5, order: 3, letter: 'd', guideStyle: 'blank', showExample: true,
      prompt: '위의 알파벳을 보고 빈칸에 직접 써보세요.', hint: '소문자 d! 막대는 오른쪽, 배는 왼쪽 아래.' }),
  q({ id: 't5-q4', stage: 5, order: 4, letter: 'p', guideStyle: 'blank', showExample: true,
      prompt: '위의 알파벳을 보고 빈칸에 직접 써보세요.', hint: '소문자 p! 막대가 아래로 내려가요.' }),
  q({ id: 't5-q5', stage: 5, order: 5, letter: 'q', guideStyle: 'blank', showExample: true,
      prompt: '위의 알파벳을 보고 빈칸에 직접 써보세요.', hint: '소문자 q! 막대가 오른쪽 아래로 내려가요.' }),
];

/** 단계별 통과 기준 (맞아야 하는 최소 문제 수) */
const STAGE_PASS_THRESHOLD = 4;
/** 전체 통과 기준 (25문제 중 최소 정답 수) */
const TOTAL_PASS_THRESHOLD = 18; // 그리기 난이도가 높아 다소 완화

function getQuestionById(id) {
  return QUESTIONS.find((x) => x.id === id);
}

module.exports = {
  QUESTIONS,
  STAGE_PASS_THRESHOLD,
  TOTAL_PASS_THRESHOLD,
  getQuestionById,
};
