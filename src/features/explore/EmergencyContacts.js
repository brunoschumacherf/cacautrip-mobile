import React from 'react';
import { Linking, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Muted, Notice, Title } from '../../components/ui';
import { useAction } from '../../hooks/useResource';
import { colors } from '../../theme/tokens';
const contacts = [
  { name: 'Polícia Militar', number: '190', icon: 'shield-checkmark-outline', description: 'Ocorrências policiais e riscos à segurança.' },
  { name: 'SAMU', number: '192', icon: 'medical-outline', description: 'Atendimento de urgências médicas.' },
  { name: 'Corpo de Bombeiros', number: '193', icon: 'flame-outline', description: 'Incêndios, resgates e salvamentos.' },
];
export default function EmergencyContacts() {
  const { run, busy, notice } = useAction();
  return <View style={{ marginVertical: 16 }}><Title>Números de emergência</Title><Muted>Atendimento de emergência no Brasil.</Muted><Notice>{notice}</Notice>
    {contacts.map(item => <Card key={item.number} style={{ borderColor: '#E9C3B4' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 46, height: 46, backgroundColor: colors.dangerSurface, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={item.icon} size={24} color={colors.danger} /></View><View style={{ flex: 1 }}><Title>{item.name}</Title><Title>{item.number}</Title></View></View>
      <Muted>{item.description}</Muted><Button icon="call-outline" title={`Ligar ${item.number}`} disabled={busy} onPress={() => run(async () => {
        try { await Linking.openURL(`tel:${item.number}`); } catch { throw new Error('Não foi possível abrir o telefone. Digite o número exibido no discador.'); }
      })} />
    </Card>)}
  </View>;
}
