/**
 * CatChap · Sound Match CAPTCHA — Express 서버
 * ---------------------------------------------------------------
 *   npm install
 *   npm start        (또는 npm run dev)
 *   → http://localhost:4100  에서 데모 페이지가 열립니다.
 */

const path = require('path');
const express = require('express');
const { initSchema } = require('./db/pool');
const captchaRouter = require('./routes/captcha');

const app = express();
const PORT = Number(process.env.PORT || 4100);

app.use(express.json({ limit: '256kb' }));

// 데모/위젯/오디오 정적 파일 서빙
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/sound-match', captchaRouter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

(async function boot() {
  try {
    await initSchema();
    console.log('✅ DB 스키마 준비 완료 (catchap_captcha / sound_*)');
  } catch (err) {
    console.warn('⚠️  DB 초기화 실패 — .env 의 DB_PASSWORD 를 확인하세요.');
    console.warn('    ', err.message);
    console.warn('    (DB 없이도 메모리 폴백으로 데모는 정상 동작합니다.)');
  }

  app.listen(PORT, () => {
    console.log(`\n🐱 CatChap Sound Match CAPTCHA`);
    console.log(`   데모:  http://localhost:${PORT}/`);
    console.log(`   API :  http://localhost:${PORT}/api/sound-match/health\n`);
  });
})();
