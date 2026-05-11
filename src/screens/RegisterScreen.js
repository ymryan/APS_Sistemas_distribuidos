// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !senha || !confirma) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirma) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await updateProfile(cred.user, { displayName: nome });
    } catch (e) {
      Alert.alert('Erro', e.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está cadastrado.'
        : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#00D4FF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="person-add" size={40} color="#00D4FF" />
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Monitore o ar da sua cidade</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Nome completo', value: nome, setter: setNome, placeholder: 'Seu nome', type: 'default' },
            { label: 'E-mail', value: email, setter: setEmail, placeholder: 'seu@email.com', type: 'email-address' },
            { label: 'Senha', value: senha, setter: setSenha, placeholder: '••••••••', type: 'default', secure: true },
            { label: 'Confirmar senha', value: confirma, setter: setConfirma, placeholder: '••••••••', type: 'default', secure: true },
          ].map(({ label, value, setter, placeholder, type, secure }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor="#4A5568"
                keyboardType={type}
                autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                secureTextEntry={secure}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.btnPrimaryText}>Cadastrar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', paddingHorizontal: 28 },
  backBtn: { marginTop: 60, marginBottom: 10 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#4A5568', marginTop: 4 },
  form: {
    backgroundColor: '#111827', borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#1E2A3A',
  },
  label: { color: '#A0AEC0', fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#0A0E1A', borderWidth: 1, borderColor: '#1E2A3A',
    borderRadius: 10, color: '#FFF', fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  btnPrimary: {
    backgroundColor: '#00D4FF', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  btnPrimaryText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
