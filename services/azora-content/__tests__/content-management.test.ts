/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { contentManagementSystem, Course, Module, Resource } from '../content-management';
import { connectAzoraDatabase, azoraDatabase } from '../../shared/database/connection';

describe('ContentManagementSystem', () => {
  let testCourse: Course;
  const testInstructorId = 'instructor-123';

  beforeAll(async () => {
    await connectAzoraDatabase(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/azora-education-test');
  });

  afterAll(async () => {
    await azoraDatabase.disconnect();
  });

  beforeEach(async () => {
    testCourse = await contentManagementSystem.createCourse({
      title: 'Test Course',
      description: 'A comprehensive test course for unit testing',
      code: `TEST-${Date.now()}`,
      instructorId: testInstructorId,
      level: 'beginner',
      category: 'Testing',
      credits: 3,
      duration: 40,
      modules: [],
      learningObjectives: ['Learn testing', 'Understand content management'],
      prerequisites: [],
      status: 'draft',
      constitutionalScore: 0,
    });
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      const course = await contentManagementSystem.createCourse({
        title: 'New Course',
        description: 'Test course description',
        code: `NEW-${Date.now()}`,
        instructorId: testInstructorId,
        level: 'intermediate',
        category: 'Development',
        credits: 4,
        duration: 60,
        modules: [],
        learningObjectives: ['Objective 1'],
        prerequisites: [],
        status: 'draft',
        constitutionalScore: 0,
      });

      expect(course).toBeDefined();
      expect(course.id).toBeDefined();
      expect(course.title).toBe('New Course');
      expect(course.version).toBe(1);
      expect(course.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error if database not connected', async () => {
      await azoraDatabase.disconnect();
      await expect(
        contentManagementSystem.createCourse({
          title: 'Test',
          description: 'Test',
          code: 'TEST',
          instructorId: testInstructorId,
          level: 'beginner',
          category: 'Test',
          credits: 3,
          duration: 40,
          modules: [],
          learningObjectives: [],
          prerequisites: [],
          status: 'draft',
          constitutionalScore: 0,
        })
      ).rejects.toThrow('Database not connected');
      await connectAzoraDatabase();
    });
  });

  describe('updateCourse', () => {
    it('should update a course successfully', async () => {
      const updated = await contentManagementSystem.updateCourse(
        testCourse.id,
        { title: 'Updated Course Title', description: 'Updated description' },
        testInstructorId,
        ['Updated title', 'Updated description']
      );

      expect(updated.title).toBe('Updated Course Title');
      expect(updated.version).toBe(testCourse.version + 1);
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error if course not found', async () => {
      await expect(
        contentManagementSystem.updateCourse(
          'non-existent',
          { title: 'Test' },
          testInstructorId,
          []
        )
      ).rejects.toThrow('Course not found');
    });
  });

  describe('addModule', () => {
    it('should add a module to a course', async () => {
      const module = await contentManagementSystem.addModule(testCourse.id, {
        title: 'Test Module',
        description: 'Test module description',
        order: 1,
        type: 'video',
        content: [],
        resources: [],
        estimatedDuration: 30,
        prerequisites: [],
      });

      expect(module).toBeDefined();
      expect(module.id).toBeDefined();
      expect(module.courseId).toBe(testCourse.id);
      expect(module.title).toBe('Test Module');

      // Verify module was added to course
      const updatedCourse = await contentManagementSystem.getCourse(testCourse.id);
      expect(updatedCourse?.modules.length).toBeGreaterThan(0);
    });

    it('should throw error if course not found', async () => {
      await expect(
        contentManagementSystem.addModule('non-existent', {
          title: 'Test',
          description: 'Test',
          order: 1,
          type: 'video',
          content: [],
          resources: [],
          estimatedDuration: 30,
          prerequisites: [],
        })
      ).rejects.toThrow('Course not found');
    });
  });

  describe('publishCourse', () => {
    it('should publish a course after vetting', async () => {
      // First add a module to make it publishable
      await contentManagementSystem.addModule(testCourse.id, {
        title: 'Module 1',
        description: 'Module description',
        order: 1,
        type: 'video',
        content: [],
        resources: [],
        estimatedDuration: 30,
        prerequisites: [],
      });

      const published = await contentManagementSystem.publishCourse(testCourse.id, testInstructorId);

      expect(published.status).toBe('published');
      expect(published.publishedAt).toBeInstanceOf(Date);
      expect(published.constitutionalScore).toBeGreaterThanOrEqual(0);
    });

    it('should reject publishing if vetting fails', async () => {
      // Create a course with poor content
      const poorCourse = await contentManagementSystem.createCourse({
        title: 'Bad',
        description: 'Bad',
        code: `BAD-${Date.now()}`,
        instructorId: testInstructorId,
        level: 'beginner',
        category: 'Test',
        credits: 3,
        duration: 40,
        modules: [],
        learningObjectives: [], // Missing objectives
        prerequisites: [],
        status: 'draft',
        constitutionalScore: 0,
      });

      await expect(
        contentManagementSystem.publishCourse(poorCourse.id, testInstructorId)
      ).rejects.toThrow('Course cannot be published');
    });
  });

  describe('vetContent', () => {
    it('should vet content and return score', async () => {
      const result = await contentManagementSystem.vetContent(testCourse.id, 'course');

      expect(result).toBeDefined();
      expect(result.constitutionalScore).toBeGreaterThanOrEqual(0);
      expect(result.constitutionalScore).toBeLessThanOrEqual(100);
      expect(result.alignment).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.approved).toBeDefined();
    });

    it('should cache vetting results', async () => {
      const result1 = await contentManagementSystem.vetContent(testCourse.id, 'course');
      const result2 = await contentManagementSystem.vetContent(testCourse.id, 'course');

      expect(result1.constitutionalScore).toBe(result2.constitutionalScore);
    });
  });

  describe('addResource', () => {
    it('should add a resource to library', async () => {
      const resource = await contentManagementSystem.addResource({
        title: 'Test Resource',
        type: 'pdf',
        url: 'https://example.com/resource.pdf',
        description: 'Test resource',
        constitutionallyVetted: false,
      });

      expect(resource).toBeDefined();
      expect(resource.id).toBeDefined();
      expect(resource.title).toBe('Test Resource');
      // Should auto-vet if not vetted
      expect(resource.constitutionallyVetted).toBeDefined();
    });
  });

  describe('searchCourses', () => {
    it('should search courses by title', async () => {
      const results = await contentManagementSystem.searchCourses('Test Course');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.title.includes('Test Course'))).toBe(true);
    });

    it('should search courses by code', async () => {
      const results = await contentManagementSystem.searchCourses(testCourse.code);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.code === testCourse.code)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await contentManagementSystem.searchCourses('NonExistentCourse12345');

      expect(results.length).toBe(0);
    });
  });

  describe('getContentLibrary', () => {
    it('should return content library', async () => {
      const library = await contentManagementSystem.getContentLibrary();

      expect(library).toBeDefined();
      expect(library.courses).toBeDefined();
      expect(library.resources).toBeDefined();
      expect(library.categories).toBeDefined();
      expect(Array.isArray(library.courses)).toBe(true);
      expect(Array.isArray(library.resources)).toBe(true);
    });
  });

  describe('version control', () => {
    it('should track version history', async () => {
      await contentManagementSystem.updateCourse(
        testCourse.id,
        { title: 'Version 2' },
        testInstructorId,
        ['Changed title']
      );

      const versions = contentManagementSystem.getVersions(testCourse.id);

      expect(versions.length).toBeGreaterThan(1);
      expect(versions[versions.length - 1].changes).toContain('Changed title');
    });
  });
});
