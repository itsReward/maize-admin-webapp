// src/components/layout/AuthHeader.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

const AuthHeader = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
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
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-500">ID: {user.userId}</p>
                        </div>

                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    // Navigate to profile/settings if you have that page
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Settings className="w-4 h-4 mr-3" />
                                Account Settings
                            </button>

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