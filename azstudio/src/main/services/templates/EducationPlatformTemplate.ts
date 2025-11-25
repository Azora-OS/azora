import { FileChange } from '../ChangesetManager';
import { PlatformTemplate, TemplateMetadata } from './PlatformTemplate';

export interface EducationPlatformConfig {
  platformName: string;
  enableAI: boolean;
  enablePayments: boolean;
  enableCertificates: boolean;
  outputDir: string;
}

export class EducationPlatformTemplate implements PlatformTemplate {
  getMetadata(): TemplateMetadata {
    return {
      id: 'education-platform',
      name: 'Education Platform',
      description: 'Complete education platform with course management, enrollment, progress tracking, and AI content generation',
      category: 'education',
      features: [
        'Course Management',
        'Student Portal',
        'Enrollment System',
        'Progress Tracking',
        'Payment Integration',
        'Elara AI Content Generation',
        'Quiz & Assessment System',
        'Certificate Generation',
      ],
      version: '1.0.0',
    };
  }

  generate(config: EducationPlatformConfig): FileChange[] {
    const changes: FileChange[] = [];

    // Generate course management service
    changes.push(...this.generateCourseManagementService(config));

    // Generate student portal UI
    changes.push(...this.generateStudentPortalUI(config));

    // Generate enrollment and progress tracking
    changes.push(...this.generateEnrollmentSystem(config));

    // Generate payment integration if enabled
    if (config.enablePayments) {
      changes.push(...this.generatePaymentIntegration(config));
    }

    // Generate Elara AI content generation if enabled
    if (config.enableAI) {
      changes.push(...this.generateElaraAISystem(config));
    }

    return changes;
  }

  private generateCourseManagementService(config: EducationPlatformConfig): FileChange[] {
    const changes: FileChange[] = [];
    const serviceDir = `${config.outputDir}/services/course-management`;

    changes.push({
      path: `${serviceDir}/src/index.ts`,
      type: 'create',
      content: this.getCourseServiceIndex(),
    });

    changes.push({
      path: `${serviceDir}/src/controllers/course.controller.ts`,
      type: 'create',
      content: this.getCourseController(),
    });

    changes.push({
      path: `${serviceDir}/src/services/course.service.ts`,
      type: 'create',
      content: this.getCourseService(),
    });

    changes.push({
      path: `${serviceDir}/src/repositories/course.repository.ts`,
      type: 'create',
      content: this.getCourseRepository(),
    });

    changes.push({
      path: `${serviceDir}/prisma/schema.prisma`,
      type: 'create',
      content: this.getCoursePrismaSchema(),
    });

    changes.push({
      path: `${serviceDir}/src/types/course.types.ts`,
      type: 'create',
      content: this.getCourseTypes(),
    });

    return changes;
  }

  private generateStudentPortalUI(config: EducationPlatformConfig): FileChange[] {
    const changes: FileChange[] = [];
    const uiDir = `${config.outputDir}/apps/student-portal`;

    changes.push({
      path: `${uiDir}/src/app/page.tsx`,
      type: 'create',
      content: this.getStudentPortalHomePage(config),
    });

    changes.push({
      path: `${uiDir}/src/app/courses/page.tsx`,
      type: 'create',
      content: this.getCourseCatalogPage(),
    });

    changes.push({
      path: `${uiDir}/src/app/courses/[id]/page.tsx`,
      type: 'create',
      content: this.getCourseDetailPage(),
    });

    changes.push({
      path: `${uiDir}/src/app/learn/[courseId]/page.tsx`,
      type: 'create',
      content: this.getLearningPage(),
    });

    changes.push({
      path: `${uiDir}/src/app/dashboard/page.tsx`,
      type: 'create',
      content: this.getStudentDashboard(),
    });

    changes.push({
      path: `${uiDir}/src/hooks/useCourses.ts`,
      type: 'create',
      content: this.getCourseHooks(),
    });

    return changes;
  }

  private generateEnrollmentSystem(config: EducationPlatformConfig): FileChange[] {
    const changes: FileChange[] = [];
    const serviceDir = `${config.outputDir}/services/enrollment`;

    changes.push({
      path: `${serviceDir}/src/controllers/enrollment.controller.ts`,
      type: 'create',
      content: this.getEnrollmentController(),
    });

    changes.push({
      path: `${serviceDir}/src/services/progress.service.ts`,
      type: 'create',
      content: this.getProgressService(),
    });

    changes.push({
      path: `${serviceDir}/src/repositories/enrollment.repository.ts`,
      type: 'create',
      content: this.getEnrollmentRepository(),
    });

    return changes;
  }

  private generatePaymentIntegration(config: EducationPlatformConfig): FileChange[] {
    const changes: FileChange[] = [];
    const serviceDir = `${config.outputDir}/services/payment`;

    changes.push({
      path: `${serviceDir}/src/controllers/payment.controller.ts`,
      type: 'create',
      content: this.getPaymentController(),
    });

    changes.push({
      path: `${serviceDir}/src/services/stripe.service.ts`,
      type: 'create',
      content: this.getStripeService(),
    });

    return changes;
  }

  private generateElaraAISystem(config: EducationPlatformConfig): FileChange[] {
    const changes: FileChange[] = [];
    const serviceDir = `${config.outputDir}/services/elara-ai`;

    changes.push({
      path: `${serviceDir}/src/services/elara-orchestrator.ts`,
      type: 'create',
      content: this.getElaraOrchestrator(),
    });

    changes.push({
      path: `${serviceDir}/src/services/content-generator.ts`,
      type: 'create',
      content: this.getContentGenerator(),
    });

    changes.push({
      path: `${serviceDir}/src/services/quiz-generator.ts`,
      type: 'create',
      content: this.getQuizGenerator(),
    });

    return changes;
  }

  // Template content generators - Service Layer
  private getCourseServiceIndex(): string {
    return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CourseController } from './controllers/course.controller';

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'course-management' });
});

const courseController = new CourseController();
app.use('/api/courses', courseController.router);

app.listen(PORT, () => {
  console.log(\`Course Management service running on port \${PORT}\`);
});

export default app;
`;
  }

  private getCourseController(): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';

export class CourseController {
  public router: Router;
  private courseService: CourseService;

  constructor() {
    this.router = Router();
    this.courseService = new CourseService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getAllCourses.bind(this));
    this.router.get('/:id', this.getCourseById.bind(this));
    this.router.post('/', this.createCourse.bind(this));
    this.router.put('/:id', this.updateCourse.bind(this));
    this.router.delete('/:id', this.deleteCourse.bind(this));
  }

  private async getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await this.courseService.findAll();
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  private async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await this.courseService.findById(req.params.id);
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  private async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await this.courseService.create(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  private async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await this.courseService.update(req.params.id, req.body);
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  private async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.courseService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  private getCourseService(): string {
    return `import { PrismaClient } from '@prisma/client';
import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDTO, UpdateCourseDTO } from '../types/course.types';

export class CourseService {
  private repository: CourseRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.repository = new CourseRepository(prisma);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async create(data: CreateCourseDTO) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateCourseDTO) {
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
`;
  }

  private getCourseRepository(): string {
    return `import { PrismaClient } from '@prisma/client';
import { CreateCourseDTO, UpdateCourseDTO } from '../types/course.types';

export class CourseRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.course.findMany({
      include: { modules: true, instructor: true }
    });
  }

  async findById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { modules: { include: { lessons: true } }, instructor: true }
    });
  }

  async create(data: CreateCourseDTO) {
    return this.prisma.course.create({ data });
  }

  async update(id: string, data: UpdateCourseDTO) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
`;
  }

  private getCoursePrismaSchema(): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float
  published   Boolean  @default(false)
  instructorId String
  instructor  User     @relation(fields: [instructorId], references: [id])
  modules     Module[]
  enrollments Enrollment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Module {
  id        String   @id @default(uuid())
  title     String
  order     Int
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  lessons   Lesson[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Lesson {
  id        String   @id @default(uuid())
  title     String
  content   String
  type      String
  order     Int
  moduleId  String
  module    Module   @relation(fields: [moduleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  courses   Course[]
  enrollments Enrollment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Enrollment {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  progress  Int      @default(0)
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  }

  private getCourseTypes(): string {
    return `export interface CreateCourseDTO {
  title: string;
  description: string;
  price: number;
  instructorId: string;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  price?: number;
  published?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  published: boolean;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}
`;
  }

  // UI Layer Templates
  private getStudentPortalHomePage(config: EducationPlatformConfig): string {
    return `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">${config.platformName}</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Browse Courses</h2>
            <p className="text-gray-600">Explore our catalog of courses</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">My Learning</h2>
            <p className="text-gray-600">Continue your enrolled courses</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Achievements</h2>
            <p className="text-gray-600">View your certificates and progress</p>
          </div>
        </div>
      </main>
    </div>
  );
}
`;
  }

  private getCourseCatalogPage(): string {
    return `'use client';
import { useCourses } from '@/hooks/useCourses';

export default function CoursesPage() {
  const { courses, isLoading } = useCourses();

  if (isLoading) return <div>Loading courses...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Course Catalog</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses?.map((course: any) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">\${course.price}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
  }

  private getCourseDetailPage(): string {
    return `'use client';
import { useCourse } from '@/hooks/useCourses';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { course, isLoading } = useCourse(params.id);

  if (isLoading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-xl text-gray-600 mb-8">{course.description}</p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Course Modules</h2>
          {course.modules?.map((module: any, idx: number) => (
            <div key={module.id} className="mb-4 p-4 border rounded">
              <h3 className="font-semibold">Module {idx + 1}: {module.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
  }

  private getLearningPage(): string {
    return `'use client';
import { useState } from 'react';

export default function LearningPage({ params }: { params: { courseId: string } }) {
  const [currentLesson, setCurrentLesson] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white shadow-lg p-4">
          <h2 className="font-semibold mb-4">Course Content</h2>
          {/* Module and lesson list */}
        </aside>
        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Lesson Title</h1>
            <div className="prose max-w-none">
              {/* Lesson content */}
            </div>
            <div className="mt-8 flex justify-between">
              <button className="px-4 py-2 border rounded">Previous</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
`;
  }

  private getStudentDashboard(): string {
    return `'use client';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
            {/* Course list with progress */}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {/* Activity feed */}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
  }

  private getCourseHooks(): string {
    return `import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch(\`\${API_URL}/api/courses\`);
      const data = await res.json();
      return data.data;
    }
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await fetch(\`\${API_URL}/api/courses/\${id}\`);
      const data = await res.json();
      return data.data;
    },
    enabled: !!id
  });
}
`;
  }

  // Enrollment System Templates
  private getEnrollmentController(): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service';

export class EnrollmentController {
  public router: Router;
  private enrollmentService: EnrollmentService;

  constructor() {
    this.router = Router();
    this.enrollmentService = new EnrollmentService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/enroll', this.enroll.bind(this));
    this.router.get('/user/:userId', this.getUserEnrollments.bind(this));
    this.router.put('/:id/progress', this.updateProgress.bind(this));
  }

  private async enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await this.enrollmentService.enroll(req.body);
      res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
      next(error);
    }
  }

  private async getUserEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await this.enrollmentService.getUserEnrollments(req.params.userId);
      res.json({ success: true, data: enrollments });
    } catch (error) {
      next(error);
    }
  }

  private async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await this.enrollmentService.updateProgress(req.params.id, req.body.progress);
      res.json({ success: true, data: enrollment });
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  private getProgressService(): string {
    return `import { PrismaClient } from '@prisma/client';

export class ProgressService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async trackProgress(enrollmentId: string, lessonId: string) {
    return this.prisma.progress.create({
      data: { enrollmentId, lessonId, completed: true }
    });
  }

  async getProgress(enrollmentId: string) {
    return this.prisma.progress.findMany({
      where: { enrollmentId },
      include: { lesson: true }
    });
  }

  async calculateCompletion(enrollmentId: string): Promise<number> {
    const total = await this.prisma.lesson.count();
    const completed = await this.prisma.progress.count({
      where: { enrollmentId, completed: true }
    });
    return total > 0 ? (completed / total) * 100 : 0;
  }
}
`;
  }

  private getEnrollmentRepository(): string {
    return `import { PrismaClient } from '@prisma/client';

export class EnrollmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, courseId: string) {
    return this.prisma.enrollment.create({
      data: { userId, courseId }
    });
  }

  async findByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });
  }

  async updateProgress(id: string, progress: number) {
    return this.prisma.enrollment.update({
      where: { id },
      data: { progress, completed: progress >= 100 }
    });
  }
}
`;
  }

  // Payment Integration Templates
  private getPaymentController(): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { StripeService } from '../services/stripe.service';

export class PaymentController {
  public router: Router;
  private stripeService: StripeService;

  constructor() {
    this.router = Router();
    this.stripeService = new StripeService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/create-payment-intent', this.createPaymentIntent.bind(this));
    this.router.post('/webhook', this.handleWebhook.bind(this));
  }

  private async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, courseId } = req.body;
      const paymentIntent = await this.stripeService.createPaymentIntent(amount, courseId);
      res.json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
      next(error);
    }
  }

  private async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.stripeService.handleWebhook(req.body, req.headers['stripe-signature'] as string);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  private getStripeService(): string {
    return `import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentIntent(amount: number, courseId: string) {
    return this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: { courseId }
    });
  }

  async handleWebhook(body: any, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'payment_intent.succeeded') {
      // Handle successful payment
      console.log('Payment succeeded:', event.data.object);
    }

    return event;
  }
}
`;
  }

  // Elara AI System Templates
  private getElaraOrchestrator(): string {
    return `import { ContentGenerator } from './content-generator';
import { QuizGenerator } from './quiz-generator';

export class ElaraOrchestrator {
  private contentGenerator: ContentGenerator;
  private quizGenerator: QuizGenerator;

  constructor() {
    this.contentGenerator = new ContentGenerator();
    this.quizGenerator = new QuizGenerator();
  }

  async generateCourse(topic: string, modules: number) {
    const courseOutline = await this.contentGenerator.generateOutline(topic, modules);
    const lessons = await this.contentGenerator.generateLessons(courseOutline);
    const quizzes = await this.quizGenerator.generateQuizzes(lessons);

    return {
      outline: courseOutline,
      lessons,
      quizzes
    };
  }

  async generateLesson(topic: string, context: string) {
    return this.contentGenerator.generateLesson(topic, context);
  }

  async generateQuiz(lessonContent: string) {
    return this.quizGenerator.generateFromContent(lessonContent);
  }
}
`;
  }

  private getContentGenerator(): string {
    return `import OpenAI from 'openai';

export class ContentGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateOutline(topic: string, modules: number) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an expert course designer. Create detailed course outlines.'
      }, {
        role: 'user',
        content: \`Create a course outline for "\${topic}" with \${modules} modules.\`
      }]
    });

    return response.choices[0].message.content;
  }

  async generateLesson(topic: string, context: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an expert educator. Create engaging lesson content.'
      }, {
        role: 'user',
        content: \`Create a lesson on "\${topic}". Context: \${context}\`
      }]
    });

    return response.choices[0].message.content;
  }

  async generateLessons(outline: string) {
    // Parse outline and generate lessons for each topic
    return [];
  }
}
`;
  }

  private getQuizGenerator(): string {
    return `import OpenAI from 'openai';

export class QuizGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateFromContent(content: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an expert at creating educational assessments. Generate quiz questions in JSON format.'
      }, {
        role: 'user',
        content: \`Generate 5 multiple-choice questions based on this content: \${content}\`
      }]
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  }

  async generateQuizzes(lessons: any[]) {
    const quizzes = [];
    for (const lesson of lessons) {
      const quiz = await this.generateFromContent(lesson.content);
      quizzes.push({ lessonId: lesson.id, questions: quiz });
    }
    return quizzes;
  }
}
`;
  }
}
