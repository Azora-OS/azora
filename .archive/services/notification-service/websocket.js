const WebSocket = require('ws');

class NotificationWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.clients = new Map();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const userId = new URL(req.url, 'http://localhost').searchParams.get('userId');
      
      if (userId) {
        this.clients.set(userId, ws);
        console.log(`✅ User ${userId} connected`);
        
        ws.send(JSON.stringify({ type: 'connected', userId }));
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(userId, data, ws);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (userId) {
          this.clients.delete(userId);
          console.log(`❌ User ${userId} disconnected`);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  handleMessage(userId, data, ws) {
    if (data.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  }

  sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
      return true;
    }
    return false;
  }

  broadcast(notification) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }
}

module.exports = NotificationWebSocket;
