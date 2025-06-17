// src/pages/WeatherPage.jsx
import React, { useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Wind, Eye, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const WeatherPage = () => {
  const [selectedLocation, setSelectedLocation] = useState('Harare');
  const [dateRange, setDateRange] = useState(7); // days

  const { data: currentWeather, loading: currentLoading, error: currentError, refetch: refetchCurrent } = useApi(
      () => apiService.getWeatherData(selectedLocation),
      [selectedLocation]
  );

  const { data: weatherHistory, loading: historyLoading, error: historyError, refetch: refetchHistory } = useApi(
      () => apiService.getWeatherHistory(null,
          new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
      ),
      [dateRange]
  );

  // Mock current weather data
  const mockCurrentWeather = {
    location: selectedLocation,
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    condition: 'Partly Cloudy',
    rainfall: 2.5,
    lastUpdated: new Date().toISOString()
  };

  // Mock historical data
  const mockHistoryData = [
    { date: '2024-06-11', temperature: 22, humidity: 70, rainfall: 5.2, windSpeed: 10 },
    { date: '2024-06-12', temperature: 25, humidity: 65, rainfall: 0, windSpeed: 8 },
    { date: '2024-06-13', temperature: 26, humidity: 60, rainfall: 0, windSpeed: 12 },
    { date: '2024-06-14', temperature: 23, humidity: 75, rainfall: 12.5, windSpeed: 15 },
    { date: '2024-06-15', temperature: 21, humidity: 80, rainfall: 8.3, windSpeed: 18 },
    { date: '2024-06-16', temperature: 24, humidity: 68, rainfall: 1.2, windSpeed: 11 },
    { date: '2024-06-17', temperature: 24, humidity: 65, rainfall: 2.5, windSpeed: 12 }
  ];

  const currentData = currentError ? mockCurrentWeather : (currentWeather || mockCurrentWeather);
  const historyData = historyError ? mockHistoryData : (weatherHistory || mockHistoryData);

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

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weather Data</h2>
            <p className="text-gray-600">Monitor weather conditions and historical data</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <button
                onClick={() => {
                  refetchCurrent();
                  refetchHistory();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Weather - {currentData.location}</h3>
              <div className="flex items-center space-x-4">
                {getWeatherIcon(currentData.condition)}
                <div>
                  <p className="text-3xl font-bold">{currentData.temperature}°C</p>
                  <p className="text-blue-100">{currentData.condition}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Last updated</p>
              <p className="text-sm">
                {new Date(currentData.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
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
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">UV Index</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.uvIndex}</p>
                <p className={`text-xs text-${getUVLevel(currentData.uvIndex).color}-600`}>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature & Humidity Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature & Humidity</h3>
            {historyLoading ? (
                <LoadingSpinner />
            ) : historyError ? (
                <ErrorMessage message="Failed to load temperature data" />
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
                    <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="temperature" />
                    <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="humidity" />
                  </LineChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Rainfall Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rainfall</h3>
            {historyLoading ? (
                <LoadingSpinner />
            ) : historyError ? (
                <ErrorMessage message="Failed to load rainfall data" />
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
                    <Bar dataKey="rainfall" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Wind Speed Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wind Speed</h3>
          {historyLoading ? (
              <LoadingSpinner />
          ) : historyError ? (
              <ErrorMessage message="Failed to load wind data" />
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
                  <Line type="monotone" dataKey="windSpeed" stroke="#6b7280" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
          )}
        </div>

        {/* Error Notice */}
        {(currentError || historyError) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Unable to load weather data from server. Showing sample data instead.
              </p>
            </div>
        )}
      </div>
  );
};

export default WeatherPage;