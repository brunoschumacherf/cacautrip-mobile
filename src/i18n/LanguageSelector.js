import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from './index';
import { languages } from './core';
import { colors } from '../theme/tokens';
export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, error, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const options = <View style={{ gap: 10 }}>
    <Text style={{ color: colors.brown, fontWeight: '700', fontSize: 15 }}>{t('Idioma')}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {languages.map(item => <TouchableOpacity key={item.code} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ checked: language === item.code }} onPress={() => { setLanguage(item.code); setOpen(false); }} style={{ minHeight: 44, paddingHorizontal: 13, justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: language === item.code ? colors.orange : colors.line, backgroundColor: language === item.code ? colors.orange : colors.paper }}>
        <Text style={{ fontWeight: '700', fontSize: 12, color: language === item.code ? colors.white : colors.brown }}>{item.label}</Text>
      </TouchableOpacity>)}
    </View>
    {Boolean(error) && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{t(error)}</Text>}
  </View>;
  if (!compact) return <View style={{ marginVertical: 14 }}>{options}</View>;
  return <View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('Idioma')} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={{ minHeight: 40, minWidth: 42, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.line }}><Text style={{ color: colors.brown, fontWeight: '700', fontSize: 12 }}>{languages.find(item => item.code === language)?.short || 'PT'} ▾</Text></TouchableOpacity>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#391E1680' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: colors.paper, borderRadius: 20, padding: 24, gap: 18 }}>{options}<TouchableOpacity accessibilityRole="button" onPress={() => setOpen(false)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.brown, fontWeight: '700' }}>{t('Fechar')}</Text></TouchableOpacity></View></View>
    </Modal>
  </View>;
}
