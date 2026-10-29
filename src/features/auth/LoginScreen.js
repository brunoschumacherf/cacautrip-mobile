import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogo from '../../components/BrandLogo';
import { useLanguage } from '../../i18n';
import React, { useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';


import { Button, Field, Notice, Title, Muted, s } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';
import GoogleButton from '../../components/GoogleButton';
import LanguageSelector from '../../i18n/LanguageSelector';

export default function Login() {
  useLanguage();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 768;
  const narrow = width < 380;
  const { login } = useSession();
  const { run, busy, notice, setNotice } = useAction();
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const submit = () => run(async () => {
    if (signup) await api.post('/signup', form);
    await login(form.email, form.password);
  });
  return <View style={styles.screen}><Image source={compact ? require('../../../images/telamobile.jpg') : require('../../../images/telaweb.jpg')} style={styles.background} resizeMode="cover" accessible={false} /><KeyboardAvoidingView style={styles.viewport} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView style={styles.viewport} contentContainerStyle={[styles.content, { paddingHorizontal: compact ? 16 : 48, paddingTop: Math.max(insets.top, compact ? 24 : 40), paddingBottom: Math.max(insets.bottom, compact ? 24 : 40) }]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets><View style={[styles.card, { padding: narrow ? 16 : compact ? 20 : 32, borderRadius: compact ? 20 : 28 }]}><View style={[s.brandLockup, { marginBottom: compact ? 16 : 28, flexWrap: 'wrap' }]}><BrandLogo /><Text style={[s.brand, narrow && { fontSize: 20 }]}>CACAU TRIP</Text></View><Text style={[s.heading, compact && { fontSize: 26, lineHeight: 32 }]}>A Bahia espera por você.</Text><Muted>Descubra lugares e viaje com quem conhece a Costa do Cacau.</Muted><LanguageSelector /><Title>{signup ? 'Crie sua conta' : 'Bem-vindo de volta'}</Title><Notice>{notice}</Notice>{signup && <Field label="Nome completo" value={form.name} onChangeText={update('name')} />}<Field label="E-mail" value={form.email} onChangeText={update('email')} autoCapitalize="none" keyboardType="email-address" /><Field label="Senha" value={form.password} onChangeText={update('password')} secureTextEntry /><Button title={busy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'} onPress={submit} disabled={busy} /><GoogleButton disabled={busy} /><Button secondary title={signup ? 'Já tenho conta' : 'Quero me cadastrar'} onPress={() => { setSignup(!signup); setNotice(''); }} /></View></ScrollView></KeyboardAvoidingView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', minHeight: 0, backgroundColor: '#FBF5EB' },
  background: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  viewport: { flex: 1, minHeight: 0 },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '100%', maxWidth: 460, minWidth: 0,
    backgroundColor: 'rgba(255,252,248,0.95)',
    borderWidth: 1, borderColor: '#EADFD1',
    boxShadow: '0px 12px 40px rgba(57,30,22,0.07)',
  },
});