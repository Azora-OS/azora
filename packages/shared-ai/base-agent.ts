import OpenAI from 'openai';
import { 
  AzoraAgent, 
  AgenticContext, 
  Pattern, 
  PatternDetector, 
  System2Reasoning, 
  ConstitutionalValidator,
  ProposedAction,
  ActionChain,
  ReasoningChain,
  EthicalAnalysis
} from './agentic-core';
import { DIVINE_LAW_PRINCIPLES } from './constitutional-types';

// 🧠 The Base Agent Class that all Family Members will inherit from
export class BaseAgent implements AzoraAgent {
  name: string;
  role: string;
  private openai: OpenAI;
  private model: string = "gpt-4-turbo-preview"; // System 2 capable model

  constructor(name: string, role: string, apiKey?: string) {
    this.name = name;
    this.role = role;
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // For now, allowing in potential browser contexts
    });
  }

  // 1. Active Pattern Recognition
  async recognizePatterns(context: AgenticContext): Promise<Pattern[]> {
    // TODO: Connect to real monitoring data
    // This is where we would analyze user behavior, logs, etc.
    return []; 
  }

  // 2. System 2 Reasoning (The "Deep Think")
  async reason(pattern: Pattern, context: AgenticContext): Promise<ReasoningChain> {
    const prompt = `
      You are ${this.name}, the ${this.role} of Azora OS.
      
      PATTERN DETECTED:
      ${JSON.stringify(pattern, null, 2)}
      
      CONTEXT:
      ${JSON.stringify(context, null, 2)}
      
      Perform a System 2 "Chain of Thought" analysis:
      1. Deconstruct the problem.
      2. Consider multiple approaches.
      3. Evaluate against Ubuntu Philosophy ("I am because we are").
      4. Propose the most optimal action.
      
      Return a JSON object matching the ReasoningChain interface.
    `;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}') as ReasoningChain;
  }

  // 3. Constitutional Validation
  async validate(action: ProposedAction): Promise<EthicalAnalysis> {
    const principles = DIVINE_LAW_PRINCIPLES.map(p => `- ${p.name}: ${p.description}`).join('\n');
    
    const prompt = `
      CONSTITUTIONAL COURT REVIEW
      
      PROPOSED ACTION:
      ${JSON.stringify(action, null, 2)}
      
      PRINCIPLES:
      ${principles}
      
      Analyze this action. Does it violate any principles?
      If yes, REJECT it. If no, APPROVE it.
      
      Return a JSON object matching the EthicalAnalysis interface.
    `;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1 // Low temp for strict adherence
    });

    return JSON.parse(response.choices[0].message.content || '{}') as EthicalAnalysis;
  }

  // 4. Act (The Execution)
  async act(action: ProposedAction): Promise<any> {
    console.log(`[${this.name}] EXECUTING: ${action.type}`, action.payload);
    // In a real system, this would dispatch to an Event Bus or API Gateway
    return { success: true, txHash: 'mock_tx_hash' };
  }

  // 🌟 The "Awake" Loop
  async runAgenticLoop(context: AgenticContext): Promise<ActionChain> {
    console.log(`[${this.name}] waking up... context: ${context.sessionId}`);

    // 1. Scan for patterns
    const patterns = await this.recognizePatterns(context);
    
    const actionChain: ActionChain = {
      id: crypto.randomUUID(),
      actions: [],
      status: 'pending'
    };

    // If no patterns, nothing to do (unless reactive)
    if (patterns.length === 0 && !context.requiresDeepReasoning) {
      return actionChain;
    }

    // 2. Reason about the most critical pattern
    const primaryPattern = patterns[0] || { id: 'manual-trigger', type: 'opportunity', confidence: 1, indicators: ['user-request'], detectedAt: Date.now(), severity: 'medium' };
    
    const reasoning = await this.reason(primaryPattern, context);
    const proposedAction = reasoning.finalDecision;

    // 3. Validate Constitutionality
    const ethicalReview = await this.validate(proposedAction);
    actionChain.ethicalReview = ethicalReview;

    if (ethicalReview.approved) {
      // 4. Execute
      actionChain.status = 'executed';
      actionChain.actions.push(proposedAction);
      actionChain.executionResult = await this.act(proposedAction);
    } else {
      // VETOED
      actionChain.status = 'rejected';
      console.warn(`[${this.name}] Action VETOED by Constitution:`, ethicalReview.concerns);
    }

    return actionChain;
  }
}
