# AzStudio Architecture Blueprint

## System Overview

AzStudio is a multi-layered desktop IDE with constitutional AI orchestration, real-time chat, knowledge retrieval, and comprehensive security. The system is organized into 7 phases with 50+ backend services.

---

## 🏗️ Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│                      (React Components)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  ChatPanel   │  │ MonacoEditor │  │ VisualCanvas │          │
│  │ (streaming)  │  │ (syntax hl)  │  │ (React Flow) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │FileExplorer  │  │ EditorTabs   │  │ DiffViewer   │          │
│  │ (tree nav)   │  │ (multi-file) │  │ (side-by-side)          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    IPC BRIDGE LAYER                             │
│                   (28 Event Handlers)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Chat (7)          Orchestrator (5)     Security (9)           │
│  ├─ createSession  ├─ planTask          ├─ checkLicense        │
│  ├─ sendMessage    ├─ executeTask       ├─ getFeatures         │
│  ├─ streaming      ├─ verifyCode        ├─ setSecret           │
│  ├─ getSession     ├─ applyChanges      ├─ getSecret           │
│  ├─ listSessions   └─ rollback          ├─ requestPermission   │
│  ├─ archiveSession                      ├─ hasPermission       │
│  └─ updateContext                       ├─ getAuditLog         │
│                                         ├─ addToAllowlist      │
│                                         └─ removeFromAllowlist │
│                                                                 │
│  Other (7)                                                      │
│  ├─ project:index                                              │
│  ├─ fs:readFile                                                │
│  ├─ dialog:openFolder                                          │
│  └─ ... (file ops, git, deployment)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
│                  (Electron Main Process)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PHASE B: Constitutional AI                              │   │
│  │ ├─ ConstitutionalCore (System 2 reasoning)              │   │
│  │ ├─ Deterministic veto tracking                          │   │
│  │ └─ Fallback actions                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PHASE C: Chat & Sessions                                │   │
│  │ ├─ ChatSessionsService (persistence)                    │   │
│  │ ├─ ChatAgentService (agent registry)                    │   │
│  │ └─ InlineChatController (UI integration)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PHASE D: Knowledge Ocean                                │   │
│  │ ├─ KnowledgeOceanService (RAG)                          │   │
│  │ ├─ PgVectorStorageService (pgvector)                    │   │
│  │ ├─ LocalVectorOcean (in-memory)                         │   │
│  │ └─ IngestionQueue (document processing)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PHASE E: Agent Execution                                │   │
│  │ ├─ PlannerAgent (task planning)                         │   │
│  │ ├─ CodeExecutor (AST transformations)                   │   │
│  │ ├─ ChangesetManager (atomic changes)                    │   │
│  │ ├─ VerificationPipeline (7-stage)                       │   │
│  │ └─ VerificationGate (constitutional checks)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PHASE F: Security & Licensing                           │   │
│  │ ├─ LicenseManager (feature flags)                       │   │
│  │ ├─ SecretsVault (AES-256-GCM)                           │   │
│  │ ├─ PermissionManager (fine-grained)                     │   │
│  │ ├─ AuditLogger (comprehensive trail)                    │   │
│  │ └─ NetworkSandbox (request sandboxing)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PHASE G: E2E Testing                                    │   │
│  │ ├─ PlaywrightRunner (browser automation)                │   │
│  │ ├─ LighthouseRunner (performance auditing)              │   │
│  │ ├─ AccessibilityChecker (WCAG 2.1)                      │   │
│  │ └─ Test Suites (7 E2E, 2 integration, 2 perf)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CORE SERVICES (50+)                                     │   │
│  │ ├─ ProjectIndexer (AST parsing)                         │   │
│  │ ├─ FileWatcher (real-time monitoring)                   │   │
│  │ ├─ FrameworkDetector (framework detection)              │   │
│  │ ├─ AIOrchestrator (LLM orchestration)                   │   │
│  │ ├─ GitService (git operations)                          │   │
│  │ ├─ VersionHistory (version tracking)                    │   │
│  │ ├─ DeploymentManager (multi-cloud)                      │   │
│  │ └─ ... (35+ more services)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA & STORAGE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │    Redis     │  │ File System  │          │
│  │ (pgvector)   │  │  (caching)   │  │ (projects)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ OS Keychain  │  │ Local Store  │  │ Backups      │          │
│  │ (secrets)    │  │ (settings)   │  │ (changesets) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Phase Breakdown

### Phase A: Foundation (100%)
- Electron shell with app lifecycle
- React renderer with Monaco editor
- File explorer and tab system
- Visual canvas with React Flow
- 50+ backend services initialized
- IPC bridge with 20+ handlers

### Phase B: Constitutional AI (100%)
- ConstitutionalCore with System 2 reasoning
- Deterministic veto ID generation
- Fallback actions (reject, sanitize, explain, escalate)
- 30+ unit tests
- 20+ E2E tests

### Phase C: UI & Chat (100%)
- ChatPanel React component with streaming
- ChatSessionsService with persistence
- ChatAgentService with agent registry
- InlineChatController for UI integration
- 7 IPC chat handlers
- Keyboard shortcuts (Ctrl+Shift+C)

### Phase D: Knowledge Ocean (100%)
- KnowledgeOceanService with RAG
- Vector storage (pgvector, local, HTTP)
- Caching with configurable TTL
- Document ingestion pipeline
- PII redaction and privacy
- 10+ test files

### Phase E: Agent Execution (100%)
- PlannerAgent for task planning
- CodeExecutor for AST transformations
- ChangesetManager for atomic changes
- VerificationPipeline (7 stages)
- VerificationGate for constitutional checks
- 5 IPC orchestrator handlers

### Phase F: Security & Licensing (100%)
- LicenseManager with feature flags
- SecretsVault with AES-256-GCM
- PermissionManager with fine-grained control
- AuditLogger with comprehensive trail
- NetworkSandbox for request sandboxing
- 9 IPC security handlers

### Phase G: E2E Testing (95%)
- PlaywrightRunner for browser automation
- LighthouseRunner for performance auditing
- AccessibilityChecker for WCAG compliance
- 7 E2E test suites
- 2 integration test suites
- 2 performance test suites
- 100+ test scenarios

---

## 🔄 Data Flow

### Chat Flow
```
User Input (ChatPanel)
    ↓
IPC: chat:sendMessageStreaming
    ↓
ChatSessionsService.sendMessageWithProgress()
    ↓
AIOrchestrator.generateCode()
    ↓
ConstitutionalCore.validateContent()
    ↓
KnowledgeOceanService.getRelevantContext()
    ↓
LLM API (OpenAI/Anthropic)
    ↓
Stream chunks back to ChatPanel
    ↓
Display in UI with typing indicator
```

### Code Generation Flow
```
User Request
    ↓
IPC: orchestrator:planTask
    ↓
PlannerAgent.planTask()
    ↓
AIOrchestrator generates task DAG
    ↓
IPC: orchestrator:executeTask
    ↓
CodeExecutor transforms AST
    ↓
IPC: orchestrator:verifyCode
    ↓
VerificationPipeline (7 stages)
    ↓
VerificationGate (constitutional checks)
    ↓
IPC: orchestrator:applyChanges
    ↓
ChangesetManager applies atomically
    ↓
Success or IPC: orchestrator:rollback
```

### Knowledge Retrieval Flow
```
Query
    ↓
KnowledgeOceanService.querySnippets()
    ↓
Check cache (TTL: 60s)
    ↓
If miss: Vector similarity search
    ↓
Backend selection (pgvector/local/HTTP)
    ↓
Snippet extraction & redaction
    ↓
Return with provenance
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│     Application Layer                   │
│  (React + Electron Renderer)            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Permission Layer                    │
│  ├─ PermissionManager                   │
│  ├─ Network Allowlist                   │
│  └─ Request Validation                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Encryption Layer                    │
│  ├─ SecretsVault (AES-256-GCM)          │
│  ├─ OS Keychain Integration             │
│  └─ Secret Rotation                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Audit Layer                         │
│  ├─ AuditLogger                         │
│  ├─ Operation Tracking                  │
│  └─ Compliance Logging                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Sandboxing Layer                    │
│  ├─ NetworkSandbox                      │
│  ├─ Process Isolation                   │
│  └─ Resource Limits                     │
└─────────────────────────────────────────┘
```

---

## 📈 Performance Characteristics

### Indexing
- Project indexing: O(n) where n = file count
- Symbol search: O(log n) with caching
- Framework detection: ~100ms per project

### Chat
- First response: <2s (with streaming)
- Streaming chunks: ~100ms per chunk
- Session persistence: <50ms

### Knowledge Ocean
- Query latency: <500ms (with cache)
- Cache hit rate: ~60-80%
- Vector search: <1s for 10k documents

### Verification
- Syntax check: <100ms
- Type checking: <500ms
- Linting: <200ms
- Unit tests: <5s
- E2E tests: <30s per scenario

---

## 🧪 Testing Strategy

### Unit Tests (30+ files)
- Service-level testing
- Mock external dependencies
- Edge case coverage

### Integration Tests (2 suites)
- Canvas-to-code sync
- Service generation flows

### E2E Tests (7 suites)
- Project creation
- Code editing
- Visual design
- Collaboration
- Deployment
- Constitutional validation
- Accessibility

### Performance Tests (2 suites)
- AI performance benchmarks
- Indexing performance

### Accessibility Tests
- WCAG 2.1 Level AA compliance
- Screen reader compatibility
- Keyboard navigation

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────┐
│   GitHub / Source Control           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   CI/CD Pipeline                    │
│   ├─ Lint & Format                  │
│   ├─ Type Check                      │
│   ├─ Unit Tests                      │
│   ├─ E2E Tests                       │
│   └─ Build                           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Artifact Repository               │
│   ├─ Electron App                   │
│   ├─ Docker Image                   │
│   └─ Release Notes                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Distribution                      │
│   ├─ Auto-update (Electron)         │
│   ├─ Package Managers               │
│   └─ Direct Download                │
└─────────────────────────────────────┘
```

---

## 📚 Key Design Patterns

### Service Locator
- Services registered in main.ts
- Accessed via IPC handlers
- Singleton pattern for shared state

### Observer Pattern
- FileWatcher for real-time updates
- Event emitters for state changes
- IPC for renderer notifications

### Strategy Pattern
- Multiple LLM providers (OpenAI, Anthropic)
- Multiple vector storage backends
- Multiple deployment targets

### Factory Pattern
- Service creation in main.ts
- Component creation in React
- Test fixture creation

### Middleware Pattern
- IPC handlers as middleware
- Permission checks before operations
- Audit logging for all actions

---

## 🎯 Scalability Considerations

### Horizontal Scaling
- Stateless services (can run in parallel)
- Distributed caching (Redis)
- Database replication (PostgreSQL)

### Vertical Scaling
- Efficient memory management
- Streaming for large files
- Pagination for large datasets

### Performance Optimization
- Caching at multiple levels
- Lazy loading of components
- Code splitting for bundles
- Compression for network

---

## 📋 Maintenance & Monitoring

### Logging
- Structured logging with timestamps
- Log levels (debug, info, warn, error)
- Audit trail for compliance

### Metrics
- Performance metrics (latency, throughput)
- Error rates and types
- User engagement metrics

### Health Checks
- Service availability checks
- Database connectivity
- External API status

### Alerting
- Error threshold alerts
- Performance degradation alerts
- Security event alerts

---

## 🔄 Version Management

- **Current**: 1.0.0-alpha
- **Release Cycle**: Bi-weekly
- **Versioning**: Semantic versioning
- **Backwards Compatibility**: Maintained for 2 major versions

---

## 📞 Support & Documentation

- Architecture diagrams in this file
- API reference in API.md
- Phase documentation in PHASE-*.md files
- Test examples in tests/ directory
- Code comments for complex logic

