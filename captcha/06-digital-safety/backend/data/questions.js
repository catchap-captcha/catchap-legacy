/**
 * 디지털 안전 캡챠 — 문제 은행 (5단계 × 5문제 = 총 25문제)
 * ---------------------------------------------------------------
 * 조작: 스마트폰 화면(목업)에서 위험 요소를 '터치'해 선택.
 *   1단계  위험 버튼 터치        위험한 버튼 1개 터치            (touch, 1개)
 *   2단계  개인정보 입력창 찾기   알려주면 안 되는 입력창 터치     (touch, 다중)
 *   3단계  낯선 사람 채팅 판단    채팅에서 위험한 말 터치          (touch, 다중, 채팅UI)
 *   4단계  여러 위험 요소 찾기    화면 속 위험 요소 모두 터치       (touch, 다중)
 *   5단계  안전/위험 화면 비교    가장 위험한 화면 고르기          (single)
 *
 * type: 'touch' → answers = 위험 요소 id 배열 / 'single' → answer = 옵션 id
 * ⚠️ answers / answer 는 프론트로 내려가지 않는다.(sanitizeQuestion)
 */

const QUESTIONS = [
  // ───────── 1단계 : 위험 버튼 터치 (touch, 1개) ─────────
  {
    id: 'l1-q1', stage: 1, order: 1, type: 'touch',
    prompt: '스마트폰 화면에서 위험한 부분을 찾아 눌러보세요.',
    hint: '공짜로 선물을 준다는 말은 조심해요.',
    screenTitle: '🎮 게임 화면',
    elements: [
      { id: 'e1', emoji: '▶️', text: '게임 시작' },
      { id: 'e2', emoji: '🧑', text: '부모님께 물어보기' },
      { id: 'e3', emoji: '🎁', text: '무료 선물 받기' },
      { id: 'e4', emoji: '❌', text: '닫기' },
    ],
    answers: ['e3'],
  },
  {
    id: 'l1-q2', stage: 1, order: 2, type: 'touch',
    prompt: '위험한 버튼을 찾아 눌러보세요.',
    hint: '모르는 곳에 당첨됐다는 말은 가짜예요.',
    screenTitle: '📺 동영상 화면',
    elements: [
      { id: 'e1', emoji: '▶️', text: '영상 계속 보기' },
      { id: 'e2', emoji: '🏆', text: '축하합니다! 상품 받기' },
      { id: 'e3', emoji: '🔉', text: '소리 조절' },
      { id: 'e4', emoji: '❌', text: '닫기' },
    ],
    answers: ['e2'],
  },
  {
    id: 'l1-q3', stage: 1, order: 3, type: 'touch',
    prompt: '누르면 안 되는 위험한 버튼을 찾아보세요.',
    hint: '앱을 몰래 깔게 하는 버튼이에요.',
    screenTitle: '🌐 인터넷 화면',
    elements: [
      { id: 'e1', emoji: '🔍', text: '검색하기' },
      { id: 'e2', emoji: '⬇️', text: '지금 바로 설치하기' },
      { id: 'e3', emoji: '🏠', text: '홈으로' },
      { id: 'e4', emoji: '🔖', text: '즐겨찾기' },
    ],
    answers: ['e2'],
  },
  {
    id: 'l1-q4', stage: 1, order: 4, type: 'touch',
    prompt: '위험한 부분을 눌러보세요.',
    hint: '결제하라는 창을 조심해요.',
    screenTitle: '🕹️ 게임 상점',
    elements: [
      { id: 'e1', emoji: '👀', text: '아이템 구경하기' },
      { id: 'e2', emoji: '💳', text: '부모님 카드번호 입력하기' },
      { id: 'e3', emoji: '🔙', text: '뒤로가기' },
      { id: 'e4', emoji: '⭐', text: '즐겨찾기' },
    ],
    answers: ['e2'],
  },
  {
    id: 'l1-q5', stage: 1, order: 5, type: 'touch',
    prompt: '위험한 버튼을 찾아 눌러보세요.',
    hint: '모르는 링크는 누르지 않아요.',
    screenTitle: '✉️ 메시지',
    elements: [
      { id: 'e1', emoji: '📩', text: '메시지 읽기' },
      { id: 'e2', emoji: '🔗', text: '이 링크를 눌러 확인하세요' },
      { id: 'e3', emoji: '🗑️', text: '삭제' },
      { id: 'e4', emoji: '🧑', text: '부모님께 보여주기' },
    ],
    answers: ['e2'],
  },

  // ───────── 2단계 : 개인정보 입력창 찾기 (touch, 다중) ─────────
  {
    id: 'l2-q1', stage: 2, order: 1, type: 'touch',
    prompt: '알려주면 안 되는 정보를 입력하라는 곳을 모두 찾아보세요.',
    hint: '비밀번호와 집 주소는 비밀이에요.',
    screenTitle: '✏️ 정보 입력',
    elements: [
      { id: 'e1', emoji: '🙂', text: '닉네임 입력' },
      { id: 'e2', emoji: '🔒', text: '비밀번호 입력' },
      { id: 'e3', emoji: '🏠', text: '집 주소 입력' },
      { id: 'e4', emoji: '🐱', text: '캐릭터 이름 입력' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l2-q2', stage: 2, order: 2, type: 'touch',
    prompt: '개인정보를 요구하는 곳을 모두 찾아보세요.',
    hint: '전화번호도 소중한 정보예요.',
    screenTitle: '📝 회원 가입',
    elements: [
      { id: 'e1', emoji: '🎨', text: '좋아하는 색깔' },
      { id: 'e2', emoji: '📞', text: '전화번호 입력' },
      { id: 'e3', emoji: '🏫', text: '학교 이름과 반 입력' },
      { id: 'e4', emoji: '🎮', text: '좋아하는 게임' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l2-q3', stage: 2, order: 3, type: 'touch',
    prompt: '알려주면 위험한 정보를 모두 찾아보세요.',
    hint: '부모님 정보도 함부로 적지 않아요.',
    screenTitle: '🎁 이벤트 참여',
    elements: [
      { id: 'e1', emoji: '🎂', text: '좋아하는 음식' },
      { id: 'e2', emoji: '💳', text: '부모님 카드번호' },
      { id: 'e3', emoji: '🏠', text: '우리집 주소' },
      { id: 'e4', emoji: '🌈', text: '좋아하는 캐릭터' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l2-q4', stage: 2, order: 4, type: 'touch',
    prompt: '비밀로 해야 할 정보를 모두 찾아보세요.',
    hint: '비밀번호는 누구에게도 알려주지 않아요.',
    screenTitle: '🔐 로그인',
    elements: [
      { id: 'e1', emoji: '🆔', text: '아이디(닉네임)' },
      { id: 'e2', emoji: '🔒', text: '비밀번호' },
      { id: 'e3', emoji: '📱', text: '엄마 휴대폰 번호' },
      { id: 'e4', emoji: '🎵', text: '좋아하는 노래' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l2-q5', stage: 2, order: 5, type: 'touch',
    prompt: '입력하면 위험한 곳을 모두 찾아보세요.',
    hint: '얼굴 사진과 주소는 조심해요.',
    screenTitle: '📷 프로필 만들기',
    elements: [
      { id: 'e1', emoji: '🐰', text: '캐릭터 고르기' },
      { id: 'e2', emoji: '🤳', text: '내 얼굴 사진 올리기' },
      { id: 'e3', emoji: '🏠', text: '사는 동네 주소' },
      { id: 'e4', emoji: '🎨', text: '배경색 고르기' },
    ],
    answers: ['e2', 'e3'],
  },

  // ───────── 3단계 : 낯선 사람 채팅 판단 (touch 다중, 채팅UI) ─────────
  {
    id: 'l3-q1', stage: 3, order: 1, type: 'touch', screenStyle: 'chat',
    prompt: '채팅에서 위험한 말을 모두 찾아 눌러보세요.',
    hint: '개인정보를 묻거나 선물로 꾀는 말은 위험해요.',
    screenTitle: '💬 모르는 사람과의 채팅',
    elements: [
      { id: 'e1', emoji: '🙂', text: '안녕!' },
      { id: 'e2', emoji: '❓', text: '몇 살이야?' },
      { id: 'e3', emoji: '🏠', text: '집 주소 알려줘.' },
      { id: 'e4', emoji: '🎁', text: '비밀번호 알려주면 선물 줄게.' },
    ],
    answers: ['e3', 'e4'],
  },
  {
    id: 'l3-q2', stage: 3, order: 2, type: 'touch', screenStyle: 'chat',
    prompt: '위험한 말을 모두 찾아보세요.',
    hint: '몰래 만나자는 말은 위험해요.',
    screenTitle: '💬 채팅',
    elements: [
      { id: 'e1', emoji: '🎮', text: '게임 재밌지?' },
      { id: 'e2', emoji: '🤫', text: '부모님 몰래 만나자.' },
      { id: 'e3', emoji: '📸', text: '네 사진 보내줘.' },
      { id: 'e4', emoji: '👍', text: '다음에 또 같이 하자!' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l3-q3', stage: 3, order: 3, type: 'touch', screenStyle: 'chat',
    prompt: '조심해야 할 메시지를 모두 찾아보세요.',
    hint: '링크를 누르라거나 비밀로 하라는 말은 위험해요.',
    screenTitle: '💬 채팅',
    elements: [
      { id: 'e1', emoji: '😄', text: '오늘 학교 어땠어?' },
      { id: 'e2', emoji: '🔗', text: '이 링크 눌러서 게임 받아.' },
      { id: 'e3', emoji: '🤐', text: '이건 우리 둘만의 비밀이야.' },
      { id: 'e4', emoji: '📚', text: '숙제 많아?' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l3-q4', stage: 3, order: 4, type: 'touch', screenStyle: 'chat',
    prompt: '위험한 요청을 모두 찾아보세요.',
    hint: '돈이나 카드번호를 묻는 말은 위험해요.',
    screenTitle: '💬 채팅',
    elements: [
      { id: 'e1', emoji: '🙂', text: '반가워!' },
      { id: 'e2', emoji: '💳', text: '엄마 카드번호 알려줘.' },
      { id: 'e3', emoji: '📍', text: '지금 어디야? 데리러 갈게.' },
      { id: 'e4', emoji: '🎨', text: '무슨 색 좋아해?' },
    ],
    answers: ['e2', 'e3'],
  },
  {
    id: 'l3-q5', stage: 3, order: 5, type: 'touch', screenStyle: 'chat',
    prompt: '낯선 사람의 위험한 말을 모두 찾아보세요.',
    hint: '개인 영상통화를 몰래 하자는 말은 위험해요.',
    screenTitle: '💬 채팅',
    elements: [
      { id: 'e1', emoji: '👋', text: '안녕, 친구 할래?' },
      { id: 'e2', emoji: '📹', text: '아무한테도 말고 영상통화하자.' },
      { id: 'e3', emoji: '🏠', text: '너희 집 몇 동 몇 호야?' },
      { id: 'e4', emoji: '🎮', text: '무슨 게임 좋아해?' },
    ],
    answers: ['e2', 'e3'],
  },

  // ───────── 4단계 : 여러 위험 요소 찾기 (touch 다중) ─────────
  {
    id: 'l4-q1', stage: 4, order: 1, type: 'touch',
    prompt: '스마트폰 화면에서 위험한 부분을 모두 찾아보세요.',
    hint: '위험한 것이 세 개 있어요.',
    screenTitle: '📱 앱 화면',
    elements: [
      { id: 'e1', emoji: '🔗', text: '모르는 링크' },
      { id: 'e2', emoji: '🔒', text: '비밀번호 입력창' },
      { id: 'e3', emoji: '💬', text: '낯선 사람 채팅' },
      { id: 'e4', emoji: '🐱', text: '귀여운 이모티콘' },
    ],
    answers: ['e1', 'e2', 'e3'],
  },
  {
    id: 'l4-q2', stage: 4, order: 2, type: 'touch',
    prompt: '위험한 부분을 모두 찾아보세요.',
    hint: '광고·주소·결제창을 조심해요.',
    screenTitle: '🌐 웹 화면',
    elements: [
      { id: 'e1', emoji: '🎁', text: '무료 선물 광고' },
      { id: 'e2', emoji: '🏠', text: '집 주소 입력창' },
      { id: 'e3', emoji: '💳', text: '결제하기' },
      { id: 'e4', emoji: '📖', text: '동화 읽기' },
    ],
    answers: ['e1', 'e2', 'e3'],
  },
  {
    id: 'l4-q3', stage: 4, order: 3, type: 'touch',
    prompt: '위험한 요소를 모두 찾아보세요.',
    hint: '설치·전화번호·당첨을 조심해요.',
    screenTitle: '📱 화면',
    elements: [
      { id: 'e1', emoji: '⬇️', text: '수상한 앱 설치' },
      { id: 'e2', emoji: '📞', text: '전화번호 입력창' },
      { id: 'e3', emoji: '🏆', text: '1등 당첨 알림' },
      { id: 'e4', emoji: '🎵', text: '동요 듣기' },
    ],
    answers: ['e1', 'e2', 'e3'],
  },
  {
    id: 'l4-q4', stage: 4, order: 4, type: 'touch',
    prompt: '조심해야 할 부분을 모두 찾아보세요.',
    hint: '사진·비밀번호·낯선 초대를 조심해요.',
    screenTitle: '📱 SNS 화면',
    elements: [
      { id: 'e1', emoji: '🤳', text: '내 얼굴 사진 올리기' },
      { id: 'e2', emoji: '🔒', text: '비밀번호 공유' },
      { id: 'e3', emoji: '✉️', text: '낯선 사람의 친구 초대' },
      { id: 'e4', emoji: '🌤️', text: '오늘의 날씨' },
    ],
    answers: ['e1', 'e2', 'e3'],
  },
  {
    id: 'l4-q5', stage: 4, order: 5, type: 'touch',
    prompt: '위험한 부분을 모두 찾아보세요.',
    hint: '위치·카드·수상한 링크를 조심해요.',
    screenTitle: '📱 화면',
    elements: [
      { id: 'e1', emoji: '📍', text: '내 위치 실시간 공유' },
      { id: 'e2', emoji: '💳', text: '카드번호 입력' },
      { id: 'e3', emoji: '🔗', text: '축하! 링크 클릭' },
      { id: 'e4', emoji: '📚', text: '학습 만화' },
    ],
    answers: ['e1', 'e2', 'e3'],
  },

  // ───────── 5단계 : 안전/위험 화면 비교 (single) ─────────
  {
    id: 'l5-q1', stage: 5, order: 1, type: 'single',
    prompt: '가장 위험한 스마트폰 화면을 골라보세요.',
    hint: '개인정보를 요구하는 화면이 위험해요.',
    options: [
      { id: 'o1', emoji: '🎮', text: '게임 시작 화면' },
      { id: 'o2', emoji: '🔒', text: '비밀번호와 집 주소를 입력하라는 화면' },
      { id: 'o3', emoji: '🧑', text: '부모님께 확인하라는 화면' },
    ],
    answer: 'o2',
  },
  {
    id: 'l5-q2', stage: 5, order: 2, type: 'single',
    prompt: '가장 위험한 화면을 골라보세요.',
    hint: '공짜 선물로 정보를 요구하면 위험해요.',
    options: [
      { id: 'o1', emoji: '📖', text: '동화책 읽기 화면' },
      { id: 'o2', emoji: '🎁', text: '무료 선물 줄테니 주소 적으라는 화면' },
      { id: 'o3', emoji: '🎨', text: '그림 그리기 화면' },
    ],
    answer: 'o2',
  },
  {
    id: 'l5-q3', stage: 5, order: 3, type: 'single',
    prompt: '가장 위험한 화면을 골라보세요.',
    hint: '낯선 사람이 만나자는 화면이 위험해요.',
    options: [
      { id: 'o1', emoji: '💬', text: '낯선 사람이 몰래 만나자는 채팅 화면' },
      { id: 'o2', emoji: '🎵', text: '동요 듣기 화면' },
      { id: 'o3', emoji: '🧮', text: '수학 문제 풀기 화면' },
    ],
    answer: 'o1',
  },
  {
    id: 'l5-q4', stage: 5, order: 4, type: 'single',
    prompt: '가장 위험한 화면을 골라보세요.',
    hint: '결제 정보를 몰래 요구하면 위험해요.',
    options: [
      { id: 'o1', emoji: '📺', text: '학습 영상 화면' },
      { id: 'o2', emoji: '💳', text: '부모님 카드번호를 입력하라는 화면' },
      { id: 'o3', emoji: '🐱', text: '캐릭터 꾸미기 화면' },
    ],
    answer: 'o2',
  },
  {
    id: 'l5-q5', stage: 5, order: 5, type: 'single',
    prompt: '가장 위험한 화면을 골라보세요.',
    hint: '수상한 앱을 설치하라는 화면이 위험해요.',
    options: [
      { id: 'o1', emoji: '🧩', text: '퍼즐 게임 화면' },
      { id: 'o2', emoji: '⬇️', text: '"지금 설치하면 상품!" 이라는 화면' },
      { id: 'o3', emoji: '📖', text: '전자책 화면' },
    ],
    answer: 'o2',
  },
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
