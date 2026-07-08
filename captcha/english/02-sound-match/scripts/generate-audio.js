#!/usr/bin/env node
/**
 * Sound Match 오디오 생성기
 * ---------------------------------------------------------------
 *   node scripts/generate-audio.js   (또는  npm run gen:audio)
 *
 * questions.js 에서 쓰이는 모든 영어 단어를 뽑아,
 * macOS 내장 TTS(`say`) + `afconvert` 로 .m4a 발음 파일을 생성한다.
 * 결과물:  frontend/assets/audio/<word>.m4a
 *
 * ※ macOS 전용(say/afconvert 사용). 다른 OS 라면 원하는 TTS 로 교체하세요.
 *   위젯은 파일이 없으면 브라우저 SpeechSynthesis 로 자동 폴백합니다.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { QUESTIONS } = require('../backend/data/questions');

const VOICE = process.env.TTS_VOICE || 'Samantha'; // 맑은 미국식 여성 음성
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'assets', 'audio');
const TMP = path.join(require('os').tmpdir(), '_catchap_tts.aiff');

// 문제에서 쓰이는 모든 단어 수집
const words = new Set();
for (const q of QUESTIONS) {
  if (q.audioWord) words.add(q.audioWord);
  if (Array.isArray(q.audioSequence)) q.audioSequence.forEach((w) => words.add(w));
  if (Array.isArray(q.options)) q.options.forEach((o) => o.word && words.add(o.word));
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let ok = 0;
for (const w of [...words].sort()) {
  const out = path.join(OUT_DIR, `${w}.m4a`);
  try {
    execFileSync('say', ['-v', VOICE, '-o', TMP, w]);
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', TMP, out]);
    ok += 1;
    console.log('  ♪', `${w}.m4a`);
  } catch (err) {
    console.error('  ✗', w, '-', err.message);
  }
}
try { fs.unlinkSync(TMP); } catch (_) {}

console.log(`\n✅ ${ok}/${words.size} 개 오디오 생성 완료 → ${path.relative(process.cwd(), OUT_DIR)}`);
