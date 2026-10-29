import { useLanguage } from '../../i18n';
import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Muted, Notice, Page, Section, Shortcut, Title, statusLabel, s } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useResource } from '../../hooks/useResource';
import Performance from './Performance';

export default function ProfessionalDashboard() {
  useLanguage();
  const { user } = useSession();
  const { data, loading, error, reload, refreshing } = useResource('/professional_profiles/mine', []);
  return <Page title="Meu trabalho." subtitle="Sua operação organizada, do primeiro contato ao recebimento." loading={loading} error={error} onRefresh={reload} refreshing={refreshing}>
    <View style={s.row}>
      <Shortcut title="Agenda" subtitle="Aceites e próximos serviços" icon="calendar-outline" href="/agenda" />
      <Shortcut title="Carteira" subtitle="Saldo e recebimentos" icon="wallet-outline" href="/carteira" />
      <Shortcut title="Mensagens" subtitle="Converse com seus clientes" icon="chatbubbles-outline" href="/chat" />
    </View>
    <Section title="Meus anúncios">
      {user.guide_profile && <Button title="Minhas trilhas, percursos e saídas" onPress={() => router.push('/minhas-trilhas')} />}
      <Button secondary title="Encontrar guias e motoristas" onPress={() => router.push('/profissionais')} />
      {data.map(item => <Card key={item.type}>
        <Title>{item.type}</Title><Badge>{statusLabel(item.moderation_status)}</Badge>
        <Muted>{item.moderation_status === 'pending' ? 'A administração está analisando seu cadastro. Você será avisado quando houver uma decisão.' : item.moderation_status === 'published' ? 'Seu perfil está publicado. Mantenha sua agenda e seus preços atualizados.' : 'Revise seus dados ou fale com a equipe de suporte.'}</Muted>
        <Button secondary title="Editar serviços e disponibilidade" onPress={() => router.push({ pathname: '/cadastro-profissional', params: { kind: item.type === 'Guia' ? 'guide' : 'driver' } })} />
      </Card>)}
      {!data.length && <Card><Title>Comece seu cadastro</Title><Muted>Autentique sua conta, informe seus serviços e envie seus dados para aprovação.</Muted><Button title="Cadastrar guia" onPress={() => router.push({ pathname: '/cadastro-profissional', params: { kind: 'guide' } })} /><Button secondary title="Cadastrar motorista" onPress={() => router.push({ pathname: '/cadastro-profissional', params: { kind: 'driver' } })} /></Card>}
    </Section>
    <Section title="Desempenho e reputação"><Performance profiles={data} /></Section>
    {(user.guide_profile || user.driver_profile) && <Button secondary title="Conhecer planos e destaque" onPress={() => router.push('/planos')} />}
  </Page>;
}


