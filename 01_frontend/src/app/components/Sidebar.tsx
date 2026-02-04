// Sidebar.tsx - исправленная версия (без framer-motion)
import { Newspaper, BookOpen, GraduationCap, Handshake, ChevronLeft, ChevronRight, CreditCard, HelpCircle, Megaphone, Folder, Rocket } from 'lucide-react';
import { useLanguage, TranslationKeys } from '../context/LanguageContext';
import { BuildingIcon } from './icons/BuildingIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useState, useEffect } from 'react'; // Добавить если нужно состояние для анимации

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: TranslationKeys;
  path: string;
};

const topMenuItems: MenuItem[] = [
  { icon: BuildingIcon, labelKey: 'myCompany', path: ROUTES.MY_COMPANY },
  { icon: Folder, labelKey: 'myProjects', path: ROUTES.MY_PROJECTS },
  { icon: Rocket, labelKey: 'myStartups', path: ROUTES.MY_STARTUPS },
];

const mainMenuItems: MenuItem[] = [
  { icon: Newspaper, labelKey: 'news', path: ROUTES.NEWS },
  { icon: BookOpen, labelKey: 'knowledgeBase', path: ROUTES.KNOWLEDGE },
  { icon: GraduationCap, labelKey: 'education', path: ROUTES.EDUCATION },
  { icon: Handshake, labelKey: 'partnershipProgram', path: ROUTES.PARTNERSHIP },
];

const bottomMenuItems: MenuItem[] = [
  { icon: SettingsIcon, labelKey: 'settings', path: ROUTES.SETTINGS },
  { icon: CreditCard, labelKey: 'licenseAndPayment', path: ROUTES.LICENSE },
  { icon: HelpCircle, labelKey: 'support', path: ROUTES.SUPPORT },
  { icon: Megaphone, labelKey: 'platformNews', path: ROUTES.PLATFORM_NEWS },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobileSidebarOpen?: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, setIsMobileSidebarOpen }: SidebarProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const [showMenuLabel, setShowMenuLabel] = useState(!isCollapsed);

  useEffect(() => {
    setShowMenuLabel(!isCollapsed);
  }, [isCollapsed]);

  const handleLinkClick = () => {
    if (setIsMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };
  
  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    return (
      <li key={item.path}>
        <Link
          to={item.path}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded transition-colors ${
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title={isCollapsed ? t(item.labelKey) : undefined}
          onClick={handleLinkClick}
        >
          <item.icon className="size-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="flex-1 text-left text-sm whitespace-nowrap overflow-hidden">
              {t(item.labelKey)}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 relative transition-all duration-300 h-full"
      style={{ width: isCollapsed ? '64px' : '240px' }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1 shadow-sm transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      {/* Menu Label */}
      {showMenuLabel && (
        <div className="mb-4 px-4">
          <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 font-semibold">{t('menu')}</h2>
        </div>
      )}

      {/* Top Menu Items */}
      <nav className="px-2 mb-2">
        <ul className="space-y-1">
          {topMenuItems.map(renderMenuItem)}
        </ul>
      </nav>

      {/* Separator */}
      <div className="px-4 py-2">
        <div className="border-t border-gray-200 dark:border-gray-800" />
      </div>

      {/* Main Menu Items */}
      <nav className="flex-1 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {mainMenuItems.map(renderMenuItem)}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="px-4 py-3">
          <div className="border-t border-gray-200 dark:border-gray-800" />
        </div>

        <nav className="px-2 pb-2">
          <ul className="space-y-1">
            {bottomMenuItems.map(renderMenuItem)}
          </ul>
        </nav>
      </div>
    </aside>
  );
}