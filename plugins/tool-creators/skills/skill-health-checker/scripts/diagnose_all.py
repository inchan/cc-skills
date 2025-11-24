#!/usr/bin/env python3
"""
전체 스킬 배치 진단 스크립트
모든 플러그인의 스킬을 스캔하여 건강도 리포트를 생성합니다.
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List

# diagnose_skill 모듈 임포트
sys.path.insert(0, str(Path(__file__).parent))
from diagnose_skill import SkillDiagnostic

# 프로젝트 루트 경로
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent.parent


def find_all_skills() -> List[Path]:
    """모든 플러그인의 스킬 디렉토리 찾기"""
    skills = []
    plugins_dir = PROJECT_ROOT / "plugins"

    if not plugins_dir.exists():
        print(f"Error: plugins 디렉토리를 찾을 수 없습니다: {plugins_dir}")
        return skills

    # 각 플러그인 순회
    for plugin_dir in sorted(plugins_dir.iterdir()):
        if not plugin_dir.is_dir() or plugin_dir.name.startswith('.'):
            continue

        skills_dir = plugin_dir / "skills"
        if not skills_dir.exists():
            continue

        # 각 스킬 순회
        for skill_dir in sorted(skills_dir.iterdir()):
            # skill-rules.json은 제외
            if skill_dir.name == "skill-rules.json":
                continue

            if not skill_dir.is_dir():
                continue

            # SKILL.md가 있는지 확인
            if (skill_dir / "SKILL.md").exists():
                skills.append(skill_dir)

    return skills


def diagnose_all_skills() -> Dict:
    """모든 스킬 진단"""
    skills = find_all_skills()
    total_skills = len(skills)

    print(f"\n🔍 발견된 스킬: {total_skills}개")
    print(f"📁 스캔 디렉토리: {PROJECT_ROOT / 'plugins'}")
    print("="*70)

    results = []
    summary = {
        "healthy": 0,
        "warning": 0,
        "critical": 0,
        "total": total_skills
    }

    for i, skill_path in enumerate(skills, 1):
        print(f"\n[{i}/{total_skills}] {skill_path.parent.parent.name}/{skill_path.name}")

        diagnostic = SkillDiagnostic(skill_path)
        report = diagnostic.diagnose()
        results.append(report)

        # 상태 카운트
        status = report['status']
        summary[status] = summary.get(status, 0) + 1

        # 간단한 상태 표시
        status_icon = {
            "healthy": "✅",
            "warning": "⚠️ ",
            "critical": "🚨"
        }
        print(f"  → {status_icon.get(status, '?')} {status}")

    return {
        "timestamp": datetime.now().isoformat(),
        "project_root": str(PROJECT_ROOT),
        "summary": summary,
        "results": results
    }


def print_summary(report: Dict):
    """요약 리포트 출력"""
    summary = report['summary']
    results = report['results']

    print(f"\n{'='*70}")
    print("📊 전체 스킬 건강도 요약")
    print(f"{'='*70}")

    print(f"\n총 스킬: {summary['total']}개")
    print(f"  ✅ 건강함: {summary['healthy']}개")
    print(f"  ⚠️  주의: {summary['warning']}개")
    print(f"  🚨 수정 필요: {summary['critical']}개")

    # Critical 스킬 목록
    critical_skills = [r for r in results if r['status'] == 'critical']
    if critical_skills:
        print(f"\n🚨 수정 필요한 스킬 ({len(critical_skills)}개):")
        for r in critical_skills:
            print(f"  - {r['plugin']}/{r['skill']}")
            for issue in r['issues']['critical'][:2]:  # 처음 2개만
                print(f"    {issue}")

    # Warning 스킬 목록
    warning_skills = [r for r in results if r['status'] == 'warning']
    if warning_skills:
        print(f"\n⚠️  주의가 필요한 스킬 ({len(warning_skills)}개):")
        for r in warning_skills[:5]:  # 처음 5개만
            print(f"  - {r['plugin']}/{r['skill']}")

    # 500줄 초과 통계
    over_500 = [r for r in results if r['metrics'].get('line_count', 0) > 500]
    if over_500:
        print(f"\n📏 500줄 초과 스킬 ({len(over_500)}개):")
        for r in sorted(over_500, key=lambda x: x['metrics']['line_count'], reverse=True):
            line_count = r['metrics']['line_count']
            excess = line_count - 500
            print(f"  - {r['plugin']}/{r['skill']}: {line_count}줄 (+{excess})")

    # 미등록 스킬 통계
    unregistered = []
    for r in results:
        if any("미등록" in issue for issue in r['issues']['critical']):
            unregistered.append(r)

    if unregistered:
        print(f"\n📝 skill-rules.json 미등록 ({len(unregistered)}개):")
        for r in unregistered:
            print(f"  - {r['plugin']}/{r['skill']}")

    print(f"\n{'='*70}\n")


def save_json_report(report: Dict, output_path: Path):
    """JSON 리포트 저장"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"📄 JSON 리포트 저장: {output_path}")


def main():
    """메인 함수"""
    # 진단 실행
    report = diagnose_all_skills()

    # 요약 출력
    print_summary(report)

    # JSON 저장
    output_path = PROJECT_ROOT / "tests" / "skill-health-report.json"
    output_path.parent.mkdir(exist_ok=True)
    save_json_report(report, output_path)

    # Markdown 리포트 생성 옵션
    if "--markdown" in sys.argv:
        from generate_report import generate_markdown_report
        md_path = PROJECT_ROOT / "tests" / "skill-health-report.md"
        generate_markdown_report(report, md_path)

    # 종료 코드
    summary = report['summary']
    if summary['critical'] > 0:
        print(f"\n⚠️  {summary['critical']}개 스킬이 수정 필요합니다.")
        sys.exit(1)
    else:
        print("\n✅ 모든 스킬이 건강합니다!")
        sys.exit(0)


if __name__ == "__main__":
    main()
