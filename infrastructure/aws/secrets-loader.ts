import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function loadSecretsToEnv() {
  const secretNames = [
    'azora/database/url',
    'azora/jwt/secret',
    'azora/stripe/secret',
    'azora/openai/key',
    'azora/supabase/key'
  ];

  for (const secretName of secretNames) {
    try {
      const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
      const envKey = secretName.split('/').slice(1).join('_').toUpperCase();
      process.env[envKey] = response.SecretString || '';
    } catch (error) {
      console.warn(`⚠️ Could not load secret: ${secretName}`);
    }
  }
}
