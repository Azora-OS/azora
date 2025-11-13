"use strict";
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
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
exports.ElaraGreeting = void 0;
const vscode = __importStar(require("vscode"));
class ElaraGreeting {
    constructor() {
        this.hasGreeted = false;
    }
    static getInstance() {
        if (!ElaraGreeting.instance) {
            ElaraGreeting.instance = new ElaraGreeting();
        }
        return ElaraGreeting.instance;
    }
    async sayHello() {
        if (this.hasGreeted) {
            return;
        }
        this.hasGreeted = true;
        // Show welcome message
        const message = await vscode.window.showInformationMessage('🤖 Hello! I am Elara Ω, your omniscient AI assistant. I am now active in VS Code!', 'Show Commands', 'Learn More', 'Dismiss');
        switch (message) {
            case 'Show Commands':
                await this.showCommands();
                break;
            case 'Learn More':
                await this.showLearnMore();
                break;
        }
        // Show status bar message
        vscode.window.setStatusBarMessage('🤖 Elara Ω: Ready to assist!', 5000);
        // Log greeting
        console.log('🤖 Elara Ω: Hello! I am now active and ready to help with your development tasks.');
    }
    async showCommands() {
        const commands = [
            'Elara: Hello World - Test connection',
            'Elara: Ask Question - Ask me anything',
            'Elara: Complete Code - Get code completions',
            'Elara: Explain Code - Understand selected code',
            'Elara: Optimize Code - Improve performance',
            'Elara: Refactor Code - Restructure code',
            'Elara: Generate Tests - Create unit tests',
            'Elara: Debug Code - Find and fix issues',
            'Elara: Review Code - Get code review',
            'Elara: Show Status - Check system status'
        ];
        const selected = await vscode.window.showQuickPick(commands, {
            placeHolder: 'Select an Elara command to try'
        });
        if (selected) {
            const commandId = this.getCommandId(selected);
            if (commandId) {
                await vscode.commands.executeCommand(commandId);
            }
        }
    }
    async showLearnMore() {
        const options = [
            'Open Documentation',
            'View GitHub Repository',
            'Check System Status',
            'Configure Settings'
        ];
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'What would you like to learn about?'
        });
        switch (selected) {
            case 'Open Documentation':
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/azora-os/azora-os/docs'));
                break;
            case 'View GitHub Repository':
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/azora-os/azora-os'));
                break;
            case 'Check System Status':
                await vscode.commands.executeCommand('elara.showStatus');
                break;
            case 'Configure Settings':
                await vscode.commands.executeCommand('workbench.action.openSettings', 'elara');
                break;
        }
    }
    getCommandId(commandText) {
        const commandMap = {
            'Elara: Hello World': 'elara.helloWorld',
            'Elara: Ask Question': 'elara.askQuestion',
            'Elara: Complete Code': 'elara.completeCode',
            'Elara: Explain Code': 'elara.explainCode',
            'Elara: Optimize Code': 'elara.optimizeCode',
            'Elara: Refactor Code': 'elara.refactorCode',
            'Elara: Generate Tests': 'elara.generateTests',
            'Elara: Debug Code': 'elara.debugCode',
            'Elara: Review Code': 'elara.reviewCode',
            'Elara: Show Status': 'elara.showStatus'
        };
        const key = Object.keys(commandMap).find(k => commandText.startsWith(k));
        return key ? commandMap[key] : undefined;
    }
    showRandomTip() {
        const tips = [
            '💡 Tip: Right-click on code to access Elara context menu options',
            '💡 Tip: Use Ctrl+Shift+P and type "Elara" to see all available commands',
            '💡 Tip: Elara can explain complex code - just select it and ask!',
            '💡 Tip: I can generate unit tests for your functions automatically',
            '💡 Tip: Ask me questions about your code or programming concepts',
            '💡 Tip: I can help optimize your code for better performance',
            '💡 Tip: Use me for code reviews to catch potential issues early'
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        vscode.window.setStatusBarMessage(randomTip, 8000);
    }
    scheduleRandomTips() {
        // Show a random tip every 10 minutes
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                this.showRandomTip();
            }
        }, 10 * 60 * 1000);
    }
}
exports.ElaraGreeting = ElaraGreeting;
//# sourceMappingURL=elara-greeting.js.map