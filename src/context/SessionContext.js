import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { normalizeUser } from '../lib/data';
import api from '../services/api';
const Context = createContext(null);
const key = 'cacautrip_token';
const storage = {
  get: async () => Platform.OS === 'web' ? (typeof window === 'undefined' ? null : window.sessionStorage.getItem(key)) : SecureStore.getItemAsync(key),
  set: async token => Platform.OS === 'web' ? window.sessionStorage.setItem(key, token) : SecureStore.setItemAsync(key, token),
  clear: async () => Platform.OS === 'web' ? window.sessionStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const generation = useRef(0);
  const refreshUser = useCallback(async () => {
    const current = generation.current;
    const result = await api.get('/me'); const profile = normalizeUser(result.data);
    if (current === generation.current) setUser(profile);
    return profile;
  }, []);
  const logout = useCallback(async () => {
    generation.current += 1; delete api.defaults.headers.common.Authorization; setUser(null); await storage.clear();
  }, []);
  useEffect(() => {
    let mounted = true;
    storage.get().then(async token => {
      if (!token || !mounted) return;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const result = await api.get('/me'); if (mounted) setUser(normalizeUser(result.data));
    }).catch(() => { delete api.defaults.headers.common.Authorization; }).finally(() => { if (mounted) setReady(true); });
    const interceptor = api.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401 && !['/login', '/signup', '/auth/google/finish'].includes(error.config?.url)) logout().catch(() => {});
      return Promise.reject(error);
    });
    return () => { mounted = false; api.interceptors.response.eject(interceptor); };
  }, [logout]);
  const login = useCallback(async (email, password) => {
    const result = await api.post('/login', { email, password });
    api.defaults.headers.common.Authorization = `Bearer ${result.data.token}`;
    try { await storage.set(result.data.token); await refreshUser(); }
    catch (error) { await logout(); throw error; }
  }, [refreshUser, logout]);
  const finishGoogle = useCallback(async credentials => {
    const result = await api.post('/auth/google/finish', credentials);
    api.defaults.headers.common.Authorization = `Bearer ${result.data.token}`;
    try { await storage.set(result.data.token); return await refreshUser(); }
    catch (error) { await logout(); throw error; }
  }, [refreshUser, logout]);
  const value = useMemo(() => ({ user, ready, login, finishGoogle, logout, refreshUser }), [user, ready, login, finishGoogle, logout, refreshUser]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error('Sessão indisponível fora do SessionProvider.');
  return context;
}


