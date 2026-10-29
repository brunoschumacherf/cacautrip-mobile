import BrandLogo from './BrandLogo';
import UserAvatar from './UserAvatar';
import React from 'react';
import { LocalizedText as Text } from '../i18n';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
import { colors, fonts } from '../theme/tokens';
import { useLanguage, locale } from '../i18n';
import LanguageSelector from '../i18n/LanguageSelector';
export { errorText } from '../lib/data';

export const money = value => Number(value || 0).toLocaleString(locale(), { style: 'currency', currency: 'BRL' });
export const statusLabel = value => ({ pending: 'Pendente', counteroffer: 'Nova proposta', pending_approval: 'Aguardando aceite', approved_waiting_payment: 'Aguardando pagamento', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado', rejected: 'Recusado', approved: 'Aprovado', refunded: 'Estornado', available: 'Disponível', published: 'Publicado', hidden: 'Oculto', paid: 'Pago', active: 'Ativo', answered: 'Respondido', open: 'Aberto', closed: 'Encerrado', resolved: 'Resolvido', dismissed: 'Arquivado', guide: 'Guia', driver: 'Motorista', tourist: 'Turista', basic: 'Básico', featured: 'Destaque', premium: 'Premium' }[value] || value || 'Não informado');
export function Button({ title, onPress, disabled = false, secondary = false, danger = false, icon }) {
  return (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, danger && s.danger, disabled && s.disabled]}>
      {Boolean(icon) && <Ionicons name={icon} size={18} color={secondary ? colors.brown : colors.white} />}
      <Text style={[s.buttonText, secondary && { color: colors.brown }]}>{title}</Text>
    </TouchableOpacity>
  );
}
export function Field({ label, hint, style, ...props }) {
  const { t } = useLanguage();
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput accessibilityLabel={t(label)} placeholderTextColor={colors.placeholder} style={[s.input, props.multiline && s.textarea, style]} {...props} placeholder={t(props.placeholder)} />
      {Boolean(hint) && <Muted>{hint}</Muted>}
    </View>
  );
}
export function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: !!value }} onPress={() => onChange(!value)} style={s.toggle}>
      <Text style={s.toggleLabel}>{label}</Text>
      <View style={[s.switchTrack, value && s.switchTrackActive]}><View style={[s.switchThumb, value && s.switchThumbActive]} /></View>
    </TouchableOpacity>
  );
}
export function Card({ children, style }) { return <View style={[s.card, style]}>{children}</View>; }
export function Title({ children, translate = true }) { return <Text translate={translate} style={s.title}>{children}</Text>; }
export function Muted({ children, translate = true }) { return <Text translate={translate} style={s.muted}>{children}</Text>; }
export function Notice({ children }) { return children ? <Text accessibilityRole="alert" style={s.notice}>{children}</Text> : null; }
export function Badge({ children }) { return <Text style={s.badge}>{children}</Text>; }
export function Section({ title, subtitle, children }) { return <View style={s.section}><Title>{title}</Title>{Boolean(subtitle) && <Muted>{subtitle}</Muted>}{children}</View>; }
export function Empty({ children = 'Nenhum registro por aqui ainda.' }) { return <Card><Ionicons name="leaf-outline" size={26} color={colors.orange} /><Muted>{children}</Muted></Card>; }
export function Photo({ uri }) {
  return uri ? <Image source={{ uri }} style={s.photo} accessibilityLabel="Foto do serviço" /> : <View style={[s.photo, s.placeholder]}><Ionicons name="leaf" size={34} color={colors.orange} /></View>;
}
export function Shortcut({ title, subtitle, icon, href, disabled = false }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={() => router.push(href)} style={[s.shortcut, disabled && s.disabled]}><View style={s.shortcutIcon}><Ionicons name={icon} size={24} color={colors.orange} /></View><Text style={[s.title, { fontSize: 17, lineHeight: 23 }]}>{title}</Text>{Boolean(subtitle) && <Muted>{subtitle}</Muted>}<Ionicons name="arrow-forward" size={18} color={colors.orange} /></TouchableOpacity>;
}
const touristNav = [ ['/', 'Explorar', 'compass-outline'], ['/roteiros', 'Roteiros', 'map-outline'], ['/sustentabilidade', 'Eco', 'leaf-outline'], ['/reservas', 'Reservas', 'calendar-outline'], ['/chat', 'Mensagens', 'chatbubbles-outline'], ['/perfil', 'Conta', 'person-outline'] ];
const professionalNav = [ ['/profissional', 'Painel', 'grid-outline'], ['/agenda', 'Agenda', 'calendar-outline'], ['/carteira', 'Carteira', 'wallet-outline'], ['/chat', 'Mensagens', 'chatbubbles-outline'], ['/perfil', 'Conta', 'person-outline'] ];
export function Page({ title, subtitle, children, loading = false, error, onRefresh, refreshing = false, scrollRef }) {
  const { user } = useSession();
  const { t } = useLanguage();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const navigation = user?.active_role === 'guide' || user?.active_role === 'driver' ? professionalNav : touristNav;
  const isMain = navigation.some(([href]) => href === path);
  return (
    <View style={s.page}>
      <View style={[s.top, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => router.replace(user?.active_role === 'tourist' ? '/' : '/profissional')}><View style={s.brandLockup}><BrandLogo /><Text style={s.brand}>CACAU TRIP</Text></View></TouchableOpacity>
        <View style={s.row}>
          <LanguageSelector compact />
          <TouchableOpacity accessibilityLabel={t('Notificações')} style={s.iconButton} onPress={() => router.push('/notificacoes')}><Ionicons name="notifications-outline" size={22} color={colors.orange} /></TouchableOpacity>
          <TouchableOpacity accessibilityLabel={t('Minha conta')} style={s.iconButton} onPress={() => router.push('/perfil')}><UserAvatar user={user} size={34} /></TouchableOpacity>
        </View>
      </View>
      {path !== '/emergencia' && (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('Abrir Emergência e pontos de apoio')} onPress={() => router.push('/emergencia')} style={s.emergencyAccess}>
          <View style={s.emergencyIcon}><Ionicons name="medical-outline" size={20} color={colors.danger} /></View>
          <Text style={s.emergencyLabel}>Emergência e pontos de apoio</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.danger} />
        </TouchableOpacity>
      )}
      <ScrollView ref={scrollRef} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange} /> : undefined}>
        {!isMain && <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}><Ionicons name="arrow-back" size={18} color={colors.orange} /><Text style={s.account}>Voltar</Text></TouchableOpacity>}
        <Text style={s.eyebrow}>{user?.active_role === 'tourist' ? 'COSTA DO CACAU · BAHIA' : `ÁREA ${statusLabel(user?.active_role).toUpperCase()}`}</Text>
        <Text style={s.heading}>{title}</Text>{Boolean(subtitle) && <Muted>{subtitle}</Muted>}
        <Notice>{error}</Notice>{loading && <ActivityIndicator style={{ margin: 20 }} color={colors.orange} />}{children}
      </ScrollView>
      <View style={s.navDock}><View style={[s.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {navigation.map(([href, label, icon]) => <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: path === href }} key={href} style={[s.navItem, path === href && s.navActive]} onPress={() => router.replace(href)}><Ionicons name={icon} size={22} color={path === href ? colors.white : colors.secondary} /><Text style={[s.navText, path === href && { color: colors.white }]}>{label}</Text></TouchableOpacity>)}
      </View></View>
    </View>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  top: { minHeight: 78, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, borderBottomWidth: 1, borderColor: colors.line },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.orange },
  brand: { fontFamily: fonts.heading, fontSize: 20, fontWeight: '800', letterSpacing: -.6, color: colors.brown },
  account: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, fontWeight: '700' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary, borderRadius: 20 },
  emergencyAccess: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, paddingHorizontal: 20, backgroundColor: colors.dangerSurface, borderBottomWidth: 1, borderBottomColor: colors.line },
  emergencyIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  emergencyLabel: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, fontWeight: '800', color: colors.danger },
  body: { padding: 20, paddingTop: 24, paddingBottom: 140, width: '100%', maxWidth: 1040, alignSelf: 'center' },
  back: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10, alignSelf: 'flex-start', paddingVertical: 6 },
  eyebrow: { fontFamily: fonts.body, letterSpacing: 1.2, fontSize: 11, color: colors.orange, marginVertical: 10, fontWeight: '800' },
  heading: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 41, fontWeight: '800', letterSpacing: -1.15, color: colors.brown, marginBottom: 6 },
  title: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 27, fontWeight: '800', letterSpacing: -.45, color: colors.brown, marginBottom: 9 },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 21, marginBottom: 9 },
  card: { backgroundColor: colors.paper, padding: 22, borderRadius: 24, borderWidth: 1, borderColor: '#F1E8DC', marginTop: 16, boxShadow: '0px 6px 18px -6px rgba(57,30,22,0.10)' },
  section: { marginTop: 28 },
  button: { minHeight: 50, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: colors.orange, borderRadius: 20, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secondary: { minHeight: 44, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.secondary, borderRadius: 16 },
  danger: { backgroundColor: colors.danger }, disabled: { opacity: .45 },
  buttonText: { fontFamily: fonts.body, color: colors.white, fontSize: 14, lineHeight: 20, fontWeight: '800', textAlign: 'center' },
  field: { marginBottom: 16 },
  input: { fontFamily: fonts.body, fontSize: 14, minHeight: 50, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 13, color: colors.brown },
  textarea: { minHeight: 108, lineHeight: 23, textAlignVertical: 'top' },
  label: { fontFamily: fonts.body, color: colors.brown, fontSize: 13, fontWeight: '800', marginBottom: 10, marginTop: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 54, borderTopWidth: 1, borderColor: colors.line, paddingTop: 16, paddingBottom: 6, marginTop: 12 },
  toggleLabel: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.brown, fontWeight: '500' },
  switchTrack: { width: 42, height: 24, borderRadius: 20, backgroundColor: '#CDBAAD', padding: 3, justifyContent: 'center' },
  switchTrackActive: { backgroundColor: colors.green },
  switchThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white, transform: [{ translateX: 0 }] },
  switchThumbActive: { transform: [{ translateX: 18 }] },
  notice: { fontFamily: fonts.body, fontSize: 13, lineHeight: 21, padding: 17, borderRadius: 18, backgroundColor: colors.success, color: colors.green, marginVertical: 14 },
  badge: { fontFamily: fonts.body, color: colors.orange, backgroundColor: colors.peach, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, alignSelf: 'flex-start', marginBottom: 10, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  photo: { width: '100%', height: 190, borderRadius: 18, marginBottom: 16, backgroundColor: colors.secondary },
  placeholder: { height: 112, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.peach },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  shortcut: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, padding: 20, borderRadius: 20, gap: 8, boxShadow: '0px 5px 15px rgba(57,30,22,0.035)' },
  shortcutIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  navDock: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center', paddingHorizontal: 12 },
  nav: { flexDirection: 'row', width: '100%', maxWidth: 560, padding: 8, gap: 4, borderRadius: 22, backgroundColor: colors.brown, boxShadow: '0px 5px 20px rgba(57,30,22,0.18)' },
  navItem: { flex: 1, minHeight: 54, gap: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, paddingVertical: 9, borderRadius: 15 },
  navActive: { backgroundColor: colors.orange },
  navText: { fontFamily: fonts.body, fontSize: 10, lineHeight: 14, fontWeight: '600', color: colors.secondary },
});





