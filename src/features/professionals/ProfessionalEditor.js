import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Field, Muted, Notice, Page, Photo, Title, Toggle } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import { asArray } from '../../lib/data';
import api from '../../services/api';

export default function ProfessionalEditor() {
  const { kind: requested } = useLocalSearchParams();
  const kind = requested === 'driver' ? 'driver' : 'guide';
  const { user, refreshUser } = useSession();
  const initial = kind === 'guide' ? user.guide_profile : user.driver_profile;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({ region: '', description: '', services: '', image_url: '', specialization: '', languages: '', vehicle_model: '', license_plate: '', capacity: '', document_reference: '', price: '', available: true, accessible: false, ...initial, availability: asArray(initial?.availability).join('\n') }));
  const { run, busy, notice, setNotice } = useAction();
  const update = key => value => setForm(current => ({ ...current, [key]: value }));
  const next = () => {
    const required = step === 1 ? ['region', 'description', 'services', 'image_url'] : kind === 'guide' ? ['specialization', 'languages', 'document_reference'] : ['vehicle_model', 'license_plate', 'capacity', 'document_reference'];
    if (required.some(key => !String(form[key] || '').trim())) { setNotice('Preencha os campos desta etapa para continuar.'); return; }
    setNotice(''); setStep(current => current + 1);
  };
  const save = () => run(async () => {
    const price = kind === 'guide' ? Number(form.price || 0) : Number(String(form.price).replace(',', '.'));
    if (kind === 'driver' && (!Number.isFinite(price) || price <= 0)) throw new Error('Informe um preço de referência maior que zero.');
    const availability = form.availability.split(/\n|,/).map(item => item.trim()).filter(Boolean);
    const payload = { ...form, price, availability };
    if (kind === 'driver') payload.capacity = Number(form.capacity);
    await api.post(`/professional_profiles/${kind}`, payload);
    await api.patch('/me', { active_role: kind }); await refreshUser(); router.replace('/profissional');
  });
  return <Page title={kind === 'guide' ? 'Cadastro de guia.' : 'Cadastro de motorista.'} subtitle="Seu perfil pode ser editado a qualquer momento.">
    <Notice>{notice}</Notice>
    {!user.gov_verified ? <Card><Title>Verificação de identidade necessária</Title><Muted>Verifique sua conta com Gov.br em Minha conta para liberar o cadastro profissional.</Muted><Button title="Ir para Minha conta" onPress={() => router.push('/perfil')} /></Card> : <Card>
      <Badge>Etapa {step} de 3 · {['', 'Apresentação', 'Dados profissionais', 'Agenda e preço'][step]}</Badge>
      {step === 1 && <>
        <Title>Apresente seu trabalho</Title><Field label="Regiões e cidades atendidas" value={form.region || ''} onChangeText={update('region')} />
        <Field label="Descrição profissional" value={form.description || ''} onChangeText={update('description')} multiline />
        <Field label="Serviços oferecidos" value={form.services || ''} onChangeText={update('services')} multiline />
        <Field label="URL da foto" hint="Use o endereço https:// de uma imagem." value={form.image_url || ''} onChangeText={update('image_url')} autoCapitalize="none" /><Photo uri={form.image_url} />
      </>}
      {step === 2 && <>
        <Title>Dados profissionais</Title>
        {kind === 'guide' ? <><Field label="Especialidades" value={form.specialization || ''} onChangeText={update('specialization')} /><Field label="Idiomas" value={form.languages || ''} onChangeText={update('languages')} /></> : <><Field label="Modelo do veículo" value={form.vehicle_model || ''} onChangeText={update('vehicle_model')} /><Field label="Placa" value={form.license_plate || ''} onChangeText={update('license_plate')} autoCapitalize="characters" /><Field label="Capacidade de passageiros" value={String(form.capacity || '')} onChangeText={update('capacity')} keyboardType="number-pad" /></>}
        <Field label={kind === 'guide' ? 'Registro ou certificação profissional' : 'Referência do documento / CNH'} value={form.document_reference || ''} onChangeText={update('document_reference')} />
        <Muted>A referência documental fica disponível somente para você e para a administração. Alterações exigem nova análise.</Muted>
      </>}
      {step === 3 && <>
        <Title>{kind === 'guide' ? 'Publicação do perfil' : 'Defina sua disponibilidade'}</Title>{kind === 'guide' && <Muted>Depois de salvar o perfil, crie suas trilhas no painel. Cada trilha terá preço, percurso e calendário próprios.</Muted>}{kind === 'driver' && <Field label="Referência de preço (R$)" value={String(form.price || '')} onChangeText={update('price')} keyboardType="decimal-pad" />}
        {kind === 'driver' && <Field label="Datas e horários disponíveis" hint="Um horário por linha, no formato AAAA-MM-DD HH:MM. Deixe vazio para combinar pelo chat." placeholder="2026-11-05 09:00" value={form.availability} onChangeText={update('availability')} multiline />}
        <Toggle label="Receber novas propostas" value={form.available} onChange={update('available')} /><Toggle label="Atendimento acessível" value={form.accessible} onChange={update('accessible')} />
        <Muted>Após o envio, acompanhe a aprovação e o desempenho no painel profissional.</Muted>
      </>}
      {step < 3 ? <Button title="Continuar" onPress={next} /> : <Button title="Salvar cadastro" onPress={save} disabled={busy} />}
      {step > 1 && <Button secondary title="Etapa anterior" disabled={busy} onPress={() => { setStep(current => current - 1); setNotice(''); }} />}
    </Card>}
  </Page>;
}




