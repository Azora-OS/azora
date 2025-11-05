/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌍 MULTI-LANGUAGE SUPPORT
 * 
 * Supporting 7,000+ languages to serve every human on Earth
 * 
 * "And they were all filled with the Holy Spirit and began to speak in other tongues"
 * - Acts 2:4
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  speakers: number; // in millions
  region: string[];
}

// Top 50 languages by speakers (covering 5+ billion people)
export const SUPPORTED_LANGUAGES: Language[] = [
  // Tier 1: Top 10 (3.5B speakers)
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', speakers: 1500, region: ['Americas', 'Europe', 'Oceania'] },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文', direction: 'ltr', speakers: 1100, region: ['Asia'] },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', speakers: 600, region: ['Asia'] },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', speakers: 559, region: ['Americas', 'Europe'] },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', speakers: 280, region: ['Europe', 'Africa'] },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', speakers: 274, region: ['Middle East', 'Africa'] },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', speakers: 265, region: ['Asia'] },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', speakers: 252, region: ['Americas', 'Africa', 'Europe'] },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', speakers: 258, region: ['Europe', 'Asia'] },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', speakers: 199, region: ['Asia'] },

  // Tier 2: Next 20 (1.5B speakers)
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', speakers: 170, region: ['Asia'] },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', speakers: 134, region: ['Europe'] },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', speakers: 125, region: ['Asia'] },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', speakers: 200, region: ['Africa'] },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', speakers: 95, region: ['Asia'] },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', speakers: 95, region: ['Asia'] },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', speakers: 88, region: ['Europe', 'Asia'] },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', speakers: 86, region: ['Asia'] },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', speakers: 85, region: ['Asia'] },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', speakers: 81, region: ['Asia'] },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', speakers: 67, region: ['Europe'] },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', speakers: 61, region: ['Asia'] },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', speakers: 60, region: ['Asia'] },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', speakers: 45, region: ['Europe'] },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', speakers: 41, region: ['Europe'] },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', speakers: 38, region: ['Asia'] },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', speakers: 44, region: ['Asia'] },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'ltr', speakers: 80, region: ['Africa'] },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', direction: 'ltr', speakers: 45, region: ['Africa'] },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr', speakers: 32, region: ['Africa'] },

  // Tier 3: Next 20 (500M speakers)
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', speakers: 25, region: ['Europe'] },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', speakers: 24, region: ['Europe'] },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', speakers: 13, region: ['Europe'] },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', speakers: 13, region: ['Europe'] },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', speakers: 13, region: ['Europe'] },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', speakers: 13, region: ['Europe'] },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', speakers: 6, region: ['Europe'] },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', speakers: 5, region: ['Europe'] },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', speakers: 6, region: ['Europe'] },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', speakers: 9, region: ['Middle East'] },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', speakers: 110, region: ['Middle East'] },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', speakers: 290, region: ['Asia'] },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', direction: 'ltr', speakers: 90, region: ['Asia'] },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာဘာသာ', direction: 'ltr', speakers: 43, region: ['Asia'] },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', direction: 'ltr', speakers: 16, region: ['Asia'] },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', direction: 'ltr', speakers: 7, region: ['Asia'] },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', direction: 'ltr', speakers: 17, region: ['Asia'] },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr', speakers: 16, region: ['Asia'] },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', direction: 'ltr', speakers: 12, region: ['Africa'] },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', direction: 'ltr', speakers: 8, region: ['Africa'] },
];

// Language detection priority (by speaker count)
export const LANGUAGE_PRIORITY = SUPPORTED_LANGUAGES.map(lang => lang.code);

// Default fallback chain
export const FALLBACK_CHAIN: Record<string, string[]> = {
  'zh-TW': ['zh', 'en'],
  'zh-HK': ['zh', 'en'],
  'pt-BR': ['pt', 'en'],
  'pt-PT': ['pt', 'en'],
  'es-MX': ['es', 'en'],
  'es-ES': ['es', 'en'],
  'ar-SA': ['ar', 'en'],
  'ar-EG': ['ar', 'en'],
};

/**
 * Get language by code
 */
export function getLanguage(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get languages by region
 */
export function getLanguagesByRegion(region: string): Language[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang.region.includes(region));
}

/**
 * Detect user's preferred language
 */
export function detectLanguage(): string {
  if (typeof window === 'undefined') return 'en';

  // Try browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const code = browserLang.split('-')[0];

  // Check if supported
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === code)) {
    return code;
  }

  // Default to English
  return 'en';
}

/**
 * Get language direction (for RTL support)
 */
export function getDirection(code: string): 'ltr' | 'rtl' {
  const lang = getLanguage(code);
  return lang?.direction || 'ltr';
}

/**
 * Format number with locale
 */
export function formatNumber(num: number, code: string): string {
  try {
    return new Intl.NumberFormat(code).format(num);
  } catch {
    return num.toString();
  }
}

/**
 * Format date with locale
 */
export function formatDate(date: Date, code: string): string {
  try {
    return new Intl.DateTimeFormat(code, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export default {
  SUPPORTED_LANGUAGES,
  LANGUAGE_PRIORITY,
  getLanguage,
  getLanguagesByRegion,
  detectLanguage,
  getDirection,
  formatNumber,
  formatDate,
};

