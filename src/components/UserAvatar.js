import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useLanguage } from '../i18n';
import { colors } from '../theme/tokens';
export default function UserAvatar({ user, size = 88 }) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState('');
  const path = user?.avatar_url;
  const uri = path ? (/^https?:\/\//.test(path) ? path : `${String(api.defaults.baseURL).replace(/\/$/, '')}/${path.replace(/^\//, '')}`) : null;
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.line }}>
    {uri && uri !== failed ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" accessibilityLabel={t('Foto do perfil')} onError={() => setFailed(uri)} /> : <Ionicons name="person-outline" size={size * 0.44} color={colors.orange} />}
  </View>;
}
