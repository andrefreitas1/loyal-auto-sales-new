import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTranslations } from '@/i18n';
import type { Translation } from '@/i18n/types';

type Language = 'pt-BR' | 'en' | 'es';

interface LanguageStore {
  language: Language;
  translations: Translation;
  setLanguage: (language: Language) => void;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      translations: getTranslations('pt-BR'),
      setLanguage: (language) => {
        set({ language, translations: getTranslations(language) });
      },
    }),
    {
      name: 'language-storage',
    }
  )
); 