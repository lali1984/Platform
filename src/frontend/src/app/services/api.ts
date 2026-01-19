import axios from 'axios';

const API_BASE = ''; // Относительные URL (проксируется через nginx)

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { 
    email: string; 
    password: string; 
    username?: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/api/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  verify2FA: (data: { userId: string; token: string }) =>
    api.post('/api/auth/2fa/verify', data),
  
  refreshToken: (data: { refreshToken: string }) =>
    api.post('/api/auth/refresh', data),
};

export default api;