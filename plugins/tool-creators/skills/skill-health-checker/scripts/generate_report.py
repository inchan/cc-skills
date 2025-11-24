#!/usr/bin/env python3
"""
마크다운 리포트 생성 스크립트
진단 결과를 읽기 쉬운 마크다운 형식으로 변환합니다.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict


def generate_markdown_report(report_data: Dict, output_path: Path):
    """마크다운 리포트 생성"""
    md_lines = []

    # 헤더
    md_lines.append("# 스킬 건강도 리포트\n")
    md_lines.append(f"**생성 시각**: {report_data['timestamp']}\n")
    md_lines.append(f"**프로젝트**: `{report_data['project_root']}`\n")
    md_lines.append("---\n")

    # 요약
    summary = report_data['summary']
    md_lines.append("## 📊 요약\n")
    md_lines.append(f"- **총 스킬**: {summary['total']}개\n")
    md_lines.append(f"- ✅ **건강함**: {summary['healthy']}개\n")
    md_lines.append(f"- ⚠️  **주의**: {summary['warning']}개\n")
    md_lines.append(f"- 🚨 **수정 필요**: {summary['critical']}개\n")
    md_lines.append("\n---\n")

    # Critical 스킬 상세
    results = report_data['results']
    critical_skills = [r for r in results if r['status'] == 'critical']

    if critical_skills:
        md_lines.append("## 🚨 수정 필요한 스킬\n")
        for r in critical_skills:
            md_lines.append(f"### {r['plugin']}/{r['skill']}\n")
            md_lines.append(f"**경로**: `{r['path']}`\n")

            # 메트릭
            if r['metrics']:
                md_lines.append("\n**메트릭**:\n")
                for key, value in r['metrics'].items():
                    md_lines.append(f"- {key}: {value}\n")

            # Critical 이슈
            md_lines.append("\n**Critical Issues**:\n")
            for issue in r['issues']['critical']:
                md_lines.append(f"- {issue}\n")

            # Warning 이슈
            if r['issues']['warning']:
                md_lines.append("\n**Warnings**:\n")
                for issue in r['issues']['warning']:
                    md_lines.append(f"- {issue}\n")

            md_lines.append("\n")

        md_lines.append("---\n")

    # 500줄 초과 스킬
    over_500 = [r for r in results if r['metrics'].get('line_count', 0) > 500]
    if over_500:
        md_lines.append("## 📏 500줄 초과 스킬\n")
        md_lines.append("| 플러그인 | 스킬 | 라인 수 | 초과 | 토큰 추정 |\n")
        md_lines.append("|---------|------|---------|------|----------|\n")

        for r in sorted(over_500, key=lambda x: x['metrics']['line_count'], reverse=True):
            line_count = r['metrics']['line_count']
            excess = line_count - 500
            token_estimate = r['metrics']['token_estimate']
            md_lines.append(
                f"| {r['plugin']} | {r['skill']} | {line_count} | +{excess} | ~{token_estimate:,} |\n"
            )

        md_lines.append("\n---\n")

    # Warning 스킬
    warning_skills = [r for r in results if r['status'] == 'warning']
    if warning_skills:
        md_lines.append("## ⚠️  주의가 필요한 스킬\n")
        for r in warning_skills[:10]:  # 처음 10개만
            md_lines.append(f"### {r['plugin']}/{r['skill']}\n")

            # Warning 이슈
            for issue in r['issues']['warning']:
                md_lines.append(f"- {issue}\n")

            md_lines.append("\n")

        if len(warning_skills) > 10:
            md_lines.append(f"\n...(외 {len(warning_skills) - 10}개)\n")

        md_lines.append("---\n")

    # 건강한 스킬 (간략)
    healthy_skills = [r for r in results if r['status'] == 'healthy']
    if healthy_skills:
        md_lines.append("## ✅ 건강한 스킬\n")
        md_lines.append(f"총 {len(healthy_skills)}개 스킬이 모든 기준을 통과했습니다.\n")

        # 플러그인별 그룹핑
        by_plugin = {}
        for r in healthy_skills:
            plugin = r['plugin']
            if plugin not in by_plugin:
                by_plugin[plugin] = []
            by_plugin[plugin].append(r['skill'])

        for plugin, skills in sorted(by_plugin.items()):
            md_lines.append(f"\n**{plugin}** ({len(skills)}개):\n")
            for skill in sorted(skills):
                md_lines.append(f"- {skill}\n")

        md_lines.append("\n---\n")

    # 액션 아이템
    md_lines.append("## 📋 액션 아이템\n")

    if critical_skills:
        md_lines.append("\n### 우선순위 1 (Critical)\n")
        for r in critical_skills:
            md_lines.append(f"- [ ] **{r['plugin']}/{r['skill']}**: ")
            md_lines.append(f"{r['issues']['critical'][0]}\n")

    if over_500:
        md_lines.append("\n### 우선순위 2 (500줄 초과)\n")
        for r in over_500:
            line_count = r['metrics']['line_count']
            md_lines.append(f"- [ ] **{r['plugin']}/{r['skill']}**: ")
            md_lines.append(f"{line_count}줄 → 500줄 이하로 리팩토링\n")

    if warning_skills:
        md_lines.append("\n### 우선순위 3 (Warning)\n")
        for r in warning_skills[:5]:
            md_lines.append(f"- [ ] **{r['plugin']}/{r['skill']}**: ")
            md_lines.append(f"{r['issues']['warning'][0]}\n")

    md_lines.append("\n---\n")

    # 푸터
    md_lines.append(f"\n*Generated by skill-health-checker on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")

    # 파일 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(md_lines)

    print(f"📄 마크다운 리포트 생성: {output_path}")


def main():
    """메인 함수 (JSON에서 마크다운 생성)"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python generate_report.py <json-report-path> [output-md-path]")
        sys.exit(1)

    json_path = Path(sys.argv[1])
    if not json_path.exists():
        print(f"Error: JSON 파일을 찾을 수 없습니다: {json_path}")
        sys.exit(1)

    # 출력 경로
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        output_path = json_path.with_suffix('.md')

    # JSON 로드
    with open(json_path, 'r', encoding='utf-8') as f:
        report_data = json.load(f)

    # 마크다운 생성
    generate_markdown_report(report_data, output_path)


if __name__ == "__main__":
    main()
