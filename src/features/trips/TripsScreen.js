import React, { useState } from 'react';
import { Platform, Share, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Badge, Button, Card, Empty, Field, Muted, Notice, Page, Section, Title, Toggle, money, s } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { useAction, useResource } from '../../hooks/useResource';
import { asArray } from '../../lib/data';
import api from '../../services/api';

const fresh = () => ({ title: '', destination: '', budget: '', preferences: { destination_ids: [], people: '1', minutes: '480', interests: '', accessible: false, include_guide: false, include_driver: false } });
export default function TripsScreen() {
  const params = useLocalSearchParams();
  const { data: trips, loading, error, reload, refreshing } = useResource('/routes', []);
  const { data: catalog } = useResource('/catalog', { destinations: [] });
  const [form, setForm] = useState(() => params.destinationId ? { ...fresh(), title: String(params.name || ''), destination: String(params.city || ''), preferences: { ...fresh().preferences, destination_ids: [Number(params.destinationId)] } } : null);
  const [plan, setPlan] = useState(null);
  const [shared, setShared] = useState('');
  const { run, busy, notice, setNotice } = useAction();
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const preference = key => value => setForm(current => ({ ...current, preferences: { ...current.preferences, [key]: value } }));
  const selectedIds = asArray(form?.preferences?.destination_ids);
  const selected = catalog.destinations.filter(place => selectedIds.includes(place.id));
  const suggest = () => run(async () => {
    const response = await api.post('/routes/suggest', { ...form.preferences, destination_ids: undefined, destination: form.destination, budget: form.budget || undefined });
    setPlan(response.data); preference('destination_ids')(response.data.destination_ids || []);
  });
  const save = () => run(async () => {
    const payload = { route: { ...form, budget: form.budget === '' ? null : Number(String(form.budget).replace(',', '.')) } };
    if (form.id) await api.patch(`/routes/${form.id}`, payload); else await api.post('/routes', payload);
    setForm(null); setPlan(null); await reload(); setNotice('Roteiro salvo. Agora você pode reservar guia, transporte e experiências.');
  });
  const share = trip => run(async () => {
    const response = await api.post(`/routes/${trip.id}/share`);
    const url = Linking.createURL(`/compartilhar/${response.data.token}`);
    setShared(url);
    if (Platform.OS !== 'web') await Share.share({ message: `${trip.title}\n${url}` });
    else if (typeof navigator !== 'undefined' && navigator.clipboard) { await navigator.clipboard.writeText(url); setNotice('Link copiado. O acesso pode ser revogado a qualquer momento.'); }
  });
  return <Page title="Meus roteiros." subtitle="Planeje primeiro. Depois combine os serviços para sua viagem." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <Notice>{notice}</Notice>{shared && <Card><Muted>Link público do roteiro:</Muted><Text selectable>{shared}</Text></Card>}
    {!form && <Button title="Criar nova rota" icon="add-outline" onPress={() => { setForm(fresh()); setPlan(null); }} />}
    {form && <Card>
      <Badge>{form.id ? 'Editar roteiro' : 'Planejar uma viagem'}</Badge>
      <Title>Qual é o seu destino?</Title>
      <Field label="Nome do roteiro" value={form.title} onChangeText={update('title')} placeholder="Meu fim de semana na Costa do Cacau" />
      <Field label="Cidade ou região" value={form.destination} onChangeText={update('destination')} />
      <View style={s.row}><View style={{ flex: 1 }}><Field label="Orçamento total (R$)" value={String(form.budget || '')} onChangeText={update('budget')} keyboardType="decimal-pad" /></View><View style={{ flex: 1 }}><Field label="Pessoas" value={String(form.preferences?.people || 1)} onChangeText={preference('people')} keyboardType="number-pad" /></View></View>
      <Field label="Tempo disponível (minutos)" value={String(form.preferences?.minutes || 480)} onChangeText={preference('minutes')} keyboardType="number-pad" />
      <Field label="Interesses" value={form.preferences?.interests || ''} onChangeText={preference('interests')} placeholder="Praias, trilhas, gastronomia…" />
      <Toggle label="Priorizar acessibilidade" value={form.preferences?.accessible} onChange={preference('accessible')} />
      <Toggle label="Estimar guia" value={form.preferences?.include_guide} onChange={preference('include_guide')} />
      <Toggle label="Estimar transporte" value={form.preferences?.include_driver} onChange={preference('include_driver')} />
      <Button secondary title="Sugerir roteiro com meus filtros" onPress={suggest} disabled={busy} />
      <Section title="Escolha os lugares" subtitle="A sugestão é editável. Marque somente o que deseja visitar.">
        {catalog.destinations.map(place => <Toggle key={place.id} label={`${place.name} · ${place.city} · ${money(place.price)} por pessoa`} value={selectedIds.includes(place.id)} onChange={checked => preference('destination_ids')(checked ? [...selectedIds, place.id] : selectedIds.filter(id => id !== place.id))} />)}
      </Section>
      <PlaceMap points={selected} />
      {plan && <><Muted>Estimativa sugerida: {money(plan.costs?.total)} · {plan.duration_minutes} minutos</Muted>{asArray(plan.warnings).map(warning => <Muted key={warning}>{warning}</Muted>)}</>}
      <Field label="Observações" value={form.preferences?.notes || ''} onChangeText={preference('notes')} multiline />
      <Button title="Salvar roteiro" onPress={save} disabled={busy || !form.title.trim() || !form.destination.trim() || !selectedIds.length} />
      <Button secondary title="Cancelar edição" onPress={() => { setForm(null); setPlan(null); }} disabled={busy} />
    </Card>}
    {trips.map(trip => <Card key={trip.id}>
      <Title>{trip.title}</Title><Muted>{trip.destination} · Orçamento {money(trip.budget)} · Estimativa {money(trip.total_estimated_cost)}</Muted>
      <PlaceMap points={asArray(trip.preferences?.itinerary).length ? trip.preferences.itinerary : catalog.destinations.filter(place => asArray(trip.preferences?.destination_ids).includes(place.id))} />
      {asArray(trip.preferences?.itinerary).map((stop, index) => <View key={stop.id}><Text>{index + 1}. {stop.name}</Text><Muted>{stop.duration_minutes} min · {stop.opening_hours} · {stop.best_time}</Muted></View>)}
      {trip.preferences?.costs && <Muted>Locais: {money(trip.preferences.costs.places)} · Guia: {money(trip.preferences.costs.guide)} · Transporte: {money(trip.preferences.costs.driver)}</Muted>}
      <Button title="Reservar guia ou transporte" onPress={() => router.push({ pathname: '/profissionais', params: { routeId: trip.id, region: trip.destination } })} />
      <Button secondary title="Reservar experiências do catálogo" onPress={() => router.push({ pathname: '/', params: { routeId: trip.id } })} />
      <View style={s.row}><Button secondary title="Editar" onPress={() => { setForm({ ...trip, preferences: { ...fresh().preferences, ...trip.preferences } }); setPlan(null); }} /><Button secondary title="Compartilhar" onPress={() => share(trip)} disabled={busy} /></View>
      <Button secondary title="Revogar link público" onPress={() => run(async () => { await api.delete(`/routes/${trip.id}/share`); setShared(''); setNotice('Link revogado.'); })} disabled={busy} />
      <Button secondary title="Excluir roteiro" onPress={() => run(async () => { await api.delete(`/routes/${trip.id}`); await reload(); })} disabled={busy} />
    </Card>)}
    {!trips.length && !form && <Empty>Comece escolhendo o destino e o tempo disponível. Seu roteiro ficará salvo aqui.</Empty>}
  </Page>;
}

