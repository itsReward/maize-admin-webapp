// src/services/apiService.js
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method with authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(), // Add auth header automatically
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Token might be expired or invalid
        authService.logout();
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  async getRecentActivity() {
    return this.get('/dashboard/recent-activity');
  }

  // User APIs
  async getUsers(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.get(`/users?${params}`);
  }

  async getCurrentUser() {
    return this.get('/users/me');
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Farm APIs
  async getFarms() {
    return this.get('/farms');
  }

  async getFarmById(id) {
    return this.get(`/farms/${id}`);
  }

  async createFarm(farmData) {
    return this.post('/farms', farmData);
  }

  async updateFarm(id, farmData) {
    return this.put(`/farms/${id}`, farmData);
  }

  async deleteFarm(id) {
    return this.delete(`/farms/${id}`);
  }

  // Planting Session APIs
  async getPlantingSessions(farmId) {
    return this.get(`/farms/${farmId}/planting-sessions`);
  }

  async getPlantingSessionById(sessionId) {
    return this.get(`/planting-sessions/${sessionId}`);
  }

  async createPlantingSession(farmId, sessionData) {
    return this.post(`/farms/${farmId}/planting-sessions`, sessionData);
  }

  async updatePlantingSession(sessionId, sessionData) {
    return this.put(`/planting-sessions/${sessionId}`, sessionData);
  }

  async deletePlantingSession(sessionId) {
    return this.delete(`/planting-sessions/${sessionId}`);
  }

  // Weather APIs
  async getWeatherData(location) {
    return this.get(`/weather?location=${encodeURIComponent(location)}`);
  }

  async getWeatherHistory(farmId, startDate, endDate) {
    const params = new URLSearchParams({ farmId, startDate, endDate });
    return this.get(`/weather/history?${params}`);
  }

  // Prediction APIs
  async createPrediction(predictionData) {
    return this.post('/predictions', predictionData);
  }

  async getPredictions(farmId) {
    return this.get(`/predictions?farmId=${farmId}`);
  }

  async getPredictionById(id) {
    return this.get(`/predictions/${id}`);
  }

  // Model APIs
  async getModelVersions() {
    return this.get('/models/versions');
  }

  async trainModel(trainingData) {
    return this.post('/models/train', trainingData);
  }

  async getModelMetrics(modelId) {
    return this.get(`/models/${modelId}/metrics`);
  }

  // Analytics APIs
  async getAnalytics(type, params = {}) {
    const queryParams = new URLSearchParams(params);
    return this.get(`/analytics/${type}?${queryParams}`);
  }

  // Settings APIs
  async getSettings() {
    return this.get('/settings');
  }

  async updateSettings(settings) {
    return this.put('/settings', settings);
  }

  // Health check
  async healthCheck() {
    try {
      return await this.get('/health');
    } catch (error) {
      throw new Error('Backend service is not available');
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;