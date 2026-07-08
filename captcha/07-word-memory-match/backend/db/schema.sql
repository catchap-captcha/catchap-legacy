-- ============================================================================
--  CatChap · Word Memory Match CAPTCHA  —  Database Schema (MySQL 8+)
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catchap_captcha;

CREATE TABLE IF NOT EXISTS memory_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'word-memory-match',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_memory_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS memory_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_passed        TINYINT(1)    NOT NULL DEFAULT 0,

  -- 짝/카드 데이터
  target_pairs_json     JSON     NULL,   -- 정답 짝 (key 목록)
  pair_count            INT      NULL,
  matched_pairs_json    JSON     NULL,   -- 맞춘 짝
  matched_count         INT      NULL,
  wrong_pair_count      INT      NULL,
  confused_pair_json    JSON     NULL,   -- 헷갈린 유사 단어쌍 (4단계)
  similar_word_pairs_json JSON   NULL,

  -- 카드 열람 행동
  card_open_order_json  JSON     NULL,
  opened_cards_json     JSON     NULL,   -- 카드별 열람 횟수
  card_open_count       INT      NULL,
  reopen_count          INT      NULL,
  memory_attempt_count  INT      NULL,   -- (짝 시도 총 횟수)

  -- 시간 데이터
  first_open_time_ms    INT      NULL,
  first_match_time_ms   INT      NULL,
  hesitation_time_ms    INT      NULL,
  solve_time_ms         INT      NULL,
  time_limit_ms         INT      NULL,   -- 5단계
  remaining_time_ms     INT      NULL,   -- 5단계

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_memory_attempt_session (session_id),
  INDEX idx_memory_attempt_stage (stage),
  CONSTRAINT fk_memory_attempt_session
    FOREIGN KEY (session_id) REFERENCES memory_session(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;
