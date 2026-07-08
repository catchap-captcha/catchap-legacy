/**
 * CatChap · Missing Letter CAPTCHA — Express 서버
 *   npm install && npm start   → http://localhost:4300
 */
const path = require('path');
const express = require('express');
const { initSchema } = require('./db/pool');
const captchaRouter = require('./routes/captcha');

const app = express();
const PORT = Number(process.env.PORT || 4300);

app.use(express.json({ limit: '256kb' }));
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/api/missing-letter', captchaRouter);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

(async function boot() {
  try { await initSchema(); console.log('✅ DB 스키마 준비 완료 (catchap_captcha / missing_*)'); }
  catch (err) { console.warn('⚠️  DB 초기화 실패 — .env 의 DB_PASSWORD 확인.', err.message); console.warn('    (DB 없이도 메모리 폴백으로 데모 동작)'); }
  app.listen(PORT, () => {
    console.log(`\n🐱 CatChap Missing Letter CAPTCHA`);
    console.log(`   데모:  http://localhost:${PORT}/`);
    console.log(`   API :  http://localhost:${PORT}/api/missing-letter/health\n`);
  });
})();
