// src/frontend/src/app/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { 
    email: string; 
    password: string; 
    username?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверка валидности токена при загрузке
    if (token) {
      // TODO: добавить проверку токена
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, tokens } = response.data;
      
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(tokens.accessToken);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: { 
    email: string; 
    password: string; 
    username?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      // Создаем объект только с определенными полями
      const requestData: any = {
        email: data.email,
        password: data.password
      };
      
      // Добавляем только те поля, которые не undefined
      if (data.username !== undefined && data.username.trim() !== '') {
        requestData.username = data.username;
      }
      if (data.firstName !== undefined && data.firstName.trim() !== '') {
        requestData.firstName = data.firstName;
      }
      if (data.lastName !== undefined && data.lastName.trim() !== '') {
        requestData.lastName = data.lastName;
      }
      
      const response = await authAPI.register(requestData);
      const { user } = response.data;
      
      // После регистрации автоматически логинимся
      await login(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}