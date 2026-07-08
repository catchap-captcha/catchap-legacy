-- ============================================================================
--  CatChap · Missing Letter CAPTCHA  —  Database Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catchap_captcha;

CREATE TABLE IF NOT EXISTS missing_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'missing-letter',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_missing_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS missing_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- 공통
  target_word          VARCHAR(32)  NULL,
  target_category      VARCHAR(32)  NULL,
  solve_time_ms        INT          NULL,
  first_select_time_ms INT          NULL,
  hesitation_time_ms   INT          NULL,
  wrong_attempt_count  INT          NULL DEFAULT 0,
  retry_count          INT          NULL DEFAULT 0,
  hovered_letters_json JSON         NULL,
  wrong_letters_json   JSON         NULL,

  -- 단일 빈칸 (1~3,5단계)
  blank_position       INT          NULL,
  target_letter        VARCHAR(4)   NULL,
  selected_letter      VARCHAR(4)   NULL,
  confused_letter_type VARCHAR(32)  NULL,   -- 3단계
  category_hint_used   TINYINT(1)   NULL,   -- 5단계

  -- 여러 빈칸 (4단계)
  blank_positions_json JSON         NULL,
  target_letters_json  JSON         NULL,
  selected_letters_json JSON        NULL,
  letter_order_json    JSON         NULL,
  wrong_order_count    INT          NULL,

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_missing_attempt_session (session_id),
  INDEX idx_missing_attempt_stage (stage),
  CONSTRAINT fk_missing_attempt_session
    FOREIGN KEY (session_id) REFERENCES missing_session(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;
