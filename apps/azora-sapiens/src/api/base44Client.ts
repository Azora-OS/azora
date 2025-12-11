import sapiensApi, { SapiensApiClient } from '@azora/sapiens-api-client';
import { getSession } from 'next-auth/react';

// Lightweight adapter that provides a subset of base44 API used by frontend
export const base44 = {
  auth: {
    async me() {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          await sapiensApi.setAccessToken(session.accessToken as string);
        }
        return sapiensApi.me();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    redirectToLogin() {
      // Navigate to the NextAuth sign-in route
      window.location.href = '/api/auth/signin';
    }
  },
  entities: {
    Course: {
      async list(orderBy: string, limit: number = 50) {
        const { courses } = await sapiensApi.getCourses({ limit });
        return courses;
      },
      async filter(opts: any = {}) {
        if (opts.id) {
          const course = await sapiensApi.getCourseById(opts.id);
          return [course];
        }
        const { courses } = await sapiensApi.getCourses(opts);
        return courses;
      }
    },
    Lesson: {
      async filter(opts: any) {
        if (opts.course_id) {
          return sapiensApi.getLessons(opts.course_id);
        }
        return [];
      }
    },
    Enrollment: {
      async filter(opts: any) {
        return sapiensApi.getEnrollments(opts.user_email);
      },
      async create(payload: any) {
        return sapiensApi.enrollCourse(payload.course_id);
      },
      async update(id: string, payload: any) {
        return sapiensApi.updateEnrollmentProgress(id, payload.progress_percent, payload.completed_lessons || []);
      }
    },
    Achievement: {
      async filter(opts: any) {
        return sapiensApi.getAchievements(opts.user_email);
      }
    },
    TokenTransaction: {
      async filter(opts: any) {
        return sapiensApi.getTokenTransactions(opts.user_email, 50);
      }
    }
  },
  integrations: {
    Core: {
      async InvokeLLM(payload: { prompt: string; context?: string }) {
        // Map to stateless ask endpoint for quick replies
        const res = await sapiensApi.askTutor(payload.prompt, payload.context || undefined);
        return res;
      }
    }
  }
};

export default base44;
