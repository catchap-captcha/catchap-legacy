/**
 * Alphabet Trace — 알파벳 획(stroke) 기하 데이터 + 채점 로직
 * ---------------------------------------------------------------
 * 좌표계: 0~100 정규화 박스 (x: 왼→오, y: 위→아래, 캔버스식).
 * 각 글자는 여러 개의 stroke(획)로 구성되고, 각 stroke 는 폴리라인(점 배열)이다.
 *
 * 이 파일은 백엔드 채점(형태 유사도 계산)과, 프론트 가이드 렌더링에
 * 동일하게 쓰인다. 따라쓰기 가이드는 화면에 어차피 보이는 정보라
 * 클라이언트로 내려줘도 "정답 유출" 문제가 없다.
 */

const D = Math.PI / 180;

/** 원/호를 점 배열로 생성 (y-down 좌표계) */
function arc(cx, cy, rx, ry, startDeg, endDeg, steps = 40) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (startDeg + (endDeg - startDeg) * (i / steps)) * D;
    pts.push([+(cx + rx * Math.cos(t)).toFixed(1), +(cy - ry * Math.sin(t)).toFixed(1)]);
  }
  return pts;
}

// ─── 알파벳 정의 ───  각 항목: { box, strokes:[[ [x,y],... ], ...] }
const LETTERS = {
  // 대문자
  L: { box: 'upper', strokes: [ [[32, 15], [32, 85]], [[32, 85], [72, 85]] ] },
  T: { box: 'upper', strokes: [ [[18, 18], [82, 18]], [[50, 18], [50, 85]] ] },
  I: { box: 'upper', strokes: [ [[30, 18], [70, 18]], [[50, 18], [50, 85]], [[30, 85], [70, 85]] ] },
  O: { box: 'upper', strokes: [ arc(50, 50, 28, 34, 90, 450) ] },
  C: { box: 'upper', strokes: [ arc(52, 50, 28, 34, -55, 235) ] },
  A: { box: 'upper', strokes: [ [[30, 85], [50, 15]], [[50, 15], [70, 85]], [[38, 55], [62, 55]] ] },
  B: { box: 'upper', strokes: [
        [[32, 15], [32, 85]],
        [[32, 15], [58, 18], [65, 32], [58, 48], [32, 50]],
        [[32, 50], [60, 52], [68, 68], [58, 82], [32, 85]],
      ] },
  D: { box: 'upper', strokes: [ [[32, 15], [32, 85]], [[32, 15], [58, 22], [70, 50], [58, 78], [32, 85]] ] },
  E: { box: 'upper', strokes: [ [[32, 15], [32, 85]], [[32, 15], [70, 15]], [[32, 50], [62, 50]], [[32, 85], [70, 85]] ] },
  F: { box: 'upper', strokes: [ [[32, 15], [32, 85]], [[32, 15], [70, 15]], [[32, 50], [62, 50]] ] },
  H: { box: 'upper', strokes: [ [[30, 15], [30, 85]], [[70, 15], [70, 85]], [[30, 50], [70, 50]] ] },
  P: { box: 'upper', strokes: [ [[32, 15], [32, 85]], [[32, 15], [60, 18], [67, 34], [58, 50], [32, 52]] ] },
  Q: { box: 'upper', strokes: [ arc(50, 47, 27, 31, 90, 450), [[58, 62], [80, 88]] ] },

  // 소문자 (헷갈리기 쉬운 b/d/p/q/g)
  b: { box: 'lower', strokes: [ [[34, 12], [34, 85]], [[34, 52], [56, 50], [66, 66], [56, 84], [34, 85]] ] },
  d: { box: 'lower', strokes: [ [[66, 12], [66, 85]], [[66, 52], [44, 50], [34, 66], [44, 84], [66, 85]] ] },
  p: { box: 'lower', strokes: [ [[34, 42], [34, 96]], [[34, 44], [56, 42], [66, 57], [56, 72], [34, 73]] ] },
  q: { box: 'lower', strokes: [ [[66, 42], [66, 96]], [[66, 44], [44, 42], [34, 57], [44, 72], [66, 73]] ] },
  g: { box: 'lower', strokes: [ arc(50, 50, 18, 17, 90, 450), [[66, 36], [66, 82], [52, 94], [36, 90]] ] },
};

/** 폴리라인을 일정 간격으로 리샘플 */
function resample(points, step = 3) {
  if (!points || points.length === 0) return [];
  const out = [points[0]];
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    let [x0, y0] = out[out.length - 1];
    const [x1, y1] = points[i];
    let dx = x1 - x0, dy = y1 - y0;
    let dist = Math.hypot(dx, dy);
    while (acc + dist >= step) {
      const t = (step - acc) / dist;
      x0 = x0 + dx * t; y0 = y0 + dy * t;
      out.push([+x0.toFixed(1), +y0.toFixed(1)]);
      dx = x1 - x0; dy = y1 - y0; dist = Math.hypot(dx, dy); acc = 0;
    }
    acc += dist;
  }
  return out;
}

/** 특정 글자의 특정 stroke 들에서 가이드 점 생성 */
function guidePoints(letter, strokeIdxs) {
  const def = LETTERS[letter];
  if (!def) return [];
  const idxs = strokeIdxs && strokeIdxs.length ? strokeIdxs : def.strokes.map((_, i) => i);
  let pts = [];
  for (const i of idxs) pts = pts.concat(resample(def.strokes[i], 3));
  return pts;
}

function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function nearest(pt, arr) {
  let m = Infinity;
  for (const p of arr) { const d = dist(pt, p); if (d < m) m = d; }
  return m;
}

/**
 * 그리기 채점.
 * @param {string} letter
 * @param {number[]} scoreStrokeIdxs  채점 대상 stroke 인덱스 (4단계는 그려야 할 부분만)
 * @param {number[][]} userPoints     사용자가 그린 점들 (0~100 정규화, [[x,y],...])
 * @param {number[][]} guideStrokeIdxs 시작방향 계산용(선택)
 * @param {object} extra              { strokeCount, pauseCount, drawingTimeMs, retryCount }
 */
function scoreDrawing(letter, scoreStrokeIdxs, userPoints, extra = {}) {
  const guide = guidePoints(letter, scoreStrokeIdxs);
  const user = (userPoints || []).filter((p) => Array.isArray(p) && p.length === 2);

  if (guide.length === 0) return { isPassed: false, completionRate: 0, shapeSimilarityScore: 0, guideDeviation: 100 };

  const R = 15; // 가이드 근처로 인정하는 반경(0~100 기준)

  // 1) completion_rate : 가이드 점 중 사용자가 지나간 비율
  let covered = 0;
  for (const g of guide) if (nearest(g, user) <= R) covered += 1;
  const completionRate = +(covered / guide.length).toFixed(3);

  // 2) guide_deviation : 사용자 점들이 가이드에서 벗어난 평균 거리
  let devSum = 0, off = 0;
  for (const u of user) {
    const d = nearest(u, guide);
    devSum += d;
    if (d > R) off += 1;
  }
  const guideDeviation = user.length ? +(devSum / user.length).toFixed(2) : 100;
  const offPathRatio = user.length ? off / user.length : 1;

  // 3) shape_similarity_score (0~1) : 완성도 × (경로 이탈 패널티)
  const shapeSimilarityScore = +Math.max(0, completionRate * (1 - offPathRatio * 0.6)).toFixed(3);

  // 4) direction_accuracy : 첫 획의 진행 방향이 가이드 방향과 얼마나 맞는지
  let directionAccuracy = null;
  const gStart = guide[0], gNext = guide[Math.min(6, guide.length - 1)];
  if (user.length >= 6 && gStart && gNext) {
    const gv = [gNext[0] - gStart[0], gNext[1] - gStart[1]];
    const uv = [user[5][0] - user[0][0], user[5][1] - user[0][1]];
    const gm = Math.hypot(gv[0], gv[1]) || 1;
    const um = Math.hypot(uv[0], uv[1]) || 1;
    const cos = (gv[0] * uv[0] + gv[1] * uv[1]) / (gm * um);
    directionAccuracy = +((cos + 1) / 2).toFixed(3); // 0~1
  }

  // 5) correct_start_point : 시작점이 가이드 시작 근처인지
  const correctStartPoint = user.length ? nearest(user[0], [gStart]) <= 22 : false;

  // 통과 기준 : 실제 따라쓰기(가이드가 보임)는 완성도가 높게 나오므로 0.6 이상 요구.
  //            엉뚱한 글자/절반만 그림/낙서는 걸러내되, 삐뚤빼뚤은 통과되도록 균형.
  const isPassed = completionRate >= 0.6 && guideDeviation <= 16 && offPathRatio <= 0.4;

  return {
    isPassed,
    completionRate,
    guideDeviation,
    offPathRatio: +offPathRatio.toFixed(3),
    shapeSimilarityScore,
    directionAccuracy,
    correctStartPoint,
    startPosition: user[0] || null,
    endPosition: user[user.length - 1] || null,
    strokeCount: extra.strokeCount ?? null,
  };
}

/** 프론트 렌더링용으로 글자 stroke 좌표를 그대로 제공 */
function getStrokes(letter) {
  return LETTERS[letter] ? LETTERS[letter].strokes : [];
}
function getBox(letter) {
  return LETTERS[letter] ? LETTERS[letter].box : 'upper';
}

module.exports = { LETTERS, getStrokes, getBox, guidePoints, scoreDrawing };
