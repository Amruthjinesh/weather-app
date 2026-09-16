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

searchWeather('London');
