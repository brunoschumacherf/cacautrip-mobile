import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Field, Notice, Title, Muted, s } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';

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
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 26, backgroundColor: '#f5f5ef' }} keyboardShouldPersistTaps="handled"><View style={{ width: '100%', maxWidth: 430, alignSelf: 'center' }}><Text style={s.brand}>cacautrip.</Text><Text style={s.heading}>A Bahia espera por você.</Text><Muted>Descubra lugares e viaje com quem conhece a Costa do Cacau.</Muted><Title>{signup ? 'Crie sua conta' : 'Bem-vindo de volta'}</Title><Notice>{notice}</Notice>{signup && <Field label="Nome completo" value={form.name} onChangeText={update('name')} />}<Field label="E-mail" value={form.email} onChangeText={update('email')} autoCapitalize="none" keyboardType="email-address" /><Field label="Senha" value={form.password} onChangeText={update('password')} secureTextEntry /><Button title={busy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'} onPress={submit} disabled={busy} /><Button secondary title={signup ? 'Já tenho conta' : 'Quero me cadastrar'} onPress={() => { setSignup(!signup); setNotice(''); }} /></View></ScrollView>;
}


