import React, { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Empty, Field, Muted, Page, Photo, Toggle, Title, money, s } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
export default function DirectoryScreen() {
  const params = useLocalSearchParams();
  const [kind, setKind] = useState('guide');
  const [advanced, setAdvanced] = useState(false);
  const [filters, setFilters] = useState({ q: String(params.region || ''), max_price: '', min_rating: '', people: '', accessible: false, available: true });
  const stable = useDeferredValue(filters);
  const query = Object.entries(stable).filter(([, value]) => value !== '').map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  const { data, loading, error, refreshing, reload } = useResource(`/professional_profiles/${kind === 'guide' ? 'guides' : 'drivers'}?${query}`, []);
  const update = key => value => setFilters(current => ({ ...current, [key]: value }));
  return <Page title="Guias e transporte." subtitle="Escolha com quem deseja viajar." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    {params.routeId && <Badge>Selecionando serviços para o roteiro #{params.routeId}</Badge>}
    <View style={s.row}><Button secondary title={`${kind === 'guide' ? '✓ ' : ''}Guias locais`} onPress={() => setKind('guide')} /><Button secondary title={`${kind === 'driver' ? '✓ ' : ''}Motoristas`} onPress={() => setKind('driver')} /></View>
    <Field label="Nome, cidade ou especialidade" value={filters.q} onChangeText={update('q')} />
    <Button secondary title={advanced ? 'Ocultar filtros' : 'Filtrar resultados'} onPress={() => setAdvanced(!advanced)} />
    {advanced && <Card><Field label="Preço máximo (R$)" value={filters.max_price} onChangeText={update('max_price')} keyboardType="decimal-pad" /><Field label="Nota mínima" value={filters.min_rating} onChangeText={update('min_rating')} keyboardType="decimal-pad" />{kind === 'driver' && <Field label="Passageiros" value={filters.people} onChangeText={update('people')} keyboardType="number-pad" />}<Toggle label="Atendimento acessível" value={filters.accessible} onChange={update('accessible')} /><Toggle label="Somente disponíveis" value={filters.available} onChange={update('available')} /></Card>}
    {data.map(item => <Card key={item.id}><Photo uri={item.image_url} />{item.plan !== 'basic' && <Badge>{item.plan === 'premium' ? 'Premium' : 'Destaque'}</Badge>}<Title>{item.name}</Title><Muted>{item.region} · ★ {item.rating.toFixed(1)} ({item.reviews_count})</Muted><Muted>{kind === 'guide' ? item.specialization : `${item.vehicle_model} · ${item.capacity} passageiros`}</Muted><Muted>{kind === 'guide' ? (item.trails_count ? item.trails_count + ' trilhas · A partir de ' + money(item.starting_price) : 'Novas trilhas em breve') : 'Referência: ' + money(item.price)}</Muted><Button title="Ver perfil e disponibilidade" onPress={() => router.push({ pathname: `/servico/${kind}/[id]`, params: { id: item.id, routeId: params.routeId || '' } })} /></Card>)}
    {!loading && !data.length && <Empty>Não encontramos profissionais com esses filtros.</Empty>}
  </Page>;
}



