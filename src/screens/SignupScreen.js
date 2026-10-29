import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import api from '../services/api';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await api.post('/signup', { name, email, password });
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.');
      navigation.goBack();
    } catch (error) {
      const errors = error.response?.data?.errors?.join('\n') || 'Erro ao registrar';
      Alert.alert('Erro no Cadastro', errors);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Junte-se ao Cacautrip como Turista</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Senha (mínimo 6 caracteres)"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
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