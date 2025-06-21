// src/services/apiService.js
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.enableLogging = process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development';
    }

    // Logging helper methods
    logRequest(method, url, data = null) {
        if (!this.enableLogging) return;

        console.group(`🔄 API Request: ${method.toUpperCase()} ${url}`);
        console.log('📤 Request URL:', url);
        console.log('🕒 Timestamp:', new Date().toISOString());
        if (data) {
            console.log('📦 Request Body:', data);
        }
        console.log('🔑 Auth Headers:', authService.getAuthHeader());
        console.groupEnd();
    }

    logResponse(method, url, response, duration) {
        if (!this.enableLogging) return;

        console.group(`✅ API Response: ${method.toUpperCase()} ${url}`);
        console.log('📥 Response Data:', response);
        console.log('⏱️ Duration:', `${duration}ms`);
        console.log('🕒 Timestamp:', new Date().toISOString());
        console.groupEnd();
    }

    logError(method, url, error, duration) {
        console.group(`❌ API Error: ${method.toUpperCase()} ${url}`);
        console.error('💥 Error:', error);
        console.error('⏱️ Duration:', `${duration}ms`);
        console.error('🕒 Timestamp:', new Date().toISOString());
        console.error('📊 Error Stack:', error.stack);
        console.groupEnd();
    }

    // Generic request method with authentication and logging
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const startTime = performance.now();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader(), // Add auth header automatically
                ...options.headers,
            },
            ...options,
        };

        // Log the request
        this.logRequest(options.method || 'GET', url, options.body);

        try {
            const response = await fetch(url, config);
            const duration = Math.round(performance.now() - startTime);

            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                const error = new Error('Authentication failed. Please login again.');
                this.logError(options.method || 'GET', url, error, duration);

                // Emit global auth error event instead of immediately logging out
                window.dispatchEvent(new CustomEvent('auth-error', {
                    detail: { status: response.status, endpoint, error }
                }));

                throw error;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
                this.logError(options.method || 'GET', url, error, duration);
                throw error;
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type');
            let responseData;

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Log successful response
            this.logResponse(options.method || 'GET', url, responseData, duration);

            return responseData;
        } catch (error) {
            const duration = Math.round(performance.now() - startTime);
            this.logError(options.method || 'GET', url, error, duration);

            // Re-throw with additional context
            const enhancedError = new Error(`API Request Failed: ${error.message}`);
            enhancedError.originalError = error;
            enhancedError.endpoint = endpoint;
            enhancedError.method = options.method || 'GET';
            enhancedError.duration = duration;

            throw enhancedError;
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

    // Farm APIs with enhanced error handling
    async getFarms() {
        try {
            const response = await this.get('/farms');

            // Ensure we always return an array
            if (!response) {
                console.warn('⚠️ getFarms returned null/undefined, returning empty array');
                return [];
            }

            if (!Array.isArray(response)) {
                console.warn('⚠️ getFarms response is not an array:', response);
                // If it's a paginated response, extract the content
                if (response && response.content && Array.isArray(response.content)) {
                    return response.content;
                }
                return [];
            }

            return response;
        } catch (error) {
            console.error('❌ getFarms error:', error);
            // Return empty array on error to prevent app crashes
            return [];
        }
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

    // Debug helper - call this from console to see current config
    getDebugInfo() {
        return {
            baseURL: this.baseURL,
            enableLogging: this.enableLogging,
            authToken: authService.getToken() ? 'Present' : 'Missing',
            environment: process.env.NODE_ENV
        };
    }
}

// Create and export singleton instance
const apiService = new ApiService();

// Make debug info available globally in development
if (process.env.NODE_ENV === 'development') {
    window.apiService = apiService;
}

export default apiService;