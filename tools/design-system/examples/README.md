# Design System Examples

This directory contains example templates and usage patterns for the Azora Design System.

## Files

- `service-template-design-tokens.ts` - Template for service design tokens
- `service-template-design.config.json` - Template for service design config

## Usage

### Creating Design Tokens for New Service

1. Copy `service-template-design-tokens.ts` to your service directory
2. Rename to `design-tokens.ts`
3. Customize service-specific tokens
4. Update imports if needed

### Creating Design Config for New Service

1. Copy `service-template-design.config.json` to your service directory
2. Rename to `design.config.json`
3. Update `service` name
4. Customize `serviceSpecific` section

## Quick Start

```bash
# Initialize design system in new service
cd tools/design-system
npx tsx infrastructure-design-cli.ts init services/your-new-service
```

This will automatically create both files for you!
