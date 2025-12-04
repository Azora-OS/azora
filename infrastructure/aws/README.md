# AWS Secrets Manager Integration

## Setup

1. **Configure GitHub Secrets** (Already done):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Install Dependencies**:
```bash
cd infrastructure/aws
npm install
```

3. **Sync Secrets to AWS**:
```bash
npm run setup
```

## Usage in Backend

```typescript
import { loadSecretsToEnv } from '@/infrastructure/aws/secrets-loader';

// Load secrets at startup
await loadSecretsToEnv();

// Now use process.env as normal
const dbUrl = process.env.DATABASE_URL;
```

## GitHub Actions Auto-Sync

Secrets automatically sync to AWS when:
- Workflow is manually triggered
- Changes pushed to main branch

## AWS IAM Policy Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:UpdateSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:azora/*"
    }
  ]
}
```
