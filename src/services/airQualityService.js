// src/services/airQualityService.js
// Usa a OpenWeatherMap Air Pollution API (gratuita)
// Cadastre-se em: https://openweathermap.org/api e gere sua API Key

const API_KEY = 'a36fa3085491b29fb5253fe9113b07a2';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Índice AQI: 1=Boa, 2=Regular, 3=Moderada, 4=Ruim, 5=Muito Ruim
export const AQI_INFO = {
  1: {
    label: 'Boa',
    description: 'A qualidade do ar é satisfatória e a poluição representa pouco ou nenhum risco.',
    color: '#00E676',
    bg: '#003300',
    icon: 'leaf',
  },
  2: {
    label: 'Regular',
    description: 'Aceitável, porém pode haver risco para pessoas muito sensíveis à poluição.',
    color: '#FFEB3B',
    bg: '#332900',
    icon: 'partly-sunny',
  },
  3: {
    label: 'Moderada',
    description: 'Membros de grupos sensíveis podem sentir efeitos. Evite atividades ao ar livre.',
    color: '#FF9800',
    bg: '#331A00',
    icon: 'cloudy',
  },
  4: {
    label: 'Ruim',
    description: 'Todos podem começar a sentir efeitos na saúde. Grupos sensíveis: risco sério.',
    color: '#F44336',
    bg: '#330000',
    icon: 'warning',
  },
  5: {
    label: 'Muito Ruim',
    description: 'Alerta de saúde: todos podem sentir efeitos graves. Evite sair de casa.',
    color: '#9C27B0',
    bg: '#1A0033',
    icon: 'skull',
  },
};

export async function fetchAirQuality(lat, lon) {
  const url = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('STATUS:', response.status);
  console.log('RESPOSTA:', JSON.stringify(data));
  if (!response.ok) throw new Error('Erro ao buscar dados de qualidade do ar');

  const item = data.list[0];
  const aqi = item.main.aqi;
  const components = item.components;

  return {
    aqi,
    info: AQI_INFO[aqi],
    components: {
      co: components.co.toFixed(1),
      no2: components.no2.toFixed(1),
      o3: components.o3.toFixed(1),
      pm2_5: components.pm2_5.toFixed(1),
      pm10: components.pm10.toFixed(1),
      so2: components.so2.toFixed(1),
    },
    timestamp: new Date(),
  };
}

export async function fetchAirQualityForecast(lat, lon) {
  const url = `${BASE_URL}/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao buscar previsão');
  const data = await response.json();

  // Pega uma leitura a cada 8 horas (próximas 5)
  return data.list.filter((_, i) => i % 8 === 0).slice(0, 5).map((item) => ({
    aqi: item.main.aqi,
    info: AQI_INFO[item.main.aqi],
    dt: new Date(item.dt * 1000),
  }));
}

export async function fetchCityName(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.length > 0) {
    return `${data[0].name}, ${data[0].state || data[0].country}`;
  }
  return 'Localização atual';
}
