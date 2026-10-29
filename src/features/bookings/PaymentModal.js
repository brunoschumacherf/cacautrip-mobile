import { ct } from '../../theme/tokens';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { Button, Field, Muted, Notice, Title, money } from '../../components/ui';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';

export default function PaymentModal({ booking, onClose, onUpdate }) {
  const [payment, setPayment] = useState(booking);
  const [method, setMethod] = useState(booking.payment_method || 'pix');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const { run, busy, notice } = useAction();
  const id = payment.id;
  const waiting = payment.payment_method === 'pix' && payment.payment_status === 'pending' && !payment.hold_expired;
  useEffect(() => {
    if (!waiting) return;
    let active = true;
    let timer;
    const poll = async () => {
      try {
        const result = await api.post(`/bookings/${id}/payment_status`);
        if (!active) return;
        setPayment(result.data.booking);
        if (result.data.booking.payment_status === 'approved') onUpdate();
        else timer = setTimeout(poll, 2000);
      } catch (error) { if (active && error.response?.status === 410) { setPayment(current => ({ ...current, hold_expired: true })); onUpdate(); } else if (active) timer = setTimeout(poll, 4000); }
    };
    timer = setTimeout(poll, 2000);
    return () => { active = false; clearTimeout(timer); };
  }, [id, waiting, onUpdate]);
  const pay = () => run(async () => {
    // Dados do cartão permanecem somente na tela. O backend recebe apenas o método.
    const result = await api.post(`/bookings/${id}/pay`, { payment_method: method });
    setPayment(result.data.booking); onUpdate();
  });
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#391E1680' }}><ScrollView style={{ maxHeight: '90%', backgroundColor: '#FFFCF8', borderRadius: 24, width: '100%', maxWidth: 500, alignSelf: 'center' }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled"><Title>Pagamento da reserva #{id}</Title><Muted>{booking.professional?.name}</Muted><Text style={{ fontSize: 28, fontWeight: '700' }}>{money(payment.total_amount)}</Text><Muted>Confira o valor total e escolha a forma de pagamento.</Muted><Notice>{notice}</Notice>{payment.hold_expired ? <Muted>O prazo desta reserva expirou. Feche esta tela e selecione uma nova saída.</Muted> : payment.payment_status === 'approved' ? <><Title>✓ Pagamento aprovado</Title><Muted>Sua reserva está confirmada. Boa viagem!</Muted></> : waiting ? <><Text style={ct.text}>Pagamento Pix · Referência #{id}</Text><Muted>Aguardando confirmação do pagamento…</Muted><ActivityIndicator color="#E96108" /><Muted>Se fechar a tela, volte em Reservas → Acompanhar Pix para continuar.</Muted></> : <><Button secondary title={`${method === 'pix' ? '✓ ' : ''}Pix`} onPress={() => setMethod('pix')} /><Button secondary title={`${method === 'credit_card' ? '✓ ' : ''}Cartão de crédito`} onPress={() => setMethod('credit_card')} />{method === 'credit_card' && Object.entries({ number: 'Número do cartão', name: 'Nome impresso', expiry: 'Validade', cvv: 'CVV' }).map(([key, label]) => <Field key={key} label={`${label}`} value={card[key]} onChangeText={value => setCard(current => ({ ...current, [key]: value }))} secureTextEntry={key === 'cvv'} />)}<Button title={method === 'pix' ? 'Pagar com Pix' : 'Confirmar pagamento'} onPress={pay} disabled={busy} /></>}<Button secondary title="Fechar" onPress={onClose} disabled={busy} /></ScrollView></View></Modal>;
}






