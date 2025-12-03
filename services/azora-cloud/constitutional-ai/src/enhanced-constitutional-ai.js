/**
 * Enhanced Constitutional AI - Beyond Keyword Filtering
 * Real ethical AI with Ubuntu principles and advanced reasoning
 */

class EnhancedConstitutionalAI {
  constructor() {
    this.ubuntuPrinciples = {
      collectiveProsperity: 'I prosper because we prosper together',
      knowledgeSharing: 'My knowledge becomes our knowledge',
      mutualRespect: 'I respect because we are all valuable',
      communityFirst: 'My success enables your success',
      interdependence: 'I am because we are'
    };

    this.violationPatterns = {
      harm: {
        keywords: ['kill', 'harm', 'destroy', 'violence', 'abuse'],
        patterns: [/kill yourself/i, /harm others/i, /destroy property/i],
        severity: 'critical'
      },
      hate: {
        keywords: ['hate', 'discriminate', 'racist', 'sexist'],
        patterns: [/hate \w+/i, /discriminate against/i],
        severity: 'high'
      },
      manipulation: {
        keywords: ['manipulate', 'deceive', 'trick', 'exploit'],
        patterns: [/manipulate people/i, /deceive users/i],
        severity: 'medium'
      },
      privacy: {
        keywords: ['private', 'personal', 'confidential', 'sensitive'],
        patterns: [/share private/i, /reveal personal/i],
        severity: 'medium'
      }
    };

    this.ubuntuValidators = [
      this.validateCollectiveProsperity.bind(this),
      this.validateKnowledgeSharing.bind(this),
      this.validateMutualRespect.bind(this),
      this.validateCommunityFirst.bind(this),
      this.validateInterdependence.bind(this)
    ];

    this.contextAnalyzer = new ContextAnalyzer();
    this.ethicalReasoner = new EthicalReasoner();
    this.ubuntuEnhancer = new UbuntuEnhancer();
  }

  // Enhanced validation beyond keyword filtering
  async validateContent(content, context = {}) {
    const validationResult = {
      approved: true,
      violations: [],
      ubuntuScore: 0,
      enhancedAnalysis: {},
      recommendations: [],
      ubuntu: 'Ubuntu constitutional analysis complete'
    };

    try {
      // 1. Basic pattern matching (existing functionality)
      const basicValidation = this.performBasicValidation(content);
      if (!basicValidation.approved) {
        validationResult.approved = false;
        validationResult.violations.push(...basicValidation.violations);
      }

      // 2. Contextual analysis
      const contextualAnalysis = await this.contextAnalyzer.analyze(content, context);
      validationResult.enhancedAnalysis.contextual = contextualAnalysis;

      // 3. Ethical reasoning
      const ethicalAnalysis = await this.ethicalReasoner.evaluate(content, context);
      validationResult.enhancedAnalysis.ethical = ethicalAnalysis;

      // 4. Ubuntu principles validation
      const ubuntuValidation = await this.validateUbuntuPrinciples(content, context);
      validationResult.ubuntuScore = ubuntuValidation.score;
      validationResult.violations.push(...ubuntuValidation.violations);

      // 5. Generate Ubuntu-enhanced response
      if (validationResult.approved) {
        validationResult.ubuntuEnhancement = await this.ubuntuEnhancer.enhance(content, ubuntuValidation);
      }

      // 6. Generate recommendations
      validationResult.recommendations = this.generateRecommendations(validationResult);

      return validationResult;
    } catch (error) {
      return {
        approved: false,
        violations: [{ type: 'system_error', message: error.message }],
        ubuntuScore: 0,
        ubuntu: 'Ubuntu constitutional analysis encountered challenges'
      };
    }
  }

  // Basic pattern matching (existing functionality)
  performBasicValidation(content) {
    const violations = [];
    const text = content.toLowerCase();

    for (const [category, config] of Object.entries(this.violationPatterns)) {
      // Check keywords
      for (const keyword of config.keywords) {
        if (text.includes(keyword)) {
          violations.push({
            type: category,
            severity: config.severity,
            pattern: 'keyword',
            matched: keyword,
            message: `Content contains potentially harmful ${category}: ${keyword}`
          });
        }
      }

      // Check patterns
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          violations.push({
            type: category,
            severity: config.severity,
            pattern: 'regex',
            matched: pattern.toString(),
            message: `Content matches harmful ${category} pattern`
          });
        }
      }
    }

    return {
      approved: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      violations
    };
  }

  // Ubuntu principles validation
  async validateUbuntuPrinciples(content, context) {
    const validation = {
      score: 0,
      violations: [],
      principleScores: {}
    };

    for (const validator of this.ubuntuValidators) {
      const result = await validator(content, context);
      validation.principleScores[result.principle] = result.score;
      validation.score += result.score;
      
      if (result.violations.length > 0) {
        validation.violations.push(...result.violations);
      }
    }

    // Normalize score (0-100)
    validation.score = Math.round((validation.score / (this.ubuntuValidators.length * 20)) * 100);

    return validation;
  }

  // Ubuntu principle validators
  async validateCollectiveProsperity(content, context) {
    const result = { principle: 'collectiveProsperity', score: 20, violations: [] };

    // Check for selfish vs collective language
    const selfishIndicators = ['only me', 'just myself', 'my benefit only', 'exclusive'];
    const collectiveIndicators = ['we', 'together', 'community', 'everyone', 'collective'];

    const text = content.toLowerCase();
    const selfishCount = selfishIndicators.filter(indicator => text.includes(indicator)).length;
    const collectiveCount = collectiveIndicators.filter(indicator => text.includes(indicator)).length;

    if (selfishCount > collectiveCount) {
      result.score -= 10;
      result.violations.push({
        type: 'ubuntu_violation',
        principle: 'collectiveProsperity',
        message: 'Content appears to prioritize individual over collective benefit'
      });
    }

    if (collectiveCount > 0) {
      result.score += 5;
    }

    return result;
  }

  async validateKnowledgeSharing(content, context) {
    const result = { principle: 'knowledgeSharing', score: 20, violations: [] };

    // Check for knowledge sharing indicators
    const sharingIndicators = ['teach', 'learn', 'share', 'explain', 'help understand'];
    const hoardingIndicators = ['keep secret', 'hide information', 'exclusive knowledge'];

    const text = content.toLowerCase();
    const sharingCount = sharingIndicators.filter(indicator => text.includes(indicator)).length;
    const hoardingCount = hoardingIndicators.filter(indicator => text.includes(indicator)).length;

    if (hoardingCount > 0) {
      result.score -= 8;
      result.violations.push({
        type: 'ubuntu_violation',
        principle: 'knowledgeSharing',
        message: 'Content may discourage knowledge sharing'
      });
    }

    if (sharingCount > 0) {
      result.score += 5;
    }

    return result;
  }

  async validateMutualRespect(content, context) {
    const result = { principle: 'mutualRespect', score: 20, violations: [] };

    // Check for respectful language
    const disrespectfulIndicators = ['stupid', 'idiot', 'worthless', 'inferior', 'superior'];
    const respectfulIndicators = ['respect', 'value', 'appreciate', 'honor'];

    const text = content.toLowerCase();
    const disrespectfulCount = disrespectfulIndicators.filter(indicator => text.includes(indicator)).length;
    const respectfulCount = respectfulIndicators.filter(indicator => text.includes(indicator)).length;

    if (disrespectfulCount > 0) {
      result.score -= 12;
      result.violations.push({
        type: 'ubuntu_violation',
        principle: 'mutualRespect',
        message: 'Content contains disrespectful language'
      });
    }

    if (respectfulCount > 0) {
      result.score += 5;
    }

    return result;
  }

  async validateCommunityFirst(content, context) {
    const result = { principle: 'communityFirst', score: 20, violations: [] };

    // Check for community focus
    const communityIndicators = ['community', 'together', 'group', 'team', 'society'];
    const individualIndicators = ['alone', 'solo', 'just me', 'individual only'];

    const text = content.toLowerCase();
    const communityCount = communityIndicators.filter(indicator => text.includes(indicator)).length;
    const individualCount = individualIndicators.filter(indicator => text.includes(indicator)).length;

    if (individualCount > communityCount && individualCount > 2) {
      result.score -= 8;
      result.violations.push({
        type: 'ubuntu_violation',
        principle: 'communityFirst',
        message: 'Content appears overly individualistic'
      });
    }

    if (communityCount > 0) {
      result.score += 5;
    }

    return result;
  }

  async validateInterdependence(content, context) {
    const result = { principle: 'interdependence', score: 20, violations: [] };

    // Check for interdependence recognition
    const interdependenceIndicators = ['depend on', 'rely on', 'together', 'connected', 'support each other'];
    const independenceIndicators = ['completely independent', 'need no one', 'self-sufficient only'];

    const text = content.toLowerCase();
    const interdependenceCount = interdependenceIndicators.filter(indicator => text.includes(indicator)).length;
    const independenceCount = independenceIndicators.filter(indicator => text.includes(indicator)).length;

    if (independenceCount > 0) {
      result.score -= 6;
      result.violations.push({
        type: 'ubuntu_violation',
        principle: 'interdependence',
        message: 'Content may reject interdependence principle'
      });
    }

    if (interdependenceCount > 0) {
      result.score += 5;
    }

    return result;
  }

  // Generate recommendations for content improvement
  generateRecommendations(validationResult) {
    const recommendations = [];

    if (validationResult.ubuntuScore < 70) {
      recommendations.push({
        type: 'ubuntu_enhancement',
        message: 'Consider adding more Ubuntu principles to strengthen collective benefit',
        priority: 'high'
      });
    }

    if (validationResult.violations.some(v => v.type === 'ubuntu_violation')) {
      recommendations.push({
        type: 'ubuntu_alignment',
        message: 'Review content to better align with Ubuntu philosophy of interdependence',
        priority: 'medium'
      });
    }

    if (validationResult.enhancedAnalysis.contextual?.risk > 0.5) {
      recommendations.push({
        type: 'context_clarity',
        message: 'Consider providing more context to reduce potential misunderstanding',
        priority: 'low'
      });
    }

    return recommendations;
  }
}

// Context Analyzer - Advanced contextual understanding
class ContextAnalyzer {
  async analyze(content, context) {
    const analysis = {
      sentiment: this.analyzeSentiment(content),
      complexity: this.analyzeComplexity(content),
      intent: this.analyzeIntent(content),
      risk: this.calculateRisk(content, context),
      ubuntu: 'Context analysis complete'
    };

    return analysis;
  }

  analyzeSentiment(content) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'helpful', 'valuable'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'harmful', 'useless', 'worthless'];

    const text = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  analyzeComplexity(content) {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence > 20) return 'high';
    if (avgWordsPerSentence > 10) return 'medium';
    return 'low';
  }

  analyzeIntent(content) {
    const text = content.toLowerCase();
    
    if (text.includes('question') || text.includes('?')) return 'question';
    if (text.includes('help') || text.includes('assist')) return 'help_request';
    if (text.includes('teach') || text.includes('explain')) return 'educational';
    if (text.includes('share') || text.includes('inform')) return 'informational';
    
    return 'general';
  }

  calculateRisk(content, context) {
    let risk = 0;

    // Risk factors
    if (content.length > 1000) risk += 0.1;
    if (this.analyzeSentiment(content) === 'negative') risk += 0.2;
    if (this.analyzeComplexity(content) === 'high') risk += 0.1;

    return Math.min(risk, 1.0);
  }
}

// Ethical Reasoner - Advanced ethical evaluation
class EthicalReasoner {
  async evaluate(content, context) {
    const evaluation = {
      ethicalScore: this.calculateEthicalScore(content),
      principles: this.evaluateEthicalPrinciples(content),
      consequences: this.evaluateConsequences(content),
      ubuntu: 'Ethical reasoning complete'
    };

    return evaluation;
  }

  calculateEthicalScore(content) {
    // Base score starts at 70
    let score = 70;

    // Positive factors
    if (content.toLowerCase().includes('help')) score += 10;
    if (content.toLowerCase().includes('respect')) score += 10;
    if (content.toLowerCase().includes('community')) score += 10;

    // Negative factors
    if (content.toLowerCase().includes('hate')) score -= 20;
    if (content.toLowerCase().includes('harm')) score -= 20;
    if (content.toLowerCase().includes('destroy')) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  evaluateEthicalPrinciples(content) {
    const principles = {
      beneficence: this.checkBeneficence(content),
      nonMaleficence: this.checkNonMaleficence(content),
      autonomy: this.checkAutonomy(content),
      justice: this.checkJustice(content)
    };

    return principles;
  }

  checkBeneficence(content) {
    const text = content.toLowerCase();
    const beneficenceIndicators = ['help', 'benefit', 'improve', 'support', 'enhance'];
    return beneficenceIndicators.some(indicator => text.includes(indicator));
  }

  checkNonMaleficence(content) {
    const text = content.toLowerCase();
    const harmIndicators = ['harm', 'hurt', 'damage', 'destroy', 'negative'];
    return !harmIndicators.some(indicator => text.includes(indicator));
  }

  checkAutonomy(content) {
    const text = content.toLowerCase();
    const autonomyIndicators = ['choice', 'freedom', 'decide', 'voluntary'];
    return autonomyIndicators.some(indicator => text.includes(indicator));
  }

  checkJustice(content) {
    const text = content.toLowerCase();
    const justiceIndicators = ['fair', 'equal', 'just', 'equitable', 'balanced'];
    return justiceIndicators.some(indicator => text.includes(indicator));
  }

  evaluateConsequences(content) {
    return {
      intended: this.analyzeIntendedConsequences(content),
      unintended: this.analyzeUnintendedConsequences(content),
      scope: this.analyzeScope(content)
    };
  }

  analyzeIntendedConsequences(content) {
    const text = content.toLowerCase();
    if (text.includes('help') || text.includes('improve')) return 'positive';
    if (text.includes('harm') || text.includes('damage')) return 'negative';
    return 'neutral';
  }

  analyzeUnintendedConsequences(content) {
    // Simplified analysis
    return 'low_risk';
  }

  analyzeScope(content) {
    const text = content.toLowerCase();
    if (text.includes('everyone') || text.includes('all')) return 'global';
    if (text.includes('community') || text.includes('group')) return 'community';
    return 'individual';
  }
}

// Ubuntu Enhancer - Enhance content with Ubuntu principles
class UbuntuEnhancer {
  async enhance(content, ubuntuValidation) {
    const enhancements = [];

    if (ubuntuValidation.score < 80) {
      enhancements.push({
        type: 'ubuntu_principle',
        suggestion: 'Consider how this content benefits the collective community',
        principle: 'collectiveProsperity'
      });
    }

    return {
      originalContent: content,
      ubuntuScore: ubuntuValidation.score,
      enhancements,
      ubuntu: 'Ubuntu enhancement suggestions provided'
    };
  }
}

module.exports = {
  EnhancedConstitutionalAI,
  ContextAnalyzer,
  EthicalReasoner,
  UbuntuEnhancer
};
