import { BaseAgent, SankofaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'sankofa':
          this.agents.set(name, new SankofaAgent());
          break;
        case 'zuri':
          this.agents.set(name, new BaseAgent('Zuri', 'Science Sage'));
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Researcher'));
      }
    }
    return this.agents.get(name)!;
  }
}
