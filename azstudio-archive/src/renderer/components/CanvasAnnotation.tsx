/**
 * CanvasAnnotation
 * 
 * Component for displaying annotations on the visual canvas
 */

import React, { useState, useRef, useEffect } from 'react';
import { CommentThread } from './CommentThread';
import type { CommentThreadData } from './CommentThread';
import './CanvasAnnotation.css';

export interface CanvasAnnotationProps {
  thread: CommentThreadData;
  position: { x: number; y: number };
  currentUserId: string;
  onReply: (content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onResolve: () => void;
  onReopen: () => void;
  onReact: (commentId: string, emoji: string) => void;
  onMove?: (newPosition: { x: number; y: number }) => void;
  onClose: () => void;
}

export const CanvasAnnotation: React.FC<CanvasAnnotationProps> = ({
  thread,
  position,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReopen,
  onReact,
  onMove,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const annotationRef = useRef<HTMLDivElement>(null);

  const handlePinMouseDown = (e: React.MouseEvent) => {
    if (!onMove) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (onMove) {
        onMove({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove]);

  const replyCount = thread.replies.length;
  const isResolved = thread.resolved;

  return (
    <div
      ref={annotationRef}
      className={`canvas-annotation ${isExpanded ? 'expanded' : 'collapsed'} ${isResolved ? 'resolved' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Annotation Pin */}
      <div
        className="annotation-pin"
        onMouseDown={handlePinMouseDown}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse' : 'Expand'}
      >
        <div className="pin-icon">
          {isResolved ? '✓' : '💬'}
        </div>
        {replyCount > 0 && !isExpanded && (
          <div className="reply-count-badge">{replyCount + 1}</div>
        )}
      </div>

      {/* Annotation Content */}
      {isExpanded && (
        <div className="annotation-content">
          <div className="annotation-header">
            <span className="annotation-title">Canvas Annotation</span>
            <button
              className="annotation-close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Close"
            >
              ×
            </button>
          </div>
          
          <div className="annotation-thread">
            <CommentThread
              thread={thread}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onResolve={() => {
                onResolve();
                setIsExpanded(false);
              }}
              onReopen={onReopen}
              onReact={onReact}
            />
          </div>
        </div>
      )}

      {/* Connection Line (optional) */}
      <div className="annotation-line" />
    </div>
  );
};

/**
 * Canvas Annotation Manager
 * Manages multiple annotations on a canvas
 */
export interface CanvasAnnotationManagerProps {
  threads: CommentThreadData[];
  currentUserId: string;
  onReply: (threadId: string, content: string) => void;
  onEdit: (threadId: string, commentId: string, content: string) => void;
  onDelete: (threadId: string, commentId: string) => void;
  onResolve: (threadId: string) => void;
  onReopen: (threadId: string) => void;
  onReact: (threadId: string, commentId: string, emoji: string) => void;
  onMove?: (threadId: string, newPosition: { x: number; y: number }) => void;
  onClose: (threadId: string) => void;
}

export const CanvasAnnotationManager: React.FC<CanvasAnnotationManagerProps> = ({
  threads,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReopen,
  onReact,
  onMove,
  onClose
}) => {
  return (
    <div className="canvas-annotation-manager">
      {threads.map(thread => {
        const rootComment = thread.rootComment as any;
        if (!rootComment.position) return null;

        return (
          <CanvasAnnotation
            key={thread.id}
            thread={thread}
            position={rootComment.position}
            currentUserId={currentUserId}
            onReply={(content) => onReply(thread.id, content)}
            onEdit={(commentId, content) => onEdit(thread.id, commentId, content)}
            onDelete={(commentId) => onDelete(thread.id, commentId)}
            onResolve={() => onResolve(thread.id)}
            onReopen={() => onReopen(thread.id)}
            onReact={(commentId, emoji) => onReact(thread.id, commentId, emoji)}
            onMove={onMove ? (pos) => onMove(thread.id, pos) : undefined}
            onClose={() => onClose(thread.id)}
          />
        );
      })}
    </div>
  );
};

export default CanvasAnnotation;
