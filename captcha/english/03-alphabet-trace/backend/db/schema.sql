-- ============================================================================
--  CatChap · Alphabet Trace CAPTCHA  —  Database Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실행 방법:
--    mysql -u root -p < schema.sql
--  (또는 서버 최초 기동 시 pool.js 의 initSchema() 가 자동 실행)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_captcha
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catchap_captcha;

-- ────────────────────────────────────────────────────────────────
--  1) 캡챠 세션 : 한 번의 "판" (5단계 도전 1회 = 1 세션)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trace_session (
  session_id     CHAR(36)      NOT NULL,             -- UUID
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'alphabet-trace',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_trace_session_status (status),
  INDEX idx_trace_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  2) 문제별 시도(그리기 과정) 로그
--     Alphabet Trace 는 정답 여부보다 "그리는 과정" 데이터가 핵심.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trace_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  target_letter    VARCHAR(4)    NOT NULL,
  is_passed        TINYINT(1)    NOT NULL DEFAULT 0,

  -- ── 그리기 경로/획 데이터 (전 단계 공통) ──
  trace_path_json     JSON        NULL,   -- 정규화(0~100) 전체 경로 [[x,y],...]
  stroke_order_json   JSON        NULL,   -- 획별 경로 [[[x,y],...], ...]
  stroke_count        INT         NULL,
  start_position      JSON        NULL,   -- [x,y]
  end_position        JSON        NULL,   -- [x,y]
  drawing_time_ms     INT         NULL,
  pause_count         INT         NULL,
  pause_duration_ms   INT         NULL,
  retry_count         INT         NULL DEFAULT 0,

  -- ── 형태/정확도 평가 (서버 채점 결과) ──
  completion_rate         DOUBLE  NULL,   -- 0~1
  guide_deviation         DOUBLE  NULL,   -- 평균 이탈 거리 (낮을수록 좋음)
  off_path_ratio          DOUBLE  NULL,   -- 0~1
  shape_similarity_score  DOUBLE  NULL,   -- 0~1
  direction_accuracy      DOUBLE  NULL,   -- 0~1 (3단계 중요)
  correct_start_point     TINYINT(1) NULL,

  -- ── 4단계 : 일부만 보고 완성 ──
  provided_part_type      VARCHAR(32) NULL,
  wrong_direction_count   INT         NULL,

  -- ── 5단계 : 직접 쓰기 ──
  letter_recognition_score DOUBLE     NULL, -- 0~1

  -- ── 확장용 자유 데이터 ──
  metrics_json     JSON        NULL,

  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_trace_attempt_session (session_id),
  INDEX idx_trace_attempt_question (question_id),
  INDEX idx_trace_attempt_stage (stage),
  CONSTRAINT fk_trace_attempt_session
    FOREIGN KEY (session_id) REFERENCES trace_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
