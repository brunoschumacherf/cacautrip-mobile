import { useLanguage } from '../../i18n';
import { locale } from '../../i18n/core';
import React, { useRef, useState } from 'react';
import { LocalizedText as Text } from '../../i18n';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Empty, Field, Muted, Notice, Page, Photo, Section, Title, s } from '../../components/ui';
import ServiceMap from '../../components/ServiceMap';
import { useAction, useResource } from '../../hooks/useResource';
import { useSession } from '../../context/SessionContext';
import { ct } from '../../theme/tokens';
import { EcoConditions, ecoDiscount, ecoScope, ecoRequestKey, RewardRedeemModal } from './EcoRewards';
import api from '../../services/api';

export default function SustainabilityScreen() {
  useLanguage();
  const [city, setCity] = useState('');
  const [tab, setTab] = useState('collect');
  const [code, setCode] = useState('');
  const [map, setMap] = useState(false);
  const [reward, setReward] = useState(null);
  const keys = useRef({});
  const { refreshUser } = useSession();
  const { run, busy, notice, setNotice } = useAction();
  const { data, loading, error, refreshing, reload } = useResource(`/sustainability?city=${encodeURIComponent(city)}`, { balance: 0, cities: [], collection_points: [], rewards: [], vouchers: [], history: [] });
  const claim = () => run(async () => {
    const result = await api.post('/sustainability/claim', { collection_code: code });
    setCode(''); await reload(); await refreshUser(); setNotice(result.data.message);
  });
  const confirm = () => run(async () => {
    keys.current[reward.id] ||= ecoRequestKey();
    const result = await api.post('/sustainability/redeem', { reward_id: reward.id, request_key: keys.current[reward.id] });
    delete keys.current[reward.id];
    setReward(null); setTab('vouchers'); await reload(); await refreshUser();
    setNotice(`Benefício resgatado! Seu cupom é ${result.data.voucher.code}.`);
  });
  return <Page title="Viaje. Cuide. Transforme." subtitle="Pequenas atitudes na Costa do Cacau viram benefícios para sua próxima experiência." loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <Card style={{ backgroundColor: '#E1EFE3', borderColor: '#C6DAC9' }}>
      <Ionicons name="leaf-outline" size={32} color="#176346" /><Muted>SEUS PONTOS VERDES</Muted><Text style={[ct.text, { fontSize: 38, fontWeight: '800', color: '#176346', marginVertical: 10 }]}>{data.balance}</Text>
      <Muted>Entregue materiais em um ponto de coleta, receba um código e troque seus pontos por descontos.</Muted>
    </Card>
    <Notice>{notice}</Notice>
    <View style={s.row}>{[['collect', 'Pontos de coleta'], ['rewards', 'Benefícios'], ['vouchers', 'Meus cupons'], ['history', 'Extrato']].map(([value, title]) => <Button key={value} secondary title={`${tab === value ? '✓ ' : ''}${title}`} onPress={() => setTab(value)} />)}</View>
    {tab === 'collect' && <>
      <Section title="Sua entrega vale pontos"><Card><Muted>1. Separe os materiais aceitos e leve até o ponto.</Muted><Muted>2. A equipe registra sua entrega e informa o código.</Muted><Muted>3. Digite o código abaixo para receber seus pontos.</Muted>
        <Field label="Código recebido no ponto de coleta" placeholder="ECO-XXXX-XXXX-XXXX-XXXX" value={code} onChangeText={setCode} autoCapitalize="characters" maxLength={100} />
        <Button title="Receber meus pontos" icon="gift-outline" disabled={busy || !code.trim()} onPress={claim} />
      </Card></Section>
      <Section title="Encontre um ponto de coleta"><View style={s.row}><Button secondary title={!city ? '✓ Todas as cidades' : 'Todas as cidades'} onPress={() => setCity('')} />{data.cities.map(item => <Button key={item} secondary title={`${city === item ? '✓ ' : ''}${item}`} onPress={() => setCity(item)} />)}</View>
        <Button secondary title={map ? 'Ocultar mapa' : 'Ver pontos no mapa'} icon="map-outline" onPress={() => setMap(!map)} />
        {map && <ServiceMap query={city} kinds={['collection']} filters={false} />}
        {data.collection_points.map(point => <Card key={point.id}>{Boolean(point.image_url) && <Photo uri={point.image_url} />}<Badge>{point.city}</Badge><Title translate={false}>{point.name}</Title><Text style={ct.text}>{point.address}</Text><Muted translate={false}>{point.description}</Muted>{Boolean(point.materials) && <Muted>Materiais aceitos: {point.materials}</Muted>}{Boolean(point.opening_hours) && <Muted>Atendimento: {point.opening_hours}</Muted>}</Card>)}
        {!loading && !data.collection_points.length && <Empty>Os pontos de coleta desta região serão publicados aqui. Confira os benefícios e acompanhe as novidades.</Empty>}
      </Section>
    </>}
    {tab === 'rewards' && <Section title="Escolha como usar seus pontos" subtitle="Descontos em parceiros locais, trilhas e transporte. Confira as condições antes de trocar.">
      {data.rewards.map(item => <Card key={item.id}>{Boolean(item.image_url) && <Photo uri={item.image_url} />}<Badge>{ecoScope(item.scope)}</Badge><Title translate={false}>{item.title}</Title><Title>{ecoDiscount(item)}</Title><Muted translate={false}>{item.description}</Muted>{item.partner && <><Muted>{item.partner.name} · {item.partner.city}</Muted><Muted translate={false}>{item.partner.address}</Muted></>}<EcoConditions benefit={item} /><Muted>{item.points_cost} pontos{item.stock !== null ? ` · ${item.stock} disponíveis` : ''}</Muted><Button title={data.balance >= item.points_cost ? 'Quero este benefício' : `Faltam ${item.points_cost - data.balance} pontos`} disabled={busy || data.balance < item.points_cost} onPress={() => { setReward(item); setNotice(''); }} /></Card>)}
      {!loading && !data.rewards.length && <Empty>Novos benefícios serão publicados aqui. Continue acumulando pontos nas suas entregas.</Empty>}
    </Section>}
    {tab === 'vouchers' && <Section title="Seus benefícios resgatados">
      {data.vouchers.map(voucher => <Card key={voucher.id}><Badge>{voucher.status === 'used' ? 'Utilizado' : voucher.expired ? 'Expirado' : voucher.status === 'reserved' ? 'Vinculado a uma reserva' : 'Pronto para usar'}</Badge><Title translate={false}>{voucher.benefit.title}</Title><Title>{ecoDiscount(voucher.benefit)}</Title><Text selectable style={[ct.text, { fontSize: 17, fontWeight: '800', letterSpacing: 1, color: '#176346', marginVertical: 12 }]}>{voucher.code}</Text><Muted translate={false}>{voucher.benefit.description}</Muted>
        {voucher.benefit.partner && <><Muted translate={false}>{voucher.benefit.partner.name}</Muted><Muted>{voucher.benefit.partner.address} · {voucher.benefit.partner.city}</Muted></>}
        <EcoConditions benefit={voucher.benefit} /><Muted>Válido até {new Date(voucher.expires_at).toLocaleString(locale())}.</Muted><Muted>{voucher.benefit.scope === 'partner' ? 'Apresente este código no estabelecimento. O uso será confirmado pela equipe.' : 'Selecione este desconto ao pagar uma reserva elegível no app.'}</Muted>
      </Card>)}
      {!data.vouchers.length && <Empty>Depois de trocar seus pontos, os cupons aparecerão aqui.</Empty>}
    </Section>}
    {tab === 'history' && <Section title="Cada entrega faz parte da história">
      {data.history.map(entry => <Card key={entry.id}><Title>{entry.amount > 0 ? '+' : ''}{entry.amount} pontos</Title><Muted translate={false}>{entry.description}</Muted><Muted>{new Date(entry.created_at).toLocaleString(locale())}</Muted></Card>)}
      {!data.history.length && <Empty>Seu extrato começa na primeira entrega. Os pontos verdes não são dinheiro e servem para trocar por benefícios.</Empty>}
    </Section>}
    <RewardRedeemModal reward={reward} balance={data.balance} busy={busy} notice={notice} onClose={() => setReward(null)} onConfirm={confirm} />
  </Page>;
}


