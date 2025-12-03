export interface CommunityMetrics {
  totalScore: number;
  activeContributors: number;
  fairnessIndex: number;
  growthRate: number;
  averageUbuntuScore: number;
  topContributors: string[];
  communityHealth: number;
}

export interface CommunityMember {
  userId: string;
  ubuntuScore: number;
  contributions: number;
  lastActive: Date;
  role: string;
  reputation: number;
}

export class CommunityAnalyzer {
  private members: Map<string, CommunityMember> = new Map();
  private historicalData: Array<{ timestamp: Date; metrics: CommunityMetrics }> = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with mock community data
    const mockMembers = [
      { userId: "user_1", ubuntuScore: 95, contributions: 150, lastActive: new Date(), role: "mentor", reputation: 4.8 },
      { userId: "user_2", ubuntuScore: 87, contributions: 120, lastActive: new Date(), role: "educator", reputation: 4.5 },
      { userId: "user_3", ubuntuScore: 92, contributors: 98, lastActive: new Date(), role: "healthcare", reputation: 4.7 },
      { userId: "user_4", ubuntuScore: 78, contributions: 85, lastActive: new Date(), role: "business", reputation: 4.2 },
      { userId: "user_5", ubuntuScore: 88, contributions: 110, lastActive: new Date(), role: "technology", reputation: 4.6 }
    ];

    mockMembers.forEach(member => {
      this.members.set(member.userId, member);
    });
  }

  async getCommunityBonus(userId: string): Promise<number> {
    const member = this.members.get(userId);
    if (!member) return 0;

    // Calculate bonus based on reputation and contribution history
    const reputationBonus = member.reputation * 2;
    const contributionBonus = Math.min(member.contributions * 0.1, 10);
    const activityBonus = this.calculateActivityBonus(member);

    return Math.round((reputationBonus + contributionBonus + activityBonus) * 100) / 100;
  }

  private calculateActivityBonus(member: CommunityMember): number {
    const daysSinceLastActive = (Date.now() - member.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActive <= 1) return 5; // Active today
    if (daysSinceLastActive <= 7) return 3; // Active this week
    if (daysSinceLastActive <= 30) return 1; // Active this month
    return 0; // Inactive
  }

  async getCommunityMetrics(): Promise<CommunityMetrics> {
    const members = Array.from(this.members.values());
    const activeMembers = members.filter(m => this.isActive(m));
    
    const totalScore = members.reduce((sum, m) => sum + m.ubuntuScore, 0);
    const averageScore = members.length > 0 ? totalScore / members.length : 0;
    const fairnessIndex = this.calculateFairnessIndex(members);
    const growthRate = this.calculateGrowthRate();
    const communityHealth = this.calculateCommunityHealth(members);
    const topContributors = this.getTopContributors(members);

    const metrics: CommunityMetrics = {
      totalScore,
      activeContributors: activeMembers.length,
      fairnessIndex,
      growthRate,
      averageUbuntuScore: averageScore,
      topContributors,
      communityHealth
    };

    // Store historical data
    this.historicalData.push({
      timestamp: new Date(),
      metrics
    });

    // Keep only last 30 days of data
    if (this.historicalData.length > 30) {
      this.historicalData = this.historicalData.slice(-30);
    }

    return metrics;
  }

  private isActive(member: CommunityMember): boolean {
    const daysSinceLastActive = (Date.now() - member.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastActive <= 30; // Active in last 30 days
  }

  private calculateFairnessIndex(members: CommunityMember[]): number {
    if (members.length === 0) return 0;

    // Calculate Gini coefficient for distribution fairness
    const scores = members.map(m => m.ubuntuScore).sort((a, b) => a - b);
    const n = scores.length;
    
    let gini = 0;
    for (let i = 0; i < n; i++) {
      gini += (2 * (i + 1) - n - 1) * scores[i];
    }
    
    gini = gini / (n * scores[n - 1]);
    
    // Convert Gini to fairness index (1 - Gini)
    return Math.round((1 - gini) * 100) / 100;
  }

  private calculateGrowthRate(): number {
    if (this.historicalData.length < 2) return 0;

    const recent = this.historicalData[this.historicalData.length - 1];
    const previous = this.historicalData[this.historicalData.length - 2];
    
    const scoreGrowth = (recent.metrics.totalScore - previous.metrics.totalScore) / previous.metrics.totalScore;
    const memberGrowth = (recent.metrics.activeContributors - previous.metrics.activeContributors) / previous.metrics.activeContributors;
    
    return Math.round(((scoreGrowth + memberGrowth) / 2) * 100) / 100;
  }

  private calculateCommunityHealth(members: CommunityMember[]): number {
    if (members.length === 0) return 0;

    const activeRatio = members.filter(m => this.isActive(m)).length / members.length;
    const averageReputation = members.reduce((sum, m) => sum + m.reputation, 0) / members.length;
    const contributionRate = members.reduce((sum, m) => sum + m.contributions, 0) / members.length;

    // Weighted health score
    const healthScore = (activeRatio * 0.4) + (averageReputation / 5 * 0.3) + (Math.min(contributionRate / 100, 1) * 0.3);
    
    return Math.round(healthScore * 100) / 100;
  }

  private getTopContributors(members: CommunityMember[]): string[] {
    return members
      .sort((a, b) => b.ubuntuScore - a.ubuntuScore)
      .slice(0, 10)
      .map(m => m.userId);
  }

  analyzeCommunityTrends(): {
    trend: "improving" | "declining" | "stable";
    insights: string[];
    recommendations: string[];
  } {
    if (this.historicalData.length < 7) {
      return {
        trend: "stable",
        insights: ["Insufficient data for trend analysis"],
        recommendations: ["Continue collecting community data"]
      };
    }

    const recent = this.historicalData.slice(-7);
    const scores = recent.map(d => d.metrics.totalScore);
    const activeContributors = recent.map(d => d.metrics.activeContributors);

    const scoreTrend = this.calculateTrend(scores);
    const contributorTrend = this.calculateTrend(activeContributors);

    let overallTrend: "improving" | "declining" | "stable" = "stable";
    if (scoreTrend > 0.05 && contributorTrend > 0.05) overallTrend = "improving";
    if (scoreTrend < -0.05 || contributorTrend < -0.05) overallTrend = "declining";

    const insights = this.generateInsights(recent);
    const recommendations = this.generateRecommendations(overallTrend, recent);

    return {
      trend: overallTrend,
      insights,
      recommendations
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    return slope / avgY; // Normalized trend
  }

  private generateInsights(data: any[]): string[] {
    const insights: string[] = [];
    
    const avgScore = data.reduce((sum, d) => sum + d.metrics.totalScore, 0) / data.length;
    const avgContributors = data.reduce((sum, d) => sum + d.metrics.activeContributors, 0) / data.length;
    
    if (avgScore > 500) {
      insights.push("Community showing strong Ubuntu score performance");
    }
    
    if (avgContributors > 100) {
      insights.push("High community engagement with many active contributors");
    }
    
    const latest = data[data.length - 1];
    if (latest.metrics.communityHealth > 0.8) {
      insights.push("Excellent community health indicators");
    }

    return insights;
  }

  private generateRecommendations(trend: string, data: any[]): string[] {
    const recommendations: string[] = [];
    
    if (trend === "declining") {
      recommendations.push("Launch community engagement initiatives");
      recommendations.push("Increase Ubuntu education programs");
      recommendations.push("Review and improve reward mechanisms");
    } else if (trend === "stable") {
      recommendations.push("Focus on growth strategies");
      recommendations.push("Enhance collaborative features");
      recommendations.push("Expand community outreach");
    } else {
      recommendations.push("Maintain current momentum");
      recommendations.push("Scale successful initiatives");
      recommendations.push("Share best practices with other communities");
    }

    return recommendations;
  }
}
