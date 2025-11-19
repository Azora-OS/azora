import request from 'supertest';
import express from 'express';
import translationRouter from '../translation.routes';
import { translationService } from '../../services/translation.service';

jest.mock('../../services/translation.service');

const app = express();
app.use(express.json());
app.use('/', translationRouter);

describe('Translation Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /courses/:id/translate', () => {
    it('should translate course to target language', async () => {
      const mockTranslation = {
        courseId: 'course-1',
        language: 'es',
        translatedContent: '{}',
        translationStatus: 'completed',
      };

      (translationService.translateCourse as jest.Mock).mockResolvedValue(mockTranslation);

      const response = await request(app).get('/courses/course-1/translate?language=es');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.language).toBe('es');
    });

    it('should return 400 if language parameter missing', async () => {
      const response = await request(app).get('/courses/course-1/translate');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('language query parameter is required');
    });

    it('should handle translation errors', async () => {
      (translationService.translateCourse as jest.Mock).mockRejectedValue(
        new Error('Course not found')
      );

      const response = await request(app).get('/courses/invalid-id/translate?language=es');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /courses/:id/languages', () => {
    it('should add language support to course', async () => {
      const mockTranslations = [
        {
          courseId: 'course-1',
          language: 'es',
          translatedContent: '{}',
          translationStatus: 'completed',
        },
        {
          courseId: 'course-1',
          language: 'fr',
          translatedContent: '{}',
          translationStatus: 'completed',
        },
      ];

      (translationService.translateCourse as jest.Mock)
        .mockResolvedValueOnce(mockTranslations[0])
        .mockResolvedValueOnce(mockTranslations[1]);

      const response = await request(app)
        .post('/courses/course-1/languages')
        .send({ languages: ['es', 'fr'] });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });

    it('should return 400 if languages array missing', async () => {
      const response = await request(app).post('/courses/course-1/languages').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('languages array is required');
    });

    it('should reject unsupported languages', async () => {
      (translationService.getSupportedLanguages as jest.Mock).mockReturnValue([
        'en',
        'es',
        'fr',
      ]);

      const response = await request(app)
        .post('/courses/course-1/languages')
        .send({ languages: ['es', 'xx'] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unsupported languages');
    });
  });

  describe('GET /languages', () => {
    it('should return list of supported languages', async () => {
      const mockLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi'];

      (translationService.getSupportedLanguages as jest.Mock).mockReturnValue(mockLanguages);

      const response = await request(app).get('/languages');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLanguages);
      expect(response.body.count).toBe(12);
    });
  });

  describe('GET /ui/:language', () => {
    it('should return localized UI strings', async () => {
      const mockUIStrings = {
        welcome: 'Bienvenido',
        courses: 'Cursos',
        enroll: 'Inscribirse',
        progress: 'Progreso',
        certificate: 'Certificado',
        settings: 'Configuración',
      };

      (translationService.getLocalizedUI as jest.Mock).mockResolvedValue(mockUIStrings);

      const response = await request(app).get('/ui/es');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUIStrings);
      expect(response.body.language).toBe('es');
    });

    it('should handle unsupported language', async () => {
      (translationService.getLocalizedUI as jest.Mock).mockRejectedValue(
        new Error('Language xx is not supported')
      );

      const response = await request(app).get('/ui/xx');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /assessments/:id/localize/:language', () => {
    it('should return localized assessment', async () => {
      const mockLocalizedAssessment = {
        id: 'assess-1',
        title: 'Quiz 1',
        questions: ['¿Qué son los genéricos?', 'Explica las interfaces'],
      };

      (translationService.localizeAssessment as jest.Mock).mockResolvedValue(
        mockLocalizedAssessment
      );

      const response = await request(app).get('/assessments/assess-1/localize/es');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('assess-1');
      expect(response.body.language).toBe('es');
    });

    it('should handle assessment not found', async () => {
      (translationService.localizeAssessment as jest.Mock).mockRejectedValue(
        new Error('Assessment not found')
      );

      const response = await request(app).get('/assessments/invalid-id/localize/es');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Multi-language support', () => {
    it('should support 10+ languages', async () => {
      const mockLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi'];

      (translationService.getSupportedLanguages as jest.Mock).mockReturnValue(mockLanguages);

      const response = await request(app).get('/languages');

      expect(response.body.data.length).toBeGreaterThanOrEqual(10);
    });

    it('should localize all UI elements', async () => {
      const mockUIStrings = {
        welcome: 'Bienvenue',
        courses: 'Cours',
        enroll: "S'inscrire",
        progress: 'Progrès',
        certificate: 'Certificat',
        settings: 'Paramètres',
      };

      (translationService.getLocalizedUI as jest.Mock).mockResolvedValue(mockUIStrings);

      const response = await request(app).get('/ui/fr');

      expect(response.body.data).toHaveProperty('welcome');
      expect(response.body.data).toHaveProperty('courses');
      expect(response.body.data).toHaveProperty('enroll');
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data).toHaveProperty('certificate');
      expect(response.body.data).toHaveProperty('settings');
    });
  });
});
