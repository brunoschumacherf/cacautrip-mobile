import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Empty, Muted, Page, Title, money, statusLabel, s } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
const closed = ['completed', 'cancelled', 'rejected'];
const categories = { active: 'Em andamento', pending: 'Propostas', payment: 'Pagamento', history: 'Histórico' };
export default function BookingList({ professional = false }) {
  const { data, loading, error, reload, refreshing } = useResource(professional ? '/bookings/requests' : '/bookings', []);
  const [filter, setFilter] = useState('active');
  const items = data.filter(item => filter === 'history' ? closed.includes(item.status) : filter === 'pending' ? ['pending_approval', 'counteroffer'].includes(item.status) : filter === 'payment' ? item.status === 'approved_waiting_payment' : !closed.includes(item.status));
  return <Page title={professional ? 'Minha agenda.' : 'Minhas reservas.'} subtitle={professional ? 'Propostas recebidas e próximos atendimentos.' : 'Acompanhe sua viagem em um só lugar.'} loading={loading} error={error} onRefresh={reload} refreshing={refreshing}>
    <View style={s.row}>{Object.entries(categories).map(([key, label]) => <Button secondary key={key} title={`${key === filter ? '✓ ' : ''}${label}`} onPress={() => setFilter(key)} />)}</View>
    {items.map(item => <Card key={item.id}>
      <Badge>{item.hold_expired ? 'Prazo de pagamento expirado' : statusLabel(item.status)}</Badge><Title>{professional ? item.tourist_name : item.trail_snapshot?.title || item.professional?.name || item.service_type}</Title>
      <Muted>{item.service_type} · #{item.id} · {item.date}</Muted><Muted>{item.people} pessoa(s) · {money(item.total_amount)}</Muted>
      <Button title="Ver reserva" onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: item.id } })} />
    </Card>)}
    {!loading && !items.length && <Empty>Nenhuma reserva nesta seção.</Empty>}
  </Page>;
}


