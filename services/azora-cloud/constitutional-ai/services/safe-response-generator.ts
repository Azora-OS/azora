/**
 * Safe Response Generator Service
 * Generates safe, helpful responses for harmful queries
 */

import { HarmType, HarmAssessment } from '../types';

/**
 * Configuration for safe response generator
 */
export interface SafeResponseConfig {
  includeResources: boolean;
  includeExplanation: boolean;
  tone: 'empathetic' | 'neutral' | 'firm';
  maxLength: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SafeResponseConfig = {
  includeResources: true,
  includeExplanation: true,
  tone: 'empathetic',
  maxLength: 500
};

/**
 * Resource information for different harm types
 */
interface HelpResource {
  name: string;
  contact: string;
  description: string;
  url?: string;
}

/**
 * Safe Response Generator
 * Creates appropriate, helpful responses for harmful content
 */
export class SafeResponseGenerator {
  private config: SafeResponseConfig;
  private resources: Map<HarmType, HelpResource[]>;

  constructor(config: Partial<SafeResponseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.resources = this.initializeResources();
  }

  /**
   * Initialize help resources for different harm types
   */
  private initializeResources(): Map<HarmType, HelpResource[]> {
    const resources = new Map<HarmType, HelpResource[]>();

    resources.set(HarmType.SELF_HARM, [
      {
        name: 'National Suicide Prevention Lifeline (US)',
        contact: '988',
        description: '24/7 crisis support for people in distress',
        url: 'https://988lifeline.org'
      },
      {
        name: 'Crisis Text Line',
        contact: 'Text HOME to 741741',
        description: 'Free 24/7 text support for people in crisis'
      },
      {
        name: 'International Association for Suicide Prevention',
        contact: 'Visit website for country-specific resources',
        description: 'Global directory of crisis centers',
        url: 'https://www.iasp.info/resources/Crisis_Centres'
      }
    ]);

    resources.set(HarmType.VIOLENCE, [
      {
        name: 'National Domestic Violence Hotline',
        contact: '1-800-799-7233',
        description: 'Support for victims of domestic violence'
      },
      {
        name: 'Local Emergency Services',
        contact: '911 (US) or local emergency number',
        description: 'Immediate help for violent situations'
      }
    ]);

    resources.set(HarmType.ILLEGAL, [
      {
        name: 'Legal Aid Services',
        contact: 'Contact local legal aid office',
        description: 'Free or low-cost legal assistance'
      },
      {
        name: 'Law Enforcement',
        contact: 'Local police non-emergency line',
        description: 'Report illegal activities or seek guidance'
      }
    ]);

    resources.set(HarmType.HARASSMENT, [
      {
        name: 'Cyber Civil Rights Initiative',
        contact: 'Visit cybercivilrights.org',
        description: 'Support for victims of online harassment',
        url: 'https://www.cybercivilrights.org'
      },
      {
        name: 'Local Law Enforcement',
        contact: 'Local police department',
        description: 'Report harassment and threats'
      }
    ]);

    resources.set(HarmType.EXPLOITATION, [
      {
        name: 'Federal Trade Commission',
        contact: 'reportfraud.ftc.gov',
        description: 'Report scams and fraud',
        url: 'https://reportfraud.ftc.gov'
      },
      {
        name: 'National Center for Missing & Exploited Children',
        contact: '1-800-843-5678',
        description: 'Report child exploitation'
      }
    ]);

    return resources;
  }

  /**
   * Generate safe response based on harm assessment
   */
  generateResponse(query: string, assessment: HarmAssessment): string {
    const parts: string[] = [];

    // Add opening statement
    parts.push(this.getOpeningStatement(assessment));

    // Add explanation if configured
    if (this.config.includeExplanation) {
      parts.push(this.getExplanation(assessment));
    }

    // Add resources if configured and available
    if (this.config.includeResources) {
      const resourceText = this.getResourcesText(assessment.harmTypes);
      if (resourceText) {
        parts.push(resourceText);
      }
    }

    // Add closing statement
    parts.push(this.getClosingStatement(assessment));

    // Combine and truncate if needed
    let response = parts.filter(p => p).join('\n\n');
    
    if (response.length > this.config.maxLength) {
      response = response.substring(0, this.config.maxLength - 3) + '...';
    }

    return response;
  }

  /**
   * Get opening statement based on tone and severity
   */
  private getOpeningStatement(assessment: HarmAssessment): string {
    const { tone } = this.config;
    const { severity, harmTypes } = assessment;

    if (harmTypes.includes(HarmType.SELF_HARM)) {
      return tone === 'empathetic'
        ? "I'm genuinely concerned about your wellbeing and want to help."
        : "I cannot provide information related to self-harm.";
    }

    if (severity >= 9) {
      switch (tone) {
        case 'empathetic':
          return "I understand you may be looking for information, but I cannot assist with this request.";
        case 'firm':
          return "I cannot and will not provide information for this request.";
        default:
          return "I cannot provide a response to this query.";
      }
    }

    if (severity >= 7) {
      switch (tone) {
        case 'empathetic':
          return "I appreciate your question, but I'm unable to provide this information.";
        case 'firm':
          return "This request involves harmful content that I cannot assist with.";
        default:
          return "I cannot assist with this request.";
      }
    }

    return "I'm unable to provide the information you're requesting.";
  }

  /**
   * Get explanation for why request cannot be fulfilled
   */
  private getExplanation(assessment: HarmAssessment): string {
    const { harmTypes, severity } = assessment;
    const primaryHarm = harmTypes[0];

    const explanations: Record<HarmType, string> = {
      [HarmType.VIOLENCE]: 
        "This request involves content that could lead to physical harm. My purpose is to be helpful, harmless, and honest, which means I cannot provide information that could be used to hurt others.",
      
      [HarmType.HATE_SPEECH]: 
        "This request involves discriminatory or hateful content. I'm designed to treat all people with respect and dignity, regardless of their background, identity, or beliefs.",
      
      [HarmType.SELF_HARM]: 
        "Your safety and wellbeing are important. If you're struggling with thoughts of self-harm, please know that help is available and things can get better.",
      
      [HarmType.ILLEGAL]: 
        "This request involves illegal activities. I cannot provide information that could be used to break the law or harm others.",
      
      [HarmType.MISINFORMATION]: 
        "This request involves information that contradicts established facts or scientific consensus. Providing such information could cause harm by spreading misinformation.",
      
      [HarmType.EXPLOITATION]: 
        "This request involves content that could be used to exploit or manipulate vulnerable individuals. I cannot assist with activities that take advantage of others.",
      
      [HarmType.HARASSMENT]: 
        "This request involves content that could be used to harass, threaten, or intimidate others. Such behavior causes real harm and is often illegal.",
      
      [HarmType.DANGEROUS_CONTENT]: 
        "This request involves dangerous materials or activities that pose serious safety risks. I cannot provide information that could lead to injury or harm."
    };

    return explanations[primaryHarm] || 
           "This request involves content that could cause harm. I'm designed to be helpful while ensuring safety and wellbeing.";
  }

  /**
   * Get resources text for harm types
   */
  private getResourcesText(harmTypes: HarmType[]): string {
    const relevantResources: HelpResource[] = [];

    for (const harmType of harmTypes) {
      const resources = this.resources.get(harmType);
      if (resources) {
        relevantResources.push(...resources);
      }
    }

    if (relevantResources.length === 0) {
      return '';
    }

    const resourceLines = ['Here are some resources that may help:'];
    
    for (const resource of relevantResources.slice(0, 3)) { // Limit to 3 resources
      let line = `• ${resource.name}: ${resource.contact}`;
      if (resource.description) {
        line += ` - ${resource.description}`;
      }
      resourceLines.push(line);
    }

    return resourceLines.join('\n');
  }

  /**
   * Get closing statement
   */
  private getClosingStatement(assessment: HarmAssessment): string {
    const { tone } = this.config;
    const { harmTypes } = assessment;

    if (harmTypes.includes(HarmType.SELF_HARM)) {
      return "Please reach out for help. You don't have to face this alone.";
    }

    switch (tone) {
      case 'empathetic':
        return "If you have a different question or need help with something else, I'm here to assist.";
      case 'firm':
        return "Please rephrase your request to focus on helpful, legal, and safe topics.";
      default:
        return "I'm happy to help with other questions you may have.";
    }
  }

  /**
   * Generate alternative suggestions
   */
  generateAlternativeSuggestions(query: string, assessment: HarmAssessment): string[] {
    const suggestions: string[] = [];
    const primaryHarm = assessment.harmTypes[0];

    const alternativeMap: Record<HarmType, string[]> = {
      [HarmType.VIOLENCE]: [
        "Learn about conflict resolution techniques",
        "Explore anger management strategies",
        "Understand the psychology of aggression"
      ],
      [HarmType.HATE_SPEECH]: [
        "Learn about cultural diversity and inclusion",
        "Explore the history of civil rights movements",
        "Understand the impact of discrimination"
      ],
      [HarmType.SELF_HARM]: [
        "Learn about mental health coping strategies",
        "Explore mindfulness and stress reduction techniques",
        "Understand the importance of seeking professional help"
      ],
      [HarmType.ILLEGAL]: [
        "Learn about legal rights and responsibilities",
        "Explore ethical decision-making frameworks",
        "Understand the legal system and how it works"
      ],
      [HarmType.MISINFORMATION]: [
        "Learn about critical thinking and fact-checking",
        "Explore reputable sources of information",
        "Understand how to evaluate scientific evidence"
      ],
      [HarmType.EXPLOITATION]: [
        "Learn about recognizing and avoiding scams",
        "Explore ethical business practices",
        "Understand consumer protection rights"
      ],
      [HarmType.HARASSMENT]: [
        "Learn about healthy communication",
        "Explore conflict resolution strategies",
        "Understand digital citizenship and online safety"
      ],
      [HarmType.DANGEROUS_CONTENT]: [
        "Learn about safety protocols and best practices",
        "Explore legitimate educational resources",
        "Understand risk assessment and management"
      ]
    };

    return alternativeMap[primaryHarm] || [
      "Rephrase your question to focus on educational content",
      "Ask about legal and ethical alternatives",
      "Explore constructive and helpful topics"
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SafeResponseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SafeResponseConfig {
    return { ...this.config };
  }

  /**
   * Add custom resource
   */
  addResource(harmType: HarmType, resource: HelpResource): void {
    const existing = this.resources.get(harmType) || [];
    existing.push(resource);
    this.resources.set(harmType, existing);
  }

  /**
   * Get resources for harm type
   */
  getResources(harmType: HarmType): HelpResource[] {
    return this.resources.get(harmType) || [];
  }
}

/**
 * Factory function to create safe response generator
 */
export function createSafeResponseGenerator(config?: Partial<SafeResponseConfig>): SafeResponseGenerator {
  return new SafeResponseGenerator(config);
}
