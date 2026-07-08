-- ============================================================================
--  CatChap · 교통안전 캡챠  —  Database Schema (MySQL 8+)
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
CREATE TABLE IF NOT EXISTS traffic_session (
  session_id     CHAR(36)      NOT NULL,             -- UUID
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'traffic-safety',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,                 -- 통과 시 발급되는 검증 토큰
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_traffic_session_status (status),
  INDEX idx_traffic_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  2) 문제별 시도(행동) 로그 : 스펙의 수집 데이터를 담는다.
--     유형(single/order/connect)별로 쓰이는 컬럼이 다르므로
--     공통 컬럼 + 유형 전용 컬럼 + 자유형 metrics_json 으로 구성.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS traffic_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  question_type    VARCHAR(16)   NOT NULL,           -- single / order / connect
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- ── 공통 시간/시도 데이터 ──
  solve_time_ms        INT   NULL,   -- 문제 등장 → 제출까지
  first_select_time_ms INT   NULL,   -- 첫 상호작용까지
  hesitation_time_ms   INT   NULL,   -- 망설임 시간
  wrong_attempt_count  INT   NULL DEFAULT 0,

  -- ── single (안전/위험 행동 선택, 상황 판단) ──
  selected_action  VARCHAR(64)  NULL,
  target_action    VARCHAR(64)  NULL,

  -- ── order (순서 배열: 길 건너기 순서 등) ──
  selected_sequence_json JSON  NULL,
  target_sequence_json   JSON  NULL,
  wrong_order_count      INT   NULL,
  regrab_count           INT   NULL DEFAULT 0,   -- 담았다 다시 뺀 횟수

  -- ── connect (행동-이유 / 상황-번호 연결) ──
  selected_pairs_json    JSON  NULL,
  target_pairs_json      JSON  NULL,
  wrong_connection_count INT   NULL,
  reconnect_count        INT   NULL DEFAULT 0,

  -- ── 확장용 자유 데이터 ──
  metrics_json     JSON        NULL,

  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_traffic_attempt_session (session_id),
  INDEX idx_traffic_attempt_question (question_id),
  INDEX idx_traffic_attempt_stage (stage),
  CONSTRAINT fk_traffic_attempt_session
    FOREIGN KEY (session_id) REFERENCES traffic_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
