/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface Rating {
  id: string;
  projectId: string;
  sellerId: string;
  buyerId: string;
  ratings: {
    overall: number; // 1-5
    quality: number; // 1-5
    communication: number; // 1-5
    delivery: number; // 1-5
    value: number; // 1-5
  };
  review?: string;
  images?: string[];
  response?: {
    text: string;
    createdAt: Date;
  };
  helpful: number; // How many found this helpful
  verified: boolean; // Verified purchase
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerRatingSummary {
  sellerId: string;
  totalRatings: number;
  averageRatings: {
    overall: number;
    quality: number;
    communication: number;
    delivery: number;
    value: number;
  };
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  badges: string[]; // e.g., "Top Rated", "Fast Responder", "Quality Assured"
}

/**
 * ⭐ RATING & REVIEW SERVICE
 * 
 * Builds trust through transparent ratings and reviews.
 * Buyers rate sellers, sellers can respond.
 */
export class RatingService {
  
  /**
   * Create a rating/review after project completion
   */
  static async createRating(data: {
    projectId: string;
    sellerId: string;
    buyerId: string;
    ratings: Rating['ratings'];
    review?: string;
    images?: string[];
  }): Promise<Rating> {
    const { projectId, sellerId, buyerId, ratings, review, images } = data;

    // Validate ratings are 1-5
    const allRatings = Object.values(ratings);
    if (allRatings.some(r => r < 1 || r > 5)) {
      throw new Error('All ratings must be between 1 and 5');
    }

    // Check if buyer already rated this project
    // const existing = await prisma.rating.findFirst({
    //   where: { projectId, buyerId }
    // });
    // if (existing) throw new Error('You have already rated this project');

    // Verify project is completed
    // const project = await ProjectService.getProject(projectId);
    // if (project.status !== 'completed') {
    //   throw new Error('Can only rate completed projects');
    // }

    const rating: Rating = {
      id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      sellerId,
      buyerId,
      ratings,
      review,
      images,
      helpful: 0,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TODO: Save to database
    // await prisma.rating.create({ data: rating });

    // Update seller's rating summary
    await this.updateSellerRatingSummary(sellerId);

    // Emit event
    this.emitEvent('rating:created', rating);

    return rating;
  }

  /**
   * Add seller response to a rating
   */
  static async addResponse(
    ratingId: string,
    sellerId: string,
    responseText: string
  ): Promise<Rating> {
    // TODO: Fetch rating
    // const rating = await prisma.rating.findUnique({ where: { id: ratingId } });

    // Validate seller owns this rating
    // if (rating.sellerId !== sellerId) {
    //   throw new Error('Only the seller can respond to this rating');
    // }

    // Update rating with response
    // await prisma.rating.update({
    //   where: { id: ratingId },
    //   data: {
    //     response: {
    //       text: responseText,
    //       createdAt: new Date()
    //     }
    //   }
    // });

    this.emitEvent('rating:response_added', { ratingId, sellerId });

    return {} as Rating;
  }

  /**
   * Mark rating as helpful
   */
  static async markHelpful(ratingId: string, userId: string): Promise<void> {
    // TODO: Increment helpful count
    // await prisma.rating.update({
    //   where: { id: ratingId },
    //   data: { helpful: { increment: 1 } }
    // });

    this.emitEvent('rating:marked_helpful', { ratingId, userId });
  }

  /**
   * Get all ratings for a seller
   */
  static async getSellerRatings(
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ ratings: Rating[]; total: number }> {
    // TODO: Fetch from database
    // const ratings = await prisma.rating.findMany({
    //   where: { sellerId },
    //   orderBy: { createdAt: 'desc' },
    //   skip: (page - 1) * limit,
    //   take: limit
    // });

    // const total = await prisma.rating.count({ where: { sellerId } });

    return { ratings: [], total: 0 };
  }

  /**
   * Get rating summary for a seller
   */
  static async getSellerRatingSummary(sellerId: string): Promise<SellerRatingSummary> {
    // TODO: Aggregate from database
    // const ratings = await prisma.rating.findMany({
    //   where: { sellerId },
    //   select: { ratings: true }
    // });

    // if (ratings.length === 0) {
    //   return {
    //     sellerId,
    //     totalRatings: 0,
    //     averageRatings: { overall: 0, quality: 0, communication: 0, delivery: 0, value: 0 },
    //     ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    //     badges: []
    //   };
    // }

    // Calculate averages
    // const avgOverall = ratings.reduce((sum, r) => sum + r.ratings.overall, 0) / ratings.length;
    // ...

    // Calculate distribution
    // const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    // ratings.forEach(r => {
    //   const overall = Math.round(r.ratings.overall);
    //   distribution[overall]++;
    // });

    // Determine badges
    const badges = this.calculateBadges({
      totalRatings: 0,
      averageOverall: 0
    });

    return {
      sellerId,
      totalRatings: 0,
      averageRatings: { overall: 0, quality: 0, communication: 0, delivery: 0, value: 0 },
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      badges
    };
  }

  /**
   * Update seller's rating summary (called after new rating)
   */
  private static async updateSellerRatingSummary(sellerId: string): Promise<void> {
    const summary = await this.getSellerRatingSummary(sellerId);
    // TODO: Cache summary in database for fast access
    // await prisma.sellerProfile.update({
    //   where: { id: sellerId },
    //   data: { ratingSummary: summary }
    // });
  }

  /**
   * Calculate badges based on performance
   */
  private static calculateBadges(data: {
    totalRatings: number;
    averageOverall: number;
  }): string[] {
    const badges: string[] = [];

    // Top Rated Badge
    if (data.totalRatings >= 50 && data.averageOverall >= 4.8) {
      badges.push('Top Rated');
    } else if (data.totalRatings >= 20 && data.averageOverall >= 4.5) {
      badges.push('Rising Star');
    }

    // Volume badges
    if (data.totalRatings >= 100) badges.push('100+ Reviews');
    else if (data.totalRatings >= 50) badges.push('50+ Reviews');

    return badges;
  }

  /**
   * Get rating for a specific project
   */
  static async getProjectRating(projectId: string): Promise<Rating | null> {
    // TODO: Fetch from database
    // return await prisma.rating.findFirst({ where: { projectId } });
    return null;
  }

  /**
   * Flag inappropriate rating for review
   */
  static async flagRating(
    ratingId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    // TODO: Create moderation ticket
    // await prisma.moderationTicket.create({
    //   data: {
    //     type: 'rating',
    //     itemId: ratingId,
    //     reportedBy: userId,
    //     reason,
    //     status: 'pending'
    //   }
    // });

    this.emitEvent('rating:flagged', { ratingId, userId, reason });
  }

  private static emitEvent(event: string, data: any) {
    console.log(`🔔 Rating Event: ${event}`, data);
    // Emit to organism event bus
    // OrganismEventBus.emit(event, data);
  }
}
