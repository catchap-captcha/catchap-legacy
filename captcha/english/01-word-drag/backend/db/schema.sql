-- ============================================================================
--  CatChap · Word Drag CAPTCHA  —  Database Schema (MySQL 8+)
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
CREATE TABLE IF NOT EXISTS captcha_session (
  session_id     CHAR(36)      NOT NULL,             -- UUID
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'word-drag',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,                 -- 통과 시 발급되는 검증 토큰
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_session_status (status),
  INDEX idx_session_started (started_at)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
--  2) 문제별 시도(행동) 로그 : 스펙의 모든 수집 데이터를 담는다.
--     단계별로 쓰이는 컬럼이 달라서, 공통 컬럼 + 단계 전용 컬럼 +
--     자유형 metrics_json 으로 구성한다.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS captcha_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- ── 공통 시간/거리 데이터 (1~5단계) ──
  solve_time_ms      INT         NULL,   -- 문제 등장 → 제출까지
  drag_start_time    BIGINT      NULL,   -- epoch ms (드래그 시작)
  drag_end_time      BIGINT      NULL,   -- epoch ms (드래그 끝/드롭)
  drag_distance      DOUBLE      NULL,   -- 픽셀 이동 총거리
  hover_time_ms      INT         NULL,   -- 보기 위 머문 총 시간
  drag_path_json     JSON        NULL,   -- [{x,y,t}, ...] 드래그 궤적

  -- ── 선택/오답 데이터 (1~3단계 single) ──
  selected_word        VARCHAR(64)  NULL,
  target_word          VARCHAR(64)  NULL,
  first_selected_word  VARCHAR(64)  NULL,
  wrong_attempt_count  INT          NULL DEFAULT 0,
  regrab_count         INT          NULL DEFAULT 0,   -- 잡았다 놓친 횟수
  hovered_words_json   JSON         NULL,             -- 훑어본 단어들
  wrong_word_type      VARCHAR(32)  NULL,             -- spelling/pronunciation/...

  -- ── 다중 매칭 데이터 (4단계 multi) ──
  match_count          INT   NULL,
  correct_match_count  INT   NULL,
  wrong_match_count    INT   NULL,
  drag_order_json      JSON  NULL,   -- 슬롯을 채운 순서
  first_target_selected VARCHAR(32) NULL,
  time_per_match_json  JSON  NULL,   -- {slot: ms}
  retry_count          INT   NULL DEFAULT 0,

  -- ── 카테고리 데이터 (5단계 category) ──
  selected_words_json          JSON  NULL,
  correct_words_json           JSON  NULL,
  wrong_category_count         INT   NULL,
  missed_correct_count         INT   NULL,
  selection_order_json         JSON  NULL,
  category_understanding_score DOUBLE NULL, -- 0.0 ~ 1.0

  -- ── 확장용 자유 데이터 ──
  metrics_json     JSON        NULL,

  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_attempt_session (session_id),
  INDEX idx_attempt_question (question_id),
  INDEX idx_attempt_stage (stage),
  CONSTRAINT fk_attempt_session
    FOREIGN KEY (session_id) REFERENCES captcha_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
