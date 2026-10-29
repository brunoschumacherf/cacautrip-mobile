import { ct } from '../../theme/tokens';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Badge, Button, Card, Field, Muted, Notice, Section, Title, money, statusLabel, Toggle } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { asArray } from '../../lib/data';
import { departureDate } from './TrailItinerary';
import api from '../../services/api';
export default function DepartureManager({ trailId, defaultMeeting }) {
  const { data, error, reload } = useResource(`/trails/${trailId}/edit`, { departures: [] });
  const { run, busy, notice, setNotice } = useAction();
  const [form, setForm] = useState({ starts_at: '', capacity: '12', meeting_point: defaultMeeting || '', notes: '', price_override: '' });
  const [repeat, setRepeat] = useState(false);
  const [weeks, setWeeks] = useState('4');
  const [roster, setRoster] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const create = () => run(async () => {
    const dates = form.starts_at.split(/\n|,/).map(value => value.trim()).filter(Boolean);
    const parsed = dates.map(value => new Date(`${value.replace(' ', 'T')}:00-03:00`));
    if (!parsed.length || parsed.some(date => Number.isNaN(date.getTime()))) throw new Error('Use AAAA-MM-DD HH:MM, uma saída por linha.');
    const count = Number(weeks);
    if (repeat && (!Number.isInteger(count) || count < 1 || count > 12)) throw new Error('Escolha de uma a 12 semanas.');
    const starts = repeat ? Array.from({ length: count }, (_, index) => new Date(parsed[0].getTime() + index * 7 * 86400000).toISOString()) : parsed.map(date => date.toISOString());
    await api.post(`/trails/${trailId}/departures`, { starts_at_list: starts, departure: { capacity: Number(form.capacity), meeting_point: form.meeting_point, notes: form.notes, price_override: form.price_override ? Number(form.price_override.replace(',', '.')) : null } });
    await reload(); setNotice('Saídas abertas para reserva.');
  });
  const save = () => run(async () => { await api.patch(`/trail_departures/${editing.id}`, { departure: { capacity: Number(editing.capacity), meeting_point: editing.meeting_point, notes: editing.notes, price_override: editing.price_override === '' ? null : editing.price_override } }); setEditing(null); await reload(); });
  return <Section title="Datas e vagas" subtitle="Horários da Bahia. As datas pertencem a esta trilha, não ao seu perfil inteiro.">
    <Notice>{error || notice}</Notice><Card><Title>Abrir novas saídas</Title><Field label="Data e horário (AAAA-MM-DD HH:MM)" hint="Você pode informar várias saídas, uma por linha." placeholder="2026-11-05 08:00" value={form.starts_at} onChangeText={update('starts_at')} multiline />
      <Toggle label="Repetir a primeira data semanalmente" value={repeat} onChange={setRepeat} />{repeat && <Field label="Quantidade de semanas (até 12)" value={weeks} onChangeText={setWeeks} keyboardType="number-pad" />}
      <Field label="Capacidade por saída" value={form.capacity} onChangeText={update('capacity')} keyboardType="number-pad" />
      <Field label="Ponto exato de encontro" value={form.meeting_point} onChangeText={update('meeting_point')} />
      <Field label="Preço especial desta saída (opcional)" hint="Em branco, usa o preço fixo da trilha." value={form.price_override} onChangeText={update('price_override')} keyboardType="decimal-pad" />
      <Field label="Orientações para a saída" value={form.notes} onChangeText={update('notes')} multiline />
      <Button title="Abrir datas e vagas" disabled={busy} onPress={create} />
    </Card>
    {asArray(data.departures).map(item => <Card key={item.id}><Badge>{{ scheduled: 'Programada', cancelled: 'Cancelada', finished: 'Finalizada' }[item.status]}</Badge><Title>{departureDate(item.starts_at)}</Title><Text style={ct.text}>{item.capacity - item.available_seats} vagas reservadas · {item.available_seats} livres</Text><Muted>{item.meeting_point} · {money(item.unit_price)}</Muted><Muted>{item.notes}</Muted>
      <Button secondary title="Ver participantes" disabled={busy} onPress={() => run(async () => { const result = await api.get(`/trail_departures/${item.id}/participants`); setRoster(result.data); })} />
      {item.status === 'scheduled' && <><Button secondary title="Alterar capacidade e orientações" onPress={() => setEditing({ ...item, price_override: item.price_override ?? '' })} />
        <Button secondary title="Cancelar esta saída" onPress={() => setConfirmCancel(item.id)} />
        {confirmCancel === item.id && <><Notice>As reservas serão canceladas e os participantes serão avisados. Pagamentos aprovados receberão estorno.</Notice><Button danger title="Confirmar cancelamento da saída" disabled={busy} onPress={() => run(async () => { await api.post(`/trail_departures/${item.id}/cancel`); setConfirmCancel(null); setRoster(null); await reload(); })} /><Button secondary title="Manter saída" onPress={() => setConfirmCancel(null)} /></>}
      </>}
    </Card>)}
    {editing && <Card><Title>Editar saída</Title><Muted>Uma saída com reservas mantém sua data e o ponto de encontro contratado.</Muted><Field label="Capacidade" value={String(editing.capacity)} onChangeText={value => setEditing(current => ({ ...current, capacity: value }))} keyboardType="number-pad" /><Field label="Ponto de encontro" value={editing.meeting_point} onChangeText={value => setEditing(current => ({ ...current, meeting_point: value }))} /><Field label="Orientações" value={editing.notes || ''} onChangeText={value => setEditing(current => ({ ...current, notes: value }))} multiline /><Button title="Salvar alterações" disabled={busy} onPress={save} /><Button secondary title="Cancelar edição" onPress={() => setEditing(null)} /></Card>}
    {roster && <Card><Title>Participantes · {departureDate(roster.departure.starts_at)}</Title>{asArray(roster.participants).map(item => <Card key={item.booking_id}><Title>{item.name} · {item.people} pessoa(s)</Title><Muted>{statusLabel(item.status)} · {statusLabel(item.payment_status)}</Muted><Button secondary title="Abrir reserva" onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: item.booking_id } })} /></Card>)}{!roster.participants.length && <Muted>Nenhuma reserva ativa nesta saída.</Muted>}<Button secondary title="Fechar participantes" onPress={() => setRoster(null)} /></Card>}
  </Section>;
}


