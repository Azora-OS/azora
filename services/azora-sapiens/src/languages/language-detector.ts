import { Language } from '../regions/region-manager';

export interface LanguageDetectionResult {
  language: Language;
  confidence: number;
  alternatives: Array<{ language: Language; confidence: number }>;
}

export class LanguageDetector {
  private languagePatterns: Map<Language, RegExp[]> = new Map();
  private commonWords: Map<Language, Set<string>> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeCommonWords();
  }

  /**
   * Initialize language patterns
   */
  private initializePatterns(): void {
    // English patterns
    this.languagePatterns.set('en', [
      /\b(the|is|and|to|of|a|in|that|it|for|was|on|be|with|as|by|at|from|or|an|are|this|but|his|they|have|had|has|do|does|did|will|would|should|could|can|may|might|must|shall)\b/gi,
    ]);

    // French patterns
    this.languagePatterns.set('fr', [
      /\b(le|de|un|et|à|que|est|en|pour|dans|ce|il|qui|ne|sur|se|pas|plus|pouvoir|devoir|vouloir|aller|être|avoir)\b/gi,
    ]);

    // Swahili patterns
    this.languagePatterns.set('sw', [
      /\b(na|ni|ya|wa|kwa|za|ta|ka|ku|ki|vi|m|n|u|a|i|o|e)\b/gi,
    ]);

    // Arabic patterns
    this.languagePatterns.set('ar', [/[\u0600-\u06FF]/g]);

    // Portuguese patterns
    this.languagePatterns.set('pt', [
      /\b(o|a|de|que|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|quem|nas|me|esse|eles|estão|você|tinha|foram|essa|num|nem|suas|meu|às|minha|têm|numa|pelos|elas)\b/gi,
    ]);

    // Amharic patterns
    this.languagePatterns.set('am', [/[\u1200-\u137F]/g]);

    // Yoruba patterns
    this.languagePatterns.set('yo', [
      /\b(ni|ti|lo|si|fun|ati|o|a|e|i|u|ọ|ẹ|ọ̀|ẹ̀|ọ́|ẹ́)\b/gi,
    ]);

    // Zulu patterns
    this.languagePatterns.set('zu', [
      /\b(i|u|a|e|o|aba|ama|imi|isi|izi|izin|izim|izil|izit|izik|izib|izin|izim|izil|izit|izik|izib)\b/gi,
    ]);
  }

  /**
   * Initialize common words for each language
   */
  private initializeCommonWords(): void {
    this.commonWords.set('en', new Set([
      'the', 'is', 'and', 'to', 'of', 'a', 'in', 'that', 'it', 'for', 'was', 'on', 'be', 'with', 'as', 'by', 'at', 'from', 'or', 'an', 'are', 'this', 'but', 'his', 'they', 'have', 'had', 'has', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall',
    ]));

    this.commonWords.set('fr', new Set([
      'le', 'de', 'un', 'et', 'à', 'que', 'est', 'en', 'pour', 'dans', 'ce', 'il', 'qui', 'ne', 'sur', 'se', 'pas', 'plus', 'pouvoir', 'devoir', 'vouloir', 'aller', 'être', 'avoir',
    ]));

    this.commonWords.set('sw', new Set([
      'na', 'ni', 'ya', 'wa', 'kwa', 'za', 'ta', 'ka', 'ku', 'ki', 'vi', 'm', 'n', 'u', 'a', 'i', 'o', 'e',
    ]));

    this.commonWords.set('ar', new Set([
      'في', 'من', 'إلى', 'هو', 'هي', 'أن', 'كان', 'كانت', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'ما', 'من', 'أي', 'كل', 'بعض',
    ]));

    this.commonWords.set('pt', new Set([
      'o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas',
    ]));

    this.commonWords.set('am', new Set([
      'ነው', 'ያለ', 'ሆነ', 'ሊ', 'ከ', 'ወደ', 'በ', 'ላይ', 'ውስጥ', 'ስር', 'ላ', 'ሳ', 'ሲ', 'ሲሆን', 'ሲሆነ',
    ]));

    this.commonWords.set('yo', new Set([
      'ni', 'ti', 'lo', 'si', 'fun', 'ati', 'o', 'a', 'e', 'i', 'u', 'ọ', 'ẹ',
    ]));

    this.commonWords.set('zu', new Set([
      'i', 'u', 'a', 'e', 'o', 'aba', 'ama', 'imi', 'isi', 'izi', 'izin', 'izim', 'izil', 'izit', 'izik', 'izib',
    ]));
  }

  /**
   * Detect language from text
   */
  detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.length === 0) {
      return {
        language: 'en',
        confidence: 0,
        alternatives: [],
      };
    }

    const scores: Map<Language, number> = new Map();
    const languages: Language[] = ['en', 'fr', 'sw', 'ar', 'pt', 'am', 'yo', 'zu'];

    // Score each language
    for (const language of languages) {
      let score = 0;

      // Check patterns
      const patterns = this.languagePatterns.get(language) || [];
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }

      // Check common words
      const words = text.toLowerCase().split(/\s+/);
      const commonWords = this.commonWords.get(language) || new Set();
      for (const word of words) {
        if (commonWords.has(word)) {
          score += 2;
        }
      }

      scores.set(language, score);
    }

    // Find best match
    let bestLanguage: Language = 'en';
    let bestScore = 0;

    for (const [language, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestLanguage = language;
      }
    }

    // Calculate confidence
    const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? bestScore / totalScore : 0;

    // Get alternatives
    const alternatives = Array.from(scores.entries())
      .filter(([lang]) => lang !== bestLanguage)
      .map(([lang, score]) => ({
        language: lang,
        confidence: totalScore > 0 ? score / totalScore : 0,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return {
      language: bestLanguage,
      confidence: Math.min(confidence, 1),
      alternatives,
    };
  }

  /**
   * Detect language from user preferences
   */
  detectFromPreferences(
    userLanguage?: string,
    userCountry?: string,
    userRegion?: string
  ): Language {
    // If user explicitly set language, use it
    if (userLanguage) {
      const lang = userLanguage.toLowerCase();
      if (lang.startsWith('en')) {return 'en';}
      if (lang.startsWith('fr')) {return 'fr';}
      if (lang.startsWith('sw')) {return 'sw';}
      if (lang.startsWith('ar')) {return 'ar';}
      if (lang.startsWith('pt')) {return 'pt';}
      if (lang.startsWith('am')) {return 'am';}
      if (lang.startsWith('yo')) {return 'yo';}
      if (lang.startsWith('zu')) {return 'zu';}
    }

    // Default to English
    return 'en';
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return ['en', 'fr', 'sw', 'ar', 'pt', 'am', 'yo', 'zu'];
  }

  /**
   * Get language name
   */
  getLanguageName(language: Language): string {
    const names: Record<Language, string> = {
      en: 'English',
      fr: 'Français',
      sw: 'Kiswahili',
      ar: 'العربية',
      pt: 'Português',
      am: 'አማርኛ',
      yo: 'Yorùbá',
      zu: 'isiZulu',
    };

    return names[language] || 'Unknown';
  }
}

export default LanguageDetector;
