import { ct } from '../../theme/tokens';
import React from 'react';
import { Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Muted, Page, Title, money } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { useResource } from '../../hooks/useResource';
export default function SharedTrip() {
  const { token } = useLocalSearchParams();
  const { data, loading, error } = useResource(`/shared_routes/${encodeURIComponent(String(token || ''))}`, { title: 'Roteiro compartilhado', itinerary: [], warnings: [], costs: {} });
  return <Page title={data.title} subtitle={data.destination} loading={loading} error={error}><PlaceMap points={data.itinerary} />{data.itinerary.map((stop, index) => <Card key={stop.id}><Title>{index + 1}. {stop.name}</Title><Text style={ct.text}>{stop.description}</Text><Muted>{stop.opening_hours} · {stop.duration_minutes} min</Muted></Card>)}<Muted>Estimativa: {money(data.total_estimated_cost)}</Muted>{data.warnings.map(warning => <Muted key={warning}>{warning}</Muted>)}<Button title="Explorar o Cacautrip" onPress={() => router.replace('/')} /></Page>;
}


