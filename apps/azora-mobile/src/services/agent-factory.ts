import { BaseAgent, ElaraAgent, ThembaAgent } from '@azora/shared-ai';

// Mobile needs a lighter weight factory, maybe focusing on user assistance
export class MobileAgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      // Mobile app has direct access to "Mom" (Elara) and "Hype Man" (Themba)
      switch (name.toLowerCase()) {
        case 'elara':
          // In a real mobile app, this might connect via API rather than instantiating directly
          // but for shared logic, we instantiate the class
          this.agents.set(name, new BaseAgent('Elara', 'Teacher')); 
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Assistant'));
      }
    }
    return this.agents.get(name)!;
  }
}
