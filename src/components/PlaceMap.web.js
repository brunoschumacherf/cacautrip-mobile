import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { loadLeaflet, mountLeaflet } from './leafletWeb';
import MapPointDetails from './MapPointDetails';
import { Button, Muted, Notice } from './ui';
import useMapLocation from '../hooks/useMapLocation';

export default function PlaceMap({ points = [], ordered = false }) {
  const location = useMapLocation();
  const container = useRef(null), controller = useRef(null);
  const current = useRef({ points, ordered }); current.current = { points, ordered, position: location.position };
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadLeaflet().then(L => {
      if (!active || !container.current) return;
      controller.current = mountLeaflet(L, container.current, { onDetails: setSelected, onTileError: setError });
      controller.current.update(current.current.points, current.current.ordered);
      if (current.current.position) controller.current.setLocation(current.current.position);
    }).catch(failure => { if (active) setError(failure.message || 'Não foi possível carregar o mapa.'); });
    return () => { active = false; controller.current?.destroy(); controller.current = null; };
  }, []);
  useEffect(() => { controller.current?.update(points, ordered); }, [points, ordered]);
  useEffect(() => { if (location.position) controller.current?.setLocation(location.position); }, [location.position]);
  return <View>
    <Button secondary icon="locate-outline" title={location.busy ? 'Localizando…' : 'Minha localização'} disabled={location.busy} onPress={location.locate} />
    <Notice>{location.error || error}</Notice>
    {React.createElement('div', { ref: container, className: 'ct-leaflet-map', role: 'region', 'aria-label': 'Mapa interativo — toque nos ícones para detalhes e rota', style: { width: '100%', height: 360, borderRadius: 16, marginTop: 16, marginBottom: 10, position: 'relative', zIndex: 0 } })}
    <Muted>Toque em um ícone para ver os detalhes e traçar a rota. Ícones agrupados se expandem no próprio mapa.</Muted>
    <MapPointDetails origin={location.position} point={selected} onClose={() => setSelected(null)} />
  </View>;
}

