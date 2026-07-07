/**
 * 역사 영역 캡챠 — 문제 은행 (5단계 × 9문제 = 총 45문제)
 * ---------------------------------------------------------------
 * 4학년 사회 [4사06]. 우리 지역의 문화유산. 유형: single
 * 이모지·힌트 없음. 매 세션마다 /start 가 단계별 9개 중 5개를 무작위로 뽑아
 * 25문제(난이도 오름차순)를 만든다. 중복 문제 없음.
 * answers/answer 는 프론트로 내려가지 않는다.(sanitizeQuestion)
 */
const QUESTIONS = [
  {"id":"l1-q1","stage":1,"order":1,"type":"single","prompt":"신라 사람들이 하늘의 별을 보려고 세운 문화유산은?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"경복궁"}],"answer":"o1"},
  {"id":"l1-q2","stage":1,"order":2,"type":"single","prompt":"임금이 살며 나라를 다스리던 서울의 큰 궁궐은?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"경복궁"}],"answer":"o2"},
  {"id":"l1-q3","stage":1,"order":3,"type":"single","prompt":"세종대왕이 백성을 위해 만든 우리 글자는?","options":[{"id":"o1","text":"훈민정음"},{"id":"o2","text":"숫자"}],"answer":"o1"},
  {"id":"l1-q4","stage":1,"order":4,"type":"single","prompt":"옛 물건과 유물을 모아 전시하는 곳은?","options":[{"id":"o1","text":"시장"},{"id":"o2","text":"박물관"}],"answer":"o2"},
  {"id":"l1-q5","stage":1,"order":5,"type":"single","prompt":"고려 사람들이 만든 푸른빛 그릇은?","options":[{"id":"o1","text":"고려청자"},{"id":"o2","text":"유리컵"}],"answer":"o1"},
  {"id":"l1-q6","stage":1,"order":6,"type":"single","prompt":"경주에 있는, 돌로 만든 불상이 있는 절은?","options":[{"id":"o1","text":"학교"},{"id":"o2","text":"석굴암"}],"answer":"o2"},
  {"id":"l1-q7","stage":1,"order":7,"type":"single","prompt":"부처의 가르침을 나무판에 새긴 고려의 문화유산은?","options":[{"id":"o1","text":"팔만대장경"},{"id":"o2","text":"지도"}],"answer":"o1"},
  {"id":"l1-q8","stage":1,"order":8,"type":"single","prompt":"노래로 이야기를 들려주는 우리 전통 공연은?","options":[{"id":"o1","text":"영화"},{"id":"o2","text":"판소리"}],"answer":"o2"},
  {"id":"l1-q9","stage":1,"order":9,"type":"single","prompt":"옛날 사람들이 진흙을 구워 만든 그릇을 무엇이라 할까?","options":[{"id":"o1","text":"도자기"},{"id":"o2","text":"플라스틱"}],"answer":"o1"},
  {"id":"l2-q1","stage":2,"order":1,"type":"single","prompt":"판소리·탈춤처럼 형태가 없는 문화유산을 무엇이라 할까?","options":[{"id":"o1","text":"무형 문화유산"},{"id":"o2","text":"유형 문화유산"},{"id":"o3","text":"자연 문화유산"}],"answer":"o1"},
  {"id":"l2-q2","stage":2,"order":2,"type":"single","prompt":"첨성대·석굴암처럼 눈에 보이는 문화유산을 무엇이라 할까?","options":[{"id":"o1","text":"무형 문화유산"},{"id":"o2","text":"유형 문화유산"},{"id":"o3","text":"기록 문화유산"}],"answer":"o2"},
  {"id":"l2-q3","stage":2,"order":3,"type":"single","prompt":"나라의 중요한 일을 날마다 기록한 조선의 책은?","options":[{"id":"o1","text":"고려청자"},{"id":"o2","text":"훈민정음"},{"id":"o3","text":"조선왕조실록"}],"answer":"o3"},
  {"id":"l2-q4","stage":2,"order":4,"type":"single","prompt":"경주에 있으며 부처를 돌로 조각해 만든 문화유산은?","options":[{"id":"o1","text":"석굴암"},{"id":"o2","text":"첨성대"},{"id":"o3","text":"경복궁"}],"answer":"o1"},
  {"id":"l2-q5","stage":2,"order":5,"type":"single","prompt":"정약용이 만든 기구로 무거운 돌을 들어 지은 성은?","options":[{"id":"o1","text":"남한산성"},{"id":"o2","text":"수원 화성"},{"id":"o3","text":"불국사"}],"answer":"o2"},
  {"id":"l2-q6","stage":2,"order":6,"type":"single","prompt":"김정호가 만든 우리나라 전국 지도는?","options":[{"id":"o1","text":"팔만대장경"},{"id":"o2","text":"삼국사기"},{"id":"o3","text":"대동여지도"}],"answer":"o3"},
  {"id":"l2-q7","stage":2,"order":7,"type":"single","prompt":"명절에 여럿이 손잡고 도는 우리 전통 놀이는?","options":[{"id":"o1","text":"강강술래"},{"id":"o2","text":"축구"},{"id":"o3","text":"카드놀이"}],"answer":"o1"},
  {"id":"l2-q8","stage":2,"order":8,"type":"single","prompt":"얼굴에 탈을 쓰고 하는 우리 전통 공연은?","options":[{"id":"o1","text":"발레"},{"id":"o2","text":"탈춤"},{"id":"o3","text":"마술"}],"answer":"o2"},
  {"id":"l2-q9","stage":2,"order":9,"type":"single","prompt":"겨울을 나려고 김치를 많이 담그는 우리 문화는?","options":[{"id":"o1","text":"소풍"},{"id":"o2","text":"캠핑"},{"id":"o3","text":"김장"}],"answer":"o3"},
  {"id":"l3-q1","stage":3,"order":1,"type":"single","prompt":"옛 물건·유물을 모아 전시하며 지역 역사를 알려 주는 곳은?","options":[{"id":"o1","text":"박물관"},{"id":"o2","text":"놀이공원"},{"id":"o3","text":"시장"}],"answer":"o1"},
  {"id":"l3-q2","stage":3,"order":2,"type":"single","prompt":"옛날 사건이 있었거나 옛 건물이 남아 있는 장소는?","options":[{"id":"o1","text":"백화점"},{"id":"o2","text":"유적지"},{"id":"o3","text":"병원"}],"answer":"o2"},
  {"id":"l3-q3","stage":3,"order":3,"type":"single","prompt":"훌륭한 인물이나 사건을 기리려고 세운 곳은?","options":[{"id":"o1","text":"은행"},{"id":"o2","text":"편의점"},{"id":"o3","text":"기념관"}],"answer":"o3"},
  {"id":"l3-q4","stage":3,"order":4,"type":"single","prompt":"석굴암·불국사·첨성대가 모여 있는 신라의 옛 수도는?","options":[{"id":"o1","text":"경주"},{"id":"o2","text":"서울"},{"id":"o3","text":"부산"}],"answer":"o1"},
  {"id":"l3-q5","stage":3,"order":5,"type":"single","prompt":"사람에서 사람으로 전해지는 판소리·탈춤 같은 문화유산은?","options":[{"id":"o1","text":"유형 문화유산"},{"id":"o2","text":"무형 문화유산"},{"id":"o3","text":"자연환경"}],"answer":"o2"},
  {"id":"l3-q6","stage":3,"order":6,"type":"single","prompt":"문화유산을 조사할 때 직접 찾아가 살펴보는 방법은?","options":[{"id":"o1","text":"상상하기"},{"id":"o2","text":"낮잠 자기"},{"id":"o3","text":"답사"}],"answer":"o3"},
  {"id":"l3-q7","stage":3,"order":7,"type":"single","prompt":"문화유산을 아끼고 지켜야 하는 까닭으로 알맞은 것은?","options":[{"id":"o1","text":"조상의 지혜와 역사가 담겨 있어서"},{"id":"o2","text":"비싸서"},{"id":"o3","text":"새것이라서"}],"answer":"o1"},
  {"id":"l3-q8","stage":3,"order":8,"type":"single","prompt":"불국사 안에 있는, 단순하고 균형 잡힌 탑은?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"석가탑"},{"id":"o3","text":"경복궁"}],"answer":"o2"},
  {"id":"l3-q9","stage":3,"order":9,"type":"single","prompt":"우리 지역의 문화유산을 널리 알리는 행사로 알맞은 것은?","options":[{"id":"o1","text":"운동회"},{"id":"o2","text":"받아쓰기 시험"},{"id":"o3","text":"문화유산 축제"}],"answer":"o3"},
  {"id":"l4-q1","stage":4,"order":1,"type":"single","prompt":"불국사와 함께 경주에 있는, 굴 속 돌 불상 문화유산은?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"수원 화성"},{"id":"o3","text":"경복궁"},{"id":"o4","text":"석굴암"}],"answer":"o4"},
  {"id":"l4-q2","stage":4,"order":2,"type":"single","prompt":"세종대왕이 백성이 쉽게 읽고 쓰도록 만든 우리 글자는?","options":[{"id":"o1","text":"훈민정음"},{"id":"o2","text":"팔만대장경"},{"id":"o3","text":"대동여지도"},{"id":"o4","text":"조선왕조실록"}],"answer":"o1"},
  {"id":"l4-q3","stage":4,"order":3,"type":"single","prompt":"고려 사람들이 만든, 푸른빛이 아름다운 그릇은?","options":[{"id":"o1","text":"조선백자"},{"id":"o2","text":"고려청자"},{"id":"o3","text":"옹기"},{"id":"o4","text":"유리병"}],"answer":"o2"},
  {"id":"l4-q4","stage":4,"order":4,"type":"single","prompt":"부처의 가르침을 8만여 장 나무판에 새긴 고려 유산은?","options":[{"id":"o1","text":"훈민정음"},{"id":"o2","text":"대동여지도"},{"id":"o3","text":"팔만대장경"},{"id":"o4","text":"조선왕조실록"}],"answer":"o3"},
  {"id":"l4-q5","stage":4,"order":5,"type":"single","prompt":"조선의 왕들이 한 일을 날마다 기록한 책은?","options":[{"id":"o1","text":"삼국유사"},{"id":"o2","text":"고려청자"},{"id":"o3","text":"첨성대"},{"id":"o4","text":"조선왕조실록"}],"answer":"o4"},
  {"id":"l4-q6","stage":4,"order":6,"type":"single","prompt":"신라가 하늘을 관측하려 세운, 오래된 천문대는?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"석굴암"},{"id":"o3","text":"다보탑"},{"id":"o4","text":"숭례문"}],"answer":"o1"},
  {"id":"l4-q7","stage":4,"order":7,"type":"single","prompt":"문화유산을 오래 지키려면 어떻게 해야 할까?","options":[{"id":"o1","text":"낙서한다"},{"id":"o2","text":"함부로 만지지 않고 보호한다"},{"id":"o3","text":"가져간다"},{"id":"o4","text":"부순다"}],"answer":"o2"},
  {"id":"l4-q8","stage":4,"order":8,"type":"single","prompt":"무형 문화유산의 예로 알맞은 것은?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"고려청자"},{"id":"o3","text":"판소리"},{"id":"o4","text":"석굴암"}],"answer":"o3"},
  {"id":"l4-q9","stage":4,"order":9,"type":"single","prompt":"유형 문화유산의 예로 알맞은 것은?","options":[{"id":"o1","text":"판소리"},{"id":"o2","text":"강강술래"},{"id":"o3","text":"김장"},{"id":"o4","text":"석굴암"}],"answer":"o4"},
  {"id":"l5-q1","stage":5,"order":1,"type":"single","prompt":"신라 사람들이 하늘과 별을 관측하려고 세운 문화유산은?","options":[{"id":"o1","text":"석굴암"},{"id":"o2","text":"첨성대"},{"id":"o3","text":"다보탑"},{"id":"o4","text":"수원 화성"},{"id":"o5","text":"경복궁"}],"answer":"o2"},
  {"id":"l5-q2","stage":5,"order":2,"type":"single","prompt":"부처의 가르침을 8만여 장 나무판에 새긴 고려의 기록 유산은?","options":[{"id":"o1","text":"훈민정음"},{"id":"o2","text":"조선왕조실록"},{"id":"o3","text":"팔만대장경"},{"id":"o4","text":"대동여지도"},{"id":"o5","text":"삼국사기"}],"answer":"o3"},
  {"id":"l5-q3","stage":5,"order":3,"type":"single","prompt":"무거운 돌을 드는 기구로 지은, 세계가 인정한 조선의 성은?","options":[{"id":"o1","text":"남한산성"},{"id":"o2","text":"경복궁"},{"id":"o3","text":"불국사"},{"id":"o4","text":"수원 화성"},{"id":"o5","text":"첨성대"}],"answer":"o4"},
  {"id":"l5-q4","stage":5,"order":4,"type":"single","prompt":"사람에서 사람으로 전해지는 무형 문화유산의 예는?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"고려청자"},{"id":"o3","text":"석굴암"},{"id":"o4","text":"경복궁"},{"id":"o5","text":"판소리"}],"answer":"o5"},
  {"id":"l5-q5","stage":5,"order":5,"type":"single","prompt":"박물관·유적지에서 문화유산을 볼 때 바른 태도는?","options":[{"id":"o1","text":"조용히 보고 함부로 만지지 않는다"},{"id":"o2","text":"뛰어다닌다"},{"id":"o3","text":"큰 소리로 떠든다"},{"id":"o4","text":"유물을 만진다"},{"id":"o5","text":"플래시를 터뜨린다"}],"answer":"o1"},
  {"id":"l5-q6","stage":5,"order":6,"type":"single","prompt":"세종대왕이 만든, 백성을 가르치는 바른 소리라는 뜻의 글자는?","options":[{"id":"o1","text":"팔만대장경"},{"id":"o2","text":"훈민정음"},{"id":"o3","text":"대동여지도"},{"id":"o4","text":"조선왕조실록"},{"id":"o5","text":"삼국사기"}],"answer":"o2"},
  {"id":"l5-q7","stage":5,"order":7,"type":"single","prompt":"경주에 있는, 돌을 쌓아 만든 굴 안의 불상 문화유산은?","options":[{"id":"o1","text":"첨성대"},{"id":"o2","text":"다보탑"},{"id":"o3","text":"석굴암"},{"id":"o4","text":"수원 화성"},{"id":"o5","text":"남한산성"}],"answer":"o3"},
  {"id":"l5-q8","stage":5,"order":8,"type":"single","prompt":"옛날부터 전해 내려와 보존할 가치가 있는 우리의 것을 무엇이라 할까?","options":[{"id":"o1","text":"자연재해"},{"id":"o2","text":"교통수단"},{"id":"o3","text":"전자제품"},{"id":"o4","text":"문화유산"},{"id":"o5","text":"놀이기구"}],"answer":"o4"},
  {"id":"l5-q9","stage":5,"order":9,"type":"single","prompt":"문화유산을 지키기 위한 바른 행동으로 알맞은 것은?","options":[{"id":"o1","text":"낙서한다"},{"id":"o2","text":"몰래 가져간다"},{"id":"o3","text":"발로 찬다"},{"id":"o4","text":"부순다"},{"id":"o5","text":"소중히 여기고 깨끗이 보존한다"}],"answer":"o5"}
];

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const getQuestionsByStage = (stage) => QUESTIONS.filter((q) => q.stage === Number(stage));
const getQuestionById = (id) => QUESTIONS.find((q) => q.id === id);

module.exports = { QUESTIONS, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, getQuestionsByStage, getQuestionById };
