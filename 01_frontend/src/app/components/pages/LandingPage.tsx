import { PageLayout } from '../PageLayout';
import { HomeIcon } from 'lucide-react';

export function LandingPage() {
  return (
    <PageLayout 
      titleKey="platform" 
      descriptionKey="platformUpdateDesc"
      icon={HomeIcon}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Добро пожаловать!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Это главная страница платформы. Здесь будет отображаться основная информация.
        </p>
      </div>
    </PageLayout>
  );
}