/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * MULTI-LANGUAGE SERVICE
 * Supporting South Africa's 11+ official languages
 * Prioritizing: English, Zulu, Xhosa, Afrikaans, Sesotho
 */

export type SupportedLanguage = 'en' | 'zu' | 'xh' | 'af' | 'st' | 'ts' | 'tn' | 'ss' | 've' | 'nr' | 'nd'

export interface Translation {
  [key: string]: string
}

export const translations: Record<SupportedLanguage, Translation> = {
  // English
  en: {
    welcome: 'Welcome to Azora',
    earn: 'Earn by Learning',
    login: 'Log In',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    profile: 'Profile',
    lessons: 'Lessons',
    rewards: 'Rewards',
    total_earned: 'Total Earned',
    complete_lesson: 'Complete Lesson',
    quiz_score: 'Quiz Score',
    your_progress: 'Your Progress',
    teacher_dashboard: 'Teacher Dashboard',
    parent_dashboard: 'Parent Dashboard',
    students: 'Students',
    performance: 'Performance',
    notifications: 'Notifications'
  },
  
  // Zulu (isiZulu)
  zu: {
    welcome: 'Siyakwamukela ku-Azora',
    earn: 'Thola imali ngokufunda',
    login: 'Ngena',
    signup: 'Bhalisa',
    dashboard: 'Ibhodi',
    profile: 'Iphrofayela',
    lessons: 'Izifundo',
    rewards: 'Imivuzo',
    total_earned: 'Ingqikithi etholiwe',
    complete_lesson: 'Qedela isifundo',
    quiz_score: 'Amaphuzu ohlolo',
    your_progress: 'Intuthuko yakho',
    teacher_dashboard: 'Ibhodi lothisha',
    parent_dashboard: 'Ibhodi yomzali',
    students: 'Abafundi',
    performance: 'Ukusebenza',
    notifications: 'Izaziso'
  },
  
  // Xhosa (isiXhosa)
  xh: {
    welcome: 'Wamkelekile kwi-Azora',
    earn: 'Fumana imali ngokufunda',
    login: 'Ngena',
    signup: 'Bhalisela',
    dashboard: 'Ibhodi',
    profile: 'Iprofayile',
    lessons: 'Izifundo',
    rewards: 'Amabhaso',
    total_earned: 'Iyonke efunyenweyo',
    complete_lesson: 'Gqiba isifundo',
    quiz_score: 'Amanqaku ovavanyo',
    your_progress: 'Inkqubela yakho',
    teacher_dashboard: 'Ibhodi yotitshala',
    parent_dashboard: 'Ibhodi yomzali',
    students: 'Abafundi',
    performance: 'Ukusebenza',
    notifications: 'Izaziso'
  },
  
  // Afrikaans
  af: {
    welcome: 'Welkom by Azora',
    earn: 'Verdien deur te leer',
    login: 'Meld aan',
    signup: 'Registreer',
    dashboard: 'Paneelbord',
    profile: 'Profiel',
    lessons: 'Lesse',
    rewards: 'Belonings',
    total_earned: 'Totaal verdien',
    complete_lesson: 'Voltooi les',
    quiz_score: 'Vasvra telling',
    your_progress: 'Jou vordering',
    teacher_dashboard: 'Onderwyser paneelbord',
    parent_dashboard: 'Ouer paneelbord',
    students: 'Studente',
    performance: 'Prestasie',
    notifications: 'Kennisgewings'
  },
  
  // Sesotho
  st: {
    welcome: 'Amohela ho Azora',
    earn: 'Fumana chelete ka ho ithuta',
    login: 'Kena',
    signup: 'Ngodisa',
    dashboard: 'Boto',
    profile: 'Profaele',
    lessons: 'Lithuto',
    rewards: 'Meputso',
    total_earned: 'Kakaretso e fumanweng',
    complete_lesson: 'Qetella thuto',
    quiz_score: 'Lintlha tsa tlhatlhobo',
    your_progress: 'Tsoelo-pele ya hao',
    teacher_dashboard: 'Boto ya morutisi',
    parent_dashboard: 'Boto ya motswadi',
    students: 'Baithuti',
    performance: 'Tshebetso',
    notifications: 'Ditsebiso'
  },
  
  // Tsonga
  ts: {
    welcome: 'Ku amukeriwa eka Azora',
    earn: 'Kuma mali hi ku dyondza',
    login: 'Nghena',
    signup: 'Tsarisa',
    dashboard: 'Bhodhi',
    profile: 'Phurofayili',
    lessons: 'Swifundzo',
    rewards: 'Mimbuyelo',
    total_earned: 'Hinkwaswo leswi kumeke',
    complete_lesson: 'Hetisa xifundzo',
    quiz_score: 'Swipimelo swa khwezu',
    your_progress: 'Nhluvuko wa wena',
    teacher_dashboard: 'Bhodhi ya mukhwezeri',
    parent_dashboard: 'Bhodhi ya wanuna',
    students: 'Vadyondzi',
    performance: 'Ntirho',
    notifications: 'Switiviso'
  },
  
  // Tswana
  tn: {
    welcome: 'Kamogelo kwa Azora',
    earn: 'Bona madi ka go ithuta',
    login: 'Tsena',
    signup: 'Kwadisa',
    dashboard: 'Boto',
    profile: 'Porofaele',
    lessons: 'Dithuto',
    rewards: 'Diputswa',
    total_earned: 'Palomoka e e bonweng',
    complete_lesson: 'Wetsa thuto',
    quiz_score: 'Dintlha tsa tlhatlhobo',
    your_progress: 'Tswelelopele ya gago',
    teacher_dashboard: 'Boto ya morutabana',
    parent_dashboard: 'Boto ya motsadi',
    students: 'Baithuti',
    performance: 'Tiro',
    notifications: 'Dikitsiso'
  },
  
  // Swati
  ss: {
    welcome: 'Semukelwa e-Azora',
    earn: 'Tfola imali ngekufundza',
    login: 'Ngena',
    signup: 'Bhalisa',
    dashboard: 'Libhodi',
    profile: 'Iphrofayela',
    lessons: 'Tifundvo',
    rewards: 'Timbadalo',
    total_earned: 'Lonkhe letfolakele',
    complete_lesson: 'Cwedza sifundvo',
    quiz_score: 'Emaphuzu ewukuhlolwa',
    your_progress: 'Inchubeko yakho',
    teacher_dashboard: 'Libhodi lelithisha',
    parent_dashboard: 'Libhodi lemdzali',
    students: 'Bafundzi',
    performance: 'Kusetjentiswa',
    notifications: 'Tataziso'
  },
  
  // Venda
  ve: {
    welcome: 'Ni ṱanganedzwa kha Azora',
    earn: 'Wana vhuṱali nga u guda',
    login: 'Dzhenani',
    signup: 'Ṅwalisa',
    dashboard: 'Bodo',
    profile: 'Phurofile',
    lessons: 'Zwifundziso',
    rewards: 'Mbuelo',
    total_earned: 'Tshoṱhe yo ṱolwaho',
    complete_lesson: 'Fhedza fundziso',
    quiz_score: 'Zwiṅwalwa zwa mulingo',
    your_progress: 'Vhushavheli haṋu',
    teacher_dashboard: 'Bodo ya mudededzi',
    parent_dashboard: 'Bodo ya vhabebi',
    students: 'Vhagudiswa',
    performance: 'Mushumo',
    notifications: 'Zwidivhadzo'
  },
  
  // Southern Ndebele
  nr: {
    welcome: 'Samukelwa e-Azora',
    earn: 'Fumana imali ngokufunda',
    login: 'Ngena',
    signup: 'Bhalisa',
    dashboard: 'Ibhodi',
    profile: 'Iphrofayela',
    lessons: 'Izifundo',
    rewards: 'Imivuzo',
    total_earned: 'Ingqikithi efunyenwe',
    complete_lesson: 'Qedela isifundo',
    quiz_score: 'Amaphuzu ombhoxo',
    your_progress: 'Intuthuko yakho',
    teacher_dashboard: 'Ibhodi yothisha',
    parent_dashboard: 'Ibhodi yomzali',
    students: 'Abafundi',
    performance: 'Ukusebenza',
    notifications: 'Izaziso'
  },
  
  // Northern Ndebele
  nd: {
    welcome: 'Samukelwa e-Azora',
    earn: 'Fumana imali ngokufunda',
    login: 'Ngena',
    signup: 'Bhalisa',
    dashboard: 'Ibhodi',
    profile: 'Iphrofayela',
    lessons: 'Izifundo',
    rewards: 'Imivuzo',
    total_earned: 'Ingqikithi efunyenwe',
    complete_lesson: 'Qedela isifundo',
    quiz_score: 'Amaphuzu ombhoxo',
    your_progress: 'Intuthuko yakho',
    teacher_dashboard: 'Ibhodi yothisha',
    parent_dashboard: 'Ibhodi yomzali',
    students: 'Abafundi',
    performance: 'Ukusebenza',
    notifications: 'Izaziso'
  }
}

export class I18nService {
  private currentLanguage: SupportedLanguage = 'en'
  
  setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang
    console.log(`🌍 Language set to: ${lang}`)
  }
  
  t(key: string, fallback?: string): string {
    const translation = translations[this.currentLanguage]?.[key]
    if (translation) return translation
    
    // Fallback to English
    const englishTranslation = translations.en[key]
    if (englishTranslation) return englishTranslation
    
    // Last resort
    return fallback || key
  }
  
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }
  
  getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(translations) as SupportedLanguage[]
  }
}

export const i18n = new I18nService()
export default i18n
