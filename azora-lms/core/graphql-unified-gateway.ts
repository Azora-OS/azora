/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * GraphQL Unified Gateway for Azora LMS
 *
 * Provides unified, high-performance API for:
 * - Course data
 * - PIVC metrics
 * - Constitutional rankings
 * - DID integration
 * - Learner profiles
 */

import { EventEmitter } from 'events';

export interface GraphQLContext {
  userId?: string;
  roles: string[];
  permissions: string[];
  requestId: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  modules: Module[];
  enrollments: number;
  pivcTarget: number;
  constitutionalScore: number;
  createdAt: number;
  updatedAt: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  pivcWeight: number;
  content: ModuleContent;
  assessments: Assessment[];
}

export interface ModuleContent {
  type: 'video' | 'text' | 'interactive' | 'quiz';
  data: string;
  resources: Resource[];
}

export interface Resource {
  id: string;
  type: string;
  title: string;
  url: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  type: string;
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profile: UserProfile;
  did?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  pivcScore: number;
  constitutionalAlignment: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  type: string;
  name: string;
  earnedAt: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  pivcEarned: number;
  completedModules: string[];
  enrolledAt: number;
  completedAt?: number;
}

/**
 * GraphQL Schema Definition
 */
export const typeDefs = `
  type Query {
    # Course queries
    course(id: ID!): Course
    courses(limit: Int, offset: Int): [Course!]!
    myCourses: [Course!]!

    # User queries
    user(id: ID!): User
    me: User

    # PIVC queries
    pivcLeaderboard(timeframe: String!): [LeaderboardEntry!]!
    myPIVC: PIVCMetrics!
    leaderboard(limit: Int, offset: Int): [LeaderboardEntry!]!

    # Community queries
    mentors(limit: Int, offset: Int): [User!]!
    studyGroups(limit: Int, offset: Int): [StudyGroup!]!

    # Learning queries
    myLearningPath: LearningPath
    myProgress(courseId: ID!): Progress

    # Constitutional queries
    contentVetting(contentId: ID!): VettingResult
  }

  type Mutation {
    # Enrollment
    enrollCourse(courseId: ID!): Enrollment!
    unenrollCourse(courseId: ID!): Boolean!

    # Progress
    completeModule(moduleId: ID!): Progress!
    submitAssessment(assessmentId: ID!, answers: [AnswerInput!]!): AssessmentResult!

    # Peer review
    submitPeerReview(input: PeerReviewInput!): PeerReview!

    # Content
    createCourse(input: CourseInput!): Course!
    updateCourse(id: ID!, input: CourseInput!): Course!
  }

  type Subscription {
    progressUpdated(userId: ID!): Progress!
    pivcAwarded(userId: ID!): PIVCAward!
    badgeUnlocked(userId: ID!): Badge!
  }

  type StudyGroup {
    id: ID!
    name: String!
    description: String!
    members: [User!]!
    course: Course
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    instructor: User!
    modules: [Module!]!
    enrollments: Int!
    pivcTarget: Int!
    constitutionalScore: Float!
    createdAt: String!
    updatedAt: String!
  }

  type Module {
    id: ID!
    courseId: ID!
    title: String!
    description: String!
    order: Int!
    duration: Int!
    pivcWeight: Int!
    content: ModuleContent!
    assessments: [Assessment!]!
  }

  type ModuleContent {
    type: String!
    data: String!
    resources: [Resource!]!
  }

  type Resource {
    id: ID!
    type: String!
    title: String!
    url: String!
  }

  type Assessment {
    id: ID!
    moduleId: ID!
    type: String!
    questions: [Question!]!
    passingScore: Int!
  }

  type Question {
    id: ID!
    text: String!
    type: String!
    options: [String!]
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    profile: UserProfile!
    did: String
  }

  type UserProfile {
    firstName: String!
    lastName: String!
    avatar: String
    bio: String
    pivcScore: Int!
    constitutionalAlignment: Float!
    achievements: [Achievement!]!
  }

  type Achievement {
    id: ID!
    type: String!
    name: String!
    earnedAt: String!
  }

  type Enrollment {
    id: ID!
    userId: ID!
    courseId: ID!
    progress: Float!
    pivcEarned: Int!
    completedModules: [ID!]!
    enrolledAt: String!
    completedAt: String
  }

  type Progress {
    courseId: ID!
    completionRate: Float!
    pivcEarned: Int!
    currentModule: Module
    nextModule: Module
  }

  type PIVCMetrics {
    total: Int!
    thisWeek: Int!
    thisMonth: Int!
    rank: Int!
    sovereignStars: Int!
  }

  type LeaderboardEntry {
    rank: Int!
    user: User!
    score: Int!
    stars: Int!
  }

  type LearningPath {
    id: ID!
    name: String!
    modules: [Module!]!
    progress: Float!
  }

  type VettingResult {
    contentId: ID!
    score: Float!
    alignment: String!
    issues: [String!]!
    approved: Boolean!
  }

  type AssessmentResult {
    score: Float!
    pivcEarned: Int!
    passed: Boolean!
    feedback: String!
  }

  type PeerReview {
    id: ID!
    reviewerId: ID!
    rating: Int!
    feedback: String!
    pivcAwarded: Int!
  }

  type PIVCAward {
    amount: Int!
    reason: String!
    timestamp: String!
  }

  type Badge {
    id: ID!
    name: String!
    description: String!
    icon: String!
    rarity: String!
  }

  input CourseInput {
    title: String!
    description: String!
    pivcTarget: Int!
  }

  input AnswerInput {
    questionId: ID!
    answer: String!
  }

  input PeerReviewInput {
    targetUserId: ID!
    targetContentId: ID!
    rating: Int!
    feedback: String!
  }
`;

/**
 * GraphQL Resolvers
 * Now uses Prisma database instead of in-memory storage
 */
import { lmsDatabase } from './database-service';
import { PIVCGamificationEngine } from './pivc-gamification-engine';
import { ConstitutionalLearningAgent } from './constitutional-learning-agent';

export class GraphQLResolvers {
  private pivcEngine: PIVCGamificationEngine;
  private cla: ConstitutionalLearningAgent;

  constructor() {
    this.pivcEngine = new PIVCGamificationEngine();
    this.cla = new ConstitutionalLearningAgent();
  }

  public getResolvers() {
    return {
      Query: {
        course: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
          return await lmsDatabase.getCourse(id);
        },

        courses: async (_: any, { limit = 10, offset = 0, filters }: {
          limit?: number;
          offset?: number;
          filters?: any;
        }) => {
          return await lmsDatabase.getCourses(limit, offset, filters);
        },

        myCourses: async (_: any, __: any, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          return await lmsDatabase.getUserCourses(context.userId);
        },

        user: async (_: any, { id }: { id: string }) => {
          return await lmsDatabase.getUser(id);
        },

        me: async (_: any, __: any, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          return await lmsDatabase.getUser(context.userId);
        },

        pivcLeaderboard: async (_: any, { timeframe }: { timeframe: string }) => {
          return await this.pivcEngine.getLeaderboardByTimeframe(timeframe);
        },

        myPIVC: async (_: any, __: any, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          return await this.pivcEngine.getUserMetrics(context.userId);
        },

        mentors: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
          return await lmsDatabase.getMentors(limit, offset);
        },

        studyGroups: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
          return await lmsDatabase.getStudyGroups(limit, offset);
        },

        leaderboard: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
          return await this.pivcEngine.getLeaderboard(limit, offset);
        },

        myLearningPath: async (_: any, __: any, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          return await this.cla.getLearningPathForUser(context.userId);
        },

        myProgress: async (_: any, { courseId }: { courseId: string }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          return await lmsDatabase.getProgress(context.userId, courseId);
        },

        contentVetting: async (_: any, { contentId }: { contentId: string }) => {
          return await this.cla.vetContent(contentId);
        },
      },

      Mutation: {
        enrollCourse: async (_: any, { courseId }: { courseId: string }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          const enrollment = await lmsDatabase.enrollCourse(context.userId, courseId);

          // Award PIVC for enrollment
          await this.pivcEngine.awardPIVC(context.userId, {
            amount: 10,
            reason: 'Course enrollment',
            source: 'enrollment',
          });

          return enrollment;
        },

        unenrollCourse: async (_: any, { courseId }: { courseId: string }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          return await lmsDatabase.unenrollCourse(context.userId, courseId);
        },

        completeModule: async (_: any, { moduleId, courseId }: { moduleId: string; courseId: string }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');

          // Update progress in database
          await lmsDatabase.updateProgress(context.userId, courseId, moduleId);

          // Award PIVC
          await this.pivcEngine.awardPIVC(context.userId, {
            amount: 25,
            reason: 'Module completion',
            source: 'module-completion',
          });

          return await lmsDatabase.getProgress(context.userId, courseId);
        },

        submitAssessment: async (
          _: any,
          { quizId, responses }: { quizId: string; responses: any[] },
          context: GraphQLContext
        ) => {
          if (!context.userId) throw new Error('Unauthorized');
          const result = await lmsDatabase.submitQuizAttempt(context.userId, quizId, responses);

          // Award PIVC based on score
          if (result.passed) {
            await this.pivcEngine.awardPIVC(context.userId, {
              amount: result.pivcEarned,
              reason: 'Quiz completion',
              source: 'quiz',
            });
          }

          return result;
        },

        submitPeerReview: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');

          // Award PIVC for peer review
          await this.pivcEngine.awardPIVC(context.userId, {
            amount: 10,
            reason: 'Peer review submitted',
            source: 'peer-review',
          });

          return {
            id: `review-${Date.now()}`,
            reviewerId: context.userId,
            ...input,
            pivcAwarded: 10,
          };
        },

        createCourse: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');
          if (!context.roles.includes('instructor') && !context.roles.includes('admin')) {
            throw new Error('Insufficient permissions');
          }

          // Vet content constitutionally
          const vettingResult = await this.cla.vetContent(input.description || '');
          if (!vettingResult.approved) {
            throw new Error(`Content does not meet constitutional standards: ${vettingResult.issues.join(', ')}`);
          }

          return await lmsDatabase.createCourse(context.userId, input);
        },

        updateCourse: async (_: any, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
          if (!context.userId) throw new Error('Unauthorized');

          // Vet updated content
          if (input.description) {
            const vettingResult = await this.cla.vetContent(input.description);
            if (!vettingResult.approved) {
              throw new Error(`Content does not meet constitutional standards: ${vettingResult.issues.join(', ')}`);
            }
          }

          return await lmsDatabase.updateCourse(id, input);
        },
      },
    };
  }
}

/**
 * Legacy DataStore interface - deprecated in favor of Prisma database
 * Kept for backwards compatibility during migration
 * @deprecated Use lmsDatabase from database-service.ts instead
 */
export class DataStore extends EventEmitter {
  // This class is now deprecated - all operations use database-service.ts
  // Kept for type compatibility only
}

export default GraphQLResolvers;

