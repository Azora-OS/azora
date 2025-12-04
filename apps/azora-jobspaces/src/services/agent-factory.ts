import { BaseAgent, NalediAgent, ThembaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'naledi':
        case 'career':
          this.agents.set(name, new NalediAgent());
          break;
        case 'themba':
          this.agents.set(name, new ThembaAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Recruiter'));
      }
    }
    return this.agents.get(name)!;
  }
}
