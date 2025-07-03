// src/components/debug/RoleDebugPanel.jsx - Debug component for role-based routing

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, User, Settings } from 'lucide-react';

const RoleDebugPanel = () => {
    const { user, getHomePage, hasRole, hasAnyRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Only show in development mode
    if (!process.env.REACT_APP_DEBUG) {
        return null;
    }

    const currentRole = user?.role || 'Unknown';
    const homePage = getHomePage();

    return (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                🐛 Role Debug Panel
            </h3>

            <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div><strong>Current Role:</strong></div>
                    <div className="font-mono bg-white px-2 py-1 rounded text-xs">
                        {currentRole}
                    </div>

                    <div><strong>Current Path:</strong></div>
                    <div className="font-mono bg-white px-2 py-1 rounded text-xs">
                        {location.pathname}
                    </div>

                    <div><strong>Home Page:</strong></div>
                    <div className="font-mono bg-white px-2 py-1 rounded text-xs">
                        {homePage}
                    </div>

                    <div><strong>Is Admin:</strong></div>
                    <div className={`px-2 py-1 rounded text-xs ${hasRole('ADMIN') ? 'bg-green-200' : 'bg-red-200'}`}>
                        {hasRole('ADMIN') ? 'Yes' : 'No'}
                    </div>

                    <div><strong>Is Farmer:</strong></div>
                    <div className={`px-2 py-1 rounded text-xs ${hasRole('FARMER') ? 'bg-green-200' : 'bg-red-200'}`}>
                        {hasRole('FARMER') ? 'Yes' : 'No'}
                    </div>

                    <div><strong>At Home:</strong></div>
                    <div className={`px-2 py-1 rounded text-xs ${location.pathname === homePage ? 'bg-green-200' : 'bg-gray-200'}`}>
                        {location.pathname === homePage ? 'Yes' : 'No'}
                    </div>
                </div>

                <div className="border-t border-yellow-300 pt-2">
                    <div className="flex flex-wrap gap-1">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                            Root (/)
                        </button>
                        <button
                            onClick={() => navigate(homePage)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                            <Home className="h-3 w-3" />
                            Home
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/farms')}
                            className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
                        >
                            Farms
                        </button>
                        <button
                            onClick={() => navigate('/unknown-route')}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                        >
                            404 Test
                        </button>
                    </div>
                </div>

                <div className="text-xs text-yellow-700">
                    <strong>Test Instructions:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>FARMER users should go to /farms by default</li>
                        <li>ADMIN users should go to /dashboard by default</li>
                        <li>Unknown routes should redirect to role home</li>
                        <li>Root (/) should redirect to role home</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RoleDebugPanel;