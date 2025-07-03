// src/hooks/useRoleNavigation.js - Hook for role-based navigation

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useRoleNavigation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Get user role
    const userRole = user?.role || 'FARMER';

    // Define role-based home pages
    const getHomePage = (role = userRole) => {
        switch (role) {
            case 'FARMER':
                return '/farms';
            case 'ADMIN':
                return '/dashboard';
            default:
                return '/farms'; // Default fallback
        }
    };

    // Navigate to role-appropriate home page
    const navigateToHome = () => {
        const homePage = getHomePage();
        console.log(`🏠 Navigating ${userRole} to home page: ${homePage}`);
        navigate(homePage);
    };

    // Check if current path is the user's home page
    const isHomePage = (currentPath) => {
        const homePage = getHomePage();
        return currentPath === homePage || (currentPath === '/' && homePage);
    };

    // Get navigation items based on role
    const getNavigationItems = () => {
        const homePage = getHomePage();

        const baseItems = [
            {
                name: userRole === 'FARMER' ? 'My Farms' : 'Dashboard',
                href: homePage,
                icon: userRole === 'FARMER' ? 'Sprout' : 'BarChart3',
                roles: ['ADMIN', 'FARMER'],
                isHome: true,
                priority: 1
            }
        ];

        const otherItems = [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: 'BarChart3',
                roles: ['ADMIN'],
                visible: userRole === 'ADMIN' && homePage !== '/dashboard',
                priority: 2
            },
            {
                name: 'Users',
                href: '/users',
                icon: 'Users',
                roles: ['ADMIN'],
                priority: 3
            },
            {
                name: 'Farms',
                href: '/farms',
                icon: 'Sprout',
                roles: ['ADMIN'],
                visible: userRole === 'ADMIN' && homePage !== '/farms',
                priority: 4
            },
            {
                name: 'Planting Sessions',
                href: '/planting-sessions',
                icon: 'Sprout',
                roles: ['ADMIN', 'FARMER'],
                priority: 5
            },
            {
                name: 'Weather Data',
                href: '/weather',
                icon: 'Cloud',
                roles: ['ADMIN', 'FARMER'],
                priority: 6
            },
            {
                name: 'Predictions',
                href: '/predictions',
                icon: 'Target',
                roles: ['ADMIN', 'FARMER'],
                priority: 7
            },
            {
                name: 'Data Exploration',
                href: '/farmers',
                icon: 'Database',
                roles: ['ADMIN'],
                priority: 8
            },
            {
                name: 'ML Models',
                href: '/models',
                icon: 'Brain',
                roles: ['ADMIN'],
                priority: 9
            },
            {
                name: 'Analytics',
                href: '/analytics',
                icon: 'TrendingUp',
                roles: ['ADMIN'],
                priority: 10
            },
            {
                name: 'Settings',
                href: '/settings',
                icon: 'Settings',
                roles: ['ADMIN', 'FARMER'],
                priority: 11
            }
        ];

        // Combine and filter items
        const allItems = [...baseItems, ...otherItems];

        return allItems
            .filter(item => {
                const hasRole = item.roles.includes(userRole);
                const isVisible = item.visible !== false;
                return hasRole && isVisible;
            })
            .sort((a, b) => a.priority - b.priority);
    };

    // Check if user has access to a specific route
    const hasAccessToRoute = (route) => {
        const routePermissions = {
            '/dashboard': ['ADMIN'],
            '/users': ['ADMIN'],
            '/farmers': ['ADMIN'],
            '/farms': ['ADMIN', 'FARMER'],
            '/planting-sessions': ['ADMIN', 'FARMER'],
            '/weather': ['ADMIN', 'FARMER'],
            '/predictions': ['ADMIN', 'FARMER'],
            '/models': ['ADMIN'],
            '/analytics': ['ADMIN'],
            '/settings': ['ADMIN', 'FARMER']
        };

        const allowedRoles = routePermissions[route] || ['ADMIN', 'FARMER'];
        return allowedRoles.includes(userRole);
    };

    // Redirect unauthorized users
    const redirectIfUnauthorized = (route) => {
        if (!hasAccessToRoute(route)) {
            console.warn(`⚠️ User ${userRole} not authorized for route ${route}, redirecting to home`);
            navigateToHome();
            return true;
        }
        return false;
    };

    return {
        userRole,
        homePage: getHomePage(),
        navigateToHome,
        isHomePage,
        getNavigationItems,
        hasAccessToRoute,
        redirectIfUnauthorized
    };
};

export default useRoleNavigation;