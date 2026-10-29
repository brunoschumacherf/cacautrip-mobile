import React from 'react';
import { Linking } from 'react-native';
import { Button, Card, Empty, Muted, Page, Title } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { useResource } from '../../hooks/useResource';
export default function Emergency() {
  const { data, loading, error } = useResource('/catalog', { emergency_points: [] });
  return <Page title="Pontos de apoio." subtitle="Contatos e unidades cadastrados pela administração." error={error} loading={loading}><PlaceMap points={data.emergency_points} />{data.emergency_points.map(item => <Card key={item.id}><Title>{item.name}</Title><Muted>{item.category} · {item.address}</Muted>{Boolean(item.phone) && <Button title={`Ligar ${item.phone}`} onPress={() => Linking.openURL(`tel:${item.phone.replace(/[^+0-9]/g, '')}`)} />}{item.latitude != null && item.longitude != null && <Button secondary title="Como chegar" onPress={() => Linking.openURL(`https://www.openstreetmap.org/directions?to=${item.latitude}%2C${item.longitude}`)} />}</Card>)}{!data.emergency_points.length && <Empty>Não há unidades de apoio cadastradas nesta região.</Empty>}</Page>;
}




