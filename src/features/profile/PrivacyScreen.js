import { ct } from '../../theme/tokens';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { Button, Card, Muted, Notice, Page, Title } from '../../components/ui';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';
export default function Privacy() {
  const [exported, setExported] = useState(null);
  const { run, busy, notice, setNotice } = useAction();
  return <Page title="Seus dados e privacidade."><Notice>{notice}</Notice><Card><Title>Você no controle</Title><Muted>O app usa dados de conta, reservas e mensagens para prestar os serviços. A localização é solicitada apenas ao buscar lugares próximos e não é usada para guardar um histórico individual de deslocamentos.</Muted><Button secondary title="Consultar meus dados" disabled={busy} onPress={() => run(async () => { const result = await api.get('/privacy/export'); setExported(result.data); })} /><Button secondary title="Solicitar exclusão dos meus dados" disabled={busy} onPress={() => run(async () => { const result = await api.post('/privacy/deletion_request'); setNotice(result.data.message); })} /><Muted>A solicitação de exclusão passa pelo suporte para análise de pendências e requisitos de retenção.</Muted></Card>{exported && <Card><Title>Dados da sua conta</Title><Text selectable style={ct.text}>{JSON.stringify(exported, null, 2)}</Text></Card>}</Page>;
}



