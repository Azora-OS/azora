/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface App {
  id: string;
  name: string;
  developer: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
}

const apps: App[] = [];

app.post('/api/v1/marketplace/apps', (req, res) => {
  const app: App = {
    id: `APP-${Date.now()}`,
    ...req.body,
    rating: 0,
    downloads: 0
  };
  apps.push(app);
  res.json({ success: true, app });
});

app.get('/api/v1/marketplace/apps', (req, res) => {
  const { category, search } = req.query;
  let filtered = apps;
  
  if (category) filtered = filtered.filter(a => a.category === category);
  if (search) filtered = filtered.filter(a => a.name.toLowerCase().includes((search as string).toLowerCase()));
  
  res.json({ success: true, apps: filtered });
});

app.get('/api/v1/marketplace/apps/:id', (req, res) => {
  const app = apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'App not found' });
  res.json({ success: true, app });
});

app.post('/api/v1/marketplace/apps/:id/purchase', (req, res) => {
  const app = apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'App not found' });
  
  app.downloads++;
  res.json({ success: true, message: 'Purchase successful', app });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'marketplace', apps: apps.length });
});

const PORT = process.env.PORT || 4600;
app.listen(PORT, () => console.log(`🛒 Marketplace Service on port ${PORT}`));
