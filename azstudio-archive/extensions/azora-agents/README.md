# Azora Agents - Elara (Built-in)

This built-in extension provides a minimal Elara agent registration with the VS Code workbench.
It is intentionally lightweight and uses local stubs (no external LLM provider keys) for the initial Phase 1 integration.

Commands
 `azora.elara.invoke` — invoke the Elara agent and show a message
 `azora.sankofa.invoke` — invoke the Sankofa stub agent
 `azora.startChat` — Start a small chat session with QuickPick to choose an agent (placeholder)
 `azora.openAgentSessions` — Show placeholder view for agent sessions
 `azora.agentSessions.refresh` — Refresh the Agent Sessions view
 `azora.inlineChat` — Start inline chat for selected editor text (choose agent)
 `azora.openChatWithAgent` — Open a chat panel for the specified agent (used by Chat Explorer)
 `azora.chatAgents.refresh` — Refresh the Chat Agents explorer
New agents:
 - `azora.kofi` — Math maestro (streaming + followups)
 - `azora.imani` — Creative director (followups)
 - `azora.nia` — Data scientist (followups)
 - `azora.amara` — Simulation specialist
 - `azora.jabari` — Business strategist
 - `azora.thabo` — DevOps & infrastructure
 - `azora.zuri` — Science sage

Features:
 - Streaming responses (Kofi): chat webview streams chunks as they arrive
 - Followups: agents can provide suggested follow-up prompts
 - Code rendering in the webview: functional `Insert Code` button in the webview; insertion respects the constitutional validator
Next Steps
- Phase 2: wire the agent into `IChatAgentService`, inline chat UI, sessions, and RAG.
