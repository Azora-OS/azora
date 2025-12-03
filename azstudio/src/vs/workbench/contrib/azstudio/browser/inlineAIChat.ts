/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IContentWidget, IContentWidgetPosition, ContentWidgetPositionPreference } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IContextKeyService, IContextKey, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { $, append, addDisposableListener, EventType, clearNode } from '../../../../base/browser/dom.js';
import { InputBox } from '../../../../base/browser/ui/inputBox/inputBox.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { IMultiAgentService } from './multiAgentService.js';

export const InlineChatVisible = new RawContextKey<boolean>('inlineChatVisible', false);

export class InlineAIChatController extends Disposable implements IEditorContribution {
    public static readonly ID = 'editor.contrib.inlineAIChat';

    private readonly _widget: InlineAIChatWidget;
    private readonly _ctxVisible: IContextKey<boolean>;

    constructor(
        private readonly _editor: ICodeEditor,
        @IContextKeyService contextKeyService: IContextKeyService,
        @IInstantiationService instantiationService: IInstantiationService
    ) {
        super();
        this._ctxVisible = InlineChatVisible.bindTo(contextKeyService);
        this._widget = instantiationService.createInstance(InlineAIChatWidget, this._editor);
    }

    public show(): void {
        this._widget.show();
        this._ctxVisible.set(true);
    }

    public hide(): void {
        this._widget.hide();
        this._ctxVisible.set(false);
        this._editor.focus();
    }

    public toggle(): void {
        if (this._widget.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

class InlineAIChatWidget extends Disposable implements IContentWidget {
    private static readonly ID = 'inline.ai.chat.widget';

    private readonly _domNode: HTMLElement;
    private _isVisible: boolean = false;
    private _inputBox: InputBox;
    private _messagesList: HTMLElement;

    constructor(
        private readonly _editor: ICodeEditor,
        @IMultiAgentService private readonly multiAgentService: IMultiAgentService
    ) {
        super();
        this._domNode = $('.inline-ai-chat-widget');
        this._domNode.style.zIndex = '1000';
        this._domNode.style.backgroundColor = 'var(--vscode-editor-background)';
        this._domNode.style.border = '1px solid var(--vscode-widget-border)';
        this._domNode.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.25)';
        this._domNode.style.borderRadius = '6px';
        this._domNode.style.width = '400px';
        this._domNode.style.padding = '10px';
        this._domNode.style.display = 'none';

        this.createContent();
        this._editor.addContentWidget(this);
    }

    public get isVisible(): boolean {
        return this._isVisible;
    }

    public getId(): string {
        return InlineAIChatWidget.ID;
    }

    public getDomNode(): HTMLElement {
        return this._domNode;
    }

    public getPosition(): IContentWidgetPosition | null {
        if (!this._isVisible) {
            return null;
        }
        return {
            position: this._editor.getPosition(),
            preference: [ContentWidgetPositionPreference.BELOW, ContentWidgetPositionPreference.ABOVE]
        };
    }

    public show(): void {
        this._isVisible = true;
        this._domNode.style.display = 'block';
        this._editor.layoutContentWidget(this);
        setTimeout(() => this._inputBox.focus(), 50);
    }

    public hide(): void {
        this._isVisible = false;
        this._domNode.style.display = 'none';
        this._editor.layoutContentWidget(this);
    }

    private createContent(): void {
        // Header
        const header = append(this._domNode, $('.inline-chat-header'));
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '10px';

        const title = append(header, $('span'));
        title.textContent = 'AzStudio AI';
        title.style.fontWeight = 'bold';

        const closeBtn = append(header, $('span'));
        closeBtn.textContent = '✕';
        closeBtn.style.cursor = 'pointer';
        this._register(addDisposableListener(closeBtn, EventType.CLICK, () => this.hide()));

        // Messages
        this._messagesList = append(this._domNode, $('.inline-chat-messages'));
        this._messagesList.style.maxHeight = '200px';
        this._messagesList.style.overflowY = 'auto';
        this._messagesList.style.marginBottom = '10px';

        // Input
        const inputContainer = append(this._domNode, $('.inline-chat-input'));
        this._inputBox = this._register(new InputBox(inputContainer, undefined, {
            placeholder: 'Ask AI to generate or edit code...'
        }));

        // Actions
        const actions = append(this._domNode, $('.inline-chat-actions'));
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.marginTop = '10px';

        const sendBtn = this._register(new Button(actions));
        sendBtn.label = 'Generate';
        this._register(addDisposableListener(sendBtn.element, EventType.CLICK, () => this.handleSend()));

        this._register(addDisposableListener(this._inputBox.inputElement, EventType.KEY_DOWN, (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.handleSend();
            } else if (e.key === 'Escape') {
                this.hide();
            }
        }));
    }

    private async handleSend(): Promise<void> {
        const value = this._inputBox.value;
        if (!value) return;

        this.addMessage('user', value);
        this._inputBox.value = '';

        // Simulate AI response
        this.addMessage('system', 'Thinking...');

        // In a real implementation, we would call multiAgentService here
        setTimeout(() => {
            this.addMessage('assistant', `Here is a suggestion for "${value}":\n\nconsole.log("AI Generated Code");`);
        }, 1000);
    }

    private addMessage(role: string, text: string): void {
        const msg = append(this._messagesList, $('.message'));
        msg.style.marginBottom = '5px';
        msg.style.padding = '5px';
        msg.style.borderRadius = '4px';

        if (role === 'user') {
            msg.style.backgroundColor = 'var(--vscode-editor-selectionBackground)';
            msg.textContent = `You: ${text}`;
        } else if (role === 'assistant') {
            msg.style.backgroundColor = 'var(--vscode-editor-inactiveSelectionBackground)';
            msg.textContent = `AI: ${text}`;
        } else {
            msg.style.fontStyle = 'italic';
            msg.textContent = text;
        }

        this._messagesList.scrollTop = this._messagesList.scrollHeight;
    }
}
