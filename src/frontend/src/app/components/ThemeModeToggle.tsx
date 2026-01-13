import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeModeToggle() {
  const { themeMode, setThemeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <button
      onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
    >
      {isDark ? (
        <Moon className="size-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="size-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}