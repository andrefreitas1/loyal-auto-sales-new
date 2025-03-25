import { ptBR } from './locales/pt-BR';
import { en } from './locales/en';
import { es } from './locales/es';
import { Translation } from './types';

export const locales = {
  'pt-BR': ptBR,
  'en': en,
  'es': es,
} as const;

export type Locale = keyof typeof locales;

export function getTranslations(locale: Locale): Translation {
  return locales[locale];
} 