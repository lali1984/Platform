// src/app/components/PageRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '../constants/routes';
import { ProtectedRoute } from './ProtectedRoute';

// Исправленные ленивые импорты с маппингом именованного экспорта
const News = lazy(() => import('./pages/News'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Education = lazy(() => import('./pages/Education'));
const Partnership = lazy(() => import('./pages/Partnership'));
const MyCompany = lazy(() => import('./pages/MyCompany'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const MyStartups = lazy(() => import('./pages/MyStartups'));
const Settings = lazy(() => import('./pages/Settings'));
const License = lazy(() => import('./pages/License'));
const Support = lazy(() => import('./pages/Support'));
const PlatformNews = lazy(() => import('./pages/PlatformNews'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ExpertProfile = lazy(() => import('./pages/ExpertProfile'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile').then(module => ({ default: module.CompanyProfile })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка...</span>
  </div>
);

export function PageRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Публичные маршруты */}
        <Route path={ROUTES.HOME} element={<div className="p-6">Главная страница (в разработке)</div>} />
        <Route path={ROUTES.NEWS} element={<News />} />
        <Route path={ROUTES.KNOWLEDGE} element={<Knowledge />} />
        <Route path={ROUTES.EDUCATION} element={<Education />} />
        <Route path={ROUTES.PARTNERSHIP} element={<Partnership />} />
        <Route path={ROUTES.SUPPORT} element={<Support />} />
        <Route path={ROUTES.PLATFORM_NEWS} element={<PlatformNews />} />
        
        {/* Защищенные маршруты */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.MY_COMPANY} element={<MyCompany />} />
          <Route path={ROUTES.MY_PROJECTS} element={<MyProjects />} />
          <Route path={ROUTES.MY_STARTUPS} element={<MyStartups />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.LICENSE} element={<License />} />
          <Route path={ROUTES.PROFILE} element={<UserProfile userData={{ login: 'test', email: 'test@example.com' }} />} />
          <Route path={ROUTES.EXPERT_PROFILE} element={<ExpertProfile userData={{ login: 'expert', email: 'expert@example.com' }} />} />
          <Route path={ROUTES.COMPANY_PROFILE} element={<CompanyProfile userData={{ login: 'company', email: 'company@example.com' }} />} />
        </Route>
        
        {/* Резервный маршрут */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
}