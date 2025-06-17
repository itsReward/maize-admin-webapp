// src/pages/DashboardPage.jsx
import React from 'react';
import { Users, TreePine, Sprout, Target, TrendingUp, Brain, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const DashboardPage = () => {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
      () => apiService.getDashboardStats(),
      []
  );

  const { data: yieldTrends, loading: trendsLoading, error: trendsError } = useApi(
      () => apiService.getAnalytics('yield-trends', { limit: 12 }),
      []
  );

  const { data: recentActivity, loading: activityLoading, error: activityError } = useApi(
      () => apiService.getRecentActivity(),
      []
  );

  // Mock data for demonstration when API is not available
  const mockStats = {
    totalUsers: 1250,
    totalFarmers: 892,
    activeSessions: 156,
    totalPredictions: 3420,
    avgYield: 4.2,
    modelAccuracy: 87.5,
    userGrowth: 12.5,
    farmerGrowth: 8.3,
    sessionGrowth: 15.2,
    predictionGrowth: 22.1,
    yieldGrowth: 5.8,
    accuracyImprovement: 2.3
  };

  const mockYieldTrends = [
    { month: 'Jan', yield: 3.8 },
    { month: 'Feb', yield: 4.1 },
    { month: 'Mar', yield: 4.3 },
    { month: 'Apr', yield: 4.0 },
    { month: 'May', yield: 4.2 },
    { month: 'Jun', yield: 4.5 },
    { month: 'Jul', yield: 4.1 },
    { month: 'Aug', yield: 4.4 },
    { month: 'Sep', yield: 4.6 },
    { month: 'Oct', yield: 4.3 },
    { month: 'Nov', yield: 4.2 },
    { month: 'Dec', yield: 4.7 }
  ];

  const mockWeatherData = [
    { date: 'Mon', rainfallMm: 15, temperature: 22 },
    { date: 'Tue', rainfallMm: 8, temperature: 24 },
    { date: 'Wed', rainfallMm: 0, temperature: 26 },
    { date: 'Thu', rainfallMm: 22, temperature: 21 },
    { date: 'Fri', rainfallMm: 5, temperature: 23 },
    { date: 'Sat', rainfallMm: 12, temperature: 25 },
    { date: 'Sun', rainfallMm: 18, temperature: 22 }
  ];

  // Use mock data if API fails
  const dashboardStats = statsError ? mockStats : (stats || mockStats);
  const chartData = trendsError ? mockYieldTrends : (yieldTrends || mockYieldTrends);

  return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Maize Admin Dashboard</h1>
          <p className="text-green-100">Monitor your agricultural operations and predictions in real-time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatsCard
              title="Total Users"
              value={dashboardStats?.totalUsers?.toLocaleString() || '--'}
              icon={Users}
              trend={dashboardStats?.userGrowth}
              loading={statsLoading}
          />
          <StatsCard
              title="Active Farmers"
              value={dashboardStats?.totalFarmers?.toLocaleString() || '--'}
              icon={TreePine}
              trend={dashboardStats?.farmerGrowth}
              loading={statsLoading}
          />
          <StatsCard
              title="Planting Sessions"
              value={dashboardStats?.activeSessions?.toLocaleString() || '--'}
              icon={Sprout}
              trend={dashboardStats?.sessionGrowth}
              loading={statsLoading}
          />
          <StatsCard
              title="Predictions Made"
              value={dashboardStats?.totalPredictions?.toLocaleString() || '--'}
              icon={Target}
              trend={dashboardStats?.predictionGrowth}
              loading={statsLoading}
          />
          <StatsCard
              title="Avg Yield (t/ha)"
              value={dashboardStats?.avgYield || '--'}
              icon={TrendingUp}
              trend={dashboardStats?.yieldGrowth}
              loading={statsLoading}
          />
          <StatsCard
              title="Model Accuracy"
              value={dashboardStats?.modelAccuracy ? `${dashboardStats.modelAccuracy}%` : '--'}
              icon={Brain}
              trend={dashboardStats?.accuracyImprovement}
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
                  onClick={() => refetchStats?.()}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {trendsLoading ? (
                <LoadingSpinner />
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Weather Data */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Weather</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockWeatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rainfallMm" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {activityLoading ? (
              <LoadingSpinner />
          ) : (
              <div className="space-y-3">
                {(recentActivity || [
                  { id: 1, action: 'New farmer registration', user: 'John Doe', time: '2 hours ago' },
                  { id: 2, action: 'Yield prediction completed', user: 'System', time: '4 hours ago' },
                  { id: 3, action: 'Weather data updated', user: 'WeatherAPI', time: '6 hours ago' },
                  { id: 4, action: 'Model training completed', user: 'ML Service', time: '1 day ago' }
                ]).slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* Error handling for stats */}
        {statsError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Unable to load dashboard statistics from server. Showing sample data instead.
              </p>
            </div>
        )}
      </div>
  );
};

export default DashboardPage;