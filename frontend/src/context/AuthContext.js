'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load user on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('templatehub-token');
    if (savedToken) {
      setToken(savedToken);
      loadUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (authToken) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data.user);
    } catch (error) {
      localStorage.removeItem('templatehub-token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('templatehub-token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('templatehub-token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('templatehub-token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('templatehub-token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      googleLogin,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
