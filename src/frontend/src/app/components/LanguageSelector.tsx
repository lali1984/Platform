import { Languages, Check } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
] as const;

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      >
        <Languages className="size-5 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-lg p-3 z-50">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 px-2 text-sm">{t('language')}</h3>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded transition-all ${
                    language === lang.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-200">{lang.name}</span>
                  {language === lang.id && (
                    <Check className="size-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}