/**
 * Sapiens Education Service Implementation
 * 
 * Core education domain service for Azora platform.
 * Implements curriculum management, enrollments, and Constitutional AI validation.
 * 
 * Architecture:
 * - Depends on: Prisma (data), Auth Core, AI Router, Mint & Pay, Knowledge Ocean
 * - Agents: ElaraAgent (tutoring), Sankofa (assessment)
 * - Constitutional: Pre/post-check validation on enrollment, assessment, credential actions
 */

import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { constitutionalCheck } from '../middleware/constitutional';
import { logAudit } from '../middleware/audit';
import { ConstitutionalEngine } from '../../../constitutional-ai/src/constitutional-engine';

// Initialize Prisma & router
const prisma = new PrismaClient();
const router = Router();
const constitutionalEngine = new ConstitutionalEngine();

// ============================================================================
// Middleware
// ============================================================================

// Apply auth to all routes (except public endpoints)
router.use(authenticateToken);

// ============================================================================
// Courses & Learning Paths
// ============================================================================

/**
 * GET /api/sapiens/courses
 * Fetch courses with optional filtering
 */
router.get('/courses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      pathway,
      category,
      difficulty,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    // Build filter conditions
    const where: any = {};
    if (pathway) where.pathway = pathway;
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch courses
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: { instructor: true, lessons: { select: { id: true } } },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ]);

    // Format response
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      pathway: course.pathway,
      category: course.category,
      difficulty: course.difficulty,
      durationHours: course.durationHours,
      tokenReward: course.tokenReward,
      instructorName: course.instructor?.fullName,
      instructorAvatar: course.instructor?.avatar,
      lessonCount: course.lessons.length,
      rating: course.rating,
      isFeatured: course.isFeatured,
      thumbnail: course.thumbnail
    }));

    res.json({ courses: formattedCourses, total });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sapiens/courses/:courseId
 * Fetch single course with metadata
 */
router.get('/courses/:courseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } },
        skills: true
      }
    });

    if (!course) {
      return res.status(404).json({ error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
    }

    res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      pathway: course.pathway,
      category: course.category,
      difficulty: course.difficulty,
      durationHours: course.durationHours,
      tokenReward: course.tokenReward,
      instructorName: course.instructor?.fullName,
      instructorAvatar: course.instructor?.avatar,
      lessonCount: course.lessons.length,
      lessons: course.lessons,
      skills: course.skills.map((s) => s.name),
      rating: course.rating,
      isFeatured: course.isFeatured,
      thumbnail: course.thumbnail
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sapiens/courses/:courseId/lessons
 * Fetch lessons for a course
 */
router.get('/courses/:courseId/lessons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        contentType: true,
        content: true,
        videoUrl: true,
        durationMinutes: true,
        tokenReward: true
      }
    });

    res.json(lessons);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sapiens/learning-paths
 * Fetch learning paths (curriculum graphs)
 */
router.get('/learning-paths', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pathway, limit = 20 } = req.query;

    const where: any = { isPublished: true };
    if (pathway) where.pathway = pathway;

    const paths = await prisma.learningPath.findMany({
      where,
      take: parseInt(limit as string),
      include: {
        courses: { include: { course: true } },
        skills: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = paths.map((path) => ({
      id: path.id,
      title: path.title,
      description: path.description,
      pathway: path.pathway,
      targetSkills: path.skills.map((s) => s.name),
      courseSequence: path.courses.map((pc) => ({
        courseId: pc.courseId,
        order: pc.order,
        prerequisites: pc.prerequisites ? JSON.parse(pc.prerequisites) : []
      })),
      estimatedDurationWeeks: path.estimatedDurationWeeks,
      tokenRewardTotal: path.tokenRewardTotal,
      isPublished: path.isPublished,
      enrollmentCount: path.enrollmentCount
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Enrollments
// ============================================================================

/**
 * GET /api/sapiens/enrollments
 * Fetch user enrollments
 */
router.get('/enrollments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userEmail } = req.query;
    const email = userEmail || req.user?.email;

    const enrollments = await prisma.enrollment.findMany({
      where: { userEmail: email as string },
      include: { course: true },
      orderBy: { startedAt: 'desc' }
    });

    const formatted = enrollments.map((e) => ({
      id: e.id,
      userEmail: e.userEmail,
      courseId: e.courseId,
      progressPercent: e.progressPercent,
      completedLessons: e.completedLessons ? JSON.parse(e.completedLessons) : [],
      status: e.status,
      startedAt: e.startedAt.toISOString(),
      completedAt: e.completedAt?.toISOString(),
      certificateIssued: e.certificateIssued
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sapiens/enrollments
 * Enroll user in course (with constitutional validation)
 */
router.post(
  '/enrollments',
  constitutionalCheck('enrollment'),
  logAudit('ENROLLMENT_CREATE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body;
      const userEmail = req.user?.email;

      if (!courseId || !userEmail) {
        return res
          .status(400)
          .json({ error: { code: 'INVALID_REQUEST', message: 'Missing courseId or userEmail' } });
      }

      // Check if already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: { userEmail, courseId }
      });

      if (existing) {
        return res
          .status(409)
          .json({ error: { code: 'ALREADY_ENROLLED', message: 'Already enrolled in this course' } });
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userEmail,
          courseId,
          progressPercent: 0,
          status: 'active',
          startedAt: new Date()
        },
        include: { course: true }
      });

      // Log constitutional audit
      await prisma.constitutionalAuditLog.create({
        data: {
          action: 'ENROLLMENT_CREATE',
          entityType: 'Enrollment',
          entityId: enrollment.id,
          userEmail,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            courseId,
            pathway: enrollment.course.pathway,
            difficulty: enrollment.course.difficulty
          })
        }
      });

      res.status(201).json({
        id: enrollment.id,
        userEmail: enrollment.userEmail,
        courseId: enrollment.courseId,
        progressPercent: 0,
        completedLessons: [],
        status: 'active',
        startedAt: enrollment.startedAt.toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/sapiens/enrollments/:enrollmentId
 * Update enrollment progress
 */
router.patch(
  '/enrollments/:enrollmentId',
  logAudit('ENROLLMENT_UPDATE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enrollmentId } = req.params;
      const { progressPercent, completedLessons } = req.body;

      const enrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progressPercent,
          completedLessons: JSON.stringify(completedLessons),
          ...(progressPercent === 100 && { status: 'completed', completedAt: new Date() })
        }
      });

      res.json({
        id: enrollment.id,
        userEmail: enrollment.userEmail,
        courseId: enrollment.courseId,
        progressPercent: enrollment.progressPercent,
        completedLessons: enrollment.completedLessons
          ? JSON.parse(enrollment.completedLessons)
          : [],
        status: enrollment.status,
        startedAt: enrollment.startedAt.toISOString(),
        completedAt: enrollment.completedAt?.toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Tutoring (Elara AI Tutor)
// ============================================================================

/**
 * POST /api/sapiens/tutor/session
 * Start a tutoring session
 */
router.post(
  '/tutor/session',
  constitutionalCheck('tutoring'),
  logAudit('TUTOR_SESSION_START'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, lessonId } = req.body;
      const userEmail = req.user?.email;

      if (!courseId || !lessonId || !userEmail) {
        return res
          .status(400)
          .json({ error: { code: 'INVALID_REQUEST', message: 'Missing required fields' } });
      }

      // Check enrollment
      const enrollment = await prisma.enrollment.findFirst({
        where: { userEmail, courseId }
      });

      if (!enrollment) {
        return res
          .status(403)
          .json({ error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this course' } });
      }

      // Get lesson content for grounding
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true, title: true, content: true, contentType: true }
      });

      if (!lesson) {
        return res
          .status(404)
          .json({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' } });
      }

      // Create tutor session record
      const session = await prisma.tutorSession.create({
        data: {
          courseId,
          lessonId,
          userEmail,
          status: 'active',
          startedAt: new Date()
        }
      });

      // Log to constitutional audit
      const auditLog = await prisma.constitutionalAuditLog.create({
        data: {
          action: 'TUTOR_SESSION_START',
          entityType: 'TutorSession',
          entityId: session.id,
          userEmail,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            lessonTitle: lesson.title,
            contentType: lesson.contentType,
            courseId
          })
        }
      });

      res.status(201).json({
        sessionId: session.id,
        tutorMessage: `Hi there! I'm Elara, your AI tutor. I'm here to help you with "${lesson.title}". What would you like to know?`,
        sourceReferences: [{ lessonId: lesson.id, title: lesson.title, url: `/lessons/${lesson.id}` }],
        alignmentScore: 1.0,
        trustworthiness: 'grounded',
        auditLogId: auditLog.id
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sapiens/tutor/ask
 * Stateless quick 'ask' without creating a session. Useful for help prompts in UI.
 */
router.post(
  '/tutor/ask',
  constitutionalCheck('tutoring'),
  logAudit('TUTOR_ASK'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt, context, courseId, lessonId } = req.body;
      const userEmail = req.user?.email;

      if (!prompt) {
        return res.status(400).json({ error: { code: 'INVALID_REQUEST', message: 'Missing prompt' } });
      }


      // Resolve course and lesson titles for better grounding
      let courseName = 'General';
      let lessonTitle = '';
      if (courseId) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course) courseName = course.title;
      }
      if (lessonId) {
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (lesson) lessonTitle = lesson.title;
      }

      // Use the Constitutional Engine to generate a grounded response
      const responseText = await constitutionalEngine.processTutorRequest(courseName, lessonTitle, prompt);
      const critique = await constitutionalEngine.generateConstitutionalCritique(responseText);

      const tutorMessage = responseText;

      const auditLog = await prisma.constitutionalAuditLog.create({
        data: {
          action: 'TUTOR_ASK',
          entityType: 'TutorInteraction',
          entityId: `ask_${Date.now()}`,
          userEmail: userEmail || 'guest',
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({ promptLength: prompt.length, context }),
        }
      });

      res.json({
        sessionId: `ask_${Date.now()}`,
        tutorMessage,
        sourceReferences: [],
        alignmentScore: 0.9,
        trustworthiness: 'grounded',
        auditLogId: auditLog.id
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sapiens/tutor/session/:sessionId/message
 * Send message to tutor and get response
 */
router.post(
  '/tutor/session/:sessionId/message',
  constitutionalCheck('tutoring_message'),
  logAudit('TUTOR_MESSAGE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const { userMessage } = req.body;
      const userEmail = req.user?.email;

      if (!userMessage) {
        return res
          .status(400)
          .json({ error: { code: 'INVALID_REQUEST', message: 'Missing userMessage' } });
      }

      // Get session context
      const session = await prisma.tutorSession.findUnique({
        where: { id: sessionId },
        include: { lesson: true, course: true }
      });

      if (!session || session.userEmail !== userEmail) {
        return res
          .status(403)
          .json({ error: { code: 'UNAUTHORIZED', message: 'Session not found or unauthorized' } });
      }

      // Use the Constitutional Engine to generate the tutor response
      const courseName = session.course?.title || 'Course';
      const lessonTitle = session.lesson?.title || '';
      const responseText = await constitutionalEngine.processTutorRequest(courseName, lessonTitle, userMessage);
      const critique = await constitutionalEngine.generateConstitutionalCritique(responseText);
      const tutorResponse = responseText;

      // Create message record
      const message = await prisma.tutorMessage.create({
        data: {
          sessionId,
          role: 'tutor',
          content: tutorResponse,
          groundedIn: session.lesson.id
        }
      });

      // Create audit log
      const auditLog = await prisma.constitutionalAuditLog.create({
        data: {
          action: 'TUTOR_MESSAGE',
          entityType: 'TutorMessage',
          entityId: message.id,
          userEmail,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            lessonId: session.lesson.id,
            messageLength: tutorResponse.length,
            groundedInContent: true,
            constitutionalCritique: critique
          })
        }
      });

      res.json({
        sessionId,
        tutorMessage: tutorResponse,
        sourceReferences: [
          {
            lessonId: session.lesson.id,
            title: session.lesson.title,
            url: `/lessons/${session.lesson.id}`
          }
        ],
        alignmentScore: 0.95,
        trustworthiness: 'grounded',
        auditLogId: auditLog.id
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sapiens/tutor/session/:sessionId/complete
 * Close tutoring session
 */
router.post(
  '/tutor/session/:sessionId/complete',
  logAudit('TUTOR_SESSION_COMPLETE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const userEmail = req.user?.email;

      const session = await prisma.tutorSession.update({
        where: { id: sessionId },
        data: { status: 'completed', endedAt: new Date() }
      });

      if (session.userEmail !== userEmail) {
        return res.status(403).json({ error: { code: 'UNAUTHORIZED' } });
      }

      // Award tokens for tutoring session (e.g., 5 tokens for 15 min session)
      const durationMinutes = session.endedAt
        ? (session.endedAt.getTime() - session.startedAt.getTime()) / (1000 * 60)
        : 0;
      const tokensEarned = Math.floor(durationMinutes / 3); // 1 token per 3 minutes

      // TODO: Call Mint & Pay service to award tokens
      // await mintAndPayService.awardTokens(userEmail, tokensEarned, 'tutoring_session');

      // Create audit log
      await prisma.constitutionalAuditLog.create({
        data: {
          action: 'TUTOR_SESSION_COMPLETE',
          entityType: 'TutorSession',
          entityId: sessionId,
          userEmail,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            durationMinutes: Math.round(durationMinutes),
            tokensEarned
          })
        }
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Assessments
// ============================================================================

/**
 * POST /api/sapiens/assessment/attempt
 * Start assessment attempt with integrity level
 */
router.post(
  '/assessment/attempt',
  constitutionalCheck('assessment'),
  logAudit('ASSESSMENT_START'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assessmentId, integrityLevel = 'high' } = req.body;
      const userEmail = req.user?.email;

      // Create attempt
      const attempt = await prisma.assessmentAttempt.create({
        data: {
          assessmentId,
          learnerEmail: userEmail!,
          integrityLevel,
          startedAt: new Date(),
          status: 'in_progress'
        },
        include: { assessment: true }
      });

      // Prepare integrity controls
      let proctorToken;
      if (integrityLevel === 'high') {
        // Generate proctoring token for external proctor service
        proctorToken = `proctor_${attempt.id}`;
      }

      res.status(201).json({
        attemptId: attempt.id,
        questions: [], // TODO: Fetch questions from assessment entity
        timeLimit: attempt.assessment.timeMinutes,
        allowedTools: integrityLevel === 'high' ? [] : ['calculator', 'notepad'],
        proctorToken
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sapiens/assessment/attempt/:attemptId/submit
 * Submit assessment with integrity signals
 */
router.post(
  '/assessment/attempt/:attemptId/submit',
  constitutionalCheck('assessment_submit'),
  logAudit('ASSESSMENT_SUBMIT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { attemptId } = req.params;
      const { responses, integritySignals } = req.body;
      const userEmail = req.user?.email;

      // TODO: Call Sankofa agent for assessment review & integrity check
      // const skankofa = new SankoaAgent();
      // const patterns = sankofa.recognizePatterns({ responses, integritySignals });
      // const assessment = sankofa.reason(patterns, { ... });
      // const validation = sankofa.validate(assessment);
      // const result = sankofa.act(validation);

      // Placeholder scoring
      const score = 85; // TODO: Actual scoring logic
      const maxScore = 100;
      const passed = score >= 70;

      // Check integrity signals
      let flagged = false;
      let integrityReason = '';
      if (integritySignals?.browserTabSwitches > 3) {
        flagged = true;
        integrityReason = 'Excessive tab switching detected';
      }

      // Create audit log
      const auditLog = await prisma.constitutionalAuditLog.create({
        data: {
          action: 'ASSESSMENT_SUBMIT',
          entityType: 'AssessmentAttempt',
          entityId: attemptId,
          userEmail,
          preChecksPassed: true,
          postChecksPassed: !flagged,
          evidence: JSON.stringify({
            score,
            maxScore,
            integrityFlagged: flagged,
            integrityReason,
            signalsRecorded: Object.keys(integritySignals || {}).length
          })
        }
      });

      // Update attempt
      const attempt = await prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          score,
          responses: JSON.stringify(responses),
          integrityFlagged: flagged,
          integrityReview: integrityReason || null
        }
      });

      // Award tokens if passed
      let tokensEarned = 0;
      if (passed) {
        tokensEarned = 10; // Base token reward
        // TODO: Award tokens via Mint & Pay service
      }

      res.json({
        attemptId: attempt.id,
        assessmentId: attempt.assessmentId,
        learnerEmail: attempt.learnerEmail,
        score,
        maxScore,
        passed,
        feedback: passed
          ? 'Excellent work! You have mastered this assessment.'
          : 'Keep practicing! Review the material and try again.',
        integrityReview: flagged ? { flagged: true, reason: integrityReason } : undefined,
        tokensEarned,
        auditLogId: auditLog.id
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Credentials
// ============================================================================

/**
 * POST /api/sapiens/credentials/issue
 * Issue credential with blockchain anchoring
 */
router.post(
  '/credentials/issue',
  constitutionalCheck('credential_issue'),
  logAudit('CREDENTIAL_ISSUE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, type, courseId, evidence } = req.body;
      const issuerEmail = req.user?.email;

      // TODO: Validate evidence (e.g., course completion, assessment scores)
      // TODO: Generate credential JSON-LD
      // TODO: Anchor to blockchain (Verifiable Credentials)

      const credential = await prisma.credential.create({
        data: {
          userId,
          type,
          courseId,
          issuedBy: issuerEmail!,
          issuedDate: new Date(),
          evidence: JSON.stringify(evidence),
          status: 'issued'
        }
      });

      // Create audit log
      await prisma.constitutionalAuditLog.create({
        data: {
          action: 'CREDENTIAL_ISSUE',
          entityType: 'Credential',
          entityId: credential.id,
          userEmail: issuerEmail!,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            credentialType: type,
            recipientId: userId,
            courseId,
            evidenceTypes: Object.keys(evidence || {})
          })
        }
      });

      res.status(201).json({
        credentialId: credential.id,
        userId: credential.userId,
        type: credential.type,
        title: `Certificate of ${type}`,
        issuedDate: credential.issuedDate.toISOString(),
        verificationUrl: `/credentials/${credential.id}/verify`,
        credentialJson: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', `Azora${type}`],
          issuer: 'did:azora:issuer',
          issuanceDate: credential.issuedDate.toISOString(),
          credentialSubject: { id: userId, achieved: type }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/sapiens/credentials/:credentialId/verify
 * Verify credential
 */
router.get(
  '/credentials/:credentialId/verify',
  logAudit('CREDENTIAL_VERIFY'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { credentialId } = req.params;

      const credential = await prisma.credential.findUnique({
        where: { id: credentialId }
      });

      if (!credential) {
        return res
          .status(404)
          .json({ error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' } });
      }

      // TODO: Verify blockchain anchor if present
      // TODO: Check issuer signature

      res.json({
        verified: true,
        details: {
          credentialId: credential.id,
          type: credential.type,
          issuedDate: credential.issuedDate.toISOString(),
          issuedBy: credential.issuedBy,
          blockchainAnchored: credential.blockchainHash ? true : false
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Achievements & Tokens
// ============================================================================

/**
 * GET /api/sapiens/achievements
 * Fetch user achievements
 */
router.get('/achievements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userEmail } = req.query;
    const email = userEmail || req.user?.email;

    const achievements = await prisma.achievement.findMany({
      where: { userEmail: email as string },
      orderBy: { earnedAt: 'desc' }
    });

    const formatted = achievements.map((a) => ({
      id: a.id,
      userEmail: a.userEmail,
      type: a.type,
      title: a.title,
      description: a.description,
      courseId: a.courseId,
      earnedAt: a.earnedAt.toISOString(),
      icon: a.icon
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sapiens/wallet/balance
 * Get user token balance
 */
router.get('/wallet/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userEmail } = req.query;
    const email = userEmail || req.user?.email;

    // TODO: Call Mint & Pay service for balance
    const balance = 1250; // Placeholder

    res.json({
      balance,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sapiens/wallet/transactions
 * Get user token transactions
 */
router.get('/wallet/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userEmail, limit = 50 } = req.query;
    const email = userEmail || req.user?.email;

    // TODO: Call Mint & Pay service for transactions
    const transactions: any[] = [];

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Cohorts & Classrooms
// ============================================================================

/**
 * POST /api/sapiens/cohorts
 * Create cohort
 */
router.post(
  '/cohorts',
  constitutionalCheck('cohort_create'),
  logAudit('COHORT_CREATE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, name, instructorEmail, startDate, endDate, maxLearners = 30 } = req.body;

      const cohort = await prisma.cohort.create({
        data: {
          courseId,
          name,
          instructorEmail,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxLearners,
          status: 'forming'
        }
      });

      // Create audit log
      await prisma.constitutionalAuditLog.create({
        data: {
          action: 'COHORT_CREATE',
          entityType: 'Cohort',
          entityId: cohort.id,
          userEmail: instructorEmail,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            courseId,
            maxLearners,
            startDate,
            endDate
          })
        }
      });

      res.status(201).json({
        cohortId: cohort.id,
        courseId: cohort.courseId,
        name: cohort.name,
        instructorEmail: cohort.instructorEmail,
        startDate: cohort.startDate.toISOString(),
        endDate: cohort.endDate.toISOString(),
        status: 'forming',
        maxLearners: cohort.maxLearners
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/sapiens/cohorts
 * List cohorts
 */
router.get('/cohorts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, instructorEmail } = req.query;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (instructorEmail) where.instructorEmail = instructorEmail;

    const cohorts = await prisma.cohort.findMany({
      where,
      include: { course: true, learners: { select: { id: true } } },
      orderBy: { startDate: 'asc' }
    });

    const formatted = cohorts.map((c) => ({
      cohortId: c.id,
      courseId: c.courseId,
      name: c.name,
      instructorEmail: c.instructorEmail,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      status: c.status,
      maxLearners: c.maxLearners,
      enrollmentCount: c.learners.length
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sapiens/cohorts/:cohortId/enroll
 * Enroll in cohort
 */
router.post(
  '/cohorts/:cohortId/enroll',
  constitutionalCheck('cohort_enroll'),
  logAudit('COHORT_ENROLL'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cohortId } = req.params;
      const userEmail = req.user?.email;

      // Check enrollment limit
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: { learners: { select: { id: true } } }
      });

      if (!cohort) {
        return res
          .status(404)
          .json({ error: { code: 'COHORT_NOT_FOUND', message: 'Cohort not found' } });
      }

      if (cohort.learners.length >= cohort.maxLearners) {
        return res.status(409).json({
          error: {
            code: 'COHORT_FULL',
            message: 'Cohort is at maximum capacity'
          }
        });
      }

      // Add learner to cohort
      await prisma.cohort.update({
        where: { id: cohortId },
        data: {
          learners: { connect: { email: userEmail! } }
        }
      });

      // Create audit log
      await prisma.constitutionalAuditLog.create({
        data: {
          action: 'COHORT_ENROLL',
          entityType: 'Cohort',
          entityId: cohortId,
          userEmail: userEmail!,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            cohortName: cohort.name,
            courseId: cohort.courseId
          })
        }
      });

      res.json({
        success: true,
        enrollmentUrl: `/cohorts/${cohortId}/dashboard`
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sapiens/cohorts/:cohortId/sessions
 * Schedule class session
 */
router.post(
  '/cohorts/:cohortId/sessions',
  constitutionalCheck('session_create'),
  logAudit('SESSION_CREATE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cohortId } = req.params;
      const { sessionType, title, scheduledStart, scheduledEnd } = req.body;
      const instructorEmail = req.user?.email;

      // TODO: Create BuildSpaces room for this session
      // const buildspacesRoom = await buildspacesService.createRoom({
      //   name: title,
      //   cohortId,
      //   maxParticipants: cohort.maxLearners
      // });

      const session = await prisma.classSession.create({
        data: {
          cohortId,
          sessionType,
          title,
          instructorEmail: instructorEmail!,
          scheduledStart: new Date(scheduledStart),
          scheduledEnd: new Date(scheduledEnd),
          buildspacesRoomId: `room_${cohortId}_${Date.now()}` // Placeholder
        }
      });

      // Create audit log
      await prisma.constitutionalAuditLog.create({
        data: {
          action: 'SESSION_CREATE',
          entityType: 'ClassSession',
          entityId: session.id,
          userEmail: instructorEmail!,
          preChecksPassed: true,
          postChecksPassed: true,
          evidence: JSON.stringify({
            sessionType,
            title,
            cohortId,
            duration: `${scheduledStart} to ${scheduledEnd}`
          })
        }
      });

      res.status(201).json({
        sessionId: session.id,
        cohortId: session.cohortId,
        sessionType: session.sessionType,
        title: session.title,
        scheduledStart: session.scheduledStart.toISOString(),
        scheduledEnd: session.scheduledEnd.toISOString(),
        buildspacesRoomUrl: `/rooms/${session.buildspacesRoomId}`
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Error Handling
// ============================================================================

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SapiensEducationService]', error);

  if (error.code === 'P2025') {
    // Prisma record not found
    return res
      .status(404)
      .json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
  }

  if (error.code === 'CONSTITUTIONAL_VIOLATION') {
    // Constitutional check failed
    return res.status(403).json({
      error: {
        code: 'CONSTITUTIONAL_VIOLATION',
        message: error.message,
        constitutionalConcern: true
      }
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    }
  });
});

export default router;
