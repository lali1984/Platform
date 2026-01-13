import { Newspaper, BookOpen, GraduationCap, Handshake, ChevronLeft, ChevronRight, CreditCard, HelpCircle, Megaphone, Folder, Rocket } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useTheme, colorSchemes } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { BuildingIcon } from './icons/BuildingIcon';
import { SettingsIcon } from './icons/SettingsIcon';

const topMenuItems = [
  { icon: BuildingIcon, labelKey: 'myCompany', id: 'myCompany' },
  { icon: Folder, labelKey: 'myProjects', id: 'myProjects' },
  { icon: Rocket, labelKey: 'myStartups', id: 'myStartups' },
];

const mainMenuItems = [
  { icon: Newspaper, labelKey: 'news', id: 'news' },
  { icon: BookOpen, labelKey: 'knowledgeBase', id: 'knowledge' },
  { icon: GraduationCap, labelKey: 'education', id: 'education' },
  { icon: Handshake, labelKey: 'partnershipProgram', id: 'partnership' },
];

const bottomMenuItems = [
  { icon: SettingsIcon, labelKey: 'settings', id: 'settings' },
  { icon: CreditCard, labelKey: 'licenseAndPayment', id: 'license' },
  { icon: HelpCircle, labelKey: 'support', id: 'support' },
  { icon: Megaphone, labelKey: 'platformNews', id: 'platformNews' },
];

interface SidebarProps {
  activeItem: string;
  setActiveItem: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeItem, setActiveItem, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { colorScheme } = useTheme();
  const theme = colorSchemes[colorScheme];
  const { t } = useLanguage();

  return (
    <aside
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 relative transition-all duration-300 h-full"
      style={{ width: isCollapsed ? '64px' : '240px' }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1 shadow-sm transition-colors"
      >
        {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <div className="mb-4 px-4">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 font-semibold">{t('menu')}</h2>
          </div>
        )}
      </AnimatePresence>
      
      {/* Top Menu Items */}
      <nav className="px-2 mb-2">
        <ul className="space-y-1">
          {topMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={isCollapsed ? t(item.labelKey) : undefined}
                >
                  <Icon className="size-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <span className="flex-1 text-left text-sm whitespace-nowrap overflow-hidden">
                        {t(item.labelKey)}
                      </span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Separator between top and main menu */}
      <div className="px-4 py-2">
        <div className="border-t border-gray-200 dark:border-gray-800" />
      </div>

      {/* Main Menu Items - This will take all available space */}
      <nav className="flex-1 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={isCollapsed ? t(item.labelKey) : undefined}
                >
                  <Icon className="size-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <span className="flex-1 text-left text-sm whitespace-nowrap overflow-hidden">
                        {t(item.labelKey)}
                      </span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section - pinned to bottom */}
      <div className="mt-auto">
        {/* Separator */}
        <div className="px-4 py-3">
          <div className="border-t border-gray-200 dark:border-gray-800" />
        </div>

        {/* Bottom Menu */}
        <nav className="px-2 pb-2">
          <ul className="space-y-1">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={isCollapsed ? t(item.labelKey) : undefined}
                  >
                    <Icon className="size-5 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <span className="flex-1 text-left text-sm whitespace-nowrap overflow-hidden">
                          {t(item.labelKey)}
                        </span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}