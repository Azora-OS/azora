import request from 'supertest';
import express from 'express';
import accessibilityRouter from '../accessibility.routes';
import { accessibilityService } from '../../services/accessibility.service';

jest.mock('../../services/accessibility.service');

const app = express();
app.use(express.json());
app.use('/', accessibilityRouter);

describe('Accessibility Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /accessibility/settings', () => {
    it('should return accessibility settings', async () => {
      const mockSettings = {
        userId: 'user-1',
        captions: false,
        transcripts: false,
        screenReaderMode: false,
        keyboardNavigation: false,
        highContrast: false,
        fontSize: 'medium',
        language: 'en',
      };

      (accessibilityService.getAccessibilitySettings as jest.Mock).mockResolvedValue(
        mockSettings
      );

      const response = await request(app).get('/accessibility/settings?userId=user-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSettings);
    });

    it('should return 400 if userId missing', async () => {
      const response = await request(app).get('/accessibility/settings');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('userId query parameter is required');
    });
  });

  describe('POST /accessibility/settings', () => {
    it('should update accessibility settings', async () => {
      const mockSettings = {
        userId: 'user-1',
        captions: true,
        transcripts: false,
        screenReaderMode: true,
        keyboardNavigation: false,
        highContrast: false,
        fontSize: 'large',
        language: 'en',
      };

      (accessibilityService.updateAccessibilitySettings as jest.Mock).mockResolvedValue(
        mockSettings
      );

      const response = await request(app)
        .post('/accessibility/settings?userId=user-1')
        .send({ captions: true, fontSize: 'large' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.captions).toBe(true);
    });

    it('should return 400 if userId missing', async () => {
      const response = await request(app).post('/accessibility/settings').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /accessibility/features', () => {
    it('should return list of accessibility features', async () => {
      const mockFeatures = [
        {
          id: 'captions',
          name: 'Captions',
          description: 'Display captions for video content',
          enabled: true,
        },
        {
          id: 'transcripts',
          name: 'Transcripts',
          description: 'Provide text transcripts for audio and video content',
          enabled: true,
        },
      ];

      (accessibilityService.getAvailableFeatures as jest.Mock).mockReturnValue(mockFeatures);

      const response = await request(app).get('/accessibility/features');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFeatures);
      expect(response.body.count).toBe(2);
    });
  });

  describe('POST /accessibility/captions/:videoId', () => {
    it('should generate captions for video', async () => {
      const mockCaptions = '[00:00:00] Welcome to the course\n[00:00:05] Today we learn';

      (accessibilityService.generateCaptions as jest.Mock).mockResolvedValue(mockCaptions);

      const response = await request(app)
        .post('/accessibility/captions/video-1')
        .send({ language: 'en' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.videoId).toBe('video-1');
      expect(response.body.data.language).toBe('en');
      expect(response.body.data.captions).toBeDefined();
    });

    it('should return 400 if language missing', async () => {
      const response = await request(app).post('/accessibility/captions/video-1').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('language is required');
    });
  });

  describe('POST /accessibility/transcripts/:videoId', () => {
    it('should generate transcript for video', async () => {
      const mockTranscript = 'Welcome to the course. Today we learn about accessibility.';

      (accessibilityService.generateTranscript as jest.Mock).mockResolvedValue(mockTranscript);

      const response = await request(app)
        .post('/accessibility/transcripts/video-1')
        .send({ language: 'en' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.videoId).toBe('video-1');
      expect(response.body.data.language).toBe('en');
      expect(response.body.data.transcript).toBeDefined();
    });

    it('should return 400 if language missing', async () => {
      const response = await request(app).post('/accessibility/transcripts/video-1').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /accessibility/track-usage', () => {
    it('should track accessibility feature usage', async () => {
      (accessibilityService.trackAccessibilityUsage as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/accessibility/track-usage')
        .send({ userId: 'user-1', featureId: 'captions', duration: 300 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if required fields missing', async () => {
      const response = await request(app).post('/accessibility/track-usage').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /accessibility/compliance/:contentId', () => {
    it('should validate accessibility compliance', async () => {
      const mockCompliance = {
        compliant: true,
        issues: [],
        score: 95,
      };

      (accessibilityService.validateAccessibilityCompliance as jest.Mock).mockResolvedValue(
        mockCompliance
      );

      const response = await request(app).get('/accessibility/compliance/content-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.compliant).toBe(true);
      expect(response.body.data.score).toBe(95);
    });
  });

  describe('GET /accessibility/report/:courseId', () => {
    it('should generate accessibility report', async () => {
      const mockReport = {
        courseId: 'course-1',
        overallScore: 85,
        compliant: true,
        features: {
          captions: true,
          transcripts: true,
          altText: true,
          keyboardNavigation: true,
          colorContrast: false,
        },
        recommendations: ['Improve color contrast'],
      };

      (accessibilityService.getAccessibilityReport as jest.Mock).mockResolvedValue(mockReport);

      const response = await request(app).get('/accessibility/report/course-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.courseId).toBe('course-1');
      expect(response.body.data.overallScore).toBe(85);
    });
  });

  describe('Accessibility features', () => {
    it('should support captions', async () => {
      const mockFeatures = [
        {
          id: 'captions',
          name: 'Captions',
          description: 'Display captions for video content',
          enabled: true,
        },
      ];

      (accessibilityService.getAvailableFeatures as jest.Mock).mockReturnValue(mockFeatures);

      const response = await request(app).get('/accessibility/features');

      expect(response.body.data.some((f: any) => f.id === 'captions')).toBe(true);
    });

    it('should support transcripts', async () => {
      const mockFeatures = [
        {
          id: 'transcripts',
          name: 'Transcripts',
          description: 'Provide text transcripts',
          enabled: true,
        },
      ];

      (accessibilityService.getAvailableFeatures as jest.Mock).mockReturnValue(mockFeatures);

      const response = await request(app).get('/accessibility/features');

      expect(response.body.data.some((f: any) => f.id === 'transcripts')).toBe(true);
    });

    it('should support screen reader compatibility', async () => {
      const mockFeatures = [
        {
          id: 'screen-reader',
          name: 'Screen Reader Mode',
          description: 'Optimize content for screen readers',
          enabled: true,
        },
      ];

      (accessibilityService.getAvailableFeatures as jest.Mock).mockReturnValue(mockFeatures);

      const response = await request(app).get('/accessibility/features');

      expect(response.body.data.some((f: any) => f.id === 'screen-reader')).toBe(true);
    });

    it('should support keyboard navigation', async () => {
      const mockFeatures = [
        {
          id: 'keyboard-nav',
          name: 'Keyboard Navigation',
          description: 'Navigate using keyboard only',
          enabled: true,
        },
      ];

      (accessibilityService.getAvailableFeatures as jest.Mock).mockReturnValue(mockFeatures);

      const response = await request(app).get('/accessibility/features');

      expect(response.body.data.some((f: any) => f.id === 'keyboard-nav')).toBe(true);
    });
  });
});
