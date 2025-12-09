"use client";

import { useState, useEffect } from "react";
import {
    GitBranch, GitCommit, GitPullRequest, GitMerge,
    ChevronDown, ChevronRight, RefreshCw, Plus, Check,
    X, ExternalLink, Github, Upload, Download, Loader2
} from "lucide-react";

interface Branch {
    name: string;
    sha: string;
    protected: boolean;
}

interface Commit {
    sha: string;
    shortSha: string;
    message: string;
    author: string;
    date: string;
    avatar?: string;
}

interface PullRequest {
    number: number;
    title: string;
    state: string;
    url: string;
    author: string;
    avatar: string;
    createdAt: string;
    base: string;
    head: string;
}

interface GitPanelProps {
    repo?: string;
    token?: string;
    onClose?: () => void;
}

export default function GitPanel({ repo, token, onClose }: GitPanelProps) {
    const [activeTab, setActiveTab] = useState<'branches' | 'commits' | 'prs'>('branches');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [prs, setPRs] = useState<PullRequest[]>([]);
    const [currentBranch, setCurrentBranch] = useState('main');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Connect dialog
    const [showConnect, setShowConnect] = useState(!repo);
    const [repoInput, setRepoInput] = useState(repo || '');
    const [tokenInput, setTokenInput] = useState(token || '');
    const [connectedRepo, setConnectedRepo] = useState(repo);

    // New branch dialog
    const [showNewBranch, setShowNewBranch] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');

    // Commit dialog
    const [showCommit, setShowCommit] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');

    // PR dialog
    const [showNewPR, setShowNewPR] = useState(false);
    const [prTitle, setPRTitle] = useState('');
    const [prBody, setPRBody] = useState('');
    const [prBase, setPRBase] = useState('main');
    const [prHead, setPRHead] = useState('');

    // Fetch data when repo changes
    useEffect(() => {
        if (connectedRepo) {
            fetchData();
        }
    }, [connectedRepo, activeTab]);

    const fetchData = async () => {
        if (!connectedRepo) return;

        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === 'branches') {
                const res = await fetch('/api/git', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'branches', repo: connectedRepo, token: tokenInput })
                });
                const data = await res.json();
                if (data.success) setBranches(data.branches);
                else setError(data.error);
            } else if (activeTab === 'commits') {
                const res = await fetch('/api/git', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'commits', repo: connectedRepo, branch: currentBranch, token: tokenInput })
                });
                const data = await res.json();
                if (data.success) setCommits(data.commits);
                else setError(data.error);
            } else if (activeTab === 'prs') {
                const res = await fetch('/api/git', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'list-prs', repo: connectedRepo, token: tokenInput })
                });
                const data = await res.json();
                if (data.success) setPRs(data.prs);
                else setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch data');
        }

        setIsLoading(false);
    };

    const handleConnect = async () => {
        if (!repoInput) return;

        // Parse repo format (e.g., "owner/repo" or full URL)
        let repoPath = repoInput;
        if (repoInput.includes('github.com')) {
            const match = repoInput.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
            if (match) repoPath = `${match[1]}/${match[2]}`;
        }

        setConnectedRepo(repoPath);
        setShowConnect(false);
    };

    const handleCreateBranch = async () => {
        if (!newBranchName || !connectedRepo) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/git', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create-branch',
                    repo: connectedRepo,
                    branch: newBranchName,
                    baseBranch: currentBranch,
                    token: tokenInput
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowNewBranch(false);
                setNewBranchName('');
                fetchData();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to create branch');
        }
        setIsLoading(false);
    };

    const handlePush = async () => {
        if (!connectedRepo || !tokenInput) {
            setError('GitHub token required for push');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/git', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'push',
                    repo: connectedRepo,
                    branch: currentBranch,
                    token: tokenInput
                })
            });
            const data = await res.json();
            if (!data.success && data.error) {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to push');
        }
        setIsLoading(false);
    };

    const handlePull = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
    };

    const handleCreatePR = async () => {
        if (!prTitle || !prHead || !connectedRepo || !tokenInput) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/git', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create-pr',
                    repo: connectedRepo,
                    prTitle,
                    prBody,
                    base: prBase,
                    head: prHead,
                    token: tokenInput
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowNewPR(false);
                setPRTitle('');
                setPRBody('');
                setActiveTab('prs');
                fetchData();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to create PR');
        }
        setIsLoading(false);
    };

    const handleMergePR = async (prNumber: number) => {
        if (!connectedRepo || !tokenInput) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/git', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'merge-pr',
                    repo: connectedRepo,
                    prNumber,
                    token: tokenInput
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to merge PR');
        }
        setIsLoading(false);
    };

    // Connect Dialog
    if (showConnect) {
        return (
            <div className="h-full bg-card p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        Connect Repository
                    </h3>
                    {onClose && (
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="space-y-4 flex-1">
                    <div>
                        <label className="text-sm text-muted-foreground block mb-2">Repository</label>
                        <input
                            type="text"
                            value={repoInput}
                            onChange={(e) => setRepoInput(e.target.value)}
                            placeholder="owner/repo or GitHub URL"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground block mb-2">
                            GitHub Token <span className="text-xs">(for push/PR/merge)</span>
                        </label>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Create at github.com/settings/tokens
                        </p>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={!repoInput}
                        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Github className="w-4 h-4" />
                        Connect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-card flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate max-w-32">{connectedRepo}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePull}
                        disabled={isLoading}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Pull"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handlePush}
                        disabled={isLoading || !tokenInput}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                        title="Push"
                    >
                        <Upload className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowConnect(true)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Settings"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Current Branch */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="w-4 h-4 text-green-500" />
                    <span>{currentBranch}</span>
                </div>
                <button
                    onClick={() => setShowNewBranch(true)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('branches')}
                    className={`flex-1 py-2 text-xs font-medium transition ${activeTab === 'branches'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Branches
                </button>
                <button
                    onClick={() => setActiveTab('commits')}
                    className={`flex-1 py-2 text-xs font-medium transition ${activeTab === 'commits'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Commits
                </button>
                <button
                    onClick={() => setActiveTab('prs')}
                    className={`flex-1 py-2 text-xs font-medium transition ${activeTab === 'prs'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    PRs
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-2 bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2">×</button>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'branches' && !isLoading && (
                    <div className="p-2 space-y-1">
                        {branches.map((branch) => (
                            <button
                                key={branch.name}
                                onClick={() => setCurrentBranch(branch.name)}
                                className={`w-full p-2 rounded text-left text-sm flex items-center gap-2 ${branch.name === currentBranch
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted text-foreground'
                                    }`}
                            >
                                <GitBranch className="w-4 h-4" />
                                <span className="truncate">{branch.name}</span>
                                {branch.protected && (
                                    <span className="text-xs bg-muted px-1 rounded">protected</span>
                                )}
                            </button>
                        ))}
                        {branches.length === 0 && (
                            <p className="text-muted-foreground text-sm p-4 text-center">
                                No branches found
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'commits' && !isLoading && (
                    <div className="p-2 space-y-1">
                        {commits.map((commit) => (
                            <div key={commit.sha} className="p-2 rounded hover:bg-muted">
                                <div className="flex items-start gap-2">
                                    {commit.avatar && (
                                        <img src={commit.avatar} className="w-6 h-6 rounded-full" alt="" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{commit.message.split('\n')[0]}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {commit.shortSha} · {commit.author}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {commits.length === 0 && (
                            <p className="text-muted-foreground text-sm p-4 text-center">
                                No commits found
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'prs' && !isLoading && (
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => setShowNewPR(true)}
                            className="w-full p-2 rounded border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary text-sm flex items-center justify-center gap-2 mb-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Pull Request
                        </button>
                        {prs.map((pr) => (
                            <div key={pr.number} className="p-2 rounded hover:bg-muted">
                                <div className="flex items-start gap-2">
                                    <GitPullRequest className="w-4 h-4 text-green-500 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            #{pr.number} {pr.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {pr.head} → {pr.base}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleMergePR(pr.number)}
                                            disabled={!tokenInput}
                                            className="p-1 rounded hover:bg-green-500/10 text-green-500 disabled:opacity-50"
                                            title="Merge"
                                        >
                                            <GitMerge className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={pr.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded hover:bg-muted"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {prs.length === 0 && (
                            <p className="text-muted-foreground text-sm p-4 text-center">
                                No open pull requests
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* New Branch Dialog */}
            {showNewBranch && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-lg p-4 w-full max-w-sm">
                        <h4 className="font-medium mb-4">Create Branch</h4>
                        <input
                            type="text"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            placeholder="feature/my-feature"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNewBranch(false)}
                                className="flex-1 py-2 rounded-lg border border-border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBranch}
                                disabled={!newBranchName}
                                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New PR Dialog */}
            {showNewPR && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-lg p-4 w-full max-w-sm">
                        <h4 className="font-medium mb-4">Create Pull Request</h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={prTitle}
                                onChange={(e) => setPRTitle(e.target.value)}
                                placeholder="PR Title"
                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                            />
                            <textarea
                                value={prBody}
                                onChange={(e) => setPRBody(e.target.value)}
                                placeholder="Description (optional)"
                                rows={3}
                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={prHead}
                                    onChange={(e) => setPRHead(e.target.value)}
                                    placeholder="Source branch"
                                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                                />
                                <span className="py-2">→</span>
                                <input
                                    type="text"
                                    value={prBase}
                                    onChange={(e) => setPRBase(e.target.value)}
                                    placeholder="Target branch"
                                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setShowNewPR(false)}
                                className="flex-1 py-2 rounded-lg border border-border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePR}
                                disabled={!prTitle || !prHead}
                                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                            >
                                Create PR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
