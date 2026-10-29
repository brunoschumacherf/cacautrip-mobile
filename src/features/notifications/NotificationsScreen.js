import { ct } from '../../theme/tokens';
import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Empty, Muted, Page, Title } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import api from '../../services/api';
export default function Notifications() {
  const { data, error, loading, reload } = useResource('/notifications', []);
  const { run, busy } = useAction();
  const open = item => run(async () => { await api.patch(`/notifications/${item.id}`); await reload(); router.push(({ agenda: '/agenda', chat: '/chat', perfil: '/perfil', suporte: '/suporte', sustentabilidade: '/sustentabilidade' })[item.target] || '/reservas'); });
  return <Page title="Fique por dentro." loading={loading} error={error} onRefresh={reload}>{data.map(item => <Card key={item.id}><Title>{item.read_at ? '' : '● '}{item.title}</Title><Text style={ct.text}>{item.body}</Text><Muted>{new Date(item.created_at).toLocaleString('pt-BR')}</Muted><Button secondary title="Ver detalhes" onPress={() => open(item)} disabled={busy} /></Card>)}{!data.length && <Empty>Nenhum aviso no momento.</Empty>}</Page>;
}




