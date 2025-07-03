// src/utils/apiHealthChecker.js - API Health Monitoring and Diagnostics
import apiService from '../services/apiService';

class ApiHealthChecker {
    constructor() {
        this.endpoints = [
            { name: 'Dashboard Stats', path: '/dashboard/stats', method: 'getDashboardStats' },
            { name: 'Yield Trends', path: '/dashboard/yield-trends', method: 'getYieldTrends' },
            { name: 'Analytics - Yield', path: '/analytics/yield-trends', method: () => apiService.getAnalytics('yield-trends') },
            { name: 'Analytics - Farm Performance', path: '/analytics/farm-performance', method: () => apiService.getAnalytics('farm-performance') },
            { name: 'Analytics - Prediction Accuracy', path: '/analytics/prediction-accuracy', method: () => apiService.getAnalytics('prediction-accuracy') },
            { name: 'Insights & Recommendations', path: '/analytics/insights-recommendations', method: 'getInsightsAndRecommendations' },
            { name: 'Quick Stats', path: '/analytics/quick-stats', method: 'getQuickStats' },
            { name: 'Farms List', path: '/farms', method: 'getFarms' },
            { name: 'Weather Data', path: '/weather', method: () => apiService.getWeatherData(null, null, null) },
            { name: 'Predictions', path: '/predictions', method: 'getPredictions' },
            { name: 'Settings', path: '/settings', method: 'getSettings' }
        ];

        this.healthStatus = new Map();
        this.lastCheck = null;
        this.checkInterval = null;
        this.listeners = new Set();
    }

    // Add listener for health status changes
    addListener(callback) {
        this.listeners.add(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners of health status changes
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.getHealthSummary());
            } catch (error) {
                console.error('Error in health status listener:', error);
            }
        });
    }

    // Check health of a single endpoint
    async checkEndpoint(endpoint) {
        const startTime = Date.now();

        try {
            let method;
            if (typeof endpoint.method === 'string') {
                method = apiService[endpoint.method].bind(apiService);
            } else {
                method = endpoint.method;
            }

            const result = await Promise.race([
                method(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 10000)
                )
            ]);

            const responseTime = Date.now() - startTime;

            const status = {
                name: endpoint.name,
                path: endpoint.path,
                status: 'healthy',
                responseTime,
                lastChecked: new Date().toISOString(),
                error: null,
                hasData: result && (Array.isArray(result) ? result.length > 0 : Object.keys(result).length > 0),
                isMockData: this.detectMockData(result)
            };

            this.healthStatus.set(endpoint.name, status);
            return status;

        } catch (error) {
            const responseTime = Date.now() - startTime;

            const status = {
                name: endpoint.name,
                path: endpoint.path,
                status: this.categorizeError(error),
                responseTime,
                lastChecked: new Date().toISOString(),
                error: {
                    message: error.message,
                    status: error.status,
                    type: error.name
                },
                hasData: false,
                isMockData: false
            };

            this.healthStatus.set(endpoint.name, status);
            return status;
        }
    }

    // Detect if response contains mock/demo data
    detectMockData(data) {
        if (!data) return false;

        const dataStr = JSON.stringify(data).toLowerCase();
        return dataStr.includes('demo') ||
            dataStr.includes('mock') ||
            dataStr.includes('sample') ||
            dataStr.includes('not implemented') ||
            dataStr.includes('endpoint not found');
    }

    // Categorize error types
    categorizeError(error) {
        if (error.message === 'Timeout') return 'timeout';
        if (error.status === 404) return 'not_found';
        if (error.status === 500) return 'server_error';
        if (error.status === 401 || error.status === 403) return 'auth_error';
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) return 'network_error';
        return 'unknown_error';
    }

    // Check health of all endpoints
    async checkAllEndpoints() {
        console.log('🔍 Starting API health check...');

        const results = await Promise.allSettled(
            this.endpoints.map(endpoint => this.checkEndpoint(endpoint))
        );

        this.lastCheck = new Date().toISOString();

        // Log results
        const summary = this.getHealthSummary();
        console.log('📊 API Health Check Results:', summary);

        this.notifyListeners();
        return summary;
    }

    // Get current health summary
    getHealthSummary() {
        const statuses = Array.from(this.healthStatus.values());

        const summary = {
            lastCheck: this.lastCheck,
            totalEndpoints: this.endpoints.length,
            healthy: statuses.filter(s => s.status === 'healthy').length,
            unhealthy: statuses.filter(s => s.status !== 'healthy').length,
            usingMockData: statuses.filter(s => s.isMockData).length,
            averageResponseTime: this.calculateAverageResponseTime(statuses),
            endpoints: statuses,
            overallStatus: this.calculateOverallStatus(statuses)
        };

        return summary;
    }

    // Calculate average response time for healthy endpoints
    calculateAverageResponseTime(statuses) {
        const healthyStatuses = statuses.filter(s => s.status === 'healthy');
        if (healthyStatuses.length === 0) return 0;

        const totalTime = healthyStatuses.reduce((sum, s) => sum + s.responseTime, 0);
        return Math.round(totalTime / healthyStatuses.length);
    }

    // Calculate overall system status
    calculateOverallStatus(statuses) {
        const healthyCount = statuses.filter(s => s.status === 'healthy').length;
        const totalCount = statuses.length;
        const healthyPercentage = (healthyCount / totalCount) * 100;

        if (healthyPercentage >= 80) return 'good';
        if (healthyPercentage >= 50) return 'degraded';
        return 'critical';
    }

    // Start periodic health checks
    startPeriodicChecks(intervalMinutes = 5) {
        this.stopPeriodicChecks();

        // Initial check
        this.checkAllEndpoints();

        // Schedule periodic checks
        this.checkInterval = setInterval(() => {
            this.checkAllEndpoints();
        }, intervalMinutes * 60 * 1000);

        console.log(`🔄 Started periodic API health checks every ${intervalMinutes} minutes`);
    }

    // Stop periodic health checks
    stopPeriodicChecks() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('⏸️ Stopped periodic API health checks');
        }
    }

    // Get status for specific endpoint
    getEndpointStatus(endpointName) {
        return this.healthStatus.get(endpointName) || null;
    }

    // Get endpoints by status
    getEndpointsByStatus(status) {
        return Array.from(this.healthStatus.values()).filter(endpoint => endpoint.status === status);
    }

    // Generate diagnostic report
    generateDiagnosticReport() {
        const summary = this.getHealthSummary();

        const report = {
            timestamp: new Date().toISOString(),
            summary,
            recommendations: this.generateRecommendations(summary),
            troubleshooting: this.generateTroubleshootingSteps(summary)
        };

        return report;
    }

    // Generate recommendations based on health status
    generateRecommendations(summary) {
        const recommendations = [];

        if (summary.overallStatus === 'critical') {
            recommendations.push('🚨 Critical: Most APIs are down. Check server status and network connectivity.');
        } else if (summary.overallStatus === 'degraded') {
            recommendations.push('⚠️ Warning: Some APIs are experiencing issues. Monitor closely.');
        }

        if (summary.usingMockData > 0) {
            recommendations.push('📋 Info: Some endpoints are returning mock data. Check API implementation.');
        }

        if (summary.averageResponseTime > 5000) {
            recommendations.push('🐌 Performance: APIs are responding slowly. Check server load.');
        }

        const networkErrors = summary.endpoints.filter(e => e.status === 'network_error').length;
        if (networkErrors > 0) {
            recommendations.push('🌐 Network: Check internet connection and API server availability.');
        }

        const notFoundErrors = summary.endpoints.filter(e => e.status === 'not_found').length;
        if (notFoundErrors > 0) {
            recommendations.push('🔍 Missing: Some API endpoints are not implemented or misconfigured.');
        }

        return recommendations;
    }

    // Generate troubleshooting steps
    generateTroubleshootingSteps(summary) {
        const steps = [];

        steps.push('1. Check network connectivity and internet access');
        steps.push('2. Verify API server is running and accessible');
        steps.push('3. Confirm API base URL in environment configuration');
        steps.push('4. Check for authentication/authorization issues');
        steps.push('5. Review server logs for error details');

        if (summary.overallStatus === 'critical') {
            steps.push('6. Consider using offline mode or cached data');
            steps.push('7. Contact system administrator or technical support');
        }

        return steps;
    }

    // Export health data for debugging
    exportHealthData() {
        const data = {
            healthSummary: this.getHealthSummary(),
            diagnosticReport: this.generateDiagnosticReport(),
            browserInfo: {
                userAgent: navigator.userAgent,
                onLine: navigator.onLine,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled
            },
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `api_health_report_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Create singleton instance
const apiHealthChecker = new ApiHealthChecker();

// React hook for using API health status
export const useApiHealth = () => {
    const [healthStatus, setHealthStatus] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const updateHealthStatus = (status) => {
            setHealthStatus(status);
            setLoading(false);
        };

        // Add listener
        apiHealthChecker.addListener(updateHealthStatus);

        // Initial check if not done recently
        if (!apiHealthChecker.lastCheck) {
            apiHealthChecker.checkAllEndpoints().then(updateHealthStatus);
        } else {
            updateHealthStatus(apiHealthChecker.getHealthSummary());
            setLoading(false);
        }

        // Cleanup
        return () => {
            apiHealthChecker.removeListener(updateHealthStatus);
        };
    }, []);

    return {
        healthStatus,
        loading,
        checkHealth: () => apiHealthChecker.checkAllEndpoints(),
        getEndpointStatus: (name) => apiHealthChecker.getEndpointStatus(name),
        exportReport: () => apiHealthChecker.exportHealthData()
    };
};

// Component for displaying API health status
export const ApiHealthIndicator = ({ showDetails = false }) => {
    const { healthStatus, loading, checkHealth } = useApiHealth();

    if (loading || !healthStatus) {
        return (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span>Checking API status...</span>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'text-green-600';
            case 'degraded': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return '🟢';
            case 'degraded': return '🟡';
            case 'critical': return '🔴';
            default: return '⚪';
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
                <span>{getStatusIcon(healthStatus.overallStatus)}</span>
                <span className={getStatusColor(healthStatus.overallStatus)}>
                    API Status: {healthStatus.overallStatus.toUpperCase()}
                </span>
                <span className="text-gray-500">
                    ({healthStatus.healthy}/{healthStatus.totalEndpoints} healthy)
                </span>
                <button
                    onClick={checkHealth}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                >
                    Refresh
                </button>
            </div>

            {showDetails && (
                <div className="text-xs text-gray-600 space-y-1">
                    <div>Avg Response: {healthStatus.averageResponseTime}ms</div>
                    <div>Mock Data: {healthStatus.usingMockData} endpoints</div>
                    <div>Last Check: {new Date(healthStatus.lastCheck).toLocaleTimeString()}</div>
                </div>
            )}
        </div>
    );
};

export default apiHealthChecker;