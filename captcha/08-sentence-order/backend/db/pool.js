/**
 * MySQL 커넥션 풀 + 스키마 자동 초기화 (Sentence Order)
 * ---------------------------------------------------------------
 * ┌──────────────────────────────────────────────────────────────┐
 * │  ⚠️  DB 비밀번호 넣는 곳                                        │
 * │  같은 폴더의  ../.env  파일을 만들고 아래처럼 채워주세요.        │
 * │      DB_HOST=localhost                                       │
 * │      DB_PORT=3306                                            │
 * │      DB_USER=root                                            │
 * │      DB_PASSWORD=여기에_본인_DB_비밀번호_입력   ← ★★★          │
 * │      DB_NAME=catchap_captcha                                 │
 * │  .env 대신 아래 DEFAULTS.password 를 직접 바꿔도 됩니다.(비추천) │
 * └──────────────────────────────────────────────────────────────┘
 *  ※ 다른 캡챠와 같은 catchap_captcha DB 공유 (테이블 sentence_ 로 분리)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const DEFAULTS = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  // ★★★ DB 비밀번호 ★★★  .env 의 DB_PASSWORD 권장. 없으면 아래 '' 자리에 직접 입력.
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'catchap_captcha',
};

const pool = mysql.createPool({
  ...DEFAULTS, waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  charset: 'utf8mb4', namedPlaceholders: true,
});

async function initSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const bootstrap = await mysql.createConnection({
    host: DEFAULTS.host, port: DEFAULTS.port, user: DEFAULTS.user,
    password: DEFAULTS.password, multipleStatements: true,
  });
  try { await bootstrap.query(schemaSql); } finally { await bootstrap.end(); }
}

module.exports = { pool, initSchema, DB_NAME: DEFAULTS.database };
