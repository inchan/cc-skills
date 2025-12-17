---
description: Linear 이슈를 받아 코드를 구현하고 완료 처리하는 Solver 파이프라인
argument-hint: <이슈ID | --my-issues>
---

# Issue Resolver

## 입력

$ARGUMENTS

## 워크플로우

1. **이슈 조회**: 이슈 ID → `get_issue` / `--my-issues` → `list_issues(assignee="me", state="Todo")`
2. **상태 변경**: `update_issue` → **In Progress**
3. **구현**: `/feature-dev:feature-dev` 슬래시 커맨드로 개발
4. **체크박스 업데이트**: 완료 조건 항목 완료 시 → `update_issue`로 체크 표시 (`- [ ]` → `- [x]`)
5. **완료 보고**: `create_comment`로 작업 요약

> ⚠️ **PR/상태 전환은 수동**: In Review는 PR 생성 시, Done은 Merge 후 수동 처리.

## 상태 관리 필수

| 시점 | 상태 | 액션 | 주체 |
|------|------|------|------|
| 착수 | In Progress | `update_issue` | 에이전트 |
| 체크박스 완료 | In Progress | `update_issue` (description 내 `- [x]`) | 에이전트 |
| 난관 | Blocked | `update_issue` + `create_comment` (사유) | 에이전트 |
| PR 생성 | In Review | `update_issue` | 수동 |
| Merge 완료 | Done | `update_issue` | 수동 |

## 체크박스 업데이트 규칙

1. **즉시성**: 각 항목 구현 완료 즉시 체크 표시 (배치 업데이트 금지)
2. **순서 준수**: 체크박스 순서대로 구현 (의존성 고려)
3. **검증 후 체크**: 빌드/테스트 통과 확인 후에만 체크 표시
4. **부분 완료 명시**: 일부만 완료 시 코멘트로 진행 상황 기록
