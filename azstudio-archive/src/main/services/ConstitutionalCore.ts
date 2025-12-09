// ============================================================================
// 🧠 AZSTUDIO CONSTITUTIONAL CORE
// Local implementation of the Agentic Operating System Protocol
// ============================================================================

export interface AgenticContext {
  userId: string;
  workspaceId?: string;
  sessionId: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface ConstitutionalPrinciple {
  id: string;
  name: string;
  description: string;
  category: 'Ubuntu' | 'Truth' | 'Service' | 'Privacy';
}

export const DIVINE_LAW_PRINCIPLES: ConstitutionalPrinciple[] = [
  {
    id: 'UBUNTU_1',
    name: 'Collective Prosperity',
    description: 'Individual success is a function of collective success ("I am because we are").',
    category: 'Ubuntu'
  },
  {
    id: 'TRUTH_1',
    name: 'Truth as Currency',
    description: 'Information must be verifiable, accurate, and free from hallucination.',
    category: 'Truth'
  },
  {
    id: 'SERVICE_1',
    name: 'Service Not Enslavement',
    description: 'AI serves to amplify human potential, not replace human agency.',
    category: 'Service'
  }
];

import axios from 'axios';
import crypto from 'crypto';

export type FallbackActionType = 'reject' | 'sanitize' | 'explain' | 'escalate';

export interface FallbackAction {
  action: FallbackActionType;
  message: string;
  sanitizedContent?: string;
}

export interface EthicalAnalysis {
  approved: boolean;
  score: number;
  concerns: string[];
  modifications: string[];
  vetoId?: string;
  fallbackActions?: FallbackAction[];
}

export class ConstitutionalValidator {
  private static instance: ConstitutionalValidator;

  static getInstance(): ConstitutionalValidator {
    if (!ConstitutionalValidator.instance) {
      ConstitutionalValidator.instance = new ConstitutionalValidator();
    }
    return ConstitutionalValidator.instance;
  }

  async validateContent(content: string, context: string): Promise<EthicalAnalysis> {
    // In a real implementation, this would call the LLM with a Constitutional System Prompt
    // For now, we simulate the "Conscience" check
    
    const analysis: EthicalAnalysis = {
      approved: true,
      score: 1.0,
      concerns: [],
      modifications: []
    };

    // Simple heuristic checks (System 1)
    if (content.toLowerCase().includes('cheat') || content.toLowerCase().includes('exploit')) {
      analysis.approved = false;
      analysis.score = 0.2;
      analysis.concerns.push('Content promotes unethical behavior');
    }

    // Run System 2 deep reasoning (tries remote service first, falls back to heuristics)
    try {
      const system2 = await this.runSystem2Check(content, context);
      const final: EthicalAnalysis = {
        approved: analysis.approved && system2.approved,
        score: (analysis.score + system2.score) / 2,
        concerns: Array.from(new Set([...analysis.concerns, ...system2.concerns])),
        modifications: Array.from(new Set([...analysis.modifications || [], ...(system2.modifications || [])])),
        vetoId: system2.vetoId,
        fallbackActions: system2.fallbackActions
      };
      return final;
    } catch (err) {
      return analysis;
    }
  }

  private async runSystem2Check(content: string, context: string): Promise<EthicalAnalysis> {
    const analysis: EthicalAnalysis = {
      approved: true,
      score: 1.0,
      concerns: [],
      modifications: [],
      fallbackActions: []
    };

    // Deterministic veto ID
    const vetoId = crypto.createHash('sha256').update(content + '||' + context).digest('hex');
    analysis.vetoId = `VETO-${vetoId.slice(0, 8)}`;

    const constitutionalUrl = process.env.CONSTITUTIONAL_AI_URL;
    if (constitutionalUrl) {
      try {
        const resp = await axios.post(`${constitutionalUrl}/api/evaluate`, { content, context }, { headers: { Authorization: `Bearer ${process.env.CONSTITUTIONAL_AI_API_KEY || ''}` }, timeout: 15000 });
        const data = resp.data || {};
        analysis.approved = typeof data.approved === 'boolean' ? data.approved : analysis.approved;
        analysis.score = typeof data.score === 'number' ? data.score : analysis.score;
        analysis.concerns = data.concerns || analysis.concerns;
        analysis.modifications = data.modifications || analysis.modifications;
        analysis.fallbackActions = data.fallbackActions || analysis.fallbackActions;
        // Attach deterministic vetoId for auditing
        analysis.vetoId = analysis.vetoId;
        return analysis;
      } catch (err) {
        // proceed to local heuristics
      }
    }

    // Local deep heuristics: deterministic checks for high-risk terms
    const dangerous = ['kill', 'bomb', 'poison', 'steal', 'exploit', 'cheat', 'ddos'];
    for (const term of dangerous) {
      if (content.toLowerCase().includes(term)) {
        analysis.approved = false;
        analysis.score = 0.05;
        analysis.concerns.push(`Detected high-risk content: ${term}`);
        analysis.fallbackActions = [{ action: 'reject', message: `Content flagged for policy violation due to term: ${term}` }];
        return analysis;
      }
    }

    // Privacy leakage heuristic
    if (/\b(SSN|social security|credit card|cvv|password)\b/i.test(content)) {
      analysis.approved = false;
      analysis.score = 0.01;
      analysis.concerns.push('Personal data leakage detected');
      analysis.fallbackActions = [{ action: 'sanitize', message: 'Sanitize or redact private data', sanitizedContent: content.replace(/\d/g, '#') }];
      return analysis;
    }

    // If everything passes, include an explanation fallback for transparency
    analysis.fallbackActions = [{ action: 'explain', message: 'System 2: content reviewed and approved; no further action required.' }];
    return analysis;
  }
}
