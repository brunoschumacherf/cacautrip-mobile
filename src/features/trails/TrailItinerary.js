import { ct } from '../../theme/tokens';
import React from 'react';
import { Linking, Text, View } from 'react-native';
import { Badge, Button, Card, Muted, Title } from '../../components/ui';
import PlaceMap from '../../components/PlaceMap';
import { asArray } from '../../lib/data';
export const difficultyLabel = value => ({ easy: 'Leve', moderate: 'Moderada', hard: 'Difícil' }[value] || value);
export const departureDate = value => value ? new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Bahia', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const stopQuery = stop => stop.latitude != null && stop.longitude != null ? `${stop.latitude},${stop.longitude}` : `${stop.name}, ${stop.address}`;
const pointUrl = stop => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stopQuery(stop))}`;
function directions(stops) {
  const query = `origin=${encodeURIComponent(stopQuery(stops[0]))}&destination=${encodeURIComponent(stopQuery(stops[stops.length - 1]))}`;
  const waypoints = stops.slice(1, -1).map(stopQuery).join('|');
  return `https://www.google.com/maps/dir/?api=1&${query}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=walking`;
}
export default function TrailItinerary({ stops = [], mode = 'ordered' }) {
  const items = asArray(stops).filter(stop => !stop._destroy).slice().sort((a, b) => (a.position || 0) - (b.position || 0));
  const segments = [];
  if (mode === 'ordered') for (let index = 0; index < items.length - 1; index += 3) segments.push(items.slice(index, index + 4));
  const coordinates = items.filter(stop => stop.latitude != null && stop.longitude != null && stop.latitude !== '' && stop.longitude !== '');
  return <View>
    <Badge>{mode === 'ordered' ? 'Percurso com ordem definida' : 'Pontos com ordem flexível'}</Badge>
    {mode === 'flexible' && <Muted>O guia define a ordem das visitas de acordo com o grupo e as condições do passeio.</Muted>}
    {coordinates.length > 0 && <PlaceMap points={items} ordered={mode === 'ordered'} />}
    {items.map((stop, index) => <Card key={stop.id || index}>
      <Title>{mode === 'ordered' ? `${index + 1}. ` : ''}{stop.name}</Title><Badge>{{ meeting: 'Encontro', visit: 'Visita', break: 'Pausa', finish: 'Encerramento' }[stop.kind] || 'Ponto de passagem'}{stop.optional ? ' · Opcional' : ''}</Badge>
      <Text style={ct.text}>{stop.address}</Text>{Boolean(stop.description) && <Muted>{stop.description}</Muted>}
      <Muted>{stop.duration_minutes || 0} minutos previstos neste ponto</Muted>
      <Button secondary title="Ver este ponto no mapa" onPress={() => Linking.openURL(pointUrl(stop))} />
    </Card>)}
    {segments.map((segment, index) => <Button key={index} secondary title={segments.length === 1 ? 'Abrir sequência de pontos no mapa' : `Abrir trecho ${index + 1} no mapa`} onPress={() => Linking.openURL(directions(segment))} />)}
    {!!segments.length && <Muted>Os mapas mostram os pontos informados. O caminho da trilha e os acessos devem ser orientados pelo guia.</Muted>}
  </View>;
}


