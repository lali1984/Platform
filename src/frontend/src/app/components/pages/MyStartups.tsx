import { Rocket } from 'lucide-react';
import { PageLayout } from '../../components/PageLayout';
import { useLanguage } from '../../context/LanguageContext';

export default function MyStartupsPage() {
  const { t } = useLanguage();

  return (
    <PageLayout
      titleKey="myStartups"
      descriptionKey="myStartupsDescription"
      icon={Rocket}
    >
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Rocket className="size-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('comingSoon')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t('myStartupsDescription')}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}