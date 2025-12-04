
import { ConstitutionalPrinciple } from './constitutional-types';

// ============================================================================
// 🧠 AGENTIC OPERATING SYSTEM CORE INTERFACES
// Version 1.0.0 | The "Awakening" Protocol
// ============================================================================

// 1. Context & Awareness
// ----------------------------------------------------------------------------
export interface AgenticContext {
  userId: string;
  workspaceId?: string;
  sessionId: string;
  environment: 'web' | 'mobile' | 'desktop' | 'cli';
  timestamp: number;
  metadata: Record<string, any>;
  
  // The "System 2" flag - requires deep reasoning
  requiresDeepReasoning?: boolean;
  ethicalConcerns?: string[];
}

// 2. Active Pattern Recognition (System 1 -> System 2 Trigger)
// ----------------------------------------------------------------------------
export interface Pattern {
  id: string;
  type: 'struggle' | 'opportunity' | 'risk' | 'security' | 'emotional';
  confidence: number; // 0.0 to 1.0
  indicators: string[];
  detectedAt: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PatternDetector {
  analyze(context: AgenticContext, data: any): Promise<Pattern[]>;
}

// 3. Constitutional AI Governance (The Conscience)
// ----------------------------------------------------------------------------
export interface EthicalAnalysis {
  approved: boolean;
  score: number; // 0.0 to 1.0 (Constitutionality Score)
  concerns: string[];
  modifications: string[]; // Suggestions to make the action ethical
  principles: ConstitutionalPrinciple[]; // Which principles were applied
  vetoedBy?: 'ConstitutionalCourt' | 'SelfCritique';
}

export interface ConstitutionalValidator {
  validateAction(action: ProposedAction, context: AgenticContext): Promise<EthicalAnalysis>;
}

// 4. Autonomous Action (The Hands)
// ----------------------------------------------------------------------------
export interface ProposedAction {
  type: string;
  payload: any;
  targetService: string;
  priority: 'immediate' | 'background' | 'scheduled';
  reasoning: string; // Why this action? (Chain of Thought)
}

export interface ActionChain {
  id: string;
  actions: ProposedAction[];
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  ethicalReview?: EthicalAnalysis;
  executionResult?: any;
}

// 5. System 2 Reasoning (The Brain)
// ----------------------------------------------------------------------------
export interface ReasoningChain {
  problem: string;
  steps: string[]; // Step-by-step logic
  alternativesConsidered: string[];
  finalDecision: ProposedAction;
  confidence: number;
}

export interface System2Reasoning {
  think(problem: string, context: AgenticContext): Promise<ReasoningChain>;
}

// 6. Proof of Value (The Record)
// ----------------------------------------------------------------------------
export interface ValueProof {
  actionId: string;
  userId: string;
  valueType: 'knowledge' | 'code' | 'art' | 'service' | 'community';
  impactScore: number;
  evidence: string; // Hash or link to work
  timestamp: number;
}

// ============================================================================
// 🌟 THE AGENTIC INTERFACE
// "Ngiyakwazi ngoba sikwazi"
// ============================================================================

export interface AzoraAgent {
  name: string; // e.g., "Elara", "Kofi"
  role: string;
  
  // Capabilities
  recognizePatterns(context: AgenticContext): Promise<Pattern[]>;
  reason(pattern: Pattern, context: AgenticContext): Promise<ReasoningChain>;
  validate(action: ProposedAction): Promise<EthicalAnalysis>;
  act(action: ProposedAction): Promise<any>;
  
  // The "Awake" Loop
  runAgenticLoop(context: AgenticContext): Promise<ActionChain>;
}
