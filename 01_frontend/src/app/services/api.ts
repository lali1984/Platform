import axios, { AxiosInstance } from 'axios';

// 🔴 ИСПРАВЛЕНО: Используем import.meta.env с правильной типизацией
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3003/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен недействителен - разлогинить пользователя
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }) => apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  // 🔴 ДОБАВЛЕНО: метод валидации токена
  validateToken: (token: string) =>
    apiClient.post('/auth/validate-token', { token }),

  verify2FA: (data: { userId: string; code: string }) =>
    apiClient.post('/auth/verify-2fa', data),

  refreshToken: (data: { refreshToken: string }) =>
    apiClient.post('/auth/refresh', data),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile/me'),
  updateProfile: (data: any) => apiClient.put('/users/profile/me', data),
};

// Экспорт клиента для прямого использования при необходимости
export { apiClient };

export default apiClient;