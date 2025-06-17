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

      // Handle authentication errors - but be more specific
      if (response.status === 401) {
        // Only logout on 401 (Unauthorized) - token is definitely invalid
        authService.logout();
        throw new Error('Authentication failed. Please login again.');
      }

      if (response.status === 403) {
        // For 403 (Forbidden), don't automatically logout
        // This could be missing endpoints or insufficient permissions
        console.warn(`Access forbidden to ${endpoint}. This might be a missing endpoint or insufficient permissions.`);
        throw new Error(`Access forbidden to ${endpoint.replace('/api', '')}`);
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

  // Analytics API
  async getAnalytics(type, params = {}) {
    const queryParams = new URLSearchParams(params);
    return this.get(`/analytics/${type}?${queryParams}`);
  }

  // User APIs
  async getUsers(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.get(`/users?${params}`);
  }

  async getCurrentUser() {
    return this.get('/users/me');
  }

  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Farm APIs
  async getFarms(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.get(`/farms?${params}`);
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

  // Prediction APIs
  async getPredictions(sessionId = null, page = 0, size = 10) {
    const params = new URLSearchParams({ page, size });
    if (sessionId) params.append('sessionId', sessionId);
    return this.get(`/predictions?${params}`);
  }

  async generatePrediction(sessionId, predictionData) {
    return this.post(`/planting-sessions/${sessionId}/predictions`, predictionData);
  }

  async getPredictionById(id) {
    return this.get(`/predictions/${id}`);
  }

  // Weather APIs
  async getWeatherData(location = null, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.get(`/weather-data?${params}`);
  }

  async getCurrentWeather(location) {
    return this.get(`/weather-data/current?location=${location}`);
  }

  // Planting Session APIs
  async getPlantingSessions(page = 0, size = 10, search = '') {
    const params = new URLSearchParams({ page, size, search });
    return this.get(`/planting-sessions?${params}`);
  }

  async getPlantingSessionById(id) {
    return this.get(`/planting-sessions/${id}`);
  }

  async createPlantingSession(sessionData) {
    return this.post('/planting-sessions', sessionData);
  }

  async updatePlantingSession(id, sessionData) {
    return this.put(`/planting-sessions/${id}`, sessionData);
  }

  async deleteePlantingSession(id) {
    return this.delete(`/planting-sessions/${id}`);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;