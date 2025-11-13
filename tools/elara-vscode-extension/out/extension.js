"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const chatViewProvider_1 = require("./chatViewProvider");
const familyTreeProvider_1 = require("./familyTreeProvider");
const autonomous_research_collective_1 = require("./autonomous-research-collective");
const service_manager_1 = require("./service-manager");
const knowledge_connector_1 = require("./knowledge-connector");
let serviceManager;
let knowledgeConnector;
async function activate(context) {
    // Initialize services
    serviceManager = new service_manager_1.ServiceManager();
    knowledgeConnector = new knowledge_connector_1.KnowledgeConnector();
    // Start all services
    try {
        await serviceManager.startAll();
        vscode.window.showInformationMessage('🌟 Azora Services Active - Ubuntu Philosophy Engaged');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to start services: ${error.message}`);
    }
    const chatViewProvider = new chatViewProvider_1.ChatViewProvider(context.extensionUri, knowledgeConnector);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatViewProvider_1.ChatViewProvider.viewType, chatViewProvider));
    const familyTreeProvider = new familyTreeProvider_1.FamilyTreeProvider();
    vscode.window.registerTreeDataProvider('azora.familyTree', familyTreeProvider);
    vscode.commands.registerCommand('azora.refreshFamilyTree', () => {
        familyTreeProvider.refresh();
    });
    // Initialize the Autonomous Research Collective
    const collective = new autonomous_research_collective_1.AutonomousResearchCollective();
    await collective.initialize();
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('azora.autonomousDevelopment', async () => {
        const task = await vscode.window.showInputBox({
            prompt: 'What development task would you like to assign to the AI collective?'
        });
        if (task) {
            collective.assignTask(task);
        }
    }), vscode.commands.registerCommand('azora.queryKnowledge', async () => {
        const question = await vscode.window.showInputBox({
            prompt: 'Ask the Knowledge Ocean anything...'
        });
        if (question) {
            const answer = await knowledgeConnector.queryKnowledge(question);
            vscode.window.showInformationMessage(answer, { modal: true });
        }
    }), vscode.commands.registerCommand('azora.showStats', async () => {
        const stats = await knowledgeConnector.getStats();
        if (stats) {
            vscode.window.showInformationMessage(`📚 Knowledge Nodes: ${stats.totalNodes} | Categories: ${Object.keys(stats.categories).length}`, { modal: false });
        }
    }));
    context.subscriptions.push(serviceManager);
}
function deactivate() {
    if (serviceManager) {
        serviceManager.dispose();
    }
}
//# sourceMappingURL=extension.js.map