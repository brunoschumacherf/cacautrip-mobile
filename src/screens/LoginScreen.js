import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      Alert.alert('Sucesso', response.data.message);
      
      // Redireciona para a Home passando o objeto do usuário retornado pela API
      navigation.replace('Home', { user: response.data.user });
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao conectar com o servidor';
      Alert.alert('Erro no Login', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cacautrip</Text>
      <Text style={styles.subtitle}>Explore a Costa do Cacau</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9f9f9' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2d6a4f', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#52b788', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#2d6a4f', textAlign: 'center', marginTop: 8 }
});