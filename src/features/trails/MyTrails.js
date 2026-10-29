import { useLanguage } from '../../i18n';
import React, { useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { router } from 'expo-router';
import { Badge, Button, Card, Empty, Muted, Notice, Page, Section, Title, money } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { asArray } from '../../lib/data';
import { departureDate } from './TrailItinerary';
import api from '../../services/api';
export default function MyTrails() {
  useLanguage();
  const { user } = useSession();
  const { data, loading, error, reload, refreshing } = useResource('/trails/mine', []);
  const { run, busy, notice } = useAction();
  const [history, setHistory] = useState(false);
  const shown = data.filter(trail => history === (trail.status === 'archived'));
  return <Page title="Minhas trilhas." subtitle="Você escolhe o percurso, as condições e os dias de cada passeio." loading={loading} error={error} onRefresh={reload} refreshing={refreshing}><Notice>{notice}</Notice>
    {user.guide_profile ? <Button title="Criar uma trilha" icon="add-outline" onPress={() => router.push('/trilha-editor')} /> : <Card><Title>Cadastre seu perfil de guia</Title><Button title="Começar cadastro" onPress={() => router.push({ pathname: '/cadastro-profissional', params: { kind: 'guide' } })} /></Card>}
    <Button secondary title={history ? 'Ver trilhas ativas' : 'Ver trilhas arquivadas'} onPress={() => setHistory(!history)} />
    {shown.map(trail => <Card key={trail.id}><Badge>{{ draft: 'Rascunho', published: 'Publicada', archived: 'Arquivada', hidden: 'Em análise' }[trail.status]}</Badge><Title translate={false}>{trail.title}</Title><Muted>{trail.region} · {asArray(trail.stops).length} pontos · {money(trail.price)} {trail.price_mode === 'per_person' ? '/ pessoa' : '/ grupo'}</Muted><Muted>{asArray(trail.departures).filter(item => item.status === 'scheduled' && new Date(item.starts_at) > new Date()).length} saídas futuras</Muted>
      <Button title="Editar trilha e saídas" onPress={() => router.push({ pathname: '/trilha-editor', params: { id: trail.id } })} />
      {trail.status === 'published' && <Button secondary title="Ver como turista" onPress={() => router.push({ pathname: '/trilhas/[id]', params: { id: trail.id } })} />}
      <Button secondary title="Criar cópia desta trilha" disabled={busy} onPress={() => run(async () => { const result = await api.post(`/trails/${trail.id}/duplicate`); router.push({ pathname: '/trilha-editor', params: { id: result.data.id } }); })} />
      {trail.status !== 'archived' && <Button secondary title="Arquivar anúncio" disabled={busy} onPress={() => run(async () => { await api.delete(`/trails/${trail.id}`); await reload(); })} />}
    </Card>)}
    {!loading && !shown.length && <Empty>{history ? 'Nenhuma trilha arquivada.' : 'Comece criando sua primeira trilha. Depois, abra as datas para o grupo reservar.'}</Empty>}
  </Page>;
}


