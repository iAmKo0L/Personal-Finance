import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const value = useMemo(() => ({
    token,
    user,
    async login(email, password) {
      const result = await api.login({ email, password });
      setToken(result.token);
      setUser(result.user);
    },
    async register(payload) {
      const result = await api.register(payload);
      setToken(result.token);
      setUser(result.user);
    },
    async refreshProfile() {
      if (!token) return;
      const me = await api.me(token);
      setUser(me);
    },
    logout() {
      setToken('');
      setUser(null);
    },
    setUser
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
