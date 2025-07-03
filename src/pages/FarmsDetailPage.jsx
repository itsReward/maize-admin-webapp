import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Droplets, Wind, Eye, Sun, ArrowLeft, Activity, TestTube, Sprout, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

// Mock API service - you can replace this with your actual apiService
const apiService = {
    async getFarmById(farmId) {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    id: farmId,
                    name: "Green Valley Farm",
                    location: "Harare, Zimbabwe",
                    sizeHectares: 12.5,
                    latitude: -17.8252,
                    longitude: 31.0335,
                    elevation: 1483,
                    createdAt: "2024-03-15T10:30:00Z",
                    ownerName: "John Mukamuri",
                    contactNumber: "+263 77 123 4567",
                    soilData: {
                        id: 1,
                        farmId: farmId,
                        soilType: "Clay Loam",
                        phLevel: 6.5,
                        organicMatterPercentage: 3.2,
                        nitrogenContent: 45,
                        phosphorusContent: 28,
                        potassiumContent: 180,
                        moistureContent: 65,
                        sampleDate: "2024-06-15T08:00:00Z",
                        soilHealthScore: 85,
                        fertilizerRecommendation: "Apply 150kg/ha NPK fertilizer before planting season"
                    },
                    activePlantingSessions: [
                        {
                            id: 1,
                            variety: "ZM 523",
                            plantingDate: "2024-10-15",
                            growthStage: "Tasseling & Silking",
                            daysFromPlanting: 85,
                            expectedHarvestDate: "2025-02-15"
                        }
                    ]
                });
            }, 500);
        });
    },

    async getWeatherData(location) {
        // Simulate weather API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    location: location,
                    temperature: 28,
                    humidity: 62,
                    rainfall: 0,
                    windSpeed: 8,
                    pressure: 1015,
                    visibility: 12,
                    uvIndex: 7,
                    conditions: 'Partly Cloudy',
                    forecast: 'Scattered clouds with possible afternoon showers',
                    timestamp: new Date().toISOString()
                });
            }, 300);
        });
    }
};

const FarmDetailPage = ({ farmId = 1, onBack = () => console.log('Back clicked') }) => {
    const [farm, setFarm] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const loadFarmData = async () => {
            try {
                setLoading(true);
                const [farmData, weatherData] = await Promise.all([
                    apiService.getFarmById(farmId),
                    apiService.getWeatherData("Harare, Zimbabwe")
                ]);
                setFarm(farmData);
                setWeather(weatherData);
            } catch (error) {
                console.error('Failed to load farm data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (farmId) {
            loadFarmData();
        }
    }, [farmId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading farm details...</p>
                </div>
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600">Farm not found</p>
                    <button
                        onClick={onBack}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Back to Farms
                    </button>
                </div>
            </div>
        );
    }

    const MapComponent = () => (
        <div className="w-full h-64 bg-green-100 rounded-lg relative overflow-hidden">
            {/* Simple map placeholder with farm location */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-300">
                <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M20,40 Q40,20 60,40 T80,60 L80,80 L20,80 Z" fill="currentColor" />
                    </svg>
                </div>

                {/* Farm marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                            {farm.name}
                        </div>
                    </div>
                </div>

                {/* Coordinates display */}
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
                    {farm.latitude?.toFixed(4)}°N, {farm.longitude?.toFixed(4)}°E
                </div>
            </div>
        </div>
    );

    const WeatherCard = () => (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Weather</h3>
                <Sun className="h-6 w-6" />
            </div>

            {weather ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold">{weather.temperature}°C</p>
                            <p className="text-blue-100">{weather.conditions}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Feels like</p>
                            <p className="text-xl">{weather.temperature + 2}°C</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4" />
                            <div>
                                <p className="text-xs text-blue-100">Humidity</p>
                                <p className="font-semibold">{weather.humidity}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4" />
                            <div>
                                <p className="text-xs text-blue-100">Wind</p>
                                <p className="font-semibold">{weather.windSpeed} km/h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <div>
                                <p className="text-xs text-blue-100">Visibility</p>
                                <p className="font-semibold">{weather.visibility} km</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4" />
                            <div>
                                <p className="text-xs text-blue-100">UV Index</p>
                                <p className="font-semibold">{weather.uvIndex}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                        <p className="text-sm">{weather.forecast}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-blue-400 rounded w-20 mx-auto mb-2"></div>
                        <div className="h-4 bg-blue-400 rounded w-24 mx-auto"></div>
                    </div>
                </div>
            )}
        </div>
    );

    const SoilDataCard = () => (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
                <TestTube className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold">Soil Analysis</h3>
            </div>

            {farm.soilData ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Soil Type</p>
                            <p className="font-semibold text-gray-900">{farm.soilData.soilType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">pH Level</p>
                            <p className="font-semibold text-gray-900">{farm.soilData.phLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Organic Matter</p>
                            <p className="font-semibold text-gray-900">{farm.soilData.organicMatterPercentage}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Moisture</p>
                            <p className="font-semibold text-gray-900">{farm.soilData.moistureContent}%</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Soil Health Score</p>
                            <p className="font-semibold text-green-600">{farm.soilData.soilHealthScore}/100</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${farm.soilData.soilHealthScore}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Nutrient Content</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-gray-500">Nitrogen (N)</p>
                                <p className="font-semibold text-blue-600">{farm.soilData.nitrogenContent}mg/kg</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-gray-500">Phosphorus (P)</p>
                                <p className="font-semibold text-purple-600">{farm.soilData.phosphorusContent}mg/kg</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-500">Potassium (K)</p>
                                <p className="font-semibold text-orange-600">{farm.soilData.potassiumContent}mg/kg</p>
                            </div>
                        </div>
                    </div>

                    {farm.soilData.fertilizerRecommendation && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Recommendation</h4>
                            <p className="text-sm text-green-700">{farm.soilData.fertilizerRecommendation}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No soil data available</p>
                    <button className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium">
                        Schedule Soil Test
                    </button>
                </div>
            )}
        </div>
    );

    const ActiveSessionsCard = () => (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
                <Sprout className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Active Planting Sessions</h3>
            </div>

            {farm.activePlantingSessions && farm.activePlantingSessions.length > 0 ? (
                <div className="space-y-4">
                    {farm.activePlantingSessions.map((session, index) => (
                        <div key={session.id || index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{session.variety}</h4>
                                    <p className="text-sm text-gray-500">Planted on {new Date(session.plantingDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Days from planting</p>
                                    <p className="font-semibold text-green-600">{session.daysFromPlanting}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Growth Stage</p>
                                    <p className="font-medium text-gray-900">{session.growthStage}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expected Harvest</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(session.expectedHarvestDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round((session.daysFromPlanting / 120) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${Math.min((session.daysFromPlanting / 120) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Sprout className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No active planting sessions</p>
                    <button className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium">
                        Start New Session
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{farm.name}</h1>
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
                                <span className="text-gray-500">Owner:</span>
                                <span className="font-medium">{farm.ownerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Contact:</span>
                                <span className="font-medium">{farm.contactNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Elevation:</span>
                                <span className="font-medium">{farm.elevation}m</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span className="font-medium">
                  {new Date(farm.createdAt).toLocaleDateString()}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Weather Card */}
                    <WeatherCard />

                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Sessions</p>
                                    <p className="font-semibold">{farm.activePlantingSessions?.length || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TestTube className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Soil Health</p>
                                    <p className="font-semibold">{farm.soilData?.soilHealthScore || 'N/A'}/100</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Productivity</p>
                                    <p className="font-semibold">Good</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
                    <h3 className="text-lg font-semibold mb-4">Farm Location</h3>
                    <MapComponent />
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
                        {activeTab === 'soil' && <SoilDataCard />}
                        {activeTab === 'sessions' && <ActiveSessionsCard />}
                        {activeTab === 'history' && (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Farm history coming soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmDetailPage;