export const API_ENDPOINTS = {
  DASHBOARD: '/dashboard',
  USERS: '/users',
  FARMERS: '/farmers',
  FARMS: '/farms',
  PLANTING_SESSIONS: '/planting-sessions',
  WEATHER_DATA: '/weather-data',
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
