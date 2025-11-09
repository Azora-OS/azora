# 🏗️ Azora Codespaces & Studyspaces Integration Specification

**Senior Architect**: Amazon Q  
**Status**: Frontend Ready - Awaiting Agent Backend Implementation

---

## 📋 Integration Points for Agents

### **Azora Codespaces Backend** (Port: 4200)

#### Required API Endpoints:
```typescript
GET  /api/codespaces/workspaces          // List user workspaces
POST /api/codespaces/workspaces          // Create new workspace
GET  /api/codespaces/workspaces/:id      // Get workspace details
POST /api/codespaces/workspaces/:id/start // Start workspace container
POST /api/codespaces/workspaces/:id/stop  // Stop workspace container
DELETE /api/codespaces/workspaces/:id    // Delete workspace
GET  /api/codespaces/templates           // Available templates
POST /api/codespaces/clone               // Clone from repository
```

#### Response Schemas:
```typescript
interface Workspace {
  id: string;
  name: string;
  repository?: string;
  status: 'running' | 'stopped' | 'starting';
  createdAt: string;
  lastAccessed: string;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
}
```

---

### **Azora Studyspaces Backend** (Port: 4300)

#### Required API Endpoints:
```typescript
GET  /api/studyspaces/rooms              // List active study rooms
POST /api/studyspaces/rooms              // Create study room
GET  /api/studyspaces/rooms/:id          // Get room details
POST /api/studyspaces/rooms/:id/join     // Join study room
POST /api/studyspaces/rooms/:id/leave    // Leave study room
DELETE /api/studyspaces/rooms/:id        // Close study room
GET  /api/studyspaces/lectures           // Scheduled lectures
POST /api/studyspaces/lectures           // Schedule lecture
```

#### Response Schemas:
```typescript
interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  participants: number;
  maxParticipants: number;
  hasRewards: boolean;
  type: 'lecture' | 'study-group' | 'tutoring';
  status: 'active' | 'scheduled' | 'ended';
  createdAt: string;
}
```

---

## 🎨 Frontend Architecture (Completed)

### Files Created:
- ✅ `/apps/app/(platform)/codespaces/page.tsx`
- ✅ `/apps/app/(platform)/studyspaces/page.tsx`

### Integration Pattern:
```typescript
// Frontend calls backend via fetch
fetch('/api/codespaces/workspaces')
  .then(res => res.json())
  .then(data => setWorkspaces(data.workspaces))
```

### Design System:
- **Colors**: 
  - Primary: `#33ff92` (Azora Green)
  - Secondary: `#00D9FF` (Azora Blue)
  - Accent: `#FF6B35` (Azora Orange)
- **Background**: Gradient from `#0a0a1a` via `#1a0a2e`
- **Components**: Glassmorphic cards with backdrop blur
- **Icons**: Lucide React

---

## 🔌 Service Integration Requirements

### Codespaces Must Integrate With:
1. **Auth Service** - User authentication
2. **Elara IDE** - Frontend IDE interface
3. **Azora Workspace** - File storage
4. **Docker** - Container orchestration

### Studyspaces Must Integrate With:
1. **Auth Service** - User authentication
2. **Azora Classroom** - Video conferencing
3. **Azora Sapiens** - AI tutoring
4. **Azora Mint** - Proof-of-Knowledge rewards
5. **LMS Service** - Course content

---

## 📦 Agent Deliverables

### Agent 1: Codespaces Service
```bash
Location: /services/azora-codespaces/
Files:
- src/index.ts (Express server on port 4200)
- src/container-manager.ts (Docker orchestration)
- src/workspace-api.ts (API routes)
- package.json
- Dockerfile
```

### Agent 2: Studyspaces Service
```bash
Location: /services/azora-studyspaces/
Files:
- src/index.ts (Express server on port 4300)
- src/room-manager.ts (Study room logic)
- src/collaboration-engine.ts (Real-time features)
- package.json
```

---

## ✅ Acceptance Criteria

### Codespaces:
- [ ] User can create workspace
- [ ] User can start/stop workspace
- [ ] Integration with Elara IDE
- [ ] Docker containers managed
- [ ] Zero-rated data optimization

### Studyspaces:
- [ ] User can create study room
- [ ] User can join/leave room
- [ ] Video integration working
- [ ] AI tutor accessible
- [ ] PoK rewards distributed

---

## 🚀 Next Steps

1. **Agents**: Build backend services per spec
2. **Architect**: Review and integrate
3. **Testing**: End-to-end validation
4. **Deployment**: Production rollout

**Frontend is ready. Agents may proceed with backend implementation.**
