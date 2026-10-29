import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/tokens';
import { Button, Field, Notice, Title, Muted, s } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';
import GoogleButton from '../../components/GoogleButton';

export default function Login() {
  const { login } = useSession();
  const { run, busy, notice, setNotice } = useAction();
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const submit = () => run(async () => {
    if (signup) await api.post('/signup', form);
    await login(form.email, form.password);
  });
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 26, backgroundColor: '#FBF5EB' }} keyboardShouldPersistTaps="handled"><View style={{ width: '100%', maxWidth: 460, alignSelf: 'center', backgroundColor: '#FFFCF8', borderRadius: 28, padding: 28, borderWidth: 1, borderColor: '#EADFD1', boxShadow: '0px 12px 40px rgba(57,30,22,0.07)' }}><View style={[s.brandLockup, { marginBottom: 28 }]}><View style={s.logo}><Ionicons name="leaf-outline" size={23} color={colors.white} /></View><Text style={s.brand}>CACAU TRIP</Text></View><Text style={s.heading}>A Bahia espera por você.</Text><Muted>Descubra lugares e viaje com quem conhece a Costa do Cacau.</Muted><Title>{signup ? 'Crie sua conta' : 'Bem-vindo de volta'}</Title><Notice>{notice}</Notice>{signup && <Field label="Nome completo" value={form.name} onChangeText={update('name')} />}<Field label="E-mail" value={form.email} onChangeText={update('email')} autoCapitalize="none" keyboardType="email-address" /><Field label="Senha" value={form.password} onChangeText={update('password')} secureTextEntry /><Button title={busy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'} onPress={submit} disabled={busy} /><GoogleButton disabled={busy} /><Button secondary title={signup ? 'Já tenho conta' : 'Quero me cadastrar'} onPress={() => { setSignup(!signup); setNotice(''); }} /></View></ScrollView>;
}





