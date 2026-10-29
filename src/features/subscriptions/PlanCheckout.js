import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { Button, Field, Muted, Notice, Title, money } from '../../components/ui';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';
export default function PlanCheckout({ order: initial, onClose, onPaid }) {
  const [order, setOrder] = useState(initial);
  const [method, setMethod] = useState('pix');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const { run, busy, notice } = useAction();
  const waiting = order.payment_method === 'pix' && order.status === 'pending';
  useEffect(() => {
    if (!waiting) return;
    let active = true;
    let timer;
    const poll = async () => {
      try {
        const response = await api.post(`/subscription_orders/${order.id}/payment_status`);
        if (!active) return;
        setOrder(response.data);
        if (response.data.status === 'approved') onPaid(); else timer = setTimeout(poll, 2000);
      } catch { if (active) timer = setTimeout(poll, 4000); }
    };
    timer = setTimeout(poll, 2000);
    return () => { active = false; clearTimeout(timer); };
  }, [waiting, order.id, onPaid]);
  const pay = () => run(async () => { const response = await api.post(`/subscription_orders/${order.id}/pay`, { payment_method: method }); setOrder(response.data); if (response.data.status === 'approved') onPaid(); });
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0008', padding: 20 }}><ScrollView style={{ maxHeight: '90%', backgroundColor: '#fff', borderRadius: 18, maxWidth: 500, width: '100%', alignSelf: 'center' }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
    <Title>Pagamento do plano</Title><Text style={{ fontSize: 28, fontWeight: '700' }}>{money(order.amount)}</Text><Notice>{notice}</Notice>
    {order.status === 'approved' ? <><Title>✓ Plano ativado</Title><Muted>Seus benefícios já estão disponíveis.</Muted></> : waiting ? <><ActivityIndicator color="#285b42" /><Muted>Aguardando confirmação do Pix…</Muted><Text>Referência: PLANO-{order.id}</Text></> : <><Button secondary title={`${method === 'pix' ? '✓ ' : ''}Pix`} onPress={() => setMethod('pix')} /><Button secondary title={`${method === 'credit_card' ? '✓ ' : ''}Cartão de crédito`} onPress={() => setMethod('credit_card')} />{method === 'credit_card' && Object.entries({ number: 'Número do cartão', name: 'Nome impresso', expiry: 'Validade', cvv: 'CVV' }).map(([key, label]) => <Field key={key} label={label} value={card[key]} onChangeText={value => setCard(current => ({ ...current, [key]: value }))} secureTextEntry={key === 'cvv'} />)}<Button title={Number(order.amount) === 0 ? 'Ativar plano gratuito' : 'Confirmar pagamento'} onPress={pay} disabled={busy} /></>}
    <Button secondary title="Fechar" onPress={onClose} disabled={busy} />
  </ScrollView></View></Modal>;
}

