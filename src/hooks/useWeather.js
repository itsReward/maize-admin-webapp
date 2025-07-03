// src/hooks/useWeather.js - Custom hooks for weather data management

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useApi } from './useApi';

/**
 * Hook for managing current weather data by location
 */
export const useCurrentWeather = (location) => {
    return useApi(
        () => location ? apiService.getWeatherData(location) : null,
        [location]
    );
};

/**
 * Hook for managing farm weather data
 */
export const useFarmWeather = (farmId) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get current weather for farm
    const currentWeather = useApi(
        () => farmId ? apiService.getCurrentWeatherForFarm(farmId) : null,
        [farmId]
    );

    // Get latest weather data
    const latestWeather = useApi(
        () => farmId ? apiService.getLatestWeatherData(farmId) : null,
        [farmId]
    );

    // Manual refresh function
    const refreshWeatherData = useCallback(async () => {
        if (!farmId) return;

        setIsRefreshing(true);
        try {
            await apiService.fetchWeatherDataForFarm(farmId);
            // Trigger refetch of current data
            currentWeather.refetch();
            latestWeather.refetch();
        } catch (error) {
            console.error('Failed to refresh weather data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [farmId, currentWeather.refetch, latestWeather.refetch]);

    return {
        currentWeather: currentWeather.data,
        latestWeather: latestWeather.data,
        loading: currentWeather.loading || latestWeather.loading || isRefreshing,
        error: currentWeather.error || latestWeather.error,
        refreshWeatherData,
        refetch: () => {
            currentWeather.refetch();
            latestWeather.refetch();
        }
    };
};

/**
 * Hook for managing weather history with different modes
 */
export const useWeatherHistory = (mode, identifier, dateRange = 7) => {
    const [startDate, endDate] = (() => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return [start, end];
    })();

    return useApi(
        () => {
            if (!identifier) return null;

            switch (mode) {
                case 'location':
                    return apiService.getWeatherHistory(null, startDate, endDate);
                case 'farm':
                    return apiService.getWeatherHistoryForFarm(identifier, dateRange);
                case 'farm-daterange':
                    return apiService.getWeatherDataByDateRange(identifier, startDate, endDate);
                default:
                    return null;
            }
        },
        [mode, identifier, startDate, endDate, dateRange]
    );
};

/**
 * Hook for managing weather forecast
 */
export const useWeatherForecast = (farmId, days = 7) => {
    return useApi(
        () => farmId ? apiService.getWeatherForecast(farmId, days) : null,
        [farmId, days]
    );
};

/**
 * Hook for managing weather alerts
 */
export const useWeatherAlerts = (farmId) => {
    return useApi(
        () => farmId ? apiService.getWeatherAlerts(farmId) : null,
        [farmId]
    );
};

/**
 * Hook for managing weather statistics
 */
export const useWeatherStatistics = (farmId) => {
    return useApi(
        () => farmId ? apiService.getWeatherStatistics(farmId) : null,
        [farmId]
    );
};

/**
 * Comprehensive weather hook that combines multiple weather data sources
 */
export const useComprehensiveWeather = (farmId, options = {}) => {
    const {
        includeForecast = false,
        includeAlerts = false,
        includeStatistics = false,
        historyDays = 7
    } = options;

    const currentWeather = useFarmWeather(farmId);
    const weatherHistory = useWeatherHistory('farm', farmId, historyDays);
    const forecast = includeForecast ? useWeatherForecast(farmId) : { data: null, loading: false, error: null };
    const alerts = includeAlerts ? useWeatherAlerts(farmId) : { data: null, loading: false, error: null };
    const statistics = includeStatistics ? useWeatherStatistics(farmId) : { data: null, loading: false, error: null };

    const isLoading = currentWeather.loading ||
        weatherHistory.loading ||
        forecast.loading ||
        alerts.loading ||
        statistics.loading;

    const hasError = currentWeather.error ||
        weatherHistory.error ||
        forecast.error ||
        alerts.error ||
        statistics.error;

    const refreshAll = useCallback(() => {
        currentWeather.refetch();
        weatherHistory.refetch();
        if (includeForecast) forecast.refetch?.();
        if (includeAlerts) alerts.refetch?.();
        if (includeStatistics) statistics.refetch?.();
    }, [currentWeather, weatherHistory, forecast, alerts, statistics, includeForecast, includeAlerts, includeStatistics]);

    return {
        currentWeather: currentWeather.currentWeather,
        latestWeather: currentWeather.latestWeather,
        weatherHistory: weatherHistory.data,
        forecast: forecast.data,
        alerts: alerts.data,
        statistics: statistics.data,
        loading: isLoading,
        error: hasError,
        refreshAll,
        refreshWeatherData: currentWeather.refreshWeatherData
    };
};

/**
 * Hook for weather data CRUD operations
 */
export const useWeatherDataCRUD = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createWeatherData = useCallback(async (weatherData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.addWeatherData(weatherData);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateWeatherData = useCallback(async (weatherDataId, weatherData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.updateWeatherData(weatherDataId, weatherData);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteWeatherData = useCallback(async (weatherDataId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.deleteWeatherData(weatherDataId);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createWeatherData,
        updateWeatherData,
        deleteWeatherData,
        loading,
        error
    };
};

/**
 * Hook for weather data with auto-refresh capabilities
 */
export const useAutoRefreshWeather = (farmId, refreshInterval = 300000) => { // 5 minutes default
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const weatherData = useFarmWeather(farmId);

    useEffect(() => {
        if (!farmId || !refreshInterval) return;

        const interval = setInterval(() => {
            weatherData.refreshWeatherData();
            setLastRefresh(Date.now());
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [farmId, refreshInterval, weatherData.refreshWeatherData]);

    return {
        ...weatherData,
        lastRefresh: new Date(lastRefresh),
        refreshInterval
    };
};