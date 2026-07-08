-- ============================================================================
--  CatChap · Sound Match CAPTCHA  —  Database Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실행 방법:
--    mysql -u root -p < schema.sql
--  (또는 서버 최초 기동 시 pool.js 의 initSchema() 가 자동 실행)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catchap_captcha;

-- ────────────────────────────────────────────────────────────────
--  1) 캡챠 세션 : 한 번의 "판" (5단계 도전 1회 = 1 세션)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sound_session (
  session_id     CHAR(36)      NOT NULL,             -- UUID
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'sound-match',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,                 -- 통과 시 발급되는 검증 토큰
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_sound_session_status (status),
  INDEX idx_sound_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  2) 문제별 시도(행동) 로그 : 스펙의 모든 수집 데이터를 담는다.
--     공통 컬럼 + 단계 전용 컬럼 + 자유형 metrics_json 구성.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sound_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- ── 공통 데이터 (1~5단계) ──
  target_word          VARCHAR(64)  NULL,
  selected_word        VARCHAR(64)  NULL,
  selected_image_id    VARCHAR(16)  NULL,
  audio_play_count     INT          NULL DEFAULT 0,
  solve_time_ms        INT          NULL,   -- 문제 등장 → 제출까지
  time_after_audio_ms  INT          NULL,   -- 마지막 오디오 재생 후 → 선택까지
  first_select_time_ms INT          NULL,   -- 문제 등장 → 첫 선택까지
  wrong_attempt_count  INT          NULL DEFAULT 0,

  -- ── 3단계 : 비슷한 발음 구분 ──
  confused_pair        VARCHAR(64)  NULL,   -- 예: "bear|pear"
  wrong_word_type      VARCHAR(32)  NULL,   -- first-sound/end-sound/spelling/meaning
  hovered_option_json  JSON         NULL,
  retry_count          INT          NULL DEFAULT 0,

  -- ── 4단계 : 글자 힌트 제거 ──
  max_audio_play_reached TINYINT(1) NULL DEFAULT 0,
  hesitation_time_ms     INT        NULL,

  -- ── 5단계 : 연속 듣기 선택 ──
  target_sequence_json    JSON  NULL,
  selected_sequence_json  JSON  NULL,
  sequence_correct        TINYINT(1) NULL,
  first_selected_image    VARCHAR(16) NULL,
  selection_order_json    JSON  NULL,
  time_per_selection_json JSON  NULL,
  wrong_order_count       INT   NULL,

  -- ── 확장용 자유 데이터 ──
  metrics_json     JSON        NULL,

  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_sound_attempt_session (session_id),
  INDEX idx_sound_attempt_question (question_id),
  INDEX idx_sound_attempt_stage (stage),
  CONSTRAINT fk_sound_attempt_session
    FOREIGN KEY (session_id) REFERENCES sound_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
