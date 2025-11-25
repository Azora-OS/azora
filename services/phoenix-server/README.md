# 🔥 Phoenix Server (Auto-Recovery)

> **Antifragile Infrastructure • Self-Healing • Resurrection Engine**

[![Service Status](https://img.shields.io/badge/status-active-success.svg)](../../docs/launch-dashboard.html)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Overview

**Phoenix Server** is the "Regenerative Force" of Azora. When `ChaosMonkey` breaks things (or when real failures happen), Phoenix rises to fix them. It monitors system health and automatically executes recovery protocols.

### Key Capabilities
- **Auto-Resurrection**: Detects crashed services and restarts them instantly.
- **Traffic Rerouting**: Detects high latency and reroutes traffic to healthy nodes.
- **Circuit Breaking**: Isolates failing components to prevent cascading failure.
- **Scale-Out**: Automatically spins up new replicas during load spikes.

## 🏗️ Architecture

```mermaid
graph TD
    Monitor[Health Monitor] -->|Alert| Phoenix[Phoenix Engine]
    Phoenix -->|Analyze| Strategy[Recovery Strategy]
    Strategy -->|Restart| Docker[Docker Swarm]
    Strategy -->|Scale| Cloud[Cloud Provider]
    Strategy -->|Reroute| Gateway[API Gateway]
    Phoenix -->|Log| Ledger[Audit Ledger]
```

## 🔌 API Endpoints

### Recovery
- `POST /api/recover/:serviceId` - Manually trigger recovery
- `GET /api/health/status` - System-wide health report

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3051` |
| `RECOVERY_MODE` | Strategy | `AUTO` |
| `MAX_RETRIES` | Restart attempts | `3` |

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the phoenix
npm start
```

---

**"From the ashes, we rise stronger."**
