// src/components/layout/AuthHeader.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

const AuthHeader = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    // Helper function to get display role
    const getDisplayRole = () => {
        if (!user) return 'User';

        // Get role from user object
        const role = user.role || user.roles?.[0] || 'USER';

        // Convert role to display format
        switch (role.toUpperCase()) {
            case 'ADMIN':
                return 'Administrator';
            case 'FARMER':
                return 'Farmer';
            case 'USER':
                return 'User';
            default:
                return role; // Return as-is if unknown
        }
    };

    // Helper function to get user display name
    const getDisplayName = () => {
        if (!user) return 'Unknown User';

        // Try different name combinations
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        if (user.firstName) {
            return user.firstName;
        }
        if (user.name) {
            return user.name;
        }
        return user.username || 'User';
    };

    // Helper function to get user identifier for dropdown details
    const getUserId = () => {
        return user?.id || user?.userId || 'N/A';
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <div className="bg-green-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-green-600" />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{getDisplayRole()}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {dropdownOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                    <div className="flex items-center mt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {getDisplayRole()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>User ID:</span>
                                    <span className="font-mono">{getUserId()}</span>
                                </div>
                                {user.email && (
                                    <div className="flex justify-between">
                                        <span>Email:</span>
                                        <span className="truncate ml-2">{user.email}</span>
                                    </div>
                                )}
                                {user.lastLogin && (
                                    <div className="flex justify-between">
                                        <span>Last Login:</span>
                                        <span>{new Date(user.lastLogin).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Actions */}
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    // Navigate to profile/settings if you have that page
                                    console.log('Navigate to settings');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Settings className="w-4 h-4 mr-3" />
                                Account Settings
                            </button>

                            <hr className="my-1 border-gray-100" />

                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AuthHeader;