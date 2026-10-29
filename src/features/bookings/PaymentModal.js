import { ct } from '../../theme/tokens';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { Button, Field, Muted, Notice, Title, money } from '../../components/ui';
import { useAction } from '../../hooks/useResource';
import { errorText } from '../../lib/data';
import BookingEcoDiscounts from './BookingEcoDiscounts';
import api from '../../services/api';

export default function PaymentModal({ booking, onClose, onUpdate }) {
  const [payment, setPayment] = useState(booking);
  const [method, setMethod] = useState(booking.payment_method || 'pix');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [selected, setSelected] = useState(booking.eco_discount?.redemption_id ? { id: booking.eco_discount.redemption_id, discount: Number(booking.discount_amount), benefit: { title: booking.eco_discount.title } } : null);
  const [redeeming, setRedeeming] = useState(false);
  const { run, busy, notice, setNotice } = useAction();
  const id = payment.id;
  const waiting = payment.payment_method === 'pix' && payment.payment_status === 'pending' && !payment.hold_expired;
  const approved = payment.payment_status === 'approved';
  const discount = waiting || approved ? Number(payment.discount_amount || 0) : Number(selected?.discount || 0);
  const due = Math.max(0, Number(payment.total_amount) - discount);
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
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 410) { setPayment(current => ({ ...current, hold_expired: true })); onUpdate(); }
        else if ([409, 422].includes(error.response?.status)) { setPayment(current => ({ ...current, payment_method: null })); setNotice(errorText(error)); }
        else timer = setTimeout(poll, 4000);
      }
    };
    timer = setTimeout(poll, 2000);
    return () => { active = false; clearTimeout(timer); };
  }, [id, waiting, onUpdate, setNotice]);
  const pay = () => run(async () => {
    const result = await api.post(`/bookings/${id}/pay`, { payment_method: method, redemption_id: selected?.id || null });
    setPayment(result.data.booking); onUpdate();
  });
  return <Modal visible transparent animationType="slide" onRequestClose={busy || redeeming ? () => {} : onClose}>
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#391E1680' }}>
      <ScrollView style={{ maxHeight: '90%', backgroundColor: '#FFFCF8', borderRadius: 24, width: '100%', maxWidth: 500, alignSelf: 'center' }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Title>Pagamento da reserva #{id}</Title><Muted>{booking.professional?.name}</Muted>
        {discount > 0 && <><Muted>Serviço: {money(payment.total_amount)}</Muted><Muted>Desconto sustentável: −{money(discount)}</Muted></>}
        <Text style={[ct.text, { fontSize: 28, fontWeight: '700' }]}>{money(due)}</Text><Muted>Confira o total e escolha a forma de pagamento.</Muted><Notice>{notice}</Notice>
        {payment.hold_expired ? <Muted>O prazo desta reserva expirou. Feche esta tela e selecione uma nova saída.</Muted>
          : approved ? <><Title>✓ Pagamento aprovado</Title><Muted>Sua reserva está confirmada. Boa viagem!</Muted></>
            : waiting ? <><Text style={ct.text}>Pagamento Pix · Referência #{id}</Text><Muted>Aguardando confirmação do pagamento…</Muted><ActivityIndicator color="#E96108" /><Muted>Se fechar a tela, volte em Reservas → Acompanhar Pix para continuar.</Muted></>
              : <>
                {['Guia', 'Motorista'].includes(booking.service_type) && <BookingEcoDiscounts booking={payment} selected={selected} onSelect={setSelected} onBusyChange={setRedeeming} />}
                <Button secondary title={`${method === 'pix' ? '✓ ' : ''}Pix`} onPress={() => setMethod('pix')} disabled={busy || redeeming} />
                <Button secondary title={`${method === 'credit_card' ? '✓ ' : ''}Cartão de crédito`} onPress={() => setMethod('credit_card')} disabled={busy || redeeming} />
                {method === 'credit_card' && due > 0 && Object.entries({ number: 'Número do cartão', name: 'Nome impresso', expiry: 'Validade', cvv: 'CVV' }).map(([key, label]) => <Field key={key} label={label} value={card[key]} onChangeText={value => setCard(current => ({ ...current, [key]: value }))} secureTextEntry={key === 'cvv'} />)}
                <Button title={due === 0 ? 'Confirmar reserva com benefício' : method === 'pix' ? 'Pagar com Pix' : 'Confirmar pagamento'} onPress={pay} disabled={busy || redeeming} />
              </>}
        <Button secondary title="Fechar" onPress={onClose} disabled={busy || redeeming} />
      </ScrollView>
    </View>
  </Modal>;
}
