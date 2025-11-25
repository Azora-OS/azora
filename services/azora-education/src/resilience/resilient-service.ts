import { OfflineAdapter } from './offline-adapter';

export interface CachedLesson {
    topic: string;
    content: string;
    level: string;
    timestamp: string;
}

export class ResilientEducationService {
    private offlineAdapter: OfflineAdapter<CachedLesson>;
    private lessonTemplates: Map<string, string>;

    constructor() {
        this.offlineAdapter = new OfflineAdapter<CachedLesson>();
        this.lessonTemplates = this.initializeTemplates();
    }

    /**
     * Initialize fallback lesson templates
     */
    private initializeTemplates(): Map<string, string> {
        const templates = new Map();

        templates.set('mathematics', `
# Mathematics Lesson

## Introduction
This lesson covers fundamental mathematical concepts.

## Key Concepts
- Problem solving
- Logical thinking
- Pattern recognition

## Practice Exercises
1. Solve basic equations
2. Apply concepts to real-world problems
    `);

        templates.set('science', `
# Science Lesson

## Introduction
Explore the wonders of science through observation and experimentation.

## Key Concepts
- Scientific method
- Observation and hypothesis
- Experimentation

## Activities
1. Conduct simple experiments
2. Record observations
    `);

        return templates;
    }

    /**
     * Generate lesson with offline fallback
     */
    async generateLesson(topic: string, level: string): Promise<CachedLesson> {
        const cacheKey = `lesson-${topic}-${level}`;

        try {
            // Try online generation
            const response = await fetch('http://localhost:3002/api/generate-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, level }),
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const lesson = await response.json();

                // Cache for offline use
                this.offlineAdapter.cacheData(cacheKey, lesson, 1440); // 24 hours

                return lesson;
            }
        } catch (error) {
            console.warn('Online generation failed, using offline fallback');
        }

        // Try cached version
        const cached = this.offlineAdapter.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }

        // Use template as last resort
        const template = this.lessonTemplates.get(topic) || this.lessonTemplates.get('mathematics')!;

        return {
            topic,
            content: template,
            level,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Submit assignment with offline queue
     */
    async submitAssignment(userId: string, assignmentId: string, answers: any): Promise<void> {
        try {
            await fetch('http://localhost:3002/api/submit-assignment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, assignmentId, answers }),
                signal: AbortSignal.timeout(5000)
            });
        } catch (error) {
            // Queue for later submission
            this.offlineAdapter.queueOperation('submit-assignment', {
                userId,
                assignmentId,
                answers
            });
            console.log('📥 Assignment queued for submission when online');
        }
    }

    /**
     * Get offline status
     */
    getOfflineStatus() {
        return this.offlineAdapter.getQueueStatus();
    }
}

export default ResilientEducationService;
