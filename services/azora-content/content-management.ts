/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Content Management System
 * 
 * Manages educational content:
 * - Course creation and management
 * - Content library
 * - Authoring tools
 * - Version control
 * - Content vetting
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { Course, Resource } from '../shared/database/models';
import { azoraDatabase } from '../shared/database/connection';

export interface Course {
  id: string;
  title: string;
  description: string;
  code: string; // e.g., "CS101"
  instructorId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  credits: number;
  duration: number; // hours
  modules: Module[];
  learningObjectives: string[];
  prerequisites: string[]; // Course IDs
  status: 'draft' | 'review' | 'published' | 'archived';
  constitutionalScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  version: number;
  publishedAt?: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  type: 'video' | 'reading' | 'quiz' | 'project' | 'discussion' | 'lab';
  content: ContentItem[];
  resources: Resource[];
  estimatedDuration: number; // minutes
  prerequisites: string[]; // Module IDs
}

export interface ContentItem {
  id: string;
  type: 'text' | 'video' | 'image' | 'interactive' | 'code' | 'file';
  content: string; // HTML/text content or URL
  metadata: Record<string, any>;
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'code' | 'dataset' | 'video' | 'image';
  url: string;
  description?: string;
  size?: number;
  constitutionallyVetted: boolean;
  vettedAt?: Date;
  vettedBy?: string;
}

export interface ContentVersion {
  id: string;
  contentId: string; // Course or Module ID
  version: number;
  content: Course | Module;
  changes: string[];
  createdBy: string;
  createdAt: Date;
}

export interface ContentVettingResult {
  contentId: string;
  constitutionalScore: number;
  alignment: 'excellent' | 'good' | 'acceptable' | 'poor' | 'rejected';
  issues: string[];
  recommendations: string[];
  approved: boolean;
  vettedBy?: string;
  vettedAt?: Date;
}

export interface ContentLibrary {
  courses: Course[];
  resources: Resource[];
  categories: string[];
  tags: string[];
}

export class ContentManagementSystem extends EventEmitter {
  private static instance: ContentManagementSystem;
  private versions: Map<string, ContentVersion[]> = new Map(); // contentId -> versions
  private vettingResults: Map<string, ContentVettingResult> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): ContentManagementSystem {
    if (!ContentManagementSystem.instance) {
      ContentManagementSystem.instance = new ContentManagementSystem();
    }
    return ContentManagementSystem.instance;
  }

  /**
   * Create a new course (MongoDB)
   */
  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Course> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const newCourse = new Course({
      ...course,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      modules: course.modules || [],
      status: course.status || 'draft',
    });

    await newCourse.save();
    this.saveVersion(newCourse.id, newCourse.toObject(), 'Initial creation', course.instructorId);

    this.emit('course:created', newCourse.toObject());
    return newCourse.toObject();
  }

  /**
   * Update course (MongoDB)
   */
  async updateCourse(courseId: string, updates: Partial<Course>, updatedBy: string, changes?: string[]): Promise<Course> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const course = await Course.findOne({ id: courseId });
    if (!course) {
      throw new Error('Course not found');
    }

    Object.assign(course, updates, {
      updatedAt: new Date(),
      version: course.version + 1,
    });

    await course.save();
    this.saveVersion(courseId, course.toObject(), changes?.join(', ') || 'Updated', updatedBy);

    this.emit('course:updated', course.toObject());
    return course.toObject();
  }

  /**
   * Add module to course (MongoDB)
   */
  async addModule(courseId: string, module: Omit<Module, 'id' | 'courseId'>): Promise<Module> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const course = await Course.findOne({ id: courseId });
    if (!course) {
      throw new Error('Course not found');
    }

    const newModule: Module = {
      ...module,
      id: crypto.randomUUID(),
      courseId,
      order: module.order || course.modules.length + 1,
    };

    course.modules.push(newModule);
    course.updatedAt = new Date();
    course.version += 1;

    await course.save();
    this.saveVersion(courseId, course.toObject(), `Added module: ${newModule.title}`, course.instructorId);

    this.emit('module:added', { courseId, module: newModule });
    return newModule;
  }

  /**
   * Publish course (MongoDB)
   */
  async publishCourse(courseId: string, publishedBy: string): Promise<Course> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const course = await Course.findOne({ id: courseId });
    if (!course) {
      throw new Error('Course not found');
    }

    // Vet content before publishing
    const vettingResult = await this.vetContent(courseId, 'course');
    if (!vettingResult.approved) {
      throw new Error(`Course cannot be published: ${vettingResult.issues.join(', ')}`);
    }

    course.status = 'published';
    course.publishedAt = new Date();
    course.constitutionalScore = vettingResult.constitutionalScore;

    await course.save();
    this.emit('course:published', course.toObject());

    return course.toObject();
  }

  /**
   * Add resource to library (MongoDB)
   */
  async addResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    // Auto-vet resource
    let vettingResult: ContentVettingResult | undefined;
    if (!resource.constitutionallyVetted) {
      vettingResult = await this.vetResource({
        ...resource,
        id: crypto.randomUUID(),
      });
    }

    const newResource = new Resource({
      ...resource,
      id: crypto.randomUUID(),
      constitutionallyVetted: vettingResult?.approved || resource.constitutionallyVetted,
      vettedAt: vettingResult?.approved ? new Date() : resource.vettedAt,
    });

    await newResource.save();
    this.emit('resource:added', newResource.toObject());

    return newResource.toObject();
  }

  /**
   * Vet content for constitutional alignment (MongoDB)
   */
  async vetContent(contentId: string, type: 'course' | 'module'): Promise<ContentVettingResult> {
    // Check cache
    const cached = this.vettingResults.get(contentId);
    if (cached) {
      return cached;
    }

    const content = type === 'course' 
      ? await Course.findOne({ id: contentId })
      : await this.findModuleInCourses(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    const contentObj = content.toObject ? content.toObject() : content;

    // Simple vetting logic (can be enhanced with AI)
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check title
    if (!contentObj.title || contentObj.title.length < 5) {
      score -= 10;
      issues.push('Title too short');
      recommendations.push('Add a descriptive title');
    }

    // Check description
    if (!contentObj.description || contentObj.description.length < 20) {
      score -= 15;
      issues.push('Description too short');
      recommendations.push('Add a detailed description');
    }

    // Check learning objectives (for courses)
    if (type === 'course') {
      const course = contentObj as Course;
      if (!course.learningObjectives || course.learningObjectives.length === 0) {
        score -= 20;
        issues.push('No learning objectives');
        recommendations.push('Define clear learning objectives');
      }
    }

    // Check modules (for courses)
    if (type === 'course') {
      const course = contentObj as Course;
      if (!course.modules || course.modules.length === 0) {
        score -= 25;
        issues.push('No modules');
        recommendations.push('Add at least one module');
      }
    }

    const alignment: ContentVettingResult['alignment'] = 
      score >= 90 ? 'excellent' :
      score >= 75 ? 'good' :
      score >= 60 ? 'acceptable' :
      score >= 40 ? 'poor' : 'rejected';

    const result: ContentVettingResult = {
      contentId,
      constitutionalScore: score,
      alignment,
      issues,
      recommendations,
      approved: score >= 60,
      vettedAt: new Date(),
    };

    this.vettingResults.set(contentId, result);
    this.emit('content:vetted', result);

    return result;
  }

  /**
   * Find module in any course (MongoDB)
   */
  private async findModuleInCourses(moduleId: string): Promise<Module | undefined> {
    if (!azoraDatabase.isDatabaseConnected()) {
      return undefined;
    }

    const courses = await Course.find({});
    for (const course of courses) {
      const module = course.modules.find((m: Module) => m.id === moduleId);
      if (module) return module;
    }
    return undefined;
  }

  /**
   * Vet resource
   */
  private async vetResource(resource: Resource): Promise<ContentVettingResult> {
    // Simple vetting
    let score = 100;
    const issues: string[] = [];

    if (!resource.title || resource.title.length < 3) {
      score -= 15;
      issues.push('Resource title too short');
    }

    if (!resource.url) {
      score -= 30;
      issues.push('Resource URL missing');
    }

    const alignment: ContentVettingResult['alignment'] = 
      score >= 90 ? 'excellent' :
      score >= 75 ? 'good' :
      score >= 60 ? 'acceptable' :
      score >= 40 ? 'poor' : 'rejected';

    return {
      contentId: resource.id,
      constitutionalScore: score,
      alignment,
      issues,
      recommendations: [],
      approved: score >= 60,
    };
  }

  /**
   * Save version history
   */
  private saveVersion(contentId: string, content: Course | Module, changes: string, createdBy: string): void {
    const versions = this.versions.get(contentId) || [];
    const version: ContentVersion = {
      id: crypto.randomUUID(),
      contentId,
      version: versions.length + 1,
      content: JSON.parse(JSON.stringify(content)), // Deep clone
      changes: [changes],
      createdBy,
      createdAt: new Date(),
    };

    versions.push(version);
    this.versions.set(contentId, versions);
  }

  /**
   * Get version history
   */
  getVersions(contentId: string): ContentVersion[] {
    return this.versions.get(contentId) || [];
  }

  /**
   * Get course by ID (MongoDB)
   */
  async getCourse(courseId: string): Promise<Course | undefined> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const course = await Course.findOne({ id: courseId });
    return course ? course.toObject() : undefined;
  }

  /**
   * Get all courses (MongoDB)
   */
  async getAllCourses(status?: Course['status']): Promise<Course[]> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const query = status ? { status } : {};
    const courses = await Course.find(query);
    return courses.map(c => c.toObject());
  }

  /**
   * Search courses (MongoDB)
   */
  async searchCourses(query: string): Promise<Course[]> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const q = query.toLowerCase();
    const courses = await Course.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    });
    return courses.map(c => c.toObject());
  }

  /**
   * Get content library (MongoDB)
   */
  async getContentLibrary(): Promise<ContentLibrary> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const courses = await Course.find({});
    const resources = await Resource.find({});
    const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
    const tags: string[] = []; // TODO: Extract tags from courses

    return {
      courses: courses.map(c => c.toObject()),
      resources: resources.map(r => r.toObject()),
      categories,
      tags,
    };
  }

  /**
   * Get resource by ID (MongoDB)
   */
  async getResource(resourceId: string): Promise<Resource | undefined> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const resource = await Resource.findOne({ id: resourceId });
    return resource ? resource.toObject() : undefined;
  }

  /**
   * Get all resources (MongoDB)
   */
  async getAllResources(): Promise<Resource[]> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const resources = await Resource.find({});
    return resources.map(r => r.toObject());
  }
}

export const contentManagementSystem = ContentManagementSystem.getInstance();
