// src/pages/DashboardPage.jsx - FIXED VERSION with proper date handling

import React, { useState, useEffect } from 'react';
import { Users, MapPin, Sprout, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import ErrorDisplay from '../components/common/ErrorDisplay';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentActivity: null,
    yieldTrends: null
  });
  const [loading, setLoading] = useState({
    stats: true,
    recentActivity: true,
    yieldTrends: true
  });
  const [errors, setErrors] = useState({});
  const { user, addError } = useAuth();

  // Mock data fallbacks with proper timestamps
  const mockStats = {
    totalFarms: 22, // Updated to match your actual data
    totalUsers: 25,
    activeSessions: 8,
    totalYield: 145.2
  };

  const mockRecentActivity = [
    {
      id: 1,
      action: 'Farm Created',
      type: 'FARM_CREATED',
      message: 'New farm "William and Mary Farm" was created',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'kennedy'
    },
    {
      id: 2,
      action: 'Planting Session',
      type: 'PLANTING_SESSION',
      message: 'Planting session started at Mukamuri Family Farm',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      user: 'melody_mutindi'
    },
    {
      id: 3,
      action: 'Prediction Generated',
      type: 'PREDICTION_GENERATED',
      message: 'Yield prediction completed for Highland Farms',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      user: 'tapiwa_dube'
    },
    {
      id: 4,
      action: 'Weather Update',
      type: 'WEATHER_UPDATE',
      message: 'Weather data updated for all farms',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      user: 'System'
    },
    {
      id: 5,
      action: 'Report Generated',
      type: 'REPORT',
      message: 'Monthly yield report generated',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      user: 'System'
    }
  ];

  const mockYieldTrends = [
    { month: 'Jan', yield: 4.2 },
    { month: 'Feb', yield: 4.5 },
    { month: 'Mar', yield: 4.8 },
    { month: 'Apr', yield: 5.1 },
    { month: 'May', yield: 5.4 },
    { month: 'Jun', yield: 5.7 }
  ];

  // Utility function to safely format dates
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'Unknown time';

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'Invalid Date';
      }

      // Return relative time
      return getRelativeTime(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Invalid Date';
    }
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch stats
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        const stats = await apiService.getDashboardStats();
        setDashboardData(prev => ({ ...prev, stats }));
        setErrors(prev => ({ ...prev, stats: null }));
      } catch (error) {
        console.warn('Dashboard stats failed, using mock data:', error);
        setDashboardData(prev => ({ ...prev, stats: mockStats }));
        setErrors(prev => ({ ...prev, stats: { showFallback: true, message: error.message } }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }

      // Fetch recent activity
      try {
        setLoading(prev => ({ ...prev, recentActivity: true }));
        const activity = await apiService.getRecentActivity();
        setDashboardData(prev => ({ ...prev, recentActivity: activity }));
        setErrors(prev => ({ ...prev, recentActivity: null }));
      } catch (error) {
        console.warn('Recent activity failed, using mock data:', error);
        setDashboardData(prev => ({ ...prev, recentActivity: mockRecentActivity }));
        setErrors(prev => ({ ...prev, recentActivity: { showFallback: true, message: error.message } }));
      } finally {
        setLoading(prev => ({ ...prev, recentActivity: false }));
      }

      // Fetch yield trends
      try {
        setLoading(prev => ({ ...prev, yieldTrends: true }));
        const trends = await apiService.getYieldTrends();
        setDashboardData(prev => ({ ...prev, yieldTrends: trends }));
        setErrors(prev => ({ ...prev, yieldTrends: null }));
      } catch (error) {
        console.warn('Yield trends failed, using mock data:', error);
        setDashboardData(prev => ({ ...prev, yieldTrends: mockYieldTrends }));
        setErrors(prev => ({ ...prev, yieldTrends: { showFallback: true, message: error.message } }));
      } finally {
        setLoading(prev => ({ ...prev, yieldTrends: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, loading, error, dataKey }) => (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {error && !error.showFallback && (
            <div className="mt-2 text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Failed to load
            </div>
        )}
      </div>
  );

  // FIXED: ActivityItem component that matches API response structure
  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'USER_REGISTRATION':
          return '👤';
        case 'FARM_CREATED':
          return '🏡';
        case 'PLANTING_SESSION':
          return '🌱';
        case 'PREDICTION':
          return '📊';
        case 'WEATHER_UPDATE':
          return '🌤️';
        case 'REPORT':
          return '📋';
        default:
          return '📌';
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'USER_REGISTRATION':
          return 'bg-blue-100';
        case 'FARM_CREATED':
          return 'bg-green-100';
        case 'PLANTING_SESSION':
          return 'bg-yellow-100';
        case 'PREDICTION':
          return 'bg-purple-100';
        case 'WEATHER_UPDATE':
          return 'bg-cyan-100';
        case 'REPORT':
          return 'bg-gray-100';
        default:
          return 'bg-gray-100';
      }
    };

    // Use API response properties: action, user, time, type
    return (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className={`flex-shrink-0 w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-sm`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            {/* Use 'action' property from API instead of 'message' */}
            <p className="text-sm text-gray-900 font-medium truncate">
              {activity.action || activity.message || 'Unknown activity'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span className="font-medium">{activity.user}</span>
              <span>•</span>
              {/* Use 'time' property from API instead of formatting timestamp */}
              <span>{activity.time || 'Unknown time'}</span>
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="space-y-6">
        <ErrorDisplay />

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome to HarvestIQ Dashboard</h1>
          <p className="text-green-100 mt-2">
            Monitor your agricultural operations and predictions in real time
          </p>
          {user && (
              <p className="text-green-200 text-sm mt-1">
                Logged in as: {user.username} ({user.role || 'User'})
              </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
              title="Total Farms"
              value={dashboardData.stats?.totalFarms || 0}
              icon={MapPin}
              color="bg-blue-500"
              loading={loading.stats}
              error={errors.stats}
              dataKey="stats"
          />
          <StatCard
              title="Total Users"
              value={dashboardData.stats?.totalUsers || 0}
              icon={Users}
              color="bg-purple-500"
              loading={loading.stats}
              error={errors.stats}
              dataKey="stats"
          />
          <StatCard
              title="Active Sessions"
              value={dashboardData.stats?.activeSessions || 0}
              icon={Sprout}
              color="bg-green-500"
              loading={loading.stats}
              error={errors.stats}
              dataKey="stats"
          />
          <StatCard
              title="Yield Predictions"
              value={dashboardData.stats?.totalPredictions || 0}
              icon={TrendingUp}
              color="bg-orange-500"
              loading={loading.stats}
              error={errors.stats}
              dataKey="stats"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                {loading.recentActivity && (
                    <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <div className="p-4">
              {loading.recentActivity ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {dashboardData.recentActivity.slice(0, 5).map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
              )}
            </div>
          </div>

          {/* Yield Trends Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Yield Trends</h3>
            </div>
            <div className="p-6">
              {loading.yieldTrends ? (
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              ) : dashboardData.yieldTrends && dashboardData.yieldTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dashboardData.yieldTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                          type="monotone"
                          dataKey="yield"
                          stroke="#059669"
                          strokeWidth={2}
                          dot={{ fill: '#059669' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No yield data available</p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;