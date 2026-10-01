const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const statusEl = document.getElementById('status');
const weatherCard = document.getElementById('weatherCard');
const cityNameEl = document.getElementById('cityName');
const tempEl = document.getElementById('temp');
const conditionEl = document.getElementById('condition');
const timeEl = document.getElementById('time');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const forecastEl = document.getElementById('forecast');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherSceneEl = document.getElementById('weatherScene');
const weatherEffectEl = document.getElementById('weatherEffect');
const soundToggle = document.getElementById('soundToggle');

let audioContext;
let soundGain;
let soundSource;
let soundEnabled = false;

const weatherCodes = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Heavy showers',
  82: 'Violent showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm'
};

const weatherIcons = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌦️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '❄️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️'
};

function getWeatherType(code) {
  if (code >= 95) return 'storm';
  if (code >= 71 && code <= 86) return 'snow';
  if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 0) return 'clear';
  return 'cloudy';
}

function updateWeatherEffect(code) {
  const weatherType = getWeatherType(code);
  document.body.dataset.weather = weatherType;
  weatherEffectEl.dataset.weather = weatherType;
  weatherEffectEl.innerHTML = '';

  if (weatherType === 'rain' || weatherType === 'storm') {
    const particleCount = weatherType === 'storm' ? 70 : 45;
    weatherEffectEl.innerHTML = Array.from({ length: particleCount }, () => (
      `<span style="--left:${Math.random() * 110 - 5}%;--length:${16 + Math.random() * 18}px;--duration:${0.55 + Math.random() * 0.45}s;--delay:${Math.random() * -2}s"></span>`
    )).join('');
  } else if (weatherType === 'snow') {
    weatherEffectEl.innerHTML = Array.from({ length: 28 }, () => (
      `<span style="--left:${Math.random() * 105 - 2.5}%;--duration:${4 + Math.random() * 4}s;--delay:${Math.random() * -6}s"></span>`
    )).join('');
  }
}

function createNoiseBuffer(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function updateWeatherSound(code) {
  if (!soundEnabled || !soundGain || !audioContext) return;

  const weatherType = getWeatherType(code);
  const filter = audioContext.createBiquadFilter();
  const source = audioContext.createBufferSource();
  const nextGain = audioContext.createGain();
  const isStorm = weatherType === 'storm';

  source.buffer = createNoiseBuffer(audioContext);
  source.loop = true;
  filter.type = 'lowpass';
  filter.frequency.value = weatherType === 'snow' ? 900 : isStorm ? 1400 : 2300;
  nextGain.gain.value = weatherType === 'clear' || weatherType === 'cloudy' ? 0.006 : 0.018;
  source.connect(filter).connect(nextGain).connect(soundGain);
  source.start();

  if (soundSource) soundSource.stop();
  soundSource = source;
}

function toggleWeatherSound() {
  if (!audioContext) {
    audioContext = new AudioContext();
    soundGain = audioContext.createGain();
    soundGain.gain.value = 0.45;
    soundGain.connect(audioContext.destination);
  }

  const isEnabled = soundToggle.getAttribute('aria-pressed') === 'true';
  if (isEnabled) {
    soundEnabled = false;
    soundGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
    soundToggle.setAttribute('aria-pressed', 'false');
    soundToggle.innerHTML = '<span aria-hidden="true">🔇</span><span class="sr-only">Enable weather sounds</span>';
  } else {
    soundEnabled = true;
    soundGain.gain.setTargetAtTime(0.45, audioContext.currentTime, 0.05);
    soundToggle.setAttribute('aria-pressed', 'true');
    soundToggle.innerHTML = '<span aria-hidden="true">🔊</span><span class="sr-only">Mute weather sounds</span>';
    updateWeatherSound(Number(weatherCard.dataset.weatherCode || 0));
  }
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#fca5a5' : '#94a3b8';
}

async function fetchCityCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to find that city.');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('No matching city found.');
  }

  const result = data.results[0];
  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || 'auto'
  };
}

async function fetchWeather(latitude, longitude, timezone) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=${encodeURIComponent(timezone)}&forecast_days=5`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Weather data is not available right now.');
  }

  return response.json();
}

function renderWeather(data, locationName) {
  const current = data.current;
  const daily = data.daily;

  const currentCode = current.weather_code;
  const condition = weatherCodes[currentCode] || 'Weather';

  cityNameEl.textContent = locationName;
  tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  conditionEl.textContent = condition;
  timeEl.textContent = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  weatherIconEl.textContent = weatherIcons[currentCode] || '🌤️';
  weatherCard.dataset.weatherCode = currentCode;
  weatherSceneEl.dataset.weather = getWeatherType(currentCode);
  updateWeatherEffect(currentCode);
  updateWeatherSound(currentCode);

  forecastEl.innerHTML = daily.time
    .slice(0, 5)
    .map((date, index) => {
      const code = daily.weather_code[index];
      const high = Math.round(daily.temperature_2m_max[index]);
      const low = Math.round(daily.temperature_2m_min[index]);
      const dayName = new Date(date).toLocaleDateString([], { weekday: 'short' });

      return `
        <div class="forecast-item">
          <div class="day">${dayName}</div>
          <div class="icon">${weatherIcons[code] || '🌤️'}</div>
          <div class="high-low">${high}° / ${low}°</div>
        </div>
      `;
    })
    .join('');

  weatherCard.classList.remove('hidden');
}

async function searchWeather(city) {
  setStatus('Loading weather...');

  try {
    const location = await fetchCityCoordinates(city);
    const weatherData = await fetchWeather(location.latitude, location.longitude, location.timezone);
    renderWeather(weatherData, `${location.name}, ${location.country}`);
    setStatus('Weather updated successfully.');
  } catch (error) {
    setStatus(error.message, true);
    weatherCard.classList.add('hidden');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    setStatus('Please enter a city name.', true);
    return;
  }

  searchWeather(city);
});

soundToggle.addEventListener('click', toggleWeatherSound);

searchWeather('London');
