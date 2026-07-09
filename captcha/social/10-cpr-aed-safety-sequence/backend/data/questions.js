/**
 * 심폐소생술·자동심장충격기 안전 순서 — 문제 은행 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 *   1단계 금지 행동 찾기    하면 안 되는 행동 고르기            (single·선택형)
 *   2단계 CPR 기본 이론    올바른 설명 고르기                (single·선택형)
 *   3단계 AED 안전 이론    안전 수칙 고르기                  (single·선택형)
 *   4단계 CPR 사진 순서    심폐소생술 사진 5장 순서 배열        (order·사진 드래그)
 *   5단계 CPR+AED 사진 순서 사진 카드 전체 순서 배열           (order·사진 드래그)
 *
 * DB 문제 타입: CPR_AED_SAFETY_SEQUENCE
 * 사진 카드(4~5단계): assets/cpr/cpr-1~5.png, assets/aed/aed-1~4.png (올려주신 안내 이미지)
 *   cpr-1 나의 안전 확보와 반응 확인 / cpr-2 119 신고 및 도움 요청 / cpr-3 환자 호흡 확인
 *   cpr-4 가슴 압박 시작 / cpr-5 인공호흡 시행
 *   aed-1 전원 켜기 / aed-2 가슴에 패드 부착 / aed-3 심전도 자동 분석 / aed-4 안내에 따라 심장충격 시행
 */

const CPR = {
  react:  { text: '반응 확인', img: 'assets/cpr/cpr-1.png' },
  call:   { text: '119 신고', img: 'assets/cpr/cpr-2.png' },
  breath: { text: '호흡 확인', img: 'assets/cpr/cpr-3.png' },
  press:  { text: '가슴 압박', img: 'assets/cpr/cpr-4.png' },
  rescue: { text: '인공호흡', img: 'assets/cpr/cpr-5.png' },
};
const AED = {
  power:   { text: '전원 켜기', img: 'assets/aed/aed-1.png' },
  pad:     { text: '패드 부착', img: 'assets/aed/aed-2.png' },
  analyze: { text: '심전도 분석', img: 'assets/aed/aed-3.png' },
  shock:   { text: '심장충격 시행', img: 'assets/aed/aed-4.png' },
};
function seq(list) {
  const cards = list.map((c, i) => ({ id: 'c' + (i + 1), text: c.text, img: c.img }));
  return { cards, correctSequence: cards.map((c) => c.id) };
}

const QUESTIONS = [
  // ───────── 1단계 : 하면 안 되는 행동 고르기 (single) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'single', optionLayout: 'grid',
    prompt: '쓰러진 사람을 발견했을 때 하면 안 되는 행동을 골라보세요.', hint: '환자를 위험하게 하는 행동을 찾아요.',
    options: [ { id: 'o1', text: '현장이 안전한지 확인한다' }, { id: 'o2', text: '어깨를 가볍게 두드리며 반응을 확인한다' }, { id: 'o3', text: '환자를 세게 흔들어 깨운다' }, { id: 'o4', text: '119에 신고를 요청한다' } ], answer: 'o3' },
  { id: 'l1-q2', stage: 1, order: 2, type: 'single', optionLayout: 'grid',
    prompt: '심폐소생술 중 하면 안 되는 행동을 골라보세요.', hint: '집중하지 않는 행동을 찾아요.',
    options: [ { id: 'o1', text: '가슴 압박을 규칙적으로 한다' }, { id: 'o2', text: '압박 후 가슴이 다시 올라오게 한다' }, { id: 'o3', text: '가슴 압박 중 계속 장난을 친다' }, { id: 'o4', text: '119 구급대가 올 때까지 계속 돕는다' } ], answer: 'o3' },
  { id: 'l1-q3', stage: 1, order: 3, type: 'single', optionLayout: 'grid',
    prompt: '자동심장충격기 사용 중 하면 안 되는 행동을 골라보세요.', hint: '분석 중에는 환자를 만지면 안 돼요.',
    options: [ { id: 'o1', text: '기계의 음성 안내를 듣는다' }, { id: 'o2', text: '패드를 안내 그림에 맞게 붙인다' }, { id: 'o3', text: '심전도 분석 중 환자를 만진다' }, { id: 'o4', text: '충격 전 주변 사람에게 물러나라고 말한다' } ], answer: 'o3' },
  { id: 'l1-q4', stage: 1, order: 4, type: 'single', optionLayout: 'grid',
    prompt: '반응을 확인할 때 하면 안 되는 행동을 골라보세요.', hint: '환자를 다치게 할 수 있는 행동을 찾아요.',
    options: [ { id: 'o1', text: '양쪽 어깨를 가볍게 두드린다' }, { id: 'o2', text: '"괜찮으세요?" 하고 물어본다' }, { id: 'o3', text: '몸을 심하게 흔들거나 뺨을 때린다' }, { id: 'o4', text: '반응이 없으면 곧바로 119에 신고한다' } ], answer: 'o3' },
  { id: 'l1-q5', stage: 1, order: 5, type: 'single', optionLayout: 'grid',
    prompt: '도움을 요청할 때 하면 안 되는 행동을 골라보세요.', hint: '혼자 해결하려는 것은 위험해요.',
    options: [ { id: 'o1', text: '주변 사람을 지목해 119 신고를 부탁한다' }, { id: 'o2', text: '가까운 사람에게 자동심장충격기를 가져오라고 한다' }, { id: 'o3', text: '아무에게도 알리지 않고 혼자 해결하려 한다' }, { id: 'o4', text: '큰 소리로 도움을 요청한다' } ], answer: 'o3' },

  // ───────── 2단계 : 심폐소생술 기본 이론 (single) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'single', optionLayout: 'grid',
    prompt: '쓰러진 사람이 반응이 없을 때 가장 먼저 해야 할 일을 골라보세요.', hint: '도움부터 요청해요.',
    options: [ { id: 'o1', text: '환자를 두고 혼자 그냥 집으로 간다' }, { id: 'o2', text: '119에 신고하고 주변에 도움을 요청한다' }, { id: 'o3', text: '환자를 혼자 둔 채로 가만히 기다린다' }, { id: 'o4', text: '돕지 않고 장난으로 사진만 찍는다' } ], answer: 'o2' },
  { id: 'l2-q2', stage: 2, order: 2, type: 'single', optionLayout: 'grid',
    prompt: '환자의 호흡을 확인하는 방법으로 알맞은 것을 골라보세요.', hint: '가슴이 오르내리는지 봐요.',
    options: [ { id: 'o1', text: '얼굴과 가슴이 오르내리는지 관찰한다' }, { id: 'o2', text: '환자의 발바닥을 간지럽혀 본다' }, { id: 'o3', text: '입고 있는 옷의 색깔을 살펴본다' }, { id: 'o4', text: '머리카락을 만져 길이를 확인한다' } ], answer: 'o1' },
  { id: 'l2-q3', stage: 2, order: 3, type: 'single', optionLayout: 'grid',
    prompt: '가슴 압박에 대한 설명으로 알맞은 것을 골라보세요.', hint: '성인은 분당 100~120회예요.',
    options: [ { id: 'o1', text: '아주 느린 속도로 한 번씩만 눌러 준다' }, { id: 'o2', text: '성인 기준 분당 100~120회 속도로 압박한다' }, { id: 'o3', text: '환자를 의자에 앉힌 상태로 압박한다' }, { id: 'o4', text: '가슴이 다시 올라오지 못하게 계속 누른다' } ], answer: 'o2' },
  { id: 'l2-q4', stage: 2, order: 4, type: 'single', optionLayout: 'grid',
    prompt: '가슴 압박의 위치와 깊이로 알맞은 것을 골라보세요.', hint: '가슴 중앙을 약 5cm 깊이로 눌러요.',
    options: [ { id: 'o1', text: '가슴 중앙을 약 5cm 깊이로 압박한다' }, { id: 'o2', text: '배 한가운데를 두 손으로 힘껏 누른다' }, { id: 'o3', text: '가슴을 손끝으로 살짝 톡톡 두드린다' }, { id: 'o4', text: '목 한가운데를 아래로 지그시 누른다' } ], answer: 'o1' },
  { id: 'l2-q5', stage: 2, order: 5, type: 'single', optionLayout: 'grid',
    prompt: '성인 심폐소생술에서 가슴 압박과 인공호흡의 비율로 알맞은 것을 골라보세요.', hint: '압박 30번에 인공호흡 2번이에요.',
    options: [ { id: 'o1', text: '30 : 2' }, { id: 'o2', text: '5 : 5' }, { id: 'o3', text: '10 : 1' }, { id: 'o4', text: '100 : 100' } ], answer: 'o1' },

  // ───────── 3단계 : 자동심장충격기 안전 이론 (single) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'single', optionLayout: 'grid',
    prompt: '심전도 분석을 할 때 알맞은 행동을 골라보세요.', hint: '분석 중에는 환자에게서 떨어져요.',
    options: [ { id: 'o1', text: '분석 중에도 환자를 계속 만지고 있는다' }, { id: 'o2', text: '환자에게서 떨어져 접촉하지 않는다' }, { id: 'o3', text: '가슴에 붙인 패드를 서둘러 떼어낸다' }, { id: 'o4', text: '분석을 멈추려고 기계 전원을 끈다' } ], answer: 'o2' },
  { id: 'l3-q2', stage: 3, order: 2, type: 'single', optionLayout: 'grid',
    prompt: '패드를 붙이기 전에 해야 할 일로 알맞은 것을 골라보세요.', hint: '붙는 부위를 깨끗이 해요.',
    options: [ { id: 'o1', text: '가슴의 땀이나 이물질을 깨끗이 닦는다' }, { id: 'o2', text: '환자의 손을 계속 붙잡고 기다린다' }, { id: 'o3', text: '옷을 벗기지 않고 옷 위에 붙인다' }, { id: 'o4', text: '전원을 끈 채로 가만히 기다린다' } ], answer: 'o1' },
  { id: 'l3-q3', stage: 3, order: 3, type: 'single', optionLayout: 'grid',
    prompt: '심장충격 버튼을 누르기 전에 해야 할 말로 알맞은 것을 골라보세요.', hint: '모두 물러나게 해요.',
    options: [ { id: 'o1', text: '모두 환자에게서 떨어지라고 외친다' }, { id: 'o2', text: '주변 사람에게 환자를 만지라고 한다' }, { id: 'o3', text: '아무 말 없이 곧바로 버튼을 누른다' }, { id: 'o4', text: '충격기를 보이지 않게 숨기라고 한다' } ], answer: 'o1' },
  { id: 'l3-q4', stage: 3, order: 4, type: 'single', optionLayout: 'grid',
    prompt: '자동심장충격기 전원을 켠 뒤에 할 일로 알맞은 것을 골라보세요.', hint: '기계가 시키는 대로 해요.',
    options: [ { id: 'o1', text: '기계의 음성 안내에 따라 행동한다' }, { id: 'o2', text: '안내를 무시하고 마음대로 누른다' }, { id: 'o3', text: '붙여 둔 패드를 떼어내 버린다' }, { id: 'o4', text: '켜 둔 전원을 다시 꺼 버린다' } ], answer: 'o1' },
  { id: 'l3-q5', stage: 3, order: 5, type: 'single', optionLayout: 'grid',
    prompt: '자동심장충격기를 사용해야 하는 경우로 알맞은 것을 골라보세요.', hint: '반응과 호흡이 없는 환자에게 써요.',
    options: [ { id: 'o1', text: '반응과 호흡이 없는 환자에게 바로 사용한다' }, { id: 'o2', text: '의식이 또렷하고 멀쩡한 사람에게 사용한다' }, { id: 'o3', text: '물에 젖은 바닥에서 아무렇게나 사용한다' }, { id: 'o4', text: '장난감처럼 아무 때나 가지고 논다' } ], answer: 'o1' },

  // ───────── 4단계 : 심폐소생술 사진 5장 순서 (order·사진) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'order',
    prompt: '심폐소생술 시행 방법 사진을 순서대로 선택하세요.', hint: '나의 안전 확보와 반응 확인부터예요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press, CPR.rescue]) },
  { id: 'l4-q2', stage: 4, order: 2, type: 'order',
    prompt: '심폐소생술 순서를 사진으로 맞춰보세요.', hint: '반응→신고→호흡→압박→인공호흡이에요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press, CPR.rescue]) },
  { id: 'l4-q3', stage: 4, order: 3, type: 'order',
    prompt: '인공호흡을 빼고, 앞 4단계 사진을 순서대로 선택하세요.', hint: '반응→신고→호흡→압박이에요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press]) },
  { id: 'l4-q4', stage: 4, order: 4, type: 'order',
    prompt: '호흡 확인 없이, 나머지 4단계 사진을 순서대로 선택하세요.', hint: '반응→신고→압박→인공호흡이에요.',
    ...seq([CPR.react, CPR.call, CPR.press, CPR.rescue]) },
  { id: 'l4-q5', stage: 4, order: 5, type: 'order',
    prompt: '심폐소생술 시행 방법 사진을 순서대로 선택하세요.', hint: '가장 먼저 현장의 안전과 반응을 확인해요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press, CPR.rescue]) },

  // ───────── 5단계 : CPR + AED 사진 전체 순서 (order·사진) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'order',
    prompt: '심폐소생술과 자동심장충격기 사진을 전체 순서대로 선택하세요.', hint: '심폐소생술 5단계 뒤에 AED 4단계예요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press, CPR.rescue, AED.power, AED.pad, AED.analyze, AED.shock]) },
  { id: 'l5-q2', stage: 5, order: 2, type: 'order',
    prompt: '응급처치 전체 순서를 사진으로 맞춰보세요.', hint: '반응 확인부터 심장충격까지 이어져요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press, CPR.rescue, AED.power, AED.pad, AED.analyze, AED.shock]) },
  { id: 'l5-q3', stage: 5, order: 3, type: 'order',
    prompt: '심폐소생술 뒤 자동심장충격기 사용까지, 필요한 사진만 순서대로 선택하세요.', hint: '반응→신고→압박→전원→패드→분석→충격이에요.',
    ...seq([CPR.react, CPR.call, CPR.press, AED.power, AED.pad, AED.analyze, AED.shock]) },
  { id: 'l5-q4', stage: 5, order: 4, type: 'order',
    prompt: '가슴 압박부터 자동심장충격기 사용까지 사진을 순서대로 선택하세요.', hint: '압박→전원→패드→분석→충격이에요.',
    ...seq([CPR.press, AED.power, AED.pad, AED.analyze, AED.shock]) },
  { id: 'l5-q5', stage: 5, order: 5, type: 'order',
    prompt: '심폐소생술과 자동심장충격기 사진을 전체 순서대로 선택하세요.', hint: '119 신고 뒤에 압박, 그다음 AED예요.',
    ...seq([CPR.react, CPR.call, CPR.breath, CPR.press, CPR.rescue, AED.power, AED.pad, AED.analyze, AED.shock]) },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
