import React, { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Empty, Field, Muted, Page, Photo, Title, Toggle, money, s } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { asArray } from '../../lib/data';
import { departureDate, difficultyLabel } from './TrailItinerary';
export default function TrailsScreen() {
  const params = useLocalSearchParams();
  const [filters, setFilters] = useState({ q: '', difficulty: '', date: '', accessible: false, max_price: '' });
  const stable = useDeferredValue(filters);
  const query = Object.entries(stable).filter(([, value]) => value !== '').map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  const { data, loading, error, reload, refreshing } = useResource(`/trails?${query}${params.guideId ? `&guide_id=${Number(params.guideId)}` : ''}`, []);
  const update = key => value => setFilters(current => ({ ...current, [key]: value }));
  return <Page title="Trilhas e passeios." subtitle="Percursos criados por guias locais, com cada parada planejada." loading={loading} error={error} onRefresh={reload} refreshing={refreshing}>
    <Field label="Trilha, região ou experiência" value={filters.q} onChangeText={update('q')} />
    <View style={s.row}>{[['', 'Todas'], ['easy', 'Leves'], ['moderate', 'Moderadas'], ['hard', 'Difíceis']].map(([key, label]) => <Button secondary key={key} title={`${filters.difficulty === key ? '✓ ' : ''}${label}`} onPress={() => update('difficulty')(key)} />)}</View>
    <Field label="Data da saída (AAAA-MM-DD)" value={filters.date} onChangeText={update('date')} placeholder="2026-11-05" />
    <Field label="Preço máximo (R$)" value={filters.max_price} onChangeText={update('max_price')} keyboardType="decimal-pad" />
    <Toggle label="Passeios com acessibilidade informada" value={filters.accessible} onChange={update('accessible')} />
    {data.map(trail => {
      const departure = asArray(trail.departures).find(item => item.available_seats > 0);
      return <Card key={trail.id}><Photo uri={trail.image_url} /><Badge>{difficultyLabel(trail.difficulty)} · {trail.region}</Badge><Title>{trail.title}</Title>
        <Muted>Com {trail.guide?.name} · ★ {Number(trail.rating || 0).toFixed(1)}</Muted><Muted>{trail.duration_minutes} min{trail.distance_km ? ` · ${trail.distance_km} km` : ''} · {asArray(trail.stops).length} pontos</Muted>
        <Title>{money(trail.price)} {trail.price_mode === 'per_person' ? '/ pessoa' : '/ grupo'}</Title>
        <Muted>{departure ? `Próxima saída: ${departureDate(departure.starts_at)} · ${departure.available_seats} vagas` : 'Novas datas em breve'}</Muted>
        <Button title="Ver roteiro e datas" onPress={() => router.push({ pathname: '/trilhas/[id]', params: { id: trail.id, routeId: params.routeId || '' } })} />
      </Card>;
    })}
    {!loading && !data.length && <Empty>Nenhuma trilha encontrada com esses filtros.</Empty>}
  </Page>;
}

