#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Function to detect repo from file path
function detectRepo(filePath, projectRoot) {
    const relativePath = path.relative(projectRoot, filePath);
    const parts = relativePath.split(path.sep);
    const repo = parts[0];

    if (!repo) return 'unknown';

    // Common project directory patterns
    const patterns = {
        frontend: ['frontend', 'client', 'web', 'app', 'ui'],
        backend: ['backend', 'server', 'api', 'src', 'services'],
        database: ['database', 'prisma', 'migrations']
    };

    if (patterns.frontend.includes(repo)) return repo;
    if (patterns.backend.includes(repo)) return repo;
    if (patterns.database.includes(repo)) return repo;

    // Package/monorepo structure
    if (repo === 'packages' && parts[1]) {
        return `packages/${parts[1]}`;
    }

    // Examples directory
    if (repo === 'examples' && parts[1]) {
        return `examples/${parts[1]}`;
    }

    // Check if it's a source file in root (no directory)
    if (parts.length === 1) {
        return 'root';
    }

    return 'unknown';
}

// Function to get build command for repo
function getBuildCommand(repo, projectRoot) {
    const repoPath = path.join(projectRoot, repo);
    const packageJsonPath = path.join(repoPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (packageJson.scripts && packageJson.scripts.build) {
                if (fs.existsSync(path.join(repoPath, 'pnpm-lock.yaml'))) {
                    return `cd ${repoPath} && pnpm build`;
                } else if (fs.existsSync(path.join(repoPath, 'package-lock.json'))) {
                    return `cd ${repoPath} && npm run build`;
                } else if (fs.existsSync(path.join(repoPath, 'yarn.lock'))) {
                    return `cd ${repoPath} && yarn build`;
                } else {
                    return `cd ${repoPath} && npm run build`;
                }
            }
        } catch (e) {
            // Ignore error
        }
    }

    // Special case for database with Prisma
    if (repo === 'database' || repo.includes('prisma')) {
        if (fs.existsSync(path.join(repoPath, 'schema.prisma')) ||
            fs.existsSync(path.join(repoPath, 'prisma', 'schema.prisma'))) {
            return `cd ${repoPath} && npx prisma generate`;
        }
    }

    return '';
}

// Function to get TSC command for repo
function getTscCommand(repo, projectRoot) {
    const repoPath = path.join(projectRoot, repo);

    if (fs.existsSync(path.join(repoPath, 'tsconfig.json'))) {
        if (fs.existsSync(path.join(repoPath, 'tsconfig.app.json'))) {
            return `cd ${repoPath} && npx tsc --project tsconfig.app.json --noEmit`;
        } else {
            return `cd ${repoPath} && npx tsc --noEmit`;
        }
    }

    return '';
}

async function main() {
    try {
        // Read tool information from stdin
        const input = fs.readFileSync(0, 'utf-8');
        if (!input) return;

        const toolInfo = JSON.parse(input);

        // Extract relevant data
        const toolName = toolInfo.tool_name;
        const filePath = toolInfo.tool_input ? toolInfo.tool_input.file_path : null;
        const sessionId = toolInfo.session_id || 'default';
        const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

        // Skip if not an edit tool or no file path
        if (!['Edit', 'MultiEdit', 'Write'].includes(toolName) || !filePath) {
            process.exit(0);
        }

        // Skip markdown files
        if (filePath.endsWith('.md') || filePath.endsWith('.markdown')) {
            process.exit(0);
        }

        // Create cache directory in project
        const cacheDir = path.join(projectRoot, '.claude', 'tsc-cache', sessionId);
        fs.mkdirSync(cacheDir, { recursive: true });

        // Detect repo
        const repo = detectRepo(filePath, projectRoot);

        // Skip if unknown repo
        if (repo === 'unknown' || !repo) {
            process.exit(0);
        }

        // Log edited file
        const logEntry = `${Math.floor(Date.now() / 1000)}:${filePath}:${repo}\n`;
        fs.appendFileSync(path.join(cacheDir, 'edited-files.log'), logEntry);

        // Update affected repos list
        const affectedReposPath = path.join(cacheDir, 'affected-repos.txt');
        let affectedRepos = [];
        if (fs.existsSync(affectedReposPath)) {
            affectedRepos = fs.readFileSync(affectedReposPath, 'utf-8').split('\n').filter(Boolean);
        }

        if (!affectedRepos.includes(repo)) {
            fs.appendFileSync(affectedReposPath, `${repo}\n`);
        }

        // Store build commands
        const buildCmd = getBuildCommand(repo, projectRoot);
        const tscCmd = getTscCommand(repo, projectRoot);
        const commandsPath = path.join(cacheDir, 'commands.txt');

        let existingCommands = [];
        if (fs.existsSync(commandsPath)) {
            existingCommands = fs.readFileSync(commandsPath, 'utf-8').split('\n').filter(Boolean);
        }

        if (buildCmd) {
            const cmdEntry = `${repo}:build:${buildCmd}`;
            if (!existingCommands.includes(cmdEntry)) {
                fs.appendFileSync(commandsPath, `${cmdEntry}\n`);
                existingCommands.push(cmdEntry);
            }
        }

        if (tscCmd) {
            const cmdEntry = `${repo}:tsc:${tscCmd}`;
            if (!existingCommands.includes(cmdEntry)) {
                fs.appendFileSync(commandsPath, `${cmdEntry}\n`);
            }
        }

        process.exit(0);
    } catch (err) {
        // Fail silently
        process.exit(0);
    }
}

main();
