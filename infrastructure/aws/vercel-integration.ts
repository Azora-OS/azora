import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function getVercelEnvVars() {
  const secrets = [
    { aws: 'azora/database/url', vercel: 'DATABASE_URL' },
    { aws: 'azora/jwt/secret', vercel: 'JWT_SECRET' },
    { aws: 'azora/stripe/secret', vercel: 'STRIPE_SECRET_KEY' },
    { aws: 'azora/openai/key', vercel: 'OPENAI_API_KEY' },
    { aws: 'azora/supabase/key', vercel: 'SUPABASE_SERVICE_ROLE_KEY' }
  ];

  const envVars: Record<string, string> = {};

  for (const secret of secrets) {
    try {
      const response = await client.send(new GetSecretValueCommand({ SecretId: secret.aws }));
      if (response.SecretString) {
        envVars[secret.vercel] = response.SecretString;
      }
    } catch (error) {
      console.warn(`⚠️ Could not load ${secret.aws}`);
    }
  }

  return envVars;
}
