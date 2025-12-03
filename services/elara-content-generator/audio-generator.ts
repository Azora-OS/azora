import { ElevenLabsClient } from 'elevenlabs';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export class ElaraAudioGenerator {
    private client: ElevenLabsClient | null = null;
    private audioDir: string;

    constructor() {
        // Only initialize if API key is provided
        if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'your-api-key-here') {
            this.client = new ElevenLabsClient({
                apiKey: process.env.ELEVENLABS_API_KEY
            });
        }

        // Create audio directory if it doesn't exist
        this.audioDir = path.join(__dirname, 'generated-audio');
        if (!fs.existsSync(this.audioDir)) {
            fs.mkdirSync(this.audioDir, { recursive: true });
        }
    }

    async generateAudio(params: {
        text: string;
        lessonId: string;
        voiceId?: string;
    }): Promise<{ url: string; duration: number }> {
        console.log(`Generating audio for lesson: ${params.lessonId}`);

        // If no API key, return mock audio
        if (!this.client) {
            console.log('Using mock audio generation (No ElevenLabs API Key)');
            return this.getMockAudio(params);
        }

        try {
            const voiceId = params.voiceId || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default: Bella

            // Generate audio using ElevenLabs
            const audio = await this.client.generate({
                voice: voiceId,
                text: params.text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            });

            // Save audio to file
            const filename = `${params.lessonId}-${Date.now()}.mp3`;
            const filepath = path.join(this.audioDir, filename);

            // Convert audio stream to buffer and save
            const chunks: Buffer[] = [];
            for await (const chunk of audio) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            fs.writeFileSync(filepath, buffer);

            // Calculate duration (approximate based on word count)
            const duration = this.calculateDuration(params.text);

            // In production, upload to S3/R2 and return URL
            // For now, return local file path
            const url = `/audio/${filename}`;

            console.log(`Audio generated: ${url}`);
            return { url, duration };

        } catch (error) {
            console.error('Error generating audio:', error);
            // Fallback to mock on error
            return this.getMockAudio(params);
        }
    }

    private getMockAudio(params: { text: string; lessonId: string }): { url: string; duration: number } {
        const duration = this.calculateDuration(params.text);
        return {
            url: `/audio/mock-${params.lessonId}.mp3`,
            duration
        };
    }

    private calculateDuration(text: string): number {
        // Average speaking rate: 150 words per minute
        const words = text.split(/\s+/).length;
        const minutes = words / 150;
        return Math.ceil(minutes * 60); // Return seconds
    }

    async generateAudioForLesson(lesson: any): Promise<any> {
        const audio = await this.generateAudio({
            text: lesson.script,
            lessonId: lesson.title.toLowerCase().replace(/\s+/g, '-')
        });

        return {
            ...lesson,
            audio: {
                url: audio.url,
                duration: audio.duration
            }
        };
    }

    async generateAudioForCourse(lessons: any[]): Promise<any[]> {
        const lessonsWithAudio = [];

        for (const lesson of lessons) {
            const lessonWithAudio = await this.generateAudioForLesson(lesson.content);
            lessonsWithAudio.push({
                ...lesson,
                content: lessonWithAudio
            });
        }

        return lessonsWithAudio;
    }
}
