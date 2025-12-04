import { BaseAgent, SankofaAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'sankofa':
        case 'oracle':
          this.agents.set(name, new SankofaAgent());
          break;
        case 'jabari':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Seer'));
      }
    }
    return this.agents.get(name)!;
  }
}
