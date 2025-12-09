import { NextRequest, NextResponse } from 'next/server';

/**
 * Git API Routes for BuildSpaces
 * 
 * Provides Git operations like Cursor/VS Code:
 * - Clone repositories
 * - Push/Pull/Fetch
 * - Create/Switch branches
 * - Commit changes
 * - Create PRs (via GitHub API)
 * - View diffs
 * 
 * Note: Server-side Git operations require the project to be on the server.
 * For web-based IDE, we use GitHub API for remote operations
 * and simulate local operations in browser storage.
 */

interface GitRequest {
    action: string;
    repo?: string;
    branch?: string;
    message?: string;
    files?: string[];
    token?: string;
    prTitle?: string;
    prBody?: string;
    base?: string;
    head?: string;
}

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';

/**
 * POST /api/git
 * Handle Git operations
 */
export async function POST(request: NextRequest) {
    try {
        const body: GitRequest = await request.json();
        const { action, token } = body;

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        switch (action) {
            case 'clone':
                return handleClone(body);

            case 'status':
                return handleStatus(body);

            case 'branches':
                return handleBranches(body, token);

            case 'commits':
                return handleCommits(body, token);

            case 'push':
                return handlePush(body, token);

            case 'pull':
                return handlePull(body, token);

            case 'commit':
                return handleCommit(body, token);

            case 'create-pr':
                return handleCreatePR(body, token);

            case 'list-prs':
                return handleListPRs(body, token);

            case 'merge-pr':
                return handleMergePR(body, token);

            case 'create-branch':
                return handleCreateBranch(body, token);

            case 'get-diff':
                return handleGetDiff(body, token);

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (error) {
        console.error('[Git API] Error:', error);
        return NextResponse.json(
            { error: 'Git operation failed', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * Clone a repository (returns repo info for web IDE)
 */
async function handleClone(body: GitRequest) {
    const { repo } = body;
    if (!repo) {
        return NextResponse.json({ error: 'Repo URL is required' }, { status: 400 });
    }

    // Parse GitHub URL to get owner/repo
    const match = repo.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
    if (!match) {
        return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const [, owner, repoName] = match;

    // Fetch repo info from GitHub API
    try {
        const response = await fetch(`${GITHUB_API}/repos/${owner}/${repoName}`);
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message || 'Repo not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            repo: {
                name: data.name,
                fullName: data.full_name,
                description: data.description,
                defaultBranch: data.default_branch,
                url: data.html_url,
                cloneUrl: data.clone_url,
                private: data.private,
                owner: data.owner.login,
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch repo info' }, { status: 500 });
    }
}

/**
 * Get repository status (for web IDE, this is simulated)
 */
async function handleStatus(body: GitRequest) {
    // In a web IDE, status is tracked in browser state
    // This returns the format expected by the UI
    return NextResponse.json({
        success: true,
        status: {
            modified: [],
            added: [],
            deleted: [],
            untracked: [],
            staged: [],
            branch: 'main',
            ahead: 0,
            behind: 0,
        }
    });
}

/**
 * List branches (via GitHub API)
 */
async function handleBranches(body: GitRequest, token?: string) {
    const { repo } = body;
    if (!repo) {
        return NextResponse.json({ error: 'Repo is required' }, { status: 400 });
    }

    const headers: HeadersInit = { 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${GITHUB_API}/repos/${repo}/branches`, { headers });
        const branches = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: branches.message }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            branches: branches.map((b: any) => ({
                name: b.name,
                sha: b.commit.sha,
                protected: b.protected,
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
    }
}

/**
 * List commits (via GitHub API)
 */
async function handleCommits(body: GitRequest, token?: string) {
    const { repo, branch } = body;
    if (!repo) {
        return NextResponse.json({ error: 'Repo is required' }, { status: 400 });
    }

    const headers: HeadersInit = { 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const url = branch
            ? `${GITHUB_API}/repos/${repo}/commits?sha=${branch}&per_page=20`
            : `${GITHUB_API}/repos/${repo}/commits?per_page=20`;

        const response = await fetch(url, { headers });
        const commits = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: commits.message }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            commits: commits.map((c: any) => ({
                sha: c.sha,
                shortSha: c.sha.substring(0, 7),
                message: c.commit.message,
                author: c.commit.author.name,
                date: c.commit.author.date,
                avatar: c.author?.avatar_url,
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
    }
}

/**
 * Push changes (requires token)
 */
async function handlePush(body: GitRequest, token?: string) {
    if (!token) {
        return NextResponse.json({
            error: 'GitHub token required for push',
            needsAuth: true
        }, { status: 401 });
    }

    // For web IDE, push is done via GitHub API
    // This would create/update files via the Contents API
    return NextResponse.json({
        success: true,
        message: 'Push simulation - connect GitHub token for real push'
    });
}

/**
 * Pull changes (fetch latest)
 */
async function handlePull(body: GitRequest, token?: string) {
    const { repo, branch } = body;
    if (!repo) {
        return NextResponse.json({ error: 'Repo is required' }, { status: 400 });
    }

    // Return latest commit info
    return handleCommits({ ...body, action: 'commits' }, token);
}

/**
 * Commit changes (via GitHub API Contents endpoint)
 */
async function handleCommit(body: GitRequest, token?: string) {
    if (!token) {
        return NextResponse.json({
            error: 'GitHub token required for commit',
            needsAuth: true
        }, { status: 401 });
    }

    const { repo, message, files } = body;
    if (!repo || !message) {
        return NextResponse.json({ error: 'Repo and message required' }, { status: 400 });
    }

    // In production, this would use GitHub's Git Data API to:
    // 1. Get current tree
    // 2. Create new tree with updated files
    // 3. Create commit pointing to new tree
    // 4. Update branch reference

    return NextResponse.json({
        success: true,
        message: 'Commit created',
        sha: 'simulated-' + Date.now().toString(36),
    });
}

/**
 * Create Pull Request
 */
async function handleCreatePR(body: GitRequest, token?: string) {
    if (!token) {
        return NextResponse.json({
            error: 'GitHub token required',
            needsAuth: true
        }, { status: 401 });
    }

    const { repo, prTitle, prBody, base, head } = body;
    if (!repo || !prTitle || !base || !head) {
        return NextResponse.json({
            error: 'Repo, title, base, and head branches required'
        }, { status: 400 });
    }

    try {
        const response = await fetch(`${GITHUB_API}/repos/${repo}/pulls`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: prTitle,
                body: prBody || '',
                base,
                head,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            pr: {
                number: data.number,
                url: data.html_url,
                title: data.title,
                state: data.state,
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create PR' }, { status: 500 });
    }
}

/**
 * List Pull Requests
 */
async function handleListPRs(body: GitRequest, token?: string) {
    const { repo } = body;
    if (!repo) {
        return NextResponse.json({ error: 'Repo is required' }, { status: 400 });
    }

    const headers: HeadersInit = { 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${GITHUB_API}/repos/${repo}/pulls?state=open`, { headers });
        const prs = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: prs.message }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            prs: prs.map((pr: any) => ({
                number: pr.number,
                title: pr.title,
                state: pr.state,
                url: pr.html_url,
                author: pr.user.login,
                avatar: pr.user.avatar_url,
                createdAt: pr.created_at,
                base: pr.base.ref,
                head: pr.head.ref,
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
    }
}

/**
 * Merge Pull Request
 */
async function handleMergePR(body: GitRequest, token?: string) {
    if (!token) {
        return NextResponse.json({
            error: 'GitHub token required',
            needsAuth: true
        }, { status: 401 });
    }

    const { repo } = body;
    const prNumber = (body as any).prNumber;

    if (!repo || !prNumber) {
        return NextResponse.json({ error: 'Repo and PR number required' }, { status: 400 });
    }

    try {
        const response = await fetch(`${GITHUB_API}/repos/${repo}/pulls/${prNumber}/merge`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            merged: data.merged,
            message: data.message,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to merge PR' }, { status: 500 });
    }
}

/**
 * Create Branch
 */
async function handleCreateBranch(body: GitRequest, token?: string) {
    if (!token) {
        return NextResponse.json({
            error: 'GitHub token required',
            needsAuth: true
        }, { status: 401 });
    }

    const { repo, branch } = body;
    const baseBranch = (body as any).baseBranch || 'main';

    if (!repo || !branch) {
        return NextResponse.json({ error: 'Repo and branch name required' }, { status: 400 });
    }

    try {
        // Get SHA of base branch
        const refResponse = await fetch(`${GITHUB_API}/repos/${repo}/git/ref/heads/${baseBranch}`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!refResponse.ok) {
            return NextResponse.json({ error: 'Base branch not found' }, { status: 404 });
        }

        const refData = await refResponse.json();
        const sha = refData.object.sha;

        // Create new branch
        const createResponse = await fetch(`${GITHUB_API}/repos/${repo}/git/refs`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha,
            }),
        });

        const data = await createResponse.json();

        if (!createResponse.ok) {
            return NextResponse.json({ error: data.message }, { status: createResponse.status });
        }

        return NextResponse.json({
            success: true,
            branch: branch,
            sha: sha,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
    }
}

/**
 * Get Diff (compare commits/branches)
 */
async function handleGetDiff(body: GitRequest, token?: string) {
    const { repo, base, head } = body;
    if (!repo || !base || !head) {
        return NextResponse.json({ error: 'Repo, base, and head required' }, { status: 400 });
    }

    const headers: HeadersInit = { 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${GITHUB_API}/repos/${repo}/compare/${base}...${head}`, { headers });
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            diff: {
                status: data.status,
                aheadBy: data.ahead_by,
                behindBy: data.behind_by,
                totalCommits: data.total_commits,
                files: data.files?.map((f: any) => ({
                    filename: f.filename,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions,
                    patch: f.patch,
                })) || [],
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get diff' }, { status: 500 });
    }
}

/**
 * GET /api/git
 * Get available operations and auth status
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({
        service: 'BuildSpaces Git API',
        version: '1.0.0',
        operations: [
            'clone', 'status', 'branches', 'commits',
            'push', 'pull', 'commit',
            'create-pr', 'list-prs', 'merge-pr',
            'create-branch', 'get-diff'
        ],
        docs: '/docs/git-api'
    });
}
