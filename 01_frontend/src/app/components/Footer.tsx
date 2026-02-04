import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span>© 2026 {t('platform')}</span>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('aboutUs')}</a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('help')}</a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('privacy')}</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-green-500 rounded-full" />
          <span>{t('allSystemsOperational')}</span>
        </div>
      </div>
    </footer>
  );
}