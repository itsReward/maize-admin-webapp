#!/bin/bash

# generate-components.sh - Creates all React components and pages
set -e

echo "⚛️ Creating React components and pages..."

# Create the main App component
cat > src/App.js << 'EOF'
import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { 
  Users, 
  Sprout, 
  TrendingUp, 
  Database, 
  Cloud, 
  Settings, 
  BarChart3, 
  Activity,
  Calendar,
  MapPin,
  Brain,
  Download,
  Upload,
  Play,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  TreePine,
  Thermometer,
  Target,
  Zap,
  LineChart,
  PieChart,
  Gauge,
  Layers,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import services and components
import ApiService from './services/apiService';
import { useApi } from './hooks/useApi';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import FarmersPage from './pages/FarmersPage';
import PlantingSessionsPage from './pages/PlantingSessionsPage';
import WeatherPage from './pages/WeatherPage';
import ModelsPage from './pages/ModelManagementPage';
import AnalyticsPage from './pages/DataExplorationPage';
import SettingsPage from './pages/SettingsPage';

// Context for app state
const AppContext = createContext();

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <UsersPage />;
      case 'farmers': return <FarmersPage />;
      case 'planting': return <PlantingSessionsPage />;
      case 'weather': return <WeatherPage />;
      case 'models': return <ModelsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage }}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export { AppContext };
export default App;
EOF

# Create common components
mkdir -p src/components/common

cat > src/components/common/LoadingSpinner.jsx << 'EOF'
import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className={`border-2 border-green-200 border-t-green-600 rounded-full animate-spin ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
EOF

cat > src/components/common/ErrorMessage.jsx << 'EOF'
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => (
  <div className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between ${className}`}>
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <span className="text-red-800">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;
EOF

cat > src/components/common/Modal.jsx << 'EOF'
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl p-6 ${sizeClasses[size]} w-full mx-4 max-h-[80vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
EOF

cat > src/components/common/DataTable.jsx << 'EOF'
import React, { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const DataTable = ({ columns, data, onRowClick, loading = false, error = null, onRetry }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Data Table</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr
                key={item.id || index}
                onClick={() => onRowClick?.(item)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-green-600 text-white rounded-lg">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
EOF

cat > src/components/common/StatsCard.jsx << 'EOF'
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'green', loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              +{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
EOF

# Create layout components
mkdir -p src/components/layout

cat > src/components/layout/Header.jsx << 'EOF'
import React, { useContext } from 'react';
import { User, Download } from 'lucide-react';
import { AppContext } from '../../App';

const Header = () => {
  const { currentPage } = useContext(AppContext);
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{currentPage}</h1>
          <p className="text-sm text-gray-600">Maize Yield Prediction System</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
EOF

cat > src/components/layout/Sidebar.jsx << 'EOF'
import React, { useContext } from 'react';
import { 
  Home, Users, TreePine, Sprout, Cloud, Brain, BarChart3, Settings
} from 'lucide-react';
import { AppContext } from '../../App';

const Sidebar = () => {
  const { currentPage, setCurrentPage } = useContext(AppContext);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'farmers', label: 'Farmers', icon: TreePine },
    { id: 'planting', label: 'Planting Sessions', icon: Sprout },
    { id: 'weather', label: 'Weather Data', icon: Cloud },
    { id: 'models', label: 'ML Models', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Maize Admin</span>
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                currentPage === item.id ? 'bg-green-600 border-r-4 border-green-400' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
EOF

# Create pages
mkdir -p src/pages

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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No crop distribution data available</p>
          )}
        </div>

        {/* Regional Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Yield Performance</h3>
          {regionalLoading ? (
            <LoadingSpinner />
          ) : regionalError ? (
            <ErrorMessage message="Failed to load regional performance data" />
          ) : regionalPerformance && regionalPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgYield" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No regional performance data available</p>
          )}
        </div>
      </div>

      {/* Prediction Accuracy Over Time */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Accuracy Trends</h3>
        {accuracyLoading ? (
          <LoadingSpinner />
        ) : accuracyError ? (
          <ErrorMessage message="Failed to load accuracy trends" />
        ) : accuracyTrends && accuracyTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No accuracy trend data available</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
EOF

cat > src/pages/SettingsPage.jsx << 'EOF'
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: true,
    dataRetention: '12',
    modelAutoRetrain: false,
    weatherApiKey: '',
    systemMaintenance: false
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await apiService.updateSettings(settings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Failed to save settings');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        {saveStatus && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            saveStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveStatus}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <button
                onClick={() => handleSettingChange('notifications', !settings.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Backup</label>
              <button
                onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Data Retention (months)</label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="60">5 years</option>
              </select>
            </div>
          </div>
        </div>

        {/* ML Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Model Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Model Retraining</label>
              <button
                onClick={() => handleSettingChange('modelAutoRetrain', !settings.modelAutoRetrain)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.modelAutoRetrain ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.modelAutoRetrain ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Training Schedule</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Model Version Limit</label>
              <input
                type="number"
                defaultValue="10"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Weather API Key</label>
            <input
              type="password"
              value={settings.weatherApiKey}
              onChange={(e) => handleSettingChange('weatherApiKey', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter weather API key"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">API Rate Limit (req/min)</label>
            <input
              type="number"
              defaultValue="100"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
EOF

echo "✅ React components and pages created successfully!"
