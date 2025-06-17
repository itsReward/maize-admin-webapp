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
