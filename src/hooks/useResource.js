import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { errorText, normalizeResource } from '../lib/data';
import api from '../services/api';

// O caminho identifica a resposta. Uma requisição antiga nunca substitui filtros novos.
export function useResource(path, initial = null) {
  const defaults = useRef(initial);
  const sequence = useRef(0);
  const mounted = useRef(false);
  const [state, setState] = useState({ path, data: initial, loading: true, refreshing: false, error: '' });
  const reload = useCallback(async () => {
    const request = ++sequence.current;
    if (mounted.current) setState(current => ({ ...current, refreshing: true, error: '' }));
    try {
      const response = await api.get(path);
      const data = normalizeResource(path, response.data, defaults.current);
      if (mounted.current && request === sequence.current) setState({ path, data, loading: false, refreshing: false, error: '' });
      return data;
    } catch (error) {
      if (mounted.current && request === sequence.current) setState(current => ({ path, data: current.path === path ? current.data : defaults.current, loading: false, refreshing: false, error: errorText(error) }));
      return null;
    }
  }, [path]);
  useFocusEffect(useCallback(() => {
    mounted.current = true;
    reload();
    return () => { mounted.current = false; sequence.current += 1; };
  }, [reload]));
  const setData = useCallback(update => setState(current => ({ ...current, path, data: typeof update === 'function' ? update(current.data) : update })), [path]);
  const visible = state.path === path ? state : { data: defaults.current, loading: true, refreshing: false, error: '' };
  return { ...visible, reload, setData };
}

export function useAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const run = useCallback(async callback => {
    if (locked.current) return null;
    locked.current = true; setBusy(true); setNotice('');
    try { return await callback(); }
    catch (error) { setNotice(errorText(error)); return null; }
    finally { locked.current = false; setBusy(false); }
  }, []);
  return { busy, notice, setNotice, run };
}


