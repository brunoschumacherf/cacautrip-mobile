import { mapIcons, iconSvg, mapPointIcon } from './mapHtml';
import { mapDirections } from './mapActions';
import { mapTiles } from './mapTiles';

let library;
export function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Mapa disponível no navegador.'));
  if (window.L) return Promise.resolve(window.L);
  if (library) return library;
  library = new Promise((resolve, reject) => {
    if (!document.getElementById('ct-leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'ct-leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('ct-map-style')) {
      const style = document.createElement('style'); style.id = 'ct-map-style';
      style.textContent = '.ct-leaflet-map{font:12px system-ui,sans-serif;background:#eee9e1;isolation:isolate}.ct-leaflet-map .map-marker{background:none;border:0}.ct-leaflet-map .pin{width:34px;height:34px;border:2px solid white;border-radius:14px 14px 14px 4px;color:white;display:grid;place-items:center;box-shadow:0 3px 9px #372b2845;transform:rotate(-45deg)}.ct-leaflet-map .pin svg{transform:rotate(45deg)}.ct-leaflet-map .pin-count{position:absolute;right:-5px;top:-8px;min-width:18px;height:18px;border:2px solid white;border-radius:12px;background:#391e16;color:white;text-align:center;font-size:10px;font-weight:800}.ct-leaflet-map .ordered-pin{width:30px;height:30px;display:grid;place-items:center;border:2px solid white;border-radius:50%;background:#e96108;color:white;font-weight:800}.ct-leaflet-map .popup-item{min-width:170px;max-width:250px;color:#391e16}.ct-leaflet-map .popup-item strong{font-size:14px}.ct-leaflet-map .popup-item p{margin:7px 0;font-size:12px;line-height:1.6}.ct-leaflet-map .popup-item small{display:block;color:#786257;font-size:10px;margin-top:6px}.ct-leaflet-map .popup-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.ct-leaflet-map .popup-actions a,.ct-leaflet-map .popup-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border:0;border-radius:8px;padding:5px 10px;background:#e96108;color:white;text-decoration:none;font:600 11px system-ui;cursor:pointer}.ct-leaflet-map .popup-actions button{background:#f2e7d7;color:#391e16}.ct-leaflet-map .leaflet-popup-content{max-height:250px;overflow:auto}.ct-leaflet-map .legend{background:white;padding:9px 12px;border-radius:9px;font-size:10px;box-shadow:0 2px 8px #0002}.ct-leaflet-map .legend summary{cursor:pointer;font-weight:700}.ct-leaflet-map .legend-row{display:flex;gap:7px;align-items:center;margin:6px 0}.ct-leaflet-map .legend-row svg{width:16px;height:16px}';
      document.head.appendChild(style);
    }
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('A biblioteca do mapa não carregou.'));
    script.onerror = () => { script.remove(); reject(new Error('Não foi possível carregar o mapa. Confira sua conexão.')); };
    document.head.appendChild(script);
  }).catch(error => { library = null; throw error; });
  return library;
}

export function mountLeaflet(L, container, { onDetails, onTileError }) {
  const config = mapTiles();
  const map = L.map(container, { scrollWheelZoom: false }).setView([-14.79, -39.03], 11);
  const { url, ...options } = config;
  const tiles = L.tileLayer(url, options).addTo(map);
  let errors = 0, previousGeometry = '', expanded = [];
  const places = L.layerGroup().addTo(map);
  tiles.on('tileerror', () => {
    if (++errors >= 3 && map.hasLayer(tiles)) {
      map.removeLayer(tiles);
      onTileError('O provedor não carregou o mapa-base. Os locais e os botões de rota continuam disponíveis. Se houver bloqueio do provedor, é necessário regularizar o acesso ou configurar um serviço autorizado.');
    }
  });
  tiles.on('tileload', () => { errors = 0; });
  const collapse = () => { expanded.forEach(layer => places.removeLayer(layer)); expanded = []; };
  map.on('click', collapse); map.on('zoomstart', collapse);
  let legend, userPosition = null;
  const userLayer = L.layerGroup().addTo(map);

  const popup = point => {
    const box = document.createElement('div'); box.className = 'popup-item';
    const title = document.createElement('strong'); title.textContent = point.name || point.title || 'Local'; box.appendChild(title);
    [mapIcons[mapPointIcon(point)][0], point.address || point.city, String(point.description || '').slice(0, 220), point.phone ? `Contato: ${point.phone}` : ''].filter(Boolean).forEach(text => {
      const line = document.createElement('p'); line.textContent = text; box.appendChild(line);
    });
    if (point.note || point.approximate || point.geocoding_approximate) {
      const note = document.createElement('small'); note.textContent = point.note || 'Localização aproximada; confira o endereço.'; box.appendChild(note);
    }
    const actions = document.createElement('div'); actions.className = 'popup-actions';
    const route = mapDirections(point, userPosition);
    if (route) {
      const link = document.createElement('a'); link.href = route.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = route.label; link.dataset.directions = mapDirections(point).url; actions.appendChild(link);
    }
    const details = document.createElement('button'); details.type = 'button'; details.textContent = 'Mais detalhes'; details.onclick = () => onDetails(point); actions.appendChild(details);
    box.appendChild(actions); return box;
  };
  const icon = (key, number = null, count = 0) => L.divIcon({ className: 'map-marker',
    html: number !== null ? `<div class="ordered-pin">${number}</div>` : `<div class="pin" style="background:${mapIcons[key][1]}">${iconSvg(key)}</div>${count > 1 ? `<span class="pin-count">${count}</span>` : ''}`,
    iconSize: [38, 42], iconAnchor: number !== null ? [16, 16] : [19, 40], popupAnchor: [0, -32] });
  const add = (point, position, markerIcon) => L.marker(position, { icon: markerIcon, title: point.name || point.title || 'Local', bubblingMouseEvents: false }).addTo(places).bindPopup(popup(point));
  const expand = group => {
    collapse();
    const center = map.latLngToLayerPoint([Number(group[0].latitude), Number(group[0].longitude)]);
    group.forEach((point, index) => {
      const ring = Math.floor(index / 10), count = Math.min(10, group.length - ring * 10), angle = (index % 10) * Math.PI * 2 / count;
      const target = map.layerPointToLatLng(L.point(center.x + Math.cos(angle) * (55 + ring * 38), center.y + Math.sin(angle) * (55 + ring * 38)));
      const line = L.polyline([[Number(point.latitude), Number(point.longitude)], target], { color: '#A69384', weight: 1, dashArray: '3,4', interactive: false }).addTo(places);
      expanded.push(line, add(point, target, icon(mapPointIcon(point))));
    });
  };
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => map.invalidateSize({ pan: false }));
  resize?.observe(container);
  return {
    update(input, ordered) {
      collapse(); places.clearLayers(); if (legend) { legend.remove(); legend = null; }
      const points = (Array.isArray(input) ? input : []).map((point, index) => ({ ...point, order: index + 1 })).filter(point => point.latitude != null && point.longitude != null && point.latitude !== '' && point.longitude !== '' && Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)) && Math.abs(Number(point.latitude)) <= 90 && Math.abs(Number(point.longitude)) <= 180);
      const groups = new Map();
      points.forEach(point => { const key = ordered ? String(point.order) : `${Number(point.latitude).toFixed(5)},${Number(point.longitude).toFixed(5)}`; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(point); });
      groups.forEach(group => {
        const first = group[0], key = mapPointIcon(first), same = group.every(point => mapPointIcon(point) === key);
        if (group.length === 1) add(first, [Number(first.latitude), Number(first.longitude)], icon(key, ordered ? first.order : null));
        else L.marker([Number(first.latitude), Number(first.longitude)], { icon: icon(same ? key : 'layers', null, group.length), title: `${group.length} serviços neste local`, bubblingMouseEvents: false }).addTo(places).on('click', () => expand(group));
      });
      if (ordered && points.length > 1) L.polyline(points.map(point => [Number(point.latitude), Number(point.longitude)]), { color: '#e96108', dashArray: '5,8', weight: 3 }).addTo(places);
      const geometry = JSON.stringify(points.map(point => [point.latitude, point.longitude]));
      if (points.length && geometry !== previousGeometry && !userPosition) map.fitBounds(points.map(point => [Number(point.latitude), Number(point.longitude)]), { padding: [35, 35], maxZoom: 16 });
      previousGeometry = geometry;
      if (points.length) {
        legend = L.control({ position: 'bottomleft' });
        legend.onAdd = () => {
          const box = document.createElement('div'); box.className = 'legend';
          if (ordered) { box.textContent = 'Sequência dos pontos informados'; return box; }
          const details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Legenda do mapa'; details.appendChild(summary);
          [...new Set(points.map(mapPointIcon))].forEach(key => { const row = document.createElement('div'); row.className = 'legend-row'; const glyph = document.createElement('span'); glyph.style.color = mapIcons[key][1]; glyph.innerHTML = iconSvg(key, 16); const label = document.createElement('span'); label.textContent = mapIcons[key][0].split(' · ')[0]; row.append(glyph, label); details.appendChild(row); });
          box.appendChild(details); L.DomEvent.disableClickPropagation(box); return box;
        }; legend.addTo(map);
      }
    },
    setLocation(position) {
      userPosition = position; userLayer.clearLayers();
      const coordinates = [position.latitude, position.longitude];
      if (position.accuracy > 0) L.circle(coordinates, { radius: position.accuracy, color: '#2563eb', fillOpacity: 0.08, weight: 1, interactive: false }).addTo(userLayer);
      L.circleMarker(coordinates, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(userLayer).bindPopup('Você está aqui');
      container.querySelectorAll('a[data-directions]').forEach(link => { if (link.dataset.directions.includes('/maps/dir/')) link.href = link.dataset.directions + '&origin=' + encodeURIComponent(coordinates.join(',')); });
      map.setView(coordinates, 15);
    },
    destroy() { resize?.disconnect(); map.remove(); }
  };
}


