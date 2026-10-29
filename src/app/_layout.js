import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Stack, Redirect, useSegments } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenBoundary from '../components/ScreenBoundary';
import VisualStyles from '../theme/VisualStyles';
import { LanguageProvider } from '../i18n';

function Guard() {
  const { ready, user } = useSession();
  const segments = useSegments();
  if (!ready) return <ActivityIndicator style={{ flex: 1 }} color="#E96108" />;
  if (!user && !['login', 'compartilhar', 'google-callback'].includes(segments[0])) return <Redirect href="/login" />;
  if (user && segments[0] === 'login') return <Redirect href={user.active_role === 'tourist' ? '/' : '/profissional'} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
export default function Layout() { return <SafeAreaProvider><LanguageProvider><VisualStyles /><SessionProvider><ScreenBoundary><Guard /></ScreenBoundary></SessionProvider></LanguageProvider></SafeAreaProvider>; }



