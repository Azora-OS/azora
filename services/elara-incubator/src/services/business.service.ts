import { generateUUID } from '../utils/uuid.js';
import {
  Business,
  BusinessCreationRequest,
  BusinessUpdateRequest,
  BusinessResponse,
  WizardStep,
} from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

// Mock database - replace with actual database calls
const businesses: Map<string, Business> = new Map();
const wizardSteps: Map<string, WizardStep[]> = new Map();

export class BusinessService {
  /**
   * Create a new business
   * Requirements: 1.1, 1.2, 1.3
   */
  async createBusiness(userId: string, data: BusinessCreationRequest): Promise<Business> {
    const businessId = generateUUID();
    const now = new Date();

    const business: Business = {
      id: businessId,
      userId,
      businessName: data.businessName,
      businessType: data.businessType,
      templateId: data.templateId,
      status: 'draft',
      userOwnership: 90,
      citadelFundShare: 10,
      currentWizardStep: 0,
      createdAt: now,
      updatedAt: now,
    };

    businesses.set(businessId, business);

    // Initialize wizard steps for this business
    await this.initializeWizardSteps(businessId, data.templateId);

    return business;
  }

  /**
   * Get business by ID
   * Requirements: 1.1
   */
  async getBusinessById(businessId: string, userId: string): Promise<Business> {
    const business = businesses.get(businessId);

    if (!business) {
      throw new AppError(404, 'Business not found');
    }

    // Verify ownership
    if (business.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to this business');
    }

    return business;
  }

  /**
   * Get all businesses for a user
   * Requirements: 1.1
   */
  async getUserBusinesses(userId: string, page: number = 1, pageSize: number = 10): Promise<{
    businesses: Business[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const userBusinesses = Array.from(businesses.values()).filter((b) => b.userId === userId);

    const total = userBusinesses.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      businesses: userBusinesses.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Update business
   * Requirements: 1.1
   */
  async updateBusiness(
    businessId: string,
    userId: string,
    data: BusinessUpdateRequest
  ): Promise<Business> {
    const business = await this.getBusinessById(businessId, userId);

    if (data.businessName) {
      business.businessName = data.businessName;
    }
    if (data.businessType) {
      business.businessType = data.businessType;
    }
    if (data.status) {
      business.status = data.status as any;
    }
    if (data.currentWizardStep !== undefined) {
      business.currentWizardStep = data.currentWizardStep;
    }

    business.updatedAt = new Date();
    businesses.set(businessId, business);

    return business;
  }

  /**
   * Launch business - transitions from draft to launched
   * Requirements: 1.1, 1.2
   */
  async launchBusiness(businessId: string, userId: string): Promise<Business> {
    const business = await this.getBusinessById(businessId, userId);

    if (business.status !== 'draft' && business.status !== 'in_progress') {
      throw new AppError(400, 'Business can only be launched from draft or in_progress status');
    }

    business.status = 'launched';
    business.launchedAt = new Date();
    business.updatedAt = new Date();

    businesses.set(businessId, business);

    return business;
  }

  /**
   * Get wizard progress for a business
   * Requirements: 1.2, 1.3
   */
  async getWizardProgress(businessId: string, userId: string): Promise<{
    businessId: string;
    currentStep: number;
    totalSteps: number;
    completedSteps: number[];
    progress: number;
  }> {
    const business = await this.getBusinessById(businessId, userId);
    const steps = wizardSteps.get(businessId) || [];

    const completedSteps = steps
      .filter((s) => s.order < business.currentWizardStep)
      .map((s) => s.order);

    const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

    return {
      businessId,
      currentStep: business.currentWizardStep,
      totalSteps: steps.length,
      completedSteps,
      progress,
    };
  }

  /**
   * Update wizard step
   * Requirements: 1.2, 1.3
   */
  async updateWizardStep(
    businessId: string,
    stepId: string,
    userId: string,
    stepData: Record<string, any>
  ): Promise<{
    businessId: string;
    stepId: string;
    status: string;
    updatedAt: Date;
  }> {
    const business = await this.getBusinessById(businessId, userId);
    const steps = wizardSteps.get(businessId) || [];

    const step = steps.find((s) => s.id === stepId);
    if (!step) {
      throw new AppError(404, 'Wizard step not found');
    }

    // Validate step data against validation rules
    this.validateStepData(step, stepData);

    // Update business wizard progress
    if (step.order >= business.currentWizardStep) {
      business.currentWizardStep = step.order + 1;
      business.status = 'in_progress';
      business.updatedAt = new Date();
      businesses.set(businessId, business);
    }

    return {
      businessId,
      stepId,
      status: 'completed',
      updatedAt: new Date(),
    };
  }

  /**
   * Initialize wizard steps for a business based on template
   * Requirements: 1.2, 1.3
   */
  private async initializeWizardSteps(businessId: string, templateId?: string): Promise<void> {
    // Default wizard steps
    const defaultSteps: WizardStep[] = [
      {
        id: generateUUID(),
        name: 'Ideation',
        description: 'Define your business idea and market opportunity',
        requirements: ['Business idea', 'Target market'],
        resources: ['Market research template', 'Idea validation guide'],
        elaraPrompt: 'Help me refine my business idea and identify the target market',
        validationRules: [
          {
            field: 'businessIdea',
            type: 'string',
            required: true,
            minLength: 10,
            message: 'Business idea must be at least 10 characters',
          },
          {
            field: 'targetMarket',
            type: 'string',
            required: true,
            minLength: 5,
            message: 'Target market description is required',
          },
        ],
        order: 0,
      },
      {
        id: generateUUID(),
        name: 'Planning',
        description: 'Create your business plan and financial projections',
        requirements: ['Business plan', 'Financial model'],
        resources: ['Business plan template', 'Financial projection tool'],
        elaraPrompt: 'Help me create a comprehensive business plan with financial projections',
        validationRules: [
          {
            field: 'businessPlan',
            type: 'string',
            required: true,
            minLength: 50,
            message: 'Business plan must be detailed',
          },
          {
            field: 'projectedRevenue',
            type: 'number',
            required: true,
            message: 'Projected revenue is required',
          },
        ],
        order: 1,
      },
      {
        id: generateUUID(),
        name: 'Prototype',
        description: 'Build and test your MVP or prototype',
        requirements: ['MVP', 'User feedback'],
        resources: ['Prototyping tools', 'User testing guide'],
        elaraPrompt: 'Guide me through building and testing my MVP',
        validationRules: [
          {
            field: 'mvpDescription',
            type: 'string',
            required: true,
            minLength: 20,
            message: 'MVP description is required',
          },
          {
            field: 'userFeedback',
            type: 'string',
            required: true,
            minLength: 10,
            message: 'User feedback is required',
          },
        ],
        order: 2,
      },
      {
        id: generateUUID(),
        name: 'Legal',
        description: 'Complete legal documentation and compliance',
        requirements: ['Legal documents', 'Compliance checklist'],
        resources: ['Legal templates', 'Compliance guide'],
        elaraPrompt: 'Help me understand and complete the legal requirements',
        validationRules: [
          {
            field: 'legalDocumentsReviewed',
            type: 'boolean',
            required: true,
            message: 'Legal documents must be reviewed',
          },
          {
            field: 'complianceChecklist',
            type: 'string',
            required: true,
            message: 'Compliance checklist must be completed',
          },
        ],
        order: 3,
      },
      {
        id: generateUUID(),
        name: 'Launch',
        description: 'Prepare for business launch',
        requirements: ['Launch plan', 'Marketing strategy'],
        resources: ['Launch checklist', 'Marketing templates'],
        elaraPrompt: 'Help me create a launch plan and marketing strategy',
        validationRules: [
          {
            field: 'launchDate',
            type: 'string',
            required: true,
            message: 'Launch date is required',
          },
          {
            field: 'marketingStrategy',
            type: 'string',
            required: true,
            minLength: 20,
            message: 'Marketing strategy is required',
          },
        ],
        order: 4,
      },
      {
        id: generateUUID(),
        name: 'Tracking',
        description: 'Set up metrics and tracking for your business',
        requirements: ['KPIs', 'Tracking setup'],
        resources: ['KPI template', 'Analytics setup guide'],
        elaraPrompt: 'Help me define KPIs and set up tracking for my business',
        validationRules: [
          {
            field: 'kpis',
            type: 'string',
            required: true,
            minLength: 10,
            message: 'KPIs must be defined',
          },
          {
            field: 'trackingSetup',
            type: 'string',
            required: true,
            message: 'Tracking setup is required',
          },
        ],
        order: 5,
      },
    ];

    wizardSteps.set(businessId, defaultSteps);
  }

  /**
   * Validate step data against validation rules
   * Requirements: 1.2, 1.3
   */
  private validateStepData(step: WizardStep, data: Record<string, any>): void {
    for (const rule of step.validationRules) {
      const value = data[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        throw new AppError(400, rule.message);
      }

      if (value !== undefined && value !== null) {
        if (rule.type === 'string' && typeof value !== 'string') {
          throw new AppError(400, `${rule.field} must be a string`);
        }

        if (rule.type === 'number' && typeof value !== 'number') {
          throw new AppError(400, `${rule.field} must be a number`);
        }

        if (rule.type === 'boolean' && typeof value !== 'boolean') {
          throw new AppError(400, `${rule.field} must be a boolean`);
        }

        if (rule.minLength && value.length < rule.minLength) {
          throw new AppError(400, rule.message);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          throw new AppError(400, rule.message);
        }

        if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
          throw new AppError(400, rule.message);
        }
      }
    }
  }

  /**
   * Get wizard steps for a business
   * Requirements: 1.2, 1.3
   */
  async getWizardSteps(businessId: string, userId: string): Promise<WizardStep[]> {
    await this.getBusinessById(businessId, userId);
    return wizardSteps.get(businessId) || [];
  }

  /**
   * Get specific wizard step
   * Requirements: 1.2, 1.3
   */
  async getWizardStep(businessId: string, stepId: string, userId: string): Promise<WizardStep> {
    await this.getBusinessById(businessId, userId);
    const steps = wizardSteps.get(businessId) || [];
    const step = steps.find((s) => s.id === stepId);

    if (!step) {
      throw new AppError(404, 'Wizard step not found');
    }

    return step;
  }
}

export const businessService = new BusinessService();
