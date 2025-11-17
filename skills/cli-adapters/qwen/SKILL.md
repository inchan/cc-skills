---
name: qwen-cli-adapter
description: Qwen Code CLI 어댑터. dual-ai-loop에서 Qwen 모델을 사용하기 위한 설치, 명령어 패턴, 에러 처리 가이드.
---

# Qwen Code CLI Adapter

## 검증 상태

✅ **검증됨** (2025-11-17)
- npm 패키지: @qwen-code/qwen-code (v0.2.1)
- GitHub: https://github.com/QwenLM/qwen-code
- 공식 Qwen 팀 관리

## 개요

Qwen Code CLI와의 통합을 위한 어댑터입니다. AI 기반 코딩 어시스턴트입니다.

## 설치 확인

```bash
which qwen
qwen --version
```

## 설치 방법

```bash
# npm을 통한 설치 (검증됨)
npm install -g @qwen-code/qwen-code@latest
```

## 인증 설정

### 방법 1: Qwen OAuth (권장)

```bash
# qwen 실행 후 브라우저에서 인증
qwen
# "Sign in" 선택 → 브라우저에서 인증

# 제한사항:
# - 일일 2,000개 요청
# - 분당 60개 속도 제한
```

### 방법 2: OpenAI 호환 API

```bash
# 환경변수 설정
export OPENAI_API_KEY="your-key"
export OPENAI_BASE_URL="https://your-api-endpoint"
export OPENAI_MODEL="your-model"

# 또는 프로젝트 루트에 .env 파일 생성
```

## 명령어 패턴 (검증됨)

### 기본 실행

```bash
# 대화형 모드
qwen

# YOLO 모드 (자동 실행)
qwen --yolo
```

### 대화형 세션 내 명령어

| 명령어 | 설명 |
|--------|------|
| `/help` | 사용 가능한 명령어 표시 |
| `/clear` | 대화 기록 삭제 |
| `/compress` | 토큰 절약을 위해 히스토리 압축 |
| `/stats` | 현재 세션 정보 표시 |
| `/exit` 또는 `/quit` | 종료 |

### 주요 옵션

| 옵션 | 설명 |
|------|------|
| `--yolo` | YOLO 모드에서 자동 실행 |
| `--vlm-switch-mode` | 비전 모델 자동 전환 (once/session/persist) |

## dual-ai-loop 연동

### 구현자 역할

Qwen Code는 대화형 인터페이스입니다. dual-ai-loop에서 사용 시:

1. `qwen` 실행
2. Claude의 계획을 프롬프트로 입력
3. 결과를 Claude에게 전달

```bash
# 대화형 모드에서
qwen
# 그 후 프롬프트 입력:
# "구현 요청: [Claude의 계획]"
```

### 검증자 역할

```bash
qwen
# "코드 검증: [Claude의 코드]"
```

## 버전 정보

**최신 버전**: 0.2.1 (npm 확인됨)
**최소 버전**: 0.1.0

## 특징

- **Qwen OAuth 인증**: 브라우저 기반 인증
- **비전 모델 지원**: 이미지 분석 가능
- **YOLO 모드**: 자동 실행
- **대화 히스토리 압축**: 토큰 최적화

## 제한사항

- OAuth 인증 시 일일 요청 제한 (2,000개)
- 대화형 인터페이스 (stdin 파이프 지원 확인 필요)
- Node.js 환경 필요

## 참고

- **이전 정보 수정**: `pip install qwen-cli`는 잘못된 정보였습니다
- **실제 패키지**: `npm install -g @qwen-code/qwen-code`
- **GitHub**: https://github.com/QwenLM/qwen-code (NOT alibaba/qwen-cli)
