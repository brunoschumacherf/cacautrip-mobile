import React from 'react';
import { mapHtml } from './mapHtml';
export default function PlaceMap({ points = [], ordered = false }) {
  return React.createElement('iframe', { title: 'Mapa dos destinos — OpenStreetMap', srcDoc: mapHtml(points, { ordered }), sandbox: 'allow-scripts', style: { width: '100%', height: 280, border: 0, borderRadius: 16, marginTop: 16, marginBottom: 16 } });
}



