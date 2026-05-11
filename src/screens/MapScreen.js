// src/screens/MapScreen.js
// Versão simplificada sem react-native-maps (evita problemas no emulador)
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { fetchAirQuality, fetchCityName, AQI_INFO } from '../services/airQualityService';

const NEARBY_OFFSETS = [
  { name: 'Centro', dlat: 0.0, dlon: 0.0 },
  { name: 'Região Norte', dlat: 0.05, dlon: 0.0 },
  { name: 'Região Sul', dlat: -0.05, dlon: 0.0 },
  { name: 'Região Leste', dlat: 0.0, dlon: 0.06 },
  { name: 'Região Oeste', dlat: 0.0, dlon: -0.06 },
];

function RegionCard({ point }) {
  const info = AQI_INFO[point.aqi];
  return (
    <View style={[styles.card, { borderLeftColor: info.color }]}>
      <View style={styles.cardHeader}>
        <Ionicons name="location" size={16} color={info.color} />
        <Text style={styles.cardTitle}>{point.name}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.aqiNum, { color: info.color }]}>{point.aqi}</Text>
        <View>
          <Text style={[styles.aqiLabel, { color: info.color }]}>{info.label}</Text>
          <Text style={styles.cityText}>{point.cidade}</Text>
          <Text style={styles.desc}>{info.description}</Text>
        </View>
      </View>
      <View style={[styles.bar, { backgroundColor: info.color + '33' }]}>
        <View style={[styles.barFill, { width: `${(point.aqi / 5) * 100}%`, backgroundColor: info.color }]} />
      </View>
    </View>
  );
}

export default function MapScreen() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let baseLat = -23.5505;
      let baseLon = -46.6333;

      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          baseLat = loc.coords.latitude;
          baseLon = loc.coords.longitude;
        } catch (e) {
          console.warn('GPS indisponível, usando São Paulo.');
        }
      }

      const results = await Promise.all(
        NEARBY_OFFSETS.map(async (o) => {
          const lat = baseLat + o.dlat;
          const lon = baseLon + o.dlon;
          try {
            const aq = await fetchAirQuality(lat, lon);
            const cidade = await fetchCityName(lat, lon);
            return { name: o.name, aqi: aq.aqi, cidade, lat, lon };
          } catch {
            return null;
          }
        })
      );

      setPoints(results.filter(Boolean));
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text style={styles.loadingText}>Buscando dados das regiões...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Qualidade do Ar por Região</Text>
        <Text style={styles.subtitle}>Monitoramento distribuído em tempo real</Text>
      </View>

      {/* Legenda */}
      <View style={styles.legendRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <View key={n} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: AQI_INFO[n].color }]} />
            <Text style={styles.legendText}>{AQI_INFO[n].label}</Text>
          </View>
        ))}
      </View>

      {points.map((p, i) => (
        <RegionCard key={i} point={p} />
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', paddingHorizontal: 20, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#4A5568', marginTop: 12 },
  header: { paddingBottom: 20 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#4A5568', fontSize: 13, marginTop: 4 },
  legendRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#111827', borderRadius: 12, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: '#1E2A3A',
  },
  legendItem: { alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#4A5568', fontSize: 9 },
  card: {
    backgroundColor: '#111827', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#1E2A3A', borderLeftWidth: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  aqiNum: { fontSize: 48, fontWeight: '800' },
  aqiLabel: { fontSize: 18, fontWeight: '700' },
  cityText: { color: '#4A5568', fontSize: 12, marginTop: 2 },
  desc: { color: '#A0AEC0', fontSize: 11, marginTop: 4, maxWidth: 220, lineHeight: 16 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
