// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

// Import your existing components
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import existing pages
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import DataExplorationPage from './pages/DataExplorationPage';
import SettingsPage from './pages/SettingsPage';
import WeatherPage from "./pages/WeatherPage";
import PredictionsPage from "./pages/PredictionsPage";
import PlantingSessionsPage from "./pages/PlantingSessionsPage";
import FarmsPage from "./pages/FarmsPage";
import ModelsPage from "./pages/ModelsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FarmsDetailPage from "./pages/FarmsDetailPage";



// Import placeholder page for missing routes
import PlaceholderPage from './pages/PlaceholderPage';

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
                {/* Dashboard - accessible to all authenticated users */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="/farms/:farmId" element={<FarmsDetailPage />}/>

                {/* Admin Only Routes */}
                <Route path="users" element={
                  <RoleProtectedRoute adminOnly={true}>
                    <UsersPage />
                  </RoleProtectedRoute>
                } />

                <Route path="data-exploration" element={
                  <RoleProtectedRoute adminOnly={true}>
                    <DataExplorationPage />
                  </RoleProtectedRoute>
                } />

                <Route path="models" element={
                  <RoleProtectedRoute adminOnly={true}>
                    <ModelsPage />
                  </RoleProtectedRoute>
                } />

                <Route path="analytics" element={
                  <RoleProtectedRoute adminOnly={true}>
                    <AnalyticsPage />
                  </RoleProtectedRoute>
                } />

                {/* Routes accessible to both ADMIN and FARMER */}
                <Route path="farms" element={
                  <RoleProtectedRoute requiredRoles={['ADMIN', 'FARMER']}>
                    <FarmsPage />
                  </RoleProtectedRoute>
                } />

                <Route path="planting-sessions" element={
                  <RoleProtectedRoute requiredRoles={['ADMIN', 'FARMER']}>
                    <PlantingSessionsPage />
                  </RoleProtectedRoute>
                } />

                <Route path="weather" element={
                  <RoleProtectedRoute requiredRoles={['ADMIN', 'FARMER']}>
                    <WeatherPage />
                  </RoleProtectedRoute>
                } />

                <Route path="predictions" element={
                  <RoleProtectedRoute requiredRoles={['ADMIN', 'FARMER']}>
                    <PredictionsPage />
                  </RoleProtectedRoute>
                } />

                <Route path="settings" element={
                  <RoleProtectedRoute requiredRoles={['ADMIN', 'FARMER']}>
                    <SettingsPage />
                  </RoleProtectedRoute>
                } />
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