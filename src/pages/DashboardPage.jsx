// src/pages/DashboardPage.jsx - Role-Based Dashboard
import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Sprout,
  TrendingUp,
  TreePine,
  Target,
  Brain,
  BarChart3,
  CloudRain,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

// Extend apiService with farmer-specific methods if they don't exist
if (!apiService.getMyFarms) {
  apiService.getMyFarms = async function() {
    try {
      const response = await this.get('/farms/my-farms');
      console.log('🔍 My farms response:', response);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.content && Array.isArray(response.content)) {
        return response.content;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      }

      return response || [];
    } catch (error) {
      console.error('❌ getMyFarms error:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  };
}

if (!apiService.getMyPredictions) {
  apiService.getMyPredictions = async function() {
    try {
      // Try different possible prediction endpoints
      let response;
      try {
        response = await this.get('/predictions/my-predictions');
      } catch (e) {
        // Fallback to general predictions endpoint
        response = await this.get('/predictions');
      }

      console.log('🔍 My predictions response:', response);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.content && Array.isArray(response.content)) {
        return response.content;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      }

      return response || [];
    } catch (error) {
      console.error('❌ getMyPredictions error:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  };
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentActivity: [],
    yieldTrends: [],
    weatherData: null,
    myFarms: [],
    myPredictions: []
  });
  const [loading, setLoading] = useState({
    stats: true,
    recentActivity: true,
    yieldTrends: true,
    weatherData: true,
    myData: true
  });
  const [errors, setErrors] = useState({});

  // Mock data for fallback
  const mockAdminStats = {
    totalUsers: 1250,
    totalFarmers: 892,
    totalFarms: 567,
    activeSessions: 156,
    totalPredictions: 3420,
    avgYield: 4.2,
    modelAccuracy: 87.5,
    userGrowth: 12.5,
    farmerGrowth: 8.3,
    sessionGrowth: 15.2,
    predictionGrowth: 22.1
  };

  const mockFarmerStats = {
    myFarms: 3,
    activePlantingSessions: 2,
    totalPredictions: 15,
    avgYield: 4.8,
    bestYield: 5.2,
    currentSeasonArea: 12.5,
    weatherAlerts: 1,
    nextPlantingWindow: "March 15-30"
  };

  const mockRecentActivity = [
    { id: 1, type: 'prediction', action: 'New yield prediction created', user: 'John Farmer', time: '2 hours ago' },
    { id: 2, type: 'user', action: 'New farmer registered', user: 'Mary Green', time: '4 hours ago' },
    { id: 3, type: 'session', action: 'Planting session completed', user: 'Bob Agriculture', time: '6 hours ago' },
    { id: 4, type: 'weather', action: 'Weather alert issued', user: 'System', time: '8 hours ago' }
  ];

  const mockYieldTrends = [
    { month: 'Jan', predicted: 4.2, actual: 4.1 },
    { month: 'Feb', predicted: 4.5, actual: 4.3 },
    { month: 'Mar', predicted: 4.8, actual: 4.9 },
    { month: 'Apr', predicted: 5.1, actual: 5.0 },
    { month: 'May', predicted: 4.9, actual: 4.8 },
    { month: 'Jun', predicted: 4.6, actual: 4.7 }
  ];

  const mockFarmerData = {
    myFarms: [
      { id: 1, name: "North Field", area: 5.2, status: "Active", lastPlanted: "2024-03-15", expectedYield: 4.8 },
      { id: 2, name: "South Valley", area: 3.8, status: "Planted", lastPlanted: "2024-03-10", expectedYield: 5.1 },
      { id: 3, name: "East Meadow", area: 3.5, status: "Preparing", lastPlanted: null, expectedYield: null }
    ],
    myPredictions: [
      { id: 1, farmName: "North Field", predictedYield: 4.8, confidence: 89, date: "2024-06-15", status: "Active" },
      { id: 2, farmName: "South Valley", predictedYield: 5.1, confidence: 92, date: "2024-06-10", status: "Active" }
    ]
  };

  // Fetch dashboard data based on user role
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.role === 'ADMIN') {
        await fetchAdminData();
      } else if (user?.role === 'FARMER') {
        await fetchFarmerData();
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchAdminData = async () => {
    // Fetch admin-specific data
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const stats = await apiService.getDashboardStats();
      setDashboardData(prev => ({ ...prev, stats }));
    } catch (error) {
      console.warn('Admin stats failed, using mock data:', error);
      setDashboardData(prev => ({ ...prev, stats: mockAdminStats }));
      setErrors(prev => ({ ...prev, stats: { showFallback: true, message: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }

    // Fetch other admin data...
    try {
      setLoading(prev => ({ ...prev, recentActivity: true }));
      const activity = await apiService.getRecentActivity();
      setDashboardData(prev => ({ ...prev, recentActivity: activity }));
    } catch (error) {
      setDashboardData(prev => ({ ...prev, recentActivity: mockRecentActivity }));
    } finally {
      setLoading(prev => ({ ...prev, recentActivity: false }));
    }
  };

  const fetchFarmerData = async () => {
    // Fetch farmer-specific data
    try {
      setLoading(prev => ({ ...prev, myData: true }));

      // Fetch real farm data from the database
      const myFarms = await apiService.getMyFarms();
      console.log('📊 Fetched farmer farms:', myFarms);

      // Fetch recent predictions with linked data
      let myPredictions = [];
      try {
        // Get recent predictions (limit to 5 for dashboard)
        const predictionsResponse = await apiService.get('/predictions?page=0&size=5');
        let predictions = [];

        if (Array.isArray(predictionsResponse)) {
          predictions = predictionsResponse;
        } else if (predictionsResponse && predictionsResponse.content) {
          predictions = predictionsResponse.content;
        }

        // Enhance predictions with farm and planting session data
        const enhancedPredictions = await Promise.allSettled(
            predictions.map(async (prediction) => {
              try {
                let farmName = 'Unknown Farm';
                let cropVariety = 'Maize';
                let plantingDate = null;

                if (prediction.plantingSessionId) {
                  try {
                    // Get planting session details
                    const plantingSession = await apiService.get(`/planting-sessions/${prediction.plantingSessionId}`);

                    if (plantingSession) {
                      // Get crop variety
                      if (plantingSession.maizeVariety && plantingSession.maizeVariety.name) {
                        cropVariety = plantingSession.maizeVariety.name;
                      } else if (plantingSession.maizeVarietyName) {
                        cropVariety = plantingSession.maizeVarietyName;
                      }

                      plantingDate = plantingSession.plantingDate;

                      // Get farm details
                      if (plantingSession.farmId) {
                        const farm = await apiService.get(`/farms/${plantingSession.farmId}`);
                        if (farm && farm.name) {
                          farmName = farm.name;
                        }
                      }
                    }
                  } catch (sessionError) {
                    console.warn(`Could not fetch session data for prediction ${prediction.id}:`, sessionError.message);
                    // Try to match with user's farms as fallback
                    const matchingFarm = myFarms.find(farm => farm.id === prediction.farmId);
                    if (matchingFarm) {
                      farmName = matchingFarm.name;
                    }
                  }
                }

                return {
                  id: prediction.id,
                  farmName,
                  cropVariety,
                  predictedYield: prediction.predictedYieldTonsPerHectare || 0,
                  confidence: Math.round(prediction.confidencePercentage || 0),
                  date: prediction.predictionDate || prediction.createdAt,
                  status: prediction.status || 'Active',
                  plantingDate
                };
              } catch (error) {
                console.error(`Error processing prediction ${prediction.id}:`, error);
                return {
                  id: prediction.id,
                  farmName: 'Unknown Farm',
                  cropVariety: 'Maize',
                  predictedYield: prediction.predictedYieldTonsPerHectare || 0,
                  confidence: Math.round(prediction.confidencePercentage || 0),
                  date: prediction.predictionDate || prediction.createdAt,
                  status: 'Error'
                };
              }
            })
        );

        // Filter successful results
        myPredictions = enhancedPredictions
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .slice(0, 5); // Limit to 5 for dashboard

      } catch (predError) {
        console.warn('Could not fetch predictions:', predError);
        // Use mock predictions if endpoint is not available
        myPredictions = [
          {
            id: 1,
            farmName: myFarms[0]?.name || 'Sample Farm',
            cropVariety: 'SC627',
            predictedYield: 4.8,
            confidence: 92,
            date: '2024-12-20',
            status: 'Active'
          }
        ];
      }

      // Calculate farmer stats from real data
      const farmStats = {
        myFarms: myFarms.length,
        activePlantingSessions: 0, // Will be calculated when we add planting sessions
        totalPredictions: myPredictions.length,
        avgYield: myPredictions.length > 0
            ? myPredictions.reduce((sum, p) => sum + (p.predictedYield || 0), 0) / myPredictions.length
            : 0,
        bestYield: myPredictions.length > 0
            ? Math.max(...myPredictions.map(p => p.predictedYield || 0))
            : 0,
        currentSeasonArea: myFarms.reduce((total, farm) => total + (farm.sizeHectares || 0), 0),
        weatherAlerts: 0, // Will be fetched from weather service
        nextPlantingWindow: "March 15-30"
      };

      // Transform farm data to match our component structure
      const transformedFarms = myFarms.map(farm => ({
        id: farm.id,
        name: farm.name,
        area: farm.sizeHectares,
        status: "Active", // Default status - will be enhanced later
        lastPlanted: null, // Will be filled from planting sessions
        expectedYield: null, // Will be filled from predictions
        location: farm.location,
        latitude: farm.latitude,
        longitude: farm.longitude,
        elevation: farm.elevation,
        createdAt: farm.createdAt
      }));

      // Try to fetch planting sessions for enhanced farm data
      try {
        const plantingSessions = await apiService.getPlantingSessions();
        farmStats.activePlantingSessions = plantingSessions.filter(
            session => session.status === 'ACTIVE' || session.status === 'PLANTED'
        ).length;

        // Enhance farm data with planting session information
        transformedFarms.forEach(farm => {
          const farmSessions = plantingSessions.filter(session =>
              session.farmId === farm.id || session.farmName === farm.name
          );
          if (farmSessions.length > 0) {
            const latestSession = farmSessions.sort((a, b) =>
                new Date(b.plantingDate) - new Date(a.plantingDate)
            )[0];
            farm.lastPlanted = latestSession.plantingDate;
            farm.status = latestSession.status || 'Active';
          }
        });
      } catch (sessionError) {
        console.warn('Could not fetch planting sessions:', sessionError);
      }

      setDashboardData(prev => ({
        ...prev,
        stats: farmStats,
        myFarms: transformedFarms,
        myPredictions: myPredictions
      }));

    } catch (error) {
      console.warn('Farmer data failed, using mock data:', error);
      setDashboardData(prev => ({
        ...prev,
        stats: mockFarmerStats,
        myFarms: mockFarmerData.myFarms,
        myPredictions: mockFarmerData.myPredictions
      }));
    } finally {
      setLoading(prev => ({ ...prev, myData: false }));
    }
  };

  // Admin Dashboard Component
  const AdminDashboard = () => (
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
          <p className="text-blue-100 mt-2">
            Monitor system-wide operations and manage all agricultural data
          </p>
          <p className="text-blue-200 text-sm mt-1">
            Logged in as: {user?.username} (Administrator)
          </p>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
              title="Total Users"
              value={dashboardData.stats?.totalUsers || 0}
              icon={Users}
              color="bg-purple-500"
              loading={loading.stats}
              trend={dashboardData.stats?.userGrowth}
          />
          <StatCard
              title="Active Farmers"
              value={dashboardData.stats?.totalFarmers || 0}
              icon={TreePine}
              color="bg-green-500"
              loading={loading.stats}
              trend={dashboardData.stats?.farmerGrowth}
          />
          <StatCard
              title="Total Farms"
              value={dashboardData.stats?.totalFarms || 0}
              icon={MapPin}
              color="bg-blue-500"
              loading={loading.stats}
          />
          <StatCard
              title="ML Accuracy"
              value={`${dashboardData.stats?.modelAccuracy || 0}%`}
              icon={Brain}
              color="bg-orange-500"
              loading={loading.stats}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">System Activity</h3>
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
              ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {dashboardData.recentActivity.map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
              )}
            </div>
          </div>

          {/* Yield Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Yield Performance</h3>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockYieldTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
              title="User Management"
              description="Manage users and farmers"
              icon={Users}
              onClick={() => navigate('/users')}
              color="bg-purple-500"
          />
          <QuickActionCard
              title="ML Models"
              description="Train and manage models"
              icon={Brain}
              onClick={() => navigate('/models')}
              color="bg-orange-500"
          />
          <QuickActionCard
              title="Analytics"
              description="View detailed analytics"
              icon={BarChart3}
              onClick={() => navigate('/analytics')}
              color="bg-blue-500"
          />
        </div>
      </div>
  );

  // Farmer Dashboard Component
  const FarmerDashboard = () => (
      <div className="space-y-6">
        {/* Current Season Summary */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || user?.username}!</h1>
          <p className="text-green-100 mt-2">
            Manage your farms and track your maize yield predictions
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="text-green-200 text-sm">
              Current Season • {dashboardData.stats?.currentSeasonArea?.toFixed(1) || 0} hectares total
            </div>
            {dashboardData.myFarms && dashboardData.myFarms.length > 0 && (
                <div className="text-green-200 text-sm">
                  {dashboardData.myFarms.length} farm{dashboardData.myFarms.length !== 1 ? 's' : ''} registered
                </div>
            )}
          </div>
        </div>

        {/* Farmer Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
              title="My Farms"
              value={dashboardData.stats?.myFarms || 0}
              icon={MapPin}
              color="bg-green-500"
              loading={loading.myData}
              actionButton={{ text: "View All", onClick: () => navigate('/farms') }}
          />
          <StatCard
              title="Active Sessions"
              value={dashboardData.stats?.activePlantingSessions || 0}
              icon={Sprout}
              color="bg-blue-500"
              loading={loading.myData}
              actionButton={{ text: "Manage", onClick: () => navigate('/planting-sessions') }}
          />
          <StatCard
              title="Avg Yield"
              value={`${dashboardData.stats?.avgYield || 0} t/ha`}
              icon={TrendingUp}
              color="bg-purple-500"
              loading={loading.myData}
          />
          <StatCard
              title="Weather Alerts"
              value={dashboardData.stats?.weatherAlerts || 0}
              icon={AlertTriangle}
              color={dashboardData.stats?.weatherAlerts > 0 ? "bg-red-500" : "bg-gray-500"}
              loading={loading.myData}
              actionButton={{ text: "Check", onClick: () => navigate('/weather') }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Farms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Farms</h3>
              <button
                  onClick={() => navigate('/farms')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Farm
              </button>
            </div>
            <div className="p-4">
              {loading.myData ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                          </div>
                          <div className="flex justify-between">
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : dashboardData.myFarms && dashboardData.myFarms.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.myFarms.map(farm => (
                        <FarmCard key={farm.id} farm={farm} />
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Farms Yet</h4>
                    <p className="text-gray-600 mb-4">
                      Start by adding your first farm to begin tracking yield predictions.
                    </p>
                    <button
                        onClick={() => navigate('/farms')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Your First Farm
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* Recent Predictions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Predictions</h3>
              <button
                  onClick={() => navigate('/predictions')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View All
              </button>
            </div>
            <div className="p-4">
              {loading.myData ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="p-3 border rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="space-y-3">
                    {dashboardData.myPredictions.map(prediction => (
                        <PredictionCard key={prediction.id} prediction={prediction} />
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions for Farmers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
              title="New Prediction"
              description="Create yield prediction"
              icon={Target}
              onClick={() => navigate('/predictions')}
              color="bg-green-500"
          />
          <QuickActionCard
              title="Weather Data"
              description="Check current conditions"
              icon={CloudRain}
              onClick={() => navigate('/weather')}
              color="bg-blue-500"
          />
          <QuickActionCard
              title="My Settings"
              description="Update profile & preferences"
              icon={SettingsIcon}
              onClick={() => navigate('/settings')}
              color="bg-gray-500"
          />
        </div>
      </div>
  );

  // Shared Components
  const StatCard = ({ title, value, icon: Icon, color, loading, trend, actionButton }) => (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
            ) : (
                <div className="flex items-baseline mt-2">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  {trend && (
                      <span className={`ml-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
                  )}
                </div>
            )}
            {actionButton && (
                <button
                    onClick={actionButton.onClick}
                    className="mt-3 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  {actionButton.text}
                </button>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityColor = (type) => {
      switch (type) {
        case 'user': return 'bg-blue-100 text-blue-600';
        case 'prediction': return 'bg-green-100 text-green-600';
        case 'session': return 'bg-purple-100 text-purple-600';
        case 'weather': return 'bg-orange-100 text-orange-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    const getActivityIcon = (type) => {
      switch (type) {
        case 'user': return <Users className="w-4 h-4" />;
        case 'prediction': return <Target className="w-4 h-4" />;
        case 'session': return <Sprout className="w-4 h-4" />;
        case 'weather': return <CloudRain className="w-4 h-4" />;
        default: return <BarChart3 className="w-4 h-4" />;
      }
    };

    return (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className={`flex-shrink-0 w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-sm`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium truncate">
              {activity.action}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span className="font-medium">{activity.user}</span>
              <span>•</span>
              <span>{activity.time}</span>
            </div>
          </div>
        </div>
    );
  };

  const FarmCard = ({ farm }) => (
      <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{farm.name}</h4>
            <p className="text-sm text-gray-600">
              {farm.location} • {farm.area} hectares
            </p>
          </div>
          <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              farm.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : farm.status === 'Planted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
          }`}>
            {farm.status}
          </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {farm.lastPlanted ? (
                <span>Planted: {new Date(farm.lastPlanted).toLocaleDateString()}</span>
            ) : (
                <span>Not planted this season</span>
            )}
          </div>
          <div className="text-right">
            {farm.expectedYield ? (
                <span className="font-medium text-green-600">{farm.expectedYield} t/ha</span>
            ) : (
                <span className="text-gray-400">No prediction</span>
            )}
          </div>
        </div>

        {(farm.latitude && farm.longitude) && (
            <div className="mt-2 text-xs text-gray-500">
              📍 {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
              {farm.elevation && ` • ${farm.elevation}m elevation`}
            </div>
        )}
      </div>
  );

  const PredictionCard = ({ prediction }) => (
      <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{prediction.farmName}</h4>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Sprout className="w-3 h-3 mr-1" />
              <span>{prediction.cropVariety}</span>
            </div>
          </div>
          <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              prediction.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : prediction.status === 'Error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
          }`}>
            {prediction.status}
          </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Predicted Yield</label>
            <p className="text-sm font-semibold text-green-600">
              {prediction.predictedYield > 0 ? `${prediction.predictedYield.toFixed(1)} t/ha` : 'Calculating...'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Confidence</label>
            <p className="text-sm font-semibold text-gray-900">
              {prediction.confidence > 0 ? `${prediction.confidence}%` : 'Pending'}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Created {new Date(prediction.date).toLocaleDateString()}</span>
          </div>
          {prediction.plantingDate && (
              <div className="flex items-center">
                <span>Planted {new Date(prediction.plantingDate).toLocaleDateString()}</span>
              </div>
          )}
        </div>
      </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color }) => (
      <div
          onClick={onClick}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
  );

  // Error Display Component
  const ErrorDisplay = () => {
    const hasErrors = Object.values(errors).some(error => error && !error.showFallback);
    if (!hasErrors) return null;

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800 font-medium">Some data failed to load</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Showing cached data where available. Check your connection and try refreshing.
          </p>
        </div>
    );
  };

  // Main render logic based on user role
  return (
      <div className="space-y-6">
        <ErrorDisplay />

        {user?.role === 'ADMIN' ? (
            <AdminDashboard />
        ) : user?.role === 'FARMER' ? (
            <FarmerDashboard />
        ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600">
                Your account doesn't have permission to access the dashboard.
              </p>
            </div>
        )}
      </div>
  );
};

export default DashboardPage;