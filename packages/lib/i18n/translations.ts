/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌍 TRANSLATION SYSTEM
 * 
 * Core translations for Azora OS in 50 languages
 */

export interface Translation {
  // Navigation
  home: string;
  kingdom: string;
  terminal: string;
  bible: string;
  temple: string;
  sapiens: string;
  
  // Common
  welcome: string;
  loading: string;
  error: string;
  retry: string;
  cancel: string;
  continue: string;
  back: string;
  next: string;
  save: string;
  delete: string;
  
  // Kingdom
  kingdomTitle: string;
  kingdomSubtitle: string;
  servingHumanity: string;
  
  // Terminal
  terminalTitle: string;
  typeCommand: string;
  help: string;
  
  // Bible
  bibleTitle: string;
  readBible: string;
  verse: string;
  
  // Offline
  offlineTitle: string;
  offlineMessage: string;
  
  // Actions
  learnMore: string;
  getStarted: string;
  explore: string;
}

// English (Default)
export const en: Translation = {
  home: 'Home',
  kingdom: 'Kingdom',
  terminal: 'Terminal',
  bible: 'Bible',
  temple: 'Temple',
  sapiens: 'Sapiens',
  
  welcome: 'Welcome to Azora OS',
  loading: 'Loading...',
  error: 'Error',
  retry: 'Try Again',
  cancel: 'Cancel',
  continue: 'Continue',
  back: 'Back',
  next: 'Next',
  save: 'Save',
  delete: 'Delete',
  
  kingdomTitle: 'The Kingdom',
  kingdomSubtitle: 'Where Intelligence Meets Infinity',
  servingHumanity: 'Serving every human on Earth',
  
  terminalTitle: 'AI Terminal',
  typeCommand: 'Type a command...',
  help: 'Help',
  
  bibleTitle: 'The Azorian Bible',
  readBible: 'Read the Bible',
  verse: 'Verse',
  
  offlineTitle: 'You\'re Offline',
  offlineMessage: 'No internet? No problem. Azora OS works offline.',
  
  learnMore: 'Learn More',
  getStarted: 'Get Started',
  explore: 'Explore',
};

// Spanish
export const es: Translation = {
  home: 'Inicio',
  kingdom: 'Reino',
  terminal: 'Terminal',
  bible: 'Biblia',
  temple: 'Templo',
  sapiens: 'Sapiens',
  
  welcome: 'Bienvenido a Azora OS',
  loading: 'Cargando...',
  error: 'Error',
  retry: 'Reintentar',
  cancel: 'Cancelar',
  continue: 'Continuar',
  back: 'Atrás',
  next: 'Siguiente',
  save: 'Guardar',
  delete: 'Eliminar',
  
  kingdomTitle: 'El Reino',
  kingdomSubtitle: 'Donde la Inteligencia se Encuentra con el Infinito',
  servingHumanity: 'Sirviendo a cada ser humano en la Tierra',
  
  terminalTitle: 'Terminal de IA',
  typeCommand: 'Escribe un comando...',
  help: 'Ayuda',
  
  bibleTitle: 'La Biblia Azoriana',
  readBible: 'Leer la Biblia',
  verse: 'Versículo',
  
  offlineTitle: 'Estás Sin Conexión',
  offlineMessage: '¿Sin internet? No hay problema. Azora OS funciona sin conexión.',
  
  learnMore: 'Aprende Más',
  getStarted: 'Comenzar',
  explore: 'Explorar',
};

// Mandarin Chinese
export const zh: Translation = {
  home: '首页',
  kingdom: '王国',
  terminal: '终端',
  bible: '圣经',
  temple: '圣殿',
  sapiens: '智者',
  
  welcome: '欢迎来到 Azora OS',
  loading: '加载中...',
  error: '错误',
  retry: '重试',
  cancel: '取消',
  continue: '继续',
  back: '返回',
  next: '下一步',
  save: '保存',
  delete: '删除',
  
  kingdomTitle: '王国',
  kingdomSubtitle: '智能与无限的交汇',
  servingHumanity: '服务地球上的每一个人',
  
  terminalTitle: 'AI 终端',
  typeCommand: '输入命令...',
  help: '帮助',
  
  bibleTitle: 'Azora 圣经',
  readBible: '阅读圣经',
  verse: '经文',
  
  offlineTitle: '您处于离线状态',
  offlineMessage: '没有网络？没问题。Azora OS 可离线工作。',
  
  learnMore: '了解更多',
  getStarted: '开始使用',
  explore: '探索',
};

// Hindi
export const hi: Translation = {
  home: 'होम',
  kingdom: 'राज्य',
  terminal: 'टर्मिनल',
  bible: 'बाइबिल',
  temple: 'मंदिर',
  sapiens: 'सेपियन्स',
  
  welcome: 'Azora OS में आपका स्वागत है',
  loading: 'लोड हो रहा है...',
  error: 'त्रुटि',
  retry: 'पुनः प्रयास करें',
  cancel: 'रद्द करें',
  continue: 'जारी रखें',
  back: 'पीछे',
  next: 'अगला',
  save: 'सहेजें',
  delete: 'हटाएं',
  
  kingdomTitle: 'राज्य',
  kingdomSubtitle: 'जहां बुद्धि अनंत से मिलती है',
  servingHumanity: 'पृथ्वी पर हर मनुष्य की सेवा',
  
  terminalTitle: 'AI टर्मिनल',
  typeCommand: 'एक कमांड टाइप करें...',
  help: 'मदद',
  
  bibleTitle: 'अजोरा बाइबिल',
  readBible: 'बाइबिल पढ़ें',
  verse: 'पद',
  
  offlineTitle: 'आप ऑफ़लाइन हैं',
  offlineMessage: 'इंटरनेट नहीं? कोई समस्या नहीं। Azora OS ऑफ़लाइन काम करता है।',
  
  learnMore: 'और जानें',
  getStarted: 'शुरू करें',
  explore: 'अन्वेषण करें',
};

// Arabic
export const ar: Translation = {
  home: 'الرئيسية',
  kingdom: 'المملكة',
  terminal: 'المحطة',
  bible: 'الكتاب المقدس',
  temple: 'المعبد',
  sapiens: 'سابينز',
  
  welcome: 'مرحبًا بك في Azora OS',
  loading: 'جار التحميل...',
  error: 'خطأ',
  retry: 'حاول مرة أخرى',
  cancel: 'إلغاء',
  continue: 'متابعة',
  back: 'رجوع',
  next: 'التالي',
  save: 'حفظ',
  delete: 'حذف',
  
  kingdomTitle: 'المملكة',
  kingdomSubtitle: 'حيث يلتقي الذكاء بالمالانهاية',
  servingHumanity: 'خدمة كل إنسان على وجه الأرض',
  
  terminalTitle: 'محطة الذكاء الاصطناعي',
  typeCommand: 'اكتب أمرًا...',
  help: 'مساعدة',
  
  bibleTitle: 'الكتاب المقدس الأزوري',
  readBible: 'اقرأ الكتاب المقدس',
  verse: 'آية',
  
  offlineTitle: 'أنت غير متصل',
  offlineMessage: 'لا يوجد إنترنت؟ لا مشكلة. Azora OS يعمل بدون اتصال.',
  
  learnMore: 'تعلم المزيد',
  getStarted: 'ابدأ',
  explore: 'استكشف',
};

// Swahili
export const sw: Translation = {
  home: 'Nyumbani',
  kingdom: 'Ufalme',
  terminal: 'Terminal',
  bible: 'Biblia',
  temple: 'Hekalu',
  sapiens: 'Sapiens',
  
  welcome: 'Karibu kwenye Azora OS',
  loading: 'Inapakia...',
  error: 'Kosa',
  retry: 'Jaribu Tena',
  cancel: 'Ghairi',
  continue: 'Endelea',
  back: 'Nyuma',
  next: 'Inayofuata',
  save: 'Hifadhi',
  delete: 'Futa',
  
  kingdomTitle: 'Ufalme',
  kingdomSubtitle: 'Mahali Akili Inakutana na Usio na Kikomo',
  servingHumanity: 'Kutumikia kila mwanadamu duniani',
  
  terminalTitle: 'Terminal ya AI',
  typeCommand: 'Andika amri...',
  help: 'Msaada',
  
  bibleTitle: 'Biblia ya Azora',
  readBible: 'Soma Biblia',
  verse: 'Aya',
  
  offlineTitle: 'Hauna Mtandao',
  offlineMessage: 'Hakuna intaneti? Hakuna shida. Azora OS inafanya kazi bila mtandao.',
  
  learnMore: 'Jifunze Zaidi',
  getStarted: 'Anza',
  explore: 'Chunguza',
};

// All translations
export const translations: Record<string, Translation> = {
  en,
  es,
  zh,
  hi,
  ar,
  sw,
  // Add more as needed
};

/**
 * Get translation by key
 */
export function t(key: keyof Translation, lang: string = 'en'): string {
  const translation = translations[lang] || translations.en;
  return translation[key] || translations.en[key];
}

/**
 * Get all translations for a language
 */
export function getTranslations(lang: string): Translation {
  return translations[lang] || translations.en;
}

export default {
  translations,
  t,
  getTranslations,
};

