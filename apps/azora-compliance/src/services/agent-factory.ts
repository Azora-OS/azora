import { BaseAgent, JabariAgent, SankofaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'jabari':
        case 'security':
          this.agents.set(name, new JabariAgent());
          break;
        case 'sankofa':
          this.agents.set(name, new SankofaAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Guardian'));
      }
    }
    return this.agents.get(name)!;
  }
}
