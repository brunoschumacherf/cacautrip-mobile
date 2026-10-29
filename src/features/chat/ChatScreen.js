import { useLanguage } from '../../i18n';
import { locale } from '../../i18n/core';
import { ct } from '../../theme/tokens';
import React, { useCallback, useEffect, useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Empty, Field, Muted, Notice, Page, Title } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { useConversationSocket } from '../../hooks/useConversationSocket';
import { useSession } from '../../context/SessionContext';
import { asArray } from '../../lib/data';
import api from '../../services/api';

function Thread({ conversation, user }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const { busy, notice, run, setNotice } = useAction();
  const receive = useCallback(message => setMessages(current => {
    const exists = current.some(item => item.id === message.id);
    return (exists ? current.map(item => item.id === message.id ? message : item) : [...current, message]).sort((a, b) => a.id - b.id);
  }), []);
  const socketStatus = useConversationSocket(conversation.id, receive);
  // Sincroniza o histórico ao abrir e após reconexão, sem polling de mensagens.
  useEffect(() => {
    let active = true;
    api.get(`/conversations/${conversation.id}/messages`).then(response => {
      if (active) setMessages(current => {
        const merged = new Map(current.map(item => [item.id, item]));
        asArray(response.data).forEach(item => merged.set(item.id, item));
        return [...merged.values()].sort((a, b) => a.id - b.id);
      });
    }).catch(() => { if (active) setNotice('Não foi possível carregar o histórico.'); });
    return () => { active = false; };
  }, [conversation.id, socketStatus, setNotice]);
  const send = () => run(async () => { const result = await api.post(`/conversations/${conversation.id}/messages`, { content: draft }); receive(result.data); setDraft(''); });
  return <Card><Title translate={false}>{conversation.name}</Title><Badge>{socketStatus === 'connected' ? 'Conectado' : 'Reconectando…'}</Badge>{Boolean(conversation.booking_id) && <Muted>Reserva #{conversation.booking_id}</Muted>}<Notice>{notice}</Notice>
    {messages.map(message => <View key={message.id} style={{ alignSelf: message.sender_id === user.id ? 'flex-end' : 'flex-start', maxWidth: '90%', backgroundColor: message.sender_id === user.id ? '#FFF0DC' : '#FFFCF8', borderRadius: 14, padding: 12, marginVertical: 6 }}><Text translate={false} selectable style={ct.text}>{message.content}</Text><Muted>{new Date(message.created_at).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })}</Muted>{message.sender_id !== user.id && <Button secondary title="Denunciar" disabled={busy} onPress={() => run(async () => { await api.post('/reports', { subject_type: 'Message', subject_id: message.id, reason: 'Solicito análise desta mensagem por comportamento inadequado.' }); setNotice('Denúncia recebida.'); })} />}</View>)}
    {!messages.length && <Muted>Converse e combine os detalhes antes de reservar.</Muted>}
    <Field label="Mensagem" value={draft} onChangeText={setDraft} multiline maxLength={4000} /><Muted>Para sua segurança, mantenha o contato e o pagamento dentro do aplicativo.</Muted><Button title="Enviar" onPress={send} disabled={busy || !draft.trim()} />
  </Card>;
}
export default function ChatScreen() {
  useLanguage();
  const { user } = useSession();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState(null);
  const { data, error, loading, reload } = useResource('/conversations', []);
  const conversation = data.find(item => item.id === (selected || Number(params.conversation))) || null;
  return <Page title="Mensagens." subtitle="Converse com guias, motoristas e clientes." loading={loading} error={error} onRefresh={reload}>
    {data.map(item => <Button secondary key={item.id} title={`${item.name}${item.booking_id ? ` · Reserva #${item.booking_id}` : ''}`} onPress={() => setSelected(item.id)} />)}
    {!data.length && <Empty>Abra o perfil de um profissional e toque em Conversar.</Empty>}
    {conversation && <Thread key={conversation.id} conversation={conversation} user={user} />}
  </Page>;
}




