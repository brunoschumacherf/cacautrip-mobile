import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Badge, Button, Muted, Notice, s } from './ui';
import { useResource } from '../hooks/useResource';
import PlaceMap from './PlaceMap';
import { mapPointIcon } from './mapHtml';

const types = [['', 'Todos'], ['destination', 'Destinos'], ['trail', 'Trilhas'], ['guide', 'Guias'], ['driver', 'Motoristas'], ['collection', 'Coleta'], ['partner', 'Parceiros'], ['hospital', 'Saúde'], ['police', 'Delegacias'], ['emergency', 'Todo apoio']];
export default function ServiceMap({ query = '', kinds = [], filters = true }) {
  const [selected, setSelected] = useState('');
  const path = `/map_points?q=${encodeURIComponent(query)}&kinds=${encodeURIComponent(kinds.join(','))}`;
  const { data, error, loading, refreshing, reload } = useResource(path, { points: [], total: 0, unlocated_count: 0, unlocated: [], counts: {} });
  useFocusEffect(useCallback(() => {
    if (!data.unlocated_count) return;
    let attempts = 0;
    const timer = setInterval(() => { if (++attempts <= 6) reload(); else clearInterval(timer); }, 4000);
    return () => clearInterval(timer);
  }, [data.unlocated_count, reload]));
  const matching = (point, type) => ['hospital', 'police'].includes(type) ? mapPointIcon(point) === type : point.kind === type;
  const points = selected ? data.points.filter(point => matching(point, selected)) : data.points;
  return <View style={{ marginVertical: 12 }}>
    {filters && <View style={s.row}>{types.map(([value, title]) => <Button key={value} secondary title={`${selected === value ? '✓ ' : ''}${title}${value ? ` (${data.points.filter(point => matching(point, value)).length})` : ''}`} onPress={() => setSelected(value)} />)}</View>}
    <Notice>{error}</Notice><PlaceMap points={points} />
    <View style={[s.row, { justifyContent: 'space-between' }]}><Badge>{points.length} locais e serviços no mapa</Badge><Button secondary icon="refresh-outline" title={loading || refreshing ? 'Atualizando…' : 'Atualizar mapa'} disabled={loading || refreshing} onPress={reload} /></View>
    {filters && <Muted>O mapa inclui os serviços da região, independentemente da página da lista. Guias e motoristas indicam a área de atendimento, sem posição em tempo real.</Muted>}
    {data.unlocated_count > 0 && <Muted>{data.unlocated_count} endereço(s) ainda sem localização confirmada. As localizações encontradas são atualizadas automaticamente.</Muted>}
    {!loading && !points.length && <Muted>Nenhum ponto localizado neste filtro. Confira o endereço na listagem ou atualize o mapa em instantes.</Muted>}
  </View>;
}
