// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { fetchAirQuality, fetchCityName, fetchAirQualityForecast } from '../services/airQualityService';
import { saveConsulta } from '../services/historyService';

function PollutantCard({ label, value, unit, safe }) {
  return (
    <View style={[styles.pollutantCard, { borderColor: safe ? '#1E2A3A' : '#F44336' }]}>
      <Text style={styles.pollutantLabel}>{label}</Text>
      <Text style={[styles.pollutantValue, { color: safe ? '#00D4FF' : '#F44336' }]}>
        {value}
      </Text>
      <Text style={styles.pollutantUnit}>{unit}</Text>
    </View>
  );
}

function ForecastItem({ item }) {
  const hora = item.dt.getHours().toString().padStart(2, '0') + 'h';
  return (
    <View style={styles.forecastItem}>
      <Text style={styles.forecastHora}>{hora}</Text>
      <View style={[styles.forecastDot, { backgroundColor: item.info.color }]} />
      <Text style={[styles.forecastLabel, { color: item.info.color }]}>{item.info.label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coords, setCoords] = useState(null);

  async function loadData(lat, lon, save = false) {
    try {
      const [airData, cityName, forecastData] = await Promise.all([
        fetchAirQuality(lat, lon),
        fetchCityName(lat, lon),
        fetchAirQualityForecast(lat, lon),
      ]);

      setData(airData);
      setCity(cityName);
      setForecast(forecastData);

      if (save) {
        await saveConsulta({ ...airData, cidade: cityName, lat, lon });
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível buscar os dados. Verifique sua API Key.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function requestLocation() {
    setLoading(true);

    // Fallback: São Paulo (usado quando GPS falha no emulador)
    const DEFAULT_LAT = -23.5505;
    const DEFAULT_LON = -46.6333;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let latitude = DEFAULT_LAT;
      let longitude = DEFAULT_LON;

      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeInterval: 5000,
          });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        } catch (gpsError) {
          // GPS indisponível no emulador: usa São Paulo como padrão
          console.warn('GPS indisponível, usando localização padrão (São Paulo).');
        }
      }

      setCoords({ latitude, longitude });
      await loadData(latitude, longitude, true);
    } catch (e) {
      setCoords({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
      await loadData(DEFAULT_LAT, DEFAULT_LON, true);
    }
  }

  const onRefresh = useCallback(async () => {
    if (!coords) return;
    setRefreshing(true);
    await loadData(coords.latitude, coords.longitude, true);
  }, [coords]);

  useEffect(() => {
    requestLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text style={styles.loadingText}>Obtendo localização e dados do ar...</Text>
      </View>
    );
  }

  if (!data) return null;

  const { aqi, info, components } = data;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4FF" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#4A5568" />
            <Text style={styles.cityText}>{city}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#00D4FF" />
        </TouchableOpacity>
      </View>

      {/* AQI Principal */}
      <View style={[styles.aqiCard, { backgroundColor: info.bg, borderColor: info.color }]}>
        <Ionicons name={info.icon} size={48} color={info.color} />
        <Text style={[styles.aqiNumber, { color: info.color }]}>{aqi}</Text>
        <Text style={styles.aqiIndexLabel}>Índice AQI</Text>
        <Text style={[styles.aqiLabel, { color: info.color }]}>{info.label}</Text>
        <Text style={styles.aqiDesc}>{info.description}</Text>
      </View>

      {/* Poluentes */}
      <Text style={styles.sectionTitle}>Poluentes Detectados</Text>
      <View style={styles.pollutantsGrid}>
        <PollutantCard label="PM2.5" value={components.pm2_5} unit="μg/m³" safe={parseFloat(components.pm2_5) <= 12} />
        <PollutantCard label="PM10" value={components.pm10} unit="μg/m³" safe={parseFloat(components.pm10) <= 54} />
        <PollutantCard label="CO" value={components.co} unit="μg/m³" safe={parseFloat(components.co) <= 4400} />
        <PollutantCard label="NO₂" value={components.no2} unit="μg/m³" safe={parseFloat(components.no2) <= 100} />
        <PollutantCard label="O₃" value={components.o3} unit="μg/m³" safe={parseFloat(components.o3) <= 120} />
        <PollutantCard label="SO₂" value={components.so2} unit="μg/m³" safe={parseFloat(components.so2) <= 20} />
      </View>

      {/* Previsão */}
      <Text style={styles.sectionTitle}>Previsão próximas horas</Text>
      <View style={styles.forecastCard}>
        {forecast.map((item, i) => (
          <ForecastItem key={i} item={item} />
        ))}
      </View>

      {/* Legenda */}
      <Text style={styles.sectionTitle}>Legenda AQI</Text>
      <View style={styles.legendCard}>
        {[1, 2, 3, 4, 5].map((n) => {
          const AQI_INFO = require('../services/airQualityService').AQI_INFO;
          const info = AQI_INFO[n];
          return (
            <View key={n} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: info.color }]} />
              <Text style={styles.legendLabel}>{n} - {info.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A', paddingHorizontal: 20 },
  center: { flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#4A5568', marginTop: 12, fontSize: 14 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 60, paddingBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cityText: { color: '#4A5568', fontSize: 13, marginLeft: 4 },
  refreshBtn: {
    backgroundColor: '#111827', padding: 10,
    borderRadius: 12, borderWidth: 1, borderColor: '#1E2A3A',
  },
  aqiCard: {
    borderRadius: 20, padding: 28, alignItems: 'center',
    borderWidth: 1, marginBottom: 24,
  },
  aqiNumber: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  aqiIndexLabel: { color: '#4A5568', fontSize: 13, marginTop: -4 },
  aqiLabel: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  aqiDesc: { color: '#A0AEC0', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  sectionTitle: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 12, marginTop: 4 },
  pollutantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  pollutantCard: {
    width: '30%', backgroundColor: '#111827', borderRadius: 14,
    padding: 14, alignItems: 'center', borderWidth: 1, flex: 1,
  },
  pollutantLabel: { color: '#4A5568', fontSize: 12, marginBottom: 6 },
  pollutantValue: { fontSize: 20, fontWeight: '700' },
  pollutantUnit: { color: '#4A5568', fontSize: 10, marginTop: 2 },
  forecastCard: {
    backgroundColor: '#111827', borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-around',
    borderWidth: 1, borderColor: '#1E2A3A', marginBottom: 24,
  },
  forecastItem: { alignItems: 'center', gap: 6 },
  forecastHora: { color: '#A0AEC0', fontSize: 13 },
  forecastDot: { width: 10, height: 10, borderRadius: 5 },
  forecastLabel: { fontSize: 11, fontWeight: '600' },
  legendCard: {
    backgroundColor: '#111827', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#1E2A3A', gap: 10,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { color: '#A0AEC0', fontSize: 14 },
});
