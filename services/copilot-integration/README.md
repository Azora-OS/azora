# Copilot Integration Service (Stub)

This service is a minimal stub that simulates interactions with GitHub Copilot for testing. Replace with real authentication and proxy to `vscode.commands.executeCommand` if running in an extension host.

Endpoints:
- POST /chat  { prompt } -> returns simulated reply

Run:
```
cd services/copilot-integration
npm install
npm run dev
```
