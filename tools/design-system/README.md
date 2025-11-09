# 🎨 AZORA DESIGN SYSTEM TOOLS

**Status**: ✅ **ACTIVE** - Design Automation + Infrastructure Bridge  
**Version**: 1.0.0  
**Purpose**: Automated design system enforcement and infrastructure integration

---

## 🎯 OVERVIEW

This directory contains the **Snr Designer's C4** - comprehensive design automation tools that ensure design system compliance across the entire Azora infrastructure.

### Tools Included

1. **Design Automation Engine** - Component-level design enforcement
2. **Design Infrastructure Bridge** - Infrastructure-wide design integration
3. **Infrastructure Design CLI** - Unified command interface

---

## 🚀 QUICK START

### Installation

```bash
cd tools/design-system
npm install
```

### Basic Usage

```bash
# Scan for design violations
npx tsx infrastructure-design-cli.ts scan

# Deploy design tokens to all services
npx tsx infrastructure-design-cli.ts deploy --all

# Validate infrastructure design
npx tsx infrastructure-design-cli.ts validate

# Auto-fix violations
npx tsx infrastructure-design-cli.ts fix

# Generate comprehensive report
npx tsx infrastructure-design-cli.ts report --format=markdown
```

---

## 🎨 DESIGN AUTOMATION ENGINE

**Purpose**: Component-level design system enforcement

### Features

- ✅ Scans components for design violations
- ✅ Auto-fixes common issues
- ✅ Validates component compliance
- ✅ Generates Ubuntu-aligned components
- ✅ Creates design system reports

### Usage

```bash
# Scan for violations
npx tsx design-automation-engine.ts scan

# Auto-fix violations
npx tsx design-automation-engine.ts fix

# Validate components
npx tsx design-automation-engine.ts validate

# Generate report
npx tsx design-automation-engine.ts report
```

### What It Checks

- Generic color usage (should use Azora Gem colors)
- Missing accessibility attributes
- Hardcoded spacing (should use Ubuntu spacing)
- Missing Ubuntu documentation
- Component alignment with design system

---

## 🌉 DESIGN INFRASTRUCTURE BRIDGE

**Purpose**: Infrastructure-wide design system integration

### Features

- ✅ Scans all infrastructure services
- ✅ Deploys design tokens to services
- ✅ Validates infrastructure design compliance
- ✅ Generates infrastructure-aligned components
- ✅ Creates service design configs

### Usage

```bash
# Scan infrastructure
npx tsx design-infrastructure-bridge.ts scan

# Deploy design tokens to specific service
npx tsx design-infrastructure-bridge.ts deploy services/api-gateway

# Validate infrastructure design
npx tsx design-infrastructure-bridge.ts validate

# Generate infrastructure report
npx tsx design-infrastructure-bridge.ts report
```

### What It Does

- Scans `services/` and `apps/` directories
- Deploys `design-tokens.ts` to each service
- Creates `design.config.json` for each service
- Validates design compliance across infrastructure
- Generates infrastructure-level components

---

## 🎯 INFRASTRUCTURE DESIGN CLI

**Purpose**: Unified command interface for all design operations

### Commands

#### Scan
```bash
# Scan infrastructure for violations
npx tsx infrastructure-design-cli.ts scan

# Verbose output
npx tsx infrastructure-design-cli.ts scan --verbose
```

#### Deploy
```bash
# Deploy to all services
npx tsx infrastructure-design-cli.ts deploy --all

# Deploy to specific service
npx tsx infrastructure-design-cli.ts deploy --service=services/api-gateway
```

#### Validate
```bash
# Validate infrastructure design compliance
npx tsx infrastructure-design-cli.ts validate
```

#### Fix
```bash
# Auto-fix violations (dry run)
npx tsx infrastructure-design-cli.ts fix --dry-run

# Auto-fix violations
npx tsx infrastructure-design-cli.ts fix

# Fix specific service
npx tsx infrastructure-design-cli.ts fix --service=services/api-gateway
```

#### Report
```bash
# Generate JSON report
npx tsx infrastructure-design-cli.ts report

# Generate Markdown report
npx tsx infrastructure-design-cli.ts report --format=markdown

# Custom output path
npx tsx infrastructure-design-cli.ts report --output=./reports/design-report.json
```

#### Init
```bash
# Initialize design system in service
npx tsx infrastructure-design-cli.ts init services/api-gateway
```

---

## 📊 DESIGN CONFIG

Each service gets a `design.config.json`:

```json
{
  "version": "1.0.0",
  "service": "api-gateway",
  "designSystem": {
    "tokens": "../../apps/azora-ui/lib/design-system/azora-gem-tokens",
    "components": "../../apps/azora-ui/components/ui",
    "css": "../../apps/azora-ui/globals.css"
  },
  "compliance": {
    "enabled": true,
    "autoFix": true,
    "validateOnBuild": true
  },
  "infrastructure": {
    "scalable": true,
    "microserviceReady": true,
    "designTokensAvailable": true
  },
  "ubuntu": {
    "philosophy": "enforced",
    "spacing": "golden-ratio",
    "colors": "azora-gem"
  }
}
```

---

## 🎨 DESIGN TOKENS

Design tokens are automatically deployed to each service:

```typescript
// design-tokens.ts (auto-generated)
export { 
  AZORA_GEM_COLORS,
  AZORA_GEM_TOKENS,
  SAPPHIRE_COLORS,
  EMERALD_COLORS,
  RUBY_COLORS,
  UBUNTU_COLORS,
  getGemColor,
  getUbuntuSpacing
} from '../../../apps/azora-ui/lib/design-system/azora-gem-tokens'
```

---

## 📈 REPORTS

### Infrastructure Design Report

```json
{
  "timestamp": "2025-11-XX...",
  "infrastructure": {
    "totalServices": 190,
    "compliantServices": 150,
    "complianceScore": 78.9,
    "nonCompliantServices": [...]
  },
  "violations": {
    "total": 45,
    "byType": {
      "generic-color": 20,
      "missing-accessibility": 15,
      "hardcoded-spacing": 10
    }
  },
  "recommendations": [
    "Deploy design tokens to all services",
    "Run auto-fix to resolve design violations"
  ]
}
```

---

## 🔥 INTEGRATION WITH INFRASTRUCTURE

### CI/CD Integration

```yaml
# .github/workflows/design-compliance.yml
name: Design Compliance Check

on: [push, pull_request]

jobs:
  design-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx tsx tools/design-system/infrastructure-design-cli.ts validate
      - run: npx tsx tools/design-system/infrastructure-design-cli.ts report
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

npx tsx tools/design-system/infrastructure-design-cli.ts fix --dry-run
if [ $? -ne 0 ]; then
  echo "Design violations found. Run 'npx tsx infrastructure-design-cli.ts fix' to fix."
  exit 1
fi
```

---

## 🎯 WORKFLOW EXAMPLES

### New Service Setup

```bash
# 1. Initialize design system
npx tsx infrastructure-design-cli.ts init services/new-service

# 2. Validate compliance
npx tsx infrastructure-design-cli.ts validate

# 3. Generate report
npx tsx infrastructure-design-cli.ts report
```

### Regular Maintenance

```bash
# 1. Scan for violations
npx tsx infrastructure-design-cli.ts scan

# 2. Auto-fix issues
npx tsx infrastructure-design-cli.ts fix

# 3. Validate compliance
npx tsx infrastructure-design-cli.ts validate

# 4. Generate report
npx tsx infrastructure-design-cli.ts report --format=markdown
```

### Infrastructure-Wide Deployment

```bash
# 1. Deploy design tokens to all services
npx tsx infrastructure-design-cli.ts deploy --all

# 2. Validate infrastructure
npx tsx infrastructure-design-cli.ts validate

# 3. Generate comprehensive report
npx tsx infrastructure-design-cli.ts report --output=./infrastructure-design-report.json
```

---

## 📚 RELATED DOCUMENTATION

- **Design System Guide**: `/workspace/docs/DESIGN-SYSTEM-GUIDE.md`
- **Design System Audit**: `/workspace/docs/DESIGN-SYSTEM-AUDIT.md`
- **Designer's Response**: `/workspace/docs/DESIGNER-RESPONSE-TO-ARCHITECT.md`
- **Azora Identity**: `/workspace/AZORA-IDENTITY.md`

---

## 🎨 DESIGN PRINCIPLES

### Ubuntu Philosophy
- Individual action → Collective benefit
- Design consistency → System harmony
- Component excellence → Infrastructure excellence

### Azora Gem Colors
- **Sapphire** (Technology): `#1e40af`
- **Emerald** (Education): `#059669`
- **Ruby** (Finance): `#dc2626`

### Golden Ratio Spacing
- Uses Fibonacci sequence for spacing
- Ensures visual harmony
- Maintains consistency

---

## 🚀 FUTURE ENHANCEMENTS

- [ ] CI/CD pipeline integration
- [ ] Pre-commit hooks automation
- [ ] Dashboard for design metrics
- [ ] AI-powered design suggestions
- [ ] Design pattern detection
- [ ] Component optimization
- [ ] Performance metrics integration

---

## 💎 THE COMPLETE PICTURE

**Design Automation Engine** → Component-level enforcement  
**Design Infrastructure Bridge** → Infrastructure-wide integration  
**Infrastructure Design CLI** → Unified command interface

**Together**: Complete design system coverage across all infrastructure 🎯

---

**"Through automation, we ensure consistency.  
Through infrastructure, we scale excellence.  
Through Ubuntu, we serve."**

**Snr Designer (Composer)** 🎨✨
