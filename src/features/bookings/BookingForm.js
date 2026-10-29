import React, { useState } from 'react';
import { Linking, Modal, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, Muted, Notice, Title, money } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { asArray } from '../../lib/data';
import api from '../../services/api';
export default function BookingForm({ service, onClose }) {
  const params = useLocalSearchParams();
  const driver = service.type === 'Motorista';
  const { data: routes } = useResource('/routes', []);
  const { run, busy, notice } = useAction();
  const [form, setForm] = useState({ date: '', meeting_point: '', dropoff_point: '', people: '1', total_amount: String(service.price || ''), route_id: Number(params.routeId) || '', conditions: '' });
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const submit = () => run(async () => {
    const response = await api.post('/bookings', { booking: { ...form, service_id: service.id, service_type: service.type, people: Number(form.people), total_amount: driver ? Number(form.total_amount.replace(',', '.')) : service.price, route_id: form.route_id || null } });
    onClose(); router.push({ pathname: '/reserva/[id]', params: { id: response.data.booking.id } });
  });
  return <Modal transparent visible animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#391E1680', padding: 20 }}><ScrollView style={{ maxHeight: '90%', width: '100%', maxWidth: 550, alignSelf: 'center', backgroundColor: '#FFFCF8', borderRadius: 24 }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
    <Title>{driver ? 'Proponha sua corrida' : 'Reserve seu passeio'}</Title><Muted>{service.name} · {driver ? 'O motorista poderá aceitar ou enviar outro valor.' : `Preço do guia: ${money(service.price)}`}</Muted><Notice>{notice}</Notice>
    <Field label="Data e horário (AAAA-MM-DD HH:MM)" value={form.date} onChangeText={update('date')} placeholder="2026-11-05 09:00" />
    {asArray(service.availability).map(date => <Button secondary key={date} title={`${form.date === date ? '✓ ' : ''}${date}`} onPress={() => update('date')(date)} />)}
    <Field label="Pessoas" value={form.people} onChangeText={update('people')} keyboardType="number-pad" />
    <Field label={driver ? 'Origem / ponto de embarque' : 'Ponto de encontro'} value={form.meeting_point} onChangeText={update('meeting_point')} />
    <Field label={driver ? 'Destino / desembarque' : 'Destino do passeio'} value={form.dropoff_point} onChangeText={update('dropoff_point')} />
    {driver && <><Button secondary title="Visualizar trajeto no mapa" disabled={!form.meeting_point.trim() || !form.dropoff_point.trim()} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(form.meeting_point)}&destination=${encodeURIComponent(form.dropoff_point)}&travelmode=driving`)} /><Field label="Quanto você oferece pela corrida? (R$)" value={form.total_amount} onChangeText={update('total_amount')} keyboardType="decimal-pad" /></>}
    <Field label="Observações" value={form.conditions} onChangeText={update('conditions')} multiline />
    <Muted>Vincular a um roteiro:</Muted><Button secondary title={!form.route_id ? '✓ Sem roteiro' : 'Sem roteiro'} onPress={() => update('route_id')('')} />{routes.map(route => <Button secondary key={route.id} title={`${form.route_id === route.id ? '✓ ' : ''}${route.title}`} onPress={() => update('route_id')(route.id)} />)}
    <Button title={driver ? 'Enviar proposta ao motorista' : 'Solicitar reserva'} disabled={busy || !form.date || !form.meeting_point || (driver && !form.dropoff_point)} onPress={submit} /><Button secondary title="Voltar" onPress={onClose} disabled={busy} />
  </ScrollView></View></Modal>;
}


