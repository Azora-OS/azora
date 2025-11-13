
import * as vscode from 'vscode';
import { ChatViewProvider } from './chatViewProvider';
import { FamilyTreeProvider } from './familyTreeProvider';
import { AutonomousResearchCollective } from './autonomous-research-collective';
import { ServiceManager } from './service-manager';
import { KnowledgeConnector } from './knowledge-connector';

let serviceManager: ServiceManager;
let knowledgeConnector: KnowledgeConnector;

export async function activate(context: vscode.ExtensionContext) {
  // Initialize services
  serviceManager = new ServiceManager();
  knowledgeConnector = new KnowledgeConnector();
  
  // Start all services
  try {
    await serviceManager.startAll();
    vscode.window.showInformationMessage('🌟 Azora Services Active - Ubuntu Philosophy Engaged');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to start services: ${error.message}`);
  }

  const chatViewProvider = new ChatViewProvider(context.extensionUri, knowledgeConnector);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider)
  );

  const familyTreeProvider = new FamilyTreeProvider();
  vscode.window.registerTreeDataProvider('azora.familyTree', familyTreeProvider);

  vscode.commands.registerCommand('azora.refreshFamilyTree', () => {
    familyTreeProvider.refresh();
  });

  // Initialize the Autonomous Research Collective
  const collective = new AutonomousResearchCollective();
  await collective.initialize();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('azora.autonomousDevelopment', async () => {
      const task = await vscode.window.showInputBox({ 
        prompt: 'What development task would you like to assign to the AI collective?' 
      });
      if (task) {
        collective.assignTask(task);
      }
    }),
    vscode.commands.registerCommand('azora.queryKnowledge', async () => {
      const question = await vscode.window.showInputBox({ 
        prompt: 'Ask the Knowledge Ocean anything...' 
      });
      if (question) {
        const answer = await knowledgeConnector.queryKnowledge(question);
        vscode.window.showInformationMessage(answer, { modal: true });
      }
    }),
    vscode.commands.registerCommand('azora.showStats', async () => {
      const stats = await knowledgeConnector.getStats();
      if (stats) {
        vscode.window.showInformationMessage(
          `📚 Knowledge Nodes: ${stats.totalNodes} | Categories: ${Object.keys(stats.categories).length}`,
          { modal: false }
        );
      }
    })
  );

  context.subscriptions.push(serviceManager);
}

export function deactivate() {
  if (serviceManager) {
    serviceManager.dispose();
  }
}
