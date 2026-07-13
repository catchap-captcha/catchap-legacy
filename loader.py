# -*- coding: utf-8 -*-
"""catchap-service 문제 로더 — banks/*.json(원본, 정본)을 catchap-backend DB(questions)에 적재.

A방식: 문제 원본은 이 폴더의 JSON(사람이 편집·git 관리), 런타임은 DB에서 조회.
멱등 — 재실행하면 전량 upsert(문항 갱신/추가/삭제 반영). order_no는 JSON 리스트 순서.

사용:
  # 로컬(포터블 MySQL)
  DATABASE_URL=mysql+pymysql://catchap_user:...@127.0.0.1:3306/catchap \
    python loader.py
  # 프로덕션은 catchap_dba 자격의 DATABASE_URL로 (DML은 catchap_backend로도 가능)

백엔드 모델을 재사용하므로 PYTHONPATH에 catchap-backend 워크트리를 넣거나,
백엔드 컨테이너 안에서 실행(docker cp + docker exec)한다.
"""
import json
import os
import sys

BANKS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "banks")


def load(db, Question) -> dict:
    """banks/<과목>/*.json → questions 테이블 전량 동기화. {과목: 적재수} 반환.

    과목 폴더 안의 topic별 파일을 모아, 각 문항의 _order(원래 은행 순서)로 정렬해
    order_no를 부여한다(topic이 리스트에 섞여 있어도 챕터 슬라이싱 순서 보존). _order가
    없는 신규 문항은 파일명·등장 순서로 뒤에 배치한다. payload에는 _order를 넣지 않는다.
    """
    seen_ids: set[str] = set()
    counts: dict[str, int] = {}
    existing = {q.id: q for q in db.query(Question).all()}

    # 과목 폴더 목록(하위 디렉토리만)
    subject_dirs = sorted(
        d for d in os.listdir(BANKS_DIR) if os.path.isdir(os.path.join(BANKS_DIR, d))
    )
    for key in subject_dirs:
        subdir = os.path.join(BANKS_DIR, key)
        collected: list[tuple[float, str, dict]] = []  # (order, subject, 문항)
        fallback = 10_000_000  # _order 없는 문항용 뒤쪽 순번
        for fname in sorted(f for f in os.listdir(subdir) if f.endswith(".json")):
            data = json.load(open(os.path.join(subdir, fname), encoding="utf-8"))
            subject = data["subject"]
            for q in data["questions"]:
                order = q.get("_order")
                if not isinstance(order, (int, float)):
                    order = fallback
                    fallback += 1
                payload = {k: v for k, v in q.items() if k != "_order"}
                collected.append((order, subject, payload))
        collected.sort(key=lambda t: t[0])  # 원래 은행 순서 복원
        subject_name = collected[0][1] if collected else key
        for order_no, (_, subject, q) in enumerate(collected):
            qid = str(q["id"])
            seen_ids.add(qid)
            row = existing.get(qid)
            if row is None:
                db.add(Question(
                    id=qid, subject=subject, type=q["type"],
                    order_no=order_no, playable=bool(q.get("playable", True)), payload=q,
                ))
            else:
                row.subject = subject
                row.type = q["type"]
                row.order_no = order_no
                row.playable = bool(q.get("playable", True))
                row.payload = q
        counts[subject_name] = len(collected)
    # 원본에서 사라진 문항 삭제(정본 = JSON)
    removed = 0
    for qid, row in existing.items():
        if qid not in seen_ids:
            db.delete(row)
            removed += 1
    db.commit()
    counts["_removed"] = removed
    return counts


def main() -> None:
    from app.db.session import SessionLocal  # 백엔드 모델 재사용
    from app.models import Question

    db = SessionLocal()
    try:
        counts = load(db, Question)
    finally:
        db.close()
    total = sum(v for k, v in counts.items() if not k.startswith("_"))
    print(f"적재 완료: {total}문항  { {k: v for k, v in counts.items() if not k.startswith('_')} }")
    if counts.get("_removed"):
        print(f"원본에서 사라진 문항 삭제: {counts['_removed']}건")


if __name__ == "__main__":
    sys.exit(main())
