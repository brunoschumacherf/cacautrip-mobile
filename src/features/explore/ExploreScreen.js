import { useLanguage } from '../../i18n';
import React, { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { Badge, Button, Card, Empty, Field, Muted, Notice, Page, Photo, Section, Shortcut, Title, money, s } from '../../components/ui';
import ServiceMap from '../../components/ServiceMap';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { ecoDiscount } from '../sustainability/EcoRewards';

export default function ExploreScreen() {
  useLanguage();
  const { user } = useSession();
  const params = useLocalSearchParams();
  const [filters, setFilters] = useState({ query: '', category: '', coords: null, page: 1 });
  const { query, category } = filters;
  const stable = useDeferredValue(filters);
  const updateFilter = (key, value) => setFilters(current => ({ ...current, [key]: value, page: 1 }));
  const [showMap, setShowMap] = useState(false);
  const { run, busy, notice } = useAction();
  const path = `/catalog?page=${stable.page}&per_page=6&q=${encodeURIComponent(stable.query)}&category=${encodeURIComponent(stable.category)}${user.preferences.accessible ? '&accessible=true' : ''}${stable.coords ? `&latitude=${stable.coords.latitude}&longitude=${stable.coords.longitude}` : ''}`;
  const { data, error, loading, refreshing, reload } = useResource(path, { destinations: [], alerts: [], emergency_points: [], pagination: { page: 1, total_pages: 1, total: 0, per_page: 6 } });
  const pagination = data.pagination;
  const { data: eco } = useResource('/sustainability/overview', { balance: 0, rewards: [], collection_points_count: 0 });
  const changingPage = loading || refreshing || filters !== stable;
  const locate = () => run(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') throw new Error('A localização não foi autorizada. Você pode pesquisar a cidade manualmente.');
    const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    updateFilter('coords', result.coords); setShowMap(true);
  });
  return <Page title={`Olá, ${user.name.split(' ')[0]}.`} subtitle="Descubra seu próximo lugar na Costa do Cacau." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <Notice>{notice}</Notice>
    <Button title="Explorar trilhas e passeios dos guias" icon="trail-sign-outline" onPress={() => router.push('/trilhas')} />
    <View style={s.row}><Shortcut title="Planejar viagem" subtitle="Monte seu roteiro" icon="map-outline" href="/roteiros" /><Shortcut title="Guias e transporte" subtitle="Encontre profissionais locais" icon="people-outline" href="/profissionais" /></View>
    <Card style={{ backgroundColor: '#E1EFE3', borderColor: '#C6DAC9', marginTop: 18 }}>
      <Badge>SUSTENTABILIDADE · {eco.balance} pontos verdes</Badge><Title>Cuide de onde você ama viajar.</Title>
      <Muted>Transforme suas entregas nos pontos de coleta em benefícios para aproveitar a Costa do Cacau.</Muted>
      <View style={s.row}><Button title="Conhecer o programa" icon="leaf-outline" onPress={() => router.push('/sustentabilidade')} /><Button secondary title="Já tenho um código" icon="gift-outline" onPress={() => router.push('/sustentabilidade')} /></View>
      {eco.collection_points_count > 0 && <Muted>{eco.collection_points_count} pontos de coleta para começar.</Muted>}
      {eco.rewards.slice(0, 2).map(reward => <View key={reward.id} style={{ borderTopWidth: 1, borderColor: '#C6DAC9', marginTop: 14, paddingTop: 12 }}><Title translate={false}>{reward.title}</Title><Muted>{ecoDiscount(reward)} · {reward.points_cost} pontos</Muted></View>)}
    </Card>
    <Button secondary icon="sparkles-outline" title="Ajude-me a escolher um passeio" onPress={() => router.push('/assistente')} />
    <Section title="Explore a região">
      <Field label="Destino, cidade ou experiência" placeholder="O que deseja conhecer?" value={query} onChangeText={value => updateFilter('query', value)} />
      <View style={s.row}>{['', 'praia', 'trilha', 'restaurante', 'pousada', 'atração', 'passeio'].map(item => <Button secondary key={item} title={`${item === category ? '✓ ' : ''}${item || 'Todos'}`} onPress={() => updateFilter('category', item)} />)}</View>
      <View style={s.row}><Button secondary title="Perto de mim" icon="location-outline" onPress={locate} disabled={busy} /><Button secondary title={showMap ? 'Ocultar mapa' : 'Ver mapa'} icon="map-outline" onPress={() => setShowMap(!showMap)} /></View>
      {showMap && <ServiceMap query={stable.query} />}
      {!loading && pagination.total > 0 && <Muted>Mostrando {(pagination.page - 1) * pagination.per_page + 1}–{Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total} lugares</Muted>}
      {data.destinations.map(item => <Card key={item.id}>
        <Photo uri={item.image_url} /><Badge>{item.category} · {item.city}</Badge><Title translate={false}>{item.name}</Title>
        <Muted translate={false}>{item.description}</Muted><Muted>{Number(item.price) > 0 ? `A partir de ${money(item.price)}` : 'Consulte condições de visita'}{item.distance_km != null ? ` · ${item.distance_km} km` : ''}</Muted>
        <Button title="Conhecer este lugar" onPress={() => router.push({ pathname: '/destinos/[id]', params: { id: item.id, routeId: params.routeId || '' } })} />
      </Card>)}
      {!loading && !error && !data.destinations.length && <Empty>Nenhum destino encontrado. Experimente outra cidade ou categoria.</Empty>}
      {pagination.total > 0 && <View style={s.row}>
        <Button secondary title="Anterior" disabled={changingPage || !pagination.has_previous} onPress={() => setFilters(current => ({ ...current, page: pagination.page - 1 }))} />
        <Muted>Página {pagination.page} de {pagination.total_pages}</Muted>
        <Button secondary title="Próxima" disabled={changingPage || !pagination.has_next} onPress={() => setFilters(current => ({ ...current, page: pagination.page + 1 }))} />
      </View>}
    </Section>
    {data.alerts.length > 0 && <Section title="Antes de sair">{data.alerts.slice(0, 3).map(alert => <Card key={alert.id}><Title translate={false}>{alert.title}</Title><Muted>{alert.body}</Muted></Card>)}</Section>}
  </Page>;
}



