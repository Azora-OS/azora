import { PermissionManager } from '../PermissionManager';
import * as fs from 'fs/promises';
import { dialog } from 'electron';

// Mock electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      const paths: Record<string, string> = {
        userData: '/mock/user/data',
        home: '/mock/home',
        documents: '/mock/documents',
        desktop: '/mock/desktop',
      };
      return paths[name] || '/mock/path';
    }),
  },
  dialog: {
    showMessageBox: jest.fn(),
  },
}));

// Mock fs/promises
jest.mock('fs/promises');

describe('PermissionManager', () => {
  let permissionManager: PermissionManager;
  let mockWindow: any;

  beforeEach(() => {
    jest.clearAllMocks();
    permissionManager = new PermissionManager();
    mockWindow = { id: 1 };

    // Mock fs operations
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await permissionManager.initialize(mockWindow);
      
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should load existing config if available', async () => {
      const mockConfig = {
        version: '1.0.0',
        grants: [],
        networkAllowlist: [],
        autoGrantPatterns: [],
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      await permissionManager.initialize(mockWindow);
      
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should add default network allowlist entries', async () => {
      await permissionManager.initialize(mockWindow);
      
      const allowlist = permissionManager.getNetworkAllowlist();
      expect(allowlist.length).toBeGreaterThan(0);
      expect(allowlist.some(e => e.domain === 'api.openai.com')).toBe(true);
      expect(allowlist.some(e => e.domain === 'api.anthropic.com')).toBe(true);
    });
  });

  describe('requestPermission', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should auto-grant filesystem permissions for home directory', async () => {
      const granted = await permissionManager.requestPermission({
        type: 'filesystem:read',
        resource: '/mock/home/projects/test',
      });

      expect(granted).toBe(true);
      expect(dialog.showMessageBox).not.toHaveBeenCalled();
    });

    it('should prompt for non-auto-granted permissions', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 }); // Allow

      const granted = await permissionManager.requestPermission({
        type: 'network:request',
        resource: 'unknown-domain.com',
        reason: 'Test request',
      });

      expect(granted).toBe(true);
      expect(dialog.showMessageBox).toHaveBeenCalled();
    });

    it('should deny permission when user clicks Deny', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 }); // Deny

      const granted = await permissionManager.requestPermission({
        type: 'network:request',
        resource: 'unknown-domain.com',
      });

      expect(granted).toBe(false);
    });

    it('should grant permanent permission when user clicks Allow Always', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 2 }); // Allow Always

      const granted = await permissionManager.requestPermission({
        type: 'filesystem:write',
        resource: '/some/path',
      });

      expect(granted).toBe(true);
      
      const grants = permissionManager.getGrants();
      const grant = grants.find(g => g.resource === '/some/path');
      expect(grant?.permanent).toBe(true);
    });

    it('should reuse existing grant', async () => {
      await permissionManager.grantPermission('filesystem:read', '/test/path', true);

      const granted = await permissionManager.requestPermission({
        type: 'filesystem:read',
        resource: '/test/path',
      });

      expect(granted).toBe(true);
      expect(dialog.showMessageBox).not.toHaveBeenCalled();
    });

    it('should handle temporary permissions with expiration', async () => {
      const duration = 1000; // 1 second
      
      await permissionManager.grantPermission('filesystem:write', '/temp/path', false, duration);

      const grants = permissionManager.getGrants();
      const grant = grants.find(g => g.resource === '/temp/path');
      
      expect(grant?.permanent).toBe(false);
      expect(grant?.expiresAt).toBeDefined();
    });

    it('should log permission requests', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      await permissionManager.requestPermission({
        type: 'network:request',
        resource: 'test.com',
        reason: 'Testing',
      });

      const auditLog = permissionManager.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[auditLog.length - 1]).toMatchObject({
        type: 'network:request',
        resource: 'test.com',
        granted: true,
      });
    });
  });

  describe('grantPermission', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should grant permanent permission', async () => {
      await permissionManager.grantPermission('filesystem:read', '/test/path', true);

      const grants = permissionManager.getGrants();
      const grant = grants.find(g => g.resource === '/test/path');
      
      expect(grant).toBeDefined();
      expect(grant?.permanent).toBe(true);
      expect(grant?.expiresAt).toBeUndefined();
    });

    it('should grant temporary permission with expiration', async () => {
      const duration = 3600000; // 1 hour
      await permissionManager.grantPermission('filesystem:write', '/temp/path', false, duration);

      const grants = permissionManager.getGrants();
      const grant = grants.find(g => g.resource === '/temp/path');
      
      expect(grant).toBeDefined();
      expect(grant?.permanent).toBe(false);
      expect(grant?.expiresAt).toBeDefined();
    });

    it('should replace existing grant', async () => {
      await permissionManager.grantPermission('filesystem:read', '/test/path', false);
      await permissionManager.grantPermission('filesystem:read', '/test/path', true);

      const grants = permissionManager.getGrants();
      const matchingGrants = grants.filter(g => g.resource === '/test/path');
      
      expect(matchingGrants.length).toBe(1);
      expect(matchingGrants[0].permanent).toBe(true);
    });
  });

  describe('revokePermission', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should revoke existing permission', async () => {
      await permissionManager.grantPermission('filesystem:read', '/test/path', true);
      
      const revoked = await permissionManager.revokePermission('filesystem:read', '/test/path');
      expect(revoked).toBe(true);

      const grants = permissionManager.getGrants();
      expect(grants.find(g => g.resource === '/test/path')).toBeUndefined();
    });

    it('should return false for non-existent permission', async () => {
      const revoked = await permissionManager.revokePermission('filesystem:read', '/nonexistent');
      expect(revoked).toBe(false);
    });
  });

  describe('network allowlist', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should allow known safe domains', async () => {
      const allowed = await permissionManager.isNetworkAllowed('api.openai.com');
      expect(allowed).toBe(true);
    });

    it('should prompt for unknown domains', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 }); // Allow

      const allowed = await permissionManager.isNetworkAllowed('unknown-domain.com');
      
      expect(allowed).toBe(true);
      expect(dialog.showMessageBox).toHaveBeenCalled();
    });

    it('should add domain to allowlist', async () => {
      await permissionManager.addToNetworkAllowlist('test.com', true, 'Testing');

      const allowlist = permissionManager.getNetworkAllowlist();
      const entry = allowlist.find(e => e.domain === 'test.com');
      
      expect(entry).toBeDefined();
      expect(entry?.allowed).toBe(true);
      expect(entry?.reason).toBe('Testing');
    });

    it('should remove domain from allowlist', async () => {
      await permissionManager.addToNetworkAllowlist('test.com', true);
      
      const removed = await permissionManager.removeFromNetworkAllowlist('test.com');
      expect(removed).toBe(true);

      const allowlist = permissionManager.getNetworkAllowlist();
      expect(allowlist.find(e => e.domain === 'test.com')).toBeUndefined();
    });

    it('should block domains not in allowlist when user denies', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 }); // Deny

      const allowed = await permissionManager.isNetworkAllowed('blocked-domain.com');
      expect(allowed).toBe(false);
    });
  });

  describe('auto-grant patterns', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should add auto-grant pattern', async () => {
      await permissionManager.addAutoGrantPattern('/custom/path/**');

      const patterns = permissionManager.getAutoGrantPatterns();
      expect(patterns).toContain('/custom/path/**');
    });

    it('should remove auto-grant pattern', async () => {
      await permissionManager.addAutoGrantPattern('/custom/path/**');
      
      const removed = await permissionManager.removeAutoGrantPattern('/custom/path/**');
      expect(removed).toBe(true);

      const patterns = permissionManager.getAutoGrantPatterns();
      expect(patterns).not.toContain('/custom/path/**');
    });

    it('should not add duplicate patterns', async () => {
      await permissionManager.addAutoGrantPattern('/test/**');
      await permissionManager.addAutoGrantPattern('/test/**');

      const patterns = permissionManager.getAutoGrantPatterns();
      const count = patterns.filter(p => p === '/test/**').length;
      expect(count).toBe(1);
    });
  });

  describe('audit log', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should track permission requests in audit log', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      await permissionManager.requestPermission({
        type: 'filesystem:write',
        resource: '/test/path',
        reason: 'Test operation',
      });

      const auditLog = permissionManager.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
      
      const entry = auditLog[auditLog.length - 1];
      expect(entry.type).toBe('filesystem:write');
      expect(entry.resource).toBe('/test/path');
      expect(entry.granted).toBe(true);
    });

    it('should clear audit log', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      await permissionManager.requestPermission({
        type: 'filesystem:read',
        resource: '/test',
      });

      expect(permissionManager.getAuditLog().length).toBeGreaterThan(0);
      
      permissionManager.clearAuditLog();
      expect(permissionManager.getAuditLog()).toEqual([]);
    });

    it('should include timestamp in audit entries', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      const before = new Date();
      await permissionManager.requestPermission({
        type: 'filesystem:read',
        resource: '/test',
      });
      const after = new Date();

      const auditLog = permissionManager.getAuditLog();
      const entry = auditLog[auditLog.length - 1];
      
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getGrants', () => {
    beforeEach(async () => {
      await permissionManager.initialize(mockWindow);
    });

    it('should filter out expired grants', async () => {
      // Add expired grant
      await permissionManager.grantPermission('filesystem:read', '/expired', false, -1000);
      
      // Add valid grant
      await permissionManager.grantPermission('filesystem:read', '/valid', true);

      const grants = permissionManager.getGrants();
      expect(grants.find(g => g.resource === '/expired')).toBeUndefined();
      expect(grants.find(g => g.resource === '/valid')).toBeDefined();
    });

    it('should return all non-expired grants', async () => {
      await permissionManager.grantPermission('filesystem:read', '/path1', true);
      await permissionManager.grantPermission('filesystem:write', '/path2', true);
      await permissionManager.grantPermission('network:request', 'domain.com', true);

      const grants = permissionManager.getGrants();
      expect(grants.length).toBeGreaterThanOrEqual(3);
    });
  });
});
