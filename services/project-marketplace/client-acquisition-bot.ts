interface Lead {
  id: string;
  company: string;
  industry: string;
  budget: number;
  needs: string[];
  contactEmail: string;
  score: number;
}

interface Campaign {
  id: string;
  target: string;
  message: string;
  sent: number;
  responses: number;
}

export class ClientAcquisitionBot {
  private leads: Map<string, Lead> = new Map();
  private campaigns: Campaign[] = [];

  generateLeads(industry: string, count: number): Lead[] {
    const leads: Lead[] = [];
    
    for (let i = 0; i < count; i++) {
      const lead: Lead = {
        id: `lead_${Date.now()}_${i}`,
        company: `${industry} Company ${i + 1}`,
        industry,
        budget: Math.floor(Math.random() * 50000) + 5000,
        needs: this.identifyNeeds(industry),
        contactEmail: `contact${i}@${industry.toLowerCase()}.com`,
        score: Math.random() * 100
      };
      
      this.leads.set(lead.id, lead);
      leads.push(lead);
    }
    
    return leads.sort((a, b) => b.score - a.score);
  }

  createOutreachCampaign(targetIndustry: string, studentSkills: string[]): Campaign {
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      target: targetIndustry,
      message: this.generateMessage(targetIndustry, studentSkills),
      sent: 0,
      responses: 0
    };
    
    this.campaigns.push(campaign);
    return campaign;
  }

  scoreLeads(leads: Lead[], studentCapabilities: string[]): Lead[] {
    return leads.map(lead => ({
      ...lead,
      score: this.calculateLeadScore(lead, studentCapabilities)
    })).sort((a, b) => b.score - a.score);
  }

  private identifyNeeds(industry: string): string[] {
    const needsMap: Record<string, string[]> = {
      'tech': ['web development', 'mobile app', 'API integration'],
      'retail': ['e-commerce', 'inventory system', 'CRM'],
      'healthcare': ['patient portal', 'scheduling system', 'data analytics'],
      'finance': ['dashboard', 'reporting', 'automation']
    };
    
    return needsMap[industry.toLowerCase()] || ['web development', 'automation'];
  }

  private generateMessage(industry: string, skills: string[]): string {
    return `We have talented students specializing in ${skills.join(', ')} ready to build solutions for ${industry} companies. Budget-friendly, high-quality work with 10% platform fee.`;
  }

  private calculateLeadScore(lead: Lead, capabilities: string[]): number {
    const needsMatch = lead.needs.filter(need => 
      capabilities.some(cap => need.toLowerCase().includes(cap.toLowerCase()))
    ).length / lead.needs.length;
    
    const budgetScore = Math.min(lead.budget / 10000, 1);
    
    return (needsMatch * 0.7 + budgetScore * 0.3) * 100;
  }
}
