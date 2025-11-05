/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { SkillVerificationService, SkillBadge } from '../verification/skillVerificationService';
import { RatingService, SellerRatingSummary } from '../ratings/ratingService';

export interface ServiceProviderProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  location: string;
  languages: string[];
  timezone: string;
  
  // Skills & Verification
  skills: SkillBadge[];
  expertise: string[];
  yearsOfExperience: number;
  
  // Ratings & Reviews
  ratingSummary: SellerRatingSummary;
  
  // Portfolio
  portfolio: PortfolioItem[];
  
  // Service Packages
  packages: ServicePackage[];
  
  // Availability
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    hoursPerWeek: number;
    responseTime: string; // e.g., "within 2 hours"
  };
  
  // Statistics
  stats: {
    totalProjects: number;
    completedProjects: number;
    ongoingProjects: number;
    totalEarnings: number;
    repeatClients: number;
    averageDeliveryTime: number; // in days
  };
  
  // Badges & Achievements
  badges: string[];
  achievements: Achievement[];
  
  // Social & Links
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  videoUrl?: string;
  tags: string[];
  category: string;
  projectDate: Date;
  clientName?: string;
  testimonial?: string;
}

export interface ServicePackage {
  id: string;
  name: 'Basic' | 'Standard' | 'Premium' | 'Custom';
  description: string;
  price: number;
  currency: string;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
  active: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

/**
 * 👤 SERVICE PROVIDER PROFILE SERVICE
 * 
 * Comprehensive profiles for sellers showcasing their skills,
 * portfolio, and reputation.
 */
export class ProfileService {
  
  /**
   * Create a new service provider profile
   */
  static async createProfile(data: {
    userId: string;
    displayName: string;
    bio: string;
    location: string;
    languages: string[];
    expertise: string[];
    yearsOfExperience: number;
  }): Promise<ServiceProviderProfile> {
    const profile: ServiceProviderProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      timezone: 'Africa/Johannesburg',
      skills: [],
      portfolio: [],
      packages: [],
      availability: {
        status: 'available',
        hoursPerWeek: 40,
        responseTime: 'within 24 hours'
      },
      stats: {
        totalProjects: 0,
        completedProjects: 0,
        ongoingProjects: 0,
        totalEarnings: 0,
        repeatClients: 0,
        averageDeliveryTime: 0
      },
      badges: [],
      achievements: [],
      ratingSummary: {} as SellerRatingSummary,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date()
    };

    // Load verified skills from Education
    profile.skills = await SkillVerificationService.getVerifiedSkills(data.userId);

    // Load rating summary
    profile.ratingSummary = await RatingService.getSellerRatingSummary(data.userId);

    // TODO: Save to database
    // await prisma.serviceProviderProfile.create({ data: profile });

    this.emitEvent('profile:created', profile);

    return profile;
  }

  /**
   * Get profile by user ID
   */
  static async getProfile(userId: string): Promise<ServiceProviderProfile | null> {
    // TODO: Fetch from database
    // return await prisma.serviceProviderProfile.findUnique({
    //   where: { userId },
    //   include: { portfolio: true, packages: true, skills: true }
    // });
    return null;
  }

  /**
   * Update profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<ServiceProviderProfile>
  ): Promise<ServiceProviderProfile> {
    // TODO: Update in database
    // await prisma.serviceProviderProfile.update({
    //   where: { userId },
    //   data: { ...updates, updatedAt: new Date() }
    // });

    this.emitEvent('profile:updated', { userId, updates });

    return {} as ServiceProviderProfile;
  }

  /**
   * Add portfolio item
   */
  static async addPortfolioItem(
    userId: string,
    item: Omit<PortfolioItem, 'id'>
  ): Promise<PortfolioItem> {
    const portfolioItem: PortfolioItem = {
      ...item,
      id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // TODO: Save to database
    // await prisma.portfolioItem.create({
    //   data: { ...portfolioItem, userId }
    // });

    this.emitEvent('profile:portfolio_added', { userId, item: portfolioItem });

    return portfolioItem;
  }

  /**
   * Add service package
   */
  static async addServicePackage(
    userId: string,
    packageData: Omit<ServicePackage, 'id'>
  ): Promise<ServicePackage> {
    const servicePackage: ServicePackage = {
      ...packageData,
      id: `package_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // TODO: Save to database
    // await prisma.servicePackage.create({
    //   data: { ...servicePackage, userId }
    // });

    this.emitEvent('profile:package_added', { userId, package: servicePackage });

    return servicePackage;
  }

  /**
   * Update availability status
   */
  static async updateAvailability(
    userId: string,
    availability: ServiceProviderProfile['availability']
  ): Promise<void> {
    // TODO: Update in database
    // await prisma.serviceProviderProfile.update({
    //   where: { userId },
    //   data: { availability }
    // });

    this.emitEvent('profile:availability_updated', { userId, availability });
  }

  /**
   * Update profile statistics after project completion
   */
  static async updateProfileStats(
    userId: string,
    projectData: {
      completed: boolean;
      earnings: number;
      deliveryTime: number;
      isRepeatClient: boolean;
    }
  ): Promise<void> {
    // TODO: Update in database
    // const profile = await this.getProfile(userId);
    // const updatedStats = {
    //   totalProjects: profile.stats.totalProjects + 1,
    //   completedProjects: projectData.completed ? profile.stats.completedProjects + 1 : profile.stats.completedProjects,
    //   totalEarnings: profile.stats.totalEarnings + projectData.earnings,
    //   repeatClients: projectData.isRepeatClient ? profile.stats.repeatClients + 1 : profile.stats.repeatClients,
    //   // Calculate new average delivery time
    //   averageDeliveryTime: ((profile.stats.averageDeliveryTime * profile.stats.totalProjects) + projectData.deliveryTime) / (profile.stats.totalProjects + 1)
    // };

    // await prisma.serviceProviderProfile.update({
    //   where: { userId },
    //   data: { stats: updatedStats }
    // });

    this.emitEvent('profile:stats_updated', { userId });
  }

  /**
   * Award badge
   */
  static async awardBadge(userId: string, badgeName: string): Promise<void> {
    // TODO: Add badge to profile
    // await prisma.serviceProviderProfile.update({
    //   where: { userId },
    //   data: { badges: { push: badgeName } }
    // });

    this.emitEvent('profile:badge_awarded', { userId, badge: badgeName });
  }

  /**
   * Unlock achievement
   */
  static async unlockAchievement(
    userId: string,
    achievement: Omit<Achievement, 'id' | 'unlockedAt'>
  ): Promise<Achievement> {
    const newAchievement: Achievement = {
      ...achievement,
      id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      unlockedAt: new Date()
    };

    // TODO: Save to database
    // await prisma.achievement.create({
    //   data: { ...newAchievement, userId }
    // });

    this.emitEvent('profile:achievement_unlocked', { userId, achievement: newAchievement });

    return newAchievement;
  }

  /**
   * Search profiles by skills, location, rating
   */
  static async searchProfiles(filters: {
    skills?: string[];
    location?: string;
    minRating?: number;
    availability?: 'available' | 'busy' | 'unavailable';
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ profiles: ServiceProviderProfile[]; total: number }> {
    // TODO: Search in database with filters
    // const query: any = {};
    
    // if (filters.skills) query.skills = { some: { skillName: { in: filters.skills } } };
    // if (filters.location) query.location = { contains: filters.location };
    // if (filters.minRating) query.ratingSummary = { averageRatings: { overall: { gte: filters.minRating } } };
    // if (filters.availability) query.availability = { status: filters.availability };

    // const profiles = await prisma.serviceProviderProfile.findMany({
    //   where: query,
    //   skip: ((filters.page || 1) - 1) * (filters.limit || 20),
    //   take: filters.limit || 20
    // });

    return { profiles: [], total: 0 };
  }

  /**
   * Get top-rated profiles
   */
  static async getTopRatedProfiles(limit: number = 10): Promise<ServiceProviderProfile[]> {
    // TODO: Fetch from database
    // return await prisma.serviceProviderProfile.findMany({
    //   where: { ratingSummary: { averageRatings: { overall: { gte: 4.5 } } } },
    //   orderBy: { ratingSummary: { averageRatings: { overall: 'desc' } } },
    //   take: limit
    // });
    return [];
  }

  /**
   * Update last active time
   */
  static async updateLastActive(userId: string): Promise<void> {
    // TODO: Update in database
    // await prisma.serviceProviderProfile.update({
    //   where: { userId },
    //   data: { lastActiveAt: new Date() }
    // });
  }

  private static emitEvent(event: string, data: any) {
    console.log(`🔔 Profile Event: ${event}`, data);
    // Emit to organism event bus
    // OrganismEventBus.emit(event, data);
  }
}
