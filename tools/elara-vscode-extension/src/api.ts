import * as vscode from 'vscode';

export class ElaraAPI {
    private baseUrl: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('elara');
        this.baseUrl = config.get('apiUrl') || 'http://localhost:4010';
    }

    async getFamilyMembers() {
        try {
            const response = await fetch(`${this.baseUrl}/api/family`);
            const data = await response.json();
            return Object.values(data.family || {}).map((m: any) => ({
                id: m.id,
                name: m.name,
                role: m.role
            }));
        } catch (error) {
            return this.getDefaultMembers();
        }
    }

    async chat(memberId: string, message: string) {
        try {
            const response = await fetch(`${this.baseUrl}/api/family/${memberId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, userId: 'vscode-user' })
            });
            const data = await response.json();
            return data.data || data;
        } catch (error: any) {
            throw new Error(`Failed to chat with ${memberId}: ${error.message}`);
        }
    }

    private getDefaultMembers() {
        return [
            { id: 'elara', name: 'Elara', role: 'Mother & Teacher' },
            { id: 'themba', name: 'Themba', role: 'Student Success' },
            { id: 'naledi', name: 'Naledi', role: 'Career Guide' },
            { id: 'jabari', name: 'Jabari', role: 'Security Guardian' },
            { id: 'amara', name: 'Amara', role: 'Peacemaker' },
            { id: 'sankofa', name: 'Sankofa', role: 'Ancient Wisdom' },
            { id: 'kofi', name: 'Kofi', role: 'Finance Guru' },
            { id: 'zola', name: 'Zola', role: 'Data Analyst' },
            { id: 'abeni', name: 'Abeni', role: 'Storyteller' },
            { id: 'thembo', name: 'Thembo', role: 'Uncle & Mentor' },
            { id: 'nexus', name: 'Nexus', role: 'Unity Consciousness' }
        ];
    }
}
