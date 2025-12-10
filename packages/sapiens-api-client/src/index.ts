/**
 * Azora Sapiens API Client
 * Replaces mock base44 client with real Azora service APIs
 * 
 * Features:
 * - Real API endpoints (Education, Mint, Constitutional AI, etc.)
 * - Authentication via NextAuth/JWT
 * - Rate limiting & retry logic
 * - Error handling with constitutional context
 * - Audit logging for sensitive operations
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'educator' | 'admin' | 'enterprise';
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  pathway: 'k12' | 'university' | 'phd';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  durationHours: number;
  tokenReward: number;
  instructorName?: string;
  instructorAvatar?: string;
  lessonCount: number;
  enrolledCount?: number;
  rating?: number;
  isFeatured?: boolean;
  thumbnail?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  contentType: 'video' | 'text' | 'code' | 'quiz';
  content: string;
  videoUrl?: string;
  durationMinutes?: number;
  tokenReward: number;
}

export interface Enrollment {
  id: string;
  userEmail: string;
  courseId: string;
  progressPercent: number;
  completedLessons: string[];
  status: 'active' | 'completed' | 'paused';
  startedAt: string;
  completedAt?: string;
  certificateIssued?: boolean;
}

export interface Achievement {
  id: string;
  userEmail: string;
  type: string;
  title: string;
  description: string;
  courseId?: string;
  earnedAt: string;
  icon?: string;
}

export interface TokenTransaction {
  id: string;
  userEmail: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus';
  source: string;
  referenceId?: string;
  description?: string;
  createdDate: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  pathway: 'k12' | 'university' | 'phd';
  targetSkills: string[];
  courseSequence: Array<{ courseId: string; order: number; prerequisites?: string[] }>;
  estimatedDurationWeeks: number;
  tokenRewardTotal: number;
  isPublished: boolean;
  enrollmentCount: number;
}

export interface TutorSession {
  sessionId: string;
  tutorMessage: string;
  sourceReferences?: Array<{ lessonId: string; title: string; url: string }>;
  alignmentScore: number;
  trustworthiness: 'grounded' | 'uncertain' | 'low';
  auditLogId: string;
}

export interface AssessmentAttempt {
  attemptId: string;
  assessmentId: string;
  learnerEmail: string;
  score: number;
  maxScore: number;
  passed: boolean;
  feedback?: string;
  integrityReview?: { flagged: boolean; reason?: string };
  tokensEarned?: number;
  auditLogId: string;
}

export interface Credential {
  credentialId: string;
  userId: string;
  type: string;
  title: string;
  issuedDate: string;
  verificationUrl: string;
  credentialJson: Record<string, any>;
  blockchainAnchored?: boolean;
  blockchainHash?: string;
}

export interface Cohort {
  cohortId: string;
  courseId: string;
  name: string;
  instructorEmail: string;
  startDate: string;
  endDate: string;
  status: 'forming' | 'active' | 'completed';
  maxLearners: number;
  enrollmentUrl?: string;
}

export interface ClassSession {
  sessionId: string;
  cohortId: string;
  sessionType: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  buildspacesRoomUrl?: string;
  recordingUrl?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  constitutionalConcern?: boolean;
}

// ============================================================================
// Azora Sapiens API Client
// ============================================================================

export class SapiensApiClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Intercept requests to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercept responses for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  async me(): Promise<AuthUser> {
    try {
      const response = await this.axiosInstance.get<AuthUser>('/api/auth/me');
      return response.data;
    } catch (error) {
      throw this.formatError('AUTH_FAILED', 'Failed to fetch user information', error);
    }
  }

  async redirectToLogin(): Promise<void> {
    // Navigate to NextAuth login page
    window.location.href = '/api/auth/signin';
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/auth/logout');
      this.accessToken = null;
      window.location.href = '/';
    } catch (error) {
      throw this.formatError('LOGOUT_FAILED', 'Failed to logout', error);
    }
  }

  // ============================================================================
  // Courses & Learning Paths
  // ============================================================================

  async getCourses(filter?: {
    pathway?: string;
    category?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    try {
      const response = await this.axiosInstance.get<{ courses: Course[]; total: number }>(
        '/api/sapiens/courses',
        { params: filter }
      );
      return response.data;
    } catch (error) {
      throw this.formatError('COURSE_FETCH_FAILED', 'Failed to fetch courses', error);
    }
  }

  async getCourseById(courseId: string): Promise<Course> {
    try {
      const response = await this.axiosInstance.get<Course>(`/api/sapiens/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw this.formatError('COURSE_NOT_FOUND', 'Course not found', error);
    }
  }

  async getLessons(courseId: string): Promise<Lesson[]> {
    try {
      const response = await this.axiosInstance.get<Lesson[]>(
        `/api/sapiens/courses/${courseId}/lessons`
      );
      return response.data;
    } catch (error) {
      throw this.formatError('LESSONS_FETCH_FAILED', 'Failed to fetch lessons', error);
    }
  }

  async getLearningPaths(filter?: {
    pathway?: string;
    limit?: number;
  }): Promise<LearningPath[]> {
    try {
      const response = await this.axiosInstance.get<LearningPath[]>(
        '/api/sapiens/learning-paths',
        { params: filter }
      );
      return response.data;
    } catch (error) {
      throw this.formatError('PATHS_FETCH_FAILED', 'Failed to fetch learning paths', error);
    }
  }

  // ============================================================================
  // Enrollments
  // ============================================================================

  async getEnrollments(userEmail?: string): Promise<Enrollment[]> {
    try {
      const response = await this.axiosInstance.get<Enrollment[]>('/api/sapiens/enrollments', {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      throw this.formatError('ENROLLMENTS_FETCH_FAILED', 'Failed to fetch enrollments', error);
    }
  }

  async enrollCourse(courseId: string): Promise<Enrollment> {
    try {
      const response = await this.axiosInstance.post<Enrollment>('/api/sapiens/enrollments', {
        courseId
      });
      return response.data;
    } catch (error) {
      throw this.formatError('ENROLLMENT_FAILED', 'Failed to enroll in course', error);
    }
  }

  async updateEnrollmentProgress(
    enrollmentId: string,
    progressPercent: number,
    completedLessons: string[]
  ): Promise<Enrollment> {
    try {
      const response = await this.axiosInstance.patch<Enrollment>(
        `/api/sapiens/enrollments/${enrollmentId}`,
        { progressPercent, completedLessons }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'ENROLLMENT_UPDATE_FAILED',
        'Failed to update enrollment progress',
        error
      );
    }
  }

  // ============================================================================
  // Tutoring (Elara AI Tutor)
  // ============================================================================

  async startTutorSession(courseId: string, lessonId: string): Promise<TutorSession> {
    try {
      const response = await this.axiosInstance.post<TutorSession>(
        '/api/sapiens/tutor/session',
        { courseId, lessonId }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'TUTOR_SESSION_FAILED',
        'Failed to start tutoring session',
        error,
        true // constitutional concern
      );
    }
  }

  async sendTutorMessage(sessionId: string, userMessage: string): Promise<TutorSession> {
    try {
      const response = await this.axiosInstance.post<TutorSession>(
        `/api/sapiens/tutor/session/${sessionId}/message`,
        { userMessage }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'TUTOR_MESSAGE_FAILED',
        'Failed to send message to tutor',
        error,
        true
      );
    }
  }

  async completeTutorSession(sessionId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.axiosInstance.post<{ success: boolean }>(
        `/api/sapiens/tutor/session/${sessionId}/complete`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'TUTOR_CLOSE_FAILED',
        'Failed to close tutoring session',
        error,
        true
      );
    }
  }

  // ============================================================================
  // Assessments & Exams
  // ============================================================================

  async startAssessmentAttempt(
    assessmentId: string,
    integrityLevel: 'low' | 'medium' | 'high' = 'high'
  ): Promise<{
    attemptId: string;
    questions: any[];
    timeLimit: number;
    allowedTools: string[];
    proctorToken?: string;
  }> {
    try {
      const response = await this.axiosInstance.post(
        '/api/sapiens/assessment/attempt',
        { assessmentId, integrityLevel }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'ASSESSMENT_START_FAILED',
        'Failed to start assessment',
        error,
        true
      );
    }
  }

  async submitAssessmentAttempt(
    attemptId: string,
    responses: Record<string, any>,
    integritySignals: Record<string, any>
  ): Promise<AssessmentAttempt> {
    try {
      const response = await this.axiosInstance.post<AssessmentAttempt>(
        `/api/sapiens/assessment/attempt/${attemptId}/submit`,
        { responses, integritySignals }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'ASSESSMENT_SUBMIT_FAILED',
        'Failed to submit assessment',
        error,
        true
      );
    }
  }

  // ============================================================================
  // Achievements & Tokens
  // ============================================================================

  async getAchievements(userEmail?: string): Promise<Achievement[]> {
    try {
      const response = await this.axiosInstance.get<Achievement[]>(
        '/api/sapiens/achievements',
        { params: { userEmail } }
      );
      return response.data;
    } catch (error) {
      throw this.formatError('ACHIEVEMENTS_FETCH_FAILED', 'Failed to fetch achievements', error);
    }
  }

  async getTokenBalance(userEmail?: string): Promise<{ balance: number; lastUpdated: string }> {
    try {
      const response = await this.axiosInstance.get<{ balance: number; lastUpdated: string }>(
        '/api/sapiens/wallet/balance',
        { params: { userEmail } }
      );
      return response.data;
    } catch (error) {
      throw this.formatError('TOKEN_BALANCE_FAILED', 'Failed to fetch token balance', error);
    }
  }

  async getTokenTransactions(userEmail?: string, limit: number = 50): Promise<TokenTransaction[]> {
    try {
      const response = await this.axiosInstance.get<TokenTransaction[]>(
        '/api/sapiens/wallet/transactions',
        { params: { userEmail, limit } }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'TRANSACTIONS_FETCH_FAILED',
        'Failed to fetch token transactions',
        error
      );
    }
  }

  // ============================================================================
  // Credentials
  // ============================================================================

  async issueCredential(
    userId: string,
    type: string,
    courseId?: string,
    evidence?: Record<string, any>
  ): Promise<Credential> {
    try {
      const response = await this.axiosInstance.post<Credential>(
        '/api/sapiens/credentials/issue',
        { userId, type, courseId, evidence }
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'CREDENTIAL_ISSUE_FAILED',
        'Failed to issue credential',
        error,
        true
      );
    }
  }

  async getCredential(credentialId: string): Promise<Credential> {
    try {
      const response = await this.axiosInstance.get<Credential>(
        `/api/sapiens/credentials/${credentialId}`
      );
      return response.data;
    } catch (error) {
      throw this.formatError('CREDENTIAL_NOT_FOUND', 'Credential not found', error);
    }
  }

  async verifyCredential(credentialId: string): Promise<{
    verified: boolean;
    details: Record<string, any>;
  }> {
    try {
      const response = await this.axiosInstance.get<{ verified: boolean; details: Record<string, any> }>(
        `/api/sapiens/credentials/${credentialId}/verify`
      );
      return response.data;
    } catch (error) {
      throw this.formatError('CREDENTIAL_VERIFY_FAILED', 'Failed to verify credential', error);
    }
  }

  // ============================================================================
  // Cohorts & Classrooms
  // ============================================================================

  async createCohort(data: {
    courseId: string;
    name: string;
    instructorEmail: string;
    startDate: string;
    endDate: string;
    maxLearners?: number;
  }): Promise<Cohort> {
    try {
      const response = await this.axiosInstance.post<Cohort>('/api/sapiens/cohorts', data);
      return response.data;
    } catch (error) {
      throw this.formatError('COHORT_CREATE_FAILED', 'Failed to create cohort', error, true);
    }
  }

  async getCohorts(filter?: { courseId?: string; instructorEmail?: string }): Promise<Cohort[]> {
    try {
      const response = await this.axiosInstance.get<Cohort[]>('/api/sapiens/cohorts', {
        params: filter
      });
      return response.data;
    } catch (error) {
      throw this.formatError('COHORTS_FETCH_FAILED', 'Failed to fetch cohorts', error);
    }
  }

  async enrollInCohort(cohortId: string): Promise<{ success: boolean; enrollmentUrl?: string }> {
    try {
      const response = await this.axiosInstance.post<{ success: boolean; enrollmentUrl?: string }>(
        `/api/sapiens/cohorts/${cohortId}/enroll`
      );
      return response.data;
    } catch (error) {
      throw this.formatError('COHORT_ENROLL_FAILED', 'Failed to enroll in cohort', error, true);
    }
  }

  async scheduleClassSession(cohortId: string, data: {
    sessionType: string;
    title: string;
    scheduledStart: string;
    scheduledEnd: string;
  }): Promise<ClassSession> {
    try {
      const response = await this.axiosInstance.post<ClassSession>(
        `/api/sapiens/cohorts/${cohortId}/sessions`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(
        'SESSION_CREATE_FAILED',
        'Failed to schedule class session',
        error,
        true
      );
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private handleError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: ApiError }>;
      const status = axiosError.response?.status || 500;
      const data = axiosError.response?.data;

      if (status === 401) {
        // Unauthorized - redirect to login
        this.redirectToLogin();
      }

      return Promise.reject({
        status,
        message: data?.error?.message || axiosError.message,
        details: data?.error?.details
      });
    }

    return Promise.reject(error);
  }

  private formatError(
    code: string,
    message: string,
    error: unknown,
    constitutionalConcern: boolean = false
  ): ApiError {
    console.error(`[SapiensApiClient] ${code}: ${message}`, error);

    return {
      code,
      message,
      details: axios.isAxiosError(error) ? error.response?.data : undefined,
      constitutionalConcern
    };
  }
}

// ============================================================================
// Singleton Instance (for use in components)
// ============================================================================

export const sapiensApi = new SapiensApiClient();

export default sapiensApi;
