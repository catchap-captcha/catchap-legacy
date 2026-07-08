-- ============================================================================
--  CatChap · Grammar Choice CAPTCHA  —  Database Schema (MySQL 8+)
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catchap_captcha;

CREATE TABLE IF NOT EXISTS grammar_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'grammar-choice',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_grammar_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grammar_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  grammar_type         VARCHAR(32)  NULL,   -- be동사/관사/복수형/대명사/현재형동사
  sentence_masked      VARCHAR(128) NULL,
  target_answer        VARCHAR(32)  NULL,
  selected_answer      VARCHAR(32)  NULL,
  wrong_attempt_count  INT          NULL DEFAULT 0,
  hovered_options_json JSON         NULL,
  first_select_time_ms INT          NULL,
  hesitation_time_ms   INT          NULL,
  solve_time_ms        INT          NULL,
  retry_count          INT          NULL DEFAULT 0,

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_grammar_attempt_session (session_id),
  INDEX idx_grammar_attempt_stage (stage),
  CONSTRAINT fk_grammar_attempt_session
    FOREIGN KEY (session_id) REFERENCES grammar_session(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;
