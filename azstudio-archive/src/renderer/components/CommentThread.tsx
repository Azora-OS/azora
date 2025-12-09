/**
 * CommentThread
 * 
 * UI component for displaying and interacting with comment threads
 */

import React, { useState } from 'react';
import './CommentThread.css';

export interface CommentData {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  timestamp: Date;
  edited?: Date;
  reactions: Array<{ emoji: string; userId: string; userName: string }>;
}

export interface CommentThreadData {
  id: string;
  type: 'code' | 'canvas';
  rootComment: CommentData;
  replies: CommentData[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface CommentThreadProps {
  thread: CommentThreadData;
  currentUserId: string;
  onReply: (content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onResolve: () => void;
  onReopen: () => void;
  onReact: (commentId: string, emoji: string) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  thread,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReopen,
  onReact
}) => {
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText('');
    }
  };

  const handleEdit = (commentId: string) => {
    if (editText.trim()) {
      onEdit(commentId, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const startEdit = (comment: CommentData) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const renderComment = (comment: CommentData, isRoot: boolean = false) => {
    const isEditing = editingId === comment.id;
    const isOwner = comment.userId === currentUserId;

    return (
      <div key={comment.id} className={`comment ${isRoot ? 'root-comment' : 'reply-comment'}`}>
        <div className="comment-avatar">
          {comment.userAvatar ? (
            <img src={comment.userAvatar} alt={comment.userName} />
          ) : (
            <div className="avatar-placeholder">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-author">{comment.userName}</span>
            <span className="comment-timestamp">
              {formatTimestamp(comment.timestamp)}
              {comment.edited && <span className="edited-badge">(edited)</span>}
            </span>
          </div>

          {isEditing ? (
            <div className="comment-edit">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="comment-edit-input"
                autoFocus
              />
              <div className="comment-edit-actions">
                <button onClick={() => handleEdit(comment.id)} className="btn-save">
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="comment-text">
              {renderContentWithMentions(comment.content)}
            </div>
          )}

          <div className="comment-actions">
            <button
              className="action-btn"
              onClick={() => setShowEmojiPicker(comment.id)}
            >
              😊 React
            </button>

            {isOwner && !isEditing && (
              <>
                <button className="action-btn" onClick={() => startEdit(comment)}>
                  Edit
                </button>
                <button className="action-btn" onClick={() => onDelete(comment.id)}>
                  Delete
                </button>
              </>
            )}
          </div>

          {comment.reactions.length > 0 && (
            <div className="comment-reactions">
              {groupReactions(comment.reactions).map(({ emoji, count, users }) => (
                <button
                  key={emoji}
                  className="reaction-badge"
                  onClick={() => onReact(comment.id, emoji)}
                  title={users.join(', ')}
                >
                  {emoji} {count}
                </button>
              ))}
            </div>
          )}

          {showEmojiPicker === comment.id && (
            <div className="emoji-picker">
              {['👍', '❤️', '😄', '🎉', '🚀', '👀'].map(emoji => (
                <button
                  key={emoji}
                  className="emoji-option"
                  onClick={() => {
                    onReact(comment.id, emoji);
                    setShowEmojiPicker(null);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="mention">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const groupReactions = (reactions: Array<{ emoji: string; userId: string; userName: string }>) => {
    const grouped = new Map<string, { count: number; users: string[] }>();
    
    reactions.forEach(({ emoji, userName }) => {
      const existing = grouped.get(emoji) || { count: 0, users: [] };
      existing.count++;
      existing.users.push(userName);
      grouped.set(emoji, existing);
    });

    return Array.from(grouped.entries()).map(([emoji, data]) => ({
      emoji,
      ...data
    }));
  };

  return (
    <div className={`comment-thread ${thread.resolved ? 'resolved' : ''}`}>
      <div className="thread-header">
        <span className="thread-type">{thread.type === 'code' ? '💬 Code' : '📍 Canvas'}</span>
        {thread.resolved && (
          <span className="resolved-badge">
            ✓ Resolved by {thread.resolvedBy}
          </span>
        )}
      </div>

      {renderComment(thread.rootComment, true)}

      {thread.replies.map(reply => renderComment(reply))}

      {!thread.resolved && (
        <div className="reply-box">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply... (use @username to mention)"
            className="reply-input"
          />
          <div className="reply-actions">
            <button onClick={handleReply} className="btn-reply" disabled={!replyText.trim()}>
              Reply
            </button>
            <button onClick={onResolve} className="btn-resolve">
              Resolve
            </button>
          </div>
        </div>
      )}

      {thread.resolved && (
        <div className="resolved-actions">
          <button onClick={onReopen} className="btn-reopen">
            Reopen Thread
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentThread;
