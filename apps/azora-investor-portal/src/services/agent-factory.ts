import { BaseAgent, KofiAgent, SankofaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'kofi':
        case 'finance':
          this.agents.set(name, new KofiAgent());
          break;
        case 'sankofa':
        case 'diligence':
          this.agents.set(name, new SankofaAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Advisor'));
      }
    }
    return this.agents.get(name)!;
  }
}
