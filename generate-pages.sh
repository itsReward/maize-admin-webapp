#!/bin/bash

# generate-pages.sh - Creates page components
set -e

echo "📄 Creating page components..."

# Create Dashboard Page
cat > src/pages/DashboardPage.jsx << 'EOF'
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
EOF

# Create Users Page
cat > src/pages/UsersPage.jsx << 'EOF'
import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: usersData, loading, error, refetch } = useApi(
    () => apiService.getUsers(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'lastLogin', label: 'Last Login', render: (value) => 
      value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  const handleCreateUser = async () => {
    // Implementation for user creation modal/form
    console.log('Create user clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button 
          onClick={handleCreateUser}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add New User
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={usersData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default UsersPage;
EOF

# Create Farmers Page
cat > src/pages/FarmersPage.jsx << 'EOF'
import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const FarmersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: farmersData, loading, error, refetch } = useApi(
    () => apiService.getFarmers(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'farmCount', label: 'Farms Count' },
    { key: 'totalArea', label: 'Total Area (ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    },
    { key: 'activeSessions', label: 'Active Sessions' },
    { key: 'avgYield', label: 'Avg Yield (t/ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Farmer Management</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Add New Farmer
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={farmersData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default FarmersPage;
EOF

# Create Planting Sessions Page
cat > src/pages/PlantingSessionsPage.jsx << 'EOF'
import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const PlantingSessionsPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: sessionsData, loading, error, refetch } = useApi(
    () => apiService.getPlantingSessions(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'farmerName', label: 'Farmer' },
    { key: 'maizeVarietyName', label: 'Crop Variety' },
    { key: 'plantingDate', label: 'Planting Date', render: (value) => 
      new Date(value).toLocaleDateString()
    },
    { key: 'area', label: 'Area (ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    },
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'GROWING' ? 'bg-green-100 text-green-800' : 
        value === 'HARVESTED' ? 'bg-blue-100 text-blue-800' : 
        value === 'PLANTED' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'predictedYield', label: 'Predicted Yield (t/ha)', render: (value) => 
      value ? value.toFixed(2) : 'Pending'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Planting Sessions</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          New Session
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={sessionsData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default PlantingSessionsPage;
EOF

# Create Weather Page
cat > src/pages/WeatherPage.jsx << 'EOF'
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const WeatherPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: weatherData, loading, error, refetch } = useApi(
    () => apiService.getWeatherData(null, dateRange.startDate, dateRange.endDate),
    [dateRange.startDate, dateRange.endDate]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Weather Data</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Trends</h3>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message="Failed to load weather data" onRetry={refetch} />
          ) : weatherData && weatherData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="averageTemperature" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No weather data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rainfall Distribution</h3>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message="Failed to load weather data" onRetry={refetch} />
          ) : weatherData && weatherData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weatherData}>
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
    </div>
  );
};

export default WeatherPage;
EOF

# Create Model Management Page
cat > src/pages/ModelManagementPage.jsx << 'EOF'
import React, { useState } from 'react';
import { Brain, Gauge, Activity, Eye, Play, Zap, Upload } from 'lucide-react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const ModelsPage = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const { data: modelVersions, loading: versionsLoading, error: versionsError, refetch: refetchVersions } = useApi(
    () => apiService.getModelVersions()
  );

  const { data: currentModel, loading: currentLoading, error: currentError } = useApi(
    () => apiService.getCurrentModel()
  );

  const { data: featureImportance, loading: featuresLoading, error: featuresError } = useApi(
    () => apiService.getFeatureImportance()
  );

  const handleTrainModel = async () => {
    try {
      setIsTraining(true);
      const trainingConfig = {
        dataPath: 'training_data.csv',
        hyperparameterOptimization: true,
        crossValidationFolds: 5
      };
      
      await apiService.trainModel(trainingConfig);
      alert('Model training initiated successfully!');
      refetchVersions();
    } catch (error) {
      alert(`Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleLoadModel = async (version) => {
    try {
      await apiService.loadModelVersion(version);
      alert(`Model version ${version} loaded successfully!`);
      refetchVersions();
    } catch (error) {
      alert(`Failed to load model: ${error.message}`);
    }
  };

  const columns = [
    { key: 'name', label: 'Model Name' },
    { key: 'type', label: 'Type' },
    { key: 'accuracy', label: 'Accuracy (%)', render: (value) => (
      <div className="flex items-center space-x-2">
        <div className="w-12 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full" 
            style={{ width: `${value || 0}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">{value ? `${value}%` : '--'}</span>
      </div>
    )},
    { key: 'trainingDate', label: 'Training Date', render: (value) => 
      value ? new Date(value).toLocaleDateString() : '--'
    },
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
        value === 'TESTING' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {value || 'Unknown'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (_, model) => (
      <div className="flex space-x-2">
        <button 
          onClick={() => setSelectedModel(model)}
          className="text-green-600 hover:text-green-900"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleLoadModel(model.version)}
          className="text-blue-600 hover:text-blue-900"
          title="Load Model"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ML Model Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleTrainModel}
            disabled={isTraining}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isTraining ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Training...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Train New Model</span>
              </>
            )}
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Import Model
          </button>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Models</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {versionsLoading ? '--' : modelVersions?.versions?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Model</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {currentLoading ? '--' : currentModel?.name || 'No active model'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {currentLoading ? '--' : currentModel?.accuracy ? `${currentModel.accuracy}%` : '--'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Models Table */}
      <DataTable 
        columns={columns} 
        data={modelVersions?.versions || []} 
        loading={versionsLoading}
        error={versionsError}
        onRetry={refetchVersions}
      />

      {/* Model Details Modal */}
      <Modal
        isOpen={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        title="Model Details"
        size="lg"
      >
        {selectedModel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Model Name</label>
                <p className="text-gray-900">{selectedModel.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900">{selectedModel.type || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Accuracy</label>
                <p className="text-gray-900">{selectedModel.accuracy ? `${selectedModel.accuracy}%` : 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900">{selectedModel.status || 'Unknown'}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Feature Importance</label>
              <div className="mt-2 space-y-2">
                {featuresLoading ? (
                  <LoadingSpinner size="sm" />
                ) : featuresError ? (
                  <p className="text-sm text-red-600">Failed to load feature importance</p>
                ) : featureImportance?.feature_importance ? (
                  Object.entries(featureImportance.feature_importance).map(([feature, importance]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${importance * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{(importance * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No feature importance data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModelsPage;
EOF

# Create Data Exploration Page (Analytics)
cat > src/pages/DataExplorationPage.jsx << 'EOF'
import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const AnalyticsPage = () => {
  const { data: cropDistribution, loading: cropLoading, error: cropError } = useApi(
    () => apiService.getCropDistribution()
  );

  const { data: regionalPerformance, loading: regionalLoading, error: regionalError } = useApi(
    () => apiService.getRegionalPerformance()
  );

  const { data: accuracyTrends, loading: accuracyLoading, error: accuracyError } = useApi(
    () => apiService.getModelAccuracyTrends()
  );

  // Fallback data for pie chart colors
  const defaultColors = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Variety Distribution</h3>
          {cropLoading ? (
            <LoadingSpinner />
          ) : cropError ? (
            <ErrorMessage message="Failed to load crop distribution data" />
          ) : cropDistribution && cropDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cropDistribution.map((item, index) => ({
                    ...item,
                    color: defaultColors[index % defaultColors.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  #!/bin/bash

# generate-pages.sh - Creates page components
set -e

echo "📄 Creating page components..."

# Create Dashboard Page
cat > src/pages/DashboardPage.jsx << 'EOF'
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
EOF

# Create Users Page
cat > src/pages/UsersPage.jsx << 'EOF'
import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: usersData, loading, error, refetch } = useApi(
    () => apiService.getUsers(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'lastLogin', label: 'Last Login', render: (value) => 
      value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  const handleCreateUser = async () => {
    // Implementation for user creation modal/form
    console.log('Create user clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button 
          onClick={handleCreateUser}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add New User
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={usersData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default UsersPage;
EOF

# Create Farmers Page
cat > src/pages/FarmersPage.jsx << 'EOF'
import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const FarmersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: farmersData, loading, error, refetch } = useApi(
    () => apiService.getFarmers(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'farmCount', label: 'Farms Count' },
    { key: 'totalArea', label: 'Total Area (ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    },
    { key: 'activeSessions', label: 'Active Sessions' },
    { key: 'avgYield', label: 'Avg Yield (t/ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Farmer Management</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Add New Farmer
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={farmersData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default FarmersPage;
EOF

# Create Planting Sessions Page
cat > src/pages/PlantingSessionsPage.jsx << 'EOF'
import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const PlantingSessionsPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: sessionsData, loading, error, refetch } = useApi(
    () => apiService.getPlantingSessions(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'farmerName', label: 'Farmer' },
    { key: 'maizeVarietyName', label: 'Crop Variety' },
    { key: 'plantingDate', label: 'Planting Date', render: (value) => 
      new Date(value).toLocaleDateString()
    },
    { key: 'area', label: 'Area (ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    },
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'GROWING' ? 'bg-green-100 text-green-800' : 
        value === 'HARVESTED' ? 'bg-blue-100 text-blue-800' : 
        value === 'PLANTED' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'predictedYield', label: 'Predicted Yield (t/ha)', render: (value) => 
      value ? value.toFixed(2) : 'Pending'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Planting Sessions</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          New Session
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={sessionsData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

EOF
