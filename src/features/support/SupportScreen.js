import React, { useState } from 'react';
import { Text } from 'react-native';
import { Button, Card, Empty, Field, Muted, Notice, Page, Title } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import api from '../../services/api';
export default function Support() {
  const { data, error, reload } = useResource('/support', []);
  const { run, busy, notice, setNotice } = useAction();
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState(null);
  const ask = () => run(async () => { const result = await api.post('/support/ask', { message }); setAnswer(result.data); });
  const human = () => run(async () => { await api.post('/support', { message }); setMessage(''); await reload(); setNotice('Chamado recebido. A resposta aparecerá aqui e nas notificações.'); });
  return <Page title="Como podemos ajudar?" subtitle="Tire dúvidas ou fale com a equipe de atendimento." error={error}><Notice>{notice}</Notice><Card><Field label="Sua dúvida" value={message} onChangeText={setMessage} multiline maxLength={4000} /><Button title="Consultar assistente" onPress={ask} disabled={busy || !message.trim()} /><Button secondary title="Encaminhar para atendimento humano" onPress={human} disabled={busy || !message.trim()} />{answer && <Card><Title>{answer.mode === 'ai' ? 'Assistente de IA' : 'Ajuda do aplicativo'}</Title><Text>{answer.reply}</Text></Card>}</Card><Title>Meus chamados</Title>{data.map(item => <Card key={item.id}><Title>Chamado #{item.id} · {item.status}</Title><Text>{item.message}</Text><Muted>{item.reply || 'Aguardando atendimento.'}</Muted></Card>)}{!data.length && <Empty>Você ainda não abriu chamados.</Empty>}</Page>;
}


