// src/services/apiService.js - Enhanced to handle missing endpoints gracefully
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8181/api/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.enableLogging = process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development';
        this.failedEndpoints = new Set(); // Track endpoints that have failed
    }

    // Enhanced logging methods
    logRequest(method, url, data = null) {
        if (!this.enableLogging) return;
        console.group(`🔄 API Request: ${method.toUpperCase()} ${url}`);
        console.log('📤 Request URL:', url);
        console.log('🕒 Timestamp:', new Date().toISOString());
        if (data) console.log('📦 Request Body:', data);
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
        const logLevel = isAuthError ? 'error' : isMissingEndpoint ? 'warn' : 'error';

        console.group(`${isAuthError ? '❌' : isMissingEndpoint ? '⚠️' : '💥'} API ${logLevel.toUpperCase()}: ${method.toUpperCase()} ${url}`);
        console[logLevel]('Error:', error.message);
        console[logLevel]('Status:', status);
        console[logLevel]('⏱️ Duration:', `${duration}ms`);
        console[logLevel]('🕒 Timestamp:', new Date().toISOString());
        console.groupEnd();
    }

    // Core HTTP methods with enhanced error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const startTime = Date.now();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader(),
                ...options.headers,
            },
            ...options,
        };

        this.logRequest(options.method || 'GET', url, options.body);

        try {
            const response = await fetch(url, config);
            const duration = Date.now() - startTime;

            if (!response.ok) {
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                this.logError(options.method || 'GET', url, error, duration, response.status);
                throw error;
            }

            const data = await response.json();
            this.logResponse(options.method || 'GET', url, data, duration);

            // Remove from failed endpoints if request succeeds
            this.failedEndpoints.delete(endpoint);

            return data;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logError(options.method || 'GET', url, error, duration, error.status);

            // Track failed endpoints
            this.failedEndpoints.add(endpoint);

            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // =====================================
    // DASHBOARD & ANALYTICS APIs - ENHANCED
    // =====================================

    async getDashboardStats() {
        try {
            return await this.get('/dashboard/stats');
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Dashboard stats endpoint not found, returning enhanced mock data');
                return {
                    avgYield: 4.2,
                    yieldTrend: 12.5,
                    predictionAccuracy: 87.5,
                    activeFarms: 22,
                    totalArea: '--',
                    totalUsers: 156,
                    totalFarmers: 89,
                    activeSessions: 34,
                    totalPredictions: 267,
                    yieldGrowth: 8.3,
                    userGrowth: 15.2,
                    farmerGrowth: 12.8,
                    sessionGrowth: 22.1,
                    predictionGrowth: 18.7,
                    modelAccuracy: 87.5,
                    accuracyImprovement: 3.2,
                    lastUpdated: new Date().toISOString(),
                    note: 'Enhanced mock data - replace with real API'
                };
            }
            throw error;
        }
    }

    async getYieldTrends(dateRange = '6months', farmId = null) {
        try {
            const params = new URLSearchParams();
            if (dateRange) params.append('dateRange', dateRange);
            if (farmId) params.append('farmId', farmId);

            return await this.get(`/dashboard/yield-trends?${params}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Yield trends endpoint not found, returning enhanced mock data');
                return this.getMockYieldTrends(dateRange);
            }
            throw error;
        }
    }

    // Enhanced Analytics API with comprehensive mock data
    async getAnalytics(type, params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            return await this.get(`/analytics/${type}?${queryParams}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn(`⚠️ Analytics endpoint for ${type} not found, returning enhanced mock data`);
                return this.getMockAnalyticsData(type, params);
            }
            throw error;
        }
    }

    // New method for insights and recommendations
    async getInsightsAndRecommendations(farmId = null, dateRange = '6months') {
        try {
            const params = new URLSearchParams();
            if (farmId) params.append('farmId', farmId);
            if (dateRange) params.append('dateRange', dateRange);

            return await this.get(`/analytics/insights-recommendations?${params}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Insights & recommendations endpoint not found, returning mock data');
                return this.getMockInsightsRecommendations();
            }
            throw error;
        }
    }

    // New method for quick stats
    async getQuickStats(farmId = null) {
        try {
            const params = farmId ? `?farmId=${farmId}` : '';
            return await this.get(`/analytics/quick-stats${params}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Quick stats endpoint not found, returning mock data');
                return this.getMockQuickStats();
            }
            throw error;
        }
    }

    // Enhanced alerts and tasks
    async getAlerts() {
        try {
            return await this.get('/alerts');
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Alerts endpoint not found, returning mock data');
                return [];
            }
            throw error;
        }
    }

    async getTasks() {
        try {
            return await this.get('/tasks');
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Tasks endpoint not found, returning mock data');
                return [];
            }
            throw error;
        }
    }

    async getRecentActivity(limit = 10) {
        try {
            return await this.get(`/dashboard/recent-activity?limit=${limit}`);
        } catch (error) {
            if (error.status === 404) {
                console.warn('⚠️ Recent activity endpoint not found, returning mock data');
                return this.getMockRecentActivity();
            }
            throw error;
        }
    }

    // =====================================
    // MOCK DATA GENERATORS - ENHANCED
    // =====================================

    getMockYieldTrends(dateRange = '6months') {
        const monthsMap = {
            '3months': 3,
            '6months': 6,
            '12months': 12,
            'year': 12
        };

        const months = monthsMap[dateRange] || 6;
        const trends = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            trends.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                yield: Number((3.5 + Math.random() * 2 + Math.sin(i * 0.5) * 0.5).toFixed(1)),
                predicted: Number((3.8 + Math.random() * 1.8 + Math.sin(i * 0.5) * 0.4).toFixed(1)),
                target: 4.5,
                date: date.toISOString()
            });
        }

        return trends;
    }

    getMockAnalyticsData(type, params) {
        const baseData = {
            insights: [
                "Average yield has increased by 12.5% compared to last season",
                "Weather conditions have been favorable for the past 3 months",
                "Soil moisture levels are optimal in 78% of monitored farms",
                "Prediction accuracy has improved to 87.5% with recent model updates"
            ],
            recommendations: [
                "Consider increasing fertilizer application by 10% for upcoming season",
                "Implement drip irrigation in areas with inconsistent rainfall",
                "Monitor for pest activity during the next 2 weeks",
                "Schedule soil testing for farms showing declining yields"
            ]
        };

        switch (type) {
            case 'yield-trends':
                return {
                    ...baseData,
                    chartData: this.getMockYieldTrends(params.dateRange),
                    summary: {
                        averageYield: 4.2,
                        yieldGrowth: 12.5,
                        bestPerformingFarm: "Farm A",
                        totalFarmsAnalyzed: 22
                    }
                };

            case 'farm-performance':
                return {
                    ...baseData,
                    chartData: [
                        { farm: 'Farm A', yield: 4.8, efficiency: 92, area: 25 },
                        { farm: 'Farm B', yield: 4.2, efficiency: 85, area: 18 },
                        { farm: 'Farm C', yield: 3.9, efficiency: 78, area: 32 },
                        { farm: 'Farm D', yield: 4.5, efficiency: 88, area: 22 },
                        { farm: 'Farm E', yield: 4.1, efficiency: 82, area: 28 }
                    ],
                    summary: {
                        topPerformer: "Farm A",
                        averageEfficiency: 85,
                        totalArea: 125
                    }
                };

            case 'prediction-accuracy':
                return {
                    ...baseData,
                    chartData: [
                        { month: 'Jan', accuracy: 82, predictions: 45 },
                        { month: 'Feb', accuracy: 85, predictions: 52 },
                        { month: 'Mar', accuracy: 87, predictions: 48 },
                        { month: 'Apr', accuracy: 89, predictions: 61 },
                        { month: 'May', accuracy: 87, predictions: 58 },
                        { month: 'Jun', accuracy: 91, predictions: 64 }
                    ],
                    summary: {
                        currentAccuracy: 87.5,
                        improvement: 3.2,
                        totalPredictions: 328
                    }
                };

            case 'weather-analysis':
                return {
                    ...baseData,
                    chartData: [
                        { date: '2025-06-01', temperature: 24, rainfall: 12, humidity: 65 },
                        { date: '2025-06-02', temperature: 26, rainfall: 0, humidity: 58 },
                        { date: '2025-06-03', temperature: 25, rainfall: 8, humidity: 72 },
                        { date: '2025-06-04', temperature: 23, rainfall: 15, humidity: 78 },
                        { date: '2025-06-05', temperature: 27, rainfall: 0, humidity: 55 },
                        { date: '2025-06-06', temperature: 28, rainfall: 3, humidity: 62 },
                        { date: '2025-06-07', temperature: 26, rainfall: 18, humidity: 81 }
                    ],
                    summary: {
                        averageTemperature: 25.6,
                        totalRainfall: 56,
                        averageHumidity: 67.3
                    }
                };

            case 'crop-health':
                return {
                    ...baseData,
                    chartData: [
                        { metric: 'Healthy', value: 78, color: '#22c55e' },
                        { metric: 'At Risk', value: 15, color: '#f59e0b' },
                        { metric: 'Critical', value: 7, color: '#ef4444' }
                    ],
                    summary: {
                        healthyPercentage: 78,
                        atRiskFarms: 15,
                        criticalIssues: 7
                    }
                };

            default:
                return { ...baseData, chartData: [], summary: {} };
        }
    }

    getMockInsightsRecommendations() {
        return {
            insights: [
                "Your farms are performing 15% above regional average",
                "Weather patterns indicate optimal planting conditions for next month",
                "Soil nutrient levels are within acceptable ranges across 85% of farms",
                "Recent rainfall has improved soil moisture to optimal levels",
                "Current yield predictions show 8% improvement over last season"
            ],
            recommendations: [
                "Apply nitrogen fertilizer to farms showing deficiency symptoms",
                "Schedule irrigation for farms in the eastern region due to low rainfall forecast",
                "Consider planting drought-resistant varieties in area zones 3 and 4",
                "Implement pest monitoring protocols for the upcoming growing season",
                "Optimize planting density based on soil test results from last quarter"
            ],
            priority: {
                high: 2,
                medium: 5,
                low: 3
            },
            lastUpdated: new Date().toISOString()
        };
    }

    getMockQuickStats() {
        return {
            bestPerformingFarm: "Sunset Valley Farm",
            topCropVariety: "SC627",
            seasonProgress: 65,
            weatherFavorability: 82,
            avgSoilHealth: 78,
            irrigationEfficiency: 91,
            pestRiskLevel: "Low",
            harvestReadiness: "23%",
            lastUpdated: new Date().toISOString()
        };
    }

    getMockRecentActivity() {
        const activities = [
            "New yield prediction generated for Farm Delta",
            "Weather alert issued for central region",
            "Irrigation schedule updated for 5 farms",
            "Soil test results received for Farm Alpha",
            "Fertilizer recommendation sent to 12 farmers"
        ];

        return activities.map((activity, index) => ({
            id: index + 1,
            description: activity,
            timestamp: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString(),
            type: ['prediction', 'alert', 'irrigation', 'soil', 'recommendation'][index],
            priority: ['medium', 'high', 'low', 'medium', 'low'][index]
        }));
    }

    // User APIs
    async getUsers(page = 0, size = 50, search = '') {
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

    // Addition to src/services/apiService.js - Updated getFarmById method

// Farm APIs - Updated with proper error handling for farm details
    async getFarmById(id) {
        try {
            // Validate input ID
            if (!id || id === 'undefined' || id === 'null') {
                console.error('❌ Invalid farm ID provided:', id);
                throw new Error('Invalid farm ID provided');
            }

            console.log(`🔍 Fetching farm details for ID: ${id} (type: ${typeof id})`);

            // Use the correct endpoint that matches the backend controller
            const farm = await this.get(`/farms/${id}`);

            console.log('✅ Farm details fetched successfully:', farm);
            return farm;
        } catch (error) {
            console.error(`❌ Failed to fetch farm ${id}:`, error);

            // Handle specific error cases
            if (error.message.includes('Invalid farm ID')) {
                throw error; // Re-throw validation errors
            } else if (error.status === 404) {
                throw new Error(`Farm with ID ${id} not found`);
            } else if (error.status === 403) {
                throw new Error(`Access denied to farm ${id}`);
            } else if (error.status === 401) {
                throw new Error('Authentication required to view farm details');
            }

            // For development/testing, return mock data if endpoint isn't ready
            if (error.status === 500 || !navigator.onLine) {
                console.warn('⚠️ Backend error or offline, returning mock farm data');
                return {
                    id: parseInt(id) || id,
                    name: `Mock Farm ${id}`,
                    location: 'Sample Location, Zimbabwe',
                    sizeHectares: 25.5,
                    latitude: -17.8252,
                    longitude: 31.0335,
                    elevation: 1472,
                    createdAt: '2024-01-15T10:30:00Z',
                    soilData: {
                        id: 1,
                        farmId: parseInt(id) || id,
                        soilType: 'Loamy Clay',
                        phLevel: 6.8,
                        organicMatterPercentage: 3.2,
                        nitrogenContent: 0.15,
                        phosphorusContent: 0.08,
                        potassiumContent: 0.12,
                        moistureContent: 22.5,
                        soilHealthScore: 78,
                        fertilizerRecommendation: 'Apply NPK 10:10:10 at 300kg/ha before planting. Consider lime application to raise pH slightly.'
                    },
                    activePlantingSessions: [
                        {
                            id: 1,
                            farmId: parseInt(id) || id,
                            maizeVariety: {
                                id: 1,
                                name: 'ZM 523',
                                description: 'High-yielding drought-tolerant variety'
                            },
                            plantingDate: '2024-11-01',
                            expectedHarvestDate: '2025-04-15',
                            seedRateKgPerHectare: 25,
                            rowSpacingCm: 90,
                            fertilizerType: 'NPK 10:10:10',
                            fertilizerAmountKgPerHectare: 300,
                            irrigationMethod: 'Drip Irrigation',
                            notes: 'Excellent growing conditions, regular monitoring scheduled',
                            daysFromPlanting: 45,
                            growthStage: 'GROWING',
                            latestPrediction: {
                                id: 1,
                                predictedYield: 6.8,
                                confidence: 87,
                                predictionDate: '2024-12-01T00:00:00Z'
                            }
                        },
                        {
                            id: 2,
                            farmId: parseInt(id) || id,
                            maizeVariety: {
                                id: 2,
                                name: 'SC627',
                                description: 'Medium maturing variety with good disease resistance'
                            },
                            plantingDate: '2024-10-15',
                            expectedHarvestDate: '2025-03-30',
                            seedRateKgPerHectare: 22,
                            rowSpacingCm: 75,
                            fertilizerType: 'Compound D',
                            fertilizerAmountKgPerHectare: 250,
                            irrigationMethod: 'Rain-fed',
                            notes: 'Monitoring for armyworm activity',
                            daysFromPlanting: 62,
                            growthStage: 'TASSELING',
                            latestPrediction: {
                                id: 2,
                                predictedYield: 5.2,
                                confidence: 82,
                                predictionDate: '2024-12-10T00:00:00Z'
                            }
                        }
                    ]
                };
            }

            throw error;
        }
    }

// Enhanced method to get planting sessions for a specific farm
    async getPlantingSessionsByFarmId(farmId) {
        try {
            // Validate input farmId
            if (!farmId || farmId === 'undefined' || farmId === 'null') {
                console.error('❌ Invalid farmId provided for planting sessions:', farmId);
                return [];
            }

            console.log(`🌱 Fetching planting sessions for farm ID: ${farmId}`);

            // Use the correct endpoint that matches the backend controller
            const sessions = await this.get(`/planting-sessions/farms/${farmId}`);

            console.log('✅ Planting sessions fetched successfully:', sessions);

            // Ensure we always return an array
            if (!sessions) {
                console.warn('⚠️ getPlantingSessionsByFarmId returned null/undefined, returning empty array');
                return [];
            }

            if (!Array.isArray(sessions)) {
                console.warn('⚠️ getPlantingSessionsByFarmId response is not an array:', typeof sessions, sessions);
                // If it's a paginated response, extract the content
                if (sessions && sessions.content && Array.isArray(sessions.content)) {
                    console.log('🔍 Extracting planting sessions from paginated response');
                    return sessions.content;
                }
                return [];
            }

            return sessions;
        } catch (error) {
            console.error(`❌ Failed to fetch planting sessions for farm ${farmId}:`, error);

            // Handle specific error cases
            if (error.status === 404) {
                console.warn(`⚠️ No planting sessions found for farm ${farmId}`);
                return [];
            } else if (error.status === 403) {
                console.warn(`⚠️ Access denied to planting sessions for farm ${farmId}, returning empty array`);
                return [];
            }

            // For development/testing, return mock data if endpoint isn't ready
            if (error.status === 500 || !navigator.onLine) {
                console.warn('⚠️ Backend error or offline, returning mock planting sessions');
                return [
                    {
                        id: 1,
                        farmId: parseInt(farmId) || farmId,
                        maizeVariety: {
                            id: 1,
                            name: 'ZM 523',
                            description: 'High-yielding drought-tolerant variety'
                        },
                        plantingDate: '2024-11-01',
                        expectedHarvestDate: '2025-04-15',
                        seedRateKgPerHectare: 25,
                        rowSpacingCm: 90,
                        fertilizerType: 'NPK 10:10:10',
                        fertilizerAmountKgPerHectare: 300,
                        irrigationMethod: 'Drip Irrigation',
                        notes: 'Mock planting session - endpoint not implemented yet',
                        daysFromPlanting: 45,
                        growthStage: 'GROWING',
                        latestPrediction: {
                            id: 1,
                            predictedYield: 6.8,
                            confidence: 87,
                            predictionDate: '2024-12-01T00:00:00Z'
                        }
                    }
                ];
            }

            // Return empty array for other errors to prevent crashes
            return [];
        }
    }

// Updated method for fetching planting sessions with farm filtering
    async getPlantingSessions(farmId = null) {
        try {
            console.log(`🌱 Fetching planting sessions${farmId ? ` for farm ${farmId}` : ' (all)'}`);

            // If farmId is provided, get sessions for specific farm
            if (farmId && farmId !== 'undefined' && farmId !== 'null') {
                return await this.getPlantingSessionsByFarmId(farmId);
            }

            // Otherwise get all sessions
            const endpoint = '/planting-sessions';
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
                        farmId: farmId || 1,
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
                        farmId: farmId || 2,
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
            return [];
        }
    }// Addition to src/services/apiService.js - Updated getFarmById method

// Farm APIs - Updated with proper error handling for farm details
    async getFarmById(id) {
        try {
            console.log(`🔍 Fetching farm details for ID: ${id}`);

            // Use the correct endpoint that matches the backend controller
            const farm = await this.get(`/farms/${id}`);

            console.log('✅ Farm details fetched successfully:', farm);
            return farm;
        } catch (error) {
            console.error(`❌ Failed to fetch farm ${id}:`, error);

            // Handle specific error cases
            if (error.status === 404) {
                throw new Error(`Farm with ID ${id} not found`);
            } else if (error.status === 403) {
                throw new Error(`Access denied to farm ${id}`);
            } else if (error.status === 401) {
                throw new Error('Authentication required to view farm details');
            }

            // For development/testing, return mock data if endpoint isn't ready
            if (error.status === 500 || !navigator.onLine) {
                console.warn('⚠️ Backend error or offline, returning mock farm data');
                return {
                    id: parseInt(id),
                    name: `Mock Farm ${id}`,
                    location: 'Sample Location, Zimbabwe',
                    sizeHectares: 25.5,
                    latitude: -17.8252,
                    longitude: 31.0335,
                    elevation: 1472,
                    createdAt: '2024-01-15T10:30:00Z',
                    soilData: {
                        id: 1,
                        farmId: parseInt(id),
                        soilType: 'Loamy Clay',
                        phLevel: 6.8,
                        organicMatterPercentage: 3.2,
                        nitrogenContent: 0.15,
                        phosphorusContent: 0.08,
                        potassiumContent: 0.12,
                        moistureContent: 22.5,
                        sampleDate: '2024-10-15T00:00:00Z',
                        soilHealthScore: 78,
                        fertilizerRecommendation: 'Apply NPK 10:10:10 at 300kg/ha before planting. Consider lime application to raise pH slightly.'
                    },
                    activePlantingSessions: [
                        {
                            id: 1,
                            farmId: parseInt(id),
                            maizeVariety: {
                                id: 1,
                                name: 'ZM 523',
                                description: 'High-yielding drought-tolerant variety'
                            },
                            plantingDate: '2024-11-01',
                            expectedHarvestDate: '2025-04-15',
                            seedRateKgPerHectare: 25,
                            rowSpacingCm: 90,
                            fertilizerType: 'NPK 10:10:10',
                            fertilizerAmountKgPerHectare: 300,
                            irrigationMethod: 'Drip Irrigation',
                            notes: 'Excellent growing conditions, regular monitoring scheduled',
                            daysFromPlanting: 45,
                            growthStage: 'GROWING',
                            latestPrediction: {
                                id: 1,
                                predictedYield: 6.8,
                                confidence: 87,
                                predictionDate: '2024-12-01T00:00:00Z'
                            }
                        },
                        {
                            id: 2,
                            farmId: parseInt(id),
                            maizeVariety: {
                                id: 2,
                                name: 'SC627',
                                description: 'Medium maturing variety with good disease resistance'
                            },
                            plantingDate: '2024-10-15',
                            expectedHarvestDate: '2025-03-30',
                            seedRateKgPerHectare: 22,
                            rowSpacingCm: 75,
                            fertilizerType: 'Compound D',
                            fertilizerAmountKgPerHectare: 250,
                            irrigationMethod: 'Rain-fed',
                            notes: 'Monitoring for armyworm activity',
                            daysFromPlanting: 62,
                            growthStage: 'TASSELING',
                            latestPrediction: {
                                id: 2,
                                predictedYield: 5.2,
                                confidence: 82,
                                predictionDate: '2024-12-10T00:00:00Z'
                            }
                        }
                    ]
                };
            }

            throw error;
        }
    }

// Enhanced method to get planting sessions for a specific farm
    async getPlantingSessionsByFarmId(farmId) {
        try {
            console.log(`🌱 Fetching planting sessions for farm ID: ${farmId}`);

            // Use the correct endpoint that matches the backend controller
            const sessions = await this.get(`/planting-sessions/farms/${farmId}`);

            console.log('✅ Planting sessions fetched successfully:', sessions);

            // Ensure we always return an array
            if (!sessions) {
                console.warn('⚠️ getPlantingSessionsByFarmId returned null/undefined, returning empty array');
                return [];
            }

            if (!Array.isArray(sessions)) {
                console.warn('⚠️ getPlantingSessionsByFarmId response is not an array:', typeof sessions, sessions);
                // If it's a paginated response, extract the content
                if (sessions && sessions.content && Array.isArray(sessions.content)) {
                    console.log('🔍 Extracting planting sessions from paginated response');
                    return sessions.content;
                }
                return [];
            }

            return sessions;
        } catch (error) {
            console.error(`❌ Failed to fetch planting sessions for farm ${farmId}:`, error);

            // Handle specific error cases
            if (error.status === 404) {
                console.warn(`⚠️ No planting sessions found for farm ${farmId}`);
                return [];
            } else if (error.status === 403) {
                throw new Error(`Access denied to planting sessions for farm ${farmId}`);
            }

            // For development/testing, return mock data if endpoint isn't ready
            if (error.status === 500 || !navigator.onLine) {
                console.warn('⚠️ Backend error or offline, returning mock planting sessions');
                return [
                    {
                        id: 1,
                        farmId: parseInt(farmId),
                        maizeVariety: {
                            id: 1,
                            name: 'ZM 523',
                            description: 'High-yielding drought-tolerant variety'
                        },
                        plantingDate: '2024-11-01',
                        expectedHarvestDate: '2025-04-15',
                        seedRateKgPerHectare: 25,
                        rowSpacingCm: 90,
                        fertilizerType: 'NPK 10:10:10',
                        fertilizerAmountKgPerHectare: 300,
                        irrigationMethod: 'Drip Irrigation',
                        notes: 'Mock planting session - endpoint not implemented yet',
                        daysFromPlanting: 45,
                        growthStage: 'GROWING',
                        latestPrediction: {
                            id: 1,
                            predictedYield: 6.8,
                            confidence: 87,
                            predictionDate: '2024-12-01T00:00:00Z'
                        }
                    }
                ];
            }

            throw error;
        }
    }

// Updated method for fetching planting sessions with farm filtering
    async getPlantingSessions(farmId = null) {
        try {
            console.log(`🌱 Fetching planting sessions${farmId ? ` for farm ${farmId}` : ' (all)'}`);

            // If farmId is provided, get sessions for specific farm
            if (farmId) {
                return await this.getPlantingSessionsByFarmId(farmId);
            }

            // Otherwise get all sessions
            const endpoint = '/planting-sessions';
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
                        farmId: farmId || 1,
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
                        farmId: farmId || 2,
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
            return [];
        }
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