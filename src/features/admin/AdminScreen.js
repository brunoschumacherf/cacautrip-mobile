import { useLanguage } from '../../i18n';
import { ct } from '../../theme/tokens';
import React, { useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { ScrollView, View } from 'react-native';
import { Button, Card, Empty, Field, Muted, Notice, Page, Title, Toggle, money, s } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction, useResource } from '../../hooks/useResource';
import api from '../../services/api';

import { resources, forms, booleans, numbers } from './config';
function AdminPanel() {
  const [resource, setResource] = useState('guides');
  const [edit, setEdit] = useState(null);
  const [reason, setReason] = useState('');
  const { data: dashboard, reload: reloadDashboard } = useResource('/admin/dashboard', {});
  const { data, loading, error, reload } = useResource(`/admin/${resource}`, []);
  const { busy, notice, run, setNotice } = useAction();
  const change = (id, record) => run(async () => { await api.patch(`/admin/${resource}/${id}`, { record }); await reload(); await reloadDashboard(); });
  const save = () => run(async () => {
    const record = {};
    Object.keys(forms[resource]).forEach(key => { if (edit[key] !== undefined) record[key] = numbers.includes(key) ? (edit[key] === '' ? null : Number(String(edit[key]).replace(',', '.'))) : edit[key]; });
    if (edit.id) await api.patch(`/admin/${resource}/${edit.id}`, { record }); else await api.post(`/admin/${resource}`, { record });
    setEdit(null); await reload(); setNotice('Registro salvo.');
  });
  const resolve = item => run(async () => {
    if (item.subject_type === 'Review') await api.patch(`/admin/reviews/${item.subject_id}`, { record: { hidden: true } });
    if (item.subject_type === 'Message') await api.patch(`/admin/messages/${item.subject_id}`, { record: { hidden: true } });
    if (item.subject_type === 'User') await api.patch(`/admin/users/${item.subject_id}`, { record: { suspended: true } });
    await api.patch(`/admin/reports/${item.id}`, { record: { status: 'resolved' } }); await reload(); await reloadDashboard();
  });
  return <Page title="Administração." subtitle="Conteúdo, profissionais e operação da plataforma." error={error} loading={loading} onRefresh={reload}><Notice>{notice}</Notice><Card><Title>Visão geral</Title><Muted>{dashboard.users || 0} usuários · {dashboard.bookings || 0} reservas · {dashboard.completed || 0} serviços concluídos</Muted><Text style={ct.text}>Volume pago: {money(dashboard.gross)} · Comissão: {money(dashboard.fees)}</Text><Muted>{dashboard.open_reports || 0} denúncias abertas · {dashboard.open_tickets || 0} chamados abertos</Muted><Muted>Fluxo agregado por destino:</Muted>{Object.entries(dashboard.visits_by_destination || {}).map(([destination, count]) => <Text key={destination}>{destination}: {count} roteiro(s)</Text>)}<Muted>{dashboard.analytics}</Muted><Field label={`Comissão para novos pagamentos (atual: ${Number(dashboard.commission || 0) * 100}%)`} value={reason} onChangeText={setReason} keyboardType="decimal-pad" placeholder="Ex.: 10" /><Button secondary title="Salvar comissão (%)" onPress={() => run(async () => { await api.patch('/admin/commission', { rate: Number(reason.replace(',', '.')) / 100 }); await reloadDashboard(); setNotice('Taxa atualizada para os próximos pagamentos.'); })} disabled={busy || !reason} /></Card><View style={s.row}>{Object.entries(resources).map(([key, label]) => <Button key={key} secondary title={`${key === resource ? '✓ ' : ''}${label}`} onPress={() => { setResource(key); setEdit(null); }} />)}</View>{forms[resource] && <Button title="Cadastrar novo registro" onPress={() => setEdit({ active: true, accessible: false, guide_required: false })} />}{edit && forms[resource] && <Card><Title>{edit.id ? 'Editar registro' : 'Novo registro'}</Title>{Object.entries(forms[resource]).map(([key, label]) => booleans.includes(key) ? <Toggle key={key} label={label} value={!!edit[key]} onChange={value => setEdit(current => ({ ...current, [key]: value }))} /> : <Field key={key} label={label} value={String(edit[key] ?? '')} onChangeText={value => setEdit(current => ({ ...current, [key]: value }))} multiline={['description', 'body', 'rules'].includes(key)} />)}<Button title="Salvar registro" onPress={save} disabled={busy} /><Button secondary title="Cancelar edição" onPress={() => setEdit(null)} /></Card>}
    {data.map(item => <Card key={item.id}><Title>#{item.id} · {item.name || item.title || item.tourist_name || item.plan || item.subject_type || resources[resource]}</Title>{Object.entries(item).filter(([key, value]) => ['email', 'user_id', 'rating', 'comment', 'message', 'reply', 'reason', 'status', 'moderation_status', 'region', 'document_reference', 'vehicle_model', 'capacity', 'date', 'total_amount', 'payment_status', 'fee_amount', 'professional_amount', 'subject_type', 'subject_id', 'professional_type'].includes(key) && value != null).map(([key, value]) => <Muted key={key}>{key}: {String(value)}</Muted>)}
      {['guides', 'drivers'].includes(resource) && <><Button title="Aprovar perfil e documentos" onPress={() => change(item.id, { moderation_status: 'published', [resource === 'guides' ? 'verified_documents' : 'verified_cnh']: true })} disabled={busy} /><Button secondary title="Recusar cadastro" onPress={() => change(item.id, { moderation_status: 'rejected' })} disabled={busy} /><Button secondary title="Ocultar anúncio" onPress={() => change(item.id, { moderation_status: 'hidden' })} disabled={busy} /></>}
      {resource === 'trails' && <><Button secondary title="Ocultar trilha" onPress={() => change(item.id, { status: 'hidden' })} disabled={busy} /><Button secondary title="Restaurar como rascunho" onPress={() => change(item.id, { status: 'draft' })} disabled={busy} /></>}{resource === 'users' && <Button secondary title={item.suspended ? 'Reativar usuário' : 'Suspender usuário'} onPress={() => change(item.id, { suspended: !item.suspended })} disabled={busy} />}
      {resource === 'reviews' && <Button secondary title={item.hidden ? 'Restaurar avaliação' : 'Ocultar avaliação'} onPress={() => change(item.id, { hidden: !item.hidden })} disabled={busy} />}
      {resource === 'reports' && <><Button title="Moderar conteúdo e resolver" onPress={() => resolve(item)} disabled={busy} /><Button secondary title="Arquivar sem ação" onPress={() => change(item.id, { status: 'dismissed' })} disabled={busy} /></>}
      {resource === 'tickets' && <TicketReply ticket={item} onSave={reply => change(item.id, { reply, status: 'answered' })} busy={busy} />}
      {resource === 'subscriptions' && <Button secondary title="Cancelar assinatura" onPress={() => change(item.id, { status: 'cancelled', auto_renew: false })} disabled={busy} />}
      {forms[resource] && <Button secondary title="Editar informações" onPress={() => setEdit(item)} />}
    </Card>)}{!data.length && <Empty>Nenhum registro nesta seção.</Empty>}</Page>;
}
function TicketReply({ ticket, onSave, busy }) { const [reply, setReply] = useState(ticket.reply || ''); return <><Field label="Resposta ao usuário" value={reply} onChangeText={setReply} multiline /><Button title="Enviar resposta" onPress={() => onSave(reply)} disabled={busy || !reply.trim()} /></>; }
export default function Admin() {
  useLanguage(); const { user } = useSession(); return user.admin ? <AdminPanel /> : <Page title="Acesso restrito"><Muted>Esta área é destinada à administração.</Muted></Page>; }







