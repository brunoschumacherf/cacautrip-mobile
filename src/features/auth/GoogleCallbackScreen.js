import { useLanguage } from '../../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Muted, Notice, Title } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { googlePending } from '../../services/googleAuth';
import { colors } from '../../theme/tokens';

const errors = {
  cancelled: 'Você cancelou o acesso com Google. Pode tentar novamente quando quiser.',
  account_exists: 'Este e-mail já tem uma conta. Entre com sua senha e vá em Minha conta para vincular o Google.',
  invalid_identity: 'Não foi possível confirmar sua conta Google. Tente novamente.',
};

export default function GoogleCallbackScreen() {
  useLanguage();
  const params = useLocalSearchParams();
  const { finishGoogle, user } = useSession();
  const [error, setError] = useState('');
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const complete = async () => {
      if (params.error) throw new Error(errors[params.error] || errors.invalid_identity);
      const pending = await googlePending.get();
      if (!pending || pending.flowId !== String(params.flow) || Date.now() - pending.startedAt > 10 * 60 * 1000 || typeof params.code !== 'string') {
        throw new Error('Esta solicitação expirou. Volte e inicie o acesso com Google novamente.');
      }
      const profile = await finishGoogle({ code: params.code, flow_id: pending.flowId, exchange_secret: pending.secret });
      await googlePending.clear();
      router.replace(profile.active_role === 'tourist' ? '/' : '/profissional');
    };
    complete().catch(failure => {
      setError(failure.response?.data?.error || failure.message || 'Não foi possível entrar com Google.');
    });
  }, [finishGoogle, params.code, params.error, params.flow]);
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 26, backgroundColor: colors.background }}>
    <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center' }}>
      <Title>{error ? 'Acesso com Google' : 'Entrando na sua conta…'}</Title>
      {error ? <><Notice>{error}</Notice><Button title={user ? 'Voltar para Minha conta' : 'Voltar para entrar'} onPress={() => router.replace(user ? '/perfil' : '/login')} /></>
        : <><ActivityIndicator color={colors.orange} /><Muted>Aguarde enquanto confirmamos seu acesso.</Muted></>}
    </View>
  </ScrollView>;
}
