import { BaseAgent, ThembaAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'themba':
        case 'cloud':
          this.agents.set(name, new ThembaAgent());
          break;
        case 'jabari':
        case 'security':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'SysAdmin'));
      }
    }
    return this.agents.get(name)!;
  }
}
