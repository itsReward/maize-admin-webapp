// src/pages/AnalyticsPage.jsx - Role-Based Analytics Page
import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, PieChart, Download, Calendar, Filter, RefreshCw,
    AlertTriangle, CheckCircle, Clock, Target, Thermometer, Droplets,
    Activity, Zap, Shield, Leaf, Wifi, WifiOff, User, Users
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
    ComposedChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ErrorBoundary, { ApiErrorFallback, LoadingWithTimeout } from '../components/common/ErrorBoundary';

// Role-based Analytics Page for both Admin and Farmer users
const AnalyticsPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isFarmer = user?.role === 'FARMER';

    const [selectedMetric, setSelectedMetric] = useState('yield_trends');
    const [dateRange, setDateRange] = useState('6months');
    const [selectedFarm, setSelectedFarm] = useState(isAdmin ? 'all' : 'my_farms');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [connectionStatus, setConnectionStatus] = useState('online');

    // Get user's farms if farmer
    const { data: userFarms, loading: userFarmsLoading, error: userFarmsError } = useApi(
        () => isFarmer ? apiService.getFarms(user.id) : Promise.resolve([]),
        [user.id, isFarmer],
        {
            enableCache: true,
            cacheKey: `user-farms-${user.id}`,
            fallbackData: isFarmer ? getMockUserFarms() : []
        }
    );

    // Enhanced API calls with role-based parameters
    const getAnalyticsParams = () => {
        const baseParams = { dateRange };

        if (isFarmer) {
            // For farmers, always filter by their farms
            const farmIds = userFarms?.map(farm => farm.id) || [];
            return { ...baseParams, userId: user.id, farmIds };
        } else if (isAdmin && selectedFarm !== 'all') {
            // For admins, apply farm filter if selected
            return { ...baseParams, farm: selectedFarm };
        }

        return baseParams;
    };

    const { data: yieldTrends, loading: yieldLoading, error: yieldError, refetch: refetchYield, isStale: yieldStale } = useApi(
        () => apiService.getAnalytics('yield-trends', getAnalyticsParams()),
        [dateRange, selectedFarm, userFarms],
        {
            retryAttempts: 3,
            retryDelay: 2000,
            enableCache: true,
            cacheKey: `yield-trends-${user.role}-${dateRange}-${selectedFarm}-${user.id}`,
            fallbackData: getMockAnalyticsData('yield_trends'),
            onError: (error) => console.warn('Yield trends API failed:', error),
            timeout: 15000
        }
    );

    const { data: farmPerformance, loading: farmLoading, error: farmError, refetch: refetchFarm } = useApi(
        () => apiService.getAnalytics('farm-performance', getAnalyticsParams()),
        [dateRange, selectedFarm, userFarms],
        {
            retryAttempts: 2,
            enableCache: true,
            cacheKey: `farm-performance-${user.role}-${dateRange}-${selectedFarm}-${user.id}`,
            fallbackData: getMockAnalyticsData('farm_performance'),
            timeout: 15000
        }
    );

    const { data: predictionAccuracy, loading: predictionLoading, error: predictionError, refetch: refetchPrediction } = useApi(
        () => apiService.getAnalytics('prediction-accuracy', getAnalyticsParams()),
        [dateRange, selectedFarm, userFarms],
        {
            retryAttempts: 2,
            enableCache: true,
            cacheKey: `prediction-accuracy-${user.role}-${dateRange}-${selectedFarm}-${user.id}`,
            fallbackData: getMockAnalyticsData('prediction_accuracy'),
            timeout: 15000
        }
    );

    const { data: weatherAnalysis, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useApi(
        () => apiService.getAnalytics('weather-analysis', getAnalyticsParams()),
        [dateRange, selectedFarm, userFarms],
        {
            retryAttempts: 2,
            enableCache: true,
            cacheKey: `weather-analysis-${user.role}-${dateRange}-${selectedFarm}-${user.id}`,
            fallbackData: getMockAnalyticsData('weather_analysis'),
            timeout: 15000
        }
    );

    const { data: cropHealth, loading: cropLoading, error: cropError, refetch: refetchCrop } = useApi(
        () => apiService.getAnalytics('crop-health', getAnalyticsParams()),
        [dateRange, selectedFarm, userFarms],
        {
            retryAttempts: 2,
            enableCache: true,
            cacheKey: `crop-health-${user.role}-${dateRange}-${selectedFarm}-${user.id}`,
            fallbackData: getMockAnalyticsData('crop_health'),
            timeout: 15000
        }
    );

    // Role-based dashboard stats
    const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
        () => isFarmer ? apiService.getFarmerDashboardStats(user.id) : apiService.getDashboardStats(),
        [user.id, user.role],
        {
            retryAttempts: 3,
            enableCache: true,
            cacheKey: `dashboard-stats-${user.role}-${user.id}`,
            cacheDuration: 2 * 60 * 1000, // 2 minutes
            fallbackData: getMockDashboardStats(),
            timeout: 10000
        }
    );

    // Get farms list based on role
    const { data: farms, loading: farmsLoading, error: farmsError } = useApi(
        () => isAdmin ? apiService.getFarms() : Promise.resolve(userFarms || []),
        [user.role, userFarms],
        {
            enableCache: true,
            cacheKey: `farms-list-${user.role}-${user.id}`,
            cacheDuration: 10 * 60 * 1000, // 10 minutes
            fallbackData: isAdmin ? getMockFarms() : getMockUserFarms(),
            timeout: 10000
        }
    );

    // Role-based insights and recommendations
    const { data: insights, loading: insightsLoading, error: insightsError, refetch: refetchInsights } = useApi(
        () => {
            const farmId = isFarmer ? null : (selectedFarm === 'all' ? null : selectedFarm);
            const userId = isFarmer ? user.id : null;
            return apiService.getInsightsAndRecommendations(farmId, dateRange, userId);
        },
        [selectedFarm, dateRange, user.id, user.role],
        {
            retryAttempts: 2,
            enableCache: true,
            cacheKey: `insights-${user.role}-${selectedFarm}-${dateRange}-${user.id}`,
            fallbackData: getMockInsights(),
            timeout: 15000
        }
    );

    // Role-based quick stats
    const { data: quickStats, loading: quickStatsLoading, error: quickStatsError, refetch: refetchQuickStats } = useApi(
        () => {
            if (isFarmer) {
                return apiService.getFarmerQuickStats(user.id);
            } else {
                const farmId = selectedFarm === 'all' ? null : selectedFarm;
                return apiService.getQuickStats(farmId);
            }
        },
        [selectedFarm, user.id, user.role],
        {
            retryAttempts: 2,
            enableCache: true,
            cacheKey: `quick-stats-${user.role}-${selectedFarm}-${user.id}`,
            fallbackData: getMockQuickStats(),
            timeout: 10000
        }
    );

    // Connection status monitoring
    useEffect(() => {
        const handleOnline = () => setConnectionStatus('online');
        const handleOffline = () => setConnectionStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-refresh with connection awareness
    useEffect(() => {
        if (connectionStatus === 'offline') return;

        const interval = setInterval(() => {
            setLastUpdated(new Date());
            refetchStats();
            refetchInsights();
            refetchQuickStats();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [connectionStatus, refetchStats, refetchInsights, refetchQuickStats]);

    // Mock data generators with role-based content
    function getMockUserFarms() {
        return [
            { id: 1, name: "My Primary Farm", location: "Harare", area: 15.5, status: "ACTIVE" },
            { id: 2, name: "Secondary Plot", location: "Chitungwiza", area: 8.2, status: "ACTIVE" }
        ];
    }

    function getMockAnalyticsData(type) {
        const rolePrefix = isFarmer ? "Your farms show" : "System analysis indicates";

        const baseInsights = [
            `${rolePrefix} average yield performance is within expected range`,
            `Weather conditions have been favorable for ${isFarmer ? 'your area' : 'most regions'}`,
            `${isFarmer ? 'Your' : 'Overall'} soil health indicators are optimal`,
            `Prediction accuracy has improved with recent model updates`
        ];

        const baseRecommendations = [
            `Consider optimizing irrigation schedule ${isFarmer ? 'for your farms' : 'across monitored farms'}`,
            `Monitor crop growth stages closely ${isFarmer ? 'in your plots' : 'system-wide'}`,
            `Prepare for upcoming harvest season`,
            `${isFarmer ? 'Your farms would benefit from' : 'Recommended:'} soil testing for nutrient levels`
        ];

        const mockData = {
            insights: baseInsights,
            recommendations: baseRecommendations
        };

        switch (type) {
            case 'yield_trends':
                return {
                    ...mockData,
                    chartData: generateMockYieldTrends(),
                    summary: {
                        averageYield: isFarmer ? 3.8 : 4.2,
                        yieldGrowth: isFarmer ? 8.5 : 12.5,
                        bestPerformingFarm: isFarmer ? userFarms?.[0]?.name || "My Primary Farm" : "Demo Farm A",
                        totalFarmsAnalyzed: isFarmer ? userFarms?.length || 2 : 22
                    }
                };
            case 'farm_performance':
                if (isFarmer) {
                    return {
                        ...mockData,
                        chartData: (userFarms || getMockUserFarms()).map((farm, index) => ({
                            farm: farm.name,
                            yield: Number((3.2 + Math.random() * 1.5).toFixed(1)),
                            efficiency: 75 + Math.random() * 20,
                            area: farm.area
                        })),
                        summary: {
                            topPerformer: userFarms?.[0]?.name || "My Primary Farm",
                            averageEfficiency: 82,
                            totalArea: userFarms?.reduce((sum, farm) => sum + farm.area, 0) || 23.7
                        }
                    };
                } else {
                    return {
                        ...mockData,
                        chartData: [
                            { farm: 'Farm A', yield: 4.8, efficiency: 92, area: 25 },
                            { farm: 'Farm B', yield: 4.2, efficiency: 85, area: 18 },
                            { farm: 'Farm C', yield: 3.9, efficiency: 78, area: 32 },
                            { farm: 'Farm D', yield: 4.5, efficiency: 88, area: 22 },
                            { farm: 'Farm E', yield: 4.1, efficiency: 82, area: 28 }
                        ],
                        summary: { topPerformer: "Farm A", averageEfficiency: 85, totalArea: 125 }
                    };
                }
            case 'prediction_accuracy':
                return {
                    ...mockData,
                    chartData: [
                        { month: 'Jan', accuracy: isFarmer ? 79 : 82, predictions: isFarmer ? 12 : 45 },
                        { month: 'Feb', accuracy: isFarmer ? 82 : 85, predictions: isFarmer ? 15 : 52 },
                        { month: 'Mar', accuracy: isFarmer ? 85 : 87, predictions: isFarmer ? 11 : 48 },
                        { month: 'Apr', accuracy: isFarmer ? 87 : 89, predictions: isFarmer ? 18 : 61 },
                        { month: 'May', accuracy: isFarmer ? 84 : 87, predictions: isFarmer ? 16 : 58 },
                        { month: 'Jun', accuracy: isFarmer ? 89 : 91, predictions: isFarmer ? 20 : 64 }
                    ],
                    summary: {
                        currentAccuracy: isFarmer ? 84.3 : 87.5,
                        improvement: isFarmer ? 2.8 : 3.2,
                        totalPredictions: isFarmer ? 92 : 328
                    }
                };
            case 'weather_analysis':
                return {
                    ...mockData,
                    chartData: generateMockWeatherData(),
                    summary: { averageTemperature: 25.6, totalRainfall: 56, averageHumidity: 67.3 }
                };
            case 'crop_health':
                return {
                    ...mockData,
                    chartData: [
                        { metric: 'Healthy', value: isFarmer ? 72 : 78, color: '#22c55e' },
                        { metric: 'At Risk', value: isFarmer ? 20 : 15, color: '#f59e0b' },
                        { metric: 'Critical', value: isFarmer ? 8 : 7, color: '#ef4444' }
                    ],
                    summary: {
                        healthyPercentage: isFarmer ? 72 : 78,
                        atRiskFarms: isFarmer ? 20 : 15,
                        criticalIssues: isFarmer ? 8 : 7
                    }
                };
            default:
                return mockData;
        }
    }

    function generateMockYieldTrends() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const baseYield = isFarmer ? 3.2 : 3.5;
        const variance = isFarmer ? 1.5 : 2.0;

        return months.map(month => ({
            month,
            yield: Number((baseYield + Math.random() * variance).toFixed(1)),
            predicted: Number((baseYield + 0.3 + Math.random() * (variance * 0.9)).toFixed(1)),
            target: isFarmer ? 4.0 : 4.5
        }));
    }

    function generateMockWeatherData() {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                temperature: 20 + Math.random() * 10,
                rainfall: Math.random() > 0.7 ? Math.random() * 20 : 0,
                humidity: 40 + Math.random() * 40
            });
        }
        return data;
    }

    function getMockDashboardStats() {
        if (isFarmer) {
            return {
                avgYield: 3.8,
                yieldTrend: 8.5,
                predictionAccuracy: 84.3,
                activeFarms: userFarms?.length || 2,
                totalArea: userFarms?.reduce((sum, farm) => sum + farm.area, 0) || 23.7,
                lastUpdated: new Date().toISOString(),
                note: 'Demo data for farmer - API not available'
            };
        } else {
            return {
                avgYield: 4.2,
                yieldTrend: 12.5,
                predictionAccuracy: 87.5,
                activeFarms: 22,
                totalArea: 156,
                lastUpdated: new Date().toISOString(),
                note: 'Demo data for admin - API not available'
            };
        }
    }

    function getMockFarms() {
        return [
            { id: 1, name: "Demo Farm Alpha", location: "Harare", area: 25.5, status: "ACTIVE" },
            { id: 2, name: "Demo Farm Beta", location: "Bulawayo", area: 18.2, status: "ACTIVE" },
            { id: 3, name: "Demo Farm Gamma", location: "Mutare", area: 32.1, status: "ACTIVE" }
        ];
    }

    function getMockInsights() {
        if (isFarmer) {
            return {
                insights: [
                    "Your farms are performing 8% above your historical average",
                    "Weather conditions in your area have been favorable this month",
                    "Your primary farm shows optimal soil moisture levels",
                    "Prediction accuracy for your farms has improved to 84%"
                ],
                recommendations: [
                    "Consider applying nitrogen fertilizer to your secondary plot",
                    "Schedule irrigation for your primary farm this weekend",
                    "Monitor pest activity in both farms over the next week",
                    "Plan harvesting activities for optimal yield timing"
                ],
                priority: { high: 1, medium: 3, low: 2 },
                lastUpdated: new Date().toISOString()
            };
        } else {
            return {
                insights: [
                    "System-wide yield performance is 12% above target",
                    "Weather conditions have been favorable across all regions",
                    "Soil health indicators show optimal conditions in 78% of farms",
                    "Prediction accuracy has improved to 87.5% with recent updates"
                ],
                recommendations: [
                    "Implement system-wide fertilizer optimization program",
                    "Deploy irrigation alerts for farms in dry regions",
                    "Schedule pest monitoring across all monitored farms",
                    "Prepare harvest optimization recommendations for farmers"
                ],
                priority: { high: 2, medium: 5, low: 3 },
                lastUpdated: new Date().toISOString()
            };
        }
    }

    function getMockQuickStats() {
        if (isFarmer) {
            return {
                bestPerformingFarm: userFarms?.[0]?.name || "My Primary Farm",
                topCropVariety: "SC627",
                seasonProgress: 62,
                weatherFavorability: 79,
                avgSoilHealth: 76,
                irrigationEfficiency: 88,
                pestRiskLevel: "Low",
                harvestReadiness: "18%",
                lastUpdated: new Date().toISOString()
            };
        } else {
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
    }

    // Component configuration based on role
    const metrics = [
        { id: 'yield_trends', label: 'Yield Trends', icon: TrendingUp },
        { id: 'farm_performance', label: isFarmer ? 'My Farm Performance' : 'Farm Performance', icon: BarChart3 },
        { id: 'prediction_accuracy', label: 'Prediction Accuracy', icon: Target },
        { id: 'weather_analysis', label: 'Weather Analysis', icon: Thermometer },
        { id: 'crop_health', label: 'Crop Health', icon: Leaf }
    ];

    const dateRangeOptions = [
        { value: '3months', label: 'Last 3 Months' },
        { value: '6months', label: 'Last 6 Months' },
        { value: '12months', label: 'Last 12 Months' },
        { value: 'year', label: 'This Year' }
    ];

    // Utility functions
    const handleExportData = () => {
        const currentData = getCurrentMetricData();
        if (currentData) {
            const exportData = {
                userRole: user.role,
                userId: user.id,
                metric: selectedMetric,
                dateRange,
                selectedFarm,
                data: currentData,
                exportedAt: new Date().toISOString(),
                connectionStatus
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics_${user.role.toLowerCase()}_${selectedMetric}_${dateRange}_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const getCurrentMetricData = () => {
        switch(selectedMetric) {
            case 'yield_trends': return yieldTrends;
            case 'farm_performance': return farmPerformance;
            case 'prediction_accuracy': return predictionAccuracy;
            case 'weather_analysis': return weatherAnalysis;
            case 'crop_health': return cropHealth;
            default: return null;
        }
    };

    const getCurrentLoading = () => {
        switch(selectedMetric) {
            case 'yield_trends': return yieldLoading;
            case 'farm_performance': return farmLoading;
            case 'prediction_accuracy': return predictionLoading;
            case 'weather_analysis': return weatherLoading;
            case 'crop_health': return cropLoading;
            default: return false;
        }
    };

    const getCurrentError = () => {
        switch(selectedMetric) {
            case 'yield_trends': return yieldError;
            case 'farm_performance': return farmError;
            case 'prediction_accuracy': return predictionError;
            case 'weather_analysis': return weatherError;
            case 'crop_health': return cropError;
            default: return null;
        }
    };

    const refetchCurrentData = () => {
        switch(selectedMetric) {
            case 'yield_trends': return refetchYield();
            case 'farm_performance': return refetchFarm();
            case 'prediction_accuracy': return refetchPrediction();
            case 'weather_analysis': return refetchWeather();
            case 'crop_health': return refetchCrop();
            default: return Promise.resolve();
        }
    };

    const hasAnyError = () => {
        return yieldError || farmError || predictionError || weatherError || cropError || statsError;
    };

    const isUsingFallbackData = () => {
        const currentData = getCurrentMetricData();
        return currentData && (currentData.note || JSON.stringify(currentData).includes('Demo'));
    };

    // Chart rendering with enhanced error handling
    const renderChart = () => {
        const data = getCurrentMetricData();
        const loading = getCurrentLoading();
        const error = getCurrentError();

        if (loading) {
            return (
                <LoadingWithTimeout
                    isLoading={true}
                    timeout={20000}
                    onTimeout={() => console.warn('Chart loading timeout')}
                >
                    <LoadingSpinner size="lg" />
                </LoadingWithTimeout>
            );
        }

        if (error && !data) {
            return (
                <ApiErrorFallback
                    error={error}
                    onRetry={refetchCurrentData}
                    message={`Failed to load ${selectedMetric.replace('_', ' ')} data`}
                />
            );
        }

        if (!data?.chartData || data.chartData.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <BarChart3 className="w-12 h-12 mb-2 opacity-30" />
                    <p>No chart data available</p>
                    <button
                        onClick={refetchCurrentData}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                        Try reloading
                    </button>
                </div>
            );
        }

        const chartProps = {
            width: "100%",
            height: 400,
            data: data.chartData
        };

        const commonCartesianProps = {
            children: [
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />,
                <XAxis key="xaxis" stroke="#666" />,
                <YAxis key="yaxis" stroke="#666" />,
                <Tooltip key="tooltip"
                         contentStyle={{
                             backgroundColor: '#fff',
                             border: '1px solid #ddd',
                             borderRadius: '8px',
                             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}
                         labelStyle={{ color: '#333' }}
                />,
                <Legend key="legend" />
            ]
        };

        try {
            switch(selectedMetric) {
                case 'yield_trends':
                    return (
                        <ResponsiveContainer {...chartProps}>
                            <LineChart data={data.chartData}>
                                {commonCartesianProps.children}
                                <Line
                                    type="monotone"
                                    dataKey="yield"
                                    stroke="#16a34a"
                                    strokeWidth={3}
                                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 6 }}
                                    name="Actual Yield (t/ha)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    name="Predicted Yield (t/ha)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="10 5"
                                    dot={false}
                                    name="Target Yield (t/ha)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    );

                case 'farm_performance':
                    return (
                        <ResponsiveContainer {...chartProps}>
                            <BarChart data={data.chartData}>
                                {commonCartesianProps.children}
                                <Bar dataKey="yield" fill="#16a34a" name="Yield (t/ha)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    );

                case 'prediction_accuracy':
                    return (
                        <ResponsiveContainer {...chartProps}>
                            <AreaChart data={data.chartData}>
                                {commonCartesianProps.children}
                                <Area
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.3}
                                    name="Accuracy %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    );

                case 'weather_analysis':
                    return (
                        <ResponsiveContainer {...chartProps}>
                            <ComposedChart data={data.chartData}>
                                {commonCartesianProps.children}
                                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    name="Temperature (°C)"
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="rainfall"
                                    fill="#3b82f6"
                                    name="Rainfall (mm)"
                                    radius={[2, 2, 0, 0]}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    );

                case 'crop_health':
                    return (
                        <ResponsiveContainer {...chartProps}>
                            <RechartsPieChart>
                                <Pie
                                    data={data.chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ metric, value }) => `${metric}: ${value}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    );

                default:
                    return (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            <p>Chart type not supported</p>
                        </div>
                    );
            }
        } catch (chartError) {
            console.error('Chart rendering error:', chartError);
            return (
                <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <AlertTriangle className="w-12 h-12 mb-2" />
                    <p>Failed to render chart</p>
                    <button
                        onClick={refetchCurrentData}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                        Try again
                    </button>
                </div>
            );
        }
    };

    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Role indicator banner */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {isAdmin ? (
                                <Users className="w-6 h-6 text-green-600" />
                            ) : (
                                <User className="w-6 h-6 text-blue-600" />
                            )}
                            <div>
                                <h3 className="text-sm font-medium text-gray-800">
                                    {isAdmin ? 'Admin Analytics Dashboard' : 'My Farm Analytics'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {isAdmin
                                        ? 'System-wide analytics and insights across all farms'
                                        : `Analytics for your ${userFarms?.length || 2} farm(s) and personalized recommendations`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Viewing as: {user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Connection Status Banner */}
                {connectionStatus === 'offline' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <WifiOff className="w-5 h-5 text-red-400 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">No Internet Connection</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    You're currently offline. Displaying cached data where available.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fallback Data Warning */}
                {/*{isUsingFallbackData() && connectionStatus === 'online' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800">Using Demo Data</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        API endpoints are not available. Displaying sample data for demonstration.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}*/}

                {/* Page Header */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isAdmin ? 'Analytics Dashboard' : 'My Farm Analytics'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isAdmin
                                    ? 'Comprehensive insights and performance metrics across all farms'
                                    : 'Personal insights and recommendations for your farming operations'
                                }
                            </p>
                            {yieldStale && (
                                <p className="text-xs text-orange-600 mt-1">⚠️ Some data may be outdated</p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Metric Selection */}
                            <div className="flex items-center space-x-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    {metrics.map(metric => (
                                        <option key={metric.id} value={metric.id}>{metric.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range Selection */}
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    {dateRangeOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Farm Selection - Only for Admin */}
                            {isAdmin && (
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={selectedFarm}
                                        onChange={(e) => setSelectedFarm(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        disabled={farmsLoading}
                                    >
                                        <option value="all">All Farms</option>
                                        {farms?.map(farm => (
                                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                                        )) || <option disabled>Loading farms...</option>}
                                    </select>
                                </div>
                            )}

                            {/* Connection Status Indicator */}
                            <div className="flex items-center space-x-1">
                                {connectionStatus === 'online' ? (
                                    <Wifi className="w-4 h-4 text-green-500" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-red-500" />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={handleExportData}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                disabled={!getCurrentMetricData()}
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>

                            <button
                                onClick={refetchCurrentData}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                disabled={getCurrentLoading() || connectionStatus === 'offline'}
                            >
                                <RefreshCw className={`w-4 h-4 ${getCurrentLoading() ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>

                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Last updated: {lastUpdated.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {isAdmin ? 'Avg Yield' : 'My Avg Yield'}
                                </p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {dashboardStats?.avgYield ? `${dashboardStats.avgYield} t/ha` : (isFarmer ? '3.8 t/ha' : '4.2 t/ha')}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            {dashboardStats?.yieldTrend ? `${dashboardStats.yieldTrend > 0 ? '+' : ''}${dashboardStats.yieldTrend}%` : (isFarmer ? '+8.5% vs target' : '+12.5% vs target')}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        {statsError && (
                            <div className="mt-2 text-xs text-orange-600">
                                ⚠️ Demo data
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {dashboardStats?.predictionAccuracy ? `${dashboardStats.predictionAccuracy}%` : (isFarmer ? '84.3%' : '87.5%')}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            {isFarmer ? 'For your farms' : 'System-wide'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        {statsError && (
                            <div className="mt-2 text-xs text-orange-600">
                                ⚠️ Demo data
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {isAdmin ? 'Active Farms' : 'My Farms'}
                                </p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {dashboardStats?.activeFarms || (isFarmer ? userFarms?.length || 2 : '22')}
                                        </p>
                                        <p className="text-xs text-purple-600 mt-1">
                                            {isFarmer ? 'Managed farms' : 'Total active'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <PieChart className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        {statsError && (
                            <div className="mt-2 text-xs text-orange-600">
                                ⚠️ Demo data
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {isAdmin ? 'Total Area' : 'My Total Area'}
                                </p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {dashboardStats?.totalArea || (isFarmer ? '23.7 ha' : '156 ha')}
                                        </p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            {isFarmer ? 'Hectares managed' : 'Total managed'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        {statsError && (
                            <div className="mt-2 text-xs text-orange-600">
                                ⚠️ Demo data
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chart Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {metrics.find(m => m.id === selectedMetric)?.label || 'Analytics'}
                        </h3>
                        <div className="flex items-center space-x-2">
                            {getCurrentLoading() && <LoadingSpinner size="sm" />}
                            {getCurrentError() && !getCurrentMetricData() && <AlertTriangle className="w-5 h-5 text-red-500" />}
                            {getCurrentError() && getCurrentMetricData() && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                            {!getCurrentLoading() && !getCurrentError() && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                    </div>

                    <div className="h-96">
                        {renderChart()}
                    </div>

                    {/* Chart Summary */}
                    {getCurrentMetricData()?.summary && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {Object.entries(getCurrentMetricData().summary).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="font-medium text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Insights & Recommendations */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isAdmin ? 'System Insights & Recommendations' : 'Personalized Insights & Recommendations'}
                        </h3>
                        <div className="flex items-center space-x-2">
                            {insightsLoading && <LoadingSpinner size="sm" />}
                            {insightsError && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                        </div>
                    </div>

                    {insightsLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                            ))}
                        </div>
                    ) : insightsError && !insights ? (
                        <ApiErrorFallback
                            error={insightsError}
                            onRetry={refetchInsights}
                            message="Failed to load insights and recommendations"
                        />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-green-600" />
                                    {isAdmin ? 'Performance Insights' : 'Your Farm Insights'}
                                    {insightsError && (
                                        <span className="ml-2 text-xs text-orange-600">(Demo)</span>
                                    )}
                                </h4>
                                <div className="space-y-3">
                                    {insights?.insights?.map((insight, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-gray-700">{insight}</p>
                                        </div>
                                    )) || (
                                        <p className="text-sm text-gray-500">No insights available for current selection.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <Zap className="w-4 h-4 mr-2 text-blue-600" />
                                    {isAdmin ? 'System Recommendations' : 'Personalized Recommendations'}
                                    {insightsError && (
                                        <span className="ml-2 text-xs text-orange-600">(Demo)</span>
                                    )}
                                </h4>
                                <div className="space-y-3">
                                    {insights?.recommendations?.map((recommendation, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-gray-700">{recommendation}</p>
                                        </div>
                                    )) || (
                                        <p className="text-sm text-gray-500">No recommendations available for current selection.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-600" />
                            {isAdmin ? 'System Quick Stats' : 'My Farm Quick Stats'}
                            {quickStatsError && (
                                <span className="ml-2 text-xs text-orange-600">(Demo)</span>
                            )}
                        </h4>
                        {quickStatsLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : quickStatsError && !quickStats ? (
                            <ApiErrorFallback
                                error={quickStatsError}
                                onRetry={refetchQuickStats}
                                message="Failed to load quick stats"
                            />
                        ) : (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        {isAdmin ? 'Best Performing Farm' : 'Top Performing Farm'}
                                    </span>
                                    <span className="font-medium text-gray-900">{quickStats?.bestPerformingFarm || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Top Crop Variety</span>
                                    <span className="font-medium text-gray-900">{quickStats?.topCropVariety || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Season Progress</span>
                                    <span className="font-medium text-gray-900">{quickStats?.seasonProgress || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Weather Favorability</span>
                                    <span className="font-medium text-green-600">{quickStats?.weatherFavorability || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Avg Soil Health</span>
                                    <span className="font-medium text-gray-900">{quickStats?.avgSoilHealth || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Irrigation Efficiency</span>
                                    <span className="font-medium text-blue-600">{quickStats?.irrigationEfficiency || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Pest Risk Level</span>
                                    <span className={`font-medium ${(quickStats?.pestRiskLevel || 'Low') === 'Low' ? 'text-green-600' : 'text-red-600'}`}>
                                        {quickStats?.pestRiskLevel || 'Low'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Harvest Readiness</span>
                                    <span className="font-medium text-gray-900">{quickStats?.harvestReadiness || '0%'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alert Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                            {isAdmin ? 'System Alerts' : 'My Farm Alerts'}
                        </h4>
                        <div className="text-center py-4">
                            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                            <p className="text-sm text-gray-500">No active alerts</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {isAdmin ? 'All systems operating normally' : 'Your farms are operating normally'}
                            </p>
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            {isAdmin ? 'System Tasks' : 'My Upcoming Tasks'}
                        </h4>
                        <div className="text-center py-4">
                            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                            <p className="text-sm text-gray-500">No upcoming tasks</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {isAdmin ? 'All systems up to date!' : 'You\'re all caught up!'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Status Footer */}
                {hasAnyError() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <Activity className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-800">System Status</h3>
                                <div className="text-sm text-blue-700 mt-1 space-y-1">
                                    <p>• Some API endpoints are not available, using fallback data</p>
                                    <p>• The application continues to function with demo data</p>
                                    <p>• Data will be automatically refreshed when API becomes available</p>
                                </div>
                                <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
                                    <span>Dashboard Stats: {statsError ? '❌' : '✅'}</span>
                                    <span>Yield Trends: {yieldError ? '❌' : '✅'}</span>
                                    <span>Insights: {insightsError ? '❌' : '✅'}</span>
                                    <span>Quick Stats: {quickStatsError ? '❌' : '✅'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default AnalyticsPage;