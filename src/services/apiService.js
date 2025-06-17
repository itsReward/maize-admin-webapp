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
