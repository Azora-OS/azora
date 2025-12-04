import { BaseAgent, SankofaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'sankofa':
        case 'wisdom':
          this.agents.set(name, new SankofaAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Librarian'));
      }
    }
    return this.agents.get(name)!;
  }
}
