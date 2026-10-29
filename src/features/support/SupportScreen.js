import React, { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Badge, Button, Card, Empty, Field, Muted, Notice, Page, Title } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { errorText } from '../../lib/data';
import { colors, ct } from '../../theme/tokens';
import api from '../../services/api';

const labels = { ai: 'Assistente virtual', open: 'Aguardando equipe', answered: 'Em atendimento', closed: 'Encerrado' };
const combine = (current, incoming) => [...new Map([...current, ...incoming].map(item => [item.id, item])).values()].sort((a, b) => a.id - b.id);

function Conversation({ id, onBack, onChanged }) {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [older, setOlder] = useState(false);
  const { run, busy, notice, setNotice } = useAction();
  const newest = useRef(0);
  const oldest = useRef(0);
  const mounted = useRef(false);
  const generation = useRef(0);
  const fetching = useRef(false);
  const refresh = useCallback(async (previous = false) => {
    if (fetching.current) return;
    fetching.current = true;
    const version = generation.current;
    try {
      const suffix = previous ? `?before_id=${oldest.current}` : newest.current ? `?after_id=${newest.current}` : '';
      const { data } = await api.get(`/support/${id}${suffix}`);
      if (!mounted.current || version !== generation.current) return;
      const incoming = Array.isArray(data.messages) ? data.messages : [];
      setTicket(data);
      setMessages(current => combine(current, incoming));
      if (!newest.current || previous) setOlder(Boolean(data.has_older));
      if (incoming.length) {
        newest.current = Math.max(newest.current, ...incoming.map(item => item.id));
        oldest.current = oldest.current ? Math.min(oldest.current, ...incoming.map(item => item.id)) : incoming[0].id;
      }
      setError('');
    } catch (failure) {
      if (mounted.current && version === generation.current) setError(errorText(failure));
    } finally {
      fetching.current = false;
      if (mounted.current && version === generation.current) setLoading(false);
    }
  }, [id]);
  useFocusEffect(useCallback(() => {
    mounted.current = true;
    generation.current += 1;
    refresh();
    const timer = setInterval(() => refresh(), 4000);
    return () => { mounted.current = false; generation.current += 1; clearInterval(timer); };
  }, [refresh]));
  const send = () => run(async () => {
    const text = draft.trim();
    if (!text) return;
    await api.post(`/support/${id}/messages`, { message: text }, { timeout: 35000 });
    setDraft('');
    await refresh();
    await onChanged();
  });
  const human = () => run(async () => {
    const { data } = await api.post(`/support/${id}/human`);
    setTicket(data);
    await refresh();
    await onChanged();
    setNotice('Sua conversa foi encaminhada para a equipe. Você pode continuar escrevendo por aqui.');
  });
  return <Page title={`Atendimento #${id}`} subtitle="Seu histórico e as respostas ficam nesta conversa." loading={loading} error={error} onRefresh={() => refresh()}>
    <Button secondary title="Voltar para meus atendimentos" onPress={onBack} />
    <Notice>{notice}</Notice>
    {ticket && <Badge>{labels[ticket.status] || ticket.status}</Badge>}
    {older && <Button secondary title="Carregar mensagens anteriores" disabled={busy} onPress={() => refresh(true)} />}
    {messages.map(message => <View key={message.id} style={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', width: message.role === 'system' ? '100%' : '92%', borderRadius: 18, padding: 16, marginVertical: 5, borderWidth: 1, borderColor: colors.line, backgroundColor: message.role === 'user' ? '#FFF0DC' : message.role === 'staff' ? '#E1EFE3' : '#FFFCF8' }}>
      <Text style={[ct.text, { fontWeight: '700', marginBottom: 7 }]}>{message.role === 'user' ? 'Você' : message.role === 'staff' ? `${message.sender_name || 'Equipe'} · Suporte` : message.role === 'assistant' ? 'Assistente virtual' : 'Atendimento'}</Text>
      <Text style={[ct.text, { lineHeight: 23 }]}>{message.content}</Text>
      <Muted>{new Date(message.created_at).toLocaleString('pt-BR')}</Muted>
    </View>)}
    {ticket?.ai_responding && <Muted>O assistente está preparando sua resposta…</Muted>}
    {ticket && ticket.status !== 'closed' && <Card>
      <Field label={ticket.status === 'ai' ? 'Sua mensagem para o assistente' : 'Mensagem para a equipe'} value={draft} onChangeText={setDraft} multiline maxLength={4000} />
      <Button title={busy ? 'Aguarde…' : 'Enviar mensagem'} onPress={send} disabled={busy || ticket.ai_responding || !draft.trim()} />
      {ticket.status === 'ai' && <Button secondary title="Solicitar atendimento humano" onPress={human} disabled={busy} />}
      {ticket.status === 'open' && <Muted>A equipe recebeu sua solicitação. A resposta aparecerá aqui e nas notificações.</Muted>}
    </Card>}
    {ticket?.status === 'closed' && <Card><Title>Atendimento encerrado</Title><Muted>Seu histórico continua disponível. Para outra dúvida, inicie uma nova conversa.</Muted><Button title="Voltar e iniciar outra conversa" onPress={onBack} /></Card>}
  </Page>;
}

export default function SupportScreen() {
  const { data, error, reload, loading, refreshing } = useResource('/support', []);
  const { run, busy, notice } = useAction();
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const start = () => run(async () => {
    const { data: ticket } = await api.post('/support', { message: message.trim() }, { timeout: 35000 });
    setMessage('');
    setSelectedId(ticket.id);
    await reload();
  });
  if (selectedId) return <Conversation key={selectedId} id={selectedId} onChanged={reload} onBack={() => { setSelectedId(null); reload(); }} />;
  return <Page title="Fale com o suporte." subtitle="Comece com o assistente virtual e, se precisar, solicite nossa equipe na mesma conversa." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <Notice>{notice}</Notice>
    <Card><Title>Como podemos ajudar?</Title><Muted>Conte sua dúvida sobre reservas, pagamentos, cadastro ou sua viagem.</Muted>
      <Field label="Sua primeira mensagem" value={message} onChangeText={setMessage} multiline maxLength={4000} />
      <Button title={busy ? 'O assistente está respondendo…' : 'Iniciar conversa'} onPress={start} disabled={busy || !message.trim()} />
    </Card>
    <Title>Meus atendimentos</Title>
    {data.map(ticket => <Card key={ticket.id}><Badge>{labels[ticket.status] || ticket.status}</Badge><Title>Atendimento #{ticket.id}</Title><Muted>{ticket.subject}</Muted><Muted>{new Date(ticket.updated_at).toLocaleString('pt-BR')}</Muted><Button secondary title={ticket.status === 'closed' ? 'Ver histórico' : 'Continuar conversa'} onPress={() => setSelectedId(ticket.id)} /></Card>)}
    {!loading && !data.length && <Empty>Suas conversas com o suporte aparecerão aqui.</Empty>}
  </Page>;
}
