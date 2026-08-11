# 캡차 챌린지 정의 데이터 (2026-08-10 보관)

★**어디서 왔나** — 로컬 `CatChap/_ms-captcha-extract/final/final/` 에만 있던 파일입니다.
그 폴더를 정리하면서, **오브젝트 스토리지에도 저장소에도 없던 것**만 여기로 옮겼습니다.

★**왜 여기 있나** — 이미지 조각은 오브젝트 스토리지로 보냈지만, 이 `.jsonl` 들은
**텍스트라서 git 이 맞습니다.** 무엇이 어떻게 바뀌었는지 나중에 diff 로 볼 수 있습니다.

## 파일

```
challenges.jsonl                                  지금 쓰는 챌린지 정의
challenges.before-auto-pause.jsonl                자동 일시정지 넣기 ★전
challenges.before-clean-auto.jsonl                자동 정리 돌리기 ★전
challenges.before-semantic-hold.jsonl             의미 보류 넣기 ★전
challenges.before_review_reconcile.jsonl          검수 대조 ★전
clean_auto_challenges.jsonl                       (0바이트 — 원본이 비어 있었습니다)
clean_auto_challenges.before-semantic-hold.jsonl  위의 의미 보류 ★전
semantic_hold_questions.jsonl                     의미 보류로 뺀 문항
```

★`.before-*` 는 **어떤 처리를 하기 직전의 상태**입니다. 처리가 잘못됐을 때
되돌리거나, 무엇이 걸러졌는지 비교할 때 씁니다.

## 내용 형태

```json
{"challenge_id": "tq_…", "source": "tallyqa_visual_genome",
 "image_path": "images/…jpg", "instruction": "…를 모두 정답존으로 옮기세요.",
 "difficulty": 2, "review_status": "approved", "objects": [...]}
```

공개 데이터셋(TallyQA / Visual Genome) 기반이고 **비밀값·개인정보는 없습니다**(올리기 전 확인).

## 짝이 되는 이미지는 어디에

```
지금 쓰는 것    오브젝트 스토리지  catchap-storage-prod-team1
                captcha-service/final/           (41,446개)
옛 판 보관      captcha-service/archive-0810-before-instance-masks/   (28,537개)
```
