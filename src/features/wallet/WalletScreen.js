import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Empty, Muted, Page, Section, Title, money, statusLabel } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
export default function WalletScreen() {
  const { data, loading, error, reload, refreshing } = useResource('/wallet', { available: 0, pending: 0, gross: 0, fees: 0, entries: [], payments: [] });
  return <Page title="Minha carteira." subtitle="Seus recebimentos e pagamentos." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <Card><Muted>Disponível para saque</Muted><Text style={{ fontSize: 34, color: '#285b42', fontWeight: '800' }}>{money(data.available)}</Text><Muted>A receber: {money(data.pending)}</Muted><Button title="Sacar" onPress={() => router.push('/saque')} disabled={Number(data.available) <= 0} /></Card>
    <Card><Title>Resumo dos serviços</Title><Muted>Total recebido: {money(data.gross)}</Muted><Muted>Taxas da plataforma: {money(data.fees)}</Muted></Card>
    <Section title="Movimentações">{data.entries.map(item => <Card key={item.id}><Title>{{ earning: 'Recebimento', payout: 'Saque', subscription: 'Assinatura' }[item.kind]}</Title><Text>{money(item.amount)} · {item.kind === 'payout' ? 'Concluído' : statusLabel(item.status)}</Text><Muted>{new Date(item.created_at).toLocaleString('pt-BR')}</Muted>{item.metadata?.destination?.label && <Muted>{item.metadata.destination.label}</Muted>}</Card>)}{!data.entries.length && <Empty>Nenhuma movimentação.</Empty>}</Section>
    <Section title="Meus pagamentos">{data.payments.map(item => <Card key={item.id}><Title>Reserva #{item.id}</Title><Text>{money(item.total_amount)} · {statusLabel(item.payment_status)}</Text><Muted>{item.professional?.name}</Muted></Card>)}</Section>
  </Page>;
}


