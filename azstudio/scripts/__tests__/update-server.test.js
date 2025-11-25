/**
 * Tests for Update Server
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Mock the release directory
const MOCK_RELEASE_DIR = path.join(__dirname, '__mocks__', 'release');

describe('Update Server', () => {
  let app;
  let server;

  beforeAll(() => {
    // Create mock release structure
    const channels = ['alpha', 'beta', 'stable'];
    channels.forEach(channel => {
      const channelDir = path.join(MOCK_RELEASE_DIR, channel);
      if (!fs.existsSync(channelDir)) {
        fs.mkdirSync(channelDir, { recursive: true });
      }

      // Create mock version directory
      const versionDir = path.join(channelDir, '0.1.0');
      if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir, { recursive: true });
      }

      // Create mock manifest
      const manifest = `version: 0.1.0
releaseDate: 2025-01-15T10:00:00.000Z
files:
  - url: https://updates.azora.com/${channel}/0.1.0/AzStudio-Setup-0.1.0.exe
    sha512: mock-hash
    size: 123456789
`;
      fs.writeFileSync(path.join(channelDir, 'latest.yml'), manifest);
      fs.writeFileSync(path.join(versionDir, 'latest.yml'), manifest);

      // Create mock installer
      fs.writeFileSync(
        path.join(versionDir, 'AzStudio-Setup-0.1.0.exe'),
        'mock installer content'
      );

      // Create mock release notes
      fs.writeFileSync(
        path.join(versionDir, 'RELEASE_NOTES.md'),
        '# Release 0.1.0\n\nInitial release'
      );
    });

    // Create config and analytics directories
    ['config', 'analytics'].forEach(dir => {
      const dirPath = path.join(MOCK_RELEASE_DIR, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Start server with mock directory
    process.env.RELEASE_DIR = MOCK_RELEASE_DIR;
    app = require('../update-server');
  });

  afterAll((done) => {
    // Cleanup mock directory
    if (fs.existsSync(MOCK_RELEASE_DIR)) {
      fs.rmSync(MOCK_RELEASE_DIR, { recursive: true, force: true });
    }
    done();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('channels');
      expect(response.body.channels).toEqual(['alpha', 'beta', 'stable']);
    });
  });

  describe('GET /latest', () => {
    it('should return latest manifest for stable channel', async () => {
      const response = await request(app)
        .get('/latest')
        .query({ channel: 'stable' });
      
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/yaml');
      expect(response.text).toContain('version: 0.1.0');
    });

    it('should return latest manifest for alpha channel', async () => {
      const response = await request(app)
        .get('/latest')
        .query({ channel: 'alpha' });
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('version: 0.1.0');
    });

    it('should return 404 for non-existent channel', async () => {
      const response = await request(app)
        .get('/latest')
        .query({ channel: 'nonexistent' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /versions', () => {
    it('should list available versions', async () => {
      const response = await request(app)
        .get('/versions')
        .query({ channel: 'stable' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('channel', 'stable');
      expect(response.body).toHaveProperty('versions');
      expect(Array.isArray(response.body.versions)).toBe(true);
      expect(response.body.versions).toContain('0.1.0');
    });

    it('should return empty array for channel with no versions', async () => {
      const response = await request(app)
        .get('/versions')
        .query({ channel: 'nonexistent' });
      
      expect(response.status).toBe(200);
      expect(response.body.versions).toEqual([]);
    });
  });

  describe('GET /version/:version', () => {
    it('should return version info', async () => {
      const response = await request(app)
        .get('/version/0.1.0')
        .query({ channel: 'stable' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version', '0.1.0');
      expect(response.body).toHaveProperty('channel', 'stable');
      expect(response.body).toHaveProperty('files');
      expect(response.body).toHaveProperty('releaseNotes');
      expect(Array.isArray(response.body.files)).toBe(true);
    });

    it('should return 404 for non-existent version', async () => {
      const response = await request(app)
        .get('/version/9.9.9')
        .query({ channel: 'stable' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /report/install', () => {
    it('should accept installation report', async () => {
      const response = await request(app)
        .post('/report/install')
        .send({
          channel: 'stable',
          version: '0.1.0',
          previousVersion: '0.0.9',
          clientId: 'test-client'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject invalid installation report', async () => {
      const response = await request(app)
        .post('/report/install')
        .send({
          channel: 'stable'
          // missing version
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /report/rollback', () => {
    it('should accept rollback report', async () => {
      const response = await request(app)
        .post('/report/rollback')
        .send({
          channel: 'stable',
          fromVersion: '0.1.0',
          toVersion: '0.0.9',
          reason: 'Installation failed',
          clientId: 'test-client'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject invalid rollback report', async () => {
      const response = await request(app)
        .post('/report/rollback')
        .send({
          channel: 'stable'
          // missing versions
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Staged Rollout', () => {
    describe('POST /admin/rollout/:channel', () => {
      it('should configure staged rollout', async () => {
        const response = await request(app)
          .post('/admin/rollout/stable')
          .send({
            version: '0.1.0',
            percentage: 50,
            startDate: new Date().toISOString()
          });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.config).toHaveProperty('percentage', 50);
      });

      it('should reject invalid percentage', async () => {
        const response = await request(app)
          .post('/admin/rollout/stable')
          .send({
            version: '0.1.0',
            percentage: 150 // invalid
          });
        
        expect(response.status).toBe(400);
      });

      it('should reject invalid channel', async () => {
        const response = await request(app)
          .post('/admin/rollout/invalid')
          .send({
            version: '0.1.0',
            percentage: 50
          });
        
        expect(response.status).toBe(400);
      });
    });

    describe('GET /admin/rollout/:channel', () => {
      it('should return rollout configuration', async () => {
        const response = await request(app)
          .get('/admin/rollout/stable');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('percentage');
      });
    });
  });

  describe('GET /admin/analytics', () => {
    it('should return analytics data', async () => {
      const response = await request(app)
        .get('/admin/analytics')
        .query({ days: 7 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('period');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Delta Updates', () => {
    it('should return 404 for non-existent delta', async () => {
      const response = await request(app)
        .get('/delta/stable/0.0.9/0.1.0');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('fallback');
    });
  });
});
