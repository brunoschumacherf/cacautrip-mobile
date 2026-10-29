import React from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
export { errorText } from '../lib/data';

export const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const statusLabel = value => ({ pending: 'Pendente', counteroffer: 'Nova proposta', pending_approval: 'Aguardando aceite', approved_waiting_payment: 'Aguardando pagamento', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado', rejected: 'Recusado', approved: 'Aprovado', refunded: 'Estornado', available: 'Disponível', published: 'Publicado', hidden: 'Oculto', paid: 'Pago', active: 'Ativo', answered: 'Respondido', open: 'Aberto', closed: 'Encerrado', resolved: 'Resolvido', dismissed: 'Arquivado', guide: 'Guia', driver: 'Motorista', tourist: 'Turista', basic: 'Básico', featured: 'Destaque', premium: 'Premium' }[value] || value || 'Não informado');
export function Button({ title, onPress, disabled = false, secondary = false, danger = false, icon }) {
  return (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, danger && s.danger, disabled && s.disabled]}>
      {icon && <Ionicons name={icon} size={18} color={secondary ? '#225641' : '#fff'} />}
      <Text style={[s.buttonText, secondary && { color: '#225641' }]}>{title}</Text>
    </TouchableOpacity>
  );
}
export function Field({ label, hint, style, ...props }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor="#829087" style={[s.input, props.multiline && s.textarea, style]} {...props} />
      {hint && <Muted>{hint}</Muted>}
    </View>
  );
}
export function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: !!value }} onPress={() => onChange(!value)} style={s.toggle}>
      <Ionicons name={value ? 'checkbox' : 'square-outline'} size={22} color="#285b42" /><Text style={{ flex: 1, color: '#304f3d' }}>{label}</Text>
    </TouchableOpacity>
  );
}
export function Card({ children, style }) { return <View style={[s.card, style]}>{children}</View>; }
export function Title({ children }) { return <Text style={s.title}>{children}</Text>; }
export function Muted({ children }) { return <Text style={s.muted}>{children}</Text>; }
export function Notice({ children }) { return children ? <Text accessibilityRole="alert" style={s.notice}>{children}</Text> : null; }
export function Badge({ children }) { return <Text style={s.badge}>{children}</Text>; }
export function Section({ title, subtitle, children }) { return <View style={s.section}><Title>{title}</Title>{subtitle && <Muted>{subtitle}</Muted>}{children}</View>; }
export function Empty({ children = 'Nenhum registro por aqui ainda.' }) { return <Card><Ionicons name="leaf-outline" size={26} color="#759279" /><Muted>{children}</Muted></Card>; }
export function Photo({ uri }) {
  return uri ? <Image source={{ uri }} style={s.photo} accessibilityLabel="Foto do serviço" /> : <View style={[s.photo, s.placeholder]}><Ionicons name="leaf" size={34} color="#759279" /></View>;
}
export function Shortcut({ title, subtitle, icon, href }) {
  return <TouchableOpacity accessibilityRole="button" onPress={() => router.push(href)} style={s.shortcut}><Ionicons name={icon} size={24} color="#285b42" /><Text style={s.title}>{title}</Text>{subtitle && <Muted>{subtitle}</Muted>}<Ionicons name="arrow-forward" size={18} color="#8b794c" /></TouchableOpacity>;
}
const touristNav = [ ['/', 'Explorar', 'compass-outline'], ['/roteiros', 'Roteiros', 'map-outline'], ['/reservas', 'Reservas', 'calendar-outline'], ['/chat', 'Mensagens', 'chatbubbles-outline'], ['/perfil', 'Conta', 'person-outline'] ];
const professionalNav = [ ['/profissional', 'Painel', 'grid-outline'], ['/agenda', 'Agenda', 'calendar-outline'], ['/carteira', 'Carteira', 'wallet-outline'], ['/chat', 'Mensagens', 'chatbubbles-outline'], ['/perfil', 'Conta', 'person-outline'] ];
export function Page({ title, subtitle, children, loading = false, error, onRefresh, refreshing = false }) {
  const { user } = useSession();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const navigation = user?.active_role === 'guide' || user?.active_role === 'driver' ? professionalNav : touristNav;
  const isMain = navigation.some(([href]) => href === path);
  return (
    <View style={s.page}>
      <View style={[s.top, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => router.replace(user?.active_role === 'tourist' ? '/' : '/profissional')}><Text style={s.brand}>cacautrip<Text style={{ color: '#c68936' }}>.</Text></Text></TouchableOpacity>
        <View style={s.row}>
          <TouchableOpacity accessibilityLabel="Notificações" style={s.iconButton} onPress={() => router.push('/notificacoes')}><Ionicons name="notifications-outline" size={22} color="#285b42" /></TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Minha conta" style={s.iconButton} onPress={() => router.push('/perfil')}><Ionicons name="person-circle-outline" size={26} color="#285b42" /></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#285b42" /> : undefined}>
        {!isMain && <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}><Ionicons name="arrow-back" size={18} color="#285b42" /><Text style={s.account}>Voltar</Text></TouchableOpacity>}
        <Text style={s.eyebrow}>{user?.active_role === 'tourist' ? 'COSTA DO CACAU · BAHIA' : `ÁREA ${statusLabel(user?.active_role).toUpperCase()}`}</Text>
        <Text style={s.heading}>{title}</Text>{subtitle && <Muted>{subtitle}</Muted>}
        <Notice>{error}</Notice>{loading && <ActivityIndicator style={{ margin: 20 }} color="#225641" />}{children}
      </ScrollView>
      <View style={[s.nav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {navigation.map(([href, label, icon]) => <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: path === href }} key={href} style={s.navItem} onPress={() => router.replace(href)}><Ionicons name={icon} size={22} color={path === href ? '#285b42' : '#91a094'} /><Text style={[s.navText, path === href && { color: '#285b42' }]}>{label}</Text></TouchableOpacity>)}
      </View>
    </View>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f5ef' }, top: { paddingBottom: 12, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e3e7dc' },
  brand: { fontSize: 25, fontWeight: '900', color: '#214b39' }, account: { color: '#34634b', fontWeight: '600' }, iconButton: { padding: 6 },
  body: { padding: 20, paddingBottom: 36, width: '100%', maxWidth: 1060, alignSelf: 'center' }, back: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  eyebrow: { letterSpacing: 2, fontSize: 10, color: '#8b794c', marginVertical: 12, fontWeight: '700' }, heading: { fontSize: 30, fontWeight: '800', color: '#203f31', marginBottom: 8 }, title: { fontSize: 18, fontWeight: '700', color: '#214b39', marginBottom: 8 }, muted: { color: '#647165', lineHeight: 22, marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#e3e7dc', marginTop: 16 }, section: { marginTop: 24 },
  button: { padding: 14, backgroundColor: '#285b42', borderRadius: 11, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, secondary: { backgroundColor: '#eaf0e5' }, danger: { backgroundColor: '#a54135' }, disabled: { opacity: 0.45 }, buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  field: { marginBottom: 14 }, input: { backgroundColor: '#fafbf7', borderWidth: 1, borderColor: '#d9e1d4', borderRadius: 10, padding: 13, color: '#203f31' }, textarea: { minHeight: 96, textAlignVertical: 'top' }, label: { color: '#4a604e', fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  notice: { padding: 14, borderRadius: 10, backgroundColor: '#fff0ce', color: '#6d4d12', marginVertical: 12 }, badge: { color: '#285b42', backgroundColor: '#edf3e8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8, fontSize: 12, fontWeight: '600' },
  photo: { width: '100%', height: 190, borderRadius: 12, marginBottom: 14 }, placeholder: { height: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5efe4' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }, shortcut: { flexGrow: 1, flexBasis: 150, backgroundColor: '#fff', borderColor: '#e3e7dc', borderWidth: 1, padding: 18, borderRadius: 16, gap: 6 },
  nav: { flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderColor: '#e1e6da', backgroundColor: '#fff' }, navItem: { flex: 1, gap: 4, alignItems: 'center', padding: 4 }, navText: { fontSize: 10, fontWeight: '700', color: '#829087' },
});


