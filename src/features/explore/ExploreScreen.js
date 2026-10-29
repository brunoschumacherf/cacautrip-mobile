import React, { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { Badge, Button, Card, Empty, Field, Muted, Notice, Page, Photo, Section, Shortcut, Title, money, s } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';

export default function ExploreScreen() {
  const { user } = useSession();
  const params = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const [coords, setCoords] = useState(null);
  const [category, setCategory] = useState('');
  const [showMap, setShowMap] = useState(false);
  const { run, busy, notice } = useAction();
  const path = `/catalog?q=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}${user.preferences.accessible ? '&accessible=true' : ''}${coords ? `&latitude=${coords.latitude}&longitude=${coords.longitude}` : ''}`;
  const { data, error, loading, refreshing, reload } = useResource(path, { destinations: [], alerts: [], emergency_points: [] });
  const locate = () => run(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') throw new Error('A localização não foi autorizada. Você pode pesquisar a cidade manualmente.');
    const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setCoords(result.coords); setShowMap(true);
  });
  return <Page title={`Olá, ${user.name.split(' ')[0]}.`} subtitle="Descubra seu próximo lugar na Costa do Cacau." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <Notice>{notice}</Notice>
    <Button title="Explorar trilhas e passeios dos guias" icon="trail-sign-outline" onPress={() => router.push('/trilhas')} />
    <View style={s.row}><Shortcut title="Planejar viagem" subtitle="Monte seu roteiro" icon="map-outline" href="/roteiros" /><Shortcut title="Guias e transporte" subtitle="Encontre profissionais locais" icon="people-outline" href="/profissionais" /></View>
    <Button secondary icon="sparkles-outline" title="Ajude-me a escolher um passeio" onPress={() => router.push('/assistente')} />
    <Section title="Explore a região">
      <Field label="Destino, cidade ou experiência" placeholder="O que deseja conhecer?" value={query} onChangeText={setQuery} />
      <View style={s.row}>{['', 'praia', 'trilha', 'restaurante', 'pousada', 'atração', 'passeio'].map(item => <Button secondary key={item} title={`${item === category ? '✓ ' : ''}${item || 'Todos'}`} onPress={() => setCategory(item)} />)}</View>
      <View style={s.row}><Button secondary title="Perto de mim" icon="location-outline" onPress={locate} disabled={busy} /><Button secondary title={showMap ? 'Ocultar mapa' : 'Ver mapa'} icon="map-outline" onPress={() => setShowMap(!showMap)} /></View>
      {showMap && <PlaceMap points={data.destinations} />}
      {data.destinations.map(item => <Card key={item.id}>
        <Photo uri={item.image_url} /><Badge>{item.category} · {item.city}</Badge><Title>{item.name}</Title>
        <Muted>{item.description}</Muted><Muted>{Number(item.price) > 0 ? `A partir de ${money(item.price)}` : 'Consulte condições de visita'}{item.distance_km != null ? ` · ${item.distance_km} km` : ''}</Muted>
        <Button title="Conhecer este lugar" onPress={() => router.push({ pathname: '/destinos/[id]', params: { id: item.id, routeId: params.routeId || '' } })} />
      </Card>)}
      {!data.destinations.length && <Empty>Nenhum destino encontrado. Experimente outra cidade ou categoria.</Empty>}
    </Section>
    {data.alerts.length > 0 && <Section title="Antes de sair">{data.alerts.slice(0, 3).map(alert => <Card key={alert.id}><Title>{alert.title}</Title><Muted>{alert.body}</Muted></Card>)}</Section>}
    <Button secondary title="Emergência e pontos de apoio" icon="medical-outline" onPress={() => router.push('/emergencia')} />
  </Page>;
}

