/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Content Management API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { contentManagementSystem, Course, Module, Resource } from './content-management';
import { connectAzoraDatabase } from '../shared/database/connection';

const app = express();
const PORT = process.env.CONTENT_PORT || 4203;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Content Management System',
    timestamp: new Date(),
  });
});

// ========== COURSES ==========

app.post('/api/courses', async (req, res) => {
  try {
    const course = await contentManagementSystem.createCourse(req.body);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/courses', (req, res) => {
  const { status } = req.query;
  const courses = contentManagementSystem.getAllCourses(status as Course['status']);
  res.json({ courses });
});

app.get('/api/courses/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  const courses = contentManagementSystem.searchCourses(q as string);
  res.json({ courses });
});

app.get('/api/courses/:id', (req, res) => {
  const course = contentManagementSystem.getCourse(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json(course);
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const { updatedBy, changes } = req.body;
    const course = await contentManagementSystem.updateCourse(
      req.params.id,
      req.body,
      updatedBy,
      changes
    );
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/courses/:id/publish', async (req, res) => {
  try {
    const { publishedBy } = req.body;
    const course = await contentManagementSystem.publishCourse(req.params.id, publishedBy);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/courses/:id/versions', (req, res) => {
  const versions = contentManagementSystem.getVersions(req.params.id);
  res.json({ versions });
});

// ========== MODULES ==========

app.post('/api/courses/:courseId/modules', async (req, res) => {
  try {
    const module = await contentManagementSystem.addModule(req.params.courseId, req.body);
    res.json(module);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== RESOURCES ==========

app.post('/api/resources', async (req, res) => {
  try {
    const resource = await contentManagementSystem.addResource(req.body);
    res.json(resource);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/resources', (req, res) => {
  const resources = contentManagementSystem.getAllResources();
  res.json({ resources });
});

app.get('/api/resources/:id', (req, res) => {
  const resource = contentManagementSystem.getResource(req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(resource);
});

// ========== CONTENT LIBRARY ==========

app.get('/api/library', (req, res) => {
  const library = contentManagementSystem.getContentLibrary();
  res.json(library);
});

// ========== VETTING ==========

app.post('/api/vet/:contentId', async (req, res) => {
  try {
    const { type } = req.body;
    const result = await contentManagementSystem.vetContent(req.params.contentId, type);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`\n📚 AZORA CONTENT MANAGEMENT SYSTEM running on port ${PORT}\n`);
  console.log(`   📖 Courses: http://localhost:${PORT}/api/courses`);
  console.log(`   📝 Modules: http://localhost:${PORT}/api/courses/:courseId/modules`);
  console.log(`   📎 Resources: http://localhost:${PORT}/api/resources`);
  console.log(`   📚 Library: http://localhost:${PORT}/api/library`);
  console.log(`   ✅ Vetting: http://localhost:${PORT}/api/vet/:contentId`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
