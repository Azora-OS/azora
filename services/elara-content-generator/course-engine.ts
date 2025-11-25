import { ElaraContentGenerator } from './lesson-generator';
import { ElaraAudioGenerator } from './audio-generator';
import { ElaraVideoGenerator } from './video-generator';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// ========== SLIDE GENERATOR ==========

export interface Slide {
    type: 'title' | 'content' | 'code' | 'summary';
    content: any;
    duration: number;
    style: 'modern' | 'minimal' | 'dark';
}

export class SlideGenerator {
    generateSlides(params: {
        title: string;
        content: string;
        codeExamples: any[];
        style?: 'modern' | 'minimal' | 'dark';
    }): Slide[] {
        const slides: Slide[] = [];
        const style = params.style || 'modern';

        // Title slide
        slides.push({
            type: 'title',
            content: {
                title: params.title,
                subtitle: 'Azora Education - Powered by Elara AI'
            },
            duration: 3,
            style
        });

        // Content slides (split by paragraphs)
        const paragraphs = this.splitContent(params.content);
        for (const paragraph of paragraphs) {
            slides.push({
                type: 'content',
                content: {
                    text: paragraph,
                    bullets: this.extractBullets(paragraph)
                },
                duration: this.calculateDuration(paragraph),
                style
            });
        }

        // Code slides
        for (const example of params.codeExamples) {
            slides.push({
                type: 'code',
                content: {
                    language: example.language || 'python',
                    code: example.code,
                    explanation: example.explanation || ''
                },
                duration: 10,
                style
            });
        }

        // Summary slide
        slides.push({
            type: 'summary',
            content: {
                title: 'Key Takeaways',
                points: this.extractKeyPoints(params.content)
            },
            duration: 5,
            style
        });

        return slides;
    }

    private splitContent(content: string): string[] {
        return content.split('\n\n').filter(p => p.trim().length > 0);
    }

    private extractBullets(text: string): string[] {
        const sentences = text.split('. ').filter(s => s.trim());
        return sentences.slice(0, 5).map(s => s.trim());
    }

    private calculateDuration(text: string): number {
        const words = text.split(' ').length;
        return Math.max(5, Math.ceil(words / 150 * 60)); // 150 words/min
    }

    private extractKeyPoints(content: string): string[] {
        const sentences = content.split('. ').filter(s => s.trim());
        return sentences.slice(0, 5).map(s => s.trim());
    }
}

// ========== QUIZ GENERATOR ==========

export interface QuizQuestion {
    type: 'multiple_choice' | 'true_false' | 'code';
    question: string;
    options?: string[];
    correct: number | boolean;
    explanation: string;
}

export interface Quiz {
    lessonTitle: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit: number;
}

export class QuizGenerator {
    private openai: OpenAI | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder') {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }

    async generateQuiz(params: {
        lessonTitle: string;
        content: string;
        codeExamples: any[];
        difficulty?: 'easy' | 'medium' | 'hard';
        questionCount?: number;
    }): Promise<Quiz> {
        const difficulty = params.difficulty || 'medium';
        const questionCount = params.questionCount || 5;

        // If no API key, return mock quiz
        if (!this.openai) {
            console.log('Using mock quiz generation (No OpenAI API Key)');
            return this.getMockQuiz(params.lessonTitle, questionCount);
        }

        try {
            const prompt = `
Create a ${questionCount}-question quiz for the lesson "${params.lessonTitle}".

Lesson content:
${params.content.substring(0, 2000)}

Requirements:
- Difficulty: ${difficulty}
- Mix of multiple choice and true/false questions
- Include explanations for correct answers
- Make questions practical and test understanding

Format as JSON:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }
  ]
}
      `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });

            const quiz = JSON.parse(response.choices[0].message.content || '{}');

            return {
                lessonTitle: params.lessonTitle,
                questions: quiz.questions || [],
                passingScore: 70,
                timeLimit: questionCount * 2
            };
        } catch (error) {
            console.error('Error generating quiz:', error);
            return this.getMockQuiz(params.lessonTitle, questionCount);
        }
    }

    private getMockQuiz(lessonTitle: string, count: number): Quiz {
        const questions: QuizQuestion[] = [];

        for (let i = 0; i < count; i++) {
            questions.push({
                type: 'multiple_choice',
                question: `Question ${i + 1} about ${lessonTitle}`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correct: 0,
                explanation: 'This is the correct answer because...'
            });
        }

        return {
            lessonTitle,
            questions,
            passingScore: 70,
            timeLimit: count * 2
        };
    }
}

// ========== COURSE GENERATION ENGINE ==========

export interface CourseOutline {
    title: string;
    description: string;
    level: string;
    category: string;
    price: number;
    modules: ModuleOutline[];
}

export interface ModuleOutline {
    title: string;
    lessons: LessonOutline[];
}

export interface LessonOutline {
    title: string;
    duration: number;
    topics: string[];
    hands_on?: string[];
}

export interface CompleteLesson {
    title: string;
    moduleTitle: string;
    order: number;
    script: string;
    codeExamples: any[];
    exercises: any[];
    audio: {
        url: string;
        duration: number;
    };
    video: {
        url: string;
        thumbnail: string;
        duration: number;
    };
    slides: Slide[];
    quiz: Quiz;
}

export interface GeneratedCourse {
    title: string;
    description: string;
    level: string;
    category: string;
    price: number;
    totalDuration: number;
    lessonCount: number;
    lessons: CompleteLesson[];
    thumbnail: string;
}

export class CourseGenerationEngine {
    private contentGenerator: ElaraContentGenerator;
    private audioGenerator: ElaraAudioGenerator;
    private videoGenerator: ElaraVideoGenerator;
    private slideGenerator: SlideGenerator;
    private quizGenerator: QuizGenerator;

    constructor() {
        this.contentGenerator = new ElaraContentGenerator();
        this.audioGenerator = new ElaraAudioGenerator();
        this.videoGenerator = new ElaraVideoGenerator();
        this.slideGenerator = new SlideGenerator();
        this.quizGenerator = new QuizGenerator();
    }

    async generateCompleteCourse(outline: CourseOutline): Promise<GeneratedCourse> {
        console.log(`\n🚀 STARTING COURSE GENERATION: ${outline.title}`);
        console.log(`   Modules: ${outline.modules.length}`);
        console.log(`   Total Lessons: ${outline.modules.reduce((sum, m) => sum + m.lessons.length, 0)}\n`);

        const startTime = Date.now();

        try {
            // Stage 1: Generate all lesson content
            console.log('📝 STAGE 1: Generating lesson content...');
            const lessons = await this.generateAllLessons(outline);
            console.log(`   ✅ Generated ${lessons.length} lessons\n`);

            // Stage 2: Generate audio for all lessons
            console.log('🎤 STAGE 2: Generating audio narration...');
            const lessonsWithAudio = await this.generateAllAudio(lessons);
            console.log(`   ✅ Generated ${lessonsWithAudio.length} audio files\n`);

            // Stage 3: Generate slides
            console.log('🎨 STAGE 3: Generating slides...');
            const lessonsWithSlides = await this.generateAllSlides(lessonsWithAudio);
            console.log(`   ✅ Generated slides for ${lessonsWithSlides.length} lessons\n`);

            // Stage 4: Generate videos
            console.log('🎬 STAGE 4: Generating videos...');
            const lessonsWithVideo = await this.generateAllVideos(lessonsWithSlides);
            console.log(`   ✅ Generated ${lessonsWithVideo.length} videos\n`);

            // Stage 5: Generate quizzes
            console.log('📝 STAGE 5: Generating quizzes...');
            const completeLessons = await this.generateAllQuizzes(lessonsWithVideo);
            console.log(`   ✅ Generated ${completeLessons.length} quizzes\n`);

            // Stage 6: Package course
            console.log('📦 STAGE 6: Packaging course...');
            const course = this.packageCourse(outline, completeLessons);

            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);

            console.log(`\n✅ COURSE GENERATION COMPLETE!`);
            console.log(`   Time taken: ${duration} seconds`);
            console.log(`   Total lessons: ${course.lessonCount}`);
            console.log(`   Total duration: ${Math.round(course.totalDuration / 60)} minutes\n`);

            return course;
        } catch (error) {
            console.error('\n❌ COURSE GENERATION FAILED:', error);
            throw error;
        }
    }

    private async generateAllLessons(outline: CourseOutline): Promise<any[]> {
        const lessons: any[] = [];
        let lessonNumber = 1;

        for (const module of outline.modules) {
            for (const lessonOutline of module.lessons) {
                console.log(`   [${lessonNumber}] Generating: ${lessonOutline.title}`);

                const lesson = await this.contentGenerator.generateLesson({
                    course: outline.title,
                    module: module.title,
                    topic: lessonOutline.title,
                    duration: lessonOutline.duration,
                    level: outline.level
                });

                lessons.push({
                    ...lesson,
                    moduleTitle: module.title,
                    order: lessonNumber++
                });
            }
        }

        return lessons;
    }

    private async generateAllAudio(lessons: any[]): Promise<any[]> {
        const lessonsWithAudio: any[] = [];

        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            console.log(`   [${i + 1}/${lessons.length}] ${lesson.title}`);

            const audio = await this.audioGenerator.generateAudio({
                text: lesson.script,
                lessonId: this.slugify(lesson.title),
                voiceId: 'en-US-JennyNeural'
            });

            lessonsWithAudio.push({
                ...lesson,
                audio: {
                    url: audio.url,
                    duration: audio.duration
                }
            });
        }

        return lessonsWithAudio;
    }

    private async generateAllSlides(lessons: any[]): Promise<any[]> {
        const lessonsWithSlides: any[] = [];

        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            console.log(`   [${i + 1}/${lessons.length}] ${lesson.title}`);

            const slides = this.slideGenerator.generateSlides({
                title: lesson.title,
                content: lesson.script,
                codeExamples: lesson.codeExamples || [],
                style: 'modern'
            });

            lessonsWithSlides.push({
                ...lesson,
                slides
            });
        }

        return lessonsWithSlides;
    }

    private async generateAllVideos(lessons: any[]): Promise<any[]> {
        const lessonsWithVideo: any[] = [];

        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            console.log(`   [${i + 1}/${lessons.length}] ${lesson.title}`);

            const video = await this.videoGenerator.generateVideo({
                lessonId: this.slugify(lesson.title),
                title: lesson.title,
                script: lesson.script,
                codeExamples: lesson.codeExamples || [],
                audioUrl: lesson.audio.url,
                style: 'slides'
            });

            lessonsWithVideo.push({
                ...lesson,
                video: {
                    url: video.url,
                    thumbnail: video.thumbnail,
                    duration: lesson.audio.duration
                }
            });
        }

        return lessonsWithVideo;
    }

    private async generateAllQuizzes(lessons: any[]): Promise<CompleteLesson[]> {
        const completeLessons: CompleteLesson[] = [];

        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            console.log(`   [${i + 1}/${lessons.length}] ${lesson.title}`);

            const quiz = await this.quizGenerator.generateQuiz({
                lessonTitle: lesson.title,
                content: lesson.script,
                codeExamples: lesson.codeExamples || [],
                difficulty: 'medium',
                questionCount: 5
            });

            completeLessons.push({
                ...lesson,
                quiz
            });
        }

        return completeLessons;
    }

    private packageCourse(outline: CourseOutline, lessons: CompleteLesson[]): GeneratedCourse {
        return {
            title: outline.title,
            description: outline.description,
            level: outline.level,
            category: outline.category,
            price: outline.price,
            totalDuration: lessons.reduce((sum, l) => sum + l.audio.duration, 0),
            lessonCount: lessons.length,
            lessons: lessons,
            thumbnail: `/thumbnails/${this.slugify(outline.title)}.jpg`
        };
    }

    private slugify(text: string): string {
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
}
