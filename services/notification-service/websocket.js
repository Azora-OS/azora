const WebSocket = require('ws');

class NotificationWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    
    this.wss.on('connection', (ws, req) => {
      const userId = new URL(req.url, 'http://localhost').searchParams.get('userId');
      
      if (userId) {
        this.clients.set(userId, ws);
        console.log(`User ${userId} connected`);
        
        ws.send(JSON.stringify({ type: 'connected', userId }));
      }
      
      ws.on('close', () => {
        if (userId) {
          this.clients.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  }
  
  sendToUser(userId, notification) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
      return true;
    }
    return false;
  }
  
  broadcast(notification) {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(notification));
      }
    });
  }
}

module.exports = NotificationWebSocket;
