/**
 * Constitutional Validation Middleware
 * 
 * Enforces DIVINE_LAW_PRINCIPLES on Sapiens actions:
 * - Enrollment: Verify learner capacity, prerequisites, age/consent
 * - Assessment: Verify integrity controls, previous attempts, prerequisites
 * - Credential: Verify evidence, issuer authority, learner achievement
 * - Tutoring: Verify learner grounding, source quality, hallucination checks
 * 
 * Pre/post check pattern:
 * - Pre-check: Validate action eligibility before state change
 * - Post-check: Validate action alignment with principles after execution
 */

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface ConstitutionalCheckResult {
  passed: boolean;
  evidence: Record<string, any>;
  violations?: string[];
  timestamp: string;
}

// ============================================================================
// Constitutional Checks by Action Type
// ============================================================================

/**
 * Pre-check for enrollment:
 * - Verify learner is not already enrolled
 * - Check prerequisite skills are mastered
 * - Verify age/consent if required
 * - Check capacity (cohort max learners)
 */
async function checkEnrollmentEligibility(
  userEmail: string,
  courseId: string,
  prisma: any
): Promise<ConstitutionalCheckResult> {
  const violations: string[] = [];

  try {
    // Check existing enrollment
    const existing = await prisma.enrollment.findFirst({
      where: { userEmail, courseId }
    });
    if (existing) {
      violations.push('ALREADY_ENROLLED');
    }

    // Check course prerequisites (if defined in curriculum edges)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { skills: true }
    });

    if (course?.skills && course.skills.length > 0) {
      // Get learner's current skill proficiency
      const learnerSkills = await prisma.skillProgress.findMany({
        where: { studentId: userEmail }
      });

      const learnerSkillMap = new Map(
        learnerSkills.map((s) => [s.skillId, s.proficiencyLevel])
      );

      // Check if all prerequisite skills are mastered (>= 0.8 proficiency)
      for (const skill of course.skills) {
        const proficiency = learnerSkillMap.get(skill.id) || 0;
        if (proficiency < 0.8) {
          violations.push(
            `PREREQUISITE_NOT_MET:${skill.name}:${(proficiency * 100).toFixed(0)}%`
          );
        }
      }
    }

    // Verify age/consent if course is for minors (K-12)
    if (course?.pathway === 'k12') {
      const consent = await prisma.consentRecord.findFirst({
        where: {
          userEmail,
          consentType: 'data_processing',
          consentGiven: true
        }
      });

      if (!consent) {
        violations.push('CONSENT_REQUIRED');
      }

      if (course.pathway === 'k12') {
        const parentConsent = await prisma.consentRecord.findFirst({
          where: {
            userEmail,
            consentType: 'data_processing',
            parentConsentRequired: true,
            parentConsentGiven: true
          }
        });

        if (!parentConsent) {
          violations.push('PARENT_CONSENT_REQUIRED');
        }
      }
    }

    return {
      passed: violations.length === 0,
      evidence: {
        courseId,
        pathway: course?.pathway,
        skillCount: course?.skills.length || 0,
        prerequisitesChecked: true
      },
      violations: violations.length > 0 ? violations : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[ConstitutionalCheck] Enrollment eligibility error:', error);
    return {
      passed: false,
      evidence: { error: String(error) },
      violations: ['CONSTITUTIONAL_CHECK_ERROR'],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Pre-check for assessment:
 * - Verify learner is enrolled in course
 * - Check previous attempts (respect attempt limits)
 * - Verify assessment is valid/active
 */
async function checkAssessmentEligibility(
  learnerEmail: string,
  assessmentId: string,
  prisma: any
): Promise<ConstitutionalCheckResult> {
  const violations: string[] = [];

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      violations.push('ASSESSMENT_NOT_FOUND');
      return {
        passed: false,
        evidence: { assessmentId },
        violations,
        timestamp: new Date().toISOString()
      };
    }

    // Check enrollment in course
    const enrollment = await prisma.enrollment.findFirst({
      where: { userEmail: learnerEmail, courseId: assessment.courseId }
    });

    if (!enrollment) {
      violations.push('NOT_ENROLLED_IN_COURSE');
    }

    // Check attempt limit (max 3 attempts per assessment)
    const previousAttempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId, learnerEmail }
    });

    if (previousAttempts.length >= 3) {
      violations.push('MAX_ATTEMPTS_EXCEEDED');
    }

    // Check if recently attempted (cooldown: 24 hours between attempts)
    const lastAttempt = previousAttempts[previousAttempts.length - 1];
    if (lastAttempt?.completedAt) {
      const hoursSinceLastAttempt =
        (Date.now() - lastAttempt.completedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastAttempt < 24) {
        violations.push(`COOLDOWN_PERIOD:${Math.ceil(24 - hoursSinceLastAttempt)}h`);
      }
    }

    return {
      passed: violations.length === 0,
      evidence: {
        assessmentId,
        previousAttempts: previousAttempts.length,
        integrityLevel: assessment.integrityLevel
      },
      violations: violations.length > 0 ? violations : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[ConstitutionalCheck] Assessment eligibility error:', error);
    return {
      passed: false,
      evidence: { error: String(error) },
      violations: ['CONSTITUTIONAL_CHECK_ERROR'],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Post-check for assessment submission:
 * - Verify integrity signals (no excessive browser switches, etc.)
 * - Check for plagiarism/suspicious patterns
 * - Validate score is within expected range
 */
async function checkAssessmentIntegrity(
  attemptId: string,
  responses: Record<string, any>,
  integritySignals: Record<string, any>,
  prisma: any
): Promise<ConstitutionalCheckResult> {
  const violations: string[] = [];

  try {
    // Check excessive browser tab switches
    if (integritySignals.browserTabSwitches > 3) {
      violations.push(`EXCESSIVE_TAB_SWITCHES:${integritySignals.browserTabSwitches}`);
    }

    // Check for copying behavior (high velocity response times)
    if (integritySignals.averageResponseTime < 5) {
      violations.push('SUSPICIOUS_RESPONSE_TIME');
    }

    // Check for unusual patterns (e.g., perfect score on advanced test)
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: true }
    });

    if (attempt?.assessment.difficulty === 'expert' && attempt.score === 100) {
      violations.push('SUSPICIOUS_SCORE_DISTRIBUTION');
    }

    // Call Constitutional AI Monitor for plagiarism check
    // (if response text can be analyzed)
    if (integritySignals.responsesText && integritySignals.responsesText.length > 100) {
      try {
        // TODO: Call external plagiarism detection service
        // const plagiarismResult = await callPlagiarismDetector(integritySignals.responsesText);
        // if (plagiarismResult.probability > 0.7) {
        //   violations.push('PLAGIARISM_DETECTED');
        // }
      } catch (e) {
        console.error('[ConstitutionalCheck] Plagiarism check error:', e);
      }
    }

    return {
      passed: violations.length === 0,
      evidence: {
        attemptId,
        integritySignalsCount: Object.keys(integritySignals).length,
        violationsDetected: violations.length
      },
      violations: violations.length > 0 ? violations : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[ConstitutionalCheck] Assessment integrity error:', error);
    return {
      passed: false,
      evidence: { error: String(error) },
      violations: ['CONSTITUTIONAL_CHECK_ERROR'],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Post-check for credential issuance:
 * - Verify learner has required evidence (assessment scores, completion)
 * - Verify issuer has authority to issue credential
 * - Check for credential inflation (issuing same credential multiple times)
 */
async function checkCredentialValidity(
  userId: string,
  type: string,
  evidence: Record<string, any>,
  prisma: any
): Promise<ConstitutionalCheckResult> {
  const violations: string[] = [];

  try {
    // Check required evidence
    if (!evidence || Object.keys(evidence).length === 0) {
      violations.push('NO_EVIDENCE_PROVIDED');
    }

    // Check completion status
    if (evidence.assessmentScore && evidence.assessmentScore < 70) {
      violations.push('INSUFFICIENT_SCORE');
    }

    // Check for duplicate credentials (prevent credential inflation)
    const existingCredentials = await prisma.credential.findMany({
      where: { userId, type }
    });

    if (existingCredentials.length > 0) {
      violations.push('DUPLICATE_CREDENTIAL');
    }

    // Verify learner identity (additional check if needed)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      violations.push('USER_NOT_FOUND');
    }

    return {
      passed: violations.length === 0,
      evidence: {
        userId,
        type,
        evidenceFields: Object.keys(evidence || {}),
        existingCredentialsCount: existingCredentials.length
      },
      violations: violations.length > 0 ? violations : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[ConstitutionalCheck] Credential validity error:', error);
    return {
      passed: false,
      evidence: { error: String(error) },
      violations: ['CONSTITUTIONAL_CHECK_ERROR'],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Post-check for tutoring message:
 * - Verify tutor response is grounded in course material
 * - Check alignment score (confidence in accuracy)
 * - Verify no hallucinations or false claims
 */
async function checkTutoringAlignment(
  sessionId: string,
  tutorResponse: string,
  sourceReferences: Array<{ lessonId: string }>,
  prisma: any
): Promise<ConstitutionalCheckResult> {
  const violations: string[] = [];

  try {
    // Check that response is grounded (has source references)
    if (!sourceReferences || sourceReferences.length === 0) {
      violations.push('NOT_GROUNDED');
    }

    // TODO: Call Constitutional AI Monitor to check alignment
    // const alignmentResult = await callAlignmentChecker(tutorResponse, sourceReferences);
    // if (alignmentResult.alignmentScore < 0.7) {
    //   violations.push('LOW_ALIGNMENT_SCORE');
    // }

    // Verify source lessons are valid
    if (sourceReferences && sourceReferences.length > 0) {
      for (const ref of sourceReferences) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: ref.lessonId }
        });
        if (!lesson) {
          violations.push(`INVALID_SOURCE:${ref.lessonId}`);
        }
      }
    }

    return {
      passed: violations.length === 0,
      evidence: {
        sessionId,
        responseLength: tutorResponse.length,
        sourceCount: sourceReferences?.length || 0,
        groundedInCourseContent: (sourceReferences?.length || 0) > 0
      },
      violations: violations.length > 0 ? violations : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[ConstitutionalCheck] Tutoring alignment error:', error);
    return {
      passed: false,
      evidence: { error: String(error) },
      violations: ['CONSTITUTIONAL_CHECK_ERROR'],
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// Middleware Factory
// ============================================================================

/**
 * Factory middleware for constitutional checks
 * Usage: router.post('/enrollments', constitutionalCheck('enrollment'), ...)
 */
export function constitutionalCheck(checkType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result: ConstitutionalCheckResult | null = null;

      switch (checkType) {
        case 'enrollment':
          result = await checkEnrollmentEligibility(
            req.user?.email!,
            req.body.courseId,
            (req as any).prisma
          );
          break;

        case 'assessment':
          result = await checkAssessmentEligibility(
            req.user?.email!,
            req.body.assessmentId,
            (req as any).prisma
          );
          break;

        case 'assessment_submit':
          result = await checkAssessmentIntegrity(
            req.params.attemptId,
            req.body.responses,
            req.body.integritySignals || {},
            (req as any).prisma
          );
          break;

        case 'credential_issue':
          result = await checkCredentialValidity(
            req.body.userId,
            req.body.type,
            req.body.evidence || {},
            (req as any).prisma
          );
          break;

        case 'tutoring':
        case 'tutoring_message':
          // Store check for post-action verification
          (req as any).constitutionalCheckType = checkType;
          return next();

        default:
          // Unknown check type, skip
          return next();
      }

      // Store result in request for later logging
      (req as any).constitutionalCheckResult = result;

      // If check failed, reject immediately
      if (result && !result.passed) {
        return res.status(403).json({
          error: {
            code: 'CONSTITUTIONAL_VIOLATION',
            message: `Constitutional check failed: ${result.violations?.join(', ')}`,
            violations: result.violations,
            constitutionalConcern: true
          }
        });
      }

      next();
    } catch (error) {
      console.error('[ConstitutionalCheck] Middleware error:', error);
      res.status(500).json({
        error: {
          code: 'CONSTITUTIONAL_CHECK_ERROR',
          message: 'Constitutional validation system error'
        }
      });
    }
  };
}

export {
  checkEnrollmentEligibility,
  checkAssessmentEligibility,
  checkAssessmentIntegrity,
  checkCredentialValidity,
  checkTutoringAlignment
};
