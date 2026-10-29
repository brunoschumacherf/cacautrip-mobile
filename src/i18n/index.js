import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Text as NativeText } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { activateLanguage, languages, translate } from './core';
export { locale, translate } from './core';
const LanguageContext = createContext({ language: 'pt-BR', setLanguage: () => {}, error: '' });
const key = 'cacautrip_language';
export function LanguageProvider({ children }) {
  const [language, update] = useState('pt-BR');
  const [error, setError] = useState('');
  const changed = useRef(false), queue = useRef(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const saved = Platform.OS === 'web' ? (typeof window === 'undefined' ? null : window.localStorage.getItem(key)) : await SecureStore.getItemAsync(key);
        if (mounted && !changed.current && languages.some(item => item.code === saved)) { activateLanguage(saved); update(saved); }
      } catch { /* A preferência continua disponível durante esta sessão. */ }
    };
    restore(); return () => { mounted = false; };
  }, []);
  useEffect(() => { if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = language; }, [language]);
  const setLanguage = useCallback(next => {
    if (!languages.some(item => item.code === next)) return;
    changed.current = true; activateLanguage(next); update(next); setError('');
    queue.current = queue.current.catch(() => {}).then(async () => {
      try {
        if (Platform.OS === 'web') window.localStorage.setItem(key, next);
        else await SecureStore.setItemAsync(key, next);
      } catch { setError('O idioma mudou, mas não foi possível salvar a preferência neste dispositivo.'); }
    });
  }, []);
  const value = useMemo(() => ({ language, setLanguage, error }), [language, setLanguage, error]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  return { ...context, t: value => translate(value, context.language) };
}
export function LocalizedText({ children, translate: shouldTranslate = true, accessibilityLabel, ...props }) {
  const { t } = useLanguage();
  let content = children;
  if (shouldTranslate) {
    if (Array.isArray(children) && children.every(child => child == null || typeof child === 'boolean' || typeof child === 'string' || typeof child === 'number')) content = t(children.filter(child => child != null && typeof child !== 'boolean').join(''));
    else if (Array.isArray(children)) content = children.map(child => typeof child === 'string' ? t(child) : child);
    else content = t(children);
  }
  return <NativeText {...props} accessibilityLabel={t(accessibilityLabel)}>{content}</NativeText>;
}
