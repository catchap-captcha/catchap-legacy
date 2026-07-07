-- ============================================================================
--  CatChap · 손씻기 위생 캡챠  —  Database Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실행 방법:
--    mysql -u root -p < schema.sql
--  (또는 서버 최초 기동 시 pool.js 의 initSchema() 가 자동 실행)
--
--  3종 캡챠(교통/화재/손씻기)는 같은 catchap_life DB 를 공유하고
--  테이블 프리픽스(traffic_/fire_/hands_)로 분리한다.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_life
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catchap_life;

-- ────────────────────────────────────────────────────────────────
--  1) 캡챠 세션 : 한 번의 "판" (5단계 도전 1회 = 1 세션)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hands_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'clean-hands',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_hands_session_status (status),
  INDEX idx_hands_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  2) 문제별 시도(행동) 로그
--     손씻기는 주로 순서 배열(order) → selected_sequence_json 이 핵심.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hands_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  question_type    VARCHAR(16)   NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  solve_time_ms        INT   NULL,
  first_select_time_ms INT   NULL,
  hesitation_time_ms   INT   NULL,
  wrong_attempt_count  INT   NULL DEFAULT 0,

  selected_action  VARCHAR(64)  NULL,
  target_action    VARCHAR(64)  NULL,

  selected_sequence_json JSON  NULL,   -- 손씻기: 배열한 순서
  target_sequence_json   JSON  NULL,
  wrong_order_count      INT   NULL,
  regrab_count           INT   NULL DEFAULT 0,

  selected_pairs_json    JSON  NULL,
  target_pairs_json      JSON  NULL,
  wrong_connection_count INT   NULL,
  reconnect_count        INT   NULL DEFAULT 0,

  metrics_json     JSON        NULL,

  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_hands_attempt_session (session_id),
  INDEX idx_hands_attempt_question (question_id),
  INDEX idx_hands_attempt_stage (stage),
  CONSTRAINT fk_hands_attempt_session
    FOREIGN KEY (session_id) REFERENCES hands_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
