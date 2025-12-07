# Azora OS

<div align="center">

![Azora OS Banner](https://azora.world/assets/banner-v3.png)

**The World's First Constitutional AI Operating System**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-Azora_Proprietary_%7C_Community_Free-purple.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)](actions)
[![Constitutional AI](https://img.shields.io/badge/Constitutional_AI-Active-green.svg)](CONSTITUTION.md)
[![Ubuntu Philosophy](https://img.shields.io/badge/Philosophy-Ubuntu-orange.svg)](CONSTITUTION.md)
[![Discord](https://img.shields.io/discord/1234567890?color=5865F2&label=discord&logo=discord&logoColor=white)](https://discord.gg/azora)

*"Ngiyakwazi ngoba sikwazi - I can because we can"*

[Documentation](docs/) • [Constitution](CONSTITUTION.md) • [Contributing](CONTRIBUTING.md) • [Website](https://azora.world)

</div>

---

## 🌍 Introduction

**Azora OS** is a revolutionary ecosystem that combines **education**, **development tools**, and **economic opportunity** into one seamless platform. Built on the principles of **Ubuntu** ("I am because we are") and powered by **Constitutional AI**, Azora provides the infrastructure for a new digital economy where technology serves humanity.

Unlike traditional platforms, Azora is governed by a [Constitution](CONSTITUTION.md) that ensures truth, transparency, and collective prosperity. It is an antifragile system designed to empower learners, builders, and creators through:

*   **Constitutional AI**: AI agents (Elara, Kofi, Zuri) that operate under strict ethical guardrails.
*   **Ubuntu Economics**: A tokenomic model where individual success multiplies collective wealth.
*   **Sankofa Engine**: A powerful core that integrates historical wisdom with future technology.

## 🏗️ Monorepo Structure

Azora OS is a high-performance monorepo managed with **Turborepo** and **npm workspaces**.

```
azora/
├── apps/                   # User-facing applications
│   ├── azora-buildspaces/  # Virtual development environments (Next.js)
│   ├── azora-sapiens/      # AI University platform
│   ├── ascend/             # Cloud-native IDE (Monaco-based)
│   └── web/                # Main marketing and landing sites
├── services/               # Backend microservices
│   ├── ai-orchestrator/    # Central AI agent coordination
│   ├── ai-ethics-monitor/  # Constitutional compliance engine
│   ├── education/          # LMS and curriculum management
│   └── finance/            # Ledger, Mint, and Pay services
├── packages/               # Shared libraries and tools
│   ├── azora-ui/           # Design system and component library
│   ├── azora-cli/          # Terminal-native AI assistant
│   ├── constitutional-ai/  # Core AI governance logic
│   └── sdk/                # Developer SDKs
├── infrastructure/         # IaC, Docker, and K8s configs
├── docs/                   # Comprehensive documentation
└── CONSTITUTION.md         # The supreme governing document
```

## 🚀 Core Components

### 🛠️ Azora BuildSpaces
A next-generation virtual development environment that rivals GitHub Codespaces.
*   **Instant Environments**: Spin up full-stack dev environments in seconds.
*   **Code Chamber**: Deeply integrated coding rooms with AI pair programming.
*   **Elara Integration**: Context-aware AI assistance that understands your entire codebase.

### 🎓 Azora Sapiens
An AI-powered university that democratizes access to world-class education.
*   **Personalized Tutors**: AI agents adapt to your learning style.
*   **Proof-of-Knowledge**: Earn verifiable credentials on the blockchain.
*   **Research Center**: Advanced tools for academic inquiry.

### 💻 Azora Ascend
A professional-grade Cloud IDE built for the AI era.
*   **Agentic Workflows**: Delegate complex tasks to AI agents.
*   **Visual Specs**: Build software using Spec-Driven Development.
*   **Real-time Collaboration**: Code with your team in the same session.

### 🏛️ Azora Citadel
The governance and economic heart of the ecosystem.
*   **Constitutional Court**: Resolves disputes and ensures AI alignment.
*   **Citadel Fund**: A public goods fund fueled by platform revenue.
*   **Ubuntu Governance**: Community-led decision making.

## ⚡ Getting Started

### Prerequisites
*   **Node.js**: v20 or higher
*   **npm**: v10 or higher
*   **Docker**: Required for running local services

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Sizwe780/azora-os.git
    cd azora-os
    ```

2.  **Install dependencies**:
    ```bash
    npm ci
    ```

3.  **Set up environment variables**:
    Copy `.env.example` to `.env` and configure your keys.
    ```bash
    cp .env.example .env
    ```

4.  **Run the development server**:
    This will start all apps and services in development mode.
    ```bash
    npm run dev
    ```

    Access the main dashboard at `http://localhost:3000`.

## 📜 Constitutional AI & Ethics

Azora OS is unique because it is governed by code-enforced laws.

*   **[CONSTITUTION.md](CONSTITUTION.md)**: The supreme law of the platform. All code and AI decisions must align with these principles.
*   **[AI_DEV_LAWS.md](AI_DEV_LAWS.md)**: The "Twin Pact" governing AI assistants. It mandates **Truth over Comfort**, **Resilience**, and the **No Mock Protocol**.

> *"Truth is the only currency that matters."*

## 🤝 Contributing

We welcome contributions from the community, provided they align with our **Ubuntu Principles**.

1.  Read our [Contributing Guidelines](CONTRIBUTING.md).
2.  Ensure your code adheres to the [Constitution](CONSTITUTION.md).
3.  Run `npm run test` before submitting a Pull Request.
4.  Join our [Discord](https://discord.gg/azora) to discuss ideas.

## 📄 License

**Azora Proprietary License with Ubuntu Principles (v3.0.0)**

*   **Free for Education & Personal Use**: Learn and build for free.
*   **Free for Community Projects**: Open source and non-profit use is encouraged.
*   **Commercial Use**: Requires a license for revenue-generating business operations.

See [LICENSE](LICENSE) for full details.

---

<div align="center">

**Built with ❤️ and Ubuntu by Azora ES (Pty) Ltd**

*Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.*

</div>