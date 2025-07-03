// Replace your Layout.jsx with this version to debug and fix the role issue

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Sprout,
    CloudRain,
    BarChart3,
    Brain,
    TrendingUp,
    Database,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthHeader from './AuthHeader';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Debug: Log user data every time it changes
    useEffect(() => {
        console.log('🔍 Layout Debug - User data changed:', {
            user: user,
            userRole: user?.role,
            userRoleType: typeof user?.role,
            isAuthenticated: isAuthenticated,
            storageUser: JSON.parse(localStorage.getItem('maize_user_data') || 'null')
        });
    }, [user, isAuthenticated]);

    // Helper function to safely get user role
    const getUserRole = () => {
        if (!user) return 'User';

        // Check multiple possible role properties
        const role = user.role || user.roles?.[0] || user.authority || 'User';
        console.log('🎭 Role detection:', { user, detectedRole: role });
        return role;
    };

    // Helper function to check if user has required role
    const hasRole = (requiredRole) => {
        if (!user || !isAuthenticated) {
            console.log('🚫 Role check failed: No user or not authenticated');
            return false;
        }

        const userRole = getUserRole();

        // ADMIN has access to everything
        if (userRole === 'ADMIN') {
            console.log('✅ Admin access granted');
            return true;
        }

        // Check specific role
        const hasAccess = userRole === requiredRole;
        console.log(`🔑 Role check: ${userRole} === ${requiredRole} = ${hasAccess}`);
        return hasAccess;
    };

    // Helper function to check if user has any of the required roles
    const hasAnyRole = (requiredRoles) => {
        if (!user || !isAuthenticated) return false;

        const userRole = getUserRole();

        // ADMIN has access to everything
        if (userRole === 'ADMIN') return true;

        // Check if user has any of the required roles
        return requiredRoles.includes(userRole);
    };

    // Define navigation items with role requirements
    const allNavigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard',
            roles: ['ADMIN', 'FARMER']
        },
        {
            name: 'Users',
            href: '/users',
            icon: Users,
            current: location.pathname === '/users',
            roles: ['ADMIN']
        },
        {
            name: 'Farms',
            href: '/farms',
            icon: Sprout,
            current: location.pathname === '/farms',
            roles: ['ADMIN', 'FARMER']
        },
        {
            name: 'Planting Sessions',
            href: '/planting-sessions',
            icon: Sprout,
            current: location.pathname === '/planting-sessions',
            roles: ['ADMIN', 'FARMER']
        },
        {
            name: 'Weather Data',
            href: '/weather',
            icon: CloudRain,
            current: location.pathname === '/weather',
            roles: ['ADMIN', 'FARMER']
        },
        {
            name: 'Data Exploration',
            href: '/data-exploration',
            icon: Database,
            current: location.pathname === '/data-exploration',
            roles: ['ADMIN']
        },
        {
            name: 'Predictions',
            href: '/predictions',
            icon: TrendingUp,
            current: location.pathname === '/predictions',
            roles: ['ADMIN', 'FARMER']
        },
        {
            name: 'ML Models',
            href: '/models',
            icon: Brain,
            current: location.pathname === '/models',
            roles: ['ADMIN']
        },
        {
            name: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
            current: location.pathname === '/analytics',
            roles: ['ADMIN']
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            current: location.pathname === '/settings',
            roles: ['ADMIN', 'FARMER']
        }
    ];

    // Filter navigation items based on user role
    const navigation = allNavigationItems.filter(item => {
        const hasAccess = hasAnyRole(item.roles);
        console.log(`📋 Menu item "${item.name}": ${hasAccess ? 'VISIBLE' : 'HIDDEN'}`);
        return hasAccess;
    });

    const handleNavigation = (href) => {
        navigate(href);
        setSidebarOpen(false);
    };

    // Get display role for UI
    const displayRole = getUserRole();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Close button for mobile */}
                <div className="lg:hidden absolute top-4 right-4">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Logo */}
                <div className="flex items-center space-x-3 px-6 py-6 border-b border-gray-200">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Sprout className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg text-gray-900">HarvestIQ</span>
                        <p className="text-xs text-gray-500">{displayRole} Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 py-6 space-y-1">
                    <nav>
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigation(item.href)}
                                    className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${item.current
                                        ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                  `}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Role indicator */}
                    {user && (
                        <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Logged in as</p>
                            <p className="text-sm font-medium text-gray-900">{displayRole}</p>
                            <p className="text-xs text-gray-500">{user.username}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                            >
                                <Menu className="w-5 h-5 text-gray-500" />
                            </button>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {navigation.find(item => item.current)?.name || 'Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Maize Yield Prediction System • {displayRole} Access
                                </p>
                            </div>
                        </div>

                        {/* Auth Header */}
                        <AuthHeader />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;