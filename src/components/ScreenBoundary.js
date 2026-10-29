import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
export default class ScreenBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <View style={{ flex: 1, backgroundColor: '#FBF5EB', padding: 28, justifyContent: 'center' }}><Text style={{ fontSize: 23, color: '#391E16', fontWeight: '700' }}>Não foi possível abrir esta tela.</Text><Text style={{ marginVertical: 14, color: '#786257' }}>Seus dados continuam salvos. Tente abrir novamente.</Text><TouchableOpacity onPress={() => this.setState({ failed: false })} style={{ backgroundColor: '#E96108', padding: 16, borderRadius: 16 }}><Text style={{ color: '#FFFCF8', textAlign: 'center' }}>Tentar novamente</Text></TouchableOpacity></View>;
  }
}


