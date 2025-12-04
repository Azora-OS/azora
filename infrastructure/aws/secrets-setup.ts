import { 
  SecretsManagerClient, 
  CreateSecretCommand, 
  GetSecretValueCommand,
  UpdateSecretCommand
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function setupAWSSecrets() {
  const secrets = [
    { name: 'azora/database/url', value: process.env.DATABASE_URL },
    { name: 'azora/jwt/secret', value: process.env.JWT_SECRET },
    { name: 'azora/stripe/secret', value: process.env.STRIPE_SECRET_KEY },
    { name: 'azora/openai/key', value: process.env.OPENAI_API_KEY },
    { name: 'azora/supabase/key', value: process.env.SUPABASE_SERVICE_ROLE_KEY }
  ];

  for (const secret of secrets) {
    if (!secret.value) continue;
    
    try {
      await client.send(new CreateSecretCommand({
        Name: secret.name,
        SecretString: secret.value
      }));
      console.log(`✅ Created secret: ${secret.name}`);
    } catch (error: any) {
      if (error.name === 'ResourceExistsException') {
        await client.send(new UpdateSecretCommand({
          SecretId: secret.name,
          SecretString: secret.value
        }));
        console.log(`🔄 Updated secret: ${secret.name}`);
      }
    }
  }
}

export async function getSecret(secretName: string): Promise<string> {
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  return response.SecretString || '';
}
