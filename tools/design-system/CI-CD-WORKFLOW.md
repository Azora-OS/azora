# 🔄 CI/CD Workflow for Design Compliance

**Note**: The GitHub Actions workflow file should be created at `.github/workflows/design-compliance.yml`

Due to permissions, create it manually or use this content:

## GitHub Actions Workflow

Create `.github/workflows/design-compliance.yml` with the following content:

```yaml
name: Design Compliance Check

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/**/*.{tsx,ts,jsx,js}'
      - 'services/**/*.{tsx,ts,jsx,js}'
      - 'tools/design-system/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'apps/**/*.{tsx,ts,jsx,js}'
      - 'services/**/*.{tsx,ts,jsx,js}'
      - 'tools/design-system/**'
  workflow_dispatch:

jobs:
  design-compliance:
    name: Design System Compliance
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd tools/design-system
          npm install

      - name: Scan for design violations
        run: |
          cd tools/design-system
          npx tsx infrastructure-design-cli.ts scan --verbose || true

      - name: Validate infrastructure design
        run: |
          cd tools/design-system
          npx tsx infrastructure-design-cli.ts validate || true

      - name: Generate design compliance report
        run: |
          cd tools/design-system
          npx tsx infrastructure-design-cli.ts report --output=./design-compliance-report.json --format=json || true

      - name: Upload design compliance report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: design-compliance-report
          path: tools/design-system/design-compliance-report.json
          retention-days: 30
```

## Manual Setup

To set up the CI/CD workflow:

1. Create `.github/workflows/` directory if it doesn't exist
2. Create `design-compliance.yml` file
3. Copy the YAML content above
4. Commit and push

## Pre-commit Hook

You can also add a pre-commit hook:

```bash
#!/bin/sh
# .git/hooks/pre-commit

cd tools/design-system
npx tsx infrastructure-design-cli.ts fix --dry-run

if [ $? -ne 0 ]; then
  echo "❌ Design violations found. Run 'npx tsx infrastructure-design-cli.ts fix' to fix."
  exit 1
fi
```
