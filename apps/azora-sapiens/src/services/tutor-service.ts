export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export class TutorService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'http://localhost:3000/api'; // Gateway URL
    }

    async sendMessage(courseId: string, message: string): Promise<string> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/tutor/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId, message })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI Tutor');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Tutor Error:', error);
            return "I'm having trouble connecting right now. Please try again.";
        }
    }
}
