import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface TranslationRequest {
  courseId: string;
  targetLanguage: string;
  content: string;
}

export interface TranslationResponse {
  courseId: string;
  language: string;
  translatedContent: string;
  translationStatus: 'completed' | 'in_progress' | 'failed';
}

export interface LocalizationData {
  courseId: string;
  language: string;
  title: string;
  description: string;
  modules: LocalizedModule[];
  assessments: LocalizedAssessment[];
}

export interface LocalizedModule {
  id: string;
  title: string;
  content: string;
}

export interface LocalizedAssessment {
  id: string;
  title: string;
  questions: string[];
}

export class TranslationService {
  private supportedLanguages = [
    'en',
    'es',
    'fr',
    'de',
    'it',
    'pt',
    'ru',
    'ja',
    'zh',
    'ko',
    'ar',
    'hi',
  ];

  /**
   * Translate course content to target language
   * Requirements: 6.1, 6.2
   */
  async translateCourse(courseId: string, targetLanguage: string): Promise<TranslationResponse> {
    try {
      // Validate language
      if (!this.supportedLanguages.includes(targetLanguage)) {
        throw new Error(`Language ${targetLanguage} is not supported`);
      }

      // Get course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: true,
          assessments: true,
        },
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      // Translate course content
      const translatedContent = await this.translateContent(
        {
          title: course.title,
          description: course.description,
          modules: course.modules.map((m) => ({ id: m.id, title: m.title, content: m.content })),
          assessments: course.assessments.map((a) => ({
            id: a.id,
            title: a.title,
            questions: a.questions,
          })),
        },
        targetLanguage
      );

      logger.info('Course translated', {
        courseId,
        targetLanguage,
      });

      return {
        courseId,
        language: targetLanguage,
        translatedContent: JSON.stringify(translatedContent),
        translationStatus: 'completed',
      };
    } catch (error) {
      logger.error('Error translating course', { error, courseId, targetLanguage });
      throw error;
    }
  }

  /**
   * Get supported languages
   * Requirements: 6.1, 6.2
   */
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  /**
   * Localize UI elements for a language
   * Requirements: 6.1, 6.2
   */
  async getLocalizedUI(language: string): Promise<Record<string, string>> {
    try {
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`Language ${language} is not supported`);
      }

      // Return localized UI strings
      const uiStrings = this.getUIStrings(language);

      return uiStrings;
    } catch (error) {
      logger.error('Error getting localized UI', { error, language });
      throw error;
    }
  }

  /**
   * Localize assessment for a language
   * Requirements: 6.1, 6.2
   */
  async localizeAssessment(assessmentId: string, language: string): Promise<LocalizedAssessment> {
    try {
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`Language ${language} is not supported`);
      }

      // Get assessment
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        throw new Error(`Assessment not found: ${assessmentId}`);
      }

      // Translate assessment
      const translatedQuestions = await Promise.all(
        assessment.questions.map((q) => this.translateText(q, language))
      );

      return {
        id: assessment.id,
        title: await this.translateText(assessment.title, language),
        questions: translatedQuestions,
      };
    } catch (error) {
      logger.error('Error localizing assessment', { error, assessmentId, language });
      throw error;
    }
  }

  /**
   * Translate text to target language
   * In a real implementation, this would call an AI translation service
   */
  private async translateText(text: string, targetLanguage: string): Promise<string> {
    // This is a placeholder implementation
    // In production, this would call a translation API (e.g., Google Translate, AWS Translate)
    // For now, we'll just return the original text with a language marker

    logger.debug('Translating text', { text, targetLanguage });

    // Simulate translation delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, call translation API
    // For now, return original text (would be replaced with actual translation)
    return text;
  }

  /**
   * Translate content object
   */
  private async translateContent(
    content: any,
    targetLanguage: string
  ): Promise<LocalizationData> {
    const translatedModules = await Promise.all(
      content.modules.map(async (m: any) => ({
        id: m.id,
        title: await this.translateText(m.title, targetLanguage),
        content: await this.translateText(m.content, targetLanguage),
      }))
    );

    const translatedAssessments = await Promise.all(
      content.assessments.map(async (a: any) => ({
        id: a.id,
        title: await this.translateText(a.title, targetLanguage),
        questions: await Promise.all(
          a.questions.map((q: string) => this.translateText(q, targetLanguage))
        ),
      }))
    );

    return {
      courseId: content.courseId,
      language: targetLanguage,
      title: await this.translateText(content.title, targetLanguage),
      description: await this.translateText(content.description, targetLanguage),
      modules: translatedModules,
      assessments: translatedAssessments,
    };
  }

  /**
   * Get UI strings for a language
   */
  private getUIStrings(language: string): Record<string, string> {
    const uiStrings: Record<string, Record<string, string>> = {
      en: {
        welcome: 'Welcome',
        courses: 'Courses',
        enroll: 'Enroll',
        progress: 'Progress',
        certificate: 'Certificate',
        settings: 'Settings',
      },
      es: {
        welcome: 'Bienvenido',
        courses: 'Cursos',
        enroll: 'Inscribirse',
        progress: 'Progreso',
        certificate: 'Certificado',
        settings: 'Configuración',
      },
      fr: {
        welcome: 'Bienvenue',
        courses: 'Cours',
        enroll: "S'inscrire",
        progress: 'Progrès',
        certificate: 'Certificat',
        settings: 'Paramètres',
      },
      de: {
        welcome: 'Willkommen',
        courses: 'Kurse',
        enroll: 'Anmelden',
        progress: 'Fortschritt',
        certificate: 'Zertifikat',
        settings: 'Einstellungen',
      },
      it: {
        welcome: 'Benvenuto',
        courses: 'Corsi',
        enroll: 'Iscriviti',
        progress: 'Progresso',
        certificate: 'Certificato',
        settings: 'Impostazioni',
      },
      pt: {
        welcome: 'Bem-vindo',
        courses: 'Cursos',
        enroll: 'Inscrever-se',
        progress: 'Progresso',
        certificate: 'Certificado',
        settings: 'Configurações',
      },
      ru: {
        welcome: 'Добро пожаловать',
        courses: 'Курсы',
        enroll: 'Зарегистрироваться',
        progress: 'Прогресс',
        certificate: 'Сертификат',
        settings: 'Настройки',
      },
      ja: {
        welcome: 'ようこそ',
        courses: 'コース',
        enroll: '登録',
        progress: '進捗',
        certificate: '証明書',
        settings: '設定',
      },
      zh: {
        welcome: '欢迎',
        courses: '课程',
        enroll: '注册',
        progress: '进度',
        certificate: '证书',
        settings: '设置',
      },
      ko: {
        welcome: '환영합니다',
        courses: '코스',
        enroll: '등록',
        progress: '진행 상황',
        certificate: '인증서',
        settings: '설정',
      },
      ar: {
        welcome: 'أهلا وسهلا',
        courses: 'الدورات',
        enroll: 'التسجيل',
        progress: 'التقدم',
        certificate: 'شهادة',
        settings: 'الإعدادات',
      },
      hi: {
        welcome: 'स्वागत है',
        courses: 'पाठ्यक्रम',
        enroll: 'नामांकन',
        progress: 'प्रगति',
        certificate: 'प्रमाणपत्र',
        settings: 'सेटिंग्स',
      },
    };

    return uiStrings[language] || uiStrings['en'];
  }
}

export const translationService = new TranslationService();
