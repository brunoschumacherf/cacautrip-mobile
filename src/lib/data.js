export const asArray = value => Array.isArray(value) ? value : [];
export const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const errorText = error => error?.response?.data?.errors?.join('\n') || error?.response?.data?.error || (!error?.isAxiosError && error?.message) || 'Não foi possível completar a solicitação. Tente novamente.';

export function professional(value) {
  const data = asObject(value);
  return { ...data, name: data.name || 'Profissional', rating: number(data.rating), reviews_count: number(data.reviews_count),
    bookings_count: number(data.bookings_count), completed_count: number(data.completed_count), price: number(data.price),
    gross: number(data.gross), net: number(data.net), availability: asArray(data.availability), reviews: asArray(data.reviews), plan: data.plan || 'basic' };
}
export function normalizeUser(value) {
  const data = asObject(value);
  return { ...data, preferences: asObject(data.preferences), active_role: data.active_role || 'tourist',
    roles: asArray(data.roles).length ? data.roles : ['tourist'],
    guide_profile: data.guide_profile ? professional(data.guide_profile) : null,
    driver_profile: data.driver_profile ? professional(data.driver_profile) : null };
}
export function normalizeResource(path, payload, defaults) {
  const endpoint = path.split('?')[0];
  if (/^\/professional_profiles\/(guide|driver)\/\d+$/.test(endpoint)) return professional(payload);
  if (endpoint.startsWith('/professional_profiles/')) {
    if (!Array.isArray(payload)) throw new Error('A API retornou um formato inesperado para profissionais. Atualize o servidor.');
    return payload.map(professional);
  }
  if (Array.isArray(defaults)) {
    if (!Array.isArray(payload)) throw new Error('A API retornou uma lista inválida. Tente atualizar a página.');
    return payload.filter(item => item && typeof item === 'object');
  }
  if (defaults && typeof defaults === 'object') {
    const result = { ...defaults, ...asObject(payload) };
    Object.entries(defaults).forEach(([key, value]) => { if (Array.isArray(value)) result[key] = asArray(result[key]); });
    return result;
  }
  return payload ?? defaults;
}


