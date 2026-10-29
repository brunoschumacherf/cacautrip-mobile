import { ct } from '../../theme/tokens';
import React, { useState } from 'react';
import { Linking, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Field, Muted, Notice, Page, Section, Title, money, statusLabel } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction, useResource } from '../../hooks/useResource';
import PaymentModal from './PaymentModal';
import PlaceMap from '../../components/PlaceMap';
import { asArray } from '../../lib/data';
import api from '../../services/api';
import TrailItinerary from '../trails/TrailItinerary';
export default function BookingDetails() {
  const { id } = useLocalSearchParams();
  const { user } = useSession();
  const { data: booking, loading, error, reload, refreshing } = useResource(`/bookings/${Number(id)}`, {});
  const { busy, notice, run, setNotice } = useAction();
  const [payment, setPayment] = useState(false);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [offer, setOffer] = useState('');
  const professional = booking.provider_id === user.id;
  const negotiating = ['pending_approval', 'counteroffer'].includes(booking.status);
  const canRespond = negotiating && (booking.offer_by_id || booking.user_id) !== user.id;
  const change = action => run(async () => { await api.patch(`/bookings/${booking.id}/${action}`); await reload(); });
  const respond = action_type => run(async () => { await api.patch(`/bookings/${booking.id}/respond`, { action_type }); await reload(); });
  const chat = () => run(async () => {
    const response = await api.post(`/bookings/${booking.id}/conversation`);
    router.push({ pathname: '/chat', params: { conversation: response.data.id } });
  });
  const review = () => run(async () => {
    await api.post('/reviews', { booking_id: booking.id, rating: Number(rating), comment }); await reload(); setNotice('Avaliação publicada. Obrigado!');
  });
  return <Page title={`Reserva ${booking.id ? `#${booking.id}` : ''}.`} subtitle={professional ? 'Detalhes do atendimento' : 'Tudo sobre sua experiência'} loading={loading} error={error} onRefresh={reload} refreshing={refreshing}>
    <Notice>{notice}</Notice>{Boolean(booking.id) && <>
      <Badge>{statusLabel(booking.status)}</Badge>
      <Card><Title>{professional ? booking.tourist_name : booking.professional?.name || booking.service_type}</Title><Muted>{booking.service_type}</Muted><Text style={ct.text}>{booking.date} · {booking.people} pessoa(s)</Text><Muted>Encontro: {booking.meeting_point}</Muted>{Boolean(booking.dropoff_point) && <Muted>Desembarque: {booking.dropoff_point}</Muted>}{Boolean(booking.conditions) && <Muted>Condições: {booking.conditions}</Muted>}<Title>{money(booking.total_amount)}</Title><Muted>Pagamento: {statusLabel(booking.payment_status)}</Muted></Card>
      <Section title="Próximo passo">
        {negotiating && <Card><Title>{canRespond ? 'Você recebeu uma proposta' : 'Aguardando a outra parte'}</Title><Title>{money(booking.total_amount)}</Title>
          {canRespond && <><Button title="Aceitar este valor" disabled={busy} onPress={() => run(async () => { await api.patch(`/bookings/${booking.id}/accept_offer`); await reload(); })} />
            {booking.service_type === 'Motorista' && <><Field label="Sua contraproposta (R$)" value={offer} onChangeText={setOffer} keyboardType="decimal-pad" /><Button secondary title="Enviar contraproposta" disabled={busy || !offer.trim()} onPress={() => run(async () => { await api.post(`/bookings/${booking.id}/counteroffer`, { amount: offer }); setOffer(''); await reload(); })} /></>}
            {professional && <Button secondary title="Recusar" disabled={busy} onPress={() => respond('reject')} />}
          </>}
          {!canRespond && <Muted>Você poderá pagar quando o valor for aceito pela outra parte.</Muted>}
        </Card>}
        {!professional && booking.status === 'approved_waiting_payment' && !booking.hold_expired && <Button title={booking.payment_method === 'pix' ? 'Acompanhar Pix' : 'Pagar e confirmar reserva'} onPress={() => setPayment(true)} />}
        {booking.hold_expired && <><Notice>O prazo para pagar esta reserva expirou. Escolha uma nova saída para consultar as vagas disponíveis.</Notice><Button secondary title="Ver datas da trilha" onPress={() => router.push({ pathname: '/trilhas/[id]', params: { id: booking.trail_snapshot?.id } })} /></>}
        {professional && booking.status === 'approved_waiting_payment' && <Muted>Proposta aceita. Aguardando o pagamento do viajante.</Muted>}
        {booking.status === 'confirmed' && <><Muted>Reserva confirmada. Combine os detalhes pelo chat antes do passeio.</Muted>{(professional || !booking.provider_id) && <Button title={professional ? 'Concluir atendimento e liberar saldo' : 'Marcar experiência como concluída'} disabled={busy} onPress={() => change('complete')} />}</>}
        {['completed', 'cancelled', 'rejected'].includes(booking.status) && <Muted>Esta reserva está {statusLabel(booking.status).toLowerCase()}.</Muted>}
        {['Guia', 'Motorista'].includes(booking.service_type) && <Button secondary title="Conversa desta reserva" icon="chatbubbles-outline" onPress={chat} disabled={busy} />}
      </Section>
      {booking.meeting_point && booking.dropoff_point && <Button secondary title="Ver trajeto de origem a destino" onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(booking.meeting_point)}&destination=${encodeURIComponent(booking.dropoff_point)}&travelmode=driving`)} />}
      {asArray(booking.offer_history).length > 1 && <Card><Title>Histórico da negociação</Title>{booking.offer_history.map((item, index) => <Muted key={index}>{item.user_id === user.id ? 'Você' : 'Outra parte'}: {money(item.amount)} · {new Date(item.at).toLocaleString('pt-BR')}</Muted>)}</Card>}
      {booking.trail_snapshot?.id ? <Section title={`Roteiro contratado · ${booking.trail_snapshot.title}`}><Muted>Estas são as condições e os pontos registrados na sua reserva.</Muted><TrailItinerary stops={booking.itinerary} mode={booking.trail_snapshot.route_mode} /><Card><Title>Antes de sair</Title><Muted>{booking.trail_snapshot.what_to_bring}</Muted><Muted>{booking.trail_snapshot.safety_notes}</Muted><Muted>{booking.trail_snapshot.cancellation_policy}</Muted></Card></Section> : asArray(booking.itinerary).length > 0 && <Section title="Roteiro contratado"><PlaceMap points={booking.itinerary} />{booking.itinerary.map((stop, index) => <Muted key={stop.id}>{index + 1}. {stop.name}</Muted>)}</Section>}
      {booking.payment_status === 'approved' && <Card><Title>Resumo do pagamento</Title><Muted>Total: {money(booking.total_amount)}</Muted><>{professional && <><Muted>Comissão: {money(booking.fee_amount)}</Muted><Muted>Líquido: {money(booking.professional_amount)}</Muted></>}</><Muted>{booking.payment_method === 'pix' ? 'Pix' : 'Cartão'}</Muted></Card>}
      {!professional && booking.status === 'completed' && !booking.review && <Card><Title>Como foi sua experiência?</Title><Field label="Nota de 1 a 5" value={rating} onChangeText={setRating} keyboardType="number-pad" /><Field label="Seu comentário" value={comment} onChangeText={setComment} multiline maxLength={2000} /><Button title="Publicar avaliação" disabled={busy} onPress={review} /></Card>}
      {booking.review && <Card><Title>Avaliação · ★ {booking.review.rating}</Title><Muted>{booking.review.comment}</Muted></Card>}
      {!professional && !['completed', 'cancelled', 'rejected'].includes(booking.status) && <Section title="Precisa alterar seus planos?"><Muted>Você pode cancelar antes da conclusão. Se houver pagamento, o estorno será solicitado.</Muted><Button secondary title="Cancelar esta reserva" disabled={busy} onPress={() => change('cancel')} /></Section>}
      {payment && <PaymentModal booking={booking} onClose={() => setPayment(false)} onUpdate={reload} />}
    </>}
  </Page>;
}




