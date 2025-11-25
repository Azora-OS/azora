const express = require('express');
const knowledgeBase = require('./knowledge-base');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 4040;

app.use(express.json());

const knowledge = new Map();

// Load comprehensive knowledge base
function loadKnowledgeBase() {
  let count = 0;
  const load = (obj, path = []) => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      const id = currentPath.join('.');
      if (typeof value === 'string') {
        knowledge.set(id, { id, content: value, category: path[0] || 'general', path: currentPath, ts: Date.now() });
        count++;
      } else if (typeof value === 'object') {
        load(value, currentPath);
      }
    }
  };
  load(knowledgeBase);
  console.log(`📚 Loaded ${count} knowledge nodes from base`);
  
  // Generate massive knowledge in-memory
  try {
    console.log('🌊 Generating massive knowledge in-memory...');
    const massive = require('./massive-knowledge-seed');
    load(massive);
    console.log(`✅ Total: ${count} knowledge nodes`);
  } catch (error) {
    console.log('⚠️ Using base knowledge only');
  }
}

loadKnowledgeBase();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', nodes: knowledge.size });
});

app.post('/api/add', (req, res) => {
  const { id, content, links } = req.body;
  knowledge.set(id, { id, content, links: links || [], ts: Date.now() });
  res.json({ success: true, id });
});

app.get('/api/:id', (req, res) => {
  const node = knowledge.get(req.params.id);
  if (!node) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, node });
});

app.post('/api/search', (req, res) => {
  const { q, category, limit = 10 } = req.body;
  let results = Array.from(knowledge.values());
  
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(n => 
      n.content.toLowerCase().includes(query) || 
      n.id.toLowerCase().includes(query)
    );
  }
  
  if (category) {
    results = results.filter(n => n.category === category);
  }
  
  results = results.slice(0, limit);
  res.json({ success: true, count: results.length, results });
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(Array.from(knowledge.values()).map(n => n.category))];
  res.json({ success: true, categories });
});

app.get('/api/stats', (req, res) => {
  const stats = {
    totalNodes: knowledge.size,
    categories: {},
    sizeEstimate: JSON.stringify(Array.from(knowledge.values())).length
  };
  
  knowledge.forEach(node => {
    stats.categories[node.category] = (stats.categories[node.category] || 0) + 1;
  });
  
  res.json({ success: true, stats });
});

app.post('/api/ask', (req, res) => {
  const { question } = req.body;
  const query = question.toLowerCase();
  
  // Find relevant knowledge
  const relevant = Array.from(knowledge.values())
    .filter(n => {
      const content = n.content.toLowerCase();
      const id = n.id.toLowerCase();
      return content.includes(query) || id.includes(query) || 
             query.split(' ').some(word => content.includes(word) || id.includes(word));
    })
    .slice(0, 5);
  
  if (relevant.length === 0) {
    return res.json({ 
      success: true, 
      answer: "I don't have specific information about that. Try searching our knowledge base or ask a more specific question.",
      sources: []
    });
  }
  
  const answer = relevant.map(n => n.content).join(' ');
  res.json({ success: true, answer, sources: relevant.map(n => n.id) });
});

app.listen(port, () => {
  console.log(`🌊 Knowledge Ocean on port ${port}`);
  console.log(`📚 ${knowledge.size} knowledge nodes loaded`);
  console.log(`💾 Estimated size: ${(JSON.stringify(Array.from(knowledge.values())).length / 1024 / 1024).toFixed(2)} MB`);
});
