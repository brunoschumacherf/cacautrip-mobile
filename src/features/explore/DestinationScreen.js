import React, { useState } from 'react';
import { Linking, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Muted, Page, Photo, Section, Title, money } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import BookingForm from '../../components/BookingForm';
import { useResource } from '../../hooks/useResource';
export default function DestinationScreen() {
  const { id, routeId } = useLocalSearchParams();
  const { data: place, loading, error } = useResource(`/destinations/${Number(id)}`, {});
  const [booking, setBooking] = useState(false);
  return <Page title={place.name || 'Detalhes do destino'} subtitle={place.city} loading={loading} error={error}>
    {place.id && <><Photo uri={place.image_url} /><Badge>{place.category}</Badge><Card><Title>Sobre a experiência</Title><Text>{place.description}</Text><Muted>{money(place.price)} · {place.duration_minutes} minutos estimados</Muted><Muted>{place.accessible ? 'Acessibilidade informada pelo prestador' : 'Confirme as condições de acessibilidade'}</Muted><Muted>{place.guide_required ? 'Acompanhamento de guia necessário' : 'Consulte as condições de visita'}</Muted></Card>
      <Section title="Planeje sua visita"><Muted>Horários: {place.opening_hours || 'Consulte o prestador'}</Muted><Muted>Período sugerido: {place.best_time || 'Consulte as condições locais'}</Muted><Muted>{place.rules}</Muted><PlaceMap points={[place]} /><Button secondary title="Abrir localização" onPress={() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=16/${place.latitude}/${place.longitude}`)} /></Section>
      {Number(place.price) > 0 && <Button title="Reservar experiência" onPress={() => setBooking(true)} />}
      <Button secondary title="Adicionar a um novo roteiro" onPress={() => router.push({ pathname: '/roteiros', params: { destinationId: place.id, city: place.city || '', name: place.name } })} />
      <Button secondary title="Encontrar guia ou transporte" onPress={() => router.push({ pathname: '/profissionais', params: { region: place.city || '', routeId: routeId || '' } })} />
      {booking && <BookingForm service={{ ...place, type: place.category === 'passeio' ? 'Passeio' : 'Parceiro' }} onClose={() => setBooking(false)} />}
    </>}
  </Page>;
}

