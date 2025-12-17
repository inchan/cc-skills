---
description: 자연어 요구사항을 Linear/GitHub 이슈로 변환 (issue-create-orchestrator 파이프라인)
argument-hint: [--project=프로젝트명] <요구사항 설명>
---

# Issue Orchestrator Pipeline

## 입력

$ARGUMENTS

## 프로젝트 결정

issue-create-orchestrator.yaml의 6단계 "프로젝트 자동 결정" 로직을 따릅니다:
1. `--project=<프로젝트명>` 옵션이 있으면 사용
2. 없으면 자동 매칭 시도 (폴더명 → package.json name → README 첫 헤더)
3. 매칭 실패 시 `list_projects` 조회 후 사용자에게 선택 요청

## 구조 결정 (자동)

Issue Refiner가 이슈 간 관계를 분석하여 자동으로 구조를 결정합니다:
- **hierarchical**: 3개 이상 이슈가 동일 목표/컴포넌트 공유 시 Parent-Child 구조
- **flat**: 독립적인 이슈들은 개별 생성

사용자는 확인 단계에서 구조를 변경할 수 있습니다.

## 지시문

@.claude/commands/issue-create-orchestrator.yaml 의 workflow를 따라 서브에이전트를 순차 호출하세요.

코드베이스 탐색 시 Explore 서브에이전트를 활용하세요 (thoroughness: quick).

## 제약사항

@.claude/commands/issue-create-orchestrator.yaml 의 constraints를 준수하세요.
