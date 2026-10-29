import { ct } from '../../theme/tokens';
import React, { useRef, useState } from 'react';
import { Text } from 'react-native';
import { Button, Card, Field, Muted, Notice, Page, Title, Toggle, money } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import api from '../../services/api';
export default function WithdrawalScreen() {
  const { data, loading, error, reload } = useResource('/wallet', { available: 0 });
  const { busy, notice, run } = useAction();
  const reference = useRef(`withdraw-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`);
  const [form, setForm] = useState({ destination_type: 'gov_cpf', amount: '', pix_key: '', bank: '', agency: '', account: '', same_holder: false });
  const [receipt, setReceipt] = useState(null);
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const withdraw = () => run(async () => { const result = await api.post('/wallet/payout', { ...form, reference: reference.current }); setReceipt(result.data.entry); await reload(); });
  return <Page title="Sacar." subtitle="Escolha onde deseja receber." loading={loading} error={error}><Notice>{notice}</Notice>
    {receipt ? <Card><Title>✓ Saque solicitado</Title><Text style={ct.text}>{money(Math.abs(receipt.amount))}</Text><Muted>{receipt.metadata?.destination?.label}</Muted><Muted>Comprovante: {receipt.reference}</Muted><Muted>Solicitado em {new Date(receipt.created_at).toLocaleString('pt-BR')}</Muted></Card> : <Card>
      <Title>Disponível: {money(data.available)}</Title><Field label="Valor do saque (R$)" hint="Deixe em branco para sacar o saldo disponível." value={form.amount} onChangeText={update('amount')} keyboardType="decimal-pad" />
      <Button secondary title={`${form.destination_type === 'gov_cpf' ? '✓ ' : ''}Receber pelo CPF do Gov.br`} onPress={() => update('destination_type')('gov_cpf')} />
      <Button secondary title={`${form.destination_type === 'pix_key' ? '✓ ' : ''}Usar outra chave Pix`} onPress={() => update('destination_type')('pix_key')} />
      <Button secondary title={`${form.destination_type === 'bank_transfer' ? '✓ ' : ''}Transferência bancária`} onPress={() => update('destination_type')('bank_transfer')} />
      {form.destination_type === 'gov_cpf' && <Muted>Você não precisa informar uma chave: será utilizado o CPF vinculado à sua conta Gov.br.</Muted>}
      {form.destination_type === 'pix_key' && <Field label="Chave Pix" value={form.pix_key} onChangeText={update('pix_key')} autoCapitalize="none" />}
      {form.destination_type === 'bank_transfer' && <><Field label="Banco" value={form.bank} onChangeText={update('bank')} /><Field label="Agência" value={form.agency} onChangeText={update('agency')} /><Field label="Conta e dígito" value={form.account} onChangeText={update('account')} /></>}
      <Muted>A chave Pix ou conta bancária deve pertencer ao mesmo titular do CPF cadastrado no Gov.br.</Muted>
      {form.destination_type !== 'gov_cpf' && <Toggle label="O destino está em meu nome, conforme o Gov.br" value={form.same_holder} onChange={update('same_holder')} />}
      <Button title="Confirmar saque" onPress={withdraw} disabled={busy || Number(data.available) <= 0 || (form.destination_type !== 'gov_cpf' && !form.same_holder)} />
    </Card>}
  </Page>;
}


