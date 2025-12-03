"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "fr" | "es" | "yo" | "sw" | "ha" | "am"

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  en: {
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.courses": "Courses",
    "nav.mentors": "Mentors",
    "nav.community": "Community",
    "nav.jobs": "Jobs",
    "nav.dashboard": "Dashboard",
    "common.welcome": "Welcome to Azora Sapiens",
    "common.logout": "Logout",
    "common.language": "Language",
    "course.enroll": "Enroll Now",
    "course.price": "Price",
    "course.duration": "Duration",
    "course.instructor": "Instructor",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.explore": "Explorer",
    "nav.courses": "Cours",
    "nav.mentors": "Mentors",
    "nav.community": "Communauté",
    "nav.jobs": "Emplois",
    "nav.dashboard": "Tableau de bord",
    "common.welcome": "Bienvenue à Azora Sapiens",
    "common.logout": "Déconnexion",
    "common.language": "Langue",
    "course.enroll": "S'inscrire maintenant",
    "course.price": "Prix",
    "course.duration": "Durée",
    "course.instructor": "Instructeur",
  },
  es: {
    "nav.home": "Inicio",
    "nav.explore": "Explorar",
    "nav.courses": "Cursos",
    "nav.mentors": "Mentores",
    "nav.community": "Comunidad",
    "nav.jobs": "Empleos",
    "nav.dashboard": "Panel de control",
    "common.welcome": "Bienvenido a Azora Sapiens",
    "common.logout": "Cerrar sesión",
    "common.language": "Idioma",
    "course.enroll": "Inscribirse ahora",
    "course.price": "Precio",
    "course.duration": "Duración",
    "course.instructor": "Instructor",
  },
  yo: {
    "nav.home": "Oja",
    "nav.explore": "Tẹtisi",
    "nav.courses": "Awọn ẹkọ",
    "nav.mentors": "Awọn olukọ",
    "nav.community": "Agbegbe",
    "nav.jobs": "Awọn iṣẹ",
    "nav.dashboard": "Oju-iṣẹ",
    "common.welcome": "Kaabo si Azora Sapiens",
    "common.logout": "Jade",
    "common.language": "Ede",
    "course.enroll": "Forukọsile Bayi",
    "course.price": "Idiyele",
    "course.duration": "Akoko",
    "course.instructor": "Olukọ",
  },
  sw: {
    "nav.home": "Nyumbani",
    "nav.explore": "Chunguza",
    "nav.courses": "Kozi",
    "nav.mentors": "Waalimu",
    "nav.community": "Jamii",
    "nav.jobs": "Ajira",
    "nav.dashboard": "Dasibodi",
    "common.welcome": "Karibu kwa Azora Sapiens",
    "common.logout": "Toka",
    "common.language": "Lugha",
    "course.enroll": "Jifunze Sasa",
    "course.price": "Bei",
    "course.duration": "Muda",
    "course.instructor": "Mwalimu",
  },
  ha: {
    "nav.home": "Gida",
    "nav.explore": "Bincika",
    "nav.courses": "Aiki-aiki",
    "nav.mentors": "Malaman",
    "nav.community": "Jama'a",
    "nav.jobs": "Ayyuka",
    "nav.dashboard": "Dashboard",
    "common.welcome": "Karatu ga Azora Sapiens",
    "common.logout": "Fita",
    "common.language": "Harshe",
    "course.enroll": "Shiga Yanzu",
    "course.price": "Farashin",
    "course.duration": "Lokaci",
    "course.instructor": "Malami",
  },
  am: {
    "nav.home": "ቤት",
    "nav.explore": "ያስሱ",
    "nav.courses": "ኮርሶች",
    "nav.mentors": "አማካሪዎች",
    "nav.community": "ማህበረሰብ",
    "nav.jobs": "ስራ",
    "nav.dashboard": "ዳሽቦርድ",
    "common.welcome": "ወደ Azora Sapiens እንኳን በደህና መጡ",
    "common.logout": "ውጣ",
    "common.language": "ቋንቋ",
    "course.enroll": "አሁን ይመዝገቡ",
    "course.price": "ዋጋ",
    "course.duration": "ጊዜ",
    "course.instructor": "አስተማሪ",
  },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang)
    }
    setMounted(true)
  }, [])

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key
  }

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  if (!mounted) {return <>{children}</>}

  return <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
