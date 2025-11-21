#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Complexity analysis for default workflow recommendation
function analyzeComplexity(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const length = prompt.length;

    // Keywords for parallel execution
    const parallelKeywords = ['여러', '동시', '병렬', 'parallel', 'concurrent', '각각', '모두', '전부'];
    const hasParallelIntent = parallelKeywords.some(kw => lowerPrompt.includes(kw));

    // Keywords for complex/orchestration
    const complexKeywords = ['복잡', '전체', '통합', '대규모', 'complex', 'full', 'entire', '시스템', '아키텍처'];
    const hasComplexIntent = complexKeywords.some(kw => lowerPrompt.includes(kw));

    // Keywords for simple sequential
    const simpleKeywords = ['간단', '단순', '하나', 'simple', 'single', 'quick', '빠르게'];
    const hasSimpleIntent = simpleKeywords.some(kw => lowerPrompt.includes(kw));

    // Decision logic
    if (hasSimpleIntent || length < 50) {
        return {
            skill: 'sequential-task-processor',
            reason: '간단한 순차 작업에 적합'
        };
    }

    if (hasParallelIntent) {
        return {
            skill: 'parallel-task-executor',
            reason: '독립 작업 병렬 처리에 최적'
        };
    }

    if (hasComplexIntent || length > 200) {
        return {
            skill: 'dynamic-task-orchestrator',
            reason: '복잡한 프로젝트 조율에 적합'
        };
    }

    // Default
    return {
        skill: 'agent-workflow-manager',
        reason: '자동 워크플로우 분석 및 실행'
    };
}

async function main() {
    try {
        // Read input from stdin
        const input = fs.readFileSync(0, 'utf-8');
        if (!input) return;

        const data = JSON.parse(input);
        const prompt = data.prompt ? data.prompt.toLowerCase() : '';
        const originalPrompt = data.prompt || '';

        if (!originalPrompt) return;

        // Load skill rules - check multiple locations
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

        // Plugin paths (when running as installed plugin)
        const pluginRulesPath = pluginRoot ? path.join(pluginRoot, 'skills', 'skill-rules.json') : '';

        // Legacy paths (for backward compatibility and local development)
        const globalRulesPath = path.join(homeDir, '.claude', 'skills', 'skill-rules.json');
        const projectRulesPath = path.join(data.cwd || process.cwd(), '.claude', 'skills', 'skill-rules.json');

        // Priority: project > plugin > global
        let rulesPath = '';
        if (fs.existsSync(projectRulesPath)) {
            rulesPath = projectRulesPath;
        } else if (pluginRulesPath && fs.existsSync(pluginRulesPath)) {
            rulesPath = pluginRulesPath;
        } else if (fs.existsSync(globalRulesPath)) {
            rulesPath = globalRulesPath;
        } else {
            // No rules found anywhere, exit silently
            process.exit(0);
        }

        const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

        // Load enhancement rules
        const pluginEnhancementPath = pluginRoot ? path.join(pluginRoot, 'skills', 'prompt-enhancement-rules.json') : '';
        const projectEnhancementPath = path.join(data.cwd || process.cwd(), '.claude', 'skills', 'prompt-enhancement-rules.json');
        const globalEnhancementPath = path.join(homeDir, '.claude', 'skills', 'prompt-enhancement-rules.json');

        let enhancementRules = null;
        let enhancementRulesPath = '';

        if (fs.existsSync(projectEnhancementPath)) {
            enhancementRulesPath = projectEnhancementPath;
        } else if (pluginEnhancementPath && fs.existsSync(pluginEnhancementPath)) {
            enhancementRulesPath = pluginEnhancementPath;
        } else if (fs.existsSync(globalEnhancementPath)) {
            enhancementRulesPath = globalEnhancementPath;
        }

        if (enhancementRulesPath) {
            enhancementRules = JSON.parse(fs.readFileSync(enhancementRulesPath, 'utf-8'));
        }

        const matchedSkills = [];
        const matchedEnhancements = [];

        // Check each skill for matches
        if (rules.skills) {
            for (const [skillName, config] of Object.entries(rules.skills)) {
                const triggers = config.promptTriggers;
                if (!triggers) {
                    continue;
                }

                // Keyword matching
                if (triggers.keywords) {
                    const keywordMatch = triggers.keywords.some(kw =>
                        prompt.includes(kw.toLowerCase())
                    );
                    if (keywordMatch) {
                        matchedSkills.push({ name: skillName, matchType: 'keyword', config });
                        continue;
                    }
                }

                // Intent pattern matching
                if (triggers.intentPatterns) {
                    const intentMatch = triggers.intentPatterns.some(pattern => {
                        try {
                            const regex = new RegExp(pattern, 'i');
                            return regex.test(prompt);
                        } catch (e) {
                            return false;
                        }
                    });
                    if (intentMatch) {
                        matchedSkills.push({ name: skillName, matchType: 'intent', config });
                    }
                }
            }
        }

        // Check enhancement rules
        if (enhancementRules && enhancementRules.enhancementRules) {
            for (const [ruleName, rule] of Object.entries(enhancementRules.enhancementRules)) {
                const patternMatch = rule.patterns.some(pattern =>
                    prompt.includes(pattern.toLowerCase())
                );
                if (patternMatch) {
                    matchedEnhancements.push({
                        ruleName,
                        suggestions: rule.suggestions,
                        relatedSkill: rule.relatedSkill,
                        priority: rule.priority
                    });
                }
            }
        }


        // Generate output if matches found
        if (matchedSkills.length > 0 || matchedEnhancements.length > 0) {
            let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            output += '🎯 SKILL ACTIVATION CHECK\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

            // Group skills by priority
            if (matchedSkills.length > 0) {
                const critical = matchedSkills.filter(s => s.config.priority === 'critical');
                const high = matchedSkills.filter(s => s.config.priority === 'high');
                const medium = matchedSkills.filter(s => s.config.priority === 'medium');
                const low = matchedSkills.filter(s => s.config.priority === 'low');

                if (critical.length > 0) {
                    output += '⚠️ CRITICAL SKILLS (REQUIRED):\n';
                    critical.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                if (high.length > 0) {
                    output += '📚 RECOMMENDED SKILLS:\n';
                    high.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                if (medium.length > 0) {
                    output += '💡 SUGGESTED SKILLS:\n';
                    medium.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                if (low.length > 0) {
                    output += '📌 OPTIONAL SKILLS:\n';
                    low.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }
            }

            // Add context enhancements
            if (matchedEnhancements.length > 0) {
                // Deduplicate suggestions
                const allSuggestions = new Set();
                matchedEnhancements.forEach(e => {
                    if (e.suggestions) {
                        e.suggestions.forEach(s => allSuggestions.add(s));
                    }
                });

                if (allSuggestions.size > 0) {
                    output += '📝 CONTEXT ENHANCEMENT:\n';
                    // Limit to top 5 suggestions
                    const suggestions = Array.from(allSuggestions).slice(0, 5);
                    suggestions.forEach(s => output += `  → ${s}\n`);
                    output += '\n';
                }
            }

            output += 'ACTION: Use Skill tool BEFORE responding\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

            console.log(output);
        } else if (originalPrompt.length > 20) {
            // No matches found - recommend default workflow based on complexity
            const recommendation = analyzeComplexity(originalPrompt);

            let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            output += '🎯 SKILL ACTIVATION CHECK\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
            output += '💡 DEFAULT WORKFLOW RECOMMENDATION:\n';
            output += `  → ${recommendation.skill}\n`;
            output += `    (${recommendation.reason})\n\n`;
            output += 'TIP: /auto-workflow 커맨드로 자동 분석 실행 가능\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

            console.log(output);
        }

        process.exit(0);
    } catch (err) {
        // Fail silently to not disrupt the user
        process.exit(0);
    }
}

main();
