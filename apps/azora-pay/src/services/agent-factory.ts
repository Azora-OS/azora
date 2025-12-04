import { BaseAgent, KofiAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'kofi':
        case 'finance':
          this.agents.set(name, new KofiAgent());
          break;
        case 'jabari':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Banker'));
      }
    }
    return this.agents.get(name)!;
  }
}
