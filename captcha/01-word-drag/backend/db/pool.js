/**
 * MySQL 커넥션 풀 + 스키마 자동 초기화
 * ---------------------------------------------------------------
 * 실제 접속 정보는 .env 파일에서 읽어온다. (.env.example 참고)
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │  ⚠️  DB 비밀번호 넣는 곳                                        │
 * │                                                              │
 * │  같은 폴더의  ../.env  파일을 만들고 아래처럼 채워주세요.        │
 * │                                                              │
 * │      DB_HOST=localhost                                       │
 * │      DB_PORT=3306                                            │
 * │      DB_USER=root                                            │
 * │      DB_PASSWORD=여기에_본인_DB_비밀번호_입력   ← ★★★          │
 * │      DB_NAME=catchap_captcha                                 │
 * │                                                              │
 * │  .env 를 안 쓰고 코드에 직접 넣고 싶다면 아래                    │
 * │  DEFAULTS.password 값을 바꿔도 됩니다. (비추천)                 │
 * └──────────────────────────────────────────────────────────────┘
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ── 아주 단순한 .env 로더 (외부 의존성 없이 동작) ──
(function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const DEFAULTS = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  // ★★★ DB 비밀번호 ★★★  .env 의 DB_PASSWORD 로 넣는 걸 권장.
  //     .env 를 안 쓸 경우, 아래 '' 자리에 비밀번호를 직접 적으세요.
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'catchap_captcha',
};

// 스키마 생성 전에는 database 없이 접속해야 하므로 두 단계로 나눔.
const pool = mysql.createPool({
  ...DEFAULTS,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  namedPlaceholders: true,
});

/** 서버 기동 시 스키마(테이블) 자동 생성 */
async function initSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // CREATE DATABASE / USE 를 실행하려면 database 미지정 연결이 필요.
  const bootstrap = await mysql.createConnection({
    host: DEFAULTS.host,
    port: DEFAULTS.port,
    user: DEFAULTS.user,
    password: DEFAULTS.password,
    multipleStatements: true,
  });
  try {
    await bootstrap.query(schemaSql);
  } finally {
    await bootstrap.end();
  }
}

module.exports = { pool, initSchema, DB_NAME: DEFAULTS.database };
