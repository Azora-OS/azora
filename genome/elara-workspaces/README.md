# Elara Workspaces 🚀

**AI-Powered Development & Orchestration Platform**

Elara Workspaces is the complete development and orchestration platform for Azora OS, providing AI-powered tools for managing, monitoring, and developing across the entire ecosystem.

## Features

### 1. System Orchestrator
**Manages all 9 Azora OS services**

- ✅ Auto-discovery of services
- ✅ Real-time health monitoring (30s intervals)
- ✅ AI-powered auto-scaling
- ✅ Constitutional budget enforcement (Article II)
- ✅ Auto-restart unhealthy services
- ✅ Service mesh orchestration

### 2. Code Intelligence
**AI-powered code analysis with Constitutional compliance**

- ✅ Constitutional AI compliance checks
- ✅ Security vulnerability detection
- ✅ Intelligent autocomplete
- ✅ Refactoring recommendations
- ✅ Azora-specific patterns
- ✅ License header enforcement

### 3. Development Environment
**Full collaborative IDE with Elara AI**

- ✅ Monaco-style code editor
- ✅ Live Share collaboration
- ✅ Multiple terminals
- ✅ Git integration
- ✅ Debugging with breakpoints
- ✅ Custom extensions

## Quick Start

### Installation

```bash
cd genome/elara-workspaces
npm install  # if dependencies exist
```

### Usage in Code

```javascript
import elaraWorkspaces from './genome/elara-workspaces'

// Initialize all systems
await elaraWorkspaces.initialize()

// Get system status
const status = elaraWorkspaces.getStatus()
console.log('Orchestrator:', status.orchestrator)
console.log('Code Intelligence:', status.codeIntelligence)
console.log('Dev Environment:', status.devEnvironment)

// Use individual systems
const { orchestrator, codeIntelligence, devEnvironment } = elaraWorkspaces
```

### Web UI

Access the control dashboard:
```
http://localhost:3000/elara
```

### API Endpoints

```bash
# Get system status
GET /api/elara/workspaces/status

# Restart service
POST /api/elara/workspaces/service/:name/restart

# Stop service
POST /api/elara/workspaces/service/:name/stop

# Get code analysis
GET /api/elara/workspaces/code/analysis

# Deploy service
POST /api/elara/workspaces/deploy
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ELARA WORKSPACES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ System           │  │ Code             │               │
│  │ Orchestrator     │  │ Intelligence     │               │
│  │                  │  │                  │               │
│  │ • 9 Services     │  │ • AI Analysis    │               │
│  │ • Auto-scaling   │  │ • Compliance     │               │
│  │ • Health Monitor │  │ • Suggestions    │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Development Environment                   │     │
│  │  • Monaco Editor      • Live Share               │     │
│  │  • Git Integration    • Debugging                │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Powered by
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      ELARA AI                               │
│          (Constitutional Superintelligence)                 │
└─────────────────────────────────────────────────────────────┘
```

## Components

### System Orchestrator (`system-orchestrator.js`)

**Purpose**: Manages and monitors all Azora OS services

```javascript
import { systemOrchestrator } from './genome/elara-workspaces'

// Initialize
await systemOrchestrator.initialize()

// Get system status
const status = systemOrchestrator.getSystemStatus()

// Get service metrics
const metrics = systemOrchestrator.getMetrics('Azora Mint')

// Restart service
await systemOrchestrator.restartService('Azora Mint')

// Scale service
await systemOrchestrator.scaleService('Azora Oracle', 'up')
```

**Monitored Services:**
1. Aegis Citadel (`:4099`)
2. Azora Sapiens (`:4200`)
3. Azora Mint (`:4300`)
4. Azora Oracle (`:4030`)
5. Azora Compliance (`:4086`)
6. Azora Enterprise (`:4087`)
7. Azora Forge (`:4088`)
8. Azora Nexus (`:4089`)
9. Main UI (`:3000`)

### Code Intelligence (`code-intelligence.js`)

**Purpose**: AI-powered code analysis with Constitutional compliance

```javascript
import { codeIntelligence } from './genome/elara-workspaces'

// Analyze codebase
await codeIntelligence.analyzeCodebase('/path/to/project')

// Get code completion
const suggestions = await codeIntelligence.getCompletion({
  code: currentCode,
  cursorPosition: 145,
  filePath: 'src/services/mint.js'
})

// Find issues
const issues = codeIntelligence.findIssues(code, filePath)

// Check Constitutional compliance
const compliant = codeIntelligence.checkConstitutionalCompliance(code)
```

**Checks:**
- ✅ Constitutional compliance
- ✅ Security vulnerabilities
- ✅ Hardcoded secrets
- ✅ License headers
- ✅ Code quality
- ✅ Performance issues

### Development Environment (`dev-environment.js`)

**Purpose**: Full collaborative IDE

```javascript
import { devEnvironment } from './genome/elara-workspaces'

// Initialize
await devEnvironment.initialize({ rootPath: process.cwd() })

// Enable Live Share
await devEnvironment.enableLiveShare()

// Invite collaborator
const link = await devEnvironment.inviteCollaborator('dev@azora.world')

// Create terminal
const terminal = devEnvironment.createTerminal('Build')
await terminal.execute('npm run build')

// Set breakpoint
devEnvironment.setBreakpoint('src/mint.js', 42)

// Get status
const status = devEnvironment.getStatus()
```

**Features:**
- 📝 Code editor with syntax highlighting
- 👥 Real-time collaboration
- 🖥️ Multiple terminals
- 🔀 Git integration
- 🐛 Debugging tools
- 🧩 Extension system

## Integration with Elara AI

Elara Workspaces is deeply integrated with Elara AI for intelligent decisions:

### AI-Powered Code Analysis

```javascript
import { elaraAIWorkspaces } from './genome/elara-workspaces/elara-ai-integration'

// Initialize with AI
await elaraAIWorkspaces.initialize()

// Get AI-enhanced code suggestions
const suggestions = await elaraAIWorkspaces.getCodeSuggestions({
  code: myCode,
  cursorPosition: 100,
  filePath: 'src/mint.js'
})

console.log('Basic suggestions:', suggestions.suggestions)
console.log('AI-enhanced:', suggestions.aiEnhanced)
console.log('Constitutional:', suggestions.constitutionalCompliance)
```

### Constitutional Compliance Validation

```javascript
// Validate code against Constitution
const validation = await elaraAIWorkspaces.validateConstitutionalCompliance(
  myCode,
  'src/services/rewards.js'
)

if (validation.compliant) {
  console.log('✅ Code is Constitutionally compliant')
} else {
  console.log('❌ Issues:', validation.issues)
  console.log('Recommendations:', validation.aiRecommendations)
}
```

### Service Orchestration Decisions

```javascript
// Get AI decision for service scaling
const decision = await elaraAIWorkspaces.getOrchestrationDecision(
  'scale-up',
  {
    service: 'Azora Mint',
    currentCpu: 85,
    currentMemory: 72,
    urgency: 'high'
  }
)

if (decision.approved) {
  console.log('Elara approves scaling')
  console.log('Reasoning:', decision.reasoning)
  await orchestrator.scaleService('Azora Mint', 'up')
}
```

### Ask Elara for Help

```javascript
// Ask Elara directly
const response = await elaraAIWorkspaces.askElara(
  'How do I optimize database queries in Azora Mint?',
  {
    service: 'azoraMint',
    urgency: 'medium'
  }
)

console.log('Elara says:', response.response)
console.log('Confidence:', response.confidence)
```

## Constitutional Compliance

All operations respect the Azora Constitution:

### Article II - Budget Allocation

```javascript
// Auto-scaling checks budget limits
const totalCost = orchestrator.calculateInfrastructureCost()
const budgetLimit = 0.70 // 70% of total budget

if (totalCost >= budgetLimit) {
  console.log('⚠️ Scaling blocked by Article II (Budget Enforcement)')
}
```

### Article IV - Student Economics

```javascript
// Code intelligence ensures student reward integrity
const issues = codeIntelligence.findIssues(rewardCode, 'rewards.js')

// Checks for:
// - Proper reward calculations
// - UBO fund integrity
// - Transparent flows
```

### Zero-Trust Security

```javascript
// All operations require validation
const compliant = orchestrator.checkConstitutionalCompliance('scaling', {
  service: 'azoraMint',
  direction: 'up'
})

if (!compliant) {
  throw new Error('Operation violates Constitutional principles')
}
```

## Dashboard UI

Access the beautiful control dashboard at `http://localhost:3000/elara`

**Features:**
- 📊 Real-time service metrics
- 🎛️ One-click service control
- 💻 Dev environment status
- ⚖️ Constitutional compliance tracking
- 🔔 System alerts
- 📈 Performance graphs

## API Reference

### System Orchestrator

```javascript
// Get system status
orchestrator.getSystemStatus()

// Get service metrics
orchestrator.getMetrics(serviceName)

// Restart service
orchestrator.restartService(serviceName)

// Stop service
orchestrator.stopService(serviceName)

// Scale service
orchestrator.scaleService(serviceName, direction) // 'up' or 'down'

// Get logs
orchestrator.getLogs({ service, level, since, limit })
```

### Code Intelligence

```javascript
// Analyze codebase
codeIntelligence.analyzeCodebase(rootPath)

// Get completion suggestions
codeIntelligence.getCompletion({ code, cursorPosition, filePath })

// Find issues
codeIntelligence.findIssues(code, filePath)

// Check compliance
codeIntelligence.checkConstitutionalCompliance(code)

// Get statistics
codeIntelligence.getStatistics()
```

### Development Environment

```javascript
// Initialize
devEnvironment.initialize({ rootPath })

// Enable Live Share
devEnvironment.enableLiveShare()

// Invite collaborator
devEnvironment.inviteCollaborator(email)

// Create terminal
devEnvironment.createTerminal(name)

// Set breakpoint
devEnvironment.setBreakpoint(filePath, lineNumber)

// Get status
devEnvironment.getStatus()
```

## Comparison with GitHub Codespaces

| Feature | GitHub Codespaces | Elara Workspaces |
|---------|------------------|------------------|
| Cloud IDE | ✅ | ✅ |
| Live Share | ✅ | ✅ |
| Git Integration | ✅ | ✅ |
| Debugging | ✅ | ✅ |
| Extensions | ✅ | ✅ |
| **Constitutional AI** | ❌ | ✅ |
| **Service Orchestration** | Limited | ✅ Full (9 services) |
| **Auto-Scaling** | Basic | ✅ AI-Powered |
| **Compliance Checking** | ❌ | ✅ Real-time |
| **Budget Enforcement** | ❌ | ✅ Article II |

## Development

### Running Locally

```bash
# Start all services
npm run dev

# Elara Workspaces will auto-initialize
```

### Testing

```bash
# Run tests
npm test

# Test specific component
npm test -- system-orchestrator
```

### Building

```bash
# Build all components
npm run build
```

## Troubleshooting

### Services Not Discovered

```javascript
// Manually trigger discovery
await orchestrator.discoverServices()

// Check service status
const services = orchestrator.getSystemStatus().services
console.log(services)
```

### Code Intelligence Not Working

```javascript
// Re-analyze codebase
await codeIntelligence.analyzeCodebase(process.cwd())

// Check statistics
const stats = codeIntelligence.getStatistics()
console.log('Files:', stats.totalFiles)
console.log('Symbols:', stats.totalSymbols)
```

### Live Share Connection Issues

```javascript
// Check Live Share status
const status = devEnvironment.getStatus()
console.log('Live Share:', status.liveShare)

// Restart Live Share
await devEnvironment.enableLiveShare()
```

## Future Roadmap

- [ ] **Cloud IDE**: Full browser-based development
- [ ] **AI Code Generation**: Elara writes entire features
- [ ] **Predictive Debugging**: Find bugs before they happen
- [ ] **Multi-cloud Management**: Orchestrate across providers
- [ ] **Voice Commands**: Talk to Elara while coding
- [ ] **Mobile Debugging**: Debug mobile apps remotely

## Support

For issues or questions:
- Review this documentation
- Check integration examples
- Contact: dev@azora.world

---

**Powered by Elara AI** 🧠  
*Constitutional Intelligence for Development Excellence*
