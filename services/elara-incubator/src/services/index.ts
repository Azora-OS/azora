/**
 * Elara Incubator Platform - Services Index
 * Central export point for all services
 */

// Business Management
export { BusinessService, businessService } from './business.service.js';
export { TemplateService, templateService } from './template.service.js';

// AI Integration
export { ElaraAIService, elaraAIService } from './elara-ai.service.js';

// Legal Management
export { LegalService, legalService } from './legal.service.js';
export { DocumentGenerationService, documentGenerationService } from './document-generation.service.js';
export { SigningService, signingService } from './signing.service.js';

// Revenue & Payments
export { RevenueService, revenueService } from './revenue.service.js';
export { AllocationService, allocationService } from './allocation.service.js';
export { PaymentService, paymentService } from './payment.service.js';
export { FundService, fundService } from './fund.service.js';

// Notifications & Compliance
export { NotificationService, notificationService } from './notification.service.js';
export { AuditService, auditService } from './audit.service.js';
export { ReportingService, reportingService } from './reporting.service.js';
export { ConstitutionalAIService, constitutionalAIService } from './constitutional-ai.service.js';

// Import instances for registry
import { businessService } from './business.service.js';
import { templateService } from './template.service.js';
import { elaraAIService } from './elara-ai.service.js';
import { legalService } from './legal.service.js';
import { documentGenerationService } from './document-generation.service.js';
import { signingService } from './signing.service.js';
import { revenueService } from './revenue.service.js';
import { allocationService } from './allocation.service.js';
import { paymentService } from './payment.service.js';
import { fundService } from './fund.service.js';
import { notificationService } from './notification.service.js';
import { auditService } from './audit.service.js';
import { reportingService } from './reporting.service.js';
import { constitutionalAIService } from './constitutional-ai.service.js';

/**
 * Service Registry
 * Provides centralized access to all services
 */
export const services = {
  // Business Management
  business: businessService,
  template: templateService,

  // AI Integration
  elaraAI: elaraAIService,

  // Legal Management
  legal: legalService,
  documentGeneration: documentGenerationService,
  signing: signingService,

  // Revenue & Payments
  revenue: revenueService,
  allocation: allocationService,
  payment: paymentService,
  fund: fundService,

  // Notifications & Compliance
  notification: notificationService,
  audit: auditService,
  reporting: reportingService,
  constitutionalAI: constitutionalAIService,
};

/**
 * Service Types
 */
export type ServiceRegistry = typeof services;

/**
 * Initialize all services
 * Call this function at application startup
 */
export async function initializeServices(): Promise<void> {
  console.log('[Services] Initializing all services...');

  // Services are initialized on first use
  // Add any startup logic here if needed

  console.log('[Services] All services initialized successfully');
}

/**
 * Get service by name
 */
export function getService<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
  return services[name];
}

/**
 * Service Health Check
 */
export async function checkServiceHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, boolean>;
  timestamp: Date;
}> {
  const serviceStatus: Record<string, boolean> = {};

  // Check each service
  serviceStatus.business = !!businessService;
  serviceStatus.template = !!templateService;
  serviceStatus.elaraAI = !!elaraAIService;
  serviceStatus.legal = !!legalService;
  serviceStatus.documentGeneration = !!documentGenerationService;
  serviceStatus.signing = !!signingService;
  serviceStatus.revenue = !!revenueService;
  serviceStatus.allocation = !!allocationService;
  serviceStatus.payment = !!paymentService;
  serviceStatus.fund = !!fundService;
  serviceStatus.notification = !!notificationService;
  serviceStatus.audit = !!auditService;
  serviceStatus.reporting = !!reportingService;
  serviceStatus.constitutionalAI = !!constitutionalAIService;

  const allHealthy = Object.values(serviceStatus).every((status) => status);

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    services: serviceStatus,
    timestamp: new Date(),
  };
}
