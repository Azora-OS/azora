import { BaseAgent, ElaraAgent, SankofaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'elara':
        case 'teacher':
          this.agents.set(name, new ElaraAgent());
          break;
        case 'sankofa':
          this.agents.set(name, new SankofaAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Mentor'));
      }
    }
    return this.agents.get(name)!;
  }
}
