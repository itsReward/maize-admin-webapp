// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import your existing components
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import FarmsPage from './pages/FarmsPage';
import PlantingSessionsPage from './pages/PlantingSessionsPage';
import WeatherPage from './pages/WeatherPage';
import PredictionsPage from './pages/PredictionsPage';
import ModelsPage from './pages/ModelsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataExplorationPage from './pages/DataExplorationPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* User Management */}
                <Route path="users" element={<UsersPage />} />

                {/* Farm Management */}
                <Route path="farms" element={<FarmsPage />} />
                <Route path="planting-sessions" element={<PlantingSessionsPage />} />

                {/* Weather and Data */}
                <Route path="weather" element={<WeatherPage />} />
                <Route path="data-exploration" element={<DataExplorationPage />} />

                {/* ML and Predictions */}
                <Route path="predictions" element={<PredictionsPage />} />
                <Route path="models" element={<ModelsPage />} />

                {/* Analytics */}
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;