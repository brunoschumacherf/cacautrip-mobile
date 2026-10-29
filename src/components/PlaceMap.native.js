import { useLanguage } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { mapHtml } from './mapHtml';
import { mapDirections } from './mapActions';
import MapPointDetails from './MapPointDetails';
import { Button, Muted, Notice } from './ui';
import useMapLocation from '../hooks/useMapLocation';
export default function PlaceMap({ points = [], ordered = false }) {
  useLanguage();
  const location = useMapLocation();
  const webview = useRef(null);
  const sendPosition = () => {
    if (location.position) webview.current?.injectJavaScript(`if(window.cacautripSetLocation)window.cacautripSetLocation(${JSON.stringify(location.position)});true;`);
  };
  useEffect(() => {
    if (location.position) webview.current?.injectJavaScript(`if(window.cacautripSetLocation)window.cacautripSetLocation(${JSON.stringify(location.position)});true;`);
  }, [location.position]);
  const [selected, setSelected] = useState(null);

  const [error, setError] = useState('');
  const receive = event => {
    let data;
    try { data = JSON.parse(event.nativeEvent.data); } catch { return; }
    if (!['cacautrip-map-select', 'cacautrip-map-details', 'cacautrip-map-directions'].includes(data.type)) return;
    const indexes = Array.isArray(data.indexes) ? data.indexes : [data.index];
    const items = [...new Set(indexes)].filter(index => Number.isInteger(index) && index >= 0 && index < points.length).map(index => points[index]);
    if (!items.length) return;
    if (data.type === 'cacautrip-map-directions') {
      const action = mapDirections(items[0], location.position);
      if (action) Linking.openURL(action.url).catch(() => { setSelected(items[0]); setError('Não foi possível abrir o Maps. Use o botão nos detalhes.'); });
    } else if (items.length === 1) setSelected(items[0]);

  };
  return <View>
    <Button secondary icon="locate-outline" title={location.busy ? 'Localizando…' : 'Minha localização'} disabled={location.busy} onPress={location.locate} />
    <View style={{ height: 360, borderRadius: 16, overflow: 'hidden', marginVertical: 16 }}><WebView ref={webview} onLoadEnd={sendPosition} applicationNameForUserAgent="Cacautrip/1.0" originWhitelist={['*']} source={{ html: mapHtml(points, { ordered, nativeBridge: true }) }} javaScriptEnabled onMessage={receive} /></View>
    <Muted>Toque em um ícone para ver os detalhes e traçar a rota. Ícones agrupados se expandem no próprio mapa.</Muted>
    <Notice>{location.error || error}</Notice>
    <MapPointDetails origin={location.position} point={selected} onClose={() => setSelected(null)} />
  </View>;
}




