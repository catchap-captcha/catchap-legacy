-- ============================================================================
--  CatChap · Word Category Sort CAPTCHA  —  Database Schema (MySQL 8+)
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catchap_captcha;

CREATE TABLE IF NOT EXISTS sort_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'word-category-sort',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_sort_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sort_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- 카테고리/분류 데이터
  categories_json            JSON     NULL,   -- 상자 목록
  target_category            VARCHAR(32) NULL,-- 1단계 단일 카테고리
  word_category_map_json     JSON     NULL,   -- 정답 매핑 (word→cat)
  selected_category_map_json JSON     NULL,   -- 사용자 매핑 (word→chosen)
  correct_words_json         JSON     NULL,
  selected_words_json        JSON     NULL,
  missed_correct_words_json  JSON     NULL,
  wrong_selected_words_json  JSON     NULL,
  distractor_words_json      JSON     NULL,   -- 5단계 방해 단어

  -- 집계 수치
  correct_sort_count         INT      NULL,
  wrong_sort_count           INT      NULL,
  wrong_category_count       INT      NULL,
  distractor_selected_count  INT      NULL,
  missed_correct_count       INT      NULL,
  category_switch_count      INT      NULL,
  regrab_count               INT      NULL,

  -- 행동 데이터
  drag_order_json            JSON     NULL,
  selection_order_json       JSON     NULL,
  drag_path_json             JSON     NULL,
  solve_time_ms              INT      NULL,

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_sort_attempt_session (session_id),
  INDEX idx_sort_attempt_stage (stage),
  CONSTRAINT fk_sort_attempt_session
    FOREIGN KEY (session_id) REFERENCES sort_session(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;
