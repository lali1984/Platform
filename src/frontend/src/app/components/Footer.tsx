import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="h-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 text-xs text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-6">
        <p>© 2026 {t('platform')}</p>
        <nav className="flex gap-4">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('aboutUs')}</a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('help')}</a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('privacy')}</a>
        </nav>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="size-1.5 bg-green-500 rounded-full" />
        <span>{t('allSystemsOperational')}</span>
      </div>
    </footer>
  );
}