import { lazy, Suspense } from 'react';

// Ленивая загрузка страниц для оптимизации
const NewsPage = lazy(() => import('./pages/News'));
const KnowledgePage = lazy(() => import('./pages/Knowledge'));
const EducationPage = lazy(() => import('./pages/Education'));
const PartnershipPage = lazy(() => import('./pages/Partnership'));
const MyCompanyPage = lazy(() => import('./pages/MyCompany'));
const MyProjectsPage = lazy(() => import('./pages/MyProjects'));
const MyStartupsPage = lazy(() => import('./pages/MyStartups'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const LicensePage = lazy(() => import('./pages/License'));
const SupportPage = lazy(() => import('./pages/Support'));
const PlatformNewsPage = lazy(() => import('./pages/PlatformNews'));

interface PageRouterProps {
  activeSection: string;
}

export function PageRouter({ activeSection }: PageRouterProps) {
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  // Маппинг ID на компоненты страниц
  const pageMap: Record<string, React.ComponentType> = {
    news: NewsPage,
    knowledge: KnowledgePage,
    education: EducationPage,
    partnership: PartnershipPage,
    myCompany: MyCompanyPage,
    myProjects: MyProjectsPage,
    myStartups: MyStartupsPage,
    settings: SettingsPage,
    license: LicensePage,
    support: SupportPage,
    platformNews: PlatformNewsPage,
  };

  const CurrentPage = pageMap[activeSection] || NewsPage;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CurrentPage />
    </Suspense>
  );
}