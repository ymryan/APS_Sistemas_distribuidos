// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (e) {
      Alert.alert('Erro', 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Ionicons name="cloud" size={60} color="#00D4FF" />
        <Text style={styles.title}>AirWatch</Text>
        <Text style={styles.subtitle}>Monitor de Qualidade do Ar</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor="#4A5568"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <View style={styles.senhaRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            placeholderTextColor="#4A5568"
            secureTextEntry={!showSenha}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowSenha(!showSenha)}
          >
            <Ionicons
              name={showSenha ? 'eye-off' : 'eye'}
              size={20}
              color="#4A5568"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.btnPrimaryText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            Não tem conta?{' '}
            <Text style={styles.linkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#00D4FF',
    marginTop: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  label: {
    color: '#A0AEC0',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#0A0E1A',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 10,
    color: '#FFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eyeBtn: {
    padding: 12,
    marginLeft: 8,
  },
  btnPrimary: {
    backgroundColor: '#00D4FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  btnPrimaryText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  linkText: {
    color: '#4A5568',
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    color: '#00D4FF',
    fontWeight: '600',
  },
});
