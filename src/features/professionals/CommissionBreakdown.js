import { useLanguage } from '../../i18n';
import { locale } from '../../i18n/core';
import React, { useDeferredValue } from 'react';
import { Card, Muted, Title, money } from '../../components/ui';
import { useResource } from '../../hooks/useResource';

function Breakdown({ quote, title, unit }) {
  if (!quote) return null;
  return <Card>
    <Title>{title || (quote.estimated ? 'Previsão do seu recebimento' : 'Seu recebimento')}</Title>
    {Boolean(unit) && <Muted>{unit}</Muted>}
    <Muted>Valor cobrado: {money(quote.gross)}</Muted>
    <Muted>Comissão da plataforma{quote.percent != null ? ` (${Number(quote.percent).toLocaleString(locale(), { maximumFractionDigits: 2 })}%)` : ''}: − {money(quote.fee)}</Muted>
    <Title>Você recebe: {money(quote.net)}</Title>
    <Muted>{quote.estimated ? 'A comissão é descontada do valor contratado. A taxa vigente na aprovação do pagamento define o desconto final.' : 'Valores registrados na aprovação do pagamento.'}</Muted>
  </Card>;
}
function LiveQuote({ amount, title, unit }) {
  const parsed = Number(String(amount ?? '').replace(',', '.'));
  const safe = Number.isFinite(parsed) && parsed >= 0 && parsed <= 99999999 ? parsed : 0;
  const deferred = useDeferredValue(safe);
  const { data, loading, error } = useResource(`/professional_profiles/commission?amount=${encodeURIComponent(deferred)}`, null);
  if (error) return <Card><Title>Comissão da plataforma</Title><Muted>Não foi possível consultar a taxa. Atualize a tela para conferir seu recebimento antes de confirmar.</Muted></Card>;
  if (!data || loading) return <Muted>Consultando a comissão da plataforma…</Muted>;
  return <Breakdown quote={data} title={title} unit={unit} />;
}
export default function CommissionBreakdown({ amount, quote, title, unit }) {
  useLanguage();
  return quote ? <Breakdown quote={quote} title={title} unit={unit} /> : <LiveQuote amount={amount} title={title} unit={unit} />;
}
