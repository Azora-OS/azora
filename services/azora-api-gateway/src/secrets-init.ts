import { loadSecretsToEnv } from '../../../infrastructure/aws/secrets-loader';

export async function initializeSecrets() {
  if (process.env.NODE_ENV === 'production') {
    await loadSecretsToEnv();
    console.log('✅ AWS Secrets loaded');
  }
}
