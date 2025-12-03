// GitHub integration service
// For production, use @octokit/rest

interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    url: string;
    default_branch: string;
}

interface GitHubFile {
    path: string;
    content: string;
    sha?: string;
}

export class GitHubService {
    private token: string | null = null;
    private baseUrl = 'https://api.github.com';

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('github_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('github_token');
    }

    private async fetch(endpoint: string, options: RequestInit = {}) {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return response.json();
    }

    async listRepositories(): Promise<Repository[]> {
        return this.fetch('/user/repos?sort=updated&per_page=100');
    }

    async getRepository(owner: string, repo: string): Promise<Repository> {
        return this.fetch(`/repos/${owner}/${repo}`);
    }

    async getFileContent(owner: string, repo: string, path: string): Promise<GitHubFile> {
        const data = await this.fetch(`/repos/${owner}/${repo}/contents/${path}`);
        const content = atob(data.content); // Decode base64
        return {
            path: data.path,
            content,
            sha: data.sha
        };
    }

    async createOrUpdateFile(
        owner: string,
        repo: string,
        path: string,
        content: string,
        message: string,
        sha?: string
    ): Promise<void> {
        const body: any = {
            message,
            content: btoa(content), // Encode to base64
            branch: 'main'
        };

        if (sha) {
            body.sha = sha; // Required for updates
        }

        await this.fetch(`/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    async createBranch(owner: string, repo: string, branchName: string, fromBranch = 'main'): Promise<void> {
        // Get the SHA of the from branch
        const ref = await this.fetch(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`);
        const sha = ref.object.sha;

        // Create new branch
        await this.fetch(`/repos/${owner}/${repo}/git/refs`, {
            method: 'POST',
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha
            })
        });
    }

    async createPullRequest(
        owner: string,
        repo: string,
        title: string,
        head: string,
        base: string,
        body?: string
    ): Promise<void> {
        await this.fetch(`/repos/${owner}/${repo}/pulls`, {
            method: 'POST',
            body: JSON.stringify({
                title,
                head,
                base,
                body: body || ''
            })
        });
    }

    // Simple clone simulation (downloads files to virtual FS)
    async cloneRepository(owner: string, repo: string, targetPath: string): Promise<GitHubFile[]> {
        const contents = await this.fetch(`/repos/${owner}/${repo}/contents`);
        const files: GitHubFile[] = [];

        for (const item of contents) {
            if (item.type === 'file') {
                const file = await this.getFileContent(owner, repo, item.path);
                files.push(file);
            }
        }

        return files;
    }
}

// Singleton instance
let githubInstance: GitHubService | null = null;

export const getGitHubService = (): GitHubService => {
    if (!githubInstance) {
        githubInstance = new GitHubService();
    }
    return githubInstance;
};
