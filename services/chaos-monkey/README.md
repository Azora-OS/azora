# 🐵 Chaos Monkey Service

> **Antifragile Infrastructure • Resilience Testing • System Hardening**

[![Service Status](https://img.shields.io/badge/status-active-success.svg)](../../docs/launch-dashboard.html)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Overview

The **Chaos Monkey** is the "Immune System" challenger. It proactively injects controlled failures into the Azora ecosystem to ensure the system is **Antifragile**—getting stronger with every stressor.

### Key Capabilities
- **Failure Injection**: Simulates 7 types of failures (Service Crash, Latency, Packet Loss, CPU Spike, Memory Leak, Disk Fill, Time Drift).
- **Random Scheduling**: Executes chaos experiments at random intervals (configurable).
- **Constitutional Safety**: Checks with AI Orchestrator before running high-risk experiments.
- **Recovery Validation**: Verifies that PhoenixServer successfully recovers the system.

## 🏗️ Architecture

```mermaid
graph TD
    Scheduler[Chaos Scheduler] -->|Trigger| Engine[Chaos Engine]
    Engine -->|Check Safety| AI[AI Orchestrator]
    AI -->|Approve| Injector[Fault Injector]
    Injector --> Target[Target Service]
    Target -->|Fail| Phoenix[Phoenix Server]
    Phoenix -->|Recover| System[Restored System]
```

## 🔌 API Endpoints

### Chaos Control
- `POST /api/chaos/inject` - Manually trigger a specific failure
- `POST /api/chaos/schedule` - Update chaos schedule
- `GET /api/chaos/history` - View past experiments

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3050` |
| `CHAOS_ENABLED` | Master switch | `true` |
| `INTENSITY_LEVEL` | 1-10 scale | `5` |

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the monkey
npm start
```

### Safety Warning ⚠️
**DO NOT RUN IN PRODUCTION WITHOUT APPROVAL.**
This service is designed to break things. Ensure `PhoenixServer` is running before enabling.

---

**"What doesn't kill the system makes it stronger."**
