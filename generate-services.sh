#!/bin/bash

# generate-services.sh - Creates service files and hooks
set -e

echo "🔧 Creating services and hooks..."

# Create API Service
cat > src/services/apiService.js << 'EOF'
// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
const ML_API_BASE_URL = process.env.REACT_APP_ML_API_BASE_URL || 'http://localhost:8001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.mlBaseURL = ML_API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  async mlRequest(endpoint, options = {}) {
    const url = `${this.mlBaseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`ML API request failed: ${url}`, error);
      throw error;
    }
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getYieldTrends() {
    return this.request('/dashboard/yield-trends');
  }

  // User APIs
  async getUsers(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.request(`/users?${params}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Farmer APIs
  async getFarmers(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.request(`/farmers?${params}`);
  }

  async getFarmerDetails(id) {
    return this.request(`/farmers/${id}`);
  }

  // Farm APIs
  async getFarms(farmerId = null) {
    const params = farmerId ? new URLSearchParams({ farmerId }) : '';
    return this.request(`/farms?${params}`);
  }

  // Planting Session APIs
  async getPlantingSessions(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.request(`/planting-sessions?${params}`);
  }

  async getPlantingSessionDetails(id) {
    return this.request(`/planting-sessions/${id}`);
  }

  async createPlantingSession(sessionData) {
    return this.request('/planting-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Weather APIs
  async getWeatherData(farmId = null, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (farmId) params.append('farmId', farmId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/weather-data?${params}`);
  }

  // Yield APIs
  async getYieldHistory(plantingSessionId = null) {
    const params = plantingSessionId ? new URLSearchParams({ plantingSessionId }) : '';
    return this.request(`/yield-history?${params}`);
  }

  async getYieldPredictions(plantingSessionId = null) {
    const params = plantingSessionId ? new URLSearchParams({ plantingSessionId }) : '';
    return this.request(`/yield-predictions?${params}`);
  }

  // Recommendation APIs
  async getRecommendations(plantingSessionId = null) {
    const params = plantingSessionId ? new URLSearchParams({ plantingSessionId }) : '';
    return this.request(`/recommendations?${params}`);
  }

  // ML Model APIs
  async getModelVersions() {
    return this.mlRequest('/model/versions');
  }

  async getCurrentModel() {
    return this.mlRequest('/model/status');
  }

  async trainModel(trainingConfig) {
    return this.mlRequest('/model/train', {
      method: 'POST',
      body: JSON.stringify(trainingConfig),
    });
  }

  async loadModelVersion(version) {
    return this.mlRequest(`/model/load-version/${version}`, {
      method: 'POST',
    });
  }

  async getFeatureImportance() {
    return this.mlRequest('/features/importance');
  }

  async makePrediction(inputData) {
    return this.mlRequest('/predict', {
      method: 'POST',
      body: JSON.stringify(inputData),
    });
  }

  // Analytics APIs
  async getCropDistribution() {
    return this.request('/analytics/crop-distribution');
  }

  async getRegionalPerformance() {
    return this.request('/analytics/regional-performance');
  }

  async getModelAccuracyTrends() {
    return this.request('/analytics/model-accuracy-trends');
  }

  // Settings APIs
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

const apiService = new ApiService();
export default apiService;
EOF

# Create custom hooks
cat > src/hooks/useApi.js << 'EOF'
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;
EOF

cat > src/hooks/useLocalStorage.js << 'EOF'
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
EOF

cat > src/hooks/usePagination.js << 'EOF'
import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

export default usePagination;
EOF

# Create utility functions
cat > src/utils/constants.js << 'EOF'
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
EOF

cat > src/utils/helpers.js << 'EOF'
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString();
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(1)}%`;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    GROWING: 'bg-green-100 text-green-800',
    HARVESTED: 'bg-blue-100 text-blue-800',
    PLANTED: 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const calculateGrowthPercentage = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const downloadJSON = (data, filename) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = filename || 'data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', filename || 'data.csv');
  linkElement.click();
  
  window.URL.revokeObjectURL(url);
};
EOF

cat > src/utils/dateUtils.js << 'EOF'
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US');
};

export const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
};

export const getDaysFromNow = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
};
EOF

echo "✅ Services and hooks created successfully!"
