'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, LoginResponse } from '../lib/api';

interface User {
  id: string;
  email: string;
  mcgillVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response: LoginResponse = await apiLogin({ email, password });
    
    // Store token and user
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    }
    
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout error:', error);
    }
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
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
