import { locale } from '../../i18n/core';
import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { Badge, Button, Muted, Notice, Title, money } from '../../components/ui';

export const ecoScope = scope => ({ partner: 'Parceiros locais', trail: 'Trilhas no app', driver: 'Motoristas no app' }[scope] || 'Benefício');
export const ecoDiscount = benefit => benefit.discount_type === 'percent' ? `${Number(benefit.discount_value)}% de desconto` : `${money(benefit.discount_value)} de desconto`;
export function EcoConditions({ benefit }) {
  return <>
    {Number(benefit.minimum_amount) > 0 && <Muted>Compra mínima de {money(benefit.minimum_amount)}.</Muted>}
    {Number(benefit.maximum_discount) > 0 && <Muted>Desconto limitado a {money(benefit.maximum_discount)}.</Muted>}
    <Muted>Um cupom por compra. Não cumulativo com outros cupons.</Muted>
  </>;
}
export function RewardRedeemModal({ reward, balance, busy, notice, onClose, onConfirm }) {
  if (!reward) return null;
  return <Modal visible transparent animationType="slide" onRequestClose={busy ? () => {} : onClose}>
    <View style={{ flex: 1, justifyContent: 'center', padding: 22, backgroundColor: '#391E1680' }}>
      <ScrollView style={{ backgroundColor: '#FFFCF8', borderRadius: 24, maxHeight: '90%', width: '100%', maxWidth: 500, alignSelf: 'center' }} contentContainerStyle={{ padding: 24 }}>
        <Badge>{ecoScope(reward.scope)}</Badge><Title translate={false}>{reward.title}</Title><Title>{ecoDiscount(reward)}</Title><Muted translate={false}>{reward.description}</Muted>
        {reward.partner && <><Muted translate={false}>{reward.partner.name}</Muted><Muted>{reward.partner.address} · {reward.partner.city}</Muted></>}
        <EcoConditions benefit={reward} />
        <Title>{reward.points_cost} pontos</Title><Muted>Seu saldo: {balance} pontos. Após a troca: {Math.max(0, balance - reward.points_cost)} pontos.</Muted>
        <Muted>O cupom vale por até 30 dias{reward.expires_at ? `, respeitando a validade do benefício até ${new Date(reward.expires_at).toLocaleDateString(locale())}` : ''}. Os pontos são descontados ao confirmar o resgate.</Muted>
        <Notice>{notice}</Notice>
        <Button title={busy ? 'Resgatando…' : 'Confirmar resgate'} disabled={busy || balance < reward.points_cost} onPress={onConfirm} />
        <Button secondary title="Voltar" disabled={busy} onPress={onClose} />
      </ScrollView>
    </View>
  </Modal>;
}
export const ecoRequestKey = () => `eco-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
