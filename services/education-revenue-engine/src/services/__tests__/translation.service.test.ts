import { translationService } from '../translation.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    course: {
      findUnique: jest.fn(),
    },
    assessment: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('TranslationService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('translateCourse', () => {
    it('should translate course to target language', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Advanced TypeScript',
        description: 'Learn advanced TypeScript concepts',
        modules: [
          {
            id: 'module-1',
            title: 'Generics',
            content: 'Understanding generics in TypeScript',
          },
        ],
        assessments: [
          {
            id: 'assess-1',
            title: 'Quiz 1',
            questions: ['What are generics?'],
          },
        ],
      };

      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);

      const translation = await translationService.translateCourse('course-1', 'es');

      expect(translation).toHaveProperty('courseId', 'course-1');
      expect(translation).toHaveProperty('language', 'es');
      expect(translation).toHaveProperty('translationStatus', 'completed');
    });

    it('should throw error for unsupported language', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        title: 'Test Course',
        modules: [],
        assessments: [],
      });

      await expect(translationService.translateCourse('course-1', 'xx')).rejects.toThrow(
        'not supported'
      );
    });

    it('should throw error if course not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      await expect(translationService.translateCourse('invalid-id', 'es')).rejects.toThrow(
        'Course not found'
      );
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = translationService.getSupportedLanguages();

      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
    });

    it('should include at least 10 languages', () => {
      const languages = translationService.getSupportedLanguages();

      expect(languages.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('getLocalizedUI', () => {
    it('should return localized UI strings for supported language', async () => {
      const uiStrings = await translationService.getLocalizedUI('es');

      expect(uiStrings).toHaveProperty('welcome');
      expect(uiStrings).toHaveProperty('courses');
      expect(uiStrings).toHaveProperty('enroll');
    });

    it('should throw error for unsupported language', async () => {
      await expect(translationService.getLocalizedUI('xx')).rejects.toThrow('not supported');
    });

    it('should return English strings as fallback', async () => {
      const uiStrings = await translationService.getLocalizedUI('en');

      expect(uiStrings.welcome).toBe('Welcome');
      expect(uiStrings.courses).toBe('Courses');
    });

    it('should return Spanish strings', async () => {
      const uiStrings = await translationService.getLocalizedUI('es');

      expect(uiStrings.welcome).toBe('Bienvenido');
      expect(uiStrings.courses).toBe('Cursos');
    });

    it('should return French strings', async () => {
      const uiStrings = await translationService.getLocalizedUI('fr');

      expect(uiStrings.welcome).toBe('Bienvenue');
      expect(uiStrings.courses).toBe('Cours');
    });
  });

  describe('localizeAssessment', () => {
    it('should localize assessment for target language', async () => {
      const mockAssessment = {
        id: 'assess-1',
        title: 'Quiz 1',
        questions: ['What are generics?', 'Explain interfaces'],
      };

      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);

      const localized = await translationService.localizeAssessment('assess-1', 'es');

      expect(localized).toHaveProperty('id', 'assess-1');
      expect(localized).toHaveProperty('title');
      expect(localized).toHaveProperty('questions');
      expect(localized.questions).toHaveLength(2);
    });

    it('should throw error if assessment not found', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(translationService.localizeAssessment('invalid-id', 'es')).rejects.toThrow(
        'Assessment not found'
      );
    });

    it('should throw error for unsupported language', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue({
        id: 'assess-1',
        title: 'Quiz',
        questions: [],
      });

      await expect(translationService.localizeAssessment('assess-1', 'xx')).rejects.toThrow(
        'not supported'
      );
    });
  });

  describe('Language support', () => {
    it('should support Spanish', async () => {
      const languages = translationService.getSupportedLanguages();
      expect(languages).toContain('es');
    });

    it('should support French', async () => {
      const languages = translationService.getSupportedLanguages();
      expect(languages).toContain('fr');
    });

    it('should support German', async () => {
      const languages = translationService.getSupportedLanguages();
      expect(languages).toContain('de');
    });

    it('should support Chinese', async () => {
      const languages = translationService.getSupportedLanguages();
      expect(languages).toContain('zh');
    });

    it('should support Japanese', async () => {
      const languages = translationService.getSupportedLanguages();
      expect(languages).toContain('ja');
    });

    it('should support Arabic', async () => {
      const languages = translationService.getSupportedLanguages();
      expect(languages).toContain('ar');
    });
  });
});
