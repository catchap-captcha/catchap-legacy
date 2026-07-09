/**
 * 10개 사회 캡챠의 반복되는 뼈대 파일을 템플릿에서 생성한다.
 *   node _shared/generate.js
 * (questions.js 는 캡챠마다 내용이 달라 별도로 손으로 작성한다.)
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;                    // .../captcha/_shared
const CAP = path.join(ROOT, '..');         // .../captcha

const CAPTCHAS = [
  { dir: '01-map-symbol-find',              prefix: 'map',       api: 'map-symbol',    type: 'MAP_SYMBOL_FIND',              port: 4801, emoji: '🗺️', title: '우리 동네 지도 기호 찾기', subtitle: '지도에서 알맞은 곳 찾기',   badge: '🗺️ 지도·사회',   mascot: '지도를 참 잘 읽네요! 🗺️',   tab: '역사' },
  { dir: '02-direction-compass',            prefix: 'direction', api: 'direction',     type: 'DIRECTION_COMPASS',            port: 4802, emoji: '🧭', title: '방위 맞추기',            subtitle: '동서남북·방향 찾기',       badge: '🧭 방향·사회',   mascot: '방향 감각이 좋아요! 🧭',    tab: '역사' },
  { dir: '03-public-office-match',          prefix: 'office',    api: 'public-office', type: 'PUBLIC_OFFICE_MATCH',          port: 4803, emoji: '🏛️', title: '공공기관 역할 연결',       subtitle: '기관과 하는 일 연결하기',   badge: '🏛️ 기관·사회',   mascot: '기관 역할을 잘 아네요! 🏛️', tab: '역사' },
  { dir: '04-cultural-heritage-match',      prefix: 'heritage',  api: 'heritage',      type: 'CULTURAL_HERITAGE_MATCH',      port: 4804, emoji: '🏯', title: '문화유산 사진 맞추기',     subtitle: '문화유산 알아보기',        badge: '🏯 문화유산·사회', mascot: '문화유산을 잘 지켜요! 🏯',  tab: '역사' },
  { dir: '05-rural-city-sort',              prefix: 'region',    api: 'rural-city',    type: 'RURAL_CITY_SORT',              port: 4805, emoji: '🏙️', title: '촌락과 도시 구분',        subtitle: '지역 생활 모습 나누기',     badge: '🏙️ 지역·사회',   mascot: '지역을 잘 구분해요! 🏙️',   tab: '역사' },
  { dir: '06-transport-timeline',           prefix: 'transport', api: 'transport',     type: 'TRANSPORT_TIMELINE',           port: 4806, emoji: '🚄', title: '교통수단 변화 순서',       subtitle: '옛날부터 오늘날까지 배열',  badge: '🚄 생활변화·사회', mascot: '변화를 잘 이해해요! 🚄',    tab: '역사' },
  { dir: '07-local-festival-select',        prefix: 'festival',  api: 'festival',      type: 'LOCAL_FESTIVAL_SELECT',        port: 4807, emoji: '🎪', title: '지역 축제 포스터 찾기',    subtitle: '지역 문화·축제 연결',       badge: '🎪 문화·사회',   mascot: '지역 문화를 잘 알아요! 🎪', tab: '역사' },
  { dir: '08-community-problem-solve',      prefix: 'community', api: 'community',     type: 'COMMUNITY_PROBLEM_SOLVE',      port: 4808, emoji: '🤝', title: '우리 지역 문제 해결',      subtitle: '문제와 해결 방법 찾기',     badge: '🤝 참여·사회',   mascot: '멋진 지역 시민이에요! 🤝',  tab: '역사' },
  { dir: '09-digital-citizenship-solve',    prefix: 'digital',   api: 'digital-citizenship', type: 'DIGITAL_CITIZENSHIP_SOLVE', port: 4809, emoji: '📱', title: '디지털 시민성 문제 해결', subtitle: '온라인 사회문제 해결하기', badge: '📱 디지털·사회', mascot: '디지털 세상을 안전하게 지켜요! 📱', tab: '생활' },
  { dir: '10-cpr-aed-safety-sequence',      prefix: 'cpr',       api: 'cpr-aed',       type: 'CPR_AED_SAFETY_SEQUENCE',      port: 4810, emoji: '🫀', title: '심폐소생술·자동심장충격기 안전 순서', subtitle: '금지 행동·이론·사진 순서',  badge: '🫀 생활안전·사회', mascot: '생명을 지키는 법을 배워요! 🫀', tab: '생활',
    extra: `      <div class="csl-notice" style="margin-top:16px">
        ⚠️ 이 문제는 응급처치 순서를 익히기 위한 <b>교육용</b>입니다.
        실제 응급 상황에서는 즉시 <b>119</b>에 신고하고, 주변 어른 또는 구급대원의 안내를 따르세요.
      </div>` },
];

const TABS = ['Aa 국어', '🔤 영어', '📐 수학', '⚗️ 과학', '📜 역사', '🏠 생활'];
const TAB_KEY = { 'Aa 국어': '국어', '🔤 영어': '영어', '📐 수학': '수학', '⚗️ 과학': '과학', '📜 역사': '역사', '🏠 생활': '생활' };

function buildTabs(active) {
  return TABS.map((t) => `    <span class="tab${TAB_KEY[t] === active ? ' on' : ''}">${t}</span>`).join('\n');
}

const tpl = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const T_server = tpl('server.template.js');
const T_pool = tpl('pool.template.js');
const T_schema = tpl('schema.template.sql');
const T_routes = tpl('routes.captcha.template.js');
const T_index = tpl('index.template.html');
const cssMaster = tpl('catchap-social.css');
const jsMaster = tpl('catchap-social.js');

function fill(str, c) {
  return str
    .split('__CAPTCHA_TYPE__').join(c.type)
    .split('__PREFIX__').join(c.prefix)
    .split('__API_PATH__').join(c.api)
    .split('__PORT__').join(String(c.port))
    .split('__TITLE__').join(c.title)
    .split('__SUBTITLE__').join(c.subtitle)
    .split('__EMOJI__').join(c.emoji)
    .split('__BADGE__').join(c.badge)
    .split('__MASCOT_MSG__').join(c.mascot)
    .split('__EXTRA__').join(c.extra || '')
    .replace('<!--TABS-->', buildTabs(c.tab));
}

for (const c of CAPTCHAS) {
  const base = path.join(CAP, c.dir);
  const W = (rel, content) => { fs.writeFileSync(path.join(base, rel), content); };

  W('backend/server.js', fill(T_server, c));
  W('backend/db/pool.js', fill(T_pool, c));
  W('backend/db/schema.sql', fill(T_schema, c));
  W('backend/routes/captcha.js', fill(T_routes, c));
  W('frontend/index.html', fill(T_index, c));
  W('frontend/widget/catchap-social.css', cssMaster);
  W('frontend/widget/catchap-social.js', jsMaster);

  W('package.json', JSON.stringify({
    name: `catchap-${c.api}-captcha`,
    version: '1.0.0',
    private: true,
    description: `CatChap 사회 캡챠 · ${c.title} (5단계 × 5문제)`,
    main: 'backend/server.js',
    scripts: {
      start: 'node backend/server.js',
      dev: 'node --watch backend/server.js',
      'db:init': 'mysql -u root -p < backend/db/schema.sql',
    },
    dependencies: { express: '^4.19.2', mysql2: '^3.11.0' },
  }, null, 2) + '\n');

  W('.env.example', [
    '# ─────────────────────────────────────────────────────────────',
    '#  이 파일을  .env  로 복사해서 사용하세요.   cp .env.example .env',
    '# ─────────────────────────────────────────────────────────────',
    '',
    '# 서버 포트',
    `PORT=${c.port}`,
    '',
    '# MySQL 접속 정보',
    'DB_HOST=localhost',
    'DB_PORT=3306',
    'DB_USER=root',
    '',
    '# ★★★ 여기에 본인 MySQL 비밀번호를 입력하세요 ★★★',
    'DB_PASSWORD=여기에_DB_비밀번호_입력',
    '',
    'DB_NAME=catchap_social',
    '',
  ].join('\n'));

  console.log('✅ generated:', c.dir);
}
console.log('\n완료! questions.js 는 캡챠별로 별도 작성합니다.');
