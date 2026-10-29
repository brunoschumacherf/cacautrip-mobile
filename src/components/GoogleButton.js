import React from 'react';
import { Button, Muted, Notice } from './ui';
import { useAction } from '../hooks/useResource';
import { startGoogleSignIn } from '../services/googleAuth';

export default function GoogleButton({ linking = false, disabled = false }) {
  const { run, busy, notice } = useAction();
  return <>
    <Notice>{notice}</Notice>
    <Button secondary icon="logo-google" title={busy ? 'Abrindo Google…' : linking ? 'Vincular conta Google' : 'Continuar com Google'}
      disabled={disabled || busy} onPress={() => run(startGoogleSignIn)} />
    {!linking && <Muted>Use sua conta Google para entrar ou se cadastrar.</Muted>}
  </>;
}
