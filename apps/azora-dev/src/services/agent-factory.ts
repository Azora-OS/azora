import { BaseAgent, NalediAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'naledi':
        case 'career':
          this.agents.set(name, new NalediAgent());
          break;
        case 'jabari':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Guide'));
      }
    }
    return this.agents.get(name)!;
  }
}
