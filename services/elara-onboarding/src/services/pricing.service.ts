/**
 * Pricing & Benefits Service
 * 
 * Manages pricing tiers, discounts, and benefits for all user types
 */

import { ElaraLogger } from '../utils/logger';
import { UserType } from './user-type-detection.service';

export interface PricingTier {
  name: string;
  basePrice: number;
  discountPercentage: number;
  features: string[];
  description: string;
}

export interface UserBenefits {
  userType: UserType;
  tier?: string;
  discountPercentage: number;
  features: string[];
  pricingTiers: PricingTier[];
}

export interface PricingCalculation {
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  userType: UserType;
  tier?: string;
}

export interface StudentTier {
  tier: 'free' | 'premium' | 'pro';
  discountPercentage: number;
  features: string[];
  monthlyPrice?: number;
}

export interface PricingReport {
  userType: UserType;
  totalUsers: number;
  averageDiscount: number;
  totalDiscountedRevenue: number;
  revenueImpact: number;
  timestamp: Date;
}

export class PricingService {
  private logger: ElaraLogger;

  // Student tier definitions
  private readonly studentTiers: Record<string, StudentTier> = {
    free: {
      tier: 'free',
      discountPercentage: 100,
      features: [
        '3 free courses',
        '10 AI queries per month',
        '1GB storage',
        'Community support only',
        'No certifications',
        'No career services',
      ],
      monthlyPrice: 0,
    },
    premium: {
      tier: 'premium',
      discountPercentage: 50,
      features: [
        'Unlimited courses',
        'Unlimited AI queries',
        '10GB storage',
        'Priority email support',
        'Certifications included',
        'Career services included',
      ],
      monthlyPrice: 99.50,
    },
    pro: {
      tier: 'pro',
      discountPercentage: 30,
      features: [
        'Everything in Premium',
        'API access',
        'Advanced AI features',
        'Development tools',
        'Research collaboration',
        '100GB storage',
      ],
      monthlyPrice: 139.30,
    },
  };

  // Discount structure by user type
  private readonly discountsByUserType: Record<UserType, number> = {
    founder: 0,
    student: 30, // Average (freemium model)
    teacher: 25,
    researcher: 30,
    professional: 0,
    enterprise: 25, // Average (15-40% based on size)
    'non-profit': 75,
    government: 20, // Negotiated average
  };

  // Benefits by user type
  private readonly benefitsByUserType: Record<UserType, string[]> = {
    founder: [
      'Course creation tools',
      'Revenue analytics',
      'Student management',
      'Payment processing',
      'Marketing tools',
      'API access',
    ],
    student: [
      'Course access',
      'Certifications',
      'Career services',
      'Peer learning',
      'Mentorship',
      'Job board access',
    ],
    teacher: [
      'Educator tools',
      'Class management',
      'Student analytics',
      'Grading tools',
      'Course templates',
      'Professional development',
    ],
    researcher: [
      'Research collaboration',
      'Data analysis tools',
      'Publication support',
      'Peer review system',
      'Research funding database',
      'Academic networking',
    ],
    professional: [
      'Career development',
      'Skill assessments',
      'Job matching',
      'Networking events',
      'Resume builder',
      'Interview prep',
    ],
    enterprise: [
      'Admin dashboard',
      'User management',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
    ],
    'non-profit': [
      'Unlimited courses',
      'Team collaboration',
      'Impact tracking',
      'Fundraising tools',
      'Volunteer management',
      'Community features',
    ],
    government: [
      'Compliance features',
      'Audit logging',
      'Data residency',
      'Security certifications',
      'Custom compliance',
      'Government support',
    ],
  };

  constructor() {
    this.logger = new ElaraLogger('PricingService');
  }

  /**
   * Get pricing tiers for a user type
   */
  async getPricingTiers(userType: UserType): Promise<PricingTier[]> {
    try {
      this.logger.info(`Getting pricing tiers for user type: ${userType}`);

      switch (userType) {
        case 'student':
          return this.getStudentPricingTiers();
        case 'founder':
          return this.getFounderPricingTiers();
        case 'teacher':
          return this.getTeacherPricingTiers();
        case 'researcher':
          return this.getResearcherPricingTiers();
        case 'professional':
          return this.getProfessionalPricingTiers();
        case 'enterprise':
          return this.getEnterprisePricingTiers();
        case 'non-profit':
          return this.getNonProfitPricingTiers();
        case 'government':
          return this.getGovernmentPricingTiers();
        default:
          throw new Error(`Unknown user type: ${userType}`);
      }
    } catch (error) {
      this.logger.error('Error getting pricing tiers:', error);
      throw error;
    }
  }

  /**
   * Get benefits for a user type
   */
  async getBenefits(userType: UserType, studentTier?: string): Promise<UserBenefits> {
    try {
      this.logger.info(`Getting benefits for user type: ${userType}`);

      const discount = this.discountsByUserType[userType];
      const features = this.benefitsByUserType[userType];
      const pricingTiers = await this.getPricingTiers(userType);

      return {
        userType,
        tier: studentTier,
        discountPercentage: discount,
        features,
        pricingTiers,
      };
    } catch (error) {
      this.logger.error('Error getting benefits:', error);
      throw error;
    }
  }

  /**
   * Calculate pricing for a service
   */
  async calculatePricing(
    basePrice: number,
    userType: UserType,
    studentTier?: string
  ): Promise<PricingCalculation> {
    try {
      this.logger.info(`Calculating pricing for user type: ${userType}`);

      let discountPercentage = this.discountsByUserType[userType];

      // Override discount for student tiers
      if (userType === 'student' && studentTier) {
        const tier = this.studentTiers[studentTier];
        if (tier) {
          discountPercentage = tier.discountPercentage;
        }
      }

      const discountAmount = (basePrice * discountPercentage) / 100;
      const finalPrice = basePrice - discountAmount;

      return {
        basePrice,
        discountPercentage,
        discountAmount,
        finalPrice,
        userType,
        tier: studentTier,
      };
    } catch (error) {
      this.logger.error('Error calculating pricing:', error);
      throw error;
    }
  }

  /**
   * Get student tier information
   */
  async getStudentTier(tier: string): Promise<StudentTier> {
    try {
      this.logger.info(`Getting student tier: ${tier}`);

      const studentTier = this.studentTiers[tier];
      if (!studentTier) {
        throw new Error(`Unknown student tier: ${tier}`);
      }

      return studentTier;
    } catch (error) {
      this.logger.error('Error getting student tier:', error);
      throw error;
    }
  }

  /**
   * Verify student status
   */
  async verifyStudent(email: string): Promise<boolean> {
    try {
      this.logger.info(`Verifying student status for email: ${email}`);

      // Check for .edu email
      if (email.endsWith('.edu')) {
        return true;
      }

      // In production, would verify student ID or enrollment
      return false;
    } catch (error) {
      this.logger.error('Error verifying student:', error);
      throw error;
    }
  }

  /**
   * Apply discount to price
   */
  async applyDiscount(basePrice: number, discountPercentage: number): Promise<number> {
    try {
      this.logger.info(`Applying ${discountPercentage}% discount to price: ${basePrice}`);

      const discountAmount = (basePrice * discountPercentage) / 100;
      const finalPrice = basePrice - discountAmount;

      return finalPrice;
    } catch (error) {
      this.logger.error('Error applying discount:', error);
      throw error;
    }
  }

  /**
   * Generate pricing report
   */
  async generatePricingReport(userType: UserType, totalUsers: number): Promise<PricingReport> {
    try {
      this.logger.info(`Generating pricing report for user type: ${userType}`);

      const averageDiscount = this.discountsByUserType[userType];
      const averagePrice = 150; // Average service price
      const totalDiscountedRevenue = totalUsers * averagePrice * (1 - averageDiscount / 100);
      const revenueImpact = -(totalUsers * averagePrice * (averageDiscount / 100));

      return {
        userType,
        totalUsers,
        averageDiscount,
        totalDiscountedRevenue,
        revenueImpact,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating pricing report:', error);
      throw error;
    }
  }

  // Private helper methods for pricing tiers

  private getStudentPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Free',
        basePrice: 0,
        discountPercentage: 100,
        features: this.studentTiers.free.features,
        description: 'Perfect for getting started',
      },
      {
        name: 'Premium',
        basePrice: 99.50,
        discountPercentage: 50,
        features: this.studentTiers.premium.features,
        description: 'Most popular for students',
      },
      {
        name: 'Pro',
        basePrice: 139.30,
        discountPercentage: 30,
        features: this.studentTiers.pro.features,
        description: 'For advanced learners',
      },
    ];
  }

  private getFounderPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Starter',
        basePrice: 99,
        discountPercentage: 0,
        features: [
          'Course creation',
          'Up to 100 students',
          'Basic analytics',
          'Email support',
        ],
        description: 'For new course creators',
      },
      {
        name: 'Professional',
        basePrice: 299,
        discountPercentage: 0,
        features: [
          'Unlimited students',
          'Advanced analytics',
          'Marketing tools',
          'Priority support',
        ],
        description: 'For established creators',
      },
      {
        name: 'Enterprise',
        basePrice: 999,
        discountPercentage: 0,
        features: [
          'Everything in Professional',
          'API access',
          'Custom integrations',
          'Dedicated support',
        ],
        description: 'For large organizations',
      },
    ];
  }

  private getTeacherPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Educator',
        basePrice: 74.25, // 25% discount on 99
        discountPercentage: 25,
        features: [
          'Class management',
          'Student analytics',
          'Grading tools',
          'Course templates',
        ],
        description: 'For educators',
      },
      {
        name: 'Professional Educator',
        basePrice: 111.75, // 25% discount on 149
        discountPercentage: 25,
        features: [
          'Everything in Educator',
          'Advanced analytics',
          'Professional development',
          'Certification tools',
        ],
        description: 'For professional educators',
      },
    ];
  }

  private getResearcherPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Researcher',
        basePrice: 69.30, // 30% discount on 99
        discountPercentage: 30,
        features: [
          'Research collaboration',
          'Data analysis tools',
          'Publication support',
          'Peer review system',
        ],
        description: 'For researchers',
      },
      {
        name: 'Advanced Researcher',
        basePrice: 104.30, // 30% discount on 149
        discountPercentage: 30,
        features: [
          'Everything in Researcher',
          'Advanced analytics',
          'Research funding database',
          'Academic networking',
        ],
        description: 'For advanced researchers',
      },
    ];
  }

  private getProfessionalPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Professional',
        basePrice: 99,
        discountPercentage: 0,
        features: [
          'Career development',
          'Skill assessments',
          'Job matching',
          'Networking events',
        ],
        description: 'For professionals',
      },
      {
        name: 'Premium Professional',
        basePrice: 149,
        discountPercentage: 0,
        features: [
          'Everything in Professional',
          'Resume builder',
          'Interview prep',
          'Priority job matching',
        ],
        description: 'For career advancement',
      },
    ];
  }

  private getEnterprisePricingTiers(): PricingTier[] {
    return [
      {
        name: 'Enterprise Starter',
        basePrice: 749.25, // 25% discount on 999
        discountPercentage: 25,
        features: [
          'Admin dashboard',
          'User management',
          'Basic analytics',
          'Email support',
        ],
        description: 'For small enterprises',
      },
      {
        name: 'Enterprise Professional',
        basePrice: 599.40, // 40% discount on 999
        discountPercentage: 40,
        features: [
          'Everything in Starter',
          'Advanced analytics',
          'Custom integrations',
          'Priority support',
        ],
        description: 'For large enterprises',
      },
    ];
  }

  private getNonProfitPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Non-Profit',
        basePrice: 24.75, // 75% discount on 99
        discountPercentage: 75,
        features: [
          'Unlimited courses',
          'Team collaboration',
          'Impact tracking',
          'Fundraising tools',
        ],
        description: 'For non-profits',
      },
      {
        name: 'Non-Profit Plus',
        basePrice: 49.75, // 75% discount on 199
        discountPercentage: 75,
        features: [
          'Everything in Non-Profit',
          'Volunteer management',
          'Community features',
          'Advanced reporting',
        ],
        description: 'For larger non-profits',
      },
    ];
  }

  private getGovernmentPricingTiers(): PricingTier[] {
    return [
      {
        name: 'Government',
        basePrice: 799.20, // 20% discount on 999
        discountPercentage: 20,
        features: [
          'Compliance features',
          'Audit logging',
          'Data residency',
          'Security certifications',
        ],
        description: 'For government agencies',
      },
      {
        name: 'Government Enterprise',
        basePrice: 1199, // Custom negotiated
        discountPercentage: 0,
        features: [
          'Everything in Government',
          'Custom compliance',
          'Dedicated support',
          'SLA guarantees',
        ],
        description: 'For large government organizations',
      },
    ];
  }
}
