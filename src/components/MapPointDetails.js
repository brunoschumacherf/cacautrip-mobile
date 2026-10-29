import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Muted, Notice, Photo, Title } from './ui';
import MapRouteLink from './MapRouteLink';
import { mapDetailRoute, mapDirections } from './mapActions';

// Uma única Modal para lista e detalhes, inclusive no iOS: não empilha apresentações.
export default function MapPointDetails({ point, origin = null, choices = [], onSelect, onBack, onClose }) {
  if (!point && !choices.length) return null;
  const directions = point ? mapDirections(point, origin) : null;
  const route = point ? mapDetailRoute(point) : null;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#391E1680', padding: 20 }}>
      <ScrollView style={{ width: '100%', maxWidth: 520, maxHeight: '90%', alignSelf: 'center', borderRadius: 24, backgroundColor: '#FFFCF8' }} contentContainerStyle={{ padding: 24 }}>
        {!point ? <><Title>Locais e serviços neste mapa</Title><Muted>Escolha um local para ver detalhes e abrir a rota.</Muted>
          {choices.map((item, index) => <View key={`${item.id || item.name}-${index}`} style={{ marginVertical: 8 }}><Button secondary title={item.name || item.title || `Local ${index + 1}`} onPress={() => onSelect(item)} /><Muted>{item.address || item.city}</Muted></View>)}
        </> : <>
          {Boolean(point.image_url) && <Photo uri={point.image_url} />}
          {Boolean(point.category || point.kind) && <Badge>{point.category || ({ destination: 'Destino', trail: 'Trilha guiada', guide: 'Guia', driver: 'Motorista', collection: 'Ponto de coleta', partner: 'Parceiro', emergency: 'Emergência e apoio' }[point.kind] || 'Local')}</Badge>}
          <Title>{point.name || point.title || 'Detalhes do local'}</Title>
          {Boolean(point.description) && <Muted translate={false}>{point.description}</Muted>}
          {Boolean(point.address) && <><Title>Endereço</Title><Muted translate={false}>{point.address}</Muted></>}
          {Boolean(point.city) && point.city !== point.address && <Muted translate={false}>{point.city}</Muted>}
          {Boolean(point.opening_hours) && <><Title>Horário informado</Title><Muted>{point.opening_hours}</Muted></>}
          {Boolean(point.materials) && <><Title>Materiais aceitos</Title><Muted>{point.materials}</Muted></>}
          {Boolean(point.phone) && <><Title>Contato</Title><Muted>{point.phone}</Muted></>}
          {Boolean(point.note || point.approximate || point.geocoding_approximate) && <Notice>{point.note || 'Localização aproximada: confira o endereço antes de iniciar o deslocamento.'}</Notice>}
          {directions && <MapRouteLink action={directions} />}
          {route && <Button secondary title={['guide', 'driver'].includes(point.kind) ? 'Ver perfil e contratar' : 'Ver página completa'} icon="open-outline" onPress={() => { onClose(); router.push(route); }} />}
          {choices.length > 1 && <Button secondary title="Voltar à lista de locais" onPress={onBack} />}
        </>}
        <Button secondary title="Fechar" onPress={onClose} />
      </ScrollView>
    </View>
  </Modal>;
}

