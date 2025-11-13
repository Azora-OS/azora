#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class DocumentationService {
  constructor() {
    this.docs = new Map();
    this.guides = new Map();
    this.apis = new Map();
    this.initDocs();
  }

  initDocs() {
    this.docs.set('api-reference', {
      id: 'api-reference',
      title: 'Azora OS API Reference',
      type: 'api',
      content: 'Complete API documentation for all 20 services',
      lastUpdated: new Date()
    });

    this.guides.set('deployment', {
      id: 'deployment',
      title: 'Deployment Guide',
      type: 'guide',
      steps: ['Setup', 'Configuration', 'Deploy', 'Monitor'],
      difficulty: 'intermediate'
    });
  }

  generateAPIDoc(serviceName, endpoints) {
    const doc = {
      id: `api_${Date.now()}`,
      serviceName,
      endpoints: endpoints.map(ep => ({
        method: ep.method,
        path: ep.path,
        description: ep.description,
        parameters: ep.parameters || [],
        responses: ep.responses || {}
      })),
      generatedAt: new Date()
    };
    this.apis.set(doc.id, doc);
    return doc;
  }

  createGuide(title, content, type = 'tutorial') {
    const guide = {
      id: `guide_${Date.now()}`,
      title,
      content,
      type,
      sections: content.split('\n## ').length,
      createdAt: new Date()
    };
    this.guides.set(guide.id, guide);
    return guide;
  }

  searchDocs(query) {
    const results = [];
    for (const [id, doc] of this.docs) {
      if (doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.content.toLowerCase().includes(query.toLowerCase())) {
        results.push(doc);
      }
    }
    return results;
  }
}

const docService = new DocumentationService();

app.get('/api/docs', (req, res) => {
  res.json({ success: true, data: Array.from(docService.docs.values()) });
});

app.get('/api/guides', (req, res) => {
  res.json({ success: true, data: Array.from(docService.guides.values()) });
});

app.post('/api/docs/generate', (req, res) => {
  try {
    const { serviceName, endpoints } = req.body;
    const doc = docService.generateAPIDoc(serviceName, endpoints);
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/guides/create', (req, res) => {
  try {
    const { title, content, type } = req.body;
    const guide = docService.createGuide(title, content, type);
    res.json({ success: true, data: guide });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = docService.searchDocs(q);
  res.json({ success: true, data: results });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Documentation Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: { docs: docService.docs.size, guides: docService.guides.size },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4026;
app.listen(PORT, () => {
  console.log(`📚 Documentation Service running on port ${PORT}`);
});

module.exports = app;