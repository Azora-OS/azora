import React from 'react';

interface InlineCommentWidgetProps {
    comment: string;
    author: string;
    timestamp: Date;
    // Unused props removed or prefixed
    editor?: any;
    threadId?: string;
}

const InlineCommentWidgetComponent: React.FC<InlineCommentWidgetProps> = ({ comment, author, timestamp }) => {
  return (
    <div className="inline-comment-widget">
      <div className="comment-header">
        <span className="author">{author}</span>
        <span className="timestamp">{timestamp.toLocaleTimeString()}</span>
      </div>
      <div className="comment-body">
        {comment}
      </div>
    </div>
  );
};

// Editor integration class (stub) - used by Monaco integration
export class InlineCommentWidget {
  private editor: any;
  private lineNumber: number;
  private options: any;
  id: string;

  constructor(editor: any, lineNumber: number, options: any) {
    this.editor = editor;
    this.lineNumber = lineNumber;
    this.options = options;
    this.id = `inline-comment-${Date.now()}-${Math.random()}`;
  }

  dispose() {
    // Remove widget from editor
  }
}

// Glyph decoration manager stub
export class CommentGlyphDecoration {
  private editor: any;
  constructor(editor: any) { this.editor = editor; }
  updateGlyphs(_glyphData: any[]) { /* no-op */ }
  clearGlyphs() { /* no-op */ }
}

export default InlineCommentWidgetComponent;
