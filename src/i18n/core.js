import catalog from './catalog.json';
export const languages = [{ code: 'pt-BR', label: 'Português', short: 'PT' }, { code: 'en', label: 'English', short: 'EN' }, { code: 'es', label: 'Español', short: 'ES' }];
let currentLanguage = 'pt-BR';
export const locale = () => ({ 'pt-BR': 'pt-BR', en: 'en-US', es: 'es-ES' }[currentLanguage]);
export function activateLanguage(language) { currentLanguage = languages.some(item => item.code === language) ? language : 'pt-BR'; }
const patterns = [
  [/^Ligar (.+)$/, 'Call {0}', 'Llamar {0}'],
  [/^Pagamento da reserva #(\d+)$/, 'Payment for booking #{0}', 'Pago de la reserva #{0}'],
  [/^Pagamento Pix · Referência #(\d+)$/, 'Pix payment · Reference #{0}', 'Pago Pix · Referencia #{0}'],
  [/^(\d+) avaliações$/, '{0} reviews', '{0} valoraciones'],
  [/^(\d+) pontos$/, '{0} points', '{0} puntos'],
  [/^(\d+) vagas$/, '{0} spots', '{0} plazas'],
  [/^(\d+) pessoas$/, '{0} people', '{0} personas'],
  [/^Disponível: (.+)$/, 'Available: {0}', 'Disponible: {0}'],
  [/^Comprovante: (.+)$/, 'Receipt: {0}', 'Comprobante: {0}'],
  [/^Solicitado em (.+)$/, 'Requested on {0}', 'Solicitado el {0}'],
  [/^Olá, (.+)\.$/, 'Hello, {0}.', 'Hola, {0}.'],
  [/^ÁREA (.+)$/, '{0} AREA', 'ÁREA DE {0}'],
  [/^Atendimento #(\d+)$/, 'Support request #{0}', 'Solicitud de soporte #{0}'],
  [/^Reserva #(\d+)$/, 'Booking #{0}', 'Reserva #{0}'],
  [/^(\d+) locais e serviços no mapa$/, '{0} places and services on the map', '{0} lugares y servicios en el mapa'],
  [/^(\d+) endereço\(s\) ainda sem localização confirmada\. As localizações encontradas são atualizadas automaticamente\.$/, '{0} address(es) still awaiting a confirmed location. Newly located places are updated automatically.', '{0} dirección(es) aún sin ubicación confirmada. Las ubicaciones encontradas se actualizan automáticamente.'],
  [/^Página (\d+) de (\d+)$/, 'Page {0} of {1}', 'Página {0} de {1}'],
  [/^(\d+) vagas disponíveis$/, '{0} spots available', '{0} plazas disponibles'],
  [/^(\d+) participantes$/, '{0} participants', '{0} participantes'],
  [/^A partir de (.+)$/, 'From {0}', 'Desde {0}'],
  [/^Contato: (.+)$/, 'Contact: {0}', 'Contacto: {0}'],
  [/^(\d+) serviços neste local$/, '{0} services at this location', '{0} servicios en este lugar'],
];
export function translate(value, language = currentLanguage) {
  if (typeof value !== 'string' || language === 'pt-BR' || !value.trim()) return value;
  const index = language === 'en' ? 0 : 1;
  const text = value.trim();
  const direct = catalog[text]?.[index];
  if (direct) return value.replace(text, () => direct);
  for (const [regex, english, spanish] of patterns) {
    const match = text.match(regex);
    if (match) return value.replace(text, () => (index === 0 ? english : spanish).replace(/\{(\d+)\}/g, (_, position) => match[Number(position) + 1]));
  }
  // Optional UI punctuation, selection marks and numeric filter counts.
  const decorated = text.match(/^(✓\s*)?(.+?)(\s*\(\d+\)|[.:])?$/);
  if (decorated && catalog[decorated[2]]?.[index]) return value.replace(text, () => `${decorated[1] || ''}${catalog[decorated[2]][index]}${decorated[3] || ''}`);
  if (text.includes(' · ')) {
    const parts = text.split(' · ').map(part => translate(part, language));
    if (parts.join(' · ') !== text) return value.replace(text, () => parts.join(' · '));
  }
  const label = text.match(/^([^:]+): (.+)$/);
  if (label && catalog[label[1]]?.[index]) return value.replace(text, () => `${catalog[label[1]][index]}: ${label[2]}`);
  return value;
}


