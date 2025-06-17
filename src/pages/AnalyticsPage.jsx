// src/pages/AnalyticsPage.jsx
import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const AnalyticsPage = () => {
    const [selectedMetric, setSelectedMetric] = useState('yield_trends');
    const [dateRange, setDateRange] = useState('6months');
    const [selectedFarm, setSelectedFarm] = useState('all');

    // API calls for different analytics data
    const { data: yieldTrends, loading: yieldLoading, error: yieldError, refetch: refetchYield } = useApi(
        () => apiService.getAnalytics('yield-trends', { dateRange, farm: selectedFarm }),
        [dateRange, selectedFarm]
    );

    const { data: farmPerformance, loading: farmLoading, error: farmError, refetch: refetchFarm } = useApi(
        () => apiService.getAnalytics('farm-performance', { dateRange, farm: selectedFarm }),
        [dateRange, selectedFarm]
    );

    const { data: predictionAccuracy, loading: predictionLoading, error: predictionError, refetch: refetchPrediction } = useApi(
        () => apiService.getAnalytics('prediction-accuracy', { dateRange, farm: selectedFarm }),
        [dateRange, selectedFarm]
    );

    const { data: weatherAnalysis, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useApi(
        () => apiService.getAnalytics('weather-analysis', { dateRange, farm: selectedFarm }),
        [dateRange, selectedFarm]
    );

    const { data: cropHealth, loading: cropLoading, error: cropError, refetch: refetchCrop } = useApi(
        () => apiService.getAnalytics('crop-health', { dateRange, farm: selectedFarm }),
        [dateRange, selectedFarm]
    );

    const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
        () => apiService.getDashboardStats(),
        []
    );

    const { data: farms, loading: farmsLoading, error: farmsError } = useApi(
        () => apiService.getFarms(),
        []
    );

    const { data: alerts, loading: alertsLoading, error: alertsError } = useApi(
        () => apiService.getAlerts?.() || Promise.resolve([]),
        []
    );

    const { data: tasks, loading: tasksLoading, error: tasksError } = useApi(
        () => apiService.getTasks?.() || Promise.resolve([]),
        []
    );

    const handleExportData = async () => {
        try {
            const exportData = {
                metric: selectedMetric,
                dateRange,
                farm: selectedFarm,
                data: getCurrentMetricData(),
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${selectedMetric}-${dateRange}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
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

    const renderYieldTrends = () => {
        if (yieldLoading) return <LoadingSpinner size="lg" />;
        if (yieldError) return <ErrorMessage message="Failed to load yield trends data" onRetry={refetchYield} />;
        if (!yieldTrends?.chartData) return <p className="text-center text-gray-500 py-8">No yield trends data available</p>;

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Trends vs Predictions</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={yieldTrends.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="actualYield" stroke="#16a34a" strokeWidth={3} name="Actual Yield (t/ha)" />
                            <Line type="monotone" dataKey="predictedYield" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Predicted Yield (t/ha)" />
                            <Line type="monotone" dataKey="targetYield" stroke="#f59e0b" strokeWidth={2} name="Target Yield (t/ha)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {yieldTrends.varietyDistribution && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Variety Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={yieldTrends.varietyDistribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`}
                                    >
                                        {yieldTrends.varietyDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>

                        {yieldTrends.weatherImpact && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Impact Factors</h3>
                                <div className="space-y-3">
                                    {yieldTrends.weatherImpact.map((factor, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${factor.correlation * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 w-16">{factor.impact}</span>
                                                <span className="text-sm font-medium text-gray-900 w-8">{factor.correlation?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderFarmPerformance = () => {
        if (farmLoading) return <LoadingSpinner size="lg" />;
        if (farmError) return <ErrorMessage message="Failed to load farm performance data" onRetry={refetchFarm} />;
        if (!farmPerformance?.farms) return <p className="text-center text-gray-500 py-8">No farm performance data available</p>;

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Performance Comparison</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={farmPerformance.farms}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="yield" fill="#16a34a" name="Yield (t/ha)" />
                            <Bar yAxisId="left" dataKey="area" fill="#3b82f6" name="Area (ha)" />
                            <Bar yAxisId="right" dataKey="efficiency" fill="#f59e0b" name="Efficiency %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {farmPerformance.farms.slice(0, 3).map((farm, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3">{farm.name}</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Yield</span>
                                    <span className="font-medium">{farm.yield} t/ha</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Area</span>
                                    <span className="font-medium">{farm.area} ha</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Efficiency</span>
                                    <span className="font-medium">{farm.efficiency}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPredictionAccuracy = () => {
        if (predictionLoading) return <LoadingSpinner size="lg" />;
        if (predictionError) return <ErrorMessage message="Failed to load prediction accuracy data" onRetry={refetchPrediction} />;
        if (!predictionAccuracy?.chartData) return <p className="text-center text-gray-500 py-8">No prediction accuracy data available</p>;

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Accuracy Over Time</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={predictionAccuracy.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis yAxisId="accuracy" />
                            <YAxis yAxisId="predictions" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Area
                                yAxisId="accuracy"
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#16a34a"
                                fill="#16a34a"
                                fillOpacity={0.6}
                                name="Accuracy %"
                            />
                            <Line
                                yAxisId="predictions"
                                type="monotone"
                                dataKey="predictionCount"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Predictions Made"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Average Accuracy</h4>
                        <p className="text-3xl font-bold text-green-600">
                            {predictionAccuracy.stats?.averageAccuracy?.toFixed(1) || '--'}%
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            {predictionAccuracy.stats?.accuracyTrend > 0 ? '+' : ''}{predictionAccuracy.stats?.accuracyTrend?.toFixed(1) || '--'}% from last period
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Total Predictions</h4>
                        <p className="text-3xl font-bold text-blue-600">{predictionAccuracy.stats?.totalPredictions || '--'}</p>
                        <p className="text-xs text-blue-600 mt-1">
                            {predictionAccuracy.stats?.predictionGrowth > 0 ? '+' : ''}{predictionAccuracy.stats?.predictionGrowth?.toFixed(0) || '--'}% from last period
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Best Period</h4>
                        <p className="text-3xl font-bold text-purple-600">{predictionAccuracy.stats?.bestPeriod || '--'}</p>
                        <p className="text-xs text-purple-600 mt-1">{predictionAccuracy.stats?.bestAccuracy?.toFixed(0) || '--'}% accuracy</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Improvement</h4>
                        <p className="text-3xl font-bold text-orange-600">
                            {predictionAccuracy.stats?.overallImprovement > 0 ? '+' : ''}{predictionAccuracy.stats?.overallImprovement?.toFixed(0) || '--'}%
                        </p>
                        <p className="text-xs text-orange-600 mt-1">Since start of period</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderWeatherAnalysis = () => {
        if (weatherLoading) return <LoadingSpinner size="lg" />;
        if (weatherError) return <ErrorMessage message="Failed to load weather analysis data" onRetry={refetchWeather} />;
        if (!weatherAnalysis?.correlation) return <p className="text-center text-gray-500 py-8">No weather analysis data available</p>;

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Impact on Yield</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={weatherAnalysis.correlation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis yAxisId="yield" />
                            <YAxis yAxisId="weather" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="yield" type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2} name="Yield (t/ha)" />
                            <Line yAxisId="weather" type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} name="Rainfall (mm)" />
                            <Line yAxisId="weather" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Analysis</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Optimal Range</span>
                                <span className="font-medium text-green-600">{weatherAnalysis.temperature?.optimalRange || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current Average</span>
                                <span className="font-medium text-gray-900">{weatherAnalysis.temperature?.currentAverage || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Correlation</span>
                                <span className="font-medium text-blue-600">{weatherAnalysis.temperature?.correlation?.toFixed(2) || 'N/A'}</span>
                            </div>
                            {weatherAnalysis.temperature?.status && (
                                <div className={`p-3 rounded-lg ${
                                    weatherAnalysis.temperature.status === 'optimal' ? 'bg-green-50' :
                                        weatherAnalysis.temperature.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                                }`}>
                                    <p className={`text-sm ${
                                        weatherAnalysis.temperature.status === 'optimal' ? 'text-green-800' :
                                            weatherAnalysis.temperature.status === 'warning' ? 'text-yellow-800' : 'text-red-800'
                                    }`}>
                                        {weatherAnalysis.temperature.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rainfall Analysis</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Seasonal Requirement</span>
                                <span className="font-medium text-blue-600">{weatherAnalysis.rainfall?.seasonalRequirement || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current Total</span>
                                <span className="font-medium text-gray-900">{weatherAnalysis.rainfall?.currentTotal || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Distribution Quality</span>
                                <span className="font-medium text-green-600">{weatherAnalysis.rainfall?.distribution || 'N/A'}</span>
                            </div>
                            {weatherAnalysis.rainfall?.status && (
                                <div className={`p-3 rounded-lg ${
                                    weatherAnalysis.rainfall.status === 'adequate' ? 'bg-blue-50' :
                                        weatherAnalysis.rainfall.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                                }`}>
                                    <p className={`text-sm ${
                                        weatherAnalysis.rainfall.status === 'adequate' ? 'text-blue-800' :
                                            weatherAnalysis.rainfall.status === 'warning' ? 'text-yellow-800' : 'text-red-800'
                                    }`}>
                                        {weatherAnalysis.rainfall.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCropHealth = () => {
        if (cropLoading) return <LoadingSpinner size="lg" />;
        if (cropError) return <ErrorMessage message="Failed to load crop health data" onRetry={refetchCrop} />;
        if (!cropHealth?.overallHealth) return <p className="text-center text-gray-500 py-8">No crop health data available</p>;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Health Score</h3>
                        <div className="text-center">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#16a34a"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(cropHealth.overallHealth.score * 2 * Math.PI * 56) / 100} ${2 * Math.PI * 56}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900">{cropHealth.overallHealth.score}%</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{cropHealth.overallHealth.status}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Risk Assessment</h3>
                        <div className="space-y-3">
                            {cropHealth.diseases?.map((disease, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{disease.name}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        disease.risk === 'Low' ? 'bg-green-100 text-green-800' :
                                            disease.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                    {disease.risk}
                  </span>
                                </div>
                            )) || <p className="text-sm text-gray-500">No disease data available</p>}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrient Status</h3>
                        <div className="space-y-3">
                            {cropHealth.nutrients?.map((nutrient, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{nutrient.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    nutrient.level >= 80 ? 'bg-green-600' :
                                                        nutrient.level >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                                                }`}
                                                style={{ width: `${nutrient.level}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-600">{nutrient.level}%</span>
                                    </div>
                                </div>
                            )) || <p className="text-sm text-gray-500">No nutrient data available</p>}
                        </div>
                    </div>
                </div>

                {cropHealth.growthStage && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Stage Monitoring</h3>
                        <div className="flex items-center justify-between mb-4">
                            {cropHealth.growthStage.stages?.map((stage, index) => (
                                <div key={stage.name} className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                            stage.completed ? 'bg-green-600 text-white' :
                                                stage.current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className="text-xs text-gray-600 mt-1 text-center">{stage.name}</span>
                                    {stage.current && <span className="text-xs text-blue-600 font-medium">Current</span>}
                                </div>
                            )) || <p className="text-sm text-gray-500">No growth stage data available</p>}
                        </div>
                        {cropHealth.growthStage.message && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">{cropHealth.growthStage.message}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderMetricContent = () => {
        switch(selectedMetric) {
            case 'yield_trends':
                return renderYieldTrends();
            case 'farm_performance':
                return renderFarmPerformance();
            case 'prediction_accuracy':
                return renderPredictionAccuracy();
            case 'weather_analysis':
                return renderWeatherAnalysis();
            case 'crop_health':
                return renderCropHealth();
            default:
                return (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Metric</h3>
                        <p className="text-gray-600">Choose an analytics metric from the dropdown to view detailed insights.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-gray-600">Comprehensive insights and performance metrics</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={refetchCurrentData}
                        disabled={getCurrentLoading()}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${getCurrentLoading() ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={handleExportData}
                        disabled={getCurrentLoading() || !getCurrentMetricData()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filters:</span>
                        </div>

                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="yield_trends">Yield Trends</option>
                            <option value="farm_performance">Farm Performance</option>
                            <option value="prediction_accuracy">Prediction Accuracy</option>
                            <option value="weather_analysis">Weather Analysis</option>
                            <option value="crop_health">Crop Health</option>
                        </select>

                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="1month">Last Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="1year">Last Year</option>
                            <option value="2years">Last 2 Years</option>
                        </select>

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

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Last updated: {new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Yield</p>
                            {statsLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardStats?.avgYield ? `${dashboardStats.avgYield} t/ha` : '--'}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {dashboardStats?.yieldTrend ? `${dashboardStats.yieldTrend > 0 ? '+' : ''}${dashboardStats.yieldTrend}%` : 'vs target'}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
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
                                        {dashboardStats?.modelAccuracy ? `${dashboardStats.modelAccuracy}%` : '--'}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {dashboardStats?.accuracyTrend ? `${dashboardStats.accuracyTrend > 0 ? '+' : ''}${dashboardStats.accuracyTrend}%` : 'improvement'}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Farms</p>
                            {statsLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardStats?.totalFarms || farms?.length || '--'}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">
                                        {dashboardStats?.farmGrowth ? `${dashboardStats.farmGrowth} new this month` : 'total farms'}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <PieChart className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Area</p>
                            {statsLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardStats?.totalArea ? `${dashboardStats.totalArea} ha` : '--'}
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        {dashboardStats?.areaGrowth ? `${dashboardStats.areaGrowth > 0 ? '+' : ''}${dashboardStats.areaGrowth}%` : 'expansion'}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Analytics Content */}
            {renderMetricContent()}

            {/* Insights and Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Recommendations</h3>
                {getCurrentLoading() ? (
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                            </div>
                        </div>
                    </div>
                ) : getCurrentError() ? (
                    <ErrorMessage message="Failed to load insights" />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Performance Insights</h4>
                            <div className="space-y-3">
                                {getCurrentMetricData()?.insights?.map((insight, index) => (
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
                            <h4 className="font-medium text-gray-900">Recommendations</h4>
                            <div className="space-y-3">
                                {getCurrentMetricData()?.recommendations?.map((recommendation, index) => (
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h4>
                    {statsLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : statsError ? (
                        <ErrorMessage message="Failed to load stats" />
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Best Performing Farm</span>
                                <span className="font-medium text-green-600">
                  {dashboardStats?.bestFarm || farmPerformance?.farms?.[0]?.name || 'N/A'}
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Top Crop Variety</span>
                                <span className="font-medium text-blue-600">
                  {dashboardStats?.topVariety || 'N/A'}
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Season Progress</span>
                                <span className="font-medium text-purple-600">
                  {dashboardStats?.seasonProgress ? `${dashboardStats.seasonProgress}% Complete` : 'N/A'}
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Weather Favorability</span>
                                <span className="font-medium text-orange-600">
                  {weatherAnalysis?.favorability ? `${weatherAnalysis.favorability}% Favorable` : 'N/A'}
                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Alert Summary</h4>
                    {alertsLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : alertsError ? (
                        <ErrorMessage message="Failed to load alerts" />
                    ) : alerts && alerts.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.slice(0, 3).map((alert, index) => (
                                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                                    alert.severity === 'high' ? 'bg-red-50' :
                                        alert.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        alert.severity === 'high' ? 'bg-red-500' :
                                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}></div>
                                    <div>
                                        <p className={`text-sm font-medium ${
                                            alert.severity === 'high' ? 'text-red-900' :
                                                alert.severity === 'medium' ? 'text-yellow-900' : 'text-blue-900'
                                        }`}>
                                            {alert.title}
                                        </p>
                                        <p className={`text-xs ${
                                            alert.severity === 'high' ? 'text-red-700' :
                                                alert.severity === 'medium' ? 'text-yellow-700' : 'text-blue-700'
                                        }`}>
                                            {alert.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No active alerts</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h4>
                    {tasksLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : tasksError ? (
                        <ErrorMessage message="Failed to load tasks" />
                    ) : tasks && tasks.length > 0 ? (
                        <div className="space-y-3">
                            {tasks.slice(0, 4).map((task, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={task.completed || false}
                                        onChange={() => {/* Handle task completion */}}
                                        className="rounded"
                                    />
                                    <div>
                                        <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {task.title}
                                        </p>
                                        <p className={`text-xs ${task.completed ? 'text-gray-500' : 'text-gray-600'}`}>
                                            {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : task.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No upcoming tasks</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;