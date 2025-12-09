/**
 * CommentingIntegration
 * 
 * Integrates commenting system with Monaco editor and visual canvas
 */

import React, { useEffect, useState, useCallback } from 'react';
import { InlineCommentWidget, CommentGlyphDecoration } from './InlineCommentWidget';
import { CanvasAnnotationManager } from './CanvasAnnotation';
import type { CommentThreadData } from './CommentThread';

export interface CommentingIntegrationProps {
  editor?: any; // Monaco editor instance
  canvasId?: string;
  currentUserId: string;
  currentUserName: string;
  onCreateComment?: (type: 'code' | 'canvas', data: any) => void;
  onUpdateComment?: (threadId: string, commentId: string, content: string) => void;
  onDeleteComment?: (threadId: string, commentId: string) => void;
  onResolveThread?: (threadId: string) => void;
  onReopenThread?: (threadId: string) => void;
  onReactToComment?: (threadId: string, commentId: string, emoji: string) => void;
}

export const CommentingIntegration: React.FC<CommentingIntegrationProps> = ({
  editor,
  canvasId,
  currentUserId,
  currentUserName,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onResolveThread,
  onReopenThread,
  onReactToComment
}) => {
  const [codeThreads, setCodeThreads] = useState<CommentThreadData[]>([]);
  const [canvasThreads, setCanvasThreads] = useState<CommentThreadData[]>([]);
  const [activeWidgets, setActiveWidgets] = useState<Map<string, InlineCommentWidget>>(new Map());
  const [glyphDecorations, setGlyphDecorations] = useState<CommentGlyphDecoration | null>(null);

  // Initialize glyph decorations for Monaco editor
  useEffect(() => {
    let decorations: CommentGlyphDecoration | null = null;
    if (editor && !glyphDecorations) {
      decorations = new CommentGlyphDecoration(editor);
      setGlyphDecorations(decorations);
    }

    return () => {
      if (decorations) decorations.clearGlyphs();
    };
  }, [editor, glyphDecorations]);

  // Update glyph decorations when threads change
  useEffect(() => {
    if (glyphDecorations && codeThreads.length > 0) {
      const glyphData = codeThreads.map(thread => ({
        lineNumber: (thread.rootComment as any).line,
        threadId: thread.id,
        resolved: thread.resolved
      }));
      glyphDecorations.updateGlyphs(glyphData);
    }
  }, [glyphDecorations, codeThreads]);

  // Handle glyph margin clicks to show comment widgets
  useEffect(() => {
    if (!editor) {
      return () => {};
    }

    const disposable = editor.onMouseDown((e: any) => {
      if (e.target.type === 2) { // GUTTER_GLYPH_MARGIN
        const lineNumber = e.target.position.lineNumber;
        const thread = codeThreads.find(t => (t.rootComment as any).line === lineNumber);
        
        if (thread) {
          showCommentWidget(thread, lineNumber);
        } else {
          // Create new comment
          handleCreateCodeComment(lineNumber);
        }
      }
    });

    return () => {
      disposable.dispose();
    };
  }, [editor, codeThreads]);

  const showCommentWidget = useCallback((thread: CommentThreadData, lineNumber: number) => {
    if (!editor) return;

    // Close existing widget for this thread
    const existingWidget = activeWidgets.get(thread.id);
    if (existingWidget) {
      existingWidget.dispose();
      activeWidgets.delete(thread.id);
    }

    // Create new widget
    const widget = new InlineCommentWidget(editor, lineNumber, {
      thread,
      currentUserId,
      onReply: (content: string) => handleReply(thread.id, content),
      onEdit: (commentId: string, content: string) => handleEdit(thread.id, commentId, content),
      onDelete: (commentId: string) => handleDelete(thread.id, commentId),
      onResolve: () => handleResolve(thread.id),
      onReopen: () => handleReopen(thread.id),
      onReact: (commentId: string, emoji: string) => handleReact(thread.id, commentId, emoji),
      onClose: () => closeCommentWidget(thread.id)
    });

    editor.addContentWidget(widget);
    setActiveWidgets(new Map(activeWidgets.set(thread.id, widget)));
  }, [editor, activeWidgets, currentUserId]);

  const closeCommentWidget = useCallback((threadId: string) => {
    const widget = activeWidgets.get(threadId);
    if (widget && editor) {
      editor.removeContentWidget(widget);
      widget.dispose();
      activeWidgets.delete(threadId);
      setActiveWidgets(new Map(activeWidgets));
    }
  }, [editor, activeWidgets]);

  const handleCreateCodeComment = useCallback((lineNumber: number) => {
    if (!editor || !onCreateComment) return;

    const model = editor.getModel();
    if (!model) return;

    const lineContent = model.getLineContent(lineNumber);
    const fileId = model.uri.path;

    // Prompt for comment content
    const content = prompt('Enter your comment:');
    if (!content) return;

    onCreateComment('code', {
      fileId,
      line: lineNumber,
      content,
      codeSnippet: lineContent,
      userId: currentUserId,
      userName: currentUserName
    });
  }, [editor, currentUserId, currentUserName, onCreateComment]);

  const handleReply = useCallback((threadId: string, content: string) => {
    // This would typically call the CommentingSystem through IPC
    console.log('Reply to thread:', threadId, content);
  }, []);

  const handleEdit = useCallback((threadId: string, commentId: string, content: string) => {
    if (onUpdateComment) {
      onUpdateComment(threadId, commentId, content);
    }
  }, [onUpdateComment]);

  const handleDelete = useCallback((threadId: string, commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(threadId, commentId);
    }
  }, [onDeleteComment]);

  const handleResolve = useCallback((threadId: string) => {
    if (onResolveThread) {
      onResolveThread(threadId);
    }
    closeCommentWidget(threadId);
  }, [onResolveThread, closeCommentWidget]);

  const handleReopen = useCallback((threadId: string) => {
    if (onReopenThread) {
      onReopenThread(threadId);
    }
  }, [onReopenThread]);

  const handleReact = useCallback((threadId: string, commentId: string, emoji: string) => {
    if (onReactToComment) {
      onReactToComment(threadId, commentId, emoji);
    }
  }, [onReactToComment]);

  // Canvas annotation handlers
  const handleCanvasReply = useCallback((threadId: string, content: string) => {
    console.log('Canvas reply:', threadId, content);
  }, []);

  const handleCanvasMove = useCallback((threadId: string, newPosition: { x: number; y: number }) => {
    console.log('Move annotation:', threadId, newPosition);
  }, []);

  const handleCanvasClose = useCallback((threadId: string) => {
    console.log('Close annotation:', threadId);
  }, []);

  return (
    <>
      {/* Canvas annotations */}
      {canvasId && canvasThreads.length > 0 && (
        <CanvasAnnotationManager
          threads={canvasThreads}
          currentUserId={currentUserId}
          onReply={handleCanvasReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResolve={handleResolve}
          onReopen={handleReopen}
          onReact={handleReact}
          onMove={handleCanvasMove}
          onClose={handleCanvasClose}
        />
      )}
    </>
  );
};

export default CommentingIntegration;