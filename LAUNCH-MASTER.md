# 🚀 AZORA OS MASTER LAUNCH SYSTEM

## Supreme Orchestration Commands

### Quick Launch Options

```bash
# Full system launch with dependency installation
npm run supreme:full

# Launch everything (services + frontends)
npm run supreme:launch

# Services only
npm run supreme:services

# Frontends only
npm run supreme:frontends

# Install all dependencies
npm run supreme:install

# System scan and analysis
npm run scan:system
```

### Platform-Specific Launchers

**Windows:**
```cmd
scripts\launch-all.bat
```

**Unix/Linux/macOS:**
```bash
./scripts/launch-all.sh
```

### Direct Orchestrator Launch

```bash
node scripts/master-orchestrator.js
```

## System Architecture

### 🔧 Core Services (Launch Priority 1)
- **API Gateway** → Port 4000
- **Auth Service** → Port 4001  
- **Azora Mint** → Port 4002
- **Chamber of Ghosts** → Port 3005

### 🎨 Frontend Applications
- **Main App** → Port 3000
- **Enterprise UI** → Port 3001
- **Marketplace UI** → Port 3002
- **Pay UI** → Port 3003
- **Student Portal** → Port 3004

### ⚙️ Advanced Services
- **Azora Forge** → Port 4003
- **Azora Nexus** → Port 4004
- **Azora Education** → Port 4006
- **Azora LMS** → Port 4007
- **Azora Aegis** → Port 4008
- **Azora Covenant** → Port 4009

## Features

✅ **Auto-Discovery** - Scans entire repository for services  
✅ **Dependency Management** - Installs all required packages  
✅ **Health Monitoring** - Continuous service health checks  
✅ **Graceful Shutdown** - Clean process termination  
✅ **Port Management** - Automatic port assignment  
✅ **Status Dashboard** - Real-time system overview  

## Ubuntu Philosophy Integration

*"Ngiyakwazi ngoba sikwazi" - "I can because we can"*

The Master Orchestrator embodies Ubuntu principles by:
- **Collective Launch** - All services start together
- **Shared Resources** - Coordinated port and dependency management
- **Community Health** - System-wide monitoring and care
- **Unified Purpose** - Single command launches entire ecosystem

## Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/azora-os/azora-os.git
   cd azora-os
   ```

2. **Launch Everything**
   ```bash
   npm run supreme:full
   ```

3. **Access Azora OS**
   - Main Dashboard: http://localhost:3000
   - API Gateway: http://localhost:4000
   - Chamber of Ghosts: http://localhost:3005

## Troubleshooting

**Port Conflicts:**
```bash
npm run scan:system  # Check for port conflicts
```

**Service Issues:**
```bash
npm run supreme:services  # Launch services only
```

**Frontend Issues:**
```bash
npm run supreme:frontends  # Launch frontends only
```

---

🌟 **Azora OS - Constitutional AI Operating System**  
*Building the Future Through Ubuntu Philosophy*