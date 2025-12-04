import { BaseAgent, ElaraAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'elara':
        case 'teacher':
          // On mobile, we might want a "Lite" version or direct API proxy
          // For now, we instantiate the shared agent
          this.agents.set(name, new ElaraAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Tutor'));
      }
    }
    return this.agents.get(name)!;
  }
}
