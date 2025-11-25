import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export class ElaraVideoGenerator {
    private videoDir: string;

    constructor() {
        // Create video directory if it doesn't exist
        this.videoDir = path.join(__dirname, 'generated-videos');
        if (!fs.existsSync(this.videoDir)) {
            fs.mkdirSync(this.videoDir, { recursive: true });
        }
    }

    async generateVideo(params: {
        lessonId: string;
        title: string;
        script: string;
        codeExamples?: any[];
        audioUrl?: string;
        style?: 'slides' | 'avatar' | 'code';
    }): Promise<{ url: string; thumbnail: string }> {
        console.log(`Generating video for lesson: ${params.lessonId}`);

        const style = params.style || 'slides';

        if (style === 'avatar') {
            return this.generateAvatarVideo(params);
        } else if (style === 'code') {
            return this.generateCodeVideo(params);
        } else {
            return this.generateSlideVideo(params);
        }
    }

    private async generateAvatarVideo(params: any): Promise<{ url: string; thumbnail: string }> {
        // HeyGen/D-ID integration would go here
        // For MVP, return mock video
        console.log('Avatar video generation requires HeyGen API key');
        return this.getMockVideo(params);
    }

    private async generateCodeVideo(params: any): Promise<{ url: string; thumbnail: string }> {
        // Code-focused video with syntax highlighting
        // Could use Remotion or similar
        console.log('Code video generation - using slide approach');
        return this.generateSlideVideo(params);
    }

    private async generateSlideVideo(params: any): Promise<{ url: string; thumbnail: string }> {
        // Generate slides from script
        const slides = this.generateSlides(params.script, params.codeExamples || []);

        // In production, would use Remotion or similar to render video
        // For MVP, return metadata for slide-based presentation
        const videoMetadata = {
            lessonId: params.lessonId,
            title: params.title,
            slides: slides,
            audioUrl: params.audioUrl || null,
            duration: this.calculateDuration(params.script)
        };

        // Save metadata
        const filename = `${params.lessonId}-${Date.now()}.json`;
        const filepath = path.join(this.videoDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(videoMetadata, null, 2));

        return {
            url: `/videos/${filename}`,
            thumbnail: `/thumbnails/${params.lessonId}.jpg`
        };
    }

    private generateSlides(script: string, codeExamples: any[]): any[] {
        // Split script into logical sections
        const paragraphs = script.split('\n\n').filter(p => p.trim());
        const slides = [];

        // Title slide
        slides.push({
            type: 'title',
            content: 'Lesson Introduction',
            duration: 3
        });

        // Content slides
        paragraphs.forEach((paragraph, index) => {
            slides.push({
                type: 'content',
                content: paragraph.trim(),
                duration: Math.max(5, paragraph.split(' ').length / 2) // ~2 words per second
            });

            // Insert code example slides
            if (codeExamples[index]) {
                slides.push({
                    type: 'code',
                    content: codeExamples[index],
                    duration: 10
                });
            }
        });

        // Summary slide
        slides.push({
            type: 'summary',
            content: 'Key Takeaways',
            duration: 5
        });

        return slides;
    }

    private calculateDuration(text: string): number {
        const words = text.split(/\s+/).length;
        return Math.ceil(words / 150 * 60); // 150 words per minute
    }

    private getMockVideo(params: any): { url: string; thumbnail: string } {
        return {
            url: `/videos/mock-${params.lessonId}.mp4`,
            thumbnail: `/thumbnails/mock-${params.lessonId}.jpg`
        };
    }

    async generateVideoForLesson(lesson: any, audioUrl?: string): Promise<any> {
        const video = await this.generateVideo({
            lessonId: lesson.title.toLowerCase().replace(/\s+/g, '-'),
            title: lesson.title,
            script: lesson.script,
            codeExamples: lesson.codeExamples,
            audioUrl: audioUrl,
            style: 'slides'
        });

        return {
            ...lesson,
            video: {
                url: video.url,
                thumbnail: video.thumbnail
            }
        };
    }

    async generateVideosForCourse(lessons: any[]): Promise<any[]> {
        const lessonsWithVideo = [];

        for (const lesson of lessons) {
            const lessonWithVideo = await this.generateVideoForLesson(
                lesson.content,
                lesson.content.audio?.url
            );
            lessonsWithVideo.push({
                ...lesson,
                content: lessonWithVideo
            });
        }

        return lessonsWithVideo;
    }
}
