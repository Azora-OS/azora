# Permission System

The Permission System in AzStudio provides a comprehensive security layer for managing file system access, network requests, and other sensitive operations. It ensures that all operations requiring elevated privileges are explicitly authorized by the user.

## Overview

The permission system consists of three main components:

1. **PermissionManager** - Core service that handles permission requests, grants, and revocations
2. **NetworkSandbox** - Enforces network request allowlisting and monitors network activity
3. **PermissionPanel** - UI component for managing permissions and viewing audit logs

## Features

### Permission Prompts

When AzStudio needs to perform a sensitive operation, it displays a clear permission prompt to the user with:

- **Permission Type** - What kind of access is being requested (filesystem, network, etc.)
- **Resource** - The specific file, directory, or domain being accessed
- **Reason** - Why this permission is needed (optional)
- **Options** - Allow once, Deny, or Allow Always

### Permission Types

The system supports the following permission types:

- `filesystem:read` - Read files from a directory
- `filesystem:write` - Write files to a directory
- `filesystem:delete` - Delete files from a directory
- `network:request` - Make network requests to a domain
- `network:external-api` - Access external APIs
- `process:execute` - Execute external processes
- `git:operation` - Perform Git operations

### Network Allowlist

The network allowlist controls which domains AzStudio can communicate with:

- **Default Safe Domains** - Pre-approved domains for AI APIs (OpenAI, Anthropic, etc.)
- **User-Added Domains** - Domains explicitly allowed by the user
- **Blocked Domains** - Domains explicitly blocked by the user
- **Automatic Prompts** - Unknown domains trigger permission prompts

### Auto-Grant Patterns

Auto-grant patterns allow automatic approval of file system operations for trusted paths:

- **Pattern Syntax** - Use `**` for recursive matching, `*` for single-level matching
- **Default Patterns** - Home directory, Documents, and Desktop are auto-granted by default
- **Custom Patterns** - Users can add their own trusted path patterns

### Audit Logging

All permission requests and grants are logged for security auditing:

- **Timestamp** - When the permission was requested
- **Type** - What kind of permission was requested
- **Resource** - What resource was accessed
- **Granted/Denied** - Whether the permission was granted
- **Reason** - Why the permission was requested (if provided)

## Usage

### From the UI

1. Open the Permission Panel from the sidebar
2. Navigate between tabs:
   - **Permission Grants** - View and revoke active permissions
   - **Network Allowlist** - Manage allowed/blocked domains
   - **Auto-Grant Patterns** - Configure trusted path patterns
   - **Audit Log** - View permission request history

### From Code

#### Request Permission

```typescript
const result = await window.electronAPI.permissions.request({
  type: 'filesystem:write',
  resource: '/path/to/directory',
  reason: 'Save project files',
  temporary: true,
  duration: 3600000, // 1 hour
});

if (result.success && result.granted) {
  // Permission granted, proceed with operation
}
```

#### Check Network Permission

```typescript
const result = await window.electronAPI.permissions.isNetworkAllowed('api.example.com');

if (result.success && result.allowed) {
  // Domain is allowed, make request
}
```

#### Add Domain to Allowlist

```typescript
await window.electronAPI.permissions.addToNetworkAllowlist(
  'api.example.com',
  true,
  'Required for feature X'
);
```

#### Get Permission Grants

```typescript
const result = await window.electronAPI.permissions.getGrants();

if (result.success) {
  const grants = result.grants;
  // Process grants
}
```

#### Revoke Permission

```typescript
await window.electronAPI.permissions.revoke(
  'filesystem:write',
  '/path/to/directory'
);
```

## Security Considerations

### Local-First Architecture

- All permission checks happen locally on the user's machine
- No permission data is sent to external servers
- Permission configuration is stored securely in the user's data directory

### Temporary vs Permanent Grants

- **Temporary Grants** - Expire after a specified duration (default: 1 hour)
- **Permanent Grants** - Remain active until explicitly revoked
- Users can choose the grant type when approving permissions

### Auto-Grant Safety

- Auto-grant patterns only apply to file system operations
- Network requests always require explicit approval (except known safe domains)
- Process execution always requires explicit approval

### Audit Trail

- All permission requests are logged with timestamps
- Audit logs are stored locally and can be exported
- Logs include both granted and denied requests
- Old logs can be automatically cleaned up

## Configuration

### Permission Configuration File

Permissions are stored in `{userData}/permissions.json`:

```json
{
  "version": "1.0.0",
  "grants": [
    {
      "type": "filesystem:write",
      "resource": "/path/to/project",
      "granted": true,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "permanent": true
    }
  ],
  "networkAllowlist": [
    {
      "domain": "api.openai.com",
      "allowed": true,
      "addedAt": "2024-01-01T00:00:00.000Z",
      "reason": "OpenAI API for AI features"
    }
  ],
  "autoGrantPatterns": [
    "/home/user/**",
    "/Users/user/Documents/**"
  ]
}
```

### Default Network Allowlist

The following domains are allowed by default:

- `api.openai.com` - OpenAI API
- `api.anthropic.com` - Anthropic API
- `api.elevenlabs.io` - ElevenLabs API
- `api.heygen.com` - HeyGen API
- `github.com` - GitHub
- `api.github.com` - GitHub API

## Best Practices

### For Users

1. **Review Permissions Regularly** - Check the Permission Grants tab periodically
2. **Use Temporary Grants** - For one-time operations, use temporary grants
3. **Be Cautious with Auto-Grant** - Only add trusted paths to auto-grant patterns
4. **Monitor Audit Log** - Review the audit log for unexpected permission requests

### For Developers

1. **Provide Clear Reasons** - Always include a reason when requesting permissions
2. **Request Minimal Permissions** - Only request the permissions you need
3. **Handle Denials Gracefully** - Provide fallback behavior when permissions are denied
4. **Use Appropriate Types** - Choose the most specific permission type for your operation

## Troubleshooting

### Permission Denied Errors

If you encounter permission denied errors:

1. Check the Permission Grants tab to see if the permission exists
2. Check if the permission has expired (temporary grants)
3. Try requesting the permission again
4. Check the Audit Log to see if the request was denied

### Network Request Blocked

If network requests are being blocked:

1. Check the Network Allowlist tab
2. Verify the domain is in the allowlist
3. Check if the domain is explicitly blocked
4. Try adding the domain manually

### Auto-Grant Not Working

If auto-grant patterns aren't working:

1. Verify the pattern syntax (use `**` for recursive, `*` for single-level)
2. Check that the pattern matches the resource path
3. Remember that auto-grant only works for file system operations
4. Check the Auto-Grant Patterns tab to see configured patterns

## API Reference

### PermissionManager

#### Methods

- `requestPermission(options)` - Request a permission from the user
- `grantPermission(type, resource, permanent, duration)` - Grant a permission
- `revokePermission(type, resource)` - Revoke a permission
- `getGrants()` - Get all active permission grants
- `isNetworkAllowed(domain)` - Check if a domain is allowed
- `addToNetworkAllowlist(domain, allowed, reason)` - Add domain to allowlist
- `removeFromNetworkAllowlist(domain)` - Remove domain from allowlist
- `getNetworkAllowlist()` - Get the network allowlist
- `getAuditLog()` - Get the permission audit log
- `addAutoGrantPattern(pattern)` - Add an auto-grant pattern
- `removeAutoGrantPattern(pattern)` - Remove an auto-grant pattern
- `getAutoGrantPatterns()` - Get all auto-grant patterns

### NetworkSandbox

#### Methods

- `request(url, options)` - Make a sandboxed network request
- `get(url, options)` - Make a GET request
- `post(url, body, options)` - Make a POST request
- `put(url, body, options)` - Make a PUT request
- `delete(url, options)` - Make a DELETE request
- `getActiveRequests()` - Get currently active network requests
- `getStatistics()` - Get network activity statistics
- `blockDomain(domain, reason)` - Block a domain
- `unblockDomain(domain, reason)` - Unblock a domain

## Related Documentation

- [Security Best Practices](./SECURITY-BEST-PRACTICES.md)
- [Secrets Management](./SECURITY-SECRETS-MANAGEMENT.md)
- [Audit Logging](./AUDIT-LOGGING.md)
- [Network Sandbox](./NETWORK-SANDBOX.md)
