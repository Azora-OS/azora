"use strict";
/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
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
exports.AutonomousResearchCollective = void 0;
const vscode = __importStar(require("vscode"));
const api_1 = require("./api");
// The Orchestrator manages the AI collective
class AutonomousResearchCollective {
    constructor() {
        this.personalities = [];
    }
    async initialize() {
        this.personalities = (await (0, api_1.getPersonalities)());
    }
    async assignTask(task) {
        vscode.window.showInformationMessage(`Task assigned to the collective: ${task}`);
        // 1. Decompose the task
        const subTasks = await this.decomposeTask(task);
        // 2. Delegate and execute sub-tasks
        if (subTasks && subTasks.length > 0) {
            for (const subTask of subTasks) {
                const agent = this.selectAgent(subTask.category);
                if (agent) {
                    vscode.window.showInformationMessage(`Delegating '${subTask.description}' to ${agent.name}`);
                    await (0, api_1.sendMessage)(agent.name.toLowerCase(), `Please perform the following task: ${subTask.description}`);
                }
            }
            vscode.window.showInformationMessage('All tasks delegated. The collective is at work.');
        }
        else {
            vscode.window.showErrorMessage('Elara failed to decompose the task. Please try again.');
        }
    }
    async decomposeTask(task) {
        const decompositionPrompt = `Decompose the following high-level task into a series of smaller, specific development sub-tasks. For each sub-task, categorize it into one of the following: 'planning', 'coding', 'testing', 'documentation', 'security'. The output must be a valid JSON array of objects, where each object has a "description" and "category" property. Do not add any extra text outside of the JSON array. Task: "${task}"`;
        const elara = this.personalities.find(p => p.name === 'Elara');
        if (!elara)
            return [];
        const response = await (0, api_1.sendMessage)(elara.name.toLowerCase(), decompositionPrompt);
        try {
            // The response from the AI might be a markdown-formatted JSON block.
            // We need to extract the raw JSON.
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : response;
            return JSON.parse(jsonString);
        }
        catch (e) {
            console.error("Failed to parse task decomposition:", response, e);
            vscode.window.showErrorMessage("Error parsing Elara's task decomposition. See console for details.");
            return [];
        }
    }
    selectAgent(category) {
        // Simple agent selection logic. This can be enhanced.
        switch (category) {
            case 'planning':
                return this.personalities.find(p => p.name === 'Sankofa');
            case 'coding':
                return this.personalities.find(p => p.name === 'Themba');
            case 'testing':
                return this.personalities.find(p => p.name === 'Amara');
            case 'documentation':
                return this.personalities.find(p => p.name === 'Naledi');
            case 'security':
                return this.personalities.find(p => p.name === 'Jabari');
            default:
                return this.personalities.find(p => p.name === 'Elara');
        }
    }
}
exports.AutonomousResearchCollective = AutonomousResearchCollective;
//# sourceMappingURL=autonomous-research-collective.js.map