import { PrismaClient } from '@prisma/client';
import { GeneratedCourse, CompleteLesson } from './course-engine';

export interface PublishedCourse {
    courseId: string;
    title: string;
    url: string;
    status: 'pending_review' | 'published';
    lessonCount: number;
    moduleCount: number;
}

export class CoursePublisher {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async publishCourse(generatedCourse: GeneratedCourse): Promise<PublishedCourse> {
        console.log(`\n📤 PUBLISHING COURSE: ${generatedCourse.title}`);

        try {
            // Group lessons by module
            const moduleData = this.groupLessonsByModule(generatedCourse.lessons);

            console.log(`   Creating course with ${moduleData.length} modules...`);

            // Create course in database
            const course = await this.prisma.course.create({
                data: {
                    title: generatedCourse.title,
                    description: generatedCourse.description,
                    price: generatedCourse.price,
                    level: generatedCourse.level as any, // Bypass enum type
                    category: generatedCourse.category,
                    duration: Math.round(generatedCourse.totalDuration / 60),
                    instructorId: 'elara-ai',
                    currency: 'ZAR',
                    published: false,
                    modules: {
                        create: moduleData
                    }
                },
                include: {
                    modules: true
                }
            });

            console.log(`   ✅ Course created: ${course.id}`);
            console.log(`   📊 Modules: ${course.modules.length}`);
            console.log(`   📚 Lessons: ${generatedCourse.lessonCount}`);
            console.log(`   ⏱️  Duration: ${course.duration} hours`);
            console.log(`   💰 Price: R${course.price}`);
            console.log(`   🔍 Status: Pending Review\n`);

            return {
                courseId: course.id,
                title: course.title,
                url: `/courses/${course.id}`,
                status: 'pending_review',
                lessonCount: generatedCourse.lessonCount,
                moduleCount: course.modules.length
            };
        } catch (error) {
            console.error('❌ Failed to publish course:', error);
            throw error;
        }
    }

    private groupLessonsByModule(lessons: CompleteLesson[]) {
        const modules = new Map<string, CompleteLesson[]>();

        for (const lesson of lessons) {
            if (!modules.has(lesson.moduleTitle)) {
                modules.set(lesson.moduleTitle, []);
            }
            modules.get(lesson.moduleTitle)!.push(lesson);
        }

        return Array.from(modules.entries()).map(([title, moduleLessons], index) => ({
            title,
            description: `Module ${index + 1} - ${title}`,
            order: index + 1,
            content: JSON.stringify({
                lessons: moduleLessons.map(l => ({
                    title: l.title,
                    order: l.order,
                    videoUrl: l.video.url,
                    audioUrl: l.audio.url,
                    thumbnail: l.video.thumbnail,
                    duration: l.video.duration,
                    transcript: l.script,
                    codeExamples: l.codeExamples || [],
                    exercises: l.exercises || [],
                    quiz: l.quiz,
                    slides: l.slides
                }))
            })
        }));
    }

    async updateCourseStatus(courseId: string, published: boolean): Promise<void> {
        await this.prisma.course.update({
            where: { id: courseId },
            data: { published }
        });

        console.log(`✅ Course ${courseId} ${published ? 'published' : 'unpublished'}`);
    }

    async getCourseStats(courseId: string) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: true,
                enrollments: true,
                _count: {
                    select: {
                        enrollments: true,
                        modules: true
                    }
                }
            }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        return {
            id: course.id,
            title: course.title,
            published: course.published,
            enrollments: course._count.enrollments,
            modules: course._count.modules,
            revenue: course._count.enrollments * course.price
        };
    }
}
