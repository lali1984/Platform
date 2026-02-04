// src/app/components/PageLayout.tsx
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage, TranslationKeys } from '../context/LanguageContext';

interface PageLayoutProps {
  titleKey: TranslationKeys;
  descriptionKey: TranslationKeys;
  icon: LucideIcon;
  children: ReactNode;
}

export function PageLayout({ titleKey, descriptionKey, icon: Icon, children }: PageLayoutProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок страницы */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="size-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t(titleKey)}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t(descriptionKey)}
        </p>
      </div>

      {/* Контент страницы */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {children}
      </div>
    </div>
  );
}