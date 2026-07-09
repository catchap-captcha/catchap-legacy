/**
 * 디지털 시민성 문제 해결 — 문제 은행 (5단계 × 5문제 = 25문제) · 4학년 심화 · 드래그 중심 · 이모지 없음
 * ---------------------------------------------------------------
 *   1단계 온라인 문제 상황  하면 안 되는 온라인 행동 모두 담기   (pick·드래그)
 *   2단계 개인정보 보호    공개하면 안 되는 정보 모두 담기       (pick·드래그)
 *   3단계 사이버 예절 분류  좋은 댓글 / 나쁜 댓글 분류          (sort·드래그)
 *   4단계 가짜뉴스 구분    믿을 수 있는 / 의심스러운 정보 분류    (sort·드래그)
 *   5단계 대처 순서 배열   사이버폭력·온라인 문제 대처 순서       (order·드래그)
 *
 *  DB 문제 타입: DIGITAL_CITIZENSHIP_SOLVE
 */

const QUESTIONS = [
  // ───────── 1단계 : 온라인 문제 상황 찾기 (pick) ─────────
  { id: 'l1-q1', stage: 1, order: 1, type: 'pick', target: '하면 안 되는 행동 담기', boxHint: '온라인에서 하면 안 되는 행동만 이 상자로 끌어와요',
    prompt: '온라인에서 하면 안 되는 행동을 모두 골라 담아보세요.', hint: '남에게 피해를 주는 행동을 찾아요.',
    items: [ { id: 'i1', text: '응원하는 댓글 달기' }, { id: 'i2', text: '친구 사진을 몰래 올리기' }, { id: 'i3', text: '친구를 놀리는 댓글 쓰기' }, { id: 'i4', text: '예의 바르게 질문하기' }, { id: 'i5', text: '거짓 소문을 퍼뜨리기' } ],
    answers: ['i2', 'i3', 'i5'] },
  { id: 'l1-q2', stage: 1, order: 2, type: 'pick', target: '하면 안 되는 행동 담기', boxHint: '하면 안 되는 행동만 끌어와요',
    prompt: '온라인에서 하면 안 되는 행동을 모두 골라 담아보세요.', hint: '규칙과 예의를 어기는 행동을 찾아요.',
    items: [ { id: 'i1', text: '다른 사람 글을 함부로 베끼기' }, { id: 'i2', text: '출처를 밝히고 인용하기' }, { id: 'i3', text: '채팅방에서 욕하기' }, { id: 'i4', text: '게임에서 규칙 지키기' }, { id: 'i5', text: '친구 험담 글 올리기' } ],
    answers: ['i1', 'i3', 'i5'] },
  { id: 'l1-q3', stage: 1, order: 3, type: 'pick', target: '하면 안 되는 행동 담기', boxHint: '위험한 행동만 끌어와요',
    prompt: '온라인에서 하면 위험한 행동을 모두 골라 담아보세요.', hint: '안전을 해치는 행동을 찾아요.',
    items: [ { id: 'i1', text: '모르는 사람과 만나기로 약속하기' }, { id: 'i2', text: '이상한 링크를 함부로 누르기' }, { id: 'i3', text: '앱은 부모님께 알리고 설치하기' }, { id: 'i4', text: '밤늦게까지 몰래 게임하기' }, { id: 'i5', text: '정해진 시간만 사용하기' } ],
    answers: ['i1', 'i2', 'i4'] },
  { id: 'l1-q4', stage: 1, order: 4, type: 'pick', target: '하면 안 되는 행동 담기', boxHint: '하면 안 되는 행동만 끌어와요',
    prompt: '온라인에서 하면 안 되는 행동을 모두 골라 담아보세요.', hint: '남의 것을 함부로 다루는 행동을 찾아요.',
    items: [ { id: 'i1', text: '친구 계정에 몰래 로그인하기' }, { id: 'i2', text: '내 비밀번호를 잘 지키기' }, { id: 'i3', text: '남을 흉내 낸 가짜 계정 만들기' }, { id: 'i4', text: '좋은 정보를 함께 나누기' }, { id: 'i5', text: '허락 없이 대화를 캡처해 퍼뜨리기' } ],
    answers: ['i1', 'i3', 'i5'] },
  { id: 'l1-q5', stage: 1, order: 5, type: 'pick', target: '하면 안 되는 행동 담기', boxHint: '하면 안 되는 행동만 끌어와요',
    prompt: '온라인에서 하면 안 되는 행동을 모두 골라 담아보세요.', hint: '누군가를 아프게 하는 행동을 찾아요.',
    items: [ { id: 'i1', text: '상처 주는 말 남기기' }, { id: 'i2', text: '실수한 친구를 감싸주기' }, { id: 'i3', text: '여러 명이 한 명을 따돌리는 글 쓰기' }, { id: 'i4', text: '도움을 요청한 친구 돕기' }, { id: 'i5', text: '확인 안 된 글을 마구 퍼 나르기' } ],
    answers: ['i1', 'i3', 'i5'] },

  // ───────── 2단계 : 개인정보 보호 (pick) ─────────
  { id: 'l2-q1', stage: 2, order: 1, type: 'pick', target: '공개하면 안 되는 정보 담기', boxHint: '올리면 안 되는 개인정보만 끌어와요',
    prompt: '인터넷에 올리면 안 되는 개인정보를 모두 골라 담아보세요.', hint: '나를 찾거나 계정을 뺏길 수 있는 정보예요.',
    items: [ { id: 'i1', text: '집 주소' }, { id: 'i2', text: '전화번호' }, { id: 'i3', text: '비밀번호' }, { id: 'i4', text: '좋아하는 음식' }, { id: 'i5', text: '좋아하는 색깔' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q2', stage: 2, order: 2, type: 'pick', target: '공개하면 안 되는 정보 담기', boxHint: '올리면 안 되는 개인정보만 끌어와요',
    prompt: '인터넷에 올리면 안 되는 개인정보를 모두 골라 담아보세요.', hint: '나와 가족을 알아낼 수 있는 정보예요.',
    items: [ { id: 'i1', text: '주민등록번호' }, { id: 'i2', text: '다니는 학교 이름' }, { id: 'i3', text: '부모님 직장' }, { id: 'i4', text: '내 취미' }, { id: 'i5', text: '좋아하는 계절' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q3', stage: 2, order: 3, type: 'pick', target: '공개하면 안 되는 정보 담기', boxHint: '올리면 안 되는 개인정보만 끌어와요',
    prompt: '인터넷에 올리면 안 되는 개인정보를 모두 골라 담아보세요.', hint: '내가 어디 있는지 알려지면 위험해요.',
    items: [ { id: 'i1', text: '내 얼굴 사진' }, { id: 'i2', text: '지금 있는 위치' }, { id: 'i3', text: '집 현관 비밀번호' }, { id: 'i4', text: '좋아하는 과목' }, { id: 'i5', text: '좋아하는 가수' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q4', stage: 2, order: 4, type: 'pick', target: '공개하면 안 되는 정보 담기', boxHint: '올리면 안 되는 개인정보만 끌어와요',
    prompt: '인터넷에 올리면 안 되는 개인정보를 모두 골라 담아보세요.', hint: '돈이나 계정과 관련된 정보예요.',
    items: [ { id: 'i1', text: '계정 비밀번호' }, { id: 'i2', text: '결제 카드 번호' }, { id: 'i3', text: '생년월일' }, { id: 'i4', text: '좋아하는 게임' }, { id: 'i5', text: '좋아하는 운동' } ],
    answers: ['i1', 'i2', 'i3'] },
  { id: 'l2-q5', stage: 2, order: 5, type: 'pick', target: '공개하면 안 되는 정보 담기', boxHint: '올리면 안 되는 개인정보만 끌어와요',
    prompt: '인터넷에 올리면 안 되는 개인정보를 모두 골라 담아보세요.', hint: '내 위치와 가족을 알 수 있는 정보예요.',
    items: [ { id: 'i1', text: '다니는 학원 위치' }, { id: 'i2', text: '가족 얼굴 사진' }, { id: 'i3', text: '전화번호' }, { id: 'i4', text: '좋아하는 책' }, { id: 'i5', text: '장래희망' } ],
    answers: ['i1', 'i2', 'i3'] },

  // ───────── 3단계 : 사이버 예절 분류 (sort) ─────────
  { id: 'l3-q1', stage: 3, order: 1, type: 'sort',
    prompt: '댓글을 좋은 댓글과 나쁜 댓글로 끌어다 분류하세요.', hint: '상대방의 마음을 생각해요.',
    bins: [ { id: 'good', label: '좋은 댓글' }, { id: 'bad', label: '나쁜 댓글' } ],
    items: [ { id: 'i1', text: '잘했어! 다음에도 힘내.' }, { id: 'i2', text: '너 진짜 못한다.' }, { id: 'i3', text: '생각이 다를 수 있어.' }, { id: 'i4', text: '너랑은 같이 안 놀 거야.' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },
  { id: 'l3-q2', stage: 3, order: 2, type: 'sort',
    prompt: '댓글을 좋은 댓글과 나쁜 댓글로 끌어다 분류하세요.', hint: '힘이 되는 말인지 아프게 하는 말인지 생각해요.',
    bins: [ { id: 'good', label: '좋은 댓글' }, { id: 'bad', label: '나쁜 댓글' } ],
    items: [ { id: 'i1', text: '좋은 의견이야.' }, { id: 'i2', text: '이런 것도 몰라?' }, { id: 'i3', text: '함께 해보자.' }, { id: 'i4', text: '다 너 때문이야.' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },
  { id: 'l3-q3', stage: 3, order: 3, type: 'sort',
    prompt: '댓글을 좋은 댓글과 나쁜 댓글로 끌어다 분류하세요.', hint: '고운 말과 거친 말을 나눠요.',
    bins: [ { id: 'good', label: '좋은 댓글' }, { id: 'bad', label: '나쁜 댓글' } ],
    items: [ { id: 'i1', text: '고마워, 도움이 됐어.' }, { id: 'i2', text: '바보 같다.' }, { id: 'i3', text: '괜찮아, 실수할 수 있어.' }, { id: 'i4', text: '저리 꺼져.' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },
  { id: 'l3-q4', stage: 3, order: 4, type: 'sort',
    prompt: '댓글을 좋은 댓글과 나쁜 댓글로 끌어다 분류하세요.', hint: '응원인지 따돌림인지 생각해요.',
    bins: [ { id: 'good', label: '좋은 댓글' }, { id: 'bad', label: '나쁜 댓글' } ],
    items: [ { id: 'i1', text: '멋진 그림이다!' }, { id: 'i2', text: '재미없어, 그만해.' }, { id: 'i3', text: '내가 응원할게.' }, { id: 'i4', text: '다들 쟤 무시하자.' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },
  { id: 'l3-q5', stage: 3, order: 5, type: 'sort',
    prompt: '댓글을 좋은 댓글과 나쁜 댓글로 끌어다 분류하세요.', hint: '배려하는 말과 상처 주는 말을 나눠요.',
    bins: [ { id: 'good', label: '좋은 댓글' }, { id: 'bad', label: '나쁜 댓글' } ],
    items: [ { id: 'i1', text: '네 말도 맞아.' }, { id: 'i2', text: '거짓말쟁이.' }, { id: 'i3', text: '천천히 해도 돼.' }, { id: 'i4', text: '너만 없으면 돼.' } ],
    answers: { i1: 'good', i2: 'bad', i3: 'good', i4: 'bad' } },

  // ───────── 4단계 : 가짜뉴스 구분 (sort) ─────────
  { id: 'l4-q1', stage: 4, order: 1, type: 'sort',
    prompt: '정보를 믿을 수 있는 것과 의심스러운 것으로 끌어다 분류하세요.', hint: '출처와 글쓴이를 확인해요.',
    bins: [ { id: 'trust', label: '믿을 수 있는 정보' }, { id: 'doubt', label: '의심스러운 정보' } ],
    items: [ { id: 'i1', text: '출처가 있는 어린이 뉴스 기사' }, { id: 'i2', text: '"안 보내면 큰일 난대!"라는 메시지' }, { id: 'i3', text: '학교 홈페이지 공지' }, { id: 'i4', text: '누가 썼는지 알 수 없는 글' } ],
    answers: { i1: 'trust', i2: 'doubt', i3: 'trust', i4: 'doubt' } },
  { id: 'l4-q2', stage: 4, order: 2, type: 'sort',
    prompt: '정보를 믿을 수 있는 것과 의심스러운 것으로 끌어다 분류하세요.', hint: '여러 곳에서 확인되는지 생각해요.',
    bins: [ { id: 'trust', label: '믿을 수 있는 정보' }, { id: 'doubt', label: '의심스러운 정보' } ],
    items: [ { id: 'i1', text: '정부·공공기관의 발표' }, { id: 'i2', text: '확인되지 않은 소문' }, { id: 'i3', text: '여러 곳에서 똑같이 확인되는 사실' }, { id: 'i4', text: '너무 자극적인 제목의 글' } ],
    answers: { i1: 'trust', i2: 'doubt', i3: 'trust', i4: 'doubt' } },
  { id: 'l4-q3', stage: 4, order: 3, type: 'sort',
    prompt: '정보를 믿을 수 있는 것과 의심스러운 것으로 끌어다 분류하세요.', hint: '누가 언제 썼는지 알 수 있나요?',
    bins: [ { id: 'trust', label: '믿을 수 있는 정보' }, { id: 'doubt', label: '의심스러운 정보' } ],
    items: [ { id: 'i1', text: '기자 이름과 날짜가 있는 기사' }, { id: 'i2', text: '친구가 퍼 나른 출처 없는 글' }, { id: 'i3', text: '선생님이 알려준 자료' }, { id: 'i4', text: '돈을 준다며 정보를 요구하는 글' } ],
    answers: { i1: 'trust', i2: 'doubt', i3: 'trust', i4: 'doubt' } },
  { id: 'l4-q4', stage: 4, order: 4, type: 'sort',
    prompt: '정보를 믿을 수 있는 것과 의심스러운 것으로 끌어다 분류하세요.', hint: '공식적인 곳인지 광고인지 생각해요.',
    bins: [ { id: 'trust', label: '믿을 수 있는 정보' }, { id: 'doubt', label: '의심스러운 정보' } ],
    items: [ { id: 'i1', text: '공식 누리집 안내' }, { id: 'i2', text: '"무조건 1등!" 광고 글' }, { id: 'i3', text: '도서관에서 찾은 책 내용' }, { id: 'i4', text: '이유 없이 겁을 주는 메시지' } ],
    answers: { i1: 'trust', i2: 'doubt', i3: 'trust', i4: 'doubt' } },
  { id: 'l4-q5', stage: 4, order: 5, type: 'sort',
    prompt: '정보를 믿을 수 있는 것과 의심스러운 것으로 끌어다 분류하세요.', hint: '확인하지 않고 퍼뜨리라는 글은 조심해요.',
    bins: [ { id: 'trust', label: '믿을 수 있는 정보' }, { id: 'doubt', label: '의심스러운 정보' } ],
    items: [ { id: 'i1', text: '여러 뉴스에서 함께 다룬 소식' }, { id: 'i2', text: '익명으로 올라온 주장' }, { id: 'i3', text: '전문가가 설명한 자료' }, { id: 'i4', text: '확인 없이 빨리 퍼뜨리라는 글' } ],
    answers: { i1: 'trust', i2: 'doubt', i3: 'trust', i4: 'doubt' } },

  // ───────── 5단계 : 대처 순서 배열 (order) ─────────
  { id: 'l5-q1', stage: 5, order: 1, type: 'order',
    prompt: '단체 채팅방에서 나쁜 말을 들었을 때, 올바른 대처 순서대로 선택하세요.',
    hint: '증거를 남기고 어른에게 알려요.',
    cards: [ { id: 'c1', text: '대화 내용을 저장한다' }, { id: 'c2', text: '대꾸하지 않고 채팅방을 나온다' }, { id: 'c3', text: '믿을 수 있는 어른에게 알린다' }, { id: 'c4', text: '필요하면 신고한다' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'] },
  { id: 'l5-q2', stage: 5, order: 2, type: 'order',
    prompt: '모르는 사람이 개인정보를 물어볼 때, 올바른 대처 순서대로 선택하세요.',
    hint: '알려주지 않고 어른에게 알려요.',
    cards: [ { id: 'c1', text: '요구를 들어주지 않는다' }, { id: 'c2', text: '대화를 저장한다' }, { id: 'c3', text: '부모님·선생님께 알린다' }, { id: 'c4', text: '신고한다' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'] },
  { id: 'l5-q3', stage: 5, order: 3, type: 'order',
    prompt: '내 사진이 허락 없이 올라간 것을 봤을 때, 올바른 대처 순서대로 선택하세요.',
    hint: '증거를 남기고 내려 달라고 해요.',
    cards: [ { id: 'c1', text: '게시물을 저장해 둔다' }, { id: 'c2', text: '올린 사람에게 내려 달라고 한다' }, { id: 'c3', text: '어른에게 알린다' }, { id: 'c4', text: '신고하고 삭제를 요청한다' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'] },
  { id: 'l5-q4', stage: 5, order: 4, type: 'order',
    prompt: '악성 댓글을 받았을 때, 올바른 대처 순서대로 선택하세요.',
    hint: '감정적으로 답하지 않아요.',
    cards: [ { id: 'c1', text: '감정적으로 답하지 않는다' }, { id: 'c2', text: '댓글을 저장한다' }, { id: 'c3', text: '어른에게 알린다' }, { id: 'c4', text: '신고한다' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'] },
  { id: 'l5-q5', stage: 5, order: 5, type: 'order',
    prompt: '온라인에서 만난 사람이 만나자고 할 때, 올바른 대처 순서대로 선택하세요.',
    hint: '절대 혼자 나가지 않아요.',
    cards: [ { id: 'c1', text: '절대 만나러 나가지 않는다' }, { id: 'c2', text: '대화를 저장한다' }, { id: 'c3', text: '부모님께 바로 알린다' }, { id: 'c4', text: '경찰(신고)에 알린다' } ],
    correctSequence: ['c1', 'c2', 'c3', 'c4'] },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
