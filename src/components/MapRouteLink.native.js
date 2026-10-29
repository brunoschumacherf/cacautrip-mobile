import React from 'react';
import { Linking } from 'react-native';
import { Button, Notice } from './ui';
import { useAction } from '../hooks/useResource';
export default function MapRouteLink({ action }) {
  const { run, busy, notice } = useAction();
  return <><Notice>{notice}</Notice><Button title={action.label} icon="navigate-outline" disabled={busy} onPress={() => run(() => Linking.openURL(action.url))} /></>;
}
