export const resources = { trails: 'Trilhas dos guias', users: 'Usuários', guides: 'Guias', drivers: 'Motoristas', destinations: 'Destinos e serviços', emergency_points: 'Pontos de apoio', alerts: 'Alertas', reviews: 'Avaliações', reports: 'Denúncias', tickets: 'Suporte', subscriptions: 'Assinaturas', bookings: 'Reservas e pagamentos' };
export const forms = {
  destinations: { name: 'Nome', category: 'Categoria: praia, trilha, atração, passeio, restaurante ou pousada', city: 'Cidade', description: 'Descrição', image_url: 'URL da imagem', latitude: 'Latitude', longitude: 'Longitude', price: 'Preço (R$)', duration_minutes: 'Duração em minutos', opening_hours: 'Horários', rules: 'Regras', best_time: 'Melhor período', provider_id: 'ID do usuário prestador (opcional)', accessible: 'Acessível', guide_required: 'Guia obrigatório', active: 'Ativo' },
  emergency_points: { name: 'Nome da unidade', category: 'Tipo de unidade', phone: 'Telefone', address: 'Endereço', latitude: 'Latitude', longitude: 'Longitude' },
  alerts: { title: 'Título', body: 'Comunicado', kind: 'Tipo: clima, segurança ou condições', region: 'Região', source_url: 'Fonte oficial (https://...)', expires_at: 'Validade (AAAA-MM-DD HH:MM)' },
};
export const booleans = ['accessible', 'guide_required', 'active'];
export const numbers = ['latitude', 'longitude', 'price', 'duration_minutes', 'provider_id'];



