// src/pages/PlaceholderPage.jsx
import React from 'react';
import { Construction, AlertCircle } from 'lucide-react';

const PlaceholderPage = ({ title = "Page" }) => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
                <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Construction className="w-10 h-10 text-yellow-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {title} Page
                </h2>

                <p className="text-gray-600 mb-6">
                    This page is currently under development. We're working hard to bring you this feature soon!
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <h3 className="text-sm font-medium text-blue-900 mb-1">
                                Coming Soon
                            </h3>
                            <p className="text-xs text-blue-700">
                                This {title.toLowerCase()} management feature will include comprehensive tools for managing your agricultural data and operations.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    <p>In the meantime, you can:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Access the Dashboard for overview</li>
                        <li>Manage Users and Settings</li>
                        <li>Explore existing data</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPage;