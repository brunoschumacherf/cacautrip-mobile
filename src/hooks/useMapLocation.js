import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export default function useMapLocation() {
  const [position, setPosition] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(true), pending = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function locate() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      let coords;
      if (Platform.OS === 'web') {
        if (!window.isSecureContext) throw new Error('Para usar sua localização, abra o site com HTTPS ou localhost.');
        if (!navigator.geolocation) throw new Error('Seu navegador não oferece localização.');
        coords = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(result => resolve(result.coords), failure => reject(new Error(failure.code === 1 ? 'Permita o acesso à localização nas configurações do navegador.' : failure.code === 3 ? 'Não foi possível localizar a tempo. Tente novamente.' : 'Sua localização está indisponível. Confira se o GPS está ligado.')), { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }));
      } else {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') throw new Error('Permita o acesso à localização nas configurações do aplicativo.');
        if (!await Location.hasServicesEnabledAsync()) throw new Error('Ative a localização do aparelho e tente novamente.');
        coords = (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;
      }
      if (active.current) setPosition({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy || 0 });
    } catch (failure) {
      if (active.current) setError(failure.message || 'Não foi possível obter sua localização.');
    } finally {
      pending.current = false; if (active.current) setBusy(false);
    }
  }
  return { position, busy, error, locate };
}
