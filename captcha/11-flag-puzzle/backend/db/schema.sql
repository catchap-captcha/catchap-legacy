-- ============================================================================
--  CatChap · Flag Puzzle 캡챠 (세계 국기 이미지 퍼즐)  —  Schema (MySQL 8+)
-- ----------------------------------------------------------------------------
--  실제 국기 이미지를 격자로 잘라 맞추는 퍼즐. 조각 배치·드래그 궤적·방해 조각
--  선택까지 전부 수집한다. (추후 데이터셋 학습용)
--  같은 catchap_life DB 공유, 프리픽스 flag_ 로 분리.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catchap_life
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catchap_life;

CREATE TABLE IF NOT EXISTS flag_session (
  session_id     CHAR(36)      NOT NULL,
  captcha_type   VARCHAR(32)   NOT NULL DEFAULT 'flag-puzzle',
  status         ENUM('in_progress','passed','failed') NOT NULL DEFAULT 'in_progress',
  ip_address     VARCHAR(64)   NULL,
  user_agent     VARCHAR(512)  NULL,
  total_correct  INT           NOT NULL DEFAULT 0,
  total_answered INT           NOT NULL DEFAULT 0,
  pass_token     CHAR(36)      NULL,
  started_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    DATETIME      NULL,
  PRIMARY KEY (session_id),
  INDEX idx_flag_session_status (status),
  INDEX idx_flag_session_started (started_at)
) ENGINE=InnoDB;

-- 퍼즐 시도 로그 : 스펙의 수집 데이터를 담는다.
CREATE TABLE IF NOT EXISTS flag_attempt (
  attempt_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)      NOT NULL,
  question_id      VARCHAR(32)   NOT NULL,
  stage            TINYINT       NOT NULL,
  question_type    VARCHAR(16)   NOT NULL,           -- puzzle
  is_correct       TINYINT(1)    NOT NULL DEFAULT 0,

  -- ── 대상 국기 ──
  target_country_code    VARCHAR(8)   NULL,   -- kr / jp / fr ...
  target_country_name_ko VARCHAR(32)  NULL,   -- 한국 / 일본 ...
  piece_count            INT          NULL,   -- 제공된 조각 수(방해 포함)

  -- ── 공통 시간/시도 ──
  solve_time_ms        INT   NULL,
  first_select_time_ms INT   NULL,
  hesitation_time_ms   INT   NULL,
  wrong_attempt_count  INT   NULL DEFAULT 0,

  -- ── 드래그 행동 ──
  drag_distance        DOUBLE NULL,
  drag_path_json       JSON   NULL,   -- [{x,y,t}, ...]
  regrab_count         INT    NULL DEFAULT 0,   -- 조각을 도로 뺀/놓친 횟수
  swap_count           INT    NULL DEFAULT 0,   -- 칸의 조각을 교체한 횟수
  selection_order_json JSON   NULL,   -- 어떤 조각부터 놓았는지

  -- ── 퍼즐 결과 ──
  placements_json           JSON   NULL,   -- { slotId: pieceId } 제출값
  target_placements_json    JSON   NULL,   -- 정답 배치
  wrong_placement_count     INT    NULL,
  missed_piece_count        INT    NULL,
  distractor_selected_count INT    NULL,   -- 방해 조각(다른 나라)을 놓은 수
  completion_rate           DOUBLE NULL,   -- 0.0 ~ 1.0

  metrics_json     JSON        NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id),
  INDEX idx_flag_attempt_session (session_id),
  INDEX idx_flag_attempt_question (question_id),
  INDEX idx_flag_attempt_country (target_country_code),
  INDEX idx_flag_attempt_stage (stage),
  CONSTRAINT fk_flag_attempt_session
    FOREIGN KEY (session_id) REFERENCES flag_session(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
