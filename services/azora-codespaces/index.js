import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import Docker from 'dockerode';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as integrations from './integrations.js';

const app = express();
app.set('trust proxy', true);

const server = createServer(app);
const wss = new WebSocketServer({ server });
const docker = new Docker();
const PORT = process.env.PORT || 4200;
const JWT_SECRET = process.env.JWT_SECRET || 'azora-codespaces-secret';
const ELARA_API = process.env.ELARA_API || 'http://localhost:3006';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.on('error', err => console.log('Redis error:', err));
await redis.connect();

const workspaces = new Map();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/workspaces', authMiddleware, async (req, res) => {
  try {
    const { name, template, resources } = req.body;
    const workspaceId = uuidv4();
    
    const container = await docker.createContainer({
      Image: template || 'codercom/code-server:latest',
      name: `azora-workspace-${workspaceId}`,
      Env: [
        `PASSWORD=${uuidv4()}`,
        `SUDO_PASSWORD=${uuidv4()}`,
        `USER_ID=${req.user.id}`
      ],
      ExposedPorts: { '8080/tcp': {} },
      HostConfig: {
        Memory: resources?.memory || 2147483648,
        CpuShares: resources?.cpu || 1024,
        PortBindings: { '8080/tcp': [{ HostPort: '0' }] }
      }
    });

    await container.start();
    const info = await container.inspect();
    const port = info.NetworkSettings.Ports['8080/tcp'][0].HostPort;

    const workspace = {
      id: workspaceId,
      name,
      userId: req.user.id,
      containerId: container.id,
      port,
      status: 'running',
      createdAt: new Date(),
      url: `http://localhost:${port}`
    };

    workspaces.set(workspaceId, workspace);
    await redis.set(`workspace:${workspaceId}`, JSON.stringify(workspace), { EX: 86400 });

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces', authMiddleware, async (req, res) => {
  try {
    const keys = await redis.keys(`workspace:*`);
    const workspaces = await Promise.all(
      keys.map(async k => JSON.parse(await redis.get(k)))
    );
    res.json(workspaces.filter(w => w.userId === req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:id', authMiddleware, async (req, res) => {
  try {
    const workspace = JSON.parse(await redis.get(`workspace:${req.params.id}`));
    if (!workspace || workspace.userId !== req.user.id) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workspaces/:id', authMiddleware, async (req, res) => {
  try {
    const workspace = JSON.parse(await redis.get(`workspace:${req.params.id}`));
    if (!workspace || workspace.userId !== req.user.id) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const container = docker.getContainer(workspace.containerId);
    await container.stop();
    await container.remove();
    await redis.del(`workspace:${req.params.id}`);
    workspaces.delete(req.params.id);

    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:id/sync', authMiddleware, async (req, res) => {
  try {
    const { files } = req.body;
    await redis.set(`workspace:${req.params.id}:sync`, JSON.stringify(files), { EX: 3600 });
    res.json({ message: 'Synced', count: files.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:id/elara', authMiddleware, async (req, res) => {
  try {
    const { query, context } = req.body;
    const response = await axios.post(`${ELARA_API}/api/assist`, {
      query,
      context,
      workspaceId: req.params.id
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collaborate/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = uuidv4();
    await redis.set(`collab:${sessionId}`, JSON.stringify({
      workspaceId: req.params.workspaceId,
      users: [req.user.id, userId],
      createdAt: new Date()
    }), { EX: 7200 });
    res.json({ sessionId, url: `/collaborate/${sessionId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:id/git/clone', authMiddleware, async (req, res) => {
  try {
    const result = await integrations.gitIntegration.cloneRepo(req.params.id, req.body.repoUrl, req.body.token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:id/jupyter', authMiddleware, async (req, res) => {
  try {
    const result = await integrations.jupyterIntegration.createNotebook(req.params.id, req.body.name);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:id/database', authMiddleware, async (req, res) => {
  try {
    const result = await integrations.databaseIntegration.createDatabase(req.params.id, req.body.type);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:id/video', authMiddleware, async (req, res) => {
  try {
    const result = await integrations.jitsiIntegration.createRoom(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/integrations', authMiddleware, (req, res) => {
  res.json({
    available: [
      { name: 'Git', type: 'git', icon: '🔥' },
      { name: 'Jupyter', type: 'jupyter', icon: '📝' },
      { name: 'PostgreSQL', type: 'postgres', icon: '🗄️' },
      { name: 'MySQL', type: 'mysql', icon: '🗄️' },
      { name: 'Jitsi Video', type: 'jitsi', icon: '🔊' },
      { name: 'Portainer', type: 'portainer', icon: '🐳' },
      { name: 'Grafana', type: 'grafana', icon: '📊' },
      { name: 'SonarQube', type: 'sonar', icon: '🔍' },
      { name: 'Jenkins', type: 'jenkins', icon: '🚀' },
      { name: 'Vault', type: 'vault', icon: '🔐' },
      { name: 'MinIO', type: 'minio', icon: '📡' },
      { name: 'Selenium', type: 'selenium', icon: '🧪' },
      { name: 'Gitea', type: 'gitea', icon: '📚' },
      { name: 'Draw.io', type: 'drawio', icon: '🎨' },
      { name: 'Metabase', type: 'metabase', icon: '📊' },
      { name: 'n8n', type: 'n8n', icon: '🔧' },
      { name: 'Adminer', type: 'adminer', icon: '🐘' },
      { name: 'Elasticsearch', type: 'elasticsearch', icon: '🔍' },
      { name: 'Mailhog', type: 'mailhog', icon: '📨' },
      { name: 'Keycloak', type: 'keycloak', icon: '🔐' }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-codespaces',
    ubuntu: 'I code because we create',
    workspaces: workspaces.size,
    timestamp: new Date()
  });
});

wss.on('connection', (ws, req) => {
  const workspaceId = new URL(req.url, 'http://localhost').searchParams.get('workspace');
  
  ws.on('message', async (data) => {
    const msg = JSON.parse(data);
    
    if (msg.type === 'edit') {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      });
    }
    
    if (msg.type === 'cursor') {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Azora Codespaces running on port ${PORT}`);
  console.log(`💎 Ubuntu: "I code because we create"`);
});
