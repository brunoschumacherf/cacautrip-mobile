import React, { useState } from 'react';
import { Button, Card, Field, Notice, Page, Title, Toggle } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';
export default function PreferencesScreen() {
  const { user, refreshUser } = useSession();
  const [form, setForm] = useState({ name: user.name, email: user.email, region: user.preferences.region || '', interests: user.preferences.interests || '', accessible: !!user.preferences.accessible, notifications: user.preferences.notifications !== false });
  const { run, busy, notice, setNotice } = useAction();
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const save = () => run(async () => {
    const { name, email, ...preferences } = form;
    await api.patch('/me', { name, email, preferences }); await refreshUser(); setNotice('Dados atualizados.');
  });
  return <Page title="Dados e preferências."><Notice>{notice}</Notice><Card>
    <Title>Seus dados</Title><Field label="Nome completo" value={form.name} onChangeText={update('name')} />
    <Field label="E-mail" value={form.email} onChangeText={update('email')} autoCapitalize="none" keyboardType="email-address" />
    <Title>Sua viagem</Title><Field label="Região de preferência" value={form.region} onChangeText={update('region')} />
    <Field label="Interesses" hint="Ex.: praias, trilhas, chocolate, gastronomia" value={form.interests} onChangeText={update('interests')} />
    <Toggle label="Priorizar experiências acessíveis" value={form.accessible} onChange={update('accessible')} />
    <Toggle label="Avisos e recomendações opcionais" value={form.notifications} onChange={update('notifications')} />
    <Button title="Salvar alterações" onPress={save} disabled={busy} />
  </Card></Page>;
}

