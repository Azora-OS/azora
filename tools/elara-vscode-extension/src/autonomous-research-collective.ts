
/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import * as vscode from 'vscode';
import { getPersonalities, sendMessage } from './api';

// The Orchestrator manages the AI collective
export class AutonomousResearchCollective {
  private personalities: any[] = [];

  constructor() {
  }

  public async initialize() {
    this.personalities = (await getPersonalities()) as any[];
  }

  public async assignTask(task: string) {
    vscode.window.showInformationMessage(`Task assigned to the collective: ${task}`);

    // 1. Decompose the task
    const subTasks = await this.decomposeTask(task);

    // 2. Delegate and execute sub-tasks
    if (subTasks && subTasks.length > 0) {
        for (const subTask of subTasks) {
            const agent = this.selectAgent(subTask.category);
            if (agent) {
                vscode.window.showInformationMessage(`Delegating '${subTask.description}' to ${agent.name}`);
                await sendMessage(agent.name.toLowerCase(), `Please perform the following task: ${subTask.description}`);
            }
        }
        vscode.window.showInformationMessage('All tasks delegated. The collective is at work.');
    } else {
        vscode.window.showErrorMessage('Elara failed to decompose the task. Please try again.');
    }
  }

  private async decomposeTask(task: string): Promise<{ description: string; category: string }[]> {
    const decompositionPrompt = `Decompose the following high-level task into a series of smaller, specific development sub-tasks. For each sub-task, categorize it into one of the following: 'planning', 'coding', 'testing', 'documentation', 'security'. The output must be a valid JSON array of objects, where each object has a "description" and "category" property. Do not add any extra text outside of the JSON array. Task: "${task}"`;

    const elara = this.personalities.find(p => p.name === 'Elara');
    if (!elara) return [];

    const response = await sendMessage(elara.name.toLowerCase(), decompositionPrompt);
    try {
      // The response from the AI might be a markdown-formatted JSON block.
      // We need to extract the raw JSON.
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse task decomposition:", response, e);
      vscode.window.showErrorMessage("Error parsing Elara's task decomposition. See console for details.");
      return [];
    }
  }

  private selectAgent(category: string): any {
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
