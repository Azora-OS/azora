import SearchEngine from '../search-engine';
import { SearchResultWithContent } from '../search-engine';

export interface FinancialAnalysis {
  businessType: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  breakEvenPoint: number;
  roi: number;
  paybackPeriod: string;
  sources: SearchResultWithContent[];
}

export interface FundingOpportunity {
  name: string;
  type: 'grant' | 'loan' | 'investment' | 'crowdfunding';
  amount: number;
  interestRate?: number;
  terms: string;
  eligibility: string[];
  source: string;
  url: string;
}

export interface KofiResponse {
  financialAnalysis: FinancialAnalysis;
  fundingOpportunities: FundingOpportunity[];
  recommendations: string[];
  confidence: number;
}

export class KofiIntelligence {
  private searchEngine: SearchEngine;

  constructor(searchEngine: SearchEngine) {
    this.searchEngine = searchEngine;
  }

  /**
   * Analyze business financials
   */
  async analyzeBusinessFinancials(
    businessType: string,
    initialCapital: number,
    projectedCustomers: number
  ): Promise<FinancialAnalysis> {
    try {
      const searchQuery = `${businessType} business financials revenue expenses profitability`;
      const sources = await this.searchEngine.hybridSearch(searchQuery, {
        topK: 10,
      });

      const revenuePerCustomer = this.estimateRevenuePerCustomer(businessType);
      const projectedRevenue = projectedCustomers * revenuePerCustomer;
      const projectedExpenses = this.estimateExpenses(businessType, initialCapital);
      const projectedProfit = projectedRevenue - projectedExpenses;

      return {
        businessType,
        projectedRevenue,
        projectedExpenses,
        projectedProfit,
        breakEvenPoint: this.calculateBreakEvenPoint(projectedExpenses, revenuePerCustomer),
        roi: this.calculateROI(projectedProfit, initialCapital),
        paybackPeriod: this.calculatePaybackPeriod(initialCapital, projectedProfit),
        sources: sources.slice(0, 5),
      };
    } catch (error) {
      console.error('Error analyzing business financials:', error);
      throw error;
    }
  }

  /**
   * Find funding opportunities
   */
  async findFundingOpportunities(
    businessType: string,
    requiredAmount: number,
    location?: string
  ): Promise<FundingOpportunity[]> {
    try {
      const locationQuery = location ? ` in ${location}` : '';
      const searchQuery = `funding opportunities ${businessType} grants loans investment${locationQuery}`;

      const sources = await this.searchEngine.hybridSearch(searchQuery, {
        topK: 15,
      });

      const opportunities: FundingOpportunity[] = [];

      // Generate funding opportunities
      opportunities.push({
        name: 'Government Small Business Grant',
        type: 'grant',
        amount: 100000,
        terms: 'Non-repayable grant for qualifying businesses',
        eligibility: ['South African citizen', 'Business plan required', 'Less than 5 years old'],
        source: 'Department of Trade and Industry',
        url: 'https://www.thedti.gov.za',
      });

      opportunities.push({
        name: 'Commercial Bank Loan',
        type: 'loan',
        amount: 500000,
        interestRate: 0.08,
        terms: '5-year repayment period',
        eligibility: ['Business registration', 'Financial statements', 'Collateral required'],
        source: 'Commercial Banks',
        url: 'https://www.banking.org.za',
      });

      opportunities.push({
        name: 'Venture Capital Investment',
        type: 'investment',
        amount: 1000000,
        terms: 'Equity stake in business',
        eligibility: ['Scalable business model', 'Strong team', 'Growth potential'],
        source: 'Venture Capital Firms',
        url: 'https://www.vcsa.co.za',
      });

      opportunities.push({
        name: 'Crowdfunding Campaign',
        type: 'crowdfunding',
        amount: 250000,
        terms: 'Rewards or equity-based crowdfunding',
        eligibility: ['Compelling business story', 'Marketing capability', 'Community support'],
        source: 'Crowdfunding Platforms',
        url: 'https://www.thundafund.com',
      });

      return opportunities.filter((opp) => opp.amount >= requiredAmount * 0.5);
    } catch (error) {
      console.error('Error finding funding opportunities:', error);
      throw error;
    }
  }

  /**
   * Comprehensive financial analysis
   */
  async analyzeFinancialOpportunity(
    businessType: string,
    initialCapital: number,
    projectedCustomers: number,
    location?: string
  ): Promise<KofiResponse> {
    try {
      const financialAnalysis = await this.analyzeBusinessFinancials(
        businessType,
        initialCapital,
        projectedCustomers
      );

      const fundingOpportunities = await this.findFundingOpportunities(
        businessType,
        initialCapital,
        location
      );

      const searchQuery = `${businessType} financial benchmarks industry standards`;
      const sources = await this.searchEngine.hybridSearch(searchQuery, {
        topK: 10,
      });

      const recommendations = this.generateFinancialRecommendations(
        financialAnalysis,
        fundingOpportunities
      );

      return {
        financialAnalysis,
        fundingOpportunities,
        recommendations,
        confidence: this.calculateConfidence(sources),
      };
    } catch (error) {
      console.error('Error analyzing financial opportunity:', error);
      throw error;
    }
  }

  /**
   * Estimate revenue per customer
   */
  private estimateRevenuePerCustomer(businessType: string): number {
    const estimates: Record<string, number> = {
      'e-commerce': 500,
      'saas': 1000,
      'consulting': 5000,
      'retail': 200,
      'services': 1500,
      'education': 2000,
    };

    return estimates[businessType.toLowerCase()] || 1000;
  }

  /**
   * Estimate business expenses
   */
  private estimateExpenses(businessType: string, initialCapital: number): number {
    // Simplified: assume 60% of revenue goes to expenses
    const revenuePerCustomer = this.estimateRevenuePerCustomer(businessType);
    const baseExpenses = initialCapital * 0.3; // 30% of initial capital for fixed costs
    return baseExpenses;
  }

  /**
   * Calculate break-even point
   */
  private calculateBreakEvenPoint(expenses: number, revenuePerCustomer: number): number {
    return Math.ceil(expenses / revenuePerCustomer);
  }

  /**
   * Calculate ROI
   */
  private calculateROI(profit: number, investment: number): number {
    return (profit / investment) * 100;
  }

  /**
   * Calculate payback period
   */
  private calculatePaybackPeriod(investment: number, monthlyProfit: number): string {
    if (monthlyProfit <= 0) return 'Not profitable';
    const months = Math.ceil(investment / monthlyProfit);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} years ${remainingMonths} months`;
  }

  /**
   * Generate financial recommendations
   */
  private generateFinancialRecommendations(
    analysis: FinancialAnalysis,
    opportunities: FundingOpportunity[]
  ): string[] {
    const recommendations: string[] = [];

    if (analysis.roi > 50) {
      recommendations.push('Excellent ROI potential - consider scaling up');
    } else if (analysis.roi > 20) {
      recommendations.push('Good ROI - proceed with caution and monitor closely');
    } else {
      recommendations.push('Low ROI - consider revising business model');
    }

    if (opportunities.length > 0) {
      recommendations.push(`${opportunities.length} funding options available`);
    }

    recommendations.push('Maintain detailed financial records');
    recommendations.push('Plan for contingencies and market changes');
    recommendations.push('Review financial projections quarterly');

    return recommendations;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(sources: SearchResultWithContent[]): number {
    if (sources.length === 0) return 0.3;
    if (sources.length < 3) return 0.6;
    if (sources.length < 5) return 0.8;
    return 0.95;
  }
}

export default KofiIntelligence;
