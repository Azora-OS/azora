import { WebSocket } from 'ws';

interface Edit {
  userId: string;
  position: number;
  text: string;
  timestamp: number;
}

export class ThousandUserSync {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocket> = new Map();
  private documentState: string = '';
  private editQueue: Edit[] = [];

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port, perMessageDeflate: true });
    this.initServer();
  }

  private initServer() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const userId = req.headers['user-id'] as string || Math.random().toString(36);
      this.clients.set(userId, ws);

      ws.send(JSON.stringify({ type: 'init', state: this.documentState }));

      ws.on('message', (data: string) => {
        const edit: Edit = JSON.parse(data);
        this.applyEdit(edit);
        this.broadcast(edit, userId);
      });

      ws.on('close', () => this.clients.delete(userId));
    });
  }

  private applyEdit(edit: Edit) {
    this.editQueue.push(edit);
    const { position, text } = edit;
    this.documentState = this.documentState.slice(0, position) + text + this.documentState.slice(position);
  }

  private broadcast(edit: Edit, excludeUserId: string) {
    const message = JSON.stringify(edit);
    this.clients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  getActiveUsers(): number {
    return this.clients.size;
  }
}
