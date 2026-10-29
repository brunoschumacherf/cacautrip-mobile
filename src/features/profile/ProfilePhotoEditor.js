import React from 'react';
import { Platform, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import UserAvatar from '../../components/UserAvatar';
import { Button, Muted, Notice } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAction } from '../../hooks/useResource';
import api from '../../services/api';
export default function ProfilePhotoEditor() {
  const { user, refreshUser } = useSession();
  const { run, busy, notice, setNotice } = useAction();
  const choose = () => run(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize > 2 * 1024 * 1024) throw new Error('A foto deve ter no máximo 2 MB.');
    const body = new FormData();
    if (Platform.OS === 'web') {
      if (!asset.file) throw new Error('Não foi possível ler a foto selecionada.');
      body.append('photo', asset.file, asset.fileName || 'profile-photo.jpg');
    } else {
      body.append('photo', { uri: asset.uri, name: asset.fileName || 'profile-photo.jpg', type: asset.mimeType || 'image/jpeg' });
    }
    await api.patch('/me/avatar', body, { headers: { 'Content-Type': undefined } });
    await refreshUser(); setNotice('Foto do perfil atualizada.');
  });
  const remove = () => run(async () => { await api.delete('/me/avatar'); await refreshUser(); setNotice('Foto do perfil removida.'); });
  return <View style={{ alignItems: 'center', marginVertical: 14, gap: 8 }}>
    <UserAvatar user={user} size={96} />
    <Button secondary icon="camera-outline" title={busy ? 'Aguarde…' : user.avatar_url ? 'Trocar foto' : 'Adicionar foto'} onPress={choose} disabled={busy} />
    {Boolean(user.avatar_url) && <Button secondary title="Remover foto" icon="trash-outline" onPress={remove} disabled={busy} />}
    <Muted>JPG, PNG ou WebP. Até 2 MB.</Muted><Notice>{notice}</Notice>
  </View>;
}
