import { BaseAgent, ThembaAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'themba':
        case 'builder':
          this.agents.set(name, new ThembaAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Designer'));
      }
    }
    return this.agents.get(name)!;
  }
}
