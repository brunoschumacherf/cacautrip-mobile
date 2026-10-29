import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Field, Muted, Notice, Page, Section, Title, Toggle, s } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { asArray } from '../../lib/data';
import TrailItinerary from './TrailItinerary';
import DepartureManager from './DepartureManager';
import api from '../../services/api';
const fresh = region => ({ title: '', description: '', region: region || '', image_url: '', difficulty: 'easy', route_mode: 'ordered', duration_minutes: '180', distance_km: '', price: '150', price_mode: 'per_person', minimum_age: '0', accessible: false, included: '', not_included: '', what_to_bring: '', safety_notes: '', cancellation_policy: '', status: 'draft' });
const point = () => ({ name: '', address: '', description: '', kind: 'visit', duration_minutes: '15', latitude: '', longitude: '', optional: false });
function Editor({ initial }) {
  const { user } = useSession();
  const [id, setId] = useState(initial?.id || null);
  const [form, setForm] = useState({ ...fresh(user.guide_profile?.region), ...initial });
  const [stops, setStops] = useState(asArray(initial?.stops).length ? initial.stops : [{ ...point(), kind: 'meeting' }, { ...point(), kind: 'finish' }]);
  const [removed, setRemoved] = useState([]);
  const [tab, setTab] = useState('about');
  const [coordinates, setCoordinates] = useState(false);
  const { run, busy, notice, setNotice } = useAction();
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const editStop = (index, key, value) => setStops(current => current.map((stop, position) => position === index ? { ...stop, [key]: value } : stop));
  const remove = index => { if (stops[index].id) setRemoved(current => [...current, stops[index].id]); setStops(current => current.filter((_, position) => position !== index)); };
  const move = (index, offset) => setStops(current => { const copy = [...current]; [copy[index], copy[index + offset]] = [copy[index + offset], copy[index]]; return copy; });
  const save = status => run(async () => {
    const payload = {
      ...form, status, duration_minutes: Number(form.duration_minutes), minimum_age: Number(form.minimum_age), price: Number(String(form.price).replace(',', '.')),
      distance_km: form.distance_km === '' || form.distance_km == null ? null : Number(String(form.distance_km).replace(',', '.')),
      stops_attributes: [...stops.map((stop, index) => ({ ...stop, position: index, duration_minutes: Number(stop.duration_minutes), latitude: stop.latitude === '' || stop.latitude == null ? null : Number(String(stop.latitude).replace(',', '.')), longitude: stop.longitude === '' || stop.longitude == null ? null : Number(String(stop.longitude).replace(',', '.')) })), ...removed.map(stopId => ({ id: stopId, _destroy: true }))]
    };
    const result = id ? await api.patch(`/trails/${id}`, { trail: payload }) : await api.post('/trails', { trail: payload });
    setId(result.data.id); setForm(current => ({ ...current, status: result.data.status })); setStops(result.data.stops); setRemoved([]); setNotice(status === 'published' ? 'Trilha publicada. Confira se as datas já estão abertas.' : 'Alterações salvas.');
  });
  if (!user.guide_profile) return <Page title="Cadastre seu perfil de guia"><Muted>É preciso ter um perfil de guia para criar trilhas.</Muted></Page>;
  return <Page title={id ? 'Editar minha trilha.' : 'Criar uma trilha.'} subtitle="Cada percurso é uma oferta sua, com pontos de passagem, preço e calendário próprios.">
    <Notice>{notice}</Notice><Badge>{{ draft: 'Rascunho', published: 'Publicada', archived: 'Arquivada', hidden: 'Em análise' }[form.status]}</Badge>
    <View style={s.row}>{[['about', 'Apresentação'], ['stops', 'Pontos do percurso'], ['conditions', 'Condições'], ['dates', 'Dias e vagas'], ['preview', 'Prévia']].map(([key, label]) => <Button secondary key={key} title={`${tab === key ? '✓ ' : ''}${label}`} onPress={() => setTab(key)} />)}</View>
    {tab === 'about' && <Card><Title>Sobre a trilha</Title><Field label="Nome da trilha ou passeio" value={form.title} onChangeText={update('title')} /><Field label="Descrição da experiência" value={form.description} onChangeText={update('description')} multiline /><Field label="Cidade / região" value={form.region} onChangeText={update('region')} /><Field label="URL da imagem de capa" value={form.image_url || ''} onChangeText={update('image_url')} autoCapitalize="none" />
      <Muted>Dificuldade</Muted><View style={s.row}>{[['easy', 'Leve'], ['moderate', 'Moderada'], ['hard', 'Difícil']].map(([key, label]) => <Button key={key} secondary title={`${form.difficulty === key ? '✓ ' : ''}${label}`} onPress={() => update('difficulty')(key)} />)}</View>
      <Field label="Duração total estimada (minutos)" value={String(form.duration_minutes)} onChangeText={update('duration_minutes')} keyboardType="number-pad" /><Field label="Distância aproximada (km, opcional)" value={String(form.distance_km ?? '')} onChangeText={update('distance_km')} keyboardType="decimal-pad" /><Field label="Preço fixo (R$)" value={String(form.price)} onChangeText={update('price')} keyboardType="decimal-pad" /><Button secondary title={`${form.price_mode === 'per_person' ? '✓ ' : ''}Preço por pessoa`} onPress={() => update('price_mode')('per_person')} /><Button secondary title={`${form.price_mode === 'group' ? '✓ ' : ''}Preço fechado por grupo`} onPress={() => update('price_mode')('group')} />
    </Card>}
    {tab === 'stops' && <Section title="Onde vamos passar?" subtitle="Cadastre os endereços. As coordenadas são opcionais e permitem mostrar os marcadores no mapa do app.">
      <Button secondary title={`${form.route_mode === 'ordered' ? '✓ ' : ''}Definir a ordem do percurso`} onPress={() => update('route_mode')('ordered')} /><Button secondary title={`${form.route_mode === 'flexible' ? '✓ ' : ''}A ordem pode mudar durante o passeio`} onPress={() => update('route_mode')('flexible')} /><Toggle label="Informar coordenadas dos pontos" value={coordinates} onChange={setCoordinates} />
      {stops.map((stop, index) => <Card key={stop.id || `new-${index}`}><Title>{form.route_mode === 'ordered' ? `${index + 1}. ` : ''}{stop.name || 'Novo ponto'}</Title><Field label="Nome do ponto" value={stop.name} onChangeText={value => editStop(index, 'name', value)} /><Field label="Endereço ou descrição precisa do acesso" value={stop.address} onChangeText={value => editStop(index, 'address', value)} /><Field label="O que acontece neste ponto?" value={stop.description || ''} onChangeText={value => editStop(index, 'description', value)} multiline />
        <View style={s.row}>{[['meeting', 'Encontro'], ['visit', 'Visita'], ['break', 'Pausa'], ['finish', 'Encerramento']].map(([key, label]) => <Button key={key} secondary title={`${stop.kind === key ? '✓ ' : ''}${label}`} onPress={() => editStop(index, 'kind', key)} />)}</View>
        <Field label="Tempo previsto neste ponto (minutos)" value={String(stop.duration_minutes)} onChangeText={value => editStop(index, 'duration_minutes', value)} keyboardType="number-pad" /><Toggle label="Visita opcional" value={stop.optional} onChange={value => editStop(index, 'optional', value)} />
        {coordinates && <><Field label="Latitude" value={String(stop.latitude ?? '')} onChangeText={value => editStop(index, 'latitude', value)} keyboardType="numbers-and-punctuation" /><Field label="Longitude" value={String(stop.longitude ?? '')} onChangeText={value => editStop(index, 'longitude', value)} keyboardType="numbers-and-punctuation" /></>}
        <View style={s.row}>{form.route_mode === 'ordered' && <><Button secondary title="↑ Subir" disabled={index === 0} onPress={() => move(index, -1)} /><Button secondary title="↓ Descer" disabled={index === stops.length - 1} onPress={() => move(index, 1)} /></>}<Button secondary title="Remover ponto" onPress={() => remove(index)} /></View>
      </Card>)}<Button title="Adicionar ponto de passagem" disabled={stops.length >= 50} onPress={() => setStops(current => [...current, point()])} />
    </Section>}
    {tab === 'conditions' && <Card><Title>Condições e preparação</Title><Field label="Idade mínima" value={String(form.minimum_age)} onChangeText={update('minimum_age')} keyboardType="number-pad" /><Toggle label="Acessibilidade disponível" value={form.accessible} onChange={update('accessible')} />{[['included', 'O que está incluído'], ['not_included', 'O que não está incluído'], ['what_to_bring', 'O que levar'], ['safety_notes', 'Preparo físico, restrições e orientações de segurança'], ['cancellation_policy', 'Política de cancelamento e condições climáticas']].map(([key, label]) => <Field key={key} label={label} value={form[key] || ''} onChangeText={update(key)} multiline />)}</Card>}
    {tab === 'dates' && (id ? <DepartureManager trailId={id} defaultMeeting={stops.find(stop => stop.kind === 'meeting')?.address || stops[0]?.address} /> : <Card><Muted>Salve a trilha como rascunho primeiro. Depois você poderá adicionar uma ou várias datas, definir vagas e acompanhar participantes.</Muted></Card>)}
    {tab === 'preview' && <Section title={form.title || 'Prévia do percurso'}><Muted>{form.description}</Muted><TrailItinerary stops={stops.map((stop, index) => ({ ...stop, position: index }))} mode={form.route_mode} /></Section>}
    <Section title="Salvar alterações"><Muted>Alterações no percurso não substituem o roteiro que já foi contratado pelos turistas.</Muted><Button secondary title="Salvar como rascunho" disabled={busy} onPress={() => save('draft')} /><Button title="Salvar e publicar trilha" disabled={busy || form.status === 'hidden'} onPress={() => save('published')} /></Section>
  </Page>;
}
function Existing({ id }) {
  const { data, loading, error } = useResource(`/trails/${Number(id)}/edit`, null);
  return data ? <Editor key={data.id} initial={data} /> : <Page title="Carregando trilha…" loading={loading} error={error} />;
}
export default function TrailEditor() {
  const params = useLocalSearchParams();
  return params.id ? <Existing id={params.id} /> : <Editor initial={null} />;
}

