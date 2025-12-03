/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IAICodeCompletionService } from './aiCodeCompletionService.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { Position } from '../../../../editor/common/core/position.js';
import { CompletionContext, CompletionList, CompletionItemKind } from '../../../../editor/common/languages.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';

export class EditorEnhancement extends Disposable implements IWorkbenchContribution {

    constructor(
        @ILanguageFeaturesService private readonly languageFeaturesService: ILanguageFeaturesService,
        @IAICodeCompletionService private readonly aiCodeCompletionService: IAICodeCompletionService
    ) {
        super();
        this.registerProviders();
    }

    private registerProviders(): void {
        // Register AI Completion Provider for all languages (or specific ones)
        this._register(this.languageFeaturesService.completionProvider.register({ pattern: '**' }, {
            _debugDisplayName: 'AzStudioAI',
            triggerCharacters: ['.', '(', '{', '['],
            provideCompletionItems: async (model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken) => {

                const completions = await this.aiCodeCompletionService.getCompletions(
                    model.getValue(),
                    { lineNumber: position.lineNumber, column: position.column },
                    { triggerKind: context.triggerKind, triggerCharacter: context.triggerCharacter },
                    model.getLanguageId()
                );

                return {
                    suggestions: completions.map(c => ({
                        label: c.label,
                        kind: c.kind || CompletionItemKind.Text,
                        insertText: c.insertText,
                        detail: c.detail,
                        documentation: c.documentation,
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        }
                    }))
                } as CompletionList;
            }
        }));
    }
}
