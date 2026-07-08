-- ============================================================================
--  CatChap · Word Puzzle CAPTCHA  —  Database Schema (MySQL 8+)
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catchap_captcha;

CREATE TABLE IF NOT EXISTS puzzle_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'word-puzzle',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_puzzle_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS puzzle_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- 공통
  target_word            VARCHAR(32)  NULL,
  target_category        VARCHAR(32)  NULL,
  word_length            INT          NULL,
  shuffled_letters_json  JSON         NULL,
  selected_letters_json  JSON         NULL,
  letter_drag_order_json JSON         NULL,
  wrong_order_count      INT          NULL,
  swap_count             INT          NULL,
  regrab_count           INT          NULL,
  retry_count            INT          NULL DEFAULT 0,
  drag_path_json         JSON         NULL,
  solve_time_ms          INT          NULL,
  completion_time_ms     INT          NULL,

  -- 3단계: 방해 알파벳
  correct_letters_json      JSON     NULL,
  distractor_letters_json   JSON     NULL,
  distractor_selected_count INT      NULL,

  -- 5단계: 힌트
  hint_used              TINYINT(1)   NULL,

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_puzzle_attempt_session (session_id),
  INDEX idx_puzzle_attempt_stage (stage),
  CONSTRAINT fk_puzzle_attempt_session
    FOREIGN KEY (session_id) REFERENCES puzzle_session(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;
