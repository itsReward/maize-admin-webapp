export const API_ENDPOINTS = {
  DASHBOARD: '/dashboard',
  USERS: '/users',
  FARMERS: '/farmers',
  FARMS: '/farms',
  PLANTING_SESSIONS: '/planting-sessions',
  // Updated Weather Endpoints Structure
  WEATHER: {
    // Base weather endpoints
    CURRENT: '/weather/current',                    // GET /api/weather/current?location=Harare
    HISTORY: '/weather/history',                    // GET /api/weather/history?farmId=1&startDate=...&endDate=...

    // Farm-specific weather endpoints
    FARM_CURRENT: '/weather/farms',                 // GET /api/weather/farms/{farmId}/current
    FARM_HISTORY: '/weather/farms',                 // GET /api/weather/farms/{farmId}/history?days=7
    FARM_WEATHER: '/weather/farms',                 // GET /api/weather/farms/{farmId}/weather
    FARM_DATE_RANGE: '/weather/farms',              // GET /api/weather/farms/{farmId}/weather/date-range
    FARM_LATEST: '/weather/farms',                  // GET /api/weather/farms/{farmId}/weather/latest
    FARM_FETCH: '/weather/farms',                   // POST /api/weather/farms/{farmId}/weather/fetch
    FARM_FORECAST: '/weather/farms',                // GET /api/weather/farms/{farmId}/weather/forecast
    FARM_HISTORICAL: '/weather/farms',              // GET /api/weather/farms/{farmId}/weather/historical/{date}
    FARM_ALERTS: '/weather/farms',                  // GET /api/weather/farms/{farmId}/weather/alerts
    FARM_STATISTICS: '/weather/farms',              // GET /api/weather/farms/{farmId}/weather/statistics

    // Weather data CRUD endpoints
    DATA: '/weather/data',                          // GET/POST /api/weather/data
    DATA_BY_ID: '/weather/data',                    // GET/PUT/DELETE /api/weather/data/{id}
  },
  YIELD_HISTORY: '/yield-history',
  YIELD_PREDICTIONS: '/yield-predictions',
  RECOMMENDATIONS: '/recommendations',
  SETTINGS: '/settings'
};

export const ML_ENDPOINTS = {
  MODEL_VERSIONS: '/model/versions',
  MODEL_STATUS: '/model/status',
  MODEL_TRAIN: '/model/train',
  MODEL_LOAD: '/model/load-version',
  FEATURE_IMPORTANCE: '/features/importance',
  PREDICT: '/predict'
};

export const STATUS_COLORS = {
  ACTIVE: 'green',
  INACTIVE: 'red',
  PENDING: 'yellow',
  COMPLETED: 'blue'
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  FARMER: 'FARMER',
  VIEWER: 'VIEWER'
};

export const CROP_VARIETIES = [
  'SC627',
  'SC719',
  'SC543',
  'ZM421',
  'ZM523'
];

export const PAGINATION_SIZES = [10, 20, 50, 100];

export const WEATHER_ENDPOINTS = {
  // Helper functions to build weather endpoint URLs
  getCurrentWeather: (location) => `/weather/current?location=${encodeURIComponent(location)}`,
  getWeatherHistory: (farmId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (farmId) params.append('farmId', farmId);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return `/weather/history?${params}`;
  },
  getFarmCurrentWeather: (farmId) => `/weather/farms/${farmId}/current`,
  getFarmWeatherHistory: (farmId, days = 7) => `/weather/farms/${farmId}/history?days=${days}`,
  getFarmWeatherData: (farmId) => `/weather/farms/${farmId}/weather`,
  getFarmWeatherDateRange: (farmId, startDate, endDate) =>
      `/weather/farms/${farmId}/weather/date-range?startDate=${startDate}&endDate=${endDate}`,
  getFarmLatestWeather: (farmId) => `/weather/farms/${farmId}/weather/latest`,
  fetchFarmWeather: (farmId) => `/weather/farms/${farmId}/weather/fetch`,
  getFarmWeatherForecast: (farmId, days = 7) => `/weather/farms/${farmId}/weather/forecast?days=${days}`,
  getFarmHistoricalWeather: (farmId, date) => `/weather/farms/${farmId}/weather/historical/${date}`,
  getFarmWeatherAlerts: (farmId) => `/weather/farms/${farmId}/weather/alerts`,
  getFarmWeatherStatistics: (farmId) => `/weather/farms/${farmId}/weather/statistics`,
  getWeatherDataById: (weatherDataId) => `/weather/data/${weatherDataId}`,
  createWeatherData: () => `/weather/data`,
  updateWeatherData: (weatherDataId) => `/weather/data/${weatherDataId}`,
  deleteWeatherData: (weatherDataId) => `/weather/data/${weatherDataId}`,
};

// Weather-specific constants
export const WEATHER_CONDITIONS = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Overcast',
  'Light Rain',
  'Rain',
  'Heavy Rain',
  'Thunderstorm',
  'Foggy',
  'Windy'
];

export const WEATHER_METRICS = {
  TEMPERATURE: { min: -10, max: 50, unit: '°C' },
  HUMIDITY: { min: 0, max: 100, unit: '%' },
  RAINFALL: { min: 0, max: 200, unit: 'mm' },
  WIND_SPEED: { min: 0, max: 100, unit: 'km/h' },
  PRESSURE: { min: 900, max: 1100, unit: 'hPa' },
  UV_INDEX: { min: 0, max: 11, unit: '' }
};

export const DATE_RANGES = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last year', value: 365 }
];

export const ZIMBABWE_LOCATIONS = [
  'Harare',
  'Bulawayo',
  'Mutare',
  'Gweru',
  'Kwekwe',
  'Kadoma',
  'Masvingo',
  'Chinhoyi',
  'Marondera',
  'Zvishavane',
  'Bindura',
  'Chegutu',
  'Kariba',
  'Victoria Falls',
  'Hwange'
];
