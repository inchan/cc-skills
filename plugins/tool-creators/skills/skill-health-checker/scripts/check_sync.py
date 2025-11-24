#!/usr/bin/env python3
"""
skill-rules.json 동기화 체크 스크립트
실제 스킬 디렉토리와 skill-rules.json 등록 상태를 비교합니다.
"""

import sys
import json
from pathlib import Path
from typing import Dict, List, Set

# 프로젝트 루트 경로
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent.parent


def find_skill_directories(plugin_path: Path) -> Set[str]:
    """플러그인의 실제 스킬 디렉토리 찾기"""
    skills_dir = plugin_path / "skills"
    if not skills_dir.exists():
        return set()

    skill_names = set()
    for item in skills_dir.iterdir():
        # skill-rules.json은 제외
        if item.name == "skill-rules.json":
            continue

        # 디렉토리이고 SKILL.md가 있는 경우만
        if item.is_dir() and (item / "SKILL.md").exists():
            skill_names.add(item.name)

    return skill_names


def load_skill_rules(plugin_path: Path) -> Dict:
    """skill-rules.json 로드"""
    rules_path = plugin_path / "skills" / "skill-rules.json"

    if not rules_path.exists():
        return {"skills": {}}

    try:
        with open(rules_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON 파싱 실패: {rules_path}: {e}")
        return {"skills": {}}


def check_plugin_sync(plugin_path: Path) -> Dict:
    """단일 플러그인의 동기화 상태 체크"""
    plugin_name = plugin_path.name

    # 실제 스킬 디렉토리
    actual_skills = find_skill_directories(plugin_path)

    # skill-rules.json에 등록된 스킬
    rules = load_skill_rules(plugin_path)
    registered_skills = set(rules.get("skills", {}).keys())

    # 비교
    missing_in_rules = actual_skills - registered_skills  # 디렉토리는 있으나 미등록
    extra_in_rules = registered_skills - actual_skills     # 등록은 되었으나 디렉토리 없음

    return {
        "plugin": plugin_name,
        "actual_skills": sorted(actual_skills),
        "registered_skills": sorted(registered_skills),
        "missing_in_rules": sorted(missing_in_rules),
        "extra_in_rules": sorted(extra_in_rules),
        "in_sync": len(missing_in_rules) == 0 and len(extra_in_rules) == 0
    }


def check_all_plugins() -> List[Dict]:
    """모든 플러그인 동기화 체크"""
    plugins_dir = PROJECT_ROOT / "plugins"
    results = []

    if not plugins_dir.exists():
        print(f"Error: plugins 디렉토리를 찾을 수 없습니다: {plugins_dir}")
        return results

    for plugin_dir in sorted(plugins_dir.iterdir()):
        if not plugin_dir.is_dir() or plugin_dir.name.startswith('.'):
            continue

        # skills 디렉토리가 있는 플러그인만
        if not (plugin_dir / "skills").exists():
            continue

        result = check_plugin_sync(plugin_dir)
        results.append(result)

    return results


def print_sync_report(results: List[Dict]):
    """동기화 리포트 출력"""
    print(f"\n{'='*70}")
    print("📝 skill-rules.json 동기화 리포트")
    print(f"{'='*70}\n")

    total_plugins = len(results)
    in_sync_count = sum(1 for r in results if r['in_sync'])
    out_of_sync_count = total_plugins - in_sync_count

    print(f"총 플러그인: {total_plugins}개")
    print(f"  ✅ 동기화됨: {in_sync_count}개")
    print(f"  ⚠️  불일치: {out_of_sync_count}개\n")

    # 불일치 플러그인 상세
    for result in results:
        if result['in_sync']:
            continue

        print(f"{'='*70}")
        print(f"플러그인: {result['plugin']}")
        print(f"{'='*70}")

        if result['missing_in_rules']:
            print(f"\n🚨 미등록 스킬 ({len(result['missing_in_rules'])}개):")
            print("  (디렉토리는 있으나 skill-rules.json에 없음)\n")
            for skill in result['missing_in_rules']:
                print(f"  - {skill}")
                print(f"    📁 plugins/{result['plugin']}/skills/{skill}/")
                print(f"    💡 skill-rules.json에 추가 필요\n")

        if result['extra_in_rules']:
            print(f"\n⚠️  등록만 된 스킬 ({len(result['extra_in_rules'])}개):")
            print("  (skill-rules.json에는 있으나 디렉토리 없음)\n")
            for skill in result['extra_in_rules']:
                print(f"  - {skill}")
                print(f"    💡 skill-rules.json에서 제거 또는 디렉토리 생성\n")

    # 전체 요약
    print(f"\n{'='*70}")
    print("📊 전체 요약")
    print(f"{'='*70}\n")

    all_missing = []
    all_extra = []
    for result in results:
        for skill in result['missing_in_rules']:
            all_missing.append(f"{result['plugin']}/{skill}")
        for skill in result['extra_in_rules']:
            all_extra.append(f"{result['plugin']}/{skill}")

    if all_missing:
        print(f"🚨 전체 미등록: {len(all_missing)}개")
        for item in all_missing:
            print(f"  - {item}")
        print()

    if all_extra:
        print(f"⚠️  전체 등록만: {len(all_extra)}개")
        for item in all_extra:
            print(f"  - {item}")
        print()

    if not all_missing and not all_extra:
        print("✅ 모든 플러그인이 동기화되었습니다!\n")


def generate_auto_fix_suggestion(results: List[Dict]):
    """자동 수정 제안 생성"""
    all_missing = []
    for result in results:
        for skill in result['missing_in_rules']:
            all_missing.append({
                "plugin": result['plugin'],
                "skill": skill
            })

    if not all_missing:
        return

    print(f"\n{'='*70}")
    print("💡 자동 수정 제안")
    print(f"{'='*70}\n")

    print("다음 스킬을 skill-rules.json에 추가할 수 있습니다:\n")

    for item in all_missing:
        plugin = item['plugin']
        skill = item['skill']
        print(f"# {plugin}/{skill}")
        print('```json')
        print(f'"{skill}": {{')
        print('  "type": "domain",')
        print('  "enforcement": "suggest",')
        print('  "priority": "medium",')
        print('  "promptTriggers": {')
        print('    "keywords": [],')
        print('    "intentPatterns": []')
        print('  }')
        print('}')
        print('```\n')


def main():
    """메인 함수"""
    results = check_all_plugins()

    if not results:
        print("스킬이 있는 플러그인을 찾을 수 없습니다.")
        sys.exit(1)

    # 리포트 출력
    print_sync_report(results)

    # 자동 수정 제안
    if "--suggest" in sys.argv:
        generate_auto_fix_suggestion(results)

    # JSON 저장
    if "--json" in sys.argv:
        output_path = PROJECT_ROOT / "tests" / "skill-sync-report.json"
        output_path.parent.mkdir(exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"📄 JSON 리포트 저장: {output_path}\n")

    # 종료 코드
    has_issues = any(not r['in_sync'] for r in results)
    sys.exit(1 if has_issues else 0)


if __name__ == "__main__":
    main()
