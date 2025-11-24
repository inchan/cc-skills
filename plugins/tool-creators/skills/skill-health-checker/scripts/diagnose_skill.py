#!/usr/bin/env python3
"""
스킬 건강도 진단 스크립트
단일 스킬의 500줄 규칙, YAML frontmatter, skill-rules.json 등록 상태를 체크합니다.
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# 프로젝트 루트 경로
# diagnose_skill.py → scripts/ → skill-health-checker/ → skills/ → tool-creators/ → plugins/ → PROJECT_ROOT
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent.parent

class SkillDiagnostic:
    """스킬 진단 클래스"""

    def __init__(self, skill_path: Path):
        self.skill_path = skill_path
        self.skill_md = skill_path / "SKILL.md"
        self.plugin_name = skill_path.parent.parent.parent.name
        self.skill_name = skill_path.name

        # 결과 저장
        self.issues = {
            "critical": [],
            "warning": [],
            "info": []
        }
        self.metrics = {}

    def diagnose(self) -> Dict:
        """전체 진단 실행"""
        print(f"\n🔍 Diagnosing: {self.plugin_name}/{self.skill_name}")

        # 1. SKILL.md 존재 여부
        if not self.skill_md.exists():
            self.issues["critical"].append(f"SKILL.md not found at {self.skill_md}")
            return self._build_report()

        # 2. 라인 수 체크
        self._check_line_count()

        # 3. YAML frontmatter 검증
        self._check_frontmatter()

        # 4. skill-rules.json 등록 확인
        self._check_registration()

        # 5. 디렉토리 구조 확인
        self._check_structure()

        return self._build_report()

    def _check_line_count(self):
        """500줄 규칙 체크"""
        with open(self.skill_md, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            line_count = len(lines)

        self.metrics['line_count'] = line_count
        self.metrics['token_estimate'] = line_count * 15  # 1줄 ≈ 15 토큰

        if line_count > 500:
            excess = line_count - 500
            self.issues["critical"].append(
                f"❌ 500줄 초과: {line_count}줄 (+{excess}줄)"
            )
        elif line_count > 450:
            self.issues["warning"].append(
                f"⚠️  500줄 근접: {line_count}줄 (여유: {500 - line_count}줄)"
            )
        else:
            self.issues["info"].append(
                f"✅ 라인 수 양호: {line_count}줄"
            )

    def _check_frontmatter(self):
        """YAML frontmatter 검증"""
        with open(self.skill_md, 'r', encoding='utf-8') as f:
            content = f.read()

        # YAML frontmatter 파싱
        yaml_pattern = r'^---\s*\n(.*?)\n---'
        match = re.search(yaml_pattern, content, re.DOTALL)

        if not match:
            self.issues["critical"].append("❌ YAML frontmatter 누락")
            return

        yaml_content = match.group(1)

        # name 체크
        if not re.search(r'name:\s*\S+', yaml_content):
            self.issues["critical"].append("❌ YAML: name 필드 누락")
        else:
            name_match = re.search(r'name:\s*(\S+)', yaml_content)
            if name_match:
                name = name_match.group(1)
                self.metrics['frontmatter_name'] = name

                # name이 디렉토리명과 일치하는지 확인
                if name != self.skill_name:
                    self.issues["warning"].append(
                        f"⚠️  YAML name ({name}) != 디렉토리명 ({self.skill_name})"
                    )

        # description 체크
        if not re.search(r'description:\s*\S+', yaml_content):
            self.issues["critical"].append("❌ YAML: description 필드 누락")
        else:
            desc_match = re.search(r'description:\s*(.+)$', yaml_content, re.MULTILINE)
            if desc_match:
                description = desc_match.group(1).strip()
                desc_length = len(description)
                self.metrics['description_length'] = desc_length

                if desc_length < 30:
                    self.issues["warning"].append(
                        f"⚠️  description 너무 짧음: {desc_length}자 (권장: 30-100자)"
                    )
                elif desc_length > 150:
                    self.issues["warning"].append(
                        f"⚠️  description 너무 김: {desc_length}자 (권장: 30-100자)"
                    )
                else:
                    self.issues["info"].append(
                        f"✅ description 적정: {desc_length}자"
                    )

    def _check_registration(self):
        """skill-rules.json 등록 확인"""
        skill_rules_path = self.skill_path.parent / "skill-rules.json"

        if not skill_rules_path.exists():
            self.issues["warning"].append(
                f"⚠️  skill-rules.json 없음: {skill_rules_path}"
            )
            return

        with open(skill_rules_path, 'r', encoding='utf-8') as f:
            try:
                rules = json.load(f)
            except json.JSONDecodeError as e:
                self.issues["critical"].append(
                    f"❌ skill-rules.json 파싱 실패: {e}"
                )
                return

        # skills 섹션에서 현재 스킬 찾기
        if 'skills' not in rules:
            self.issues["warning"].append("⚠️  skill-rules.json에 'skills' 섹션 없음")
            return

        if self.skill_name not in rules['skills']:
            self.issues["critical"].append(
                f"❌ skill-rules.json에 미등록: {self.skill_name}"
            )
            return

        # 등록된 경우 트리거 정보 확인
        skill_config = rules['skills'][self.skill_name]
        self.issues["info"].append("✅ skill-rules.json 등록됨")

        # 트리거 체크
        if 'promptTriggers' in skill_config:
            triggers = skill_config['promptTriggers']
            keyword_count = len(triggers.get('keywords', []))
            pattern_count = len(triggers.get('intentPatterns', []))

            if keyword_count == 0 and pattern_count == 0:
                self.issues["warning"].append(
                    "⚠️  트리거 없음 (keywords 또는 intentPatterns 필요)"
                )
            else:
                self.issues["info"].append(
                    f"✅ 트리거: {keyword_count}개 키워드, {pattern_count}개 패턴"
                )
        else:
            self.issues["warning"].append("⚠️  promptTriggers 없음")

    def _check_structure(self):
        """디렉토리 구조 확인"""
        # 선택적 디렉토리
        optional_dirs = ['scripts', 'references', 'resources', 'assets']
        found_dirs = []

        for dir_name in optional_dirs:
            dir_path = self.skill_path / dir_name
            if dir_path.exists() and dir_path.is_dir():
                file_count = len(list(dir_path.iterdir()))
                found_dirs.append(f"{dir_name}/ ({file_count}개 파일)")

        if found_dirs:
            self.issues["info"].append(
                f"📁 번들 리소스: {', '.join(found_dirs)}"
            )

        self.metrics['has_bundled_resources'] = len(found_dirs) > 0

    def _build_report(self) -> Dict:
        """진단 보고서 생성"""
        return {
            "plugin": self.plugin_name,
            "skill": self.skill_name,
            "path": str(self.skill_path),
            "metrics": self.metrics,
            "issues": self.issues,
            "status": self._get_status()
        }

    def _get_status(self) -> str:
        """전체 상태 판정"""
        if self.issues["critical"]:
            return "critical"
        elif self.issues["warning"]:
            return "warning"
        else:
            return "healthy"


def print_report(report: Dict):
    """보고서 출력"""
    print(f"\n{'='*70}")
    print(f"스킬: {report['plugin']}/{report['skill']}")
    print(f"{'='*70}")

    # 메트릭
    metrics = report['metrics']
    if metrics:
        print("\n📊 메트릭:")
        if 'line_count' in metrics:
            print(f"  라인 수: {metrics['line_count']}줄")
            print(f"  토큰 추정: ~{metrics['token_estimate']:,} 토큰")
        if 'description_length' in metrics:
            print(f"  description: {metrics['description_length']}자")
        if 'has_bundled_resources' in metrics:
            print(f"  번들 리소스: {'있음' if metrics['has_bundled_resources'] else '없음'}")

    # 이슈
    issues = report['issues']

    if issues['critical']:
        print("\n🚨 Critical Issues:")
        for issue in issues['critical']:
            print(f"  {issue}")

    if issues['warning']:
        print("\n⚠️  Warnings:")
        for issue in issues['warning']:
            print(f"  {issue}")

    if issues['info']:
        print("\n✅ Info:")
        for issue in issues['info']:
            print(f"  {issue}")

    # 상태
    status = report['status']
    status_emoji = {
        "healthy": "✅ 건강함",
        "warning": "⚠️  주의 필요",
        "critical": "🚨 수정 필요"
    }
    print(f"\n📋 종합 상태: {status_emoji.get(status, status)}")
    print(f"{'='*70}\n")


def main():
    """메인 함수"""
    if len(sys.argv) < 2:
        print("Usage: python diagnose_skill.py <plugin>/<skill-name>")
        print("Example: python diagnose_skill.py tool-creators/skill-developer")
        sys.exit(1)

    # 인자 파싱
    path_arg = sys.argv[1]
    parts = path_arg.split('/')

    if len(parts) != 2:
        print("Error: 형식은 '<plugin>/<skill-name>' 이어야 합니다")
        sys.exit(1)

    plugin_name, skill_name = parts
    skill_path = PROJECT_ROOT / "plugins" / plugin_name / "skills" / skill_name

    if not skill_path.exists():
        print(f"Error: 스킬 디렉토리를 찾을 수 없습니다: {skill_path}")
        sys.exit(1)

    # 진단 실행
    diagnostic = SkillDiagnostic(skill_path)
    report = diagnostic.diagnose()

    # 보고서 출력
    print_report(report)

    # JSON 출력 옵션
    if "--json" in sys.argv:
        print("\n📄 JSON 출력:")
        print(json.dumps(report, indent=2, ensure_ascii=False))

    # 종료 코드
    if report['status'] == 'critical':
        sys.exit(1)
    elif report['status'] == 'warning':
        sys.exit(0)  # Warning은 에러로 취급 안 함
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
