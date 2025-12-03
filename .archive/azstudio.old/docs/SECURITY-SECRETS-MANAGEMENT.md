# Security and Secrets Management

This document describes the security and secrets management system implemented in AzStudio.

## Overview

AzStudio implements a comprehensive security layer that includes:

1. **Secrets Vault** - Encrypted storage for API keys, credentials, and sensitive data
2. **Permission System** - User consent and authorization for sensitive operations
3. **Audit Logging** - Complete audit trail of all security-sensitive operations
4. **Network Sandboxing** - Domain allowlisting and network request monitoring

## Components

### 1. SecretsVault

The `SecretsVault` service provides secure storage for sensitive data using AES-256-GCM encryption.

**Features:**
- OS keychain integration for master key storage
- Project and global scope support
- Encrypted storage with AES-256-GCM
- Audit logging of all operations
- Automatic key generation and rotation

**Usage:**

```typescript
import { SecretsVault } from './services/SecretsVault';

// Create vault instance
const vault = new SecretsVault('/path/to/project');
await vault.initialize();

// Store a secret
await vault.setSecret('API_KEY', 'secret-value-123', 'global');

// Retrieve a secret
const apiKey = await vault.getSecret('API_KEY', 'global');

// Delete a secret
await vault.deleteSecret('API_KEY', 'global');

// List all secrets
const keys = await vault.listSecrets('global');

// Get audit log
const auditLog = vault.getAuditLog();
```

**Security:**
- Master key stored in OS-specific secure location
- All secrets encrypted at rest
- File permissions set to 0600 (owner read/write only)
- Audit trail of all access

### 2. PermissionManager

The `PermissionManager` service handles all permission requests and grants for sensitive operations.

**Features:**
- Permission prompts with clear explanations
- Network request allowlisting
- Temporary and permanent grants
- Auto-grant patterns for trusted paths
- Audit logging of all permission grants

**Permission Types:**
- `filesystem:read` - Read files from disk
- `filesystem:write` - Write files to disk
- `filesystem:delete` - Delete files from disk
- `network:request` - Make network requests
- `network:external-api` - Access external APIs
- `process:execute` - Execute processes
- `git:operation` - Perform Git operations

**Usage:**

```typescript
import { PermissionManager } from './services/PermissionManager';

// Create permission manager
const permissionManager = new PermissionManager();
await permissionManager.initialize(mainWindow);

// Request permission
const granted = await permissionManager.requestPermission({
  type: 'filesystem:write',
  resource: '/path/to/file',
  reason: 'Save generated code',
});

// Check network allowlist
const allowed = await permissionManager.isNetworkAllowed('api.openai.com');

// Add to network allowlist
await permissionManager.addToNetworkAllowlist('api.example.com', true, 'Trusted API');

// Get all grants
const grants = permissionManager.getGrants();

// Get audit log
const auditLog = permissionManager.getAuditLog();
```

**Default Allowlist:**
- `api.openai.com` - OpenAI API
- `api.anthropic.com` - Anthropic API
- `api.elevenlabs.io` - ElevenLabs API
- `api.heygen.com` - HeyGen API
- `github.com` - GitHub
- `api.github.com` - GitHub API

### 3. AuditLogger

The `AuditLogger` service provides comprehensive audit logging for all sensitive operations.

**Features:**
- Structured event logging with metadata
- Queryable audit trail
- Automatic log rotation
- Export capabilities
- Real-time statistics

**Event Types:**
- `ai:request` / `ai:response` - AI API calls
- `file:read` / `file:write` / `file:delete` / `file:create` - File operations
- `network:request` / `network:response` - Network requests
- `permission:grant` / `permission:deny` - Permission decisions
- `secret:read` / `secret:write` / `secret:delete` - Secret access
- `git:commit` / `git:push` / `git:pull` - Git operations
- `code:execute` / `code:generate` - Code operations

**Usage:**

```typescript
import { AuditLogger } from './services/AuditLogger';

// Create audit logger
const auditLogger = new AuditLogger('/path/to/project');
await auditLogger.initialize();

// Log an event
await auditLogger.log('file:write', 'Write file', '/path/to/file', {
  severity: 'info',
  actor: 'user',
  details: { fileSize: 1024 },
  metadata: { success: true },
});

// Specialized logging methods
await auditLogger.logAIRequest('gpt-4', 'Generate code', { tokens: 100 });
await auditLogger.logFileOperation('write', '/path/to/file', { fileSize: 1024 });
await auditLogger.logNetworkRequest('https://api.example.com', 'POST', { statusCode: 200 });
await auditLogger.logPermission('filesystem:write', '/path', true, 'User granted');
await auditLogger.logSecretAccess('read', 'API_KEY', 'global');
await auditLogger.logGitOperation('commit', '/repo', { branch: 'main' });

// Query events
const events = await auditLogger.query({
  startDate: new Date('2024-01-01'),
  types: ['file:write', 'file:delete'],
  severities: ['error', 'critical'],
  limit: 100,
});

// Get statistics
const stats = await auditLogger.getStatistics();

// Export audit log
await auditLogger.export('/path/to/export.json', {
  startDate: new Date('2024-01-01'),
});

// Clear old logs
const deletedCount = await auditLogger.clearOldLogs(30); // Keep last 30 days
```

**Log Rotation:**
- Maximum log file size: 10MB
- Maximum log files: 5
- Automatic rotation when size exceeded
- Old files automatically cleaned up

### 4. NetworkSandbox

The `NetworkSandbox` service provides a secure layer for all network requests.

**Features:**
- Domain allowlist enforcement
- Permission prompts for unknown domains
- Request/response logging
- Network activity monitoring
- Rate limiting per domain (60 requests/minute)
- Request timeout enforcement (30 seconds default)

**Usage:**

```typescript
import { NetworkSandbox } from './services/NetworkSandbox';

// Create network sandbox
const networkSandbox = new NetworkSandbox(permissionManager, auditLogger);

// Make requests
const response = await networkSandbox.get('https://api.example.com/data');
const response = await networkSandbox.post('https://api.example.com/data', '{"key": "value"}');
const response = await networkSandbox.put('https://api.example.com/data', '{"key": "value"}');
const response = await networkSandbox.delete('https://api.example.com/data');

// Generic request
const response = await networkSandbox.request('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{"key": "value"}',
  timeout: 10000,
});

// Block/unblock domains
await networkSandbox.blockDomain('malicious.com', 'Security threat');
await networkSandbox.unblockDomain('safe.com', 'Verified safe');

// Monitor activity
const activeRequests = networkSandbox.getActiveRequests();
const statistics = networkSandbox.getStatistics();
```

**Rate Limiting:**
- 60 requests per minute per domain
- Automatic reset after 1 minute
- Rate limit errors logged to audit log

## IPC API

All security services are exposed to the renderer process via IPC:

### Secrets Vault

```typescript
// Initialize vault
await window.electronAPI.secrets.initialize(projectPath);

// Set secret
await window.electronAPI.secrets.set('API_KEY', 'value', 'global', projectPath);

// Get secret
const result = await window.electronAPI.secrets.get('API_KEY', 'global', projectPath);

// Delete secret
await window.electronAPI.secrets.delete('API_KEY', 'global', projectPath);

// List secrets
const result = await window.electronAPI.secrets.list('global', projectPath);

// Get audit log
const result = await window.electronAPI.secrets.getAuditLog(projectPath);
```

### Permissions

```typescript
// Request permission
const result = await window.electronAPI.permissions.request({
  type: 'filesystem:write',
  resource: '/path/to/file',
  reason: 'Save generated code',
});

// Grant permission
await window.electronAPI.permissions.grant('filesystem:write', '/path', true);

// Revoke permission
await window.electronAPI.permissions.revoke('filesystem:write', '/path');

// Get grants
const result = await window.electronAPI.permissions.getGrants();

// Network allowlist
const result = await window.electronAPI.permissions.isNetworkAllowed('api.example.com');
await window.electronAPI.permissions.addToNetworkAllowlist('api.example.com', true);
await window.electronAPI.permissions.removeFromNetworkAllowlist('api.example.com');
const result = await window.electronAPI.permissions.getNetworkAllowlist();

// Audit log
const result = await window.electronAPI.permissions.getAuditLog();

// Auto-grant patterns
await window.electronAPI.permissions.addAutoGrantPattern('/trusted/path/**');
await window.electronAPI.permissions.removeAutoGrantPattern('/trusted/path/**');
const result = await window.electronAPI.permissions.getAutoGrantPatterns();
```

### Audit Logging

```typescript
// Log event
await window.electronAPI.audit.log('file:write', 'Write file', '/path', options, projectPath);

// Query events
const result = await window.electronAPI.audit.query({
  startDate: new Date('2024-01-01'),
  types: ['file:write'],
}, projectPath);

// Get statistics
const result = await window.electronAPI.audit.getStatistics(projectPath);

// Export
await window.electronAPI.audit.export('/path/to/export.json', options, projectPath);

// Clear old logs
const result = await window.electronAPI.audit.clearOldLogs(30, projectPath);
```

### Network Sandbox

```typescript
// Make requests
const result = await window.electronAPI.network.get('https://api.example.com/data');
const result = await window.electronAPI.network.post('https://api.example.com/data', '{"key": "value"}');
const result = await window.electronAPI.network.put('https://api.example.com/data', '{"key": "value"}');
const result = await window.electronAPI.network.delete('https://api.example.com/data');

// Generic request
const result = await window.electronAPI.network.request('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{"key": "value"}',
});

// Block/unblock domains
await window.electronAPI.network.blockDomain('malicious.com', 'Security threat');
await window.electronAPI.network.unblockDomain('safe.com', 'Verified safe');

// Monitor activity
const result = await window.electronAPI.network.getActiveRequests();
const result = await window.electronAPI.network.getStatistics();
```

## Security Best Practices

### For Developers

1. **Always use SecretsVault for sensitive data**
   - Never store API keys or credentials in plain text
   - Use project scope for project-specific secrets
   - Use global scope for user-wide secrets

2. **Request permissions before sensitive operations**
   - Always check permissions before file operations
   - Request network permissions for external APIs
   - Provide clear reasons in permission requests

3. **Log all security-sensitive operations**
   - Use AuditLogger for all file, network, and secret operations
   - Include relevant metadata in log entries
   - Review audit logs regularly

4. **Use NetworkSandbox for all network requests**
   - Never bypass the network sandbox
   - Add trusted domains to allowlist
   - Monitor network activity for suspicious patterns

### For Users

1. **Review permission requests carefully**
   - Understand what each permission grants
   - Deny permissions for untrusted operations
   - Use temporary permissions when possible

2. **Manage network allowlist**
   - Review allowed domains regularly
   - Block suspicious domains immediately
   - Only allow trusted APIs

3. **Monitor audit logs**
   - Review audit logs for suspicious activity
   - Export logs for compliance purposes
   - Clear old logs to save space

4. **Protect secrets**
   - Use strong, unique secrets
   - Rotate secrets regularly
   - Delete unused secrets

## File Locations

### Global (User-wide)

- Secrets vault: `{userData}/.master-key`, `{userData}/secrets-vault.json`
- Permissions: `{userData}/permissions.json`
- Audit logs: `{userData}/audit-logs/`

### Project-specific

- Secrets vault: `{projectPath}/.azstudio/secrets-vault.json`
- Audit logs: `{projectPath}/.azstudio/audit-logs/`

## Testing

All security services include comprehensive unit tests:

```bash
# Run all security tests
npm test -- --testPathPattern="SecretsVault|PermissionManager|AuditLogger|NetworkSandbox"

# Run specific test
npm test -- SecretsVault.test.ts
npm test -- PermissionManager.test.ts
npm test -- AuditLogger.test.ts
npm test -- NetworkSandbox.test.ts
```

## Future Enhancements

1. **Hardware Security Module (HSM) support**
   - Integration with hardware security modules
   - Enhanced key protection

2. **Multi-factor authentication**
   - Require MFA for sensitive operations
   - Support for TOTP, WebAuthn

3. **Advanced threat detection**
   - Anomaly detection in audit logs
   - Automatic blocking of suspicious activity

4. **Compliance reporting**
   - GDPR compliance reports
   - SOC 2 audit trails
   - HIPAA compliance features

5. **Secret sharing**
   - Secure secret sharing between team members
   - Time-limited secret access
   - Secret rotation policies
