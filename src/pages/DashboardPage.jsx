// src/pages/DashboardPage.jsx - Enhanced to handle missing endpoints gracefully
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

  // Mock data fallbacks
  const mockStats = {
    totalFarms: 12,
    totalUsers: 25,
    activeSessions: 8,
    totalYield: 145.2
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'FARM_CREATED',
      message: 'New farm "Green Valley" was created',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'PLANTING_SESSION',
      message: 'Planting session started at Sunrise Farm',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      user: 'Mary Smith'
    },
    {
      id: 3,
      type: 'PREDICTION_GENERATED',
      message: 'Yield prediction completed for Highland Farms',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      user: 'System'
    }
  ];

  const mockYieldTrends = [
    { name: 'Jan', yield: 20 },
    { name: 'Feb', yield: 25 },
    { name: 'Mar', yield: 30 },
    { name: 'Apr', yield: 28 },
    { name: 'May', yield: 35 },
    { name: 'Jun', yield: 40 }
  ];

  const loadDashboardData = async () => {
    const loadWithFallback = async (dataKey, apiCall, fallbackData) => {
      try {
        setLoading(prev => ({ ...prev, [dataKey]: true }));
        setErrors(prev => ({ ...prev, [dataKey]: null }));

        const data = await apiCall();
        setDashboardData(prev => ({ ...prev, [dataKey]: data }));

        console.log(`✅ ${dataKey} loaded successfully:`, data);
      } catch (error) {
        console.warn(`⚠️ ${dataKey} failed, using fallback:`, error.message);

        // Use fallback data for missing endpoints
        if (error.status === 404) {
          setDashboardData(prev => ({ ...prev, [dataKey]: fallbackData }));
          setErrors(prev => ({
            ...prev,
            [dataKey]: {
              type: 'MISSING_ENDPOINT',
              message: `${dataKey} endpoint not available - using demo data`,
              showFallback: true
            }
          }));
        } else {
          // For other errors, still use fallback but mark as error
          setDashboardData(prev => ({ ...prev, [dataKey]: fallbackData }));
          setErrors(prev => ({
            ...prev,
            [dataKey]: {
              type: 'API_ERROR',
              message: `Failed to load ${dataKey}: ${error.message}`,
              showFallback: true
            }
          }));
        }
      } finally {
        setLoading(prev => ({ ...prev, [dataKey]: false }));
      }
    };

    // Load all dashboard data with fallbacks
    await Promise.all([
      loadWithFallback('stats', () => apiService.getDashboardStats(), mockStats),
      loadWithFallback('recentActivity', () => apiService.getRecentActivity(), mockRecentActivity),
      loadWithFallback('yieldTrends', () => apiService.getAnalytics('yield-trends'), mockYieldTrends)
    ]);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const retryLoad = (dataKey) => {
    switch (dataKey) {
      case 'stats':
        loadDashboardData();
        break;
      case 'recentActivity':
        loadDashboardData();
        break;
      case 'yieldTrends':
        loadDashboardData();
        break;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, loading, error, dataKey }) => (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
        {error && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center space-x-1">
                {error.showFallback && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Demo
                            </span>
                )}
                <button
                    onClick={() => retryLoad(dataKey)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Retry loading"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
        )}

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

  const ActivityItem = ({ activity }) => (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
            <span>{activity.user}</span>
            <span>•</span>
            <span>{new Date(activity.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
  );

  return (
      <div className="space-y-6">
        <ErrorDisplay />

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome to Maize Admin Dashboard</h1>
          <p className="text-green-100 mt-2">
            Monitor your agricultural operations and predictions in real time
          </p>
          {user && (
              <p className="text-green-200 text-sm mt-1">
                Logged in as: {user.username}
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
              title="Total Yield (tons)"
              value={dashboardData.stats?.totalYield || 0}
              icon={TrendingUp}
              color="bg-orange-500"
              loading={loading.stats}
              error={errors.stats}
              dataKey="stats"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Trends Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yield Trends</h3>
              {errors.yieldTrends && (
                  <div className="flex items-center space-x-2">
                    {errors.yieldTrends.showFallback && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        Demo Data
                                    </span>
                    )}
                    <button
                        onClick={() => retryLoad('yieldTrends')}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Retry loading"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
              )}
            </div>

            {loading.yieldTrends ? (
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dashboardData.yieldTrends || mockYieldTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="yield"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              {errors.recentActivity && (
                  <div className="flex items-center space-x-2">
                    {errors.recentActivity.showFallback && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        Demo Data
                                    </span>
                    )}
                    <button
                        onClick={() => retryLoad('recentActivity')}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Retry loading"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
              )}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {loading.recentActivity ? (
                  Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                  ))
              ) : dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                  ))
              ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;