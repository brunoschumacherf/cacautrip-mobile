import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import api from './api';

const key = 'cacautrip_google_pending';
export const googlePending = {
  get: async () => {
    const value = Platform.OS === 'web' ? window.sessionStorage.getItem(key) : await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  },
  set: async value => Platform.OS === 'web'
    ? window.sessionStorage.setItem(key, JSON.stringify(value))
    : SecureStore.setItemAsync(key, JSON.stringify(value)),
  clear: async () => Platform.OS === 'web' ? window.sessionStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

export async function startGoogleSignIn() {
  const redirect = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || (Platform.OS === 'web'
    ? `${window.location.origin}/google-callback`
    : Linking.createURL('google-callback'));
  const { data } = await api.post('/auth/google/start', { redirect_uri: redirect });
  // O código de retorno sozinho não abre uma sessão: exige este segredo local.
  await googlePending.set({ flowId: String(data.flow_id), secret: data.exchange_secret, startedAt: Date.now() });
  try {
    if (Platform.OS === 'web') window.location.assign(data.authorization_url);
    else await Linking.openURL(data.authorization_url);
  } catch (error) {
    await googlePending.clear();
    throw error;
  }
}
