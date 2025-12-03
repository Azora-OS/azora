// Business Types
export interface Business {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  templateId?: string;
  status: 'draft' | 'in_progress' | 'launched' | 'active';
  userOwnership: number;
  citadelFundShare: number;
  currentWizardStep: number;
  createdAt: Date;
  launchedAt?: Date;
  updatedAt: Date;
}

export interface BusinessCreationRequest {
  businessName: string;
  businessType: string;
  templateId?: string;
}

export interface BusinessUpdateRequest {
  businessName?: string;
  businessType?: string;
  status?: string;
  currentWizardStep?: number;
}

export interface BusinessResponse extends Business {
  revenueTotal?: number;
  citadelFundContributions?: number;
  netPayments?: number;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  type: 'ride-sharing' | 'tutoring' | 'e-commerce' | 'gig-platform' | 'custom';
  requirements: string[];
  resources: string[];
  wizardSteps: WizardStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WizardStep {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  resources: string[];
  elaraPrompt: string;
  validationRules: ValidationRule[];
  order: number;
}

export interface ValidationRule {
  field: string;
  type: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message: string;
}

// Revenue Types
export interface RevenueTransaction {
  id: string;
  businessId: string;
  amount: number;
  currency: string;
  source: string;
  receivedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface RevenueAllocation {
  id: string;
  transactionId: string;
  businessOwnerAmount: number;
  citadelFundAmount: number;
  allocatedAt: Date;
}

export interface RevenueTransactionRequest {
  amount: number;
  currency?: string;
  source: string;
  receivedAt?: Date;
}

export interface RevenueTransactionResponse extends RevenueTransaction {
  allocation?: RevenueAllocation;
}

export interface RevenueBreakdown {
  totalRevenue: number;
  businessOwnerShare: number;
  citadelFundShare: number;
  currency: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// Payment Types
export interface Payment {
  id: string;
  businessId: string;
  userId: string;
  amount: number;
  type: 'revenue' | 'refund' | 'fund_distribution';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  amount: number;
  type: 'revenue' | 'refund' | 'fund_distribution';
  paymentMethod?: string;
}

export interface PaymentResponse extends Payment {
  businessName?: string;
  userName?: string;
  auditEntries?: AuditLog[];
}

export interface PaymentHistory {
  payments: Payment[];
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  statusBreakdown: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

// Legal Document Types
export interface LegalTemplate {
  id: string;
  name: string;
  type: 'registration' | 'operating' | 'revenue_share' | 'ip' | 'compliance';
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalDocument {
  id: string;
  businessId: string;
  templateId: string;
  templateVersion: number;
  content: string;
  status: 'draft' | 'signed' | 'archived';
  signedAt?: Date;
  signerId?: string;
  signatureHash?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureData {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  signatureHash: string;
}

export interface LegalDocumentRequest {
  templateId: string;
  data: Record<string, any>;
}

export interface LegalDocumentResponse extends LegalDocument {
  templateName?: string;
  businessName?: string;
  signerName?: string;
}

export interface DocumentSigningRequest {
  documentId: string;
  signatureHash: string;
}

export interface DocumentSigningResponse {
  documentId: string;
  status: 'signed' | 'failed';
  signedAt: Date;
  signatureData: SignatureData;
}

// Citadel Fund Types
export interface CitadelFund {
  id: string;
  balance: number;
  totalContributions: number;
  totalDistributions: number;
  lastDistributionDate?: Date;
  nextDistributionDate?: Date;
  updatedAt: Date;
}

export interface CitadelFundResponse extends CitadelFund {
  contributionRate: number;
  distributionRate: number;
  impactMetrics?: {
    scholarshipsAwarded: number;
    projectsFunded: number;
    communityBeneficiaries: number;
  };
}

export interface FundDistribution {
  id: string;
  fundId: string;
  amount: number;
  type: 'scholarship' | 'project' | 'community';
  description: string;
  distributedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface FundDistributionRequest {
  amount: number;
  type: 'scholarship' | 'project' | 'community';
  description: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  paymentId?: string;
  action: string;
  details: string;
  userId?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface AuditLogResponse extends AuditLog {
  userName?: string;
  businessId?: string;
  businessName?: string;
}

export interface AuditTrail {
  logs: AuditLog[];
  totalCount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: Date;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistrationRequest {
  email: string;
  name: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface UserResponse extends User {
  businesses?: Business[];
  totalBusinesses?: number;
}

// Dashboard Types
export interface UserDashboard {
  businessId: string;
  businessName: string;
  status: string;
  wizardProgress: number;
  totalRevenue: number;
  citadelFundContributions: number;
  netPayments: number;
  mentorshipSessions: number;
  recentTransactions: Payment[];
}

export interface AdminDashboard {
  activeBusinesses: number;
  totalRevenue: number;
  citadelFundBalance: number;
  citadelFundContributions: number;
  totalDistributions: number;
  pendingPayments: number;
  complianceStatus: string;
  recentActivities: AuditLog[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'payment' | 'milestone' | 'mentorship' | 'fund_distribution' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface NotificationRequest {
  type: 'payment' | 'milestone' | 'mentorship' | 'fund_distribution' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
}
