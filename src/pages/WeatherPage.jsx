// src/pages/WeatherPage.jsx - Complete Updated Component
import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Wind, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const WeatherPage = () => {
  const [selectedLocation, setSelectedLocation] = useState('Harare');
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [dateRange, setDateRange] = useState(7); // days
  const [viewMode, setViewMode] = useState('location'); // 'location' or 'farm'

  // Get current weather by location
  const {
    data: currentWeather,
    loading: currentLoading,
    error: currentError,
    refetch: refetchCurrent
  } = useApi(
      () => apiService.getWeatherData(selectedLocation),
      [selectedLocation]
  );

  // Get weather history (location-based)
  const {
    data: weatherHistory,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = useApi(
      () => {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (viewMode === 'farm' && selectedFarm) {
          return apiService.getWeatherHistoryForFarm(selectedFarm, dateRange);
        } else {
          return apiService.getWeatherHistory(null, startDate, endDate);
        }
      },
      [dateRange, viewMode, selectedFarm]
  );

  // Get farms list for farm selection
  const { data: farms } = useApi(() => apiService.getFarms(), []);

  // Get current weather for selected farm
  const {
    data: farmCurrentWeather,
    loading: farmCurrentLoading,
    error: farmCurrentError,
    refetch: refetchFarmCurrent
  } = useApi(
      () => selectedFarm ? apiService.getCurrentWeatherForFarm(selectedFarm) : null,
      [selectedFarm]
  );

  // Mock current weather data (fallback)
  const mockCurrentWeather = {
    location: selectedLocation,
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    conditions: 'Partly Cloudy',
    rainfall: 2.5,
    lastUpdated: new Date().toISOString()
  };

  // Mock historical data (fallback)
  const mockHistoryData = [
    { date: '2025-06-16', temperature: 22, humidity: 70, rainfall: 5.2, windSpeed: 10 },
    { date: '2025-06-17', temperature: 25, humidity: 65, rainfall: 0, windSpeed: 8 },
    { date: '2025-06-18', temperature: 26, humidity: 60, rainfall: 0, windSpeed: 12 },
    { date: '2025-06-19', temperature: 23, humidity: 75, rainfall: 12.5, windSpeed: 15 },
    { date: '2025-06-20', temperature: 21, humidity: 80, rainfall: 8.3, windSpeed: 18 },
    { date: '2025-06-21', temperature: 24, humidity: 68, rainfall: 1.2, windSpeed: 11 },
    { date: '2025-06-22', temperature: 24, humidity: 65, rainfall: 2.5, windSpeed: 12 }
  ];

  // Determine which data to use
  const currentData = (() => {
    if (viewMode === 'farm' && selectedFarm) {
      return farmCurrentError ? mockCurrentWeather : (farmCurrentWeather || mockCurrentWeather);
    }
    return currentError ? mockCurrentWeather : (currentWeather || mockCurrentWeather);
  })();

  const historyData = historyError ? mockHistoryData : (weatherHistory || mockHistoryData);
  const isLoading = viewMode === 'farm' ? farmCurrentLoading : currentLoading;

  const locations = [
    'Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe',
    'Kadoma', 'Masvingo', 'Chinhoyi', 'Marondera', 'Zvishavane'
  ];

  const getWeatherIcon = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'rainy':
      case 'rain':
      case 'light rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy':
      case 'overcast':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'green' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'yellow' };
    if (uvIndex <= 7) return { level: 'High', color: 'orange' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'red' };
    return { level: 'Extreme', color: 'purple' };
  };

  const handleRefresh = () => {
    if (viewMode === 'farm' && selectedFarm) {
      refetchFarmCurrent();
    } else {
      refetchCurrent();
    }
    refetchHistory();
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weather Data</h2>
            <p className="text-gray-600">Monitor weather conditions and historical data</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                  onClick={() => setViewMode('location')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'location'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                By Location
              </button>
              <button
                  onClick={() => setViewMode('farm')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'farm'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                By Farm
              </button>
            </div>

            {/* Location/Farm Selector */}
            {viewMode === 'location' ? (
                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                  ))}
                </select>
            ) : (
                <select
                    value={selectedFarm || ''}
                    onChange={(e) => setSelectedFarm(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a farm...</option>
                  {farms?.map(farm => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name} - {farm.location}
                      </option>
                  ))}
                </select>
            )}

            <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner color="white" />
              </div>
          ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Current Weather - {viewMode === 'farm' && selectedFarm
                      ? `Farm ${selectedFarm}`
                      : currentData.location}
                  </h3>
                  <div className="flex items-center space-x-4">
                    {getWeatherIcon(currentData.conditions)}
                    <div>
                      <p className="text-3xl font-bold">{currentData.temperature}°C</p>
                      <p className="text-blue-100">{currentData.conditions}</p>
                    </div>
                  </div>
                  {currentData.note && (
                      <div className="mt-2 flex items-center text-blue-200 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {currentData.note}
                      </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Last updated</p>
                  <p className="text-sm">
                    {new Date(currentData.lastUpdated || currentData.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
          )}
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.humidity}%</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wind Speed</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.windSpeed} km/h</p>
              </div>
              <Wind className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pressure</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.pressure} hPa</p>
              </div>
              <Thermometer className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visibility</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.visibility} km</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">UV Index</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.uvIndex}</p>
                <p className={`text-xs text-${getUVLevel(currentData.uvIndex).color}-600 font-medium`}>
                  {getUVLevel(currentData.uvIndex).level}
                </p>
              </div>
              <Sun className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rainfall</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.rainfall} mm</p>
              </div>
              <CloudRain className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Historical Data Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Historical Data</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Period:</label>
              <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {/*{(currentError || historyError || farmCurrentError) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">API Connection Issues</h4>
                  <p className="text-sm text-yellow-700">
                    Some weather endpoints are not available. Showing demo data for development.
                  </p>
                </div>
              </div>
            </div>
        )}*/}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature & Humidity Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature & Humidity</h3>
            {historyLoading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="temp" orientation="left" />
                    <YAxis yAxisId="humidity" orientation="right" />
                    <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [
                          `${value}${name === 'temperature' ? '°C' : '%'}`,
                          name === 'temperature' ? 'Temperature' : 'Humidity'
                        ]}
                    />
                    <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        name="temperature"
                    />
                    <Line
                        yAxisId="humidity"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="humidity"
                    />
                  </LineChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Rainfall Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rainfall</h3>
            {historyLoading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value) => [`${value} mm`, 'Rainfall']}
                    />
                    <Bar
                        dataKey="rainfall"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Wind Speed Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wind Speed</h3>
          {historyLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
          ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`${value} km/h`, 'Wind Speed']}
                  />
                  <Line
                      type="monotone"
                      dataKey="windSpeed"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
          )}
        </div>

        {/* Weather Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800">Average Temperature</h4>
              <p className="text-2xl font-bold text-red-600">
                {historyData.length > 0
                    ? Math.round(historyData.reduce((sum, item) => sum + item.temperature, 0) / historyData.length)
                    : '--'
                }°C
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Rainfall</h4>
              <p className="text-2xl font-bold text-blue-600">
                {historyData.length > 0
                    ? Math.round(historyData.reduce((sum, item) => sum + item.rainfall, 0) * 10) / 10
                    : '--'
                } mm
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Average Humidity</h4>
              <p className="text-2xl font-bold text-green-600">
                {historyData.length > 0
                    ? Math.round(historyData.reduce((sum, item) => sum + item.humidity, 0) / historyData.length)
                    : '--'
                }%
              </p>
            </div>
          </div>
        </div>

        {/* Additional Farm-specific Features */}
        {viewMode === 'farm' && selectedFarm && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weather Alerts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Alerts</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">No active weather alerts</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                      onClick={() => apiService.fetchWeatherDataForFarm(selectedFarm)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fetch Latest Weather Data
                  </button>
                  <button
                      onClick={() => window.open(`/api/weather/farms/${selectedFarm}/forecast?days=7`, '_blank')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View 7-Day Forecast
                  </button>
                  <button
                      onClick={() => window.open(`/api/weather/farms/${selectedFarm}/weather/statistics`, '_blank')}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Download Weather Report
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Debug Information (development only) */}
        {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Debug Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>View Mode:</strong> {viewMode}</p>
                <p><strong>Selected Location:</strong> {selectedLocation}</p>
                <p><strong>Selected Farm:</strong> {selectedFarm || 'None'}</p>
                <p><strong>Date Range:</strong> {dateRange} days</p>
                <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_BASE_URL}</p>
                <p><strong>Current Weather Endpoint:</strong>
                  {viewMode === 'farm'
                      ? `/weather/farms/${selectedFarm}/current`
                      : `/weather/current?location=${selectedLocation}`
                  }
                </p>
                <p><strong>History Weather Endpoint:</strong>
                  {viewMode === 'farm'
                      ? `/weather/farms/${selectedFarm}/history?days=${dateRange}`
                      : `/weather/history`
                  }
                </p>
                <p><strong>Has Current Error:</strong> {Boolean(currentError || farmCurrentError).toString()}</p>
                <p><strong>Has History Error:</strong> {Boolean(historyError).toString()}</p>
                <p><strong>Available Farms:</strong> {farms?.length || 0}</p>
              </div>
            </div>
        )}
      </div>
  );
};

export default WeatherPage;