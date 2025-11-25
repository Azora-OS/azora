/**
 * CommentingSystem
 * 
 * Manages inline code comments, canvas annotations, @mentions, and comment threads
 */

import { EventEmitter } from 'events';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  timestamp: Date;
  edited?: Date;
  resolved: boolean;
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface CodeComment extends Comment {
  fileId: string;
  line: number;
  column?: number;
  codeSnippet?: string;
}

export interface CanvasComment extends Comment {
  canvasId: string;
  position: { x: number; y: number };
  elementId?: string;
}

export interface CommentThread {
  id: string;
  type: 'code' | 'canvas';
  rootComment: CodeComment | CanvasComment;
  replies: Comment[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export class CommentingSystem extends EventEmitter {
  private threads: Map<string, CommentThread>;
  private userMentions: Map<string, string[]>; // userId -> threadIds

  constructor() {
    super();
    this.threads = new Map();
    this.userMentions = new Map();
  }

  /**
   * Create a new code comment thread
   */
  createCodeComment(
    fileId: string,
    line: number,
    content: string,
    userId: string,
    userName: string,
    column?: number,
    codeSnippet?: string
  ): CommentThread {
    const commentId = this.generateId();
    const threadId = this.generateId();

    const mentions = this.extractMentions(content);

    const comment: CodeComment = {
      id: commentId,
      userId,
      userName,
      content,
      mentions,
      timestamp: new Date(),
      resolved: false,
      reactions: [],
      fileId,
      line,
      column,
      codeSnippet
    };

    const thread: CommentThread = {
      id: threadId,
      type: 'code',
      rootComment: comment,
      replies: [],
      resolved: false
    };

    this.threads.set(threadId, thread);
    this.indexMentions(threadId, mentions);

    this.emit('comment-created', { thread, comment });

    return thread;
  }

  /**
   * Create a new canvas annotation
   */
  createCanvasComment(
    canvasId: string,
    position: { x: number; y: number },
    content: string,
    userId: string,
    userName: string,
    elementId?: string
  ): CommentThread {
    const commentId = this.generateId();
    const threadId = this.generateId();

    const mentions = this.extractMentions(content);

    const comment: CanvasComment = {
      id: commentId,
      userId,
      userName,
      content,
      mentions,
      timestamp: new Date(),
      resolved: false,
      reactions: [],
      canvasId,
      position,
      elementId
    };

    const thread: CommentThread = {
      id: threadId,
      type: 'canvas',
      rootComment: comment,
      replies: [],
      resolved: false
    };

    this.threads.set(threadId, thread);
    this.indexMentions(threadId, mentions);

    this.emit('comment-created', { thread, comment });

    return thread;
  }

  /**
   * Add a reply to a comment thread
   */
  addReply(
    threadId: string,
    content: string,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Comment | null {
    const thread = this.threads.get(threadId);
    if (!thread) return null;

    const mentions = this.extractMentions(content);

    const reply: Comment = {
      id: this.generateId(),
      userId,
      userName,
      userAvatar,
      content,
      mentions,
      timestamp: new Date(),
      resolved: false,
      reactions: []
    };

    thread.replies.push(reply);
    this.indexMentions(threadId, mentions);

    this.emit('reply-added', { threadId, reply });

    return reply;
  }

  /**
   * Edit a comment
   */
  editComment(threadId: string, commentId: string, newContent: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    let comment: Comment | undefined;

    if (thread.rootComment.id === commentId) {
      comment = thread.rootComment;
    } else {
      comment = thread.replies.find(r => r.id === commentId);
    }

    if (!comment) return false;

    // Remove old mentions
    this.removeMentions(threadId, comment.mentions);

    // Update comment
    comment.content = newContent;
    comment.edited = new Date();
    comment.mentions = this.extractMentions(newContent);

    // Index new mentions
    this.indexMentions(threadId, comment.mentions);

    this.emit('comment-edited', { threadId, commentId, newContent });

    return true;
  }

  /**
   * Delete a comment
   */
  deleteComment(threadId: string, commentId: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    if (thread.rootComment.id === commentId) {
      // Delete entire thread
      this.removeMentions(threadId, thread.rootComment.mentions);
      thread.replies.forEach(r => this.removeMentions(threadId, r.mentions));
      this.threads.delete(threadId);
      this.emit('thread-deleted', { threadId });
      return true;
    }

    // Delete reply
    const replyIndex = thread.replies.findIndex(r => r.id === commentId);
    if (replyIndex === -1) return false;

    const reply = thread.replies[replyIndex];
    this.removeMentions(threadId, reply.mentions);
    thread.replies.splice(replyIndex, 1);

    this.emit('comment-deleted', { threadId, commentId });

    return true;
  }

  /**
   * Resolve a comment thread
   */
  resolveThread(threadId: string, userId: string, userName: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    thread.resolved = true;
    thread.resolvedBy = userName;
    thread.resolvedAt = new Date();

    this.emit('thread-resolved', { threadId, userId, userName });

    return true;
  }

  /**
   * Reopen a resolved thread
   */
  reopenThread(threadId: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    thread.resolved = false;
    thread.resolvedBy = undefined;
    thread.resolvedAt = undefined;

    this.emit('thread-reopened', { threadId });

    return true;
  }

  /**
   * Add a reaction to a comment
   */
  addReaction(threadId: string, commentId: string, emoji: string, userId: string, userName: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    let comment: Comment | undefined;

    if (thread.rootComment.id === commentId) {
      comment = thread.rootComment;
    } else {
      comment = thread.replies.find(r => r.id === commentId);
    }

    if (!comment) return false;

    // Check if user already reacted with this emoji
    const existingReaction = comment.reactions.find(
      r => r.emoji === emoji && r.userId === userId
    );

    if (existingReaction) return false;

    comment.reactions.push({ emoji, userId, userName });

    this.emit('reaction-added', { threadId, commentId, emoji, userId });

    return true;
  }

  /**
   * Remove a reaction from a comment
   */
  removeReaction(threadId: string, commentId: string, emoji: string, userId: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    let comment: Comment | undefined;

    if (thread.rootComment.id === commentId) {
      comment = thread.rootComment;
    } else {
      comment = thread.replies.find(r => r.id === commentId);
    }

    if (!comment) return false;

    const reactionIndex = comment.reactions.findIndex(
      r => r.emoji === emoji && r.userId === userId
    );

    if (reactionIndex === -1) return false;

    comment.reactions.splice(reactionIndex, 1);

    this.emit('reaction-removed', { threadId, commentId, emoji, userId });

    return true;
  }

  /**
   * Get all threads for a file
   */
  getFileThreads(fileId: string): CommentThread[] {
    return Array.from(this.threads.values()).filter(
      thread => thread.type === 'code' && (thread.rootComment as CodeComment).fileId === fileId
    );
  }

  /**
   * Get all threads for a canvas
   */
  getCanvasThreads(canvasId: string): CommentThread[] {
    return Array.from(this.threads.values()).filter(
      thread => thread.type === 'canvas' && (thread.rootComment as CanvasComment).canvasId === canvasId
    );
  }

  /**
   * Get threads where user is mentioned
   */
  getUserMentions(userId: string): CommentThread[] {
    const threadIds = this.userMentions.get(userId) || [];
    return threadIds
      .map(id => this.threads.get(id))
      .filter((t): t is CommentThread => t !== undefined);
  }

  /**
   * Get a specific thread
   */
  getThread(threadId: string): CommentThread | null {
    return this.threads.get(threadId) || null;
  }

  /**
   * Extract @mentions from comment content
   */
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  /**
   * Index mentions for quick lookup
   */
  private indexMentions(threadId: string, mentions: string[]): void {
    mentions.forEach(userId => {
      const threads = this.userMentions.get(userId) || [];
      if (!threads.includes(threadId)) {
        threads.push(threadId);
        this.userMentions.set(userId, threads);
      }
    });
  }

  /**
   * Remove mentions from index
   */
  private removeMentions(threadId: string, mentions: string[]): void {
    mentions.forEach(userId => {
      const threads = this.userMentions.get(userId) || [];
      const index = threads.indexOf(threadId);
      if (index !== -1) {
        threads.splice(index, 1);
        if (threads.length === 0) {
          this.userMentions.delete(userId);
        } else {
          this.userMentions.set(userId, threads);
        }
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all threads
   */
  getAllThreads(): CommentThread[] {
    return Array.from(this.threads.values());
  }

  /**
   * Clear all threads
   */
  clear(): void {
    this.threads.clear();
    this.userMentions.clear();
  }
}
