import { UbuntuAction } from "../services/UbuntuTokenomicsEngine";

export class UbuntuScoreCalculator {
  
  calculateBaseScore(action: UbuntuAction): number {
    const categoryScores = {
      education: 25,
      healthcare: 30,
      community: 20,
      business: 15,
      technology: 20,
      arts: 10
    };

    const actionScores = {
      create: 20,
      share: 15,
      teach: 25,
      help: 20,
      collaborate: 15,
      innovate: 18,
      mentor: 22,
      contribute: 12
    };

    const categoryScore = categoryScores[action.category] || 10;
    const actionScore = this.extractActionScore(action.action, actionScores);
    
    return categoryScore + actionScore;
  }

  getImpactMultiplier(impact: string): number {
    const multipliers = {
      local: 1.0,
      regional: 1.2,
      continental: 1.5,
      global: 2.0
    };
    
    return multipliers[impact] || 1.0;
  }

  private extractActionScore(action: string, scores: any): number {
    const actionLower = action.toLowerCase();
    
    for (const [key, score] of Object.entries(scores)) {
      if (actionLower.includes(key)) {
        return score;
      }
    }
    
    return 10; // Default score
  }

  calculateCommunityBonus(userId: string): Promise<number> {
    // In a real implementation, this would:
    // 1. Check user's historical contributions
    // 2. Calculate their community standing
    // 3. Apply bonus based on reputation
    
    return new Promise((resolve) => {
      // Mock calculation - would be based on real data
      const historicalBonus = Math.random() * 10;
      resolve(historicalBonus);
    });
  }

  calculateCollaborationBonus(participants: number): number {
    // Reward collaborative efforts
    if (participants <= 1) return 0;
    if (participants <= 3) return 5;
    if (participants <= 5) return 10;
    if (participants <= 10) return 15;
    return 20;
  }

  calculateInnovationBonus(action: UbuntuAction): number {
    // Reward innovative and creative solutions
    const innovationKeywords = [
      "innovative", "creative", "breakthrough", "novel",
      "pioneering", "groundbreaking", "revolutionary", "first"
    ];
    
    const actionText = (action.action + " " + JSON.stringify(action.metadata)).toLowerCase();
    const matches = innovationKeywords.filter(keyword => actionText.includes(keyword));
    
    return matches.length * 3;
  }

  calculateSustainabilityBonus(action: UbuntuAction): number {
    // Reward environmentally and socially sustainable actions
    const sustainabilityKeywords = [
      "sustainable", "eco", "green", "renewable", "recycle",
      "conservation", "environmental", "social", "ethical"
    ];
    
    const actionText = (action.action + " " + JSON.stringify(action.metadata)).toLowerCase();
    const matches = sustainabilityKeywords.filter(keyword => actionText.includes(keyword));
    
    return matches.length * 2;
  }
}
