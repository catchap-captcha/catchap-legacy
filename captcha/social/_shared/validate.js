/** 모든 캡챠의 questions.js 를 로드해 구조 무결성을 점검한다. node _shared/validate.js */
const fs = require('fs');
const path = require('path');
const CAP = path.join(__dirname, '..');
const dirs = fs.readdirSync(CAP).filter((d) => /^\d\d-/.test(d)).sort();
let errors = 0;
const err = (d, m) => { console.log(`  ❌ [${d}] ${m}`); errors++; };

for (const d of dirs) {
  const qp = path.join(CAP, d, 'backend/data/questions.js');
  let mod;
  try { mod = require(qp); } catch (e) { err(d, 'require 실패: ' + e.message); continue; }
  const { QUESTIONS } = mod;
  if (!Array.isArray(QUESTIONS)) { err(d, 'QUESTIONS 배열 아님'); continue; }
  if (QUESTIONS.length !== 25) err(d, `문제 수 ${QUESTIONS.length} (25 아님)`);

  const ids = new Set();
  const perStage = {};
  for (const q of QUESTIONS) {
    if (ids.has(q.id)) err(d, `중복 id ${q.id}`);
    ids.add(q.id);
    perStage[q.stage] = (perStage[q.stage] || 0) + 1;

    if (q.type === 'single') {
      const opt = new Set((q.options || []).map((o) => o.id));
      if (!opt.has(q.answer)) err(d, `${q.id}: answer '${q.answer}' 가 options 에 없음`);
    } else if (q.type === 'order') {
      const cid = new Set((q.cards || []).map((c) => c.id));
      if (!Array.isArray(q.correctSequence)) err(d, `${q.id}: correctSequence 없음`);
      else {
        if (q.correctSequence.length !== q.cards.length) err(d, `${q.id}: 순서 길이 불일치`);
        for (const c of q.correctSequence) if (!cid.has(c)) err(d, `${q.id}: 순서에 없는 카드 ${c}`);
      }
    } else if (q.type === 'connect') {
      const l = new Set((q.left || []).map((x) => x.id));
      const r = new Set((q.right || []).map((x) => x.id));
      const keys = Object.keys(q.answers || {});
      if (keys.length !== q.left.length) err(d, `${q.id}: answers 수 ≠ left 수`);
      for (const k of keys) { if (!l.has(k)) err(d, `${q.id}: answers 왼쪽키 ${k} 없음`); if (!r.has(q.answers[k])) err(d, `${q.id}: answers 오른쪽값 ${q.answers[k]} 없음`); }
    } else if (q.type === 'sort') {
      const b = new Set((q.bins || []).map((x) => x.id));
      const it = new Set((q.items || []).map((x) => x.id));
      const keys = Object.keys(q.answers || {});
      if (keys.length !== q.items.length) err(d, `${q.id}: answers 수 ≠ items 수`);
      for (const k of keys) { if (!it.has(k)) err(d, `${q.id}: answers 아이템 ${k} 없음`); if (!b.has(q.answers[k])) err(d, `${q.id}: answers bin ${q.answers[k]} 없음`); }
    } else if (q.type === 'pick' || q.type === 'touch') {
      const key = q.type === 'pick' ? 'items' : 'elements';
      const it = new Set((q[key] || []).map((x) => x.id));
      if (!Array.isArray(q.answers) || q.answers.length === 0) err(d, `${q.id}: ${q.type} answers 없음`);
      else for (const a of q.answers) if (!it.has(a)) err(d, `${q.id}: ${q.type} answer ${a} 없음`);
    } else if (q.type === 'place') {
      const z = new Set((q.zones || []).map((x) => x.id));
      if (!z.has(q.answer)) err(d, `${q.id}: place answer '${q.answer}' 가 zones 에 없음`);
    } else if (q.type === 'route') {
      if (!q.dest || typeof q.dest.x !== 'number') err(d, `${q.id}: route dest 좌표 없음`);
    } else {
      err(d, `${q.id}: 알 수 없는 type ${q.type}`);
    }
  }
  for (let s = 1; s <= 5; s++) if (perStage[s] !== 5) err(d, `${s}단계 문제 수 ${perStage[s] || 0} (5 아님)`);
  if (![...ids].length) err(d, '문제 없음');
  console.log(`  ${errors ? '' : '✅'} ${d}: ${QUESTIONS.length}문제, 단계별 ${[1,2,3,4,5].map((s)=>perStage[s]||0).join('/')}`);
}
console.log(errors ? `\n❌ 총 ${errors}건 오류` : '\n✅ 전체 통과!');
process.exit(errors ? 1 : 0);
