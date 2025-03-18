import { useState, useEffect } from 'react'
import { translations } from '@/translations'
import { Language, TranslationKey } from '@/types/translations'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('pt-BR')
  
  useEffect(() => {
    // Recupera o idioma salvo no localStorage ou usa o padrão
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['pt-BR', 'en', 'es'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const t = (key: TranslationKey): string => {
    return translations[language].dashboard[key]
  }

  return { language, changeLanguage, t }
} 