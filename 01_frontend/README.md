Создам полную документацию для frontend части проекта в чате. Сначала напишу основную структуру документации:

# 📱 Frontend Documentation

## 🎯 Обзор архитектуры frontend

Frontend приложение `platform-ecosystem` построено на основе современных React-технологий с использованием TypeScript и следует принципам Clean Architecture для обеспечения масштабируемости и поддерживаемости.

### Технологический стек
- **React 18.3** с хуками
- **TypeScript** для статической типизации
- **Vite 6** как сборщик и dev-сервер
- **Tailwind CSS 4** для стилизации
- **Material-UI** компоненты
- **Lucide React** иконки
- **React Router** для навигации

## 📁 Структура проекта

```
01_frontend/
├── src/
│   ├── app/                    # Основное приложение
│   │   ├── App.tsx            # Корневой компонент
│   │   ├── components/        # Переиспользуемые компоненты
│   │   │   ├── Chat.tsx       # Компонент чата
│   │   │   ├── ContentArea.tsx # Основная область контента
│   │   │   ├── Footer.tsx     # Футер
│   │   │   ├── Header.tsx     # Хедер с навигацией
│   │   │   ├── LanguageSelector.tsx # Селектор языка
│   │   │   ├── LoginModal.tsx # Модальное окно входа
│   │   │   ├── PageLayout.tsx # Макет страницы
│   │   │   ├── PageRouter.tsx # Роутер страниц
│   │   │   ├── RegisterModal.tsx # Модальное окно регистрации
│   │   │   ├── Sidebar.tsx    # Боковая панель
│   │   │   ├── ThemeModeToggle.tsx # Переключатель темы
│   │   │   ├── figma/         # Компоненты из Figma
│   │   │   ├── icons/         # Иконки
│   │   │   ├── pages/         # Страницы приложения
│   │   │   └── ui/            # Базовые UI компоненты
│   │   ├── context/           # React Context провайдеры
│   │   └── services/          # Сервисы для работы с API
│   ├── main.tsx              # Точка входа
│   └── styles/               # Глобальные стили
├── public/                   # Статические файлы
├── package.json             # Зависимости и скрипты
├── vite.config.ts           # Конфигурация Vite
├── tsconfig.json           # Конфигурация TypeScript
├── Dockerfile              # Docker конфигурация
└── README.md               # Базовая документация
```

## 🏗️ Архитектурные принципы

### 1. **Слоистая архитектура (Clean Architecture для frontend)**

```
Presentation Layer (Components) → Application Layer (Services/Hooks) → Domain Layer (Models/Types)
```

#### Presentation Layer (Компоненты)
- **Smart Components**: Управляют состоянием, обрабатывают события
- **Dumb Components**: Получают данные через props, отвечают только за отображение
- **Layout Components**: Определяют структуру страниц

#### Application Layer (Сервисы и хуки)
- **API Services**: Работа с BFF (Backend For Frontend)
- **State Management**: React Context, Zustand (если используется)
- **Custom Hooks**: Переиспользуемая бизнес-логика

#### Domain Layer (Модели и типы)
- **TypeScript Interfaces**: Определение типов данных
- **DTO Models**: Data Transfer Objects
- **Validation Schemas**: Схемы валидации (Zod/Yup)

### 2. **Компонентный подход**
- Каждый компонент отвечает за одну задачу
- Разделение на контейнерные и презентационные компоненты
- Использование compound components для сложных UI

### 3. **State Management**
- **Локальное состояние**: `useState`, `useReducer`
- **Глобальное состояние**: React Context для темы, языка, аутентификации
- **Серверное состояние**: React Query/SWR для кэширования API запросов

### 4. **Стилизация**
- **Tailwind CSS**: Утилитарные классы для быстрой разработки
- **CSS Modules**: Для изолированных стилей компонентов
- **Design Tokens**: Переменные для цветов, типографики, отступов

## 🛠️ Разработка компонентов

### Требования к компонентам

#### 1. **Типизация**
```typescript
// Пример правильно типизированного компонента
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  onClick,
  children,
}) => {
  // Реализация компонента
};
```

#### 2. **Props Design**
- Использовать деструктуризацию с значениями по умолчанию
- Избегать избыточных props (более 7-8)
- Для сложных компонентов использовать compound pattern

#### 3. **Состояние и жизненный цикл**
- Использовать хуки вместо классовых компонентов
- Выносить логику в custom hooks
- Обрабатывать loading, error, success состояния

#### 4. **Доступность (a11y)**
- Semantic HTML элементы
- ARIA атрибуты где необходимо
- Keyboard navigation поддержка
- Контраст цветов согласно WCAG

### Структура компонента

```typescript
// Пример структуры компонента
import React from 'react';
import { cn } from '@/lib/utils';
import { useCustomHook } from '@/hooks/useCustomHook';

interface ComponentProps {
  // Props с описанием
}

export const Component: React.FC<ComponentProps> = (props) => {
  // 1. Деструктуризация props
  const { prop1, prop2 } = props;
  
  // 2. Хуки (в правильном порядке)
  const [state, setState] = React.useState();
  const { data, isLoading } = useCustomHook();
  
  // 3. Обработчики событий
  const handleClick = () => {
    // Логика
  };
  
  // 4. Рендер
  return (
    <div className={cn('base-class', props.className)}>
      {/* JSX */}
    </div>
  );
};

// 5. Display name для dev tools
Component.displayName = 'Component';
```

## 🔗 Работа с API (BFF)

### Структура сервисов

```
services/
├── api/              # Базовые API клиенты
├── auth/             # Сервис аутентификации
├── user/             # Сервис пользователей
├── notifications/    # Сервис уведомлений
└── types/            # Типы для API
```

### Пример сервиса

```typescript
// services/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцепторы для токенов и ошибок
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Обработка истечения токена
    }
    return Promise.reject(error);
  }
);

// services/user/userService.ts
import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me');
    return response.data;
  },
  
  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`/api/users/${userId}`, data);
    return response.data;
  },
  
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post<{ avatarUrl: string }>(
      `/api/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.avatarUrl;
  },
};
```

### Обработка ошибок

```typescript
// services/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;
    const code = error.response?.data?.code;
    
    throw new ApiError(message, statusCode, code);
  }
  
  if (error instanceof Error) {
    throw new ApiError(error.message);
  }
  
  throw new ApiError('Unknown error occurred');
};
```

## 🎨 Стилизация и дизайн система

### Design Tokens

```typescript
// styles/tokens.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    // ...
  },
};

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
  },
};
```

### Tailwind конфигурация

```javascript
// tailwind.config.js
import { colors, spacing, typography } from './src/styles/tokens';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      spacing,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
    },
  },
  plugins: [],
  darkMode: 'class', // Поддержка темной темы через класс
};
```

### Компоненты с классами

```typescript
// Пример компонента с Tailwind
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800',
      'rounded-lg shadow-md',
      'p-6',
      'transition-colors duration-200',
      className
    )}>
      {children}
    </div>
  );
};
```

## 🌐 Интернационализация (i18n)

### Структура переводов

```
locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── dashboard.json
├── ru/
│   ├── common.json
│   ├── auth.json
│   └── dashboard.json
└── index.ts
```

### Настройка i18n

```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import ruCommon from '@/locales/ru/common.json';
import ruAuth from '@/locales/ru/auth.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
      },
      ru: {
        common: ruCommon,
        auth: ruAuth,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Использование в компонентах

```typescript
import { useTranslation } from 'react-i18next';

export const WelcomeMessage: React.FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.subtitle')}</p>
    </div>
  );
};
```

## 🔐 Аутентификация и авторизация

### Flow аутентификации

1. **Логин** → Получение access/refresh токенов
2. **Хранение токенов** → Secure HTTP-only cookies или localStorage
3. **Защищенные маршруты** → Проверка токена перед доступом
4. **Обновление токена** → Silent refresh при истечении access token

### Контекст аутентификации

```typescript
// context/AuthContext.tsx
import React from 'react';
import { authService } from '@/services/auth/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Проверка токена при загрузке
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, tokens } = await authService.login(email, password);
      setUser(user);
      // Сохранение токенов
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const register = async (data: RegisterDto) => {
    // Регистрация
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Защищенные маршруты

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

## 📱 Адаптивный дизайн

### Breakpoints

```typescript
// Константы для медиа-запросов
export const breakpoints = {
  sm: 640,   // mobile
  md: 768,   // tablet
  lg: 1024,  // desktop
  xl: 1280,  // large desktop
  '2xl': 1536,
};

// Хук для