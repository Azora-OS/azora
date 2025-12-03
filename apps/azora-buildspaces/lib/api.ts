const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api';

export class ApiClient {
    private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options?.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `Request failed with status ${response.status}`);
        }

        return response.json();
    }

    // Ideas
    static async getIdeas(params?: { status?: string; limit?: number }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<{ ideas: any[]; total: number }>(`/ideas?${query}`);
    }

    static async createIdea(data: { title: string; description: string; authorId: string; tags?: string[] }) {
        return this.request<any>('/ideas', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async validateIdea(id: string) {
        return this.request<any>(`/ideas/${id}/validate`, {
            method: 'POST',
        });
    }

    static async deployIdea(id: string) {
        return this.request<any>(`/ideas/${id}/deploy`, {
            method: 'POST',
        });
    }

    // Projects
    static async getProject(id: string) {
        return this.request<any>(`/projects/${id}`);
    }

    static async getProjectFiles(id: string) {
        return this.request<any[]>(`/projects/${id}/files`);
    }

    static async getFileContent(projectId: string, path: string) {
        return this.request<any>(`/projects/${projectId}/files/${path}`);
    }

    static async updateFile(projectId: string, path: string, content: string, agentName?: string) {
        return this.request<any>(`/projects/${projectId}/files/${path}`, {
            method: 'PUT',
            body: JSON.stringify({ content, agentName }),
        });
    }

    // Agents
    static async getAgentStatus(projectId: string) {
        return this.request<Record<string, any>>(`/agents/${projectId}/status`);
    }

    static async assignTask(data: { projectId: string; agentName: string; taskType: string; title: string }) {
        return this.request<any>('/agents/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Elara
    static async chatWithElara(message: string, projectId?: string, context?: any) {
        return this.request<{ message: string; actions?: any[] }>('/elara/chat', {
            method: 'POST',
            body: JSON.stringify({ message, projectId, context }),
        });
    }
}
