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
  private courses: Map<string, Course> = new Map();
  private resources: Map<string, Resource> = new Map();
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
   * Create a new course
   */
  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Course> {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      modules: course.modules || [],
    };

    this.courses.set(newCourse.id, newCourse);
    this.saveVersion(newCourse.id, newCourse, 'Initial creation', course.instructorId);

    this.emit('course:created', newCourse);
    return newCourse;
  }

  /**
   * Update course
   */
  async updateCourse(courseId: string, updates: Partial<Course>, updatedBy: string, changes?: string[]): Promise<Course> {
    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const updatedCourse: Course = {
      ...course,
      ...updates,
      updatedAt: new Date(),
      version: course.version + 1,
    };

    this.courses.set(courseId, updatedCourse);
    this.saveVersion(courseId, updatedCourse, changes?.join(', ') || 'Updated', updatedBy);

    this.emit('course:updated', updatedCourse);
    return updatedCourse;
  }

  /**
   * Add module to course
   */
  async addModule(courseId: string, module: Omit<Module, 'id' | 'courseId'>): Promise<Module> {
    const course = this.courses.get(courseId);
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

    this.courses.set(courseId, course);
    this.saveVersion(courseId, course, `Added module: ${newModule.title}`, course.instructorId);

    this.emit('module:added', { courseId, module: newModule });
    return newModule;
  }

  /**
   * Publish course
   */
  async publishCourse(courseId: string, publishedBy: string): Promise<Course> {
    const course = this.courses.get(courseId);
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

    this.courses.set(courseId, course);
    this.emit('course:published', course);

    return course;
  }

  /**
   * Add resource to library
   */
  async addResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
    const newResource: Resource = {
      ...resource,
      id: crypto.randomUUID(),
    };

    // Auto-vet resource
    if (!resource.constitutionallyVetted) {
      const vettingResult = await this.vetResource(newResource);
      newResource.constitutionallyVetted = vettingResult.approved;
      if (vettingResult.approved) {
        newResource.vettedAt = new Date();
      }
    }

    this.resources.set(newResource.id, newResource);
    this.emit('resource:added', newResource);

    return newResource;
  }

  /**
   * Vet content for constitutional alignment
   */
  async vetContent(contentId: string, type: 'course' | 'module'): Promise<ContentVettingResult> {
    // Check cache
    const cached = this.vettingResults.get(contentId);
    if (cached) {
      return cached;
    }

    const content = type === 'course' 
      ? this.courses.get(contentId)
      : this.findModuleInCourses(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    // Simple vetting logic (can be enhanced with AI)
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check title
    if (!content.title || content.title.length < 5) {
      score -= 10;
      issues.push('Title too short');
      recommendations.push('Add a descriptive title');
    }

    // Check description
    if (!content.description || content.description.length < 20) {
      score -= 15;
      issues.push('Description too short');
      recommendations.push('Add a detailed description');
    }

    // Check learning objectives (for courses)
    if (type === 'course') {
      const course = content as Course;
      if (!course.learningObjectives || course.learningObjectives.length === 0) {
        score -= 20;
        issues.push('No learning objectives');
        recommendations.push('Define clear learning objectives');
      }
    }

    // Check modules (for courses)
    if (type === 'course') {
      const course = content as Course;
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
   * Find module in any course
   */
  private findModuleInCourses(moduleId: string): Module | undefined {
    for (const course of this.courses.values()) {
      const module = course.modules.find(m => m.id === moduleId);
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
   * Get course by ID
   */
  getCourse(courseId: string): Course | undefined {
    return this.courses.get(courseId);
  }

  /**
   * Get all courses
   */
  getAllCourses(status?: Course['status']): Course[] {
    const courses = Array.from(this.courses.values());
    return status ? courses.filter(c => c.status === status) : courses;
  }

  /**
   * Search courses
   */
  searchCourses(query: string): Course[] {
    const q = query.toLowerCase();
    return Array.from(this.courses.values()).filter(course =>
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.code.toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q)
    );
  }

  /**
   * Get content library
   */
  getContentLibrary(): ContentLibrary {
    const courses = Array.from(this.courses.values());
    const resources = Array.from(this.resources.values());
    const categories = [...new Set(courses.map(c => c.category))];
    const tags: string[] = []; // TODO: Extract tags from courses

    return {
      courses,
      resources,
      categories,
      tags,
    };
  }

  /**
   * Get resource by ID
   */
  getResource(resourceId: string): Resource | undefined {
    return this.resources.get(resourceId);
  }

  /**
   * Get all resources
   */
  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }
}

export const contentManagementSystem = ContentManagementSystem.getInstance();
