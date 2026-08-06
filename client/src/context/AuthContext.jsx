import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hirectrack_token'));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        const userData = res.data.data ? res.data.data.user : res.data.user;
        setUser(userData);
      } catch {
        localStorage.removeItem('hirectrack_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const payload = res.data.data || res.data;
    const { token: newToken, user: newUser } = payload;
    localStorage.setItem('hirectrack_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async (data) => {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    const payload = res.data.data || res.data;
    const { token: newToken, user: newUser } = payload;
    localStorage.setItem('hirectrack_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hirectrack_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
