-- ============================================================================
--  CatChap · Picture Sentence Match CAPTCHA  —  Database Schema (MySQL 8+)
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catchap_captcha;

CREATE TABLE IF NOT EXISTS picmatch_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'picture-sentence-match',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_picmatch_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS picmatch_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- 단일 선택 (1~3단계)
  image_id             VARCHAR(16)  NULL,
  target_sentence      VARCHAR(160) NULL,
  selected_sentence    VARCHAR(160) NULL,
  sentence_type        VARCHAR(32)  NULL,  -- 상태/행동/위치/소유/색깔

  -- 연결 매칭 (4~5단계)
  target_map_json      JSON  NULL,   -- image -> sentence
  selected_map_json    JSON  NULL,
  correct_match_count  INT   NULL,
  wrong_match_count    INT   NULL,
  connection_path_json JSON  NULL,

  -- 행동 데이터
  wrong_attempt_count  INT   NULL DEFAULT 0,
  hovered_options_json JSON  NULL,
  first_select_time_ms INT   NULL,
  solve_time_ms        INT   NULL,
  retry_count          INT   NULL DEFAULT 0,

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_picmatch_attempt_session (session_id),
  INDEX idx_picmatch_attempt_stage (stage),
  CONSTRAINT fk_picmatch_attempt_session
    FOREIGN KEY (session_id) REFERENCES picmatch_session(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;
