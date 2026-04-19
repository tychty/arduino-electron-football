import { useState } from 'react'
import { Language, LocaleStrings, locales } from '../locales'
import { LANGUAGE_DEFAULT } from '../../../shared/config'

const STORAGE_KEY = 'language'

function readLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ru' || stored === 'kz') return stored
  return LANGUAGE_DEFAULT as Language
}

export interface LocaleService {
  language: Language
  setLanguage: (lang: Language) => void
  t: (getter: (l: LocaleStrings) => string) => string
}

export function useLocale(): LocaleService {
  const [language, setLanguageState] = useState<Language>(readLanguage)

  function setLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEY, lang)
    setLanguageState(lang)
  }

  function t(getter: (l: LocaleStrings) => string): string {
    return getter(locales[language])
  }

  return { language, setLanguage, t }
}
