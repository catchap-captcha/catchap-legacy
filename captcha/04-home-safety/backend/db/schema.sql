-- ============================================================================
--  CatChap · 우리집 안전 캡챠 (드래그형)  —  Database Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실행: mysql -u root -p < schema.sql  (또는 서버 기동 시 자동 생성)
--  같은 catchap_life DB 공유, 테이블 프리픽스 home_ 로 분리.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_life
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catchap_life;

CREATE TABLE IF NOT EXISTS home_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'home-safety',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_home_session_status (status),
  INDEX idx_home_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  드래그 캡챠 시도 로그
--    pick(위험 물건 담기) / sort(안전·위험 분류) 유형 컬럼 + 드래그 궤적
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS home_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  question_type    VARCHAR(16)   NOT NULL,           -- pick / sort
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- ── 공통 시간/시도 데이터 ──
  solve_time_ms        INT   NULL,
  first_select_time_ms INT   NULL,
  hesitation_time_ms   INT   NULL,
  wrong_attempt_count  INT   NULL DEFAULT 0,

  -- ── 드래그 궤적/행동 ──
  drag_distance        DOUBLE NULL,   -- 픽셀 이동 총거리
  drag_path_json       JSON   NULL,   -- [{x,y,t}, ...]
  regrab_count         INT    NULL DEFAULT 0,   -- 목표 밖에 떨어뜨린 횟수
  selection_order_json JSON   NULL,   -- 담은 순서

  -- ── pick (위험 물건 담기 / 모두 찾기) ──
  selected_items_json  JSON  NULL,
  target_items_json    JSON  NULL,
  wrong_selected_count INT   NULL,   -- 잘못 담은 개수
  missed_count         INT   NULL,   -- 놓친 위험 개수

  -- ── sort (안전/위험, 장소별 분류) ──
  selected_bins_json   JSON  NULL,   -- { itemId: binId }
  target_bins_json     JSON  NULL,
  wrong_sort_count     INT   NULL,

  metrics_json     JSON        NULL,

  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_home_attempt_session (session_id),
  INDEX idx_home_attempt_question (question_id),
  INDEX idx_home_attempt_stage (stage),
  CONSTRAINT fk_home_attempt_session
    FOREIGN KEY (session_id) REFERENCES home_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
