import React from 'react';
import { Text } from 'react-native';
import { Card, Empty, Muted, Title, money, statusLabel } from '../../components/ui';
import { asArray, professional } from '../../lib/data';

export default function Performance({ profiles = [] }) {
  const items = asArray(profiles).map(professional);
  if (!items.length) return <Empty>Seu desempenho aparecerá após o cadastro profissional.</Empty>;
  return items.map(item => (
    <Card key={item.type || item.id}>
      <Title>{statusLabel(item.type)} · ★ {item.rating.toFixed(1)}</Title>
      <Muted>{item.bookings_count} reservas · {item.completed_count} concluídas · {item.reviews_count} avaliações</Muted>
      <Text>Total recebido: {money(item.gross)}</Text><Muted>Líquido: {money(item.net)}</Muted>
      {item.reviews.length ? item.reviews.map(review => (
        <Card key={review.id}><Text>★ {review.rating} · {review.author || 'Viajante'}</Text><Muted>{review.comment}</Muted></Card>
      )) : <Muted>Você ainda não recebeu avaliações de serviços concluídos.</Muted>}
    </Card>
  ));
}

