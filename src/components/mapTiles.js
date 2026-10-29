export function mapTiles() {
  const custom = process.env.EXPO_PUBLIC_MAP_TILE_URL;
  const attribution = process.env.EXPO_PUBLIC_MAP_TILE_ATTRIBUTION;
  if (custom && !attribution) throw new Error('Configure a atribuição exigida pelo provedor de mapas em EXPO_PUBLIC_MAP_TILE_ATTRIBUTION.');
  return {
    url: custom || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    maxZoom: 19,
    // Referência real da página. Não define cabeçalhos falsos nem ignora cache.
    referrerPolicy: 'strict-origin-when-cross-origin',
    updateWhenIdle: true,
    keepBuffer: 1,
  };
}
