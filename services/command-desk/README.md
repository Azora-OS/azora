# Command Desk Service

Central message hub for agent communication and task coordination in Azora ecosystem.

## Features

### ✅ Implemented
- **Message Queue**: Store and retrieve agent messages
- **Task Coordination**: Facilitate agent-to-agent communication
- **Status Updates**: Track task and agent status changes
- **Result Aggregation**: Collect and organize task results
- **Message History**: Query historical messages

## API Endpoints

### Messages
- `POST /messages` - Send a new message
- `GET /messages?limit=50` - Get recent messages
- `GET /messages/:id` - Get specific message
- `GET /health` - Health check

## Usage

```typescript
// Send task message
await fetch('http://localhost:4005/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'task',
    content: {
      action: 'process',
      taskId: 'task-123',
      agentId: 'agent-1',
      data: { /* task data */ }
    }
  })
});

// Send status update
await fetch('http://localhost:4005/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'status',
    content: {
      taskId: 'task-123',
      status: 'in-progress',
      progress: 50
    }
  })
});

// Send result
await fetch('http://localhost:4005/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'result',
    content: {
      taskId: 'task-123',
      success: true,
      output: { /* result data */ }
    }
  })
});

// Get recent messages
const messages = await fetch('http://localhost:4005/messages?limit=100');
```

## Message Types

### Task Messages
```typescript
{
  type: 'task',
  content: {
    action: string,
    taskId: string,
    agentId: string,
    data: any
  }
}
```

### Status Messages
```typescript
{
  type: 'status',
  content: {
    taskId: string,
    status: 'pending' | 'in-progress' | 'completed' | 'failed',
    progress?: number,
    message?: string
  }
}
```

### Result Messages
```typescript
{
  type: 'result',
  content: {
    taskId: string,
    success: boolean,
    output?: any,
    error?: string
  }
}
```

## Integration with Agent Execution

Command Desk works with Agent Execution service:

```typescript
// Agent sends task via Command Desk
await fetch('http://localhost:4005/messages', {
  method: 'POST',
  body: JSON.stringify({
    type: 'task',
    content: { taskId: 'task-1', action: 'execute' }
  })
});

// Agent Execution picks up task
const messages = await fetch('http://localhost:4005/messages?limit=10');

// Agent Execution sends status updates
await fetch('http://localhost:4005/messages', {
  method: 'POST',
  body: JSON.stringify({
    type: 'status',
    content: { taskId: 'task-1', status: 'in-progress' }
  })
});

// Agent Execution sends result
await fetch('http://localhost:4005/messages', {
  method: 'POST',
  body: JSON.stringify({
    type: 'result',
    content: { taskId: 'task-1', success: true, output: {} }
  })
});
```

## Constitutional Compliance

Per Azora Constitution Article V:
- **Transparency**: All messages logged and auditable
- **Privacy**: No PII in message content
- **Accountability**: Message history for audit trail
- **Ubuntu Philosophy**: Facilitates collaborative agent work

## Environment Variables

```bash
PORT=4005
MAX_MESSAGES=10000
LOG_LEVEL=info
```

## Development

```bash
npm install
npm run dev
npm test
```

## Architecture

```
CommandDesk
├── Message Queue (in-memory, upgradeable to Redis)
├── Message Router (type-based routing)
├── History Manager (message retention)
└── Health Monitor (service status)
```

## Future Enhancements

- [ ] Redis-backed message queue for persistence
- [ ] WebSocket support for real-time updates
- [ ] Message filtering and search
- [ ] Priority queues for urgent tasks
- [ ] Message expiration and cleanup
- [ ] Integration with EventBus for pub/sub

---

**Built with Ubuntu Philosophy**: Individual work strengthens collective foundation
