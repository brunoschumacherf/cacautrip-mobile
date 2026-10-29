import EmergencyContacts from './EmergencyContacts';
import { useLanguage } from '../../i18n';
import React from 'react';
import { Linking } from 'react-native';
import { Button, Card, Empty, Muted, Notice, Page, Title } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { useAction, useResource } from '../../hooks/useResource';
export default function Emergency() {
  useLanguage();
  const { data, loading, error } = useResource('/catalog', { emergency_points: [] });
  const { run, busy, notice } = useAction();
  const open = url => run(async () => {
    try { await Linking.openURL(url); } catch { throw new Error('Não foi possível abrir o aplicativo. Use o telefone ou endereço exibido.'); }
  });
  return <Page title="Segurança e emergência." subtitle="Números essenciais e pontos de apoio para sua viagem." error={error} loading={loading}>
    <EmergencyContacts /><Notice>{notice}</Notice>
    <Title>Unidades e pontos de apoio</Title><PlaceMap points={data.emergency_points} />
    {data.emergency_points.map(item => <Card key={item.id}>
      <Title translate={false}>{item.name}</Title><Muted>{item.category} · {item.address}</Muted>
      {Boolean(item.phone) && <Button title={`Ligar ${item.phone}`} disabled={busy} onPress={() => open(`tel:${item.phone.replace(/[^+0-9]/g, '')}`)} />}
      {item.latitude != null && item.longitude != null && <Button secondary title="Como chegar" disabled={busy} onPress={() => open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${item.latitude},${item.longitude}`)}`)} />}
    </Card>)}
    {!data.emergency_points.length && <Empty>Não há unidades de apoio cadastradas nesta região.</Empty>}
  </Page>;
}
