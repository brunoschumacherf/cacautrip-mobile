import React, { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Field, Muted, Notice, Page, Section, Title, Toggle, money } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { useAction } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { asArray } from '../../lib/data';
import api from '../../services/api';
export default function AssistantScreen() {
  const { user } = useSession();
  const [form, setForm] = useState({ message: '', destination: user.preferences.region || '', budget: '', minutes: '480', people: '1', accessible: !!user.preferences.accessible, include_guide: false, include_driver: false });
  const [answer, setAnswer] = useState(null);
  const { run, busy, notice } = useAction();
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const recommend = () => run(async () => { const response = await api.post('/recommendations', { ...form, budget: form.budget || undefined }); setAnswer(response.data); });
  const save = () => run(async () => {
    await api.post('/routes', { route: { title: `Passeio em ${form.destination || 'Costa do Cacau'}`, destination: form.destination || 'Costa do Cacau', budget: form.budget || null, preferences: { ...form, destination_ids: answer.plan.destination_ids, interests: form.message } } });
    router.push('/roteiros');
  });
  return <Page title="O que vamos fazer?" subtitle="Conte seus interesses e descubra alternativas do catálogo que cabem na viagem.">
    <Notice>{notice}</Notice><Card><Field label="Como você imagina seu passeio?" placeholder="Tenho R$ 700 para hoje e gostaria de conhecer praias e comer bem." value={form.message} onChangeText={update('message')} multiline />
      <Field label="Cidade ou região" value={form.destination} onChangeText={update('destination')} /><Field label="Orçamento (R$)" value={form.budget} onChangeText={update('budget')} keyboardType="decimal-pad" /><Field label="Tempo disponível (minutos)" value={form.minutes} onChangeText={update('minutes')} keyboardType="number-pad" /><Field label="Pessoas" value={form.people} onChangeText={update('people')} keyboardType="number-pad" />
      <Toggle label="Experiências acessíveis" value={form.accessible} onChange={update('accessible')} /><Toggle label="Incluir estimativa de guia" value={form.include_guide} onChange={update('include_guide')} /><Toggle label="Incluir estimativa de transporte" value={form.include_driver} onChange={update('include_driver')} /><Button title="Encontrar alternativas" onPress={recommend} disabled={busy} />
    </Card>
    {answer && <Section title="Sua sugestão"><Badge>Recomendação baseada no catálogo</Badge><Muted>{answer.reply}</Muted><PlaceMap points={asArray(answer.plan?.destinations)} />{asArray(answer.plan?.destinations).map(place => <Card key={place.id}><Title>{place.name}</Title><Text>{place.description}</Text><Muted>{money(place.estimated_cost)} · {place.duration_minutes} minutos</Muted><Button secondary title="Ver detalhes" onPress={() => router.push({ pathname: '/destinos/[id]', params: { id: place.id } })} /></Card>)}<Card><Title>Estimativa total: {money(answer.plan?.costs?.total)}</Title><Muted>Locais: {money(answer.plan?.costs?.places)} · Guia: {money(answer.plan?.costs?.guide)} · Transporte: {money(answer.plan?.costs?.driver)}</Muted>{asArray(answer.plan?.warnings).map(warning => <Muted key={warning}>{warning}</Muted>)}<Button title="Salvar e personalizar este roteiro" onPress={save} disabled={busy || !answer.plan?.destination_ids?.length} /></Card></Section>}
    <Button secondary title="Preciso de ajuda com uma reserva" onPress={() => router.push('/suporte')} />
  </Page>;
}

