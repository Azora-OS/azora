// 🌐 Azora Nexus - Ubuntu Event Bus & Real-Time System
import express from 'express';
import { createServer } from 'http';
import { nexus, EventTypes } from './event-bus';
import { initializeWebSocket } from './websocket-server';
import { initializeDatabase } from '../database';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.NEXUS_PORT || 4001;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-nexus',
    timestamp: Date.now(),
    ubuntu: 'I am because we are'
  });
});

// Publish event endpoint
app.post('/events/publish', async (req, res) => {
  try {
    const event = await nexus.publish(req.body);
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

// Get event history
app.get('/events/history', (req, res) => {
  const { type, limit } = req.query;
  const history = nexus.getHistory(
    type as string,
    limit ? parseInt(limit as string) : 100
  );
  res.json({ events: history });
});

// Event types reference
app.get('/events/types', (req, res) => {
  res.json({ eventTypes: EventTypes });
});

// Initialize and start
async function start() {
  try {
    await initializeDatabase();
    initializeWebSocket(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`🌐 Azora Nexus running on port ${PORT}`);
      console.log('🫀 Event Bus: Active');
      console.log('🌐 WebSocket: Active');
      console.log('💾 Database: Connected');
      console.log('🛡️ Ubuntu Philosophy: Activated');
    });
  } catch (error) {
    console.error('❌ Failed to start Azora Nexus:', error);
    process.exit(1);
  }
}

start();

export { nexus, EventTypes };
export default app;
