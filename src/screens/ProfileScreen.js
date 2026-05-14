// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase desativado por enquanto — login/logout removidos

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#00D4FF" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.name}>AirWatch App</Text>
        <Text style={styles.email}>Monitor de Qualidade do Ar</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre o App</Text>
        <InfoRow icon="cloud" label="Aplicativo" value="AirWatch v1.0" />
        <InfoRow icon="school" label="Disciplina" value="Sistemas Distribuídos" />
        <InfoRow icon="business" label="Universidade" value="UNIP" />
        <InfoRow icon="code-slash" label="Tecnologias" value="React Native + AsyncStorage" />
        <InfoRow icon="server" label="API de Dados" value="OpenWeatherMap Air Pollution" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Grupo</Text>
        <InfoRow icon="person" label="Integrante 1" value="GUSTAVO MATOS DA COSTA — RA: N932341" />
        <InfoRow icon="person" label="Integrante 2" value="RYAN MAURICIO BATISTA SILVA — RA: N766212" />
        <InfoRow icon="person" label="Integrante 3" value="VÍTOR DE SOUZA SILVA — RA: N010FF0" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', paddingHorizontal: 20 },
  header: { paddingTop: 60, paddingBottom: 20 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  avatarCard: {
    backgroundColor: '#111827', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#1E2A3A',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#00D4FF33', borderWidth: 2, borderColor: '#00D4FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#00D4FF' },
  name: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  email: { color: '#4A5568', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#111827', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#1E2A3A',
  },
  cardTitle: { color: '#A0AEC0', fontSize: 13, fontWeight: '600', marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E2A3A',
  },
  infoText: { flex: 1 },
  infoLabel: { color: '#4A5568', fontSize: 12 },
  infoValue: { color: '#FFF', fontSize: 14, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#F4433622', borderRadius: 14,
    paddingVertical: 16, borderWidth: 1, borderColor: '#F44336',
  },
  logoutText: { color: '#F44336', fontWeight: '700', fontSize: 16 },
});
