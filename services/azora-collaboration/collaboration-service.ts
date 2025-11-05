/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Communication & Collaboration Platform
 * 
 * Features:
 * - Discussion forums
 * - Real-time messaging
 * - Study groups
 * - Peer review system
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface Forum {
  id: string;
  courseId: string;
  title: string;
  description: string;
  topics: ForumTopic[];
  createdAt: Date;
  createdBy: string;
}

export interface ForumTopic {
  id: string;
  forumId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  replies: ForumReply[];
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  authorName: string;
  parentReplyId?: string; // For nested replies
  likes: number;
  createdAt: Date;
  editedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  members: StudyGroupMember[];
  maxMembers?: number;
  visibility: 'public' | 'private';
  createdAt: Date;
  createdBy: string;
}

export interface StudyGroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface PeerReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  revieweeId: string;
  rubric: PeerReviewRubric;
  scores: Record<string, number>;
  feedback: string;
  submittedAt: Date;
}

export interface PeerReviewRubric {
  criteria: Array<{
    name: string;
    description: string;
    maxPoints: number;
  }>;
}

export class CollaborationService extends EventEmitter {
  private static instance: CollaborationService;
  private forums: Map<string, Forum> = new Map();
  private topics: Map<string, ForumTopic> = new Map();
  private messages: Map<string, Message[]> = new Map(); // userId -> messages
  private studyGroups: Map<string, StudyGroup> = new Map();
  private peerReviews: Map<string, PeerReview> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Create forum
   */
  async createForum(forum: Omit<Forum, 'id' | 'topics' | 'createdAt'>): Promise<Forum> {
    const newForum: Forum = {
      ...forum,
      id: crypto.randomUUID(),
      topics: [],
      createdAt: new Date(),
    };

    this.forums.set(newForum.id, newForum);
    this.emit('forum:created', newForum);
    return newForum;
  }

  /**
   * Create forum topic
   */
  async createTopic(topic: Omit<ForumTopic, 'id' | 'replies' | 'views' | 'createdAt' | 'updatedAt'>): Promise<ForumTopic> {
    const forum = this.forums.get(topic.forumId);
    if (!forum) {
      throw new Error('Forum not found');
    }

    const newTopic: ForumTopic = {
      ...topic,
      id: crypto.randomUUID(),
      replies: [],
      views: 0,
      pinned: false,
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.topics.set(newTopic.id, newTopic);
    forum.topics.push(newTopic);
    this.forums.set(forum.id, forum);

    this.emit('topic:created', newTopic);
    return newTopic;
  }

  /**
   * Add reply to topic
   */
  async addReply(reply: Omit<ForumReply, 'id' | 'likes' | 'createdAt'>): Promise<ForumReply> {
    const topic = this.topics.get(reply.topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    if (topic.locked) {
      throw new Error('Topic is locked');
    }

    const newReply: ForumReply = {
      ...reply,
      id: crypto.randomUUID(),
      likes: 0,
      createdAt: new Date(),
    };

    topic.replies.push(newReply);
    topic.updatedAt = new Date();
    this.topics.set(topic.id, topic);

    this.emit('reply:created', newReply);
    return newReply;
  }

  /**
   * Send message
   */
  async sendMessage(message: Omit<Message, 'id' | 'read' | 'createdAt'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    };

    // Add to receiver's messages
    const receiverMessages = this.messages.get(message.receiverId) || [];
    receiverMessages.push(newMessage);
    this.messages.set(message.receiverId, receiverMessages);

    this.emit('message:sent', newMessage);
    return newMessage;
  }

  /**
   * Get messages for user
   */
  getMessages(userId: string): Message[] {
    return this.messages.get(userId) || [];
  }

  /**
   * Mark message as read
   */
  async markMessageRead(messageId: string, userId: string): Promise<void> {
    const messages = this.messages.get(userId) || [];
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
      message.readAt = new Date();
      this.messages.set(userId, messages);
    }
  }

  /**
   * Create study group
   */
  async createStudyGroup(group: Omit<StudyGroup, 'id' | 'members' | 'createdAt'>): Promise<StudyGroup> {
    const newGroup: StudyGroup = {
      ...group,
      id: crypto.randomUUID(),
      members: [{
        userId: group.createdBy,
        role: 'admin',
        joinedAt: new Date(),
      }],
      createdAt: new Date(),
    };

    this.studyGroups.set(newGroup.id, newGroup);
    this.emit('study-group:created', newGroup);
    return newGroup;
  }

  /**
   * Join study group
   */
  async joinStudyGroup(groupId: string, userId: string): Promise<void> {
    const group = this.studyGroups.get(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    if (group.maxMembers && group.members.length >= group.maxMembers) {
      throw new Error('Study group is full');
    }

    if (group.members.some(m => m.userId === userId)) {
      throw new Error('Already a member');
    }

    group.members.push({
      userId,
      role: 'member',
      joinedAt: new Date(),
    });

    this.studyGroups.set(groupId, group);
    this.emit('study-group:joined', { groupId, userId });
  }

  /**
   * Create peer review
   */
  async createPeerReview(review: Omit<PeerReview, 'id' | 'submittedAt'>): Promise<PeerReview> {
    const newReview: PeerReview = {
      ...review,
      id: crypto.randomUUID(),
      submittedAt: new Date(),
    };

    this.peerReviews.set(newReview.id, newReview);
    this.emit('peer-review:created', newReview);
    return newReview;
  }

  /**
   * Get forum by ID
   */
  getForum(forumId: string): Forum | undefined {
    return this.forums.get(forumId);
  }

  /**
   * Get forums for course
   */
  getCourseForums(courseId: string): Forum[] {
    return Array.from(this.forums.values()).filter(f => f.courseId === courseId);
  }

  /**
   * Get topic by ID
   */
  getTopic(topicId: string): ForumTopic | undefined {
    return this.topics.get(topicId);
  }

  /**
   * Get study group by ID
   */
  getStudyGroup(groupId: string): StudyGroup | undefined {
    return this.studyGroups.get(groupId);
  }

  /**
   * Get study groups for course
   */
  getCourseStudyGroups(courseId: string): StudyGroup[] {
    return Array.from(this.studyGroups.values()).filter(g => g.courseId === courseId);
  }

  /**
   * Get peer reviews for submission
   */
  getPeerReviews(submissionId: string): PeerReview[] {
    return Array.from(this.peerReviews.values()).filter(r => r.submissionId === submissionId);
  }
}

export const collaborationService = CollaborationService.getInstance();
