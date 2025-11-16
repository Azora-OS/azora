# Azora Kiro IDE Integration - Design Document

## Overview

The Azora Kiro IDE Integration provides a VS Code extension that brings spec-driven development workflow directly into the IDE. The system consists of three main components: the VS Code extension (client), the Kiro IDE Bridge service (backend), and integration with existing Azora services. The extension parses markdown task files, visualizes progress hierarchically, enables real-time collaboration, and integrates with AI agents for automatic task updates.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code IDE                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Azora Kiro IDE Extension                     │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────┐   │   │
│  │  │ Task Tree    │ │ Progress     │ │ Dashboard  │   │   │
│  │  │ View         │ │ Tracker      │ │ Webview    │   │   │
│  │  └──────────────┘ └──────────────┘ └────────────┘   │   │
│  │         ↓                ↓                ↓           │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │    Extension Core Services                   │   │   │
│  │  │  • Markdown Parser                           │   │   │
│  │  │  • File Watcher                              │   │   │
│  │  │  • State Manager                             │   │   │
│  │  │  • WebSocket Client                          │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Kiro IDE Bridge Service                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    API Layer                                         │   │
│  │  • Authentication (JWT)                             │   │
│  │  • Task Management                                  │   │
│  │  • Progress Calculation                             │   │
│  │  • Authorization                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Real-time Layer                                   │   │
│  │  • WebSocket Server                                 │   │
│  │  • Event Broadcasting                               │   │
│  │  • Conflict Resolution                              │   │
│  │  • Session Management                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Data Layer                                        │   │
│  │  • File System Access                               │   │
│  │  • Cache Management                                 │   │
│  │  • Persistence                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Azora Services Integration                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │ Auth Service │ │ Sapiens AI   │ │ Other Services   │    │
│  └──────────────┘ └──────────────┘ └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. VS Code Extension Components

#### Task Tree View Provider
- **Purpose**: Display hierarchical task structure in sidebar
- **Responsibilities**:
  - Parse markdown task files
  - Build tree data structure
  - Handle tree item selection
  - Manage expand/collapse state
- **Interfaces**:
  - `TreeDataProvider<TaskItem>`
  - `TreeItem` with icons, labels, descriptions

#### Markdown Parser
- **Purpose**: Parse `.kiro/specs/*/tasks.md` files
- **Responsibilities**:
  - Extract task structure from markdown
  - Parse checkbox states
  - Extract task metadata (priority, requirements)
  - Handle nested tasks
- **Output**: `Task[]` array with hierarchy

#### File Watcher
- **Purpose**: Monitor task files for external changes
- **Responsibilities**:
  - Watch `.kiro/specs/**/tasks.md` files
  - Detect file changes
  - Trigger parser and UI refresh
  - Handle file deletions

#### Progress Tracker
- **Purpose**: Calculate completion metrics
- **Responsibilities**:
  - Calculate phase completion percentages
  - Calculate overall project progress
  - Identify critical path
  - Detect blockers
- **Calculations**:
  - Phase Progress = (Completed Tasks / Total Tasks) × 100
  - Overall Progress = (Total Completed / Total Tasks) × 100
  - Exclude optional tasks (marked with *) from calculations

#### WebSocket Client
- **Purpose**: Real-time communication with bridge service
- **Responsibilities**:
  - Establish WebSocket connection
  - Send task updates
  - Receive broadcast events
  - Handle reconnection
  - Queue offline updates

#### State Manager
- **Purpose**: Manage extension state and caching
- **Responsibilities**:
  - Cache task data locally
  - Manage UI state
  - Handle offline mode
  - Sync state with server

### 2. Kiro IDE Bridge Service Components

#### Authentication Middleware
- **Purpose**: Validate JWT tokens and manage sessions
- **Responsibilities**:
  - Validate JWT tokens
  - Extract user information
  - Check authorization
  - Manage token refresh

#### Task Management API
- **Endpoints**:
  - `GET /api/tasks` - List all tasks
  - `GET /api/tasks/:id` - Get task details
  - `PUT /api/tasks/:id` - Update task status
  - `POST /api/tasks` - Create new task
  - `DELETE /api/tasks/:id` - Delete task
- **Responsibilities**:
  - Validate task data
  - Update task files
  - Calculate progress
  - Emit events

#### Progress Calculation Engine
- **Purpose**: Calculate and cache progress metrics
- **Responsibilities**:
  - Parse all task files
  - Calculate phase progress
  - Identify critical path
  - Detect blockers
  - Cache results (5-minute TTL)

#### WebSocket Server
- **Purpose**: Handle real-time connections and events
- **Responsibilities**:
  - Manage client connections
  - Broadcast task updates
  - Handle conflict resolution
  - Maintain session state
- **Events**:
  - `task_updated` - Task status changed
  - `task_created` - New task created
  - `task_deleted` - Task deleted
  - `progress_updated` - Progress metrics changed
  - `user_joined` - User connected
  - `user_left` - User disconnected

#### Conflict Resolution Engine
- **Purpose**: Handle simultaneous edits
- **Strategy**: Last-write-wins with notification
- **Responsibilities**:
  - Detect conflicts
  - Apply resolution strategy
  - Notify affected clients
  - Log conflicts

## Data Models

### Task Model

```typescript
interface Task {
  id: string;                    // Unique identifier
  phase: string;                 // Phase name
  description: string;           // Task description
  completed: boolean;            // Completion status
  optional: boolean;             // Optional task (marked with *)
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  filePath: string;              // Path to task file
  lineNumber: number;            // Line in file
  parentId?: string;             // Parent task ID
  subtasks: Task[];              // Child tasks
  requirements: string[];        // Related requirements
  assignee?: string;             // Assigned user
  blockedReason?: string;        // Reason if blocked
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;        // User who last modified
}
```

### Progress Model

```typescript
interface ProgressMetrics {
  totalTasks: number;
  completedTasks: number;
  optionalTasks: number;
  completedOptional: number;
  overallProgress: number;       // Percentage
  phases: PhaseProgress[];
  criticalPath: Task[];
  blockers: BlockerAlert[];
  estimatedCompletion: Date;
  velocity: number;              // Tasks per day
}

interface PhaseProgress {
  phase: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;              // Percentage
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'on_track' | 'at_risk' | 'behind';
}

interface BlockerAlert {
  taskId: string;
  taskDescription: string;
  reason: string;
  blockedSince: Date;
  assignee: string;
}
```

### User Session Model

```typescript
interface UserSession {
  userId: string;
  sessionId: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  connectedAt: Date;
  lastActivity: Date;
  permissions: string[];
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  filterPriority?: string[];
  filterStatus?: string[];
}
```

## Error Handling

### Error Categories

1. **Authentication Errors** (401)
   - Invalid token
   - Expired token
   - Missing credentials

2. **Authorization Errors** (403)
   - Insufficient permissions
   - Task access denied

3. **Validation Errors** (400)
   - Invalid task data
   - Missing required fields
   - Invalid priority/status

4. **Not Found Errors** (404)
   - Task not found
   - File not found

5. **Conflict Errors** (409)
   - Simultaneous edits
   - Version mismatch

6. **Server Errors** (500)
   - Database errors
   - File system errors
   - Service unavailable

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: Date;
}
```

## Testing Strategy

### Unit Tests
- Markdown parser accuracy
- Progress calculation correctness
- State management logic
- Conflict resolution algorithm

### Integration Tests
- Extension ↔ Bridge communication
- WebSocket event broadcasting
- File system operations
- Cache synchronization

### E2E Tests
- Complete task workflow
- Real-time collaboration
- Offline/online transitions
- Authentication flow

### Performance Tests
- Parser performance (< 500ms for 100 tasks)
- WebSocket latency (< 100ms)
- UI responsiveness (60 FPS)
- Memory usage (< 50MB)

## UI/UX Design

### Task Tree View
```
KIRO TASKS
├─ 📊 Progress: 31/100 (31%)
│  ████████░░░░░░░░░░░░░░░░░░
├─ ✅ Phase 1: Observability (20/20)
├─ 🚨 Phase 2: AI Integration (1/8)
│  ├─ [x] Install OpenAI SDK
│  ├─ [ ] Create AI wrapper
│  └─ [ ] Personality engine
├─ ⚠️ Phase 3: Financial (0/8)
└─ ⚠️ Phase 4: Blockchain (0/7)
```

### Progress Dashboard
- Overall completion bar
- Phase breakdown with status indicators
- Critical path highlighting
- Timeline estimates
- Blocker alerts

### Task Detail Panel
- Task description and metadata
- Related requirements
- File location and line number
- Dependencies and blockers
- Action buttons (Mark Complete, Jump to File)

## Security Design

### Authentication
- JWT token-based authentication
- Token refresh mechanism
- Session timeout (24 hours)
- Secure token storage in VS Code keychain

### Authorization
- Role-based access control (admin, developer, viewer)
- Task-level permissions
- Read-only mode for unauthorized users
- Audit logging of all modifications

### Data Protection
- HTTPS/WSS for all communication
- Token validation on every request
- Input validation and sanitization
- Rate limiting (1000 requests/15 minutes)

## Performance Optimization

### Caching Strategy
- Task data cached locally (5-minute TTL)
- Progress metrics cached (1-minute TTL)
- User preferences cached (session duration)
- Offline cache in VS Code storage

### Lazy Loading
- Tasks loaded on demand
- Phases expanded on click
- Dashboard loaded in webview
- Large files loaded progressively

### Resource Management
- WebSocket connection pooling
- Request debouncing (300ms)
- Memory cleanup for large datasets
- Background task processing

## Deployment Architecture

### Development
- Local bridge service on port 4100
- Hot reload for extension changes
- Mock data for testing
- Debug logging enabled

### Production
- Containerized bridge service
- Load balancer for scaling
- CDN for static assets
- Comprehensive monitoring and alerting
