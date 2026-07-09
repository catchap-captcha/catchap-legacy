-- ============================================================================
--  CatChap · 사회(社會) 캡챠  —  Database Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실행 방법:
--    mysql -u root -p < schema.sql
--  (또는 서버 최초 기동 시 pool.js 의 initSchema() 가 자동 실행)
--
--  10종 사회 캡챠는 하나의 catchap_social DB 를 공유하고
--  테이블 프리픽스(digital_)로 분리한다.
--  조작 유형이 다양(선택/순서/연결/분류/터치/좌표드래그/경로)해서
--  모든 유형을 담는 통합(superset) 시도 테이블을 사용한다.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_social
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catchap_social;

-- ────────────────────────────────────────────────────────────────
--  1) 캡챠 세션 : 한 번의 "판" (5단계 도전 1회 = 1 세션)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS digital_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(48)   NOT NULL DEFAULT 'DIGITAL_CITIZENSHIP_SOLVE',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_digital_session_status (status),
  INDEX idx_digital_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  2) 문제별 시도(행동) 로그 : single/order/connect/pick/sort/touch/place/route 전부 수용
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS digital_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  question_type    VARCHAR(16)   NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- 공통 시간/시도
  solve_time_ms        INT   NULL,
  first_select_time_ms INT   NULL,
  hesitation_time_ms   INT   NULL,
  wrong_attempt_count  INT   NULL DEFAULT 0,

  -- 드래그/터치 궤적
  drag_distance        DOUBLE NULL,
  drag_path_json       JSON   NULL,
  regrab_count         INT    NULL DEFAULT 0,
  reconnect_count      INT    NULL DEFAULT 0,
  selection_order_json JSON   NULL,

  -- single
  selected_option      VARCHAR(64) NULL,
  target_option        VARCHAR(64) NULL,

  -- order (순서 배열)
  selected_sequence_json JSON NULL,
  target_sequence_json   JSON NULL,
  wrong_order_count      INT  NULL,

  -- connect (연결)
  selected_pairs_json    JSON NULL,
  target_pairs_json      JSON NULL,
  wrong_connection_count INT  NULL,

  -- pick / touch (다중 선택)
  selected_items_json  JSON NULL,
  target_items_json    JSON NULL,
  wrong_selected_count INT  NULL,
  missed_count         INT  NULL,

  -- sort (분류)
  selected_bins_json JSON NULL,
  target_bins_json   JSON NULL,
  wrong_sort_count   INT  NULL,

  -- place (좌표 드래그)
  dropped_zone  VARCHAR(32) NULL,
  target_zone   VARCHAR(32) NULL,

  -- route (경로 드래그)
  reached_dest         TINYINT(1) NULL,
  danger_touched_count INT        NULL,
  route_path_json      JSON       NULL,

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_digital_attempt_session (session_id),
  INDEX idx_digital_attempt_question (question_id),
  INDEX idx_digital_attempt_stage (stage),
  CONSTRAINT fk_digital_attempt_session
    FOREIGN KEY (session_id) REFERENCES digital_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
