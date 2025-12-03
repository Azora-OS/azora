import SearchEngine from '../search-engine';
import { SearchResultWithContent } from '../search-engine';

export interface CareerPath {
  title: string;
  description: string;
  requiredSkills: string[];
  salaryRange: { min: number; max: number };
  growthPotential: string;
  nextSteps: string[];
  sources: SearchResultWithContent[];
}

export interface JobOpportunity {
  title: string;
  company: string;
  location: string;
  salary: number;
  description: string;
  requiredSkills: string[];
  matchScore: number;
  source: string;
}

export interface ThembaResponse {
  careerPaths: CareerPath[];
  jobOpportunities: JobOpportunity[];
  recommendations: string[];
  confidence: number;
}

export class ThembaIntelligence {
  private searchEngine: SearchEngine;

  constructor(searchEngine: SearchEngine) {
    this.searchEngine = searchEngine;
  }

  /**
   * Generate career paths based on skills and interests
   */
  async generateCareerPath(
    skills: string[],
    interests: string[]
  ): Promise<CareerPath[]> {
    try {
      const searchQuery = `career path ${skills.join(' ')} ${interests.join(' ')} job market`;
      const sources = await this.searchEngine.hybridSearch(searchQuery, {
        topK: 10,
      });

      const careerPaths: CareerPath[] = [];

      // Generate multiple career paths
      for (let i = 0; i < Math.min(3, sources.length); i++) {
        const path = this.generatePathFromSource(skills, interests, sources[i]);
        careerPaths.push(path);
      }

      return careerPaths;
    } catch (error) {
      console.error('Error generating career path:', error);
      throw error;
    }
  }

  /**
   * Find job opportunities matching skills
   */
  async findJobOpportunities(
    skills: string[],
    interests: string[],
    location?: string
  ): Promise<JobOpportunity[]> {
    try {
      const locationQuery = location ? ` in ${location}` : '';
      const searchQuery = `job opportunities ${skills.join(' ')} ${interests.join(' ')}${locationQuery}`;

      const sources = await this.searchEngine.hybridSearch(searchQuery, {
        topK: 15,
      });

      const opportunities: JobOpportunity[] = sources.map((source, index) => ({
        title: source.metadata.title || `Opportunity ${index + 1}`,
        company: source.metadata.source,
        location: location || 'Remote',
        salary: this.estimateSalary(skills),
        description: source.content || 'Job opportunity in your field of interest',
        requiredSkills: skills,
        matchScore: source.relevanceScore,
        source: source.metadata.url || '',
      }));

      return opportunities.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Error finding job opportunities:', error);
      throw error;
    }
  }

  /**
   * Analyze job market trends
   */
  async analyzeJobMarket(industry: string): Promise<ThembaResponse> {
    try {
      const searchQuery = `${industry} job market trends salary growth opportunities`;
      const sources = await this.searchEngine.hybridSearch(searchQuery, {
        topK: 10,
      });

      const careerPaths = this.generateCareerPathsFromMarketData(industry, sources);
      const jobOpportunities = this.generateJobOpportunitiesFromMarketData(industry, sources);
      const recommendations = this.generateMarketRecommendations(industry, sources);

      return {
        careerPaths,
        jobOpportunities,
        recommendations,
        confidence: this.calculateConfidence(sources),
      };
    } catch (error) {
      console.error('Error analyzing job market:', error);
      throw error;
    }
  }

  /**
   * Generate career path from source
   */
  private generatePathFromSource(
    skills: string[],
    interests: string[],
    source: SearchResultWithContent
  ): CareerPath {
    return {
      title: `${interests[0] || 'Professional'} Career Path`,
      description: `A career path leveraging your skills in ${skills.slice(0, 2).join(' and ')}`,
      requiredSkills: skills,
      salaryRange: { min: 30000, max: 120000 },
      growthPotential: 'High - Growing industry with strong demand',
      nextSteps: [
        'Develop advanced skills in your area',
        'Build a portfolio of projects',
        'Network with professionals in the field',
        'Apply for entry-level positions',
      ],
      sources: [source],
    };
  }

  /**
   * Estimate salary based on skills
   */
  private estimateSalary(skills: string[]): number {
    const baseSalary = 40000;
    const skillBonus = skills.length * 5000;
    return baseSalary + skillBonus;
  }

  /**
   * Generate career paths from market data
   */
  private generateCareerPathsFromMarketData(
    industry: string,
    sources: SearchResultWithContent[]
  ): CareerPath[] {
    return [
      {
        title: `${industry} Specialist`,
        description: `Become a specialist in ${industry}`,
        requiredSkills: ['Technical expertise', 'Industry knowledge', 'Problem-solving'],
        salaryRange: { min: 50000, max: 150000 },
        growthPotential: 'Very High',
        nextSteps: ['Get certified', 'Gain experience', 'Lead projects'],
        sources: sources.slice(0, 3),
      },
      {
        title: `${industry} Manager`,
        description: `Lead teams in ${industry}`,
        requiredSkills: ['Leadership', 'Communication', 'Strategic thinking'],
        salaryRange: { min: 60000, max: 200000 },
        growthPotential: 'High',
        nextSteps: ['Develop leadership skills', 'Manage projects', 'Lead teams'],
        sources: sources.slice(0, 3),
      },
    ];
  }

  /**
   * Generate job opportunities from market data
   */
  private generateJobOpportunitiesFromMarketData(
    industry: string,
    sources: SearchResultWithContent[]
  ): JobOpportunity[] {
    return sources.slice(0, 5).map((source, index) => ({
      title: `${industry} Professional - Role ${index + 1}`,
      company: source.metadata.source,
      location: 'South Africa',
      salary: 50000 + index * 10000,
      description: `Exciting opportunity in ${industry}`,
      requiredSkills: ['Industry knowledge', 'Technical skills', 'Communication'],
      matchScore: source.relevanceScore,
      source: source.metadata.url || '',
    }));
  }

  /**
   * Generate market recommendations
   */
  private generateMarketRecommendations(
    industry: string,
    sources: SearchResultWithContent[]
  ): string[] {
    return [
      `The ${industry} industry is growing rapidly with strong demand for skilled professionals`,
      `Focus on developing skills in emerging technologies within ${industry}`,
      `Network with professionals and attend industry events`,
      `Consider certifications to enhance your credentials`,
      `Stay updated with latest trends and developments in ${industry}`,
    ];
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(sources: SearchResultWithContent[]): number {
    if (sources.length === 0) {return 0.3;}
    if (sources.length < 3) {return 0.6;}
    if (sources.length < 5) {return 0.8;}
    return 0.95;
  }
}

export default ThembaIntelligence;
