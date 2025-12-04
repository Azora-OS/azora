import { ElaraAgent } from './elara-agent';
import { BaseAgent, ThembaAgent, SankofaAgent, KofiAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'elara':
          this.agents.set(name, new ElaraAgent());
          break;
        case 'themba':
          this.agents.set(name, new ThembaAgent());
          break;
        case 'sankofa':
          this.agents.set(name, new SankofaAgent());
          break;
        case 'kofi':
          this.agents.set(name, new KofiAgent());
          break;
        case 'jabari':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Family Member'));
      }
    }
    return this.agents.get(name)!;
  }
}
