import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Badge, Button, Card, Muted, Notice, Page, Section, Shortcut, Title, s } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';

export default function ProfileScreen() {
  const { user, refreshUser, logout } = useSession();
  const { run, busy, notice } = useAction();
  const changeRole = role => run(async () => {
    await api.patch('/me', { active_role: role }); await refreshUser();
    router.replace(role === 'tourist' ? '/' : '/profissional');
  });
  return (
    <Page title="Minha conta." subtitle="Seus dados, seus perfis e suas preferências.">
      <Notice>{notice}</Notice>
      <Card>
        <Title>{user.name}</Title><Muted>{user.email}</Muted>
        <Badge>{user.gov_verified ? 'Gov.br autenticado' : 'Identidade não autenticada'}</Badge>
        {!user.gov_verified && <Button title="Autenticar com Gov.br" disabled={busy} onPress={() => run(async () => { await api.post('/me/verify_gov'); await refreshUser(); })} />}
        <Button secondary title="Editar dados e preferências" icon="settings-outline" onPress={() => router.push('/preferencias')} />
      </Card>
      <Section title="Como deseja usar o Cacautrip?" subtitle="Troque de perfil sem criar outra conta.">
        {user.roles.map(role => <Button key={role} secondary title={`${user.active_role === role ? '✓ ' : ''}${{ tourist: 'Viajar como turista', guide: 'Trabalhar como guia', driver: 'Trabalhar como motorista' }[role]}`} disabled={busy} onPress={() => changeRole(role)} />)}
      </Section>
      <Section title="Trabalhe na Costa do Cacau">
        <View style={s.row}>
          <Shortcut title="Guias" subtitle={user.guide_profile ? 'Gerenciar meu cadastro' : 'Ofereça experiências locais'} icon="trail-sign-outline" href={{ pathname: '/cadastro-profissional', params: { kind: 'guide' } }} />
          <Shortcut title="Motoristas" subtitle={user.driver_profile ? 'Gerenciar meu cadastro' : 'Transporte para os viajantes'} icon="car-outline" href={{ pathname: '/cadastro-profissional', params: { kind: 'driver' } }} />
        </View>
      </Section>
      <Section title="Conta e atendimento">
        <Button secondary title="Carteira e pagamentos" icon="wallet-outline" onPress={() => router.push('/carteira')} />
        <Button secondary title="Notificações" icon="notifications-outline" onPress={() => router.push('/notificacoes')} />
        <Button secondary title="Suporte e atendimento humano" icon="help-circle-outline" onPress={() => router.push('/suporte')} />
        <Button secondary title="Meus dados e privacidade" icon="shield-checkmark-outline" onPress={() => router.push('/privacidade')} />
        {user.admin && <Button title="Administração da plataforma" onPress={() => router.push('/admin')} />}
        <Button secondary title="Sair da conta" disabled={busy} onPress={() => run(logout)} />
      </Section>
    </Page>
  );
}


