import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('voicebridge_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('voicebridge_user', JSON.stringify(res.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Failed to load user profile on startup:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authAPI.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('voicebridge_token', res.token);
        localStorage.setItem('voicebridge_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.error || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const res = await authAPI.signup(userData);
      if (res.success && res.token) {
        localStorage.setItem('voicebridge_token', res.token);
        localStorage.setItem('voicebridge_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.error || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Signup failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async (role = 'student') => {
    setError(null);
    try {
      const res = await authAPI.demoLogin(role);
      if (res.success && res.token) {
        localStorage.setItem('voicebridge_token', res.token);
        localStorage.setItem('voicebridge_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.error || 'Demo login failed');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Demo login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('voicebridge_token');
    localStorage.removeItem('voicebridge_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        error,
        login,
        signup,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
