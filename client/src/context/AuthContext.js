import React, { createContext, useState, useEffect, useMemo } from 'react';
import api, { fetchCsrfToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        await fetchCsrfToken();
        const res = await api.get('/api/auth/me');
        if (isMounted) setUser(res.data);
      } catch (err) {
        if (isMounted && process.env.NODE_ENV !== 'production') {
          console.error("AUTH HYDRATION FAILED", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setUser(res.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    setUser(res.data);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/api/users/profile', profileData);
    setUser((prev) => ({ ...prev, ...res.data }));
    return res.data;
  };

  const completeOnboarding = async (profileData) => {
    const res = await api.post('/api/users/onboarding', profileData);
    setUser((prev) => ({ ...prev, ...res.data }));
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    updateProfile,
    completeOnboarding,
    logout
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
