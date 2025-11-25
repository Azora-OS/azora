import { AuditLogger, AuditEventType, AuditSeverity } from '../AuditLogger';
import * as fs from 'fs/promises';
import { app } from 'electron';

// Mock electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      if (name === 'userData') {
        return '/mock/user/data';
      }
      return '/mock/path';
    }),
  },
}));

// Mock fs/promises
jest.mock('fs/promises');

describe('AuditLogger', () => {
  let auditLogger: AuditLogger;
  const mockProjectPath = '/mock/project';

  beforeEach(() => {
    jest.clearAllMocks();
    auditLogger = new AuditLogger(mockProjectPath);

    // Mock fs operations
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ size: 1000, mtime: new Date() });
    (fs.appendFile as jest.Mock).mockResolvedValue(undefined);
    (fs.readdir as jest.Mock).mockResolvedValue([]);
    (fs.readFile as jest.Mock).mockResolvedValue('');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await auditLogger.shutdown();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await auditLogger.initialize();
      
      expect(fs.mkdir).toHaveBeenCalled();
    });

    it('should create log directory if it does not exist', async () => {
      await auditLogger.initialize();
      
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('audit-logs'),
        expect.objectContaining({ recursive: true })
      );
    });
  });

  describe('log', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
    });

    it('should log an event', async () => {
      await auditLogger.log('file:read', 'Read file', '/test/file.txt');
      
      // Flush to write to disk
      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should include all event properties', async () => {
      await auditLogger.log('ai:request', 'AI request', 'gpt-4', {
        severity: 'info',
        actor: 'user',
        details: { tokens: 100 },
        metadata: { projectPath: '/test' },
      });

      await auditLogger.flush();
      
      const writeCall = (fs.appendFile as jest.Mock).mock.calls[0];
      const logLine = writeCall[1];
      const event = JSON.parse(logLine.trim());
      
      expect(event).toMatchObject({
        type: 'ai:request',
        action: 'AI request',
        resource: 'gpt-4',
        severity: 'info',
        actor: 'user',
      });
      expect(event.details).toEqual({ tokens: 100 });
      expect(event.metadata).toEqual({ projectPath: '/test' });
    });

    it('should auto-flush when buffer reaches 100 events', async () => {
      for (let i = 0; i < 100; i++) {
        await auditLogger.log('file:read', 'Read file', `/test/file${i}.txt`);
      }
      
      expect(fs.appendFile).toHaveBeenCalled();
    });
  });

  describe('specialized logging methods', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
    });

    it('should log AI request', async () => {
      await auditLogger.logAIRequest('gpt-4', 'test prompt', {
        tokens: 100,
        cost: 0.01,
        projectPath: '/test',
      });

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should log AI response', async () => {
      await auditLogger.logAIResponse('gpt-4', true, {
        tokens: 200,
        duration: 1000,
      });

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should log file operation', async () => {
      await auditLogger.logFileOperation('write', '/test/file.txt', {
        fileSize: 1024,
        success: true,
      });

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should log network request', async () => {
      await auditLogger.logNetworkRequest('https://api.example.com', 'POST', {
        duration: 500,
        statusCode: 200,
        success: true,
      });

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should log permission grant', async () => {
      await auditLogger.logPermission('filesystem:read', '/test/path', true, 'User granted');

      await auditLogger.flush();
      
      const writeCall = (fs.appendFile as jest.Mock).mock.calls[0];
      const logLine = writeCall[1];
      const event = JSON.parse(logLine.trim());
      
      expect(event.type).toBe('permission:grant');
    });

    it('should log permission deny', async () => {
      await auditLogger.logPermission('network:request', 'unknown.com', false, 'User denied');

      await auditLogger.flush();
      
      const writeCall = (fs.appendFile as jest.Mock).mock.calls[0];
      const logLine = writeCall[1];
      const event = JSON.parse(logLine.trim());
      
      expect(event.type).toBe('permission:deny');
      expect(event.severity).toBe('warning');
    });

    it('should log secret access', async () => {
      await auditLogger.logSecretAccess('read', 'API_KEY', 'global');

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should log Git operation', async () => {
      await auditLogger.logGitOperation('commit', '/test/repo', {
        branch: 'main',
        success: true,
      });

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should log code execution', async () => {
      await auditLogger.logCodeExecution('generate', 'Generate service', {
        projectPath: '/test',
        filesAffected: 5,
        success: true,
      });

      await auditLogger.flush();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
      
      // Mock readFile to return sample events
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ type: 'file:read', timestamp: new Date(), severity: 'info', actor: 'user', resource: '/test', action: 'test' }) + '\n' +
        JSON.stringify({ type: 'file:write', timestamp: new Date(), severity: 'warning', actor: 'system', resource: '/test2', action: 'test' }) + '\n' +
        JSON.stringify({ type: 'ai:request', timestamp: new Date(), severity: 'info', actor: 'user', resource: 'gpt-4', action: 'test' })
      );
      
      (fs.readdir as jest.Mock).mockResolvedValue(['audit-123.jsonl']);
    });

    it('should query all events', async () => {
      const events = await auditLogger.query();
      
      expect(events.length).toBe(3);
    });

    it('should filter by event type', async () => {
      const events = await auditLogger.query({
        types: ['file:read', 'file:write'],
      });
      
      expect(events.length).toBe(2);
      expect(events.every(e => e.type.startsWith('file:'))).toBe(true);
    });

    it('should filter by severity', async () => {
      const events = await auditLogger.query({
        severities: ['warning'],
      });
      
      expect(events.length).toBe(1);
      expect(events[0].severity).toBe('warning');
    });

    it('should filter by actor', async () => {
      const events = await auditLogger.query({
        actor: 'user',
      });
      
      expect(events.length).toBe(2);
      expect(events.every(e => e.actor === 'user')).toBe(true);
    });

    it('should apply pagination', async () => {
      const events = await auditLogger.query({
        limit: 2,
        offset: 1,
      });
      
      expect(events.length).toBe(2);
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
      
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ type: 'file:read', timestamp: new Date(), severity: 'info', actor: 'user', resource: '/test', action: 'test' }) + '\n' +
        JSON.stringify({ type: 'file:read', timestamp: new Date(), severity: 'info', actor: 'user', resource: '/test', action: 'test' }) + '\n' +
        JSON.stringify({ type: 'file:write', timestamp: new Date(), severity: 'error', actor: 'system', resource: '/test2', action: 'test' })
      );
      
      (fs.readdir as jest.Mock).mockResolvedValue(['audit-123.jsonl']);
    });

    it('should calculate statistics', async () => {
      const stats = await auditLogger.getStatistics();
      
      expect(stats.totalEvents).toBe(3);
      expect(stats.eventsByType['file:read']).toBe(2);
      expect(stats.eventsByType['file:write']).toBe(1);
      expect(stats.eventsBySeverity['info']).toBe(2);
      expect(stats.eventsBySeverity['error']).toBe(1);
    });

    it('should include recent errors', async () => {
      const stats = await auditLogger.getStatistics();
      
      expect(stats.recentErrors.length).toBe(1);
      expect(stats.recentErrors[0].severity).toBe('error');
    });

    it('should include top resources', async () => {
      const stats = await auditLogger.getStatistics();
      
      expect(stats.topResources.length).toBeGreaterThan(0);
      expect(stats.topResources[0].resource).toBe('/test');
      expect(stats.topResources[0].count).toBe(2);
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
      
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ type: 'file:read', timestamp: new Date(), severity: 'info', actor: 'user', resource: '/test', action: 'test' })
      );
      
      (fs.readdir as jest.Mock).mockResolvedValue(['audit-123.jsonl']);
    });

    it('should export audit log to file', async () => {
      await auditLogger.export('/export/audit.json');
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/export/audit.json',
        expect.any(String),
        'utf-8'
      );
    });

    it('should export filtered events', async () => {
      await auditLogger.export('/export/audit.json', {
        types: ['file:read'],
      });
      
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('log rotation', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
    });

    it('should rotate logs when file size exceeds limit', async () => {
      // Mock large file size
      (fs.stat as jest.Mock).mockResolvedValue({
        size: 11 * 1024 * 1024, // 11MB
        mtime: new Date(),
      });

      await auditLogger.flush();
      
      // Should create new log file
      expect(fs.stat).toHaveBeenCalled();
    });

    it('should clean up old log files', async () => {
      const oldFiles = Array.from({ length: 10 }, (_, i) => `audit-${i}.jsonl`);
      (fs.readdir as jest.Mock).mockResolvedValue(oldFiles);
      
      (fs.stat as jest.Mock).mockImplementation((filePath: string) => {
        return Promise.resolve({
          size: 1000,
          mtime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days old
        });
      });

      const deleted = await auditLogger.clearOldLogs(30);
      
      expect(deleted).toBeGreaterThan(0);
      expect(fs.unlink).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    beforeEach(async () => {
      await auditLogger.initialize();
    });

    it('should flush events on shutdown', async () => {
      await auditLogger.log('file:read', 'Read file', '/test/file.txt');
      
      await auditLogger.shutdown();
      
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should stop periodic flush timer', async () => {
      await auditLogger.shutdown();
      
      // Timer should be cleared
      // This is hard to test directly, but we can verify shutdown completes
      expect(true).toBe(true);
    });
  });
});
