import { useLanguage } from '../../i18n';
import { ct } from '../../theme/tokens';
import React, { useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { Modal, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Field, Muted, Notice, Page, Photo, Section, Title, Toggle, money } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { asArray } from '../../lib/data';
import TrailItinerary, { departureDate, difficultyLabel } from './TrailItinerary';
import api from '../../services/api';
function Reserve({ trail, departure, onClose }) {
  const params = useLocalSearchParams();
  const [people, setPeople] = useState('1');
  const [accepted, setAccepted] = useState(false);
  const { run, busy, notice } = useAction();
  const total = Number(departure.unit_price) * (trail.price_mode === 'per_person' ? Number(people || 0) : 1);
  const reserve = () => run(async () => {
    const response = await api.post(`/trail_departures/${departure.id}/reserve`, { people: Number(people), requirements_accepted: accepted, route_id: Number(params.routeId) || undefined });
    onClose(); router.push({ pathname: '/reserva/[id]', params: { id: response.data.booking.id } });
  });
  return <Modal visible transparent onRequestClose={onClose} animationType="slide"><View style={{ flex: 1, backgroundColor: '#391E1680', padding: 20, justifyContent: 'center' }}><ScrollView style={{ maxHeight: '90%', width: '100%', maxWidth: 530, backgroundColor: '#FFFCF8', borderRadius: 24, alignSelf: 'center' }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
    <Title translate={false}>{trail.title}</Title><Muted>{departureDate(departure.starts_at)} · Horário da Bahia</Muted><Text style={ct.text}>Encontro: {departure.meeting_point}</Text><Muted>{departure.available_seats} vagas disponíveis</Muted><Notice>{notice}</Notice>
    <Field label="Quantas pessoas vão participar?" value={people} onChangeText={setPeople} keyboardType="number-pad" /><Title>Total: {money(total)}</Title>
    <Muted>Idade mínima: {trail.minimum_age} anos. {trail.cancellation_policy}</Muted>
    <Toggle label="Li o roteiro e as condições, e os participantes atendem aos requisitos de idade e preparo." value={accepted} onChange={setAccepted} />
    <Muted>As vagas ficam reservadas por 30 minutos para você concluir o pagamento.</Muted>
    <Button title="Reservar vagas e continuar" onPress={reserve} disabled={busy || !accepted || Number(people) < 1 || Number(people) > departure.available_seats} />
    <Button secondary title="Voltar" onPress={onClose} disabled={busy} />
  </ScrollView></View></Modal>;
}
export default function TrailDetails() {
  useLanguage();
  const { id } = useLocalSearchParams();
  const { user } = useSession();
  const { data: trail, loading, error, reload, refreshing } = useResource(`/trails/${Number(id)}`, { stops: [], departures: [], reviews: [] });
  const [departure, setDeparture] = useState(null);
  const { run, busy, notice } = useAction();
  const chat = () => run(async () => { const result = await api.post('/conversations', { professional_type: 'Guia', professional_id: trail.guide.id }); router.push({ pathname: '/chat', params: { conversation: result.data.id } }); });
  return <Page title={trail.title || 'Conheça a trilha.'} subtitle={trail.region} loading={loading} error={error} onRefresh={reload} refreshing={refreshing}>
    <Notice>{notice}</Notice>{Boolean(trail.id) && <><Photo uri={trail.image_url} /><Badge>{difficultyLabel(trail.difficulty)} · {trail.duration_minutes} min{trail.distance_km ? ` · ${trail.distance_km} km` : ''}</Badge>
      <Card><Title>Uma experiência com {trail.guide?.name}</Title><Text style={ct.text}>{trail.description}</Text><Muted>★ {Number(trail.rating || 0).toFixed(1)} · {trail.reviews_count || 0} avaliações</Muted><Muted>{trail.guide?.languages}</Muted><Title>{money(trail.price)} {trail.price_mode === 'per_person' ? 'por pessoa' : 'por grupo'}</Title>
        {user.id !== trail.guide?.user_id && <Button secondary title="Conversar com o guia" onPress={chat} disabled={busy} />}
      </Card>
      <Section title="Por onde vamos passar"><TrailItinerary stops={trail.stops} mode={trail.route_mode} /></Section>
      <Section title="Prepare-se para o passeio">
        <Card><Title>Requisitos e acessibilidade</Title><Muted>Idade mínima: {trail.minimum_age} anos</Muted><Muted>{trail.accessible ? 'Acessibilidade informada pelo guia. Confirme as necessidades específicas pelo chat.' : 'Consulte o guia sobre acessibilidade e limitações do trajeto.'}</Muted><Muted>{trail.safety_notes}</Muted></Card>
        {[['O que está incluído', trail.included], ['O que não está incluído', trail.not_included], ['O que levar', trail.what_to_bring], ['Cancelamento', trail.cancellation_policy]].map(([label, value]) => value ? <Card key={label}><Title>{label}</Title><Text style={ct.text}>{value}</Text></Card> : null)}
      </Section>
      <Section title="Escolha sua saída" subtitle="Datas e horários definidos pelo guia. Horário da Bahia.">
        {asArray(trail.departures).map(item => <Card key={item.id}><Title>{departureDate(item.starts_at)}</Title><Muted>{item.meeting_point}</Muted><Muted>{item.notes}</Muted><Text style={ct.text}>{item.available_seats} de {item.capacity} vagas disponíveis · {money(item.unit_price)} {trail.price_mode === 'per_person' ? '/ pessoa' : '/ grupo'}</Text><Button title={item.available_seats > 0 ? 'Escolher esta saída' : 'Saída esgotada'} disabled={item.available_seats < 1 || user.id === trail.guide?.user_id} onPress={() => setDeparture(item)} /></Card>)}
        {!trail.departures.length && <Muted>O guia ainda não abriu novas datas. Converse com ele para saber mais.</Muted>}
      </Section>
      <Section title="Quem já foi">{trail.reviews.map(review => <Card key={review.id}><Title>★ {review.rating} · {review.author}</Title><Text style={ct.text}>{review.comment}</Text></Card>)}{!trail.reviews.length && <Muted>Esta trilha ainda não recebeu avaliações.</Muted>}</Section>
      {departure && <Reserve trail={trail} departure={departure} onClose={() => setDeparture(null)} />}
    </>}
  </Page>;
}



