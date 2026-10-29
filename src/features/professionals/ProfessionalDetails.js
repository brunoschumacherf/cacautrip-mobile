import { useLanguage } from '../../i18n';
import { ct } from '../../theme/tokens';
import React, { useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Field, Muted, Notice, Page, Photo, Section, Title, money } from '../../components/ui';
import BookingForm from '../../components/BookingForm';
import PlaceMap from '../../components/PlaceMap';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { asArray } from '../../lib/data';
import api from '../../services/api';
export default function ProfessionalDetails({ kind }) {
  useLanguage();
  const { id } = useLocalSearchParams();
  const { user } = useSession();
  const { data: profile, loading, error } = useResource(`/professional_profiles/${kind}/${Number(id)}`, {});
  const { data: catalog } = useResource('/catalog', { destinations: [] });
  const { busy, run, notice, setNotice } = useAction();
  const [booking, setBooking] = useState(false);
  const [reason, setReason] = useState('');
  const type = kind === 'guide' ? 'Guia' : 'Motorista';
  const chat = () => run(async () => {
    const response = await api.post('/conversations', { professional_type: type, professional_id: profile.id });
    router.push({ pathname: '/chat', params: { conversation: response.data.id } });
  });
  const report = (subject_type, subject_id, text) => run(async () => {
    await api.post('/reports', { subject_type, subject_id, reason: text }); setReason(''); setNotice('Sua denúncia foi enviada para análise.');
  });
  return <Page title={profile.name || 'Perfil profissional'} subtitle={profile.region} loading={loading} error={error}>
    <Notice>{notice}</Notice>
    {profile.id && <>
      <Photo uri={profile.image_url} /><Badge>{type} · ★ {Number(profile.rating).toFixed(1)} ({profile.reviews_count} avaliações)</Badge>
      <Card><Title>Conheça {profile.name}</Title><Text style={ct.text}>{profile.description}</Text><Muted>{profile.services}</Muted><Muted>{kind === 'guide' ? `${profile.specialization} · ${profile.languages}` : `${profile.vehicle_model} · ${profile.capacity} passageiros`}</Muted>
        <Muted>Gov.br autenticado{profile.documents_verified ? ' · Documentação profissional aprovada' : ''}</Muted>
        <Muted>{profile.accessible ? 'Atendimento acessível informado' : 'Combine as necessidades de acessibilidade pelo chat'}</Muted>
      </Card>
      <Section title="Disponibilidade e valor">{kind === 'driver' && <Title>Referência: {money(profile.price)}</Title>}<Muted>{kind === 'guide' ? 'O guia define o preço, o percurso e as datas de cada trilha.' : 'Combine o valor da corrida enviando uma proposta.'}</Muted>{kind === 'driver' && (asArray(profile.availability).length ? profile.availability.map(date => <Badge key={date}>{date}</Badge>) : <Muted>Combine a data diretamente com o profissional.</Muted>)}
        {kind === 'guide' && <Button title="Ver trilhas, percursos e datas deste guia" onPress={() => router.push({ pathname: '/trilhas', params: { guideId: profile.id } })} />}
        {profile.user_id !== user.id && <>{kind === 'driver' && <Button title="Solicitar reserva" onPress={() => setBooking(true)} disabled={!profile.available} />}<Button secondary title="Conversar antes de reservar" onPress={chat} disabled={busy} /></>}
      </Section>
      <Section title="Região e roteiros atendidos"><PlaceMap points={catalog.destinations.filter(place => profile.region && place.city && profile.region.toLowerCase().includes(place.city.toLowerCase()))} /></Section>
      <Section title="Avaliações de viagens realizadas">
        {asArray(profile.reviews).map(review => <Card key={review.id}><Title>★ {review.rating} · {review.author}</Title><Text style={ct.text}>{review.comment}</Text><Button secondary title="Denunciar comentário" disabled={busy} onPress={() => report('Review', review.id, 'Solicito análise deste comentário por possível conteúdo inadequado.')} /></Card>)}
        {!asArray(profile.reviews).length && <Muted>Este profissional ainda não recebeu avaliações.</Muted>}
      </Section>
      <Section title="Relatar um problema"><Field label="O que aconteceu?" value={reason} onChangeText={setReason} multiline maxLength={4000} /><Button secondary title="Enviar para moderação" disabled={busy || !reason.trim()} onPress={() => report('User', profile.user_id, reason)} /></Section>
      {booking && <BookingForm service={{ ...profile, type }} onClose={() => setBooking(false)} />}
    </>}
  </Page>;
}






