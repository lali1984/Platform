import { Bell, Search, User, Menu, LogOut, Settings } from 'lucide-react'; // ← ДОБАВИТЬ LogOut, Settings
import { useState } from 'react';
import { ThemeModeToggle } from './ThemeModeToggle';
import { LanguageSelector } from './LanguageSelector';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // ← ДОБАВИТЬ
import { toast } from 'sonner'; // ← ДОБАВИТЬ

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth(); // ← ДОБАВИТЬ
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogout = () => {
    try {
      logout();
      setShowProfileMenu(false);
      toast.success(t('logoutSuccess') || 'Logged out successfully');
    } catch (error) {
      toast.error(t('logoutError') || 'Logout failed');
    }
  };

  return (
    <>
      <header
        className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6"
      >
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <Menu className="size-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <h1 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {t('platform')}
          </h1>
        </div>
        
        <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1 lg:gap-2">
          <LanguageSelector />
          <ThemeModeToggle />
          
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
            <Bell className="size-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-blue-600 rounded-full" />
          </button>
          
          {/* Profile Button with Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              {/* User Avatar with Initials or Icon */}
              {user ? (
                <div className="size-7 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="size-7 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:inline">
                {user ? user.username || user.email : t('profile')}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2">
                  {user ? (
                    // Logged in menu
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.username || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // TODO: Navigate to profile page
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <User className="size-4" />
                        {t('myProfile') || 'My Profile'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // TODO: Navigate to settings page
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <Settings className="size-4" />
                        {t('settings') || 'Settings'}
                      </button>
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                      >
                        <LogOut className="size-4" />
                        {t('logout') || 'Logout'}
                      </button>
                    </>
                  ) : (
                    // Not logged in menu
                    <>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLoginModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <User className="size-4" />
                        {t('login')}
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowRegisterModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <User className="size-4" />
                        {t('register')}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </>
  );
}