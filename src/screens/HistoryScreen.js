// src/screens/HistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getHistorico } from '../services/historyService';

function HistoryCard({ item }) {
  const date = item.criadoEm?.toDate?.() || new Date();
  const dia = date.toLocaleDateString('pt-BR');
  const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, { borderLeftColor: item.aqiColor }]}>
      <View style={styles.cardHeader}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#4A5568" />
          <Text style={styles.city}>{item.cidade}</Text>
        </View>
        <Text style={styles.date}>{dia} {hora}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.aqiBig, { color: item.aqiColor }]}>{item.aqi}</Text>
        <View>
          <Text style={[styles.aqiLabel, { color: item.aqiColor }]}>{item.aqiLabel}</Text>
          <Text style={styles.pm}>PM2.5: {item.components?.pm2_5} μg/m³</Text>
          <Text style={styles.pm}>PM10: {item.components?.pm10} μg/m³</Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await getHistorico();
    setHistorico(data);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, []));

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Consultas</Text>
        <Text style={styles.subtitle}>{historico.length} registros salvos no Firebase</Text>
      </View>

      {historico.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color="#1E2A3A" />
          <Text style={styles.emptyText}>Nenhuma consulta ainda.</Text>
          <Text style={styles.emptySubtext}>Acesse a tela Início para registrar.</Text>
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <HistoryCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4FF" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  center: { flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#4A5568', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: '#111827', borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderWidth: 1, borderColor: '#1E2A3A',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  city: { color: '#A0AEC0', fontSize: 13 },
  date: { color: '#4A5568', fontSize: 12 },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  aqiBig: { fontSize: 44, fontWeight: '800' },
  aqiLabel: { fontSize: 16, fontWeight: '700' },
  pm: { color: '#4A5568', fontSize: 12, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: '#A0AEC0', fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: '#4A5568', fontSize: 13 },
});
