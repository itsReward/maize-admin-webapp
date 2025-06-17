import React from 'react';
import { Users, TreePine, Sprout, Target, TrendingUp, Brain, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Dashboard = () => {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    () => apiService.getDashboardStats()
  );
  
  const { data: yieldTrends, loading: trendsLoading, error: trendsError } = useApi(
    () => apiService.getYieldTrends()
  );

  const { data: weatherData, loading: weatherLoading, error: weatherError } = useApi(
    () => apiService.getWeatherData(null, 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    )
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard 
          title="Total Users" 
          value={stats?.totalUsers?.toLocaleString() || '--'} 
          icon={Users} 
          trend={stats?.userGrowth} 
          loading={statsLoading}
        />
        <StatsCard 
          title="Active Farmers" 
          value={stats?.totalFarmers?.toLocaleString() || '--'} 
          icon={TreePine} 
          trend={stats?.farmerGrowth} 
          loading={statsLoading}
        />
        <StatsCard 
          title="Planting Sessions" 
          value={stats?.activeSessions?.toLocaleString() || '--'} 
          icon={Sprout} 
          trend={stats?.sessionGrowth} 
          loading={statsLoading}
        />
        <StatsCard 
          title="Predictions Made" 
          value={stats?.totalPredictions?.toLocaleString() || '--'} 
          icon={Target} 
          trend={stats?.predictionGrowth} 
          loading={statsLoading}
        />
        <StatsCard 
          title="Avg Yield (t/ha)" 
          value={stats?.avgYield || '--'} 
          icon={TrendingUp} 
          trend={stats?.yieldGrowth} 
          loading={statsLoading}
        />
        <StatsCard 
          title="Model Accuracy" 
          value={stats?.modelAccuracy ? `${stats.modelAccuracy}%` : '--'} 
          icon={Brain} 
          trend={stats?.accuracyImprovement} 
          loading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Yield Trends</h3>
            <button 
              onClick={() => window.location.reload()}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {trendsLoading ? (
            <LoadingSpinner />
          ) : trendsError ? (
            <ErrorMessage message="Failed to load yield trends" />
          ) : yieldTrends && yieldTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No yield data available</p>
          )}
        </div>

        {/* Weather Data */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Weather</h3>
          {weatherLoading ? (
            <LoadingSpinner />
          ) : weatherError ? (
            <ErrorMessage message="Failed to load weather data" />
          ) : weatherData && weatherData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weatherData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rainfallMm" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No weather data available</p>
          )}
        </div>
      </div>

      {/* Error handling for stats */}
      {statsError && (
        <ErrorMessage message="Failed to load dashboard statistics" onRetry={refetchStats} />
      )}
    </div>
  );
};

export default Dashboard;
