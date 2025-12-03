// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  tier: 'free' | 'premium' | 'pro';
  modules: Module[];
  assessments: Assessment[];
  prerequisites: string[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  estimatedTime: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  questions: string[];
  passingScore: number;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  startDate: Date;
  completionDate?: Date;
}

// Learning Outcome Types
export interface LearningOutcome {
  id: string;
  enrollmentId: string;
  courseId: string;
  moduleId: string;
  assessmentScore: number;
  timeSpent: number;
  conceptMastery: number;
  completedAt: Date;
}

// Certificate Types
export interface Certificate {
  id: string;
  enrollmentId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  issuedDate: Date;
  verificationUrl: string;
  skills: string[];
}

// Conversion Types
export interface ConversionEvent {
  id: string;
  studentId: string;
  eventType: 'module_completion' | 'assessment_pass' | 'course_completion' | 'inactivity_alert';
  triggerValue: number;
  timestamp: Date;
}

export interface ConversionOffer {
  id: string;
  eventId: string;
  studentId: string;
  offerType: 'upgrade_discount' | 'premium_trial' | 'bundle_deal';
  discount: number;
  expiresAt: Date;
  accepted: boolean;
  acceptedAt?: Date;
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  tier: string;
  period: string;
  status: 'pending' | 'completed' | 'refunded';
  stripePaymentId?: string;
  createdAt: Date;
}

// Pricing Types
export interface PricingTier {
  id: string;
  name: 'free' | 'premium' | 'pro';
  monthlyPrice: number;
  studentDiscount: number;
  features: Feature[];
  limits: TierLimits;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  tier: string;
}

export interface TierLimits {
  coursesPerMonth: number;
  aiQueriesPerMonth: number;
  storageGB: number;
  supportLevel: 'community' | 'priority' | 'dedicated';
}

export interface CountryPricing {
  id: string;
  pricingTierId: string;
  countryCode: string;
  currency: string;
  monthlyPrice: number;
  studentDiscount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalizedPricing {
  tier: string;
  countryCode: string;
  currency: string;
  originalPrice: number;
  studentDiscount: number;
  studentPrice: number;
  savings: number;
  features: Feature[];
  limits: TierLimits;
}

// AI Integration Types
export interface TutoringRequest {
  studentId: string;
  courseId: string;
  question: string;
  context: {
    currentModule: string;
    previousResponses: string[];
    learningStyle: string;
  };
}

export interface TutoringResponse {
  answer: string;
  explanation: string;
  relatedConcepts: string[];
  recommendedResources: string[];
  nextSteps: string[];
}

export interface ContextRetrievalRequest {
  query: string;
  courseId: string;
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}

export interface ContextRetrievalResponse {
  internalResources: Resource[];
  externalResources: Resource[];
  relevanceScores: number[];
  totalResults: number;
}

export interface Resource {
  id: string;
  title: string;
  content: string;
  source: 'internal' | 'external';
  url?: string;
  relevanceScore: number;
}

export interface ContentValidationRequest {
  content: string;
  contentType: 'course' | 'assessment' | 'feedback';
  targetAudience: string;
}

export interface ContentValidationResponse {
  isValid: boolean;
  qualityScore: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'bias' | 'accuracy' | 'clarity' | 'safety';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
}

// Analytics Types
export interface LearningAnalytics {
  studentId: string;
  courseId: string;
  completionRate: number;
  timeToMastery: number;
  skillProficiency: Map<string, number>;
  assessmentScores: number[];
  averageScore: number;
  conceptsMastered: string[];
  conceptsInProgress: string[];
  conceptsStruggling: string[];
}

export interface CohortAnalytics {
  courseId: string;
  period: string;
  totalEnrollments: number;
  completionRate: number;
  averageScore: number;
  timeToCompletion: number;
  demographicBreakdown: DemographicData[];
  riskStudents: string[];
}

export interface DemographicData {
  category: string;
  value: string;
  count: number;
  completionRate: number;
  averageScore: number;
}

export interface ConversionMetrics {
  period: string;
  freeUsers: number;
  premiumUsers: number;
  proUsers: number;
  conversionRate: number;
  churnRate: number;
  lifetimeValue: number;
  customerAcquisitionCost: number;
  paybackPeriod: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
