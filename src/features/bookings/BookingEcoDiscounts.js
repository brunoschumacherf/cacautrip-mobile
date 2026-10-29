import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Muted, Notice, Title, money } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { ecoDiscount, ecoRequestKey, EcoConditions, RewardRedeemModal } from '../sustainability/EcoRewards';
import api from '../../services/api';

export default function BookingEcoDiscounts({ booking, selected, onSelect, onBusyChange }) {
  const { data, loading, error, reload } = useResource(`/bookings/${booking.id}/discounts`, { balance: 0, vouchers: [], rewards: [] });
  const [reward, setReward] = useState(null);
  const keys = useRef({});
  const { run, busy, notice, setNotice } = useAction();
  const { refreshUser } = useSession();
  useEffect(() => {
    onBusyChange?.(busy || Boolean(reward));
    return () => onBusyChange?.(false);
  }, [busy, reward, onBusyChange]);
  const confirm = () => run(async () => {
    keys.current[reward.id] ||= ecoRequestKey();
    const { data: result } = await api.post('/sustainability/redeem', { reward_id: reward.id, request_key: keys.current[reward.id] });
    delete keys.current[reward.id];
    const voucher = result.voucher;
    const benefit = voucher.benefit;
    let discount = benefit.discount_type === 'percent' ? Number(booking.total_amount) * Number(benefit.discount_value) / 100 : Number(benefit.discount_value);
    if (benefit.maximum_discount) discount = Math.min(discount, Number(benefit.maximum_discount));
    discount = Math.min(Number(booking.total_amount), Math.round(discount * 100) / 100);
    onSelect({ ...voucher, discount });
    setReward(null); await reload(); await refreshUser(); setNotice('Benefício resgatado e selecionado para este pagamento.');
  });
  const eligibleRewards = data.rewards.filter(item => Number(booking.total_amount) >= Number(item.minimum_amount));
  return <Card style={{ backgroundColor: '#F0F6EC', marginTop: 16 }}>
    <Badge>PONTOS VERDES · {data.balance} pontos</Badge><Title>Use um desconto sustentável</Title><Notice>{error || notice}</Notice>
    {loading && <Muted>Buscando seus benefícios…</Muted>}
    <Button secondary title={!selected ? '✓ Pagar sem cupom' : 'Pagar sem cupom'} onPress={() => onSelect(null)} disabled={busy} />
    {data.vouchers.map(voucher => <Card key={voucher.id}><Title>{voucher.benefit.title}</Title><Muted>{ecoDiscount(voucher.benefit)} · Você economiza {money(voucher.discount)}</Muted><Muted>Válido até {new Date(voucher.expires_at).toLocaleDateString('pt-BR')}</Muted><Button secondary title={selected?.id === voucher.id ? '✓ Desconto selecionado' : 'Usar este desconto'} disabled={busy} onPress={() => onSelect(voucher)} /></Card>)}
    {eligibleRewards.length > 0 && <Muted>Você também pode trocar pontos por um novo desconto:</Muted>}
    {eligibleRewards.map(item => <Card key={item.id}><Title>{item.title}</Title><Muted>{ecoDiscount(item)} · {item.points_cost} pontos</Muted><EcoConditions benefit={item} /><Button secondary title={data.balance >= item.points_cost ? 'Trocar pontos e usar' : `Faltam ${item.points_cost - data.balance} pontos`} disabled={busy || data.balance < item.points_cost} onPress={() => { setReward(item); setNotice(''); }} /></Card>)}
    {!loading && !error && !data.vouchers.length && !eligibleRewards.length && <Muted>Quando você trocar pontos por descontos de trilhas ou transporte, eles aparecerão aqui.</Muted>}
    <RewardRedeemModal reward={reward} balance={data.balance} busy={busy} notice={notice} onClose={() => setReward(null)} onConfirm={confirm} />
  </Card>;
}
