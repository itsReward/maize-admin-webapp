// src/services/apiService.js - Enhanced to handle missing endpoints gracefully
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8181/api/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.enableLogging = process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development';
        this.failedEndpoints = new Set(); // Track endpoints that have failed
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

    logError(method, url, error, duration, status) {
        const isAuthError = status === 401 || status === 403;
        const isMissingEndpoint = status === 404;
        const isServerError = status >= 500;

        const logLevel = isAuthError ? 'error' : isMissingEndpoint ? 'warn' : 'error';

        console.group(`${isAuthError ? '❌' : isMissingEndpoint ? '⚠️' : '💥'} API ${logLevel.toUpperCase()}: ${method.toUpperCase()} ${url}`);
        console[logLevel]('Error:', error.message);
        console[logLevel]('Status:', status);
        console[logLevel]('⏱️ Duration:', `${duration}ms`);
        console[logLevel]('🕒 Timestamp:', new Date().toISOString());

        if (isMissingEndpoint) {
            console.warn('📝 This endpoint may not be implemented yet. App will continue working.');
            this.failedEndpoints.add(url);
        } else if (isServerError) {
            console.error('🔧 Server error - check backend logs');
        }

        console.groupEnd();
    }

    // Determine if an error should cause logout
    shouldLogoutOnError(status, endpoint) {
        // Only logout on authentication errors, not on missing endpoints or server errors
        const isAuthError = status === 401 || status === 403;
        const isMissingEndpoint = status === 404;
        const isServerError = status >= 500;

        // Don't logout for missing endpoints or server errors
        if (isMissingEndpoint || isServerError) {
            return false;
        }

        // Only logout for auth errors on protected endpoints
        if (isAuthError) {
            // Don't logout if it's a public endpoint
            const publicEndpoints = ['/auth/login', '/auth/register', '/health'];
            const isPublicEndpoint = publicEndpoints.some(pub => endpoint.includes(pub));
            return !isPublicEndpoint;
        }

        return false;
    }

    // Create user-friendly error messages
    createUserFriendlyError(status, endpoint, originalError) {
        switch (status) {
            case 404:
                return {
                    type: 'MISSING_ENDPOINT',
                    message: 'This feature is not yet available',
                    detail: `The endpoint ${endpoint} is not implemented`,
                    canRetry: false,
                    showToUser: false // Don't show 404s to users
                };
            case 500:
            case 502:
            case 503:
                return {
                    type: 'SERVER_ERROR',
                    message: 'Server is temporarily unavailable',
                    detail: 'Please try again in a moment',
                    canRetry: true,
                    showToUser: true
                };
            case 401:
                return {
                    type: 'AUTHENTICATION_ERROR',
                    message: 'Your session has expired',
                    detail: 'Please log in again',
                    canRetry: false,
                    showToUser: true
                };
            case 403:
                return {
                    type: 'PERMISSION_ERROR',
                    message: 'You do not have permission to access this resource',
                    detail: 'Contact your administrator if you believe this is an error',
                    canRetry: false,
                    showToUser: true
                };
            default:
                return {
                    type: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred',
                    detail: originalError.message,
                    canRetry: true,
                    showToUser: true
                };
        }
    }

    // Generic request method with enhanced error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const startTime = performance.now();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader(),
                ...options.headers,
            },
            ...options,
        };

        // Log the request
        this.logRequest(options.method || 'GET', url, options.body);

        try {
            const response = await fetch(url, config);
            const duration = Math.round(performance.now() - startTime);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const userFriendlyError = this.createUserFriendlyError(response.status, endpoint, { message: errorData.message });

                // Log the error
                this.logError(options.method || 'GET', url, userFriendlyError, duration, response.status);

                // Only trigger logout for actual auth errors
                if (this.shouldLogoutOnError(response.status, endpoint)) {
                    console.error('🚪 Authentication error detected, triggering logout');
                    window.dispatchEvent(new CustomEvent('auth-error', {
                        detail: { status: response.status, endpoint, error: userFriendlyError }
                    }));
                }

                // Create enhanced error with user-friendly info
                const enhancedError = new Error(userFriendlyError.message);
                enhancedError.status = response.status;
                enhancedError.endpoint = endpoint;
                enhancedError.userFriendly = userFriendlyError;
                enhancedError.originalMessage = errorData.message || 'Unknown error';

                throw enhancedError;
            }

            // Handle successful responses
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

            // Handle network errors (fetch failures)
            if (!error.status) {
                const networkError = this.createUserFriendlyError(0, endpoint, error);
                this.logError(options.method || 'GET', url, networkError, duration, 0);

                const enhancedError = new Error(networkError.message);
                enhancedError.status = 0;
                enhancedError.endpoint = endpoint;
                enhancedError.userFriendly = networkError;
                enhancedError.originalError = error;

                throw enhancedError;
            }

            // Re-throw errors that already have status (handled above)
            throw error;
        }
    }

    // GET request with fallback
    async get(endpoint, fallbackData = null) {
        try {
            return await this.request(endpoint, { method: 'GET' });
        } catch (error) {
            // For missing endpoints, return fallback data instead of throwing
            if (error.status === 404 && fallbackData !== null) {
                console.warn(`🔄 Using fallback data for ${endpoint}`);
                return fallbackData;
            }
            throw error;
        }
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

    // Dashboard APIs with fallbacks
    async getDashboardStats() {
        try {
            return await this.get('/dashboard/stats');
        } catch (error) {
            if (error.status === 404) {
                // Return mock data for missing dashboard stats
                return {
                    totalFarms: 0,
                    totalUsers: 0,
                    activeSessions: 0,
                    totalYield: 0
                };
            }
            throw error;
        }
    }

    async getRecentActivity() {
        try {
            return await this.get('/dashboard/recent-activity');
        } catch (error) {
            if (error.status === 404) {
                return []; // Return empty array for missing recent activity
            }
            throw error;
        }
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
                console.warn('⚠️ getFarms response is not an array:', typeof response, response);
                // If it's a paginated response, extract the content
                if (response && response.content && Array.isArray(response.content)) {
                    return response.content;
                }
                return [];
            }

            return response;
        } catch (error) {
            console.error('❌ getFarms error:', error);

            // Don't crash the app if farms endpoint is missing
            if (error.status === 404) {
                console.warn('⚠️ Farms endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        name: 'Demo Farm',
                        location: 'Sample Location',
                        size: 10.5,
                        soilType: 'Loamy',
                        ownerName: 'Demo Owner',
                        contactNumber: '+263 77 123 4567'
                    }
                ];
            }

            // For other errors, return empty array to prevent crashes
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

    // Health check
    async healthCheck() {
        try {
            return await this.get('/health');
        } catch (error) {
            console.warn('⚠️ Health check failed:', error.message);
            return { status: 'unknown', message: 'Health endpoint not available' };
        }
    }

    // Get failed endpoints for debugging
    getFailedEndpoints() {
        return Array.from(this.failedEndpoints);
    }

    // Clear failed endpoints cache
    clearFailedEndpoints() {
        this.failedEndpoints.clear();
    }

    // Planting Session APIs
    async getPlantingSessions(farmId = null) {
        try {
            // If farmId is provided, get sessions for specific farm, otherwise get all sessions
            const endpoint = farmId ? `/farms/${farmId}/planting-sessions` : '/planting-sessions';
            const response = await this.get(endpoint);

            // Ensure we always return an array
            if (!response) {
                console.warn('⚠️ getPlantingSessions returned null/undefined, returning empty array');
                return [];
            }

            if (!Array.isArray(response)) {
                console.warn('⚠️ getPlantingSessions response is not an array:', typeof response, response);
                // If it's a paginated response, extract the content
                if (response && response.content && Array.isArray(response.content)) {
                    console.log('🔍 Extracting planting sessions from paginated response');
                    return response.content;
                }
                return [];
            }

            return response;
        } catch (error) {
            console.error('❌ getPlantingSessions error:', error);

            // Don't crash the app if planting sessions endpoint is missing
            if (error.status === 404) {
                console.warn('⚠️ Planting sessions endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        farmName: 'Demo Farm',
                        cropVariety: 'SC627',
                        plantingDate: '2024-11-01',
                        expectedHarvestDate: '2025-04-15',
                        areaPlanted: 15.5,
                        seedQuantity: 25,
                        status: 'PLANTED',
                        notes: 'Demo planting session - endpoint not implemented yet'
                    },
                    {
                        id: 2,
                        farmName: 'Sample Farm',
                        cropVariety: 'ZM621',
                        plantingDate: '2024-10-15',
                        expectedHarvestDate: '2025-03-30',
                        areaPlanted: 22.3,
                        seedQuantity: 35,
                        status: 'GROWING',
                        notes: 'Demo planting session - endpoint not implemented yet'
                    }
                ];
            }

            // For other errors, return empty array to prevent crashes
            console.warn('⚠️ getPlantingSessions failed with non-404 error, returning empty array');
            return [];
        }
    }

    async getPlantingSessionById(sessionId) {
        try {
            return await this.get(`/planting-sessions/${sessionId}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Planting session ${sessionId} not found`);
                return null;
            }
            throw error;
        }
    }

    async createPlantingSession(farmId, sessionData) {
        return this.post(`/planting-sessions/create/${farmId}`, sessionData);
    }

    async updatePlantingSession(sessionId, sessionData) {
        return this.put(`/planting-sessions/${sessionId}`, sessionData);
    }

    async deletePlantingSession(sessionId) {
        return this.delete(`/planting-sessions/${sessionId}`);
    }

    // Debug helper
    getDebugInfo() {
        return {
            baseURL: this.baseURL,
            enableLogging: this.enableLogging,
            failedEndpoints: this.getFailedEndpoints(),
            authToken: authService.getToken() ? 'Present' : 'Missing',
            environment: process.env.NODE_ENV
        };
    }

    // Add these methods to your apiService.js file

// ===========================================
// WEATHER APIs
// ===========================================

    /**
     * Get current weather data by location
     * NEW ENDPOINT: GET /api/weather/current?location=Harare
     */
    async getWeatherData(location) {
        try {
            const response = await this.get(`/weather/current?location=${encodeURIComponent(location)}`);
            return response;
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn('⚠️ Weather current endpoint not found, returning mock data');
                return {
                    location: location,
                    temperature: 25,
                    humidity: 60,
                    rainfall: 0,
                    windSpeed: 12,
                    pressure: 1013,
                    visibility: 10,
                    uvIndex: 6,
                    conditions: 'Sunny',
                    forecast: 'Clear skies expected',
                    timestamp: new Date().toISOString(),
                    note: 'Demo weather data - endpoint not implemented yet'
                };
            }
            throw error;
        }
    }

    /**
     * Get weather history with optional farm ID
     * NEW ENDPOINT: GET /api/weather/history?farmId=1&startDate=2025-06-15&endDate=2025-06-22
     */
    async getWeatherHistory(farmId = null, startDate, endDate) {
        try {
            const params = new URLSearchParams();
            if (farmId) params.append('farmId', farmId);
            params.append('startDate', startDate);
            params.append('endDate', endDate);

            const response = await this.get(`/weather/history?${params}`);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn('⚠️ Weather history endpoint not found, returning mock data');
                return this.getMockWeatherHistory(startDate, endDate);
            }
            throw error;
        }
    }

    /**
     * Get current weather for a specific farm
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/current
     */
    async getCurrentWeatherForFarm(farmId) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/current`);
            return response;
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather for farm ${farmId} not found, returning mock data`);
                return {
                    farmId: farmId,
                    temperature: 24,
                    humidity: 65,
                    rainfall: 2.5,
                    windSpeed: 12,
                    pressure: 1013,
                    conditions: 'Partly Cloudy',
                    timestamp: new Date().toISOString(),
                    note: 'Demo weather data for farm'
                };
            }
            throw error;
        }
    }

    /**
     * Get weather history for a specific farm
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/history?days=7
     */
    async getWeatherHistoryForFarm(farmId, days = 7) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/history?days=${days}`);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather history for farm ${farmId} not found, returning mock data`);
                return this.getMockWeatherHistory(
                    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                );
            }
            throw error;
        }
    }

    /**
     * Get all weather data for a farm
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather
     */
    async getWeatherDataByFarmId(farmId) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/weather`);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather data for farm ${farmId} not found, returning mock data`);
                return this.getMockWeatherHistory();
            }
            throw error;
        }
    }

    /**
     * Get weather data for a specific date range
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather/date-range?startDate=2025-06-15&endDate=2025-06-22
     */
    async getWeatherDataByDateRange(farmId, startDate, endDate) {
        try {
            const params = new URLSearchParams({ startDate, endDate });
            const response = await this.get(`/weather/farms/${farmId}/weather/date-range?${params}`);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather date range for farm ${farmId} not found, returning mock data`);
                return this.getMockWeatherHistory(startDate, endDate);
            }
            throw error;
        }
    }

    /**
     * Get weather data by ID
     * NEW ENDPOINT: GET /api/weather/data/{weatherDataId}
     */
    async getWeatherDataById(weatherDataId) {
        try {
            const response = await this.get(`/weather/data/${weatherDataId}`);
            return response;
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Weather data ${weatherDataId} not found`);
                return null;
            }
            throw error;
        }
    }

    /**
     * Add weather data manually
     * NEW ENDPOINT: POST /api/weather/data
     */
    async addWeatherData(weatherData) {
        try {
            return await this.post('/weather/data', weatherData);
        } catch (error) {
            console.error('Failed to add weather data:', error);
            throw error;
        }
    }

    /**
     * Update weather data
     * NEW ENDPOINT: PUT /api/weather/data/{weatherDataId}
     */
    async updateWeatherData(weatherDataId, weatherData) {
        try {
            return await this.put(`/weather/data/${weatherDataId}`, weatherData);
        } catch (error) {
            console.error(`Failed to update weather data ${weatherDataId}:`, error);
            throw error;
        }
    }

    /**
     * Delete weather data
     * NEW ENDPOINT: DELETE /api/weather/data/{weatherDataId}
     */
    async deleteWeatherData(weatherDataId) {
        try {
            return await this.delete(`/weather/data/${weatherDataId}`);
        } catch (error) {
            console.error(`Failed to delete weather data ${weatherDataId}:`, error);
            throw error;
        }
    }

    /**
     * Get latest weather data for a farm
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather/latest
     */
    async getLatestWeatherData(farmId) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/weather/latest`);
            return response;
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Latest weather for farm ${farmId} not found`);
                return null;
            }
            throw error;
        }
    }

    /**
     * Fetch weather data from external API
     * NEW ENDPOINT: POST /api/weather/farms/{farmId}/weather/fetch
     */
    async fetchWeatherDataForFarm(farmId) {
        try {
            return await this.post(`/weather/farms/${farmId}/weather/fetch`);
        } catch (error) {
            console.error(`Failed to fetch weather for farm ${farmId}:`, error);
            throw error;
        }
    }

    /**
     * Get weather forecast
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather/forecast?days=7
     */
    async getWeatherForecast(farmId, days = 7) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/weather/forecast?days=${days}`);
            return response;
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather forecast for farm ${farmId} not found, returning mock data`);
                return {
                    farmId: farmId,
                    days: days,
                    forecast: this.getMockForecastData(days),
                    note: 'Demo forecast data'
                };
            }
            throw error;
        }
    }

    /**
     * Get historical weather data for a specific date
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather/historical/{date}
     */
    async getHistoricalWeatherData(farmId, date) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/weather/historical/${date}`);
            return response;
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Historical weather for farm ${farmId} on ${date} not found`);
                return null;
            }
            throw error;
        }
    }

    /**
     * Get weather alerts for a farm
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather/alerts
     */
    async getWeatherAlerts(farmId) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/weather/alerts`);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather alerts for farm ${farmId} not found, returning empty array`);
                return [];
            }
            throw error;
        }
    }

    /**
     * Get weather statistics for a farm
     * NEW ENDPOINT: GET /api/weather/farms/{farmId}/weather/statistics
     */
    async getWeatherStatistics(farmId) {
        try {
            const response = await this.get(`/weather/farms/${farmId}/weather/statistics`);
            return response;
        } catch (error) {
            if (error.status === 404 || error.status === 405) {
                console.warn(`⚠️ Weather statistics for farm ${farmId} not found, returning mock data`);
                return {
                    farmId: farmId,
                    totalRecords: 0,
                    averageTemperature: 24,
                    totalRainfall: 0,
                    dataRange: 'No data available',
                    note: 'Demo statistics'
                };
            }
            throw error;
        }
    }

    // ===========================================
    // HELPER METHODS FOR MOCK DATA
    // ===========================================

    getMockWeatherHistory(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const data = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            data.push({
                date: d.toISOString().split('T')[0],
                temperature: Math.round(20 + Math.random() * 10),
                humidity: Math.round(50 + Math.random() * 30),
                rainfall: Math.round(Math.random() * 15 * 100) / 100,
                windSpeed: Math.round(5 + Math.random() * 15),
                pressure: Math.round(1000 + Math.random() * 50),
                conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
            });
        }

        return data;
    }

    getMockForecastData(days) {
        const forecast = [];
        for (let i = 1; i <= days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            forecast.push({
                date: date.toISOString().split('T')[0],
                temperature: Math.round(20 + Math.random() * 10),
                humidity: Math.round(50 + Math.random() * 30),
                rainfall: Math.round(Math.random() * 10 * 100) / 100,
                conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
            });
        }
        return forecast;
    }

// ===========================================
// PLANTING SESSION APIs
// ===========================================

// ===========================================
// PREDICTION APIs
// ===========================================
    async getPredictions(farmId = null) {
        try {
            const endpoint = farmId ? `/predictions?farmId=${farmId}` : '/predictions';
            const response = await this.get(endpoint);
            return Array.isArray(response) ? response : (response?.content || []);
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Predictions endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        farmId: farmId || 1,
                        predictedYield: 45.2,
                        confidence: 85,
                        predictionDate: new Date().toISOString(),
                        harvestDate: '2025-04-15',
                        status: 'ACTIVE',
                        notes: 'Demo prediction'
                    }
                ];
            }
            return [];
        }
    }

    async getPredictionById(id) {
        try {
            return await this.get(`/predictions/${id}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Prediction ${id} not found`);
                return null;
            }
            throw error;
        }
    }

    async createPrediction(predictionData) {
        return this.post('/predictions', predictionData);
    }

// ===========================================
// ANALYTICS APIs
// ===========================================
    async getAnalytics(type, params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            return await this.get(`/analytics/${type}?${queryParams}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Analytics endpoint for ${type} not found, returning mock data`);
                // Return mock data based on analytics type
                switch (type) {
                    case 'yield-trends':
                        return [
                            { name: 'Jan', yield: 20 },
                            { name: 'Feb', yield: 25 },
                            { name: 'Mar', yield: 30 },
                            { name: 'Apr', yield: 28 },
                            { name: 'May', yield: 35 },
                            { name: 'Jun', yield: 40 }
                        ];
                    case 'farm-performance':
                        return {
                            totalFarms: 12,
                            averageYield: 32.5,
                            topPerformer: 'Green Valley Farm'
                        };
                    case 'weather-analysis':
                        return {
                            averageTemperature: 25,
                            totalRainfall: 45.2,
                            optimalDays: 180
                        };
                    default:
                        return {};
                }
            }
            throw error;
        }
    }

// ===========================================
// MODEL APIs
// ===========================================
    async getModelVersions() {
        try {
            return await this.get('/models/versions');
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Model versions endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        version: '1.0.0',
                        name: 'Maize Yield Predictor',
                        accuracy: 85.2,
                        createdDate: '2024-01-15',
                        status: 'ACTIVE',
                        description: 'Demo model version'
                    }
                ];
            }
            return [];
        }
    }

    async getModelMetrics(modelId) {
        try {
            return await this.get(`/models/${modelId}/metrics`);
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Model metrics for ${modelId} not found, returning mock data`);
                return {
                    accuracy: 85.2,
                    precision: 87.1,
                    recall: 83.5,
                    f1Score: 85.3,
                    trainingData: 1000,
                    lastUpdated: new Date().toISOString()
                };
            }
            throw error;
        }
    }

    async trainModel(trainingData) {
        return this.post('/models/train', trainingData);
    }

// ===========================================
// SETTINGS APIs
// ===========================================
    async getSettings() {
        try {
            return await this.get('/settings');
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Settings endpoint not found, returning mock data');
                return {
                    theme: 'light',
                    notifications: true,
                    language: 'en',
                    timezone: 'UTC',
                    note: 'Demo settings - endpoint not implemented yet'
                };
            }
            return {};
        }
    }

    async updateSettings(settings) {
        return this.put('/settings', settings);
    }

// ===========================================
// FARMERS APIs
// ===========================================
    async getFarmers(page = 0, size = 10, search = '') {
        try {
            const params = new URLSearchParams({ page, size, search });
            const response = await this.get(`/farmers?${params}`);
            return Array.isArray(response) ? response : (response?.content || []);
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Farmers endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        name: 'John Mukamuri',
                        location: 'Harare',
                        phoneNumber: '+263 77 123 4567',
                        farmCount: 2,
                        totalArea: 45.5,
                        activeSessions: 3,
                        avgYield: 38.2
                    },
                    {
                        id: 2,
                        name: 'Mary Chikwanha',
                        location: 'Bulawayo',
                        phoneNumber: '+263 71 987 6543',
                        farmCount: 1,
                        totalArea: 22.3,
                        activeSessions: 1,
                        avgYield: 42.1
                    }
                ];
            }
            return [];
        }
    }

// ===========================================
// ALERTS AND TASKS APIs
// ===========================================
    async getAlerts() {
        try {
            const response = await this.get('/alerts');
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Alerts endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        type: 'WEATHER',
                        message: 'Heavy rainfall expected in the next 48 hours',
                        severity: 'WARNING',
                        timestamp: new Date().toISOString()
                    }
                ];
            }
            return [];
        }
    }

    async getTasks() {
        try {
            const response = await this.get('/tasks');
            return Array.isArray(response) ? response : [];
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Tasks endpoint not found, returning mock data');
                return [
                    {
                        id: 1,
                        title: 'Review planting schedule',
                        description: 'Check upcoming planting sessions for next month',
                        priority: 'HIGH',
                        dueDate: '2024-07-01',
                        status: 'PENDING'
                    }
                ];
            }
            return [];
        }
    }

}

// Create and export singleton instance
const apiService = new ApiService();

// Make debug info available globally in development
if (process.env.NODE_ENV === 'development') {
    window.apiService = apiService;
}

export default apiService;