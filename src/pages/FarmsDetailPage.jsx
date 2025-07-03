// src/pages/FarmsDetailPage.jsx - Updated with Real API Integration
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    TestTube,
    Sprout,
    TrendingUp,
    Thermometer,
    Droplets,
    Wind,
    Phone,
    User,
    FileText,
    Activity,
    AlertTriangle
} from 'lucide-react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Map Component placeholder
const MapComponent = ({ latitude, longitude, farmName }) => (
    <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">{farmName} Location</p>
            {latitude && longitude ? (
                <p className="text-sm text-gray-500">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
            ) : (
                <p className="text-sm text-gray-500">Coordinates not available</p>
            )}
        </div>
    </div>
);

// Soil Data Card Component
const SoilDataCard = ({ soilData }) => {
    if (!soilData) {
        return (
            <div className="text-center py-12">
                <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No soil data available</p>
                <p className="text-sm text-gray-400 mt-2">Soil analysis results will appear here once available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Soil Type */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Soil Type</h4>
                    <p className="text-lg font-semibold">{soilData.soilType || 'Not specified'}</p>
                </div>

                {/* pH Level */}
                {soilData.phLevel && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">pH Level</h4>
                        <p className="text-lg font-semibold">{soilData.phLevel}</p>
                    </div>
                )}

                {/* Organic Matter */}
                {soilData.organicMatterPercentage && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Organic Matter</h4>
                        <p className="text-lg font-semibold">{soilData.organicMatterPercentage}%</p>
                    </div>
                )}

                {/* Nitrogen Content */}
                {soilData.nitrogenContent && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Nitrogen (N)</h4>
                        <p className="text-lg font-semibold">{soilData.nitrogenContent}%</p>
                    </div>
                )}

                {/* Phosphorus Content */}
                {soilData.phosphorusContent && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Phosphorus (P)</h4>
                        <p className="text-lg font-semibold">{soilData.phosphorusContent}%</p>
                    </div>
                )}

                {/* Potassium Content */}
                {soilData.potassiumContent && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Potassium (K)</h4>
                        <p className="text-lg font-semibold">{soilData.potassiumContent}%</p>
                    </div>
                )}
            </div>

            {/* Additional soil info */}
            {soilData.soilHealthScore && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Soil Health Score</h4>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                                style={{ width: `${soilData.soilHealthScore}%` }}
                            ></div>
                        </div>
                        <span className="font-semibold">{soilData.soilHealthScore}/100</span>
                    </div>
                </div>
            )}

            {/* Fertilizer Recommendation */}
            {soilData.fertilizerRecommendation && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Fertilizer Recommendation
                    </h4>
                    <p className="text-yellow-700">{soilData.fertilizerRecommendation}</p>
                </div>
            )}

            {/* Sample Date */}
            {soilData.sampleDate && (
                <div className="text-sm text-gray-500">
                    <span>Sample taken on: {new Date(soilData.sampleDate).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
};

// Active Planting Sessions Card Component
const ActiveSessionsCard = ({ sessions }) => {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="text-center py-12">
                <Sprout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active planting sessions</p>
                <p className="text-sm text-gray-400 mt-2">Start a new planting session to track your crops</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session, index) => (
                <div key={session.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-semibold text-lg">
                                {session.maizeVariety?.name || session.cropVariety || 'Unknown Variety'}
                            </h4>
                            <p className="text-sm text-gray-500">
                                Planted on {new Date(session.plantingDate).toLocaleDateString()}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.growthStage === 'HARVESTED' ? 'bg-blue-100 text-blue-800' :
                                session.growthStage === 'GROWING' ? 'bg-green-100 text-green-800' :
                                    session.growthStage === 'PLANTED' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                        }`}>
                            {session.growthStage || 'PLANTED'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {session.daysFromPlanting && (
                            <div>
                                <span className="text-gray-500">Days from planting:</span>
                                <p className="font-medium">{session.daysFromPlanting}</p>
                            </div>
                        )}

                        {session.expectedHarvestDate && (
                            <div>
                                <span className="text-gray-500">Expected harvest:</span>
                                <p className="font-medium">
                                    {new Date(session.expectedHarvestDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {session.seedRateKgPerHectare && (
                            <div>
                                <span className="text-gray-500">Seed rate:</span>
                                <p className="font-medium">{session.seedRateKgPerHectare} kg/ha</p>
                            </div>
                        )}

                        {session.fertilizerType && (
                            <div>
                                <span className="text-gray-500">Fertilizer:</span>
                                <p className="font-medium">{session.fertilizerType}</p>
                            </div>
                        )}
                    </div>

                    {/* Latest Prediction */}
                    {session.latestPrediction && (
                        <div className="mt-4 bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800">Latest Prediction</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-green-600">Predicted Yield:</span>
                                    <p className="font-semibold">{session.latestPrediction.predictedYield} t/ha</p>
                                </div>
                                <div>
                                    <span className="text-green-600">Confidence:</span>
                                    <p className="font-semibold">{session.latestPrediction.confidence}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {session.notes && (
                        <div className="mt-3 text-sm">
                            <span className="text-gray-500">Notes:</span>
                            <p className="text-gray-700 mt-1">{session.notes}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Main Farm Detail Page Component
const FarmsDetailPage = () => {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('soil');

    // Debug farmId to see what we're getting
    console.log('🔍 FarmsDetailPage - farmId from useParams:', farmId);
    console.log('🔍 FarmsDetailPage - farmId type:', typeof farmId);

    // Validate farmId
    const validFarmId = farmId && farmId !== 'undefined' ? farmId : null;

    console.log('🔍 FarmsDetailPage - validFarmId:', validFarmId);

    // If no valid farmId, redirect to farms page
    React.useEffect(() => {
        if (!validFarmId) {
            console.warn('⚠️ No valid farmId found, redirecting to farms page');
            navigate('/farms');
        }
    }, [validFarmId, navigate]);

    // Fetch farm details using the API
    const {
        data: farm,
        loading: farmLoading,
        error: farmError,
        refetch: refetchFarm
    } = useApi(
        () => validFarmId ? apiService.getFarmById(validFarmId) : null,
        [validFarmId]
    );

    // Fetch planting sessions for this farm
    const {
        data: plantingSessions,
        loading: sessionsLoading,
        error: sessionsError
    } = useApi(
        () => validFarmId ? apiService.getPlantingSessions(validFarmId) : null,
        [validFarmId]
    );

    // Handle back button click
    const handleBackClick = () => {
        navigate('/farms');
    };

    // Handle loading state
    if (farmLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Handle error state
    if (farmError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ErrorMessage
                    message={`Failed to load farm details: ${farmError.message}`}
                    onRetry={refetchFarm}
                />
            </div>
        );
    }

    // Handle case where farm is not found
    if (!farm) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Farm Not Found</h2>
                    <p className="text-gray-600 mb-4">The farm you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={handleBackClick}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Back to Farms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        {/* Back Button and Farm Info */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackClick}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-medium">Back to Farms</span>
                            </button>
                            <div className="border-l border-gray-300 pl-4">
                                <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {farm.location}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Farm Size</p>
                                <p className="font-semibold">{farm.sizeHectares} hectares</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Farm Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Farm Info Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4">Farm Information</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Size:</span>
                                <span className="font-medium">{farm.sizeHectares} hectares</span>
                            </div>
                            {farm.elevation && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Elevation:</span>
                                    <span className="font-medium">{farm.elevation}m</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span className="font-medium">
                                    {new Date(farm.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {farm.latitude && farm.longitude && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Coordinates:</span>
                                    <span className="font-medium text-xs">
                                        {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Sprout className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Sessions</p>
                                    <p className="font-semibold">
                                        {farm.activePlantingSessions?.length || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TestTube className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Soil Health</p>
                                    <p className="font-semibold">
                                        {farm.soilData?.soilHealthScore ?
                                            `${farm.soilData.soilHealthScore}/100` :
                                            'Not tested'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-semibold">
                                        {farm.activePlantingSessions?.length > 0 ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Farm Overview */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4">Farm Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium">{farm.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Area</p>
                                <p className="font-medium">{farm.sizeHectares} hectares</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Farm ID</p>
                                <p className="font-medium">#{farm.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
                    <h3 className="text-lg font-semibold mb-4">Farm Location</h3>
                    <MapComponent
                        latitude={farm.latitude}
                        longitude={farm.longitude}
                        farmName={farm.name}
                    />
                </div>

                {/* Detailed Information Tabs */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="border-b">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { key: 'soil', label: 'Soil Data', icon: TestTube },
                                { key: 'sessions', label: 'Planting Sessions', icon: Sprout },
                                { key: 'history', label: 'History', icon: Calendar }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === tab.key
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'soil' && (
                            <SoilDataCard soilData={farm.soilData} />
                        )}
                        {activeTab === 'sessions' && (
                            <ActiveSessionsCard
                                sessions={farm.activePlantingSessions || plantingSessions}
                            />
                        )}
                        {activeTab === 'history' && (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Farm history coming soon</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Historical data and analytics will be available here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmsDetailPage;