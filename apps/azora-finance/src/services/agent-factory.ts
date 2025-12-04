import { BaseAgent, KofiAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'kofi':
          this.agents.set(name, new KofiAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Analyst'));
      }
    }
    return this.agents.get(name)!;
  }
}
