import { BaseAgent, KofiAgent, NalediAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'kofi':
          this.agents.set(name, new KofiAgent());
          break;
        case 'naledi':
          this.agents.set(name, new NalediAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Consultant'));
      }
    }
    return this.agents.get(name)!;
  }
}
