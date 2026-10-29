export function mapDirections(point, origin = null) {
  const area = ['guide', 'driver'].includes(point.kind);
  const address = String(point.address || point.city || '').trim();
  const lat = point.latitude, lon = point.longitude;
  const coordinates = lat != null && lon != null && lat !== '' && lon !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));
  const approximate = point.approximate || point.geocoding_approximate;
  let destination = coordinates && !approximate ? `${Number(lat)},${Number(lon)}` : address;
  if (area) destination = String(point.city || address).replace(/^Área de atendimento:\s*/i, '');
  else if (approximate && point.kind === 'destination') destination = [point.name, address].filter(Boolean).join(', ');
  if (!destination && coordinates) destination = `${Number(lat)},${Number(lon)}`;
  if (!destination) return null;
  const query = encodeURIComponent(destination.slice(0, 180));
  const start = origin && Number.isFinite(origin.latitude) && Number.isFinite(origin.longitude) ? `&origin=${encodeURIComponent(`${origin.latitude},${origin.longitude}`)}` : '';
  return { url: area ? `https://www.google.com/maps/search/?api=1&query=${query}` : `https://www.google.com/maps/dir/?api=1&destination=${query}${start}`,
    label: area ? 'Ver área no Google Maps' : 'Traçar rota no Google Maps' };
}
export function mapDetailRoute(point) {
  const match = String(point.id || '').match(/^(destination|trail|guide|driver):(\d+)$/);
  if (!match) return null;
  const [, kind, id] = match;
  return { destination: `/destinos/${id}`, trail: `/trilhas/${id}`, guide: `/servico/guide/${id}`, driver: `/servico/driver/${id}` }[kind];
}

