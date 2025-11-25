/**
 * InlineCommentWidget
 * 
 * Monaco editor widget for displaying inline code comments
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { CommentThread } from './CommentThread';
import type { CommentThreadData } from './CommentThread';
import './InlineCommentWidget.css';

export interface InlineCommentWidgetProps {
  thread: CommentThreadData;
  currentUserId: string;
  onReply: (content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onResolve: () => void;
  onReopen: () => void;
  onReact: (commentId: string, emoji: string) => void;
  onClose: () => void;
}

export class InlineCommentWidget {
  private domNode: HTMLElement;
  private editor: any;
  private lineNumber: number;
  private widgetId: string;

  constructor(
    editor: any,
    lineNumber: number,
    props: InlineCommentWidgetProps
  ) {
    this.editor = editor;
    this.lineNumber = lineNumber;
    this.widgetId = `inline-comment-${props.thread.id}`;
    
    // Create DOM node
    this.domNode = document.createElement('div');
    this.domNode.className = 'inline-comment-widget';
    this.domNode.id = this.widgetId;
    
    // Render React component
    this.render(props);
  }

  private render(props: InlineCommentWidgetProps): void {
    ReactDOM.render(
      <div className="inline-comment-container">
        <div className="inline-comment-header">
          <button
            className="close-button"
            onClick={props.onClose}
            title="Close"
          >
            ×
          </button>
        </div>
        <CommentThread {...props} />
      </div>,
      this.domNode
    );
  }

  public getId(): string {
    return this.widgetId;
  }

  public getDomNode(): HTMLElement {
    return this.domNode;
  }

  public getPosition(): any {
    return {
      position: {
        lineNumber: this.lineNumber,
        column: 1
      },
      preference: [2] // BELOW
    };
  }

  public dispose(): void {
    ReactDOM.unmountComponentAtNode(this.domNode);
    this.domNode.remove();
  }

  public update(props: InlineCommentWidgetProps): void {
    this.render(props);
  }
}

/**
 * Comment glyph decoration for Monaco editor
 */
export class CommentGlyphDecoration {
  private editor: any;
  private decorationIds: string[] = [];

  constructor(editor: any) {
    this.editor = editor;
  }

  /**
   * Add comment glyph at line
   */
  addGlyph(lineNumber: number, threadId: string, resolved: boolean = false): void {
    const decoration = {
      range: {
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: 1
      },
      options: {
        isWholeLine: false,
        glyphMarginClassName: resolved ? 'comment-glyph-resolved' : 'comment-glyph',
        glyphMarginHoverMessage: { value: resolved ? 'Resolved comment' : 'Comment thread' },
        stickiness: 1
      }
    };

    const ids = this.editor.deltaDecorations([], [decoration]);
    this.decorationIds.push(...ids);
  }

  /**
   * Remove all glyphs
   */
  clearGlyphs(): void {
    this.editor.deltaDecorations(this.decorationIds, []);
    this.decorationIds = [];
  }

  /**
   * Update glyphs for threads
   */
  updateGlyphs(threads: Array<{ lineNumber: number; threadId: string; resolved: boolean }>): void {
    this.clearGlyphs();
    threads.forEach(({ lineNumber, threadId, resolved }) => {
      this.addGlyph(lineNumber, threadId, resolved);
    });
  }
}
