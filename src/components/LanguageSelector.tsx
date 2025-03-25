'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

type Language = 'pt-BR' | 'en' | 'es';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'pt-BR' as Language, name: 'Português' },
    { code: 'en' as Language, name: 'English' },
    { code: 'es' as Language, name: 'Español' }
  ];

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span>{languages.find(lang => lang.code === language)?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                language === lang.code
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 