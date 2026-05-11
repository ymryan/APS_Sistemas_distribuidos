// src/services/historyService.js
// Versão local usando AsyncStorage (sem Firebase)
// Para migrar para Firebase futuramente: substitua pelas chamadas ao Firestore

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@airwatch_historico';

export async function saveConsulta(data) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const lista = raw ? JSON.parse(raw) : [];

    const nova = {
      id: Date.now().toString(),
      cidade: data.cidade,
      lat: data.lat,
      lon: data.lon,
      aqi: data.aqi,
      aqiLabel: data.info.label,
      aqiColor: data.info.color,
      components: data.components,
      criadoEm: new Date().toISOString(),
    };

    // Mantém no máximo 30 registros (mais recente primeiro)
    lista.unshift(nova);
    if (lista.length > 30) lista.pop();

    await AsyncStorage.setItem(KEY, JSON.stringify(lista));
  } catch (e) {
    console.warn('Erro ao salvar histórico:', e);
  }
}

export async function getHistorico(limitN = 20) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const lista = raw ? JSON.parse(raw) : [];
    // Converte criadoEm de string para Date para compatibilidade com a UI
    return lista.slice(0, limitN).map((item) => ({
      ...item,
      criadoEm: { toDate: () => new Date(item.criadoEm) },
    }));
  } catch (e) {
    console.warn('Erro ao ler histórico:', e);
    return [];
  }
}
