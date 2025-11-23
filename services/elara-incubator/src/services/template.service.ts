import { generateUUID } from '../utils/uuid.js';
import { BusinessTemplate, WizardStep } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

// Mock database - replace with actual database calls
const templates: Map<string, BusinessTemplate> = new Map();

// Initialize default templates
function initializeDefaultTemplates(): void {
  if (templates.size > 0) {return;}

  const defaultTemplates: BusinessTemplate[] = [
    {
      id: generateUUID(),
      name: 'Ride-Sharing Platform',
      description: 'Launch a peer-to-peer ride-sharing service',
      type: 'ride-sharing',
      requirements: [
        'Vehicle verification system',
        'Driver background checks',
        'Insurance coverage',
        'GPS tracking',
        'Payment processing',
      ],
      resources: [
        'Ride-sharing legal templates',
        'Insurance provider contacts',
        'Driver onboarding guide',
        'Customer support playbook',
      ],
      wizardSteps: [
        {
          id: generateUUID(),
          name: 'Market Research',
          description: 'Analyze your local ride-sharing market',
          requirements: ['Market size analysis', 'Competitor analysis'],
          resources: ['Market research template'],
          elaraPrompt: 'Help me analyze the ride-sharing market in my area',
          validationRules: [
            {
              field: 'marketSize',
              type: 'number',
              required: true,
              message: 'Market size estimate is required',
            },
          ],
          order: 0,
        },
        {
          id: generateUUID(),
          name: 'Driver Recruitment',
          description: 'Build your driver network',
          requirements: ['Driver recruitment strategy', 'Incentive structure'],
          resources: ['Driver recruitment guide'],
          elaraPrompt: 'Help me create a driver recruitment strategy',
          validationRules: [
            {
              field: 'driverTarget',
              type: 'number',
              required: true,
              message: 'Target number of drivers is required',
            },
          ],
          order: 1,
        },
        {
          id: generateUUID(),
          name: 'Technology Setup',
          description: 'Set up your platform technology',
          requirements: ['App development', 'Backend infrastructure'],
          resources: ['Tech stack recommendations'],
          elaraPrompt: 'Help me plan my technology infrastructure',
          validationRules: [
            {
              field: 'techStack',
              type: 'string',
              required: true,
              message: 'Technology stack selection is required',
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Tutoring Service',
      description: 'Create an online or in-person tutoring platform',
      type: 'tutoring',
      requirements: [
        'Tutor vetting process',
        'Subject matter expertise verification',
        'Student progress tracking',
        'Scheduling system',
        'Payment processing',
      ],
      resources: [
        'Tutor onboarding checklist',
        'Curriculum templates',
        'Student assessment tools',
        'Marketing materials',
      ],
      wizardSteps: [
        {
          id: generateUUID(),
          name: 'Subject Selection',
          description: 'Choose your tutoring subjects',
          requirements: ['Subject expertise', 'Target grade levels'],
          resources: ['Subject selection guide'],
          elaraPrompt: 'Help me choose the right subjects to tutor',
          validationRules: [
            {
              field: 'subjects',
              type: 'string',
              required: true,
              message: 'At least one subject is required',
            },
          ],
          order: 0,
        },
        {
          id: generateUUID(),
          name: 'Tutor Recruitment',
          description: 'Build your tutor network',
          requirements: ['Tutor vetting', 'Compensation structure'],
          resources: ['Tutor recruitment guide'],
          elaraPrompt: 'Help me recruit and vet tutors',
          validationRules: [
            {
              field: 'tutorCount',
              type: 'number',
              required: true,
              message: 'Target tutor count is required',
            },
          ],
          order: 1,
        },
        {
          id: generateUUID(),
          name: 'Platform Setup',
          description: 'Set up your tutoring platform',
          requirements: ['Scheduling system', 'Payment processing'],
          resources: ['Platform setup guide'],
          elaraPrompt: 'Help me set up my tutoring platform',
          validationRules: [
            {
              field: 'platformType',
              type: 'string',
              required: true,
              message: 'Platform type (online/in-person) is required',
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'E-Commerce Store',
      description: 'Build an online retail business',
      type: 'e-commerce',
      requirements: [
        'Product sourcing',
        'Inventory management',
        'Payment gateway',
        'Shipping integration',
        'Customer service',
      ],
      resources: [
        'E-commerce platform comparison',
        'Supplier directory',
        'Inventory management tools',
        'Shipping provider contacts',
      ],
      wizardSteps: [
        {
          id: generateUUID(),
          name: 'Product Selection',
          description: 'Choose your product niche',
          requirements: ['Product research', 'Supplier identification'],
          resources: ['Product research guide'],
          elaraPrompt: 'Help me find the right product niche',
          validationRules: [
            {
              field: 'productNiche',
              type: 'string',
              required: true,
              message: 'Product niche is required',
            },
          ],
          order: 0,
        },
        {
          id: generateUUID(),
          name: 'Supplier Setup',
          description: 'Establish supplier relationships',
          requirements: ['Supplier contracts', 'Pricing agreements'],
          resources: ['Supplier negotiation guide'],
          elaraPrompt: 'Help me find and negotiate with suppliers',
          validationRules: [
            {
              field: 'supplierCount',
              type: 'number',
              required: true,
              message: 'Number of suppliers is required',
            },
          ],
          order: 1,
        },
        {
          id: generateUUID(),
          name: 'Store Launch',
          description: 'Launch your online store',
          requirements: ['Platform setup', 'Product listings'],
          resources: ['Store setup guide'],
          elaraPrompt: 'Help me launch my e-commerce store',
          validationRules: [
            {
              field: 'platform',
              type: 'string',
              required: true,
              message: 'E-commerce platform selection is required',
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Gig Platform',
      description: 'Create a marketplace for freelance services',
      type: 'gig-platform',
      requirements: [
        'Service provider vetting',
        'Quality assurance',
        'Dispute resolution',
        'Payment escrow',
        'Rating system',
      ],
      resources: [
        'Gig platform best practices',
        'Service provider onboarding',
        'Quality standards guide',
        'Dispute resolution procedures',
      ],
      wizardSteps: [
        {
          id: generateUUID(),
          name: 'Service Definition',
          description: 'Define the services on your platform',
          requirements: ['Service categories', 'Quality standards'],
          resources: ['Service definition guide'],
          elaraPrompt: 'Help me define the services for my gig platform',
          validationRules: [
            {
              field: 'serviceCategories',
              type: 'string',
              required: true,
              message: 'Service categories are required',
            },
          ],
          order: 0,
        },
        {
          id: generateUUID(),
          name: 'Provider Recruitment',
          description: 'Build your service provider network',
          requirements: ['Vetting process', 'Onboarding'],
          resources: ['Provider recruitment guide'],
          elaraPrompt: 'Help me recruit service providers',
          validationRules: [
            {
              field: 'providerTarget',
              type: 'number',
              required: true,
              message: 'Target provider count is required',
            },
          ],
          order: 1,
        },
        {
          id: generateUUID(),
          name: 'Platform Operations',
          description: 'Set up platform operations',
          requirements: ['Payment system', 'Support structure'],
          resources: ['Operations guide'],
          elaraPrompt: 'Help me set up platform operations',
          validationRules: [
            {
              field: 'operationsModel',
              type: 'string',
              required: true,
              message: 'Operations model is required',
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Custom Business',
      description: 'Define your own business model',
      type: 'custom',
      requirements: ['Business model definition', 'Market validation'],
      resources: ['Business model canvas', 'Lean startup guide'],
      wizardSteps: [
        {
          id: generateUUID(),
          name: 'Business Model',
          description: 'Define your business model',
          requirements: ['Value proposition', 'Revenue model'],
          resources: ['Business model canvas'],
          elaraPrompt: 'Help me define my business model',
          validationRules: [
            {
              field: 'businessModel',
              type: 'string',
              required: true,
              message: 'Business model description is required',
            },
          ],
          order: 0,
        },
        {
          id: generateUUID(),
          name: 'Market Validation',
          description: 'Validate your market opportunity',
          requirements: ['Customer interviews', 'Market research'],
          resources: ['Validation guide'],
          elaraPrompt: 'Help me validate my market opportunity',
          validationRules: [
            {
              field: 'validationResults',
              type: 'string',
              required: true,
              message: 'Validation results are required',
            },
          ],
          order: 1,
        },
        {
          id: generateUUID(),
          name: 'Go-to-Market',
          description: 'Plan your go-to-market strategy',
          requirements: ['Marketing plan', 'Launch timeline'],
          resources: ['GTM template'],
          elaraPrompt: 'Help me plan my go-to-market strategy',
          validationRules: [
            {
              field: 'gtmStrategy',
              type: 'string',
              required: true,
              message: 'Go-to-market strategy is required',
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  defaultTemplates.forEach((template) => {
    templates.set(template.id, template);
  });
}

export class TemplateService {
  constructor() {
    initializeDefaultTemplates();
  }

  /**
   * Get all business templates
   * Requirements: 1.1, 1.3
   */
  async getTemplates(): Promise<BusinessTemplate[]> {
    return Array.from(templates.values());
  }

  /**
   * Get template by ID
   * Requirements: 1.1, 1.3
   */
  async getTemplateById(templateId: string): Promise<BusinessTemplate> {
    const template = templates.get(templateId);

    if (!template) {
      throw new AppError(404, 'Business template not found');
    }

    return template;
  }

  /**
   * Get template by type
   * Requirements: 1.1, 1.3
   */
  async getTemplateByType(type: string): Promise<BusinessTemplate | null> {
    const template = Array.from(templates.values()).find((t) => t.type === type);
    return template || null;
  }

  /**
   * Get wizard steps for a template
   * Requirements: 1.2, 1.3
   */
  async getTemplateWizardSteps(templateId: string): Promise<WizardStep[]> {
    const template = await this.getTemplateById(templateId);
    return template.wizardSteps;
  }

  /**
   * Get specific wizard step from template
   * Requirements: 1.2, 1.3
   */
  async getTemplateWizardStep(templateId: string, stepOrder: number): Promise<WizardStep> {
    const template = await this.getTemplateById(templateId);
    const step = template.wizardSteps.find((s) => s.order === stepOrder);

    if (!step) {
      throw new AppError(404, 'Wizard step not found in template');
    }

    return step;
  }

  /**
   * Get template resources
   * Requirements: 1.1, 1.3
   */
  async getTemplateResources(templateId: string): Promise<string[]> {
    const template = await this.getTemplateById(templateId);
    return template.resources;
  }

  /**
   * Get template requirements
   * Requirements: 1.1, 1.3
   */
  async getTemplateRequirements(templateId: string): Promise<string[]> {
    const template = await this.getTemplateById(templateId);
    return template.requirements;
  }

  /**
   * Search templates by type
   * Requirements: 1.1, 1.3
   */
  async searchTemplates(query: string): Promise<BusinessTemplate[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.type.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get template statistics
   * Requirements: 1.1, 1.3
   */
  async getTemplateStats(): Promise<{
    totalTemplates: number;
    byType: Record<string, number>;
    totalWizardSteps: number;
  }> {
    const allTemplates = Array.from(templates.values());
    const byType: Record<string, number> = {};
    let totalWizardSteps = 0;

    allTemplates.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
      totalWizardSteps += t.wizardSteps.length;
    });

    return {
      totalTemplates: allTemplates.length,
      byType,
      totalWizardSteps,
    };
  }
}

export const templateService = new TemplateService();
