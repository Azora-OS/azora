#!/bin/bash

# Specialized services with custom schemas

# Messaging Service
mkdir -p messaging-service/prisma
cat > messaging-service/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Message {
  id        String   @id @default(uuid())
  from      String
  to        String
  content   String
  read      Boolean  @default(false)
  sentAt    DateTime @default(now())

  @@index([from])
  @@index([to])
  @@map("messages")
}
EOF

cat > messaging-service/index.js << 'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3046;
const messages = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'messaging-service', messages: messages.length });
});

app.post('/api/messages', (req, res) => {
  const { from, to, content } = req.body;
  const message = { id: Date.now().toString(), from, to, content, read: false, sentAt: new Date() };
  messages.push(message);
  res.json({ success: true, message });
});

app.get('/api/messages/:userId', (req, res) => {
  const userMessages = messages.filter(m => m.to === req.params.userId || m.from === req.params.userId);
  res.json({ success: true, messages: userMessages });
});

app.patch('/api/messages/:id/read', (req, res) => {
  const message = messages.find(m => m.id === req.params.id);
  if (!message) return res.status(404).json({ error: 'Not found' });
  message.read = true;
  res.json({ success: true, message });
});

app.listen(port, () => console.log(`Messaging Service on port ${port}`));
module.exports = app;
EOF

# Queue Service
mkdir -p queue-service/prisma
cat > queue-service/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Job {
  id        String   @id @default(uuid())
  queue     String
  data      String
  status    String   @default("pending")
  attempts  Int      @default(0)
  createdAt DateTime @default(now())
  processedAt DateTime?

  @@index([queue])
  @@index([status])
  @@map("jobs")
}
EOF

cat > queue-service/index.js << 'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3047;
const jobs = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'queue-service', jobs: jobs.length });
});

app.post('/api/jobs', (req, res) => {
  const { queue, data } = req.body;
  const job = { id: Date.now().toString(), queue, data: JSON.stringify(data), status: 'pending', attempts: 0, createdAt: new Date() };
  jobs.push(job);
  res.json({ success: true, job });
});

app.get('/api/jobs/:queue', (req, res) => {
  const queueJobs = jobs.filter(j => j.queue === req.params.queue);
  res.json({ success: true, jobs: queueJobs });
});

app.patch('/api/jobs/:id/process', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = 'processing';
  job.attempts++;
  res.json({ success: true, job });
});

app.patch('/api/jobs/:id/complete', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = 'completed';
  job.processedAt = new Date();
  res.json({ success: true, job });
});

app.listen(port, () => console.log(`Queue Service on port ${port}`));
module.exports = app;
EOF

# Monitoring Service
mkdir -p monitoring-service/prisma
cat > monitoring-service/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Alert {
  id        String   @id @default(uuid())
  service   String
  severity  String
  message   String
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
  resolvedAt DateTime?

  @@index([service])
  @@index([severity])
  @@map("alerts")
}
EOF

cat > monitoring-service/index.js << 'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3048;
const alerts = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'monitoring-service', alerts: alerts.length });
});

app.post('/api/alerts', (req, res) => {
  const { service, severity, message } = req.body;
  const alert = { id: Date.now().toString(), service, severity, message, resolved: false, createdAt: new Date() };
  alerts.push(alert);
  res.json({ success: true, alert });
});

app.get('/api/alerts', (req, res) => {
  const { service, severity, resolved } = req.query;
  let filtered = alerts;
  if (service) filtered = filtered.filter(a => a.service === service);
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (resolved !== undefined) filtered = filtered.filter(a => a.resolved === (resolved === 'true'));
  res.json({ success: true, alerts: filtered });
});

app.patch('/api/alerts/:id/resolve', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Not found' });
  alert.resolved = true;
  alert.resolvedAt = new Date();
  res.json({ success: true, alert });
});

app.listen(port, () => console.log(`Monitoring Service on port ${port}`));
module.exports = app;
EOF

# Create package.json for all
for service in messaging-service queue-service monitoring-service; do
  cat > "$service/package.json" << EOF
{
  "name": "$service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "@prisma/client": "^5.7.1"
  },
  "devDependencies": {
    "prisma": "^5.7.1"
  }
}
EOF
done

echo "✅ 3 specialized services complete"
