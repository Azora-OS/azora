import { getAzoraAgentRegistry } from '../../services/azora/agentRegistryService';
import { AzoraAgentMetadata } from '../../services/azora/common';

// Contribution that registers the Azora agents with the UI and provides commands
export class AzoraAgentsContribution {
  constructor() {
    // Workbench-level contribution placeholder. The real extension (extensions/azora-agents)
    // and the Azora extension host will register commands and views that interact with
    // the agent registry. This contribution currently acts as a placeholder to ensure
    // module loading triggers the service registration side effects.

    // Register context menu or other contributions if relevant
    // For now, we provide a minimal command-based integration
  }

  private listAgents() {
    const registry = getAzoraAgentRegistry();
    const agents = registry.listAgents();
    // For now, just show a simple log (UI should use a view in a real implementation)
    console.log('Azora Agents:', agents.map(a => `${a.id} (${a.name})`).join(', '));
  }

  private async startChat() {
    // Basic prompt to invoke a selected agent; in a full UI, we'd create a session view
    const registry = getAzoraAgentRegistry();
    const agents = registry.listAgents();
    if (agents.length === 0) {
      console.log('[Azora] No agents available');
      return;
    }
    const agent = agents[0];
    const result = await registry.invokeAgent(agent.id, 'Hello from startChat');
    console.log(`[Azora] ${agent.name} responded:`, result.content);
  }

  private openAgentSessions() {
    // Minimal placeholder: log active sessions (TODO: real UI view)
    console.log('[Azora] Opening agent sessions view (placeholder)');
  }
}

// Register the contribution to be constructed on startup - simple side effect for now
new AzoraAgentsContribution();
