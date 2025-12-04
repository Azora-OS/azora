import { KofiMintAgent } from './kofi-agent';
import { BaseAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'kofi':
        case 'treasurer':
          this.agents.set(name, new KofiMintAgent());
          break;
        case 'jabari':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Assistant'));
      }
    }
    return this.agents.get(name)!;
  }
}
