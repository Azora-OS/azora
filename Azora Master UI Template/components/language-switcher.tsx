"use client"

import { useI18n } from "@/lib/i18n-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "yo", name: "Yorùbá" },
    { code: "sw", name: "Kiswahili" },
    { code: "ha", name: "Hausa" },
    { code: "am", name: "አማርኛ" },
  ]

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as any)}
      className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm font-medium"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  )
}
