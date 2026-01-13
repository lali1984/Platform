import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PageLayoutProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function PageLayout({ titleKey, descriptionKey, icon: Icon, children }: PageLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      {/* Заголовок страницы */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <Icon className="size-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t(titleKey)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t(descriptionKey)}
          </p>
        </div>
      </div>

      {/* Контент страницы */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {children}
      </div>
    </div>
  );
}