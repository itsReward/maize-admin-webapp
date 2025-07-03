// src/components/auth/RoleProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleProtectedRoute = ({
                                children,
                                requiredRoles = [],
                                fallbackPath = '/dashboard',
                                adminOnly = false
                            }) => {
    const { user, isAuthenticated, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check admin only access
    if (adminOnly && user.role !== 'ADMIN') {
        console.log('🚫 Access denied: Admin only route, user role:', user.role);
        return <Navigate to={fallbackPath} replace />;
    }

    // Check required roles
    if (requiredRoles.length > 0) {
        const hasRequiredRole = user.role === 'ADMIN' || requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            console.log('🚫 Access denied: Required roles:', requiredRoles, 'User role:', user.role);
            return <Navigate to={fallbackPath} replace />;
        }
    }

    // Log successful access
    console.log('✅ Access granted:', {
        userRole: user.role,
        requiredRoles,
        adminOnly,
        path: window.location.pathname
    });

    return children;
};

export default RoleProtectedRoute;