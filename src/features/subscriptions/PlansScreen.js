import React, { useState } from 'react';
import { Badge, Button, Card, Muted, Notice, Page, Section, Title, Toggle, money, statusLabel } from '../../components/ui';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';
import PlanCheckout from './PlanCheckout';
export default function PlansScreen() {
  const { user } = useSession();
  const { data, loading, error, reload } = useResource('/subscriptions', { plans: {}, subscriptions: [] });
  const { busy, notice, run, setNotice } = useAction();
  const [type, setType] = useState(user.active_role === 'driver' ? 'driver' : user.guide_profile ? 'guide' : 'driver');
  const [renewal, setRenewal] = useState(false);
  const [order, setOrder] = useState(null);
  const choose = plan => run(async () => {
    const result = await api.post('/subscription_orders', { professional_type: type, plan, auto_renew: renewal });
    setOrder(result.data);
  });
  return <Page title="Planos e destaque." subtitle="Mais visibilidade para seu trabalho na Costa do Cacau." loading={loading} error={error} onRefresh={reload}>
    <Notice>{notice}</Notice>
    {user.guide_profile && <Button secondary title={`${type === 'guide' ? '✓ ' : ''}Perfil de guia`} onPress={() => setType('guide')} />}
    {user.driver_profile && <Button secondary title={`${type === 'driver' ? '✓ ' : ''}Perfil de motorista`} onPress={() => setType('driver')} />}
    <Toggle label="Renovar meu plano mensalmente" value={renewal} onChange={setRenewal} />
    {Object.entries(data.plans).map(([plan, price]) => <Card key={plan}>
      <Title>{statusLabel(plan)} · {money(price)} / mês</Title>
      <Muted>{{ basic: 'Perfil listado após aprovação.', featured: 'Prioridade nas buscas de profissionais.', premium: 'Maior prioridade e acesso aos indicadores de desempenho.' }[plan]}</Muted>
      <Button title="Escolher plano" onPress={() => choose(plan)} disabled={busy || !(user.guide_profile || user.driver_profile)} />
    </Card>)}
    <Section title="Minhas assinaturas">
      {data.subscriptions.map(item => <Card key={item.id}>
        <Title>{statusLabel(item.professional_type)} · {statusLabel(item.plan)}</Title>
        <Muted>{statusLabel(item.status)} · Até {new Date(item.renews_at).toLocaleDateString('pt-BR')}</Muted>
        <Toggle label="Renovação mensal" value={item.auto_renew} onChange={value => run(async () => { await api.patch(`/subscriptions/${item.id}`, { auto_renew: value }); await reload(); })} />
        {item.status === 'active' && <Button secondary title="Cancelar plano" disabled={busy} onPress={() => run(async () => { await api.delete(`/subscriptions/${item.id}`); await reload(); })} />}
      </Card>)}
    </Section>
    {order && <PlanCheckout order={order} onClose={() => setOrder(null)} onPaid={reload} />}
  </Page>;
}


