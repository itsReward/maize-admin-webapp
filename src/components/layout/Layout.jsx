import React, { useState } from 'react';
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
import AuthHeader from './AuthHeader';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard'
        },
        {
            name: 'Users',
            href: '/users',
            icon: Users,
            current: location.pathname === '/users'
        },
        {
            name: 'Farms',
            href: '/farms',
            icon: Sprout,
            current: location.pathname === '/farms'
        },
        {
            name: 'Planting Sessions',
            href: '/planting-sessions',
            icon: Sprout,
            current: location.pathname === '/planting-sessions'
        },
        {
            name: 'Weather Data',
            href: '/weather',
            icon: CloudRain,
            current: location.pathname === '/weather'
        },
        {
            name: 'Data Exploration',
            href: '/data-exploration',
            icon: Database,
            current: location.pathname === '/data-exploration'
        },
        {
            name: 'Predictions',
            href: '/predictions',
            icon: TrendingUp,
            current: location.pathname === '/predictions'
        },
        {
            name: 'ML Models',
            href: '/models',
            icon: Brain,
            current: location.pathname === '/models'
        },
        {
            name: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
            current: location.pathname === '/analytics'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            current: location.pathname === '/settings'
        }
    ];

    const handleNavigation = (href) => {
        navigate(href);
        setSidebarOpen(false); // Close mobile sidebar after navigation
    };

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
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-600 p-2 rounded-lg">
                                <Sprout className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">HarvestIQ</span>
                        </div>

                        {/* Close button for mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigation(item.href)}
                                    className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
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
                                <p className="text-sm text-gray-600">Maize Yield Prediction System</p>
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