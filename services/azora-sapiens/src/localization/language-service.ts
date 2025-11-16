/**
 * Language Detection and Localization Service
 * Handles multi-language support across Africa
 */

export type SupportedLanguage = 'en' | 'fr' | 'ar' | 'am' | 'sw' | 'yo' | 'ig' | 'zu' | 'xh';

export interface LocalizationStrings {
  [key: string]: {
    [lang in SupportedLanguage]?: string;
  };
}

export class LanguageService {
  private detectedLanguage: SupportedLanguage = 'en';
  private localizationStrings: LocalizationStrings;

  constructor() {
    this.localizationStrings = this.initializeStrings();
  }

  /**
   * Initialize localization strings
   */
  private initializeStrings(): LocalizationStrings {
    return {
      welcome: {
        en: 'Welcome to Azora Sapiens',
        fr: 'Bienvenue sur Azora Sapiens',
        ar: 'مرحبا بك في أزورا سابينس',
        am: 'ወደ Azora Sapiens እንኳን ደህና መጡ',
        sw: 'Karibu kwenye Azora Sapiens',
        yo: 'Kaabo si Azora Sapiens',
        ig: 'Nnọọ na Azora Sapiens',
        zu: 'Ngubani ku-Azora Sapiens',
        xh: 'Wamkelekile ku-Azora Sapiens',
      },
      search: {
        en: 'Search',
        fr: 'Rechercher',
        ar: 'بحث',
        am: 'ፈልግ',
        sw: 'Tafuta',
        yo: 'Wa',
        ig: 'Chọọ',
        zu: 'Sesha',
        xh: 'Khangela',
      },
      businessIdea: {
        en: 'Business Idea',
        fr: 'Idée commerciale',
        ar: 'فكرة عمل',
        am: 'የንግድ ሃሳብ',
        sw: 'Wazo la Biashara',
        yo: 'Ero Isowo',
        ig: 'Echiche Azụmahụ',
        zu: 'Umqondo Weshishini',
        xh: 'Umqondo Weshishini',
      },
      careerPath: {
        en: 'Career Path',
        fr: 'Parcours professionnel',
        ar: 'مسار وظيفي',
        am: 'የስራ መንገድ',
        sw: 'Njia ya Kazi',
        yo: 'Ọna Iṣẹ',
        ig: 'Ụzọ Ọrụ',
        zu: 'Indlela Yomsebenzi',
        xh: 'Indlela Yomsebenzi',
      },
      marketAnalysis: {
        en: 'Market Analysis',
        fr: 'Analyse de marché',
        ar: 'تحليل السوق',
        am: 'የገበያ ትንተና',
        sw: 'Uchambuzi wa Soko',
        yo: 'Itupalẹ Oja',
        ig: 'Nyocha Ahịa',
        zu: 'Ukuhlaziya Umkhosi',
        xh: 'Ukuhlaziya Umkhosi',
      },
      funding: {
        en: 'Funding Opportunities',
        fr: 'Opportunités de financement',
        ar: 'فرص التمويل',
        am: 'የገንዘብ አጋዥ ዕድሎች',
        sw: 'Furaha za Fedha',
        yo: 'Awọn Aye Iwe-owo',
        ig: 'Ohere Ego',
        zu: 'Amathuba Emali',
        xh: 'Amathuba Emali',
      },
      error: {
        en: 'An error occurred',
        fr: 'Une erreur est survenue',
        ar: 'حدث خطأ',
        am: 'ስህተት ተከስቷል',
        sw: 'Kosa limetokea',
        yo: 'Aṣiṣe kan ti ṣẹlẹ',
        ig: 'Ihe njehie mere',
        zu: 'Kukhona iphutha',
        xh: 'Kukhona iphutha',
      },
      success: {
        en: 'Success',
        fr: 'Succès',
        ar: 'نجاح',
        am: 'ስኬት',
        sw: 'Mafanikio',
        yo: 'Aṣeyọrí',
        ig: 'Ihe ịrụ ọrụ',
        zu: 'Impumelelo',
        xh: 'Impumelelo',
      },
      loading: {
        en: 'Loading...',
        fr: 'Chargement...',
        ar: 'جاري التحميل...',
        am: 'በመጫን ላይ...',
        sw: 'Inapakia...',
        yo: 'Ń ṣe ìgbéjáde...',
        ig: 'Ịkwụ ụkwụ...',
        zu: 'Iyaloda...',
        xh: 'Iyaloda...',
      },
    };
  }

  /**
   * Detect language from user input or headers
   */
  detectLanguage(
    userInput?: string,
    acceptLanguageHeader?: string
  ): SupportedLanguage {
    // Try to detect from user input
    if (userInput) {
      const detected = this.detectFromText(userInput);
      if (detected) {
        this.detectedLanguage = detected;
        return detected;
      }
    }

    // Try to detect from Accept-Language header
    if (acceptLanguageHeader) {
      const detected = this.detectFromHeader(acceptLanguageHeader);
      if (detected) {
        this.detectedLanguage = detected;
        return detected;
      }
    }

    return this.detectedLanguage;
  }

  /**
   * Detect language from text
   */
  private detectFromText(text: string): SupportedLanguage | null {
    // Simple language detection based on character ranges
    const arabicRegex = /[\u0600-\u06FF]/g;
    const amharicRegex = /[\u1200-\u137F]/g;
    const swahiliRegex = /\b(na|ni|kwa|ya|za|la|le|li|lo|lu)\b/gi;

    if (arabicRegex.test(text)) return 'ar';
    if (amharicRegex.test(text)) return 'am';
    if (swahiliRegex.test(text)) return 'sw';

    return null;
  }

  /**
   * Detect language from Accept-Language header
   */
  private detectFromHeader(header: string): SupportedLanguage | null {
    const languages = header.split(',').map((lang) => lang.split(';')[0].trim());

    for (const lang of languages) {
      if (lang.startsWith('en')) return 'en';
      if (lang.startsWith('fr')) return 'fr';
      if (lang.startsWith('ar')) return 'ar';
      if (lang.startsWith('am')) return 'am';
      if (lang.startsWith('sw')) return 'sw';
    }

    return null;
  }

  /**
   * Get localized string
   */
  getString(key: string, language?: SupportedLanguage): string {
    const lang = language || this.detectedLanguage;
    const strings = this.localizationStrings[key];

    if (!strings) {
      return key; // Return key if not found
    }

    return strings[lang] || strings['en'] || key;
  }

  /**
   * Get all strings for a language
   */
  getStringsForLanguage(language: SupportedLanguage): LocalizationStrings {
    const result: LocalizationStrings = {};

    for (const [key, translations] of Object.entries(this.localizationStrings)) {
      result[key] = {
        [language]: translations[language] || translations['en'],
      };
    }

    return result;
  }

  /**
   * Set current language
   */
  setLanguage(language: SupportedLanguage): void {
    this.detectedLanguage = language;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.detectedLanguage;
  }

  /**
   * Translate text
   */
  async translateText(
    text: string,
    targetLanguage: SupportedLanguage
  ): Promise<string> {
    // In production, use a translation API like Google Translate
    // For now, return the original text
    return text;
  }

  /**
   * Format currency for language/region
   */
  formatCurrency(amount: number, currency: string, language?: SupportedLanguage): string {
    const lang = language || this.detectedLanguage;

    const formatter = new Intl.NumberFormat(this.getLocaleCode(lang), {
      style: 'currency',
      currency,
    });

    return formatter.format(amount);
  }

  /**
   * Format date for language/region
   */
  formatDate(date: Date, language?: SupportedLanguage): string {
    const lang = language || this.detectedLanguage;

    const formatter = new Intl.DateTimeFormat(this.getLocaleCode(lang), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return formatter.format(date);
  }

  /**
   * Get locale code from language
   */
  private getLocaleCode(language: SupportedLanguage): string {
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      ar: 'ar-SA',
      am: 'am-ET',
      sw: 'sw-KE',
      yo: 'yo-NG',
      ig: 'ig-NG',
      zu: 'zu-ZA',
      xh: 'xh-ZA',
    };

    return localeMap[language] || 'en-US';
  }
}

export default LanguageService;
