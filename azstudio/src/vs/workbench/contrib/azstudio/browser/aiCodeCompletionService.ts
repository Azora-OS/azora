/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IMultiAgentService } from './multiAgentService.js';
import { IAzStudioRulesEngine } from './rules/azStudioRules.js';

export const IAICodeCompletionService = createDecorator<IAICodeCompletionService>('aiCodeCompletionService');

export interface CompletionContext {
    triggerKind: number;
    triggerCharacter?: string;
}

export interface CompletionItem {
    label: string;
    insertText: string;
    detail?: string;
    documentation?: string;
    kind?: number;
}

export interface IAICodeCompletionService {
    readonly _serviceBrand: undefined;

    getCompletions(
        document: string,
        position: { lineNumber: number; column: number },
        context: CompletionContext,
        languageId: string
    ): Promise<CompletionItem[]>;
}

export class AICodeCompletionService extends Disposable implements IAICodeCompletionService {
    readonly _serviceBrand: undefined;

    constructor(
        @IMultiAgentService private readonly multiAgentService: IMultiAgentService,
        @IAzStudioRulesEngine private readonly rulesEngine: IAzStudioRulesEngine
    ) {
        super();
    }

    async getCompletions(
        document: string,
        position: { lineNumber: number; column: number },
        context: CompletionContext,
        languageId: string
    ): Promise<CompletionItem[]> {
        // 1. Get project context from Rules Engine
        // const projectContext = await this.rulesEngine.validateContext(...); // simplified for now

        // 2. Prepare prompt for AI
        const prompt = `Provide code completion for ${languageId} at line ${position.lineNumber}, column ${position.column}. Code:\n${this.getContextWindow(document, position)}`;

        // 3. Apply rules to prompt
        const governedPrompt = await this.rulesEngine.applyRules(prompt);

        // 4. Request completion from Multi-Agent Service (using 'azora-code' agent)
        // In a real implementation, this would call a specific method for low-latency completion
        // For now, we'll simulate a request or use a specialized method if it existed.
        // Since MultiAgentService is high-level, we might need a lower-level AI service call here.
        // For this implementation, we will mock the response based on the "plan".

        return this.mockCompletions(languageId);
    }

    private getContextWindow(document: string, position: { lineNumber: number; column: number }): string {
        // Simple implementation to get some context around the cursor
        const lines = document.split('\n');
        const start = Math.max(0, position.lineNumber - 10);
        const end = Math.min(lines.length, position.lineNumber + 5);
        return lines.slice(start, end).join('\n');
    }

    private mockCompletions(languageId: string): CompletionItem[] {
        if (languageId === 'typescript' || languageId === 'javascript') {
            return [
                {
                    label: 'console.log',
                    insertText: 'console.log($1);',
                    detail: 'Log to console',
                    documentation: 'Prints to the console',
                    kind: 1 // Method
                },
                {
                    label: 'function',
                    insertText: 'function ${1:name}(${2:params}) {\n\t$0\n}',
                    detail: 'Function declaration',
                    documentation: 'Creates a new function',
                    kind: 14 // Keyword
                }
            ];
        }
        return [];
    }
}
