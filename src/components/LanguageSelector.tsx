import { useLanguage } from '@/hooks/useLanguage'
import { Language } from '@/types/translations'

export function LanguageSelector() {
  const { language, changeLanguage } = useLanguage()
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('pt-BR')}
        className={`px-2 py-1 rounded ${
          language === 'pt-BR' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${
          language === 'en' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2 py-1 rounded ${
          language === 'es' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        ES
      </button>
    </div>
  )
} 