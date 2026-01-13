import { createContext, useContext, useState, ReactNode } from 'react';

type ColorScheme = 'blue' | 'purple' | 'green' | 'orange';
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

// Default fallback value
const defaultContextValue: ThemeContextType = {
  colorScheme: 'blue',
  setColorScheme: () => {},
  themeMode: 'light',
  setThemeMode: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('blue');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

export const colorSchemes = {
  blue: {
    primary: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-600',
    primaryLight: 'bg-blue-50',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-300',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-50 to-purple-50',
    icon: 'bg-blue-100 text-blue-600',
    darkPrimary: 'dark:bg-blue-600',
    darkIcon: 'dark:bg-blue-900/50 dark:text-blue-400',
  },
  purple: {
    primary: 'bg-purple-500',
    primaryHover: 'hover:bg-purple-600',
    primaryLight: 'bg-purple-50',
    primaryText: 'text-purple-600',
    primaryBorder: 'border-purple-300',
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-50 to-pink-50',
    icon: 'bg-purple-100 text-purple-600',
    darkPrimary: 'dark:bg-purple-600',
    darkIcon: 'dark:bg-purple-900/50 dark:text-purple-400',
  },
  green: {
    primary: 'bg-green-500',
    primaryHover: 'hover:bg-green-600',
    primaryLight: 'bg-green-50',
    primaryText: 'text-green-600',
    primaryBorder: 'border-green-300',
    gradient: 'from-green-500 to-green-600',
    lightGradient: 'from-green-50 to-emerald-50',
    icon: 'bg-green-100 text-green-600',
    darkPrimary: 'dark:bg-green-600',
    darkIcon: 'dark:bg-green-900/50 dark:text-green-400',
  },
  orange: {
    primary: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryLight: 'bg-orange-50',
    primaryText: 'text-orange-600',
    primaryBorder: 'border-orange-300',
    gradient: 'from-orange-500 to-orange-600',
    lightGradient: 'from-orange-50 to-red-50',
    icon: 'bg-orange-100 text-orange-600',
    darkPrimary: 'dark:bg-orange-600',
    darkIcon: 'dark:bg-orange-900/50 dark:text-orange-400',
  },
};