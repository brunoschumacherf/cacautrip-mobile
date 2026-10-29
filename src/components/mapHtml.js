// Ícones SVG locais, sem fontes externas. Números só indicam agrupamentos ou ordem de roteiro.
export function mapPointIcon(point) {
  const kind = String(point.kind || '');
  if (['guide', 'driver', 'collection', 'partner', 'trail'].includes(kind)) return kind;
  const text = `${point.category || ''} ${point.name || point.title || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/hospital|maternidade|saude|\bupa\b|\bubs\b|samu/.test(text)) return 'hospital';
  if (/delegacia|policia|seguranca publica/.test(text)) return 'police';
  if (/bombeiro|incendio/.test(text)) return 'fire';
  if (kind === 'emergency') return 'emergency';
  if (/praia/.test(text)) return 'beach';
  if (/restaurante|gastronomia|caf[eé]|lanchonete/.test(text)) return 'restaurant';
  if (/pousada|hotel|hospedagem/.test(text)) return 'hotel';
  if (/trilha/.test(text)) return 'trail';
  return 'destination';
}
const icons = {
  destination: ['Destino', '#D86A25', ['M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z', 'M15 9a3 3 0 11-6 0 3 3 0 016 0']],
  beach: ['Praia', '#238DA3', ['M3 12c1-6 7-9 13-5 2 1 4 3 5 5H3z', 'M12 5v14', 'M10 21c2 0 2-2 2-2', 'M3 17c2-2 4 2 6 0', 'M15 17c2-2 4 2 6 0']],
  restaurant: ['Restaurante', '#CA642D', ['M5 3v7c0 2 4 2 4 0V3', 'M7 3v18', 'M18 3c-4 3-4 8 0 8V3v18']],
  hotel: ['Hospedagem', '#8D6670', ['M3 7v14', 'M21 11v10', 'M3 17h18', 'M3 11h18v6', 'M7 8h4v3H7z']],
  trail: ['Trilha guiada', '#8C693F', ['M3 20l6-13 4 8 3-6 5 11H3z', 'M8 10l3 2', 'M16 9V3', 'M16 3h5l-2 2 2 2h-5']],
  guide: ['Guia · área de atendimento', '#7B59A3', ['M15 7a3 3 0 11-6 0 3 3 0 016 0', 'M5 21v-3a7 7 0 0114 0v3', 'M3 11l3-1', 'M18 10l3 1']],
  driver: ['Motorista · área de atendimento', '#3973A4', ['M4 10l2-6h12l2 6', 'M3 10h18v8H3z', 'M5 18v3', 'M19 18v3', 'M6 14h2', 'M16 14h2']],
  collection: ['Ponto de coleta', '#27794C', ['M8 5l3-3 4 5', 'M11 2l-1 5', 'M18 8l4 5-3 1', 'M22 13h-6', 'M15 20H8l1-4', 'M8 20l-4-6 3-5']],
  partner: ['Estabelecimento parceiro', '#B18A35', ['M3 9l2-6h14l2 6', 'M3 9c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0', 'M5 12v9h14v-9', 'M10 21v-6h4v6']],
  hospital: ['Hospital e unidade de saúde', '#257E89', ['M8 3h8v6h6v7h-6v6H8v-6H2V9h6V3z']],
  police: ['Delegacia e polícia', '#405B83', ['M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4z', 'M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L7 10.5l3.5-.5L12 7z']],
  fire: ['Corpo de Bombeiros', '#D57535', ['M13 2c2 6-4 6-2 10 2-1 4-3 4-5 7 6 6 15-3 15C3 22 1 13 6 9c-1 5 3 6 3 3 0-4 1-6 4-10z']],
  emergency: ['Ponto de apoio', '#B2564C', ['M12 3l10 18H2L12 3z', 'M12 9v5', 'M12 17v1']],
  layers: ['Serviços neste local', '#645149', ['M12 3L2 8l10 5 10-5-10-5z', 'M2 12l10 5 10-5', 'M2 16l10 5 10-5']]
};
function iconSvg(key, size = 19) {
  const definition = icons[key] || icons.destination;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${definition[2].map(path => `<path d="${path}"/>`).join('')}</svg>`;
}
export function mapHtml(points, { ordered = false } = {}) {
  const safe = (Array.isArray(points) ? points : []).map((point, index) => ({ ...point, index }))
    .filter(point => point.latitude != null && point.longitude != null && point.latitude !== '' && point.longitude !== '' && Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)) && Math.abs(Number(point.latitude)) <= 90 && Math.abs(Number(point.longitude)) <= 180)
    .map(point => ({ name: String(point.name || point.title || ''), address: String(point.address || point.city || ''), icon: mapPointIcon(point), note: String(point.note || ''), phone: String(point.phone || ''), approximate: Boolean(point.approximate || point.geocoding_approximate), latitude: Number(point.latitude), longitude: Number(point.longitude), number: point.index + 1 }));
  const data = JSON.stringify(safe).replace(/</g, '\\u003c');
  const definitions = JSON.stringify(Object.fromEntries(Object.entries(icons).map(([key, value]) => [key, { name: value[0], color: value[1], svg: iconSvg(key) }])));
  return `<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;margin:0}body{font-family:system-ui,sans-serif}.map-marker{background:none;border:0}.pin{width:34px;height:34px;border:2px solid #fff;border-radius:14px 14px 14px 4px;background:var(--pin-color);color:white;display:grid;place-items:center;box-shadow:0 3px 9px #372b2845;transform:rotate(-45deg)}.pin svg{transform:rotate(45deg)}.pin-count{position:absolute;right:-5px;top:-8px;display:grid;place-items:center;min-width:17px;height:17px;padding:0 2px;border:2px solid white;border-radius:12px;background:#391e16;color:white;font-size:10px;font-weight:800}.ordered-pin{width:30px;height:30px;display:grid;place-items:center;border:2px solid white;border-radius:50%;background:#E96108;color:white;box-shadow:0 2px 7px #0003;font-size:12px;font-weight:800}.legend{background:#fff;padding:9px 12px;border-radius:10px;font-size:10px;max-width:190px;box-shadow:0 2px 8px #0002}.legend summary{cursor:pointer;font-weight:700;color:#5f4b3b}.legend-row{display:flex;align-items:center;gap:8px;margin:7px 0}.legend-icon{display:flex;width:20px;align-items:center;justify-content:center}.legend-icon svg{width:16px;height:16px}.popup-item{padding:10px 0;border-bottom:1px solid #eee;min-width:170px;max-width:260px}.popup-item:last-child{border:0}.popup-item strong{display:block;font-size:13px;color:#391e16}.popup-type{display:flex;align-items:center;gap:6px;font-size:10px;margin:6px 0}.popup-type svg{width:14px;height:14px}.popup-item p{font-size:11px;line-height:1.5;margin:5px 0}.popup-item small{font-size:10px;color:#786257}.leaflet-popup-content{max-height:240px;overflow-y:auto;margin:12px 16px}.empty-message{background:white;padding:10px;border-radius:8px;font-size:11px;color:#786257;box-shadow:0 2px 8px #0002}</style>
</head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const points=${data},icons=${definitions},ordered=${ordered ? 'true' : 'false'};
const map=L.map('map').setView([-14.79,-39.03],11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · Photon',maxZoom:19}).addTo(map);
const groups=new Map();points.forEach(p=>{const key=ordered?String(p.number):p.latitude.toFixed(5)+','+p.longitude.toFixed(5);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p)});
groups.forEach(group=>{
 const first=group[0],same=group.every(p=>p.icon===first.icon),kind=icons[group.length>1&&!same?'layers':first.icon]||icons.destination;
 const html=ordered?'<div class="ordered-pin">'+first.number+'</div>':'<div class="pin" style="--pin-color:'+kind.color+'">'+kind.svg+'</div>'+(group.length>1?'<span class="pin-count">'+group.length+'</span>':'');
 const icon=L.divIcon({className:'map-marker',html,iconSize:[38,42],iconAnchor:ordered?[16,16]:[19,40],popupAnchor:[0,-32]});
 const popup=document.createElement('div');
 group.forEach(p=>{const box=document.createElement('div');box.className='popup-item';const title=document.createElement('strong');title.textContent=(ordered?p.number+'. ':'')+p.name;box.appendChild(title);if(!ordered){const type=document.createElement('div');type.className='popup-type';const glyph=document.createElement('span');glyph.innerHTML=icons[p.icon].svg;glyph.style.color=icons[p.icon].color;const text=document.createElement('span');text.textContent=icons[p.icon].name;type.append(glyph,text);box.appendChild(type)}if(p.address){const address=document.createElement('p');address.textContent=p.address;box.appendChild(address)}if(p.phone){const phone=document.createElement('p');phone.textContent='Contato: '+p.phone;box.appendChild(phone)}if(p.approximate||p.note){const note=document.createElement('small');note.textContent=p.note||'Localização aproximada do endereço.';box.appendChild(note)}popup.appendChild(box)});
 L.marker([first.latitude,first.longitude],{icon,title:group.length>1?group.length+' serviços neste local':first.name}).addTo(map).bindPopup(popup);
});
if(ordered&&points.length>1)L.polyline(points.map(p=>[p.latitude,p.longitude]),{color:'#E96108',dashArray:'5,8',weight:3}).addTo(map);
if(points.length){map.fitBounds(points.map(p=>[p.latitude,p.longitude]),{padding:[35,35],maxZoom:16});const legend=L.control({position:'bottomleft'});legend.onAdd=()=>{const el=L.DomUtil.create('div','legend');if(ordered){el.textContent='Sequência dos pontos informados';return el}const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Legenda do mapa';details.appendChild(summary);Array.from(new Set(points.map(p=>p.icon))).forEach(key=>{const kind=icons[key];const row=document.createElement('div');row.className='legend-row';const glyph=document.createElement('span');glyph.className='legend-icon';glyph.style.color=kind.color;glyph.innerHTML=kind.svg;const label=document.createElement('span');label.textContent=kind.name.split(' · ')[0];row.append(glyph,label);details.appendChild(row)});el.appendChild(details);L.DomEvent.disableClickPropagation(el);return el};legend.addTo(map)}else{const info=L.control({position:'bottomleft'});info.onAdd=()=>{const el=L.DomUtil.create('div','empty-message');el.textContent='Nenhum endereço localizado neste filtro.';return el};info.addTo(map)}
</script></body></html>`;
}
