// src/pages/PredictionsPage.jsx - Enhanced with proper data linking
import React, { useState, useEffect } from 'react';
import {
    Target,
    TrendingUp,
    BarChart3,
    Plus,
    Eye,
    Calendar,
    MapPin,
    Sprout,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Download,
    Filter,
    Search
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

// Enhanced API service methods for predictions
if (!apiService.getLinkedPredictions) {
    apiService.getLinkedPredictions = async function(page = 0, size = 20) {
        try {
            // Get predictions with pagination
            const response = await this.get(`/predictions?page=${page}&size=${size}`);

            let predictions = [];
            if (Array.isArray(response)) {
                predictions = response;
            } else if (response && response.content && Array.isArray(response.content)) {
                predictions = response.content;
            } else if (response && Array.isArray(response.data)) {
                predictions = response.data;
            }

            // For each prediction, fetch linked data
            const enhancedPredictions = await Promise.all(
                predictions.map(async (prediction) => {
                    try {
                        // Get planting session details
                        let plantingSession = null;
                        let farm = null;
                        let farmName = 'Unknown Farm';
                        let cropVariety = 'Unknown Crop';

                        if (prediction.plantingSessionId) {
                            try {
                                plantingSession = await this.get(`/planting-sessions/${prediction.plantingSessionId}`);

                                // Get farm details from planting session
                                if (plantingSession && plantingSession.farmId) {
                                    farm = await this.get(`/farms/${plantingSession.farmId}`);
                                    farmName = farm?.name || 'Unknown Farm';
                                }

                                // Get crop variety from planting session
                                if (plantingSession && plantingSession.maizeVariety) {
                                    cropVariety = plantingSession.maizeVariety.name || 'Unknown Crop';
                                } else if (plantingSession && plantingSession.maizeVarietyName) {
                                    cropVariety = plantingSession.maizeVarietyName;
                                }
                            } catch (linkError) {
                                console.warn(`Could not fetch linked data for prediction ${prediction.id}:`, linkError);
                            }
                        }

                        return {
                            ...prediction,
                            // Enhanced fields from linked data
                            farmName,
                            farmId: farm?.id,
                            farmLocation: farm?.location,
                            farmSize: farm?.sizeHectares,
                            cropVariety,
                            plantingDate: plantingSession?.plantingDate,
                            expectedHarvestDate: plantingSession?.expectedHarvestDate,
                            plantingSessionStatus: plantingSession?.status || 'Unknown',
                            seedRate: plantingSession?.seedRateKgPerHectare,
                            fertilizerType: plantingSession?.fertilizerType,
                            // Original prediction fields
                            predictedYield: prediction.predictedYieldTonsPerHectare,
                            confidence: prediction.confidencePercentage,
                            modelVersion: prediction.modelVersion,
                            featuresUsed: prediction.featuresUsed || [],
                            predictionQuality: prediction.predictionQuality,
                            createdAt: prediction.predictionDate || prediction.createdAt,
                            status: this.getPredictionStatus(prediction)
                        };
                    } catch (error) {
                        console.error(`Error enhancing prediction ${prediction.id}:`, error);
                        return {
                            ...prediction,
                            farmName: 'Unknown Farm',
                            cropVariety: 'Unknown Crop',
                            predictedYield: prediction.predictedYieldTonsPerHectare,
                            confidence: prediction.confidencePercentage,
                            status: 'Unknown'
                        };
                    }
                })
            );

            return enhancedPredictions;
        } catch (error) {
            console.error('❌ getLinkedPredictions error:', error);
            return [];
        }
    };

    apiService.getPredictionStatus = function(prediction) {
        if (!prediction.predictedYieldTonsPerHectare || prediction.predictedYieldTonsPerHectare === 0) {
            return 'PENDING';
        }
        if (prediction.confidencePercentage >= 80) {
            return 'COMPLETED';
        }
        if (prediction.confidencePercentage >= 60) {
            return 'PROCESSING';
        }
        return 'LOW_CONFIDENCE';
    };

    apiService.generatePrediction = async function(plantingSessionId) {
        try {
            const response = await this.post(`/predictions/planting-sessions/${plantingSessionId}`);
            return response;
        } catch (error) {
            console.error('❌ generatePrediction error:', error);
            throw error;
        }
    };

    apiService.getPredictionStats = async function() {
        try {
            // Try to get prediction statistics
            const predictions = await this.getLinkedPredictions(0, 100); // Get more data for stats

            const stats = {
                totalPredictions: predictions.length,
                avgYield: predictions.length > 0
                    ? predictions.reduce((sum, p) => sum + (p.predictedYield || 0), 0) / predictions.length
                    : 0,
                avgConfidence: predictions.length > 0
                    ? predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length
                    : 0,
                completedPredictions: predictions.filter(p => p.status === 'COMPLETED').length
            };

            return stats;
        } catch (error) {
            console.error('❌ getPredictionStats error:', error);
            return {
                totalPredictions: 0,
                avgYield: 0,
                avgConfidence: 0,
                completedPredictions: 0
            };
        }
    };
}

const PredictionsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State management
    const [predictions, setPredictions] = useState([]);
    const [stats, setStats] = useState({
        totalPredictions: 0,
        avgYield: 0,
        avgConfidence: 0,
        completedPredictions: 0
    });
    const [loading, setLoading] = useState({
        predictions: true,
        stats: true,
        creating: false
    });
    const [error, setError] = useState(null);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(0);

    // Fetch data on component mount
    useEffect(() => {
        fetchPredictions();
        fetchStats();
    }, [page]);

    const fetchPredictions = async () => {
        try {
            setLoading(prev => ({ ...prev, predictions: true }));
            setError(null);

            const data = await apiService.getLinkedPredictions(page, 20);
            setPredictions(data);

            console.log('✅ Fetched linked predictions:', data);
        } catch (err) {
            console.error('❌ Error fetching predictions:', err);
            setError('Failed to load predictions. Please try again.');

            // Fallback to mock data
            setPredictions(getMockPredictions());
        } finally {
            setLoading(prev => ({ ...prev, predictions: false }));
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(prev => ({ ...prev, stats: true }));
            const data = await apiService.getPredictionStats();
            setStats(data);
        } catch (err) {
            console.error('❌ Error fetching prediction stats:', err);
            setStats({
                totalPredictions: predictions.length,
                avgYield: 4.2,
                avgConfidence: 87,
                completedPredictions: Math.floor(predictions.length * 0.8)
            });
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    };

    const getMockPredictions = () => [
        {
            id: 1,
            farmName: 'Green Valley Farm',
            farmLocation: 'Harare North',
            farmSize: 15.5,
            cropVariety: 'SC627',
            predictedYield: 4.8,
            confidence: 92,
            status: 'COMPLETED',
            createdAt: '2024-12-20',
            plantingDate: '2024-11-01',
            expectedHarvestDate: '2025-04-15',
            modelVersion: 'v2.1.0',
            featuresUsed: ['soil_ph', 'temperature', 'rainfall', 'fertilizer'],
            predictionQuality: 'HIGH'
        },
        {
            id: 2,
            farmName: 'Sunrise Agriculture',
            farmLocation: 'Mazowe',
            farmSize: 22.3,
            cropVariety: 'ZM621',
            predictedYield: 5.2,
            confidence: 88,
            status: 'COMPLETED',
            createdAt: '2024-12-19',
            plantingDate: '2024-10-25',
            expectedHarvestDate: '2025-04-01',
            modelVersion: 'v2.1.0',
            featuresUsed: ['soil_moisture', 'temperature', 'variety_data'],
            predictionQuality: 'HIGH'
        },
        {
            id: 3,
            farmName: 'Highland Farms',
            farmLocation: 'Nyanga',
            farmSize: 8.7,
            cropVariety: 'SC719',
            predictedYield: 0,
            confidence: 0,
            status: 'PENDING',
            createdAt: '2024-12-21',
            plantingDate: '2024-12-01',
            expectedHarvestDate: '2025-05-15',
            modelVersion: 'v2.1.0',
            featuresUsed: [],
            predictionQuality: 'PENDING'
        }
    ];

    // Filter predictions based on search and status
    const filteredPredictions = predictions.filter(prediction => {
        const matchesSearch = searchTerm === '' ||
            prediction.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prediction.cropVariety?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || prediction.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Handle prediction generation
    const handleGeneratePrediction = async (plantingSessionId) => {
        try {
            setLoading(prev => ({ ...prev, creating: true }));
            await apiService.generatePrediction(plantingSessionId);

            // Refresh predictions after generation
            await fetchPredictions();
            await fetchStats();

            alert('Prediction generated successfully!');
        } catch (error) {
            console.error('Error generating prediction:', error);
            alert('Failed to generate prediction. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, creating: false }));
        }
    };

    const handleViewPrediction = (prediction) => {
        setSelectedPrediction(prediction);
        setIsViewModalOpen(true);
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { color: 'yellow', icon: AlertTriangle, label: 'Pending' },
            COMPLETED: { color: 'green', icon: CheckCircle, label: 'Completed' },
            PROCESSING: { color: 'blue', icon: RefreshCw, label: 'Processing' },
            LOW_CONFIDENCE: { color: 'orange', icon: AlertTriangle, label: 'Low Confidence' }
        };
        return configs[status] || configs.PENDING;
    };

    const getConfidenceLevel = (confidence) => {
        if (confidence >= 90) return { level: 'High', color: 'green' };
        if (confidence >= 70) return { level: 'Medium', color: 'yellow' };
        if (confidence >= 50) return { level: 'Low', color: 'orange' };
        return { level: 'Very Low', color: 'red' };
    };

    // Prepare chart data
    const yieldDistributionData = [
        { range: '0-2 t/ha', count: filteredPredictions.filter(p => p.predictedYield >= 0 && p.predictedYield < 2).length },
        { range: '2-4 t/ha', count: filteredPredictions.filter(p => p.predictedYield >= 2 && p.predictedYield < 4).length },
        { range: '4-6 t/ha', count: filteredPredictions.filter(p => p.predictedYield >= 4 && p.predictedYield < 6).length },
        { range: '6+ t/ha', count: filteredPredictions.filter(p => p.predictedYield >= 6).length }
    ];

    const confidenceDistributionData = [
        { range: '0-50%', count: filteredPredictions.filter(p => p.confidence >= 0 && p.confidence < 50).length },
        { range: '50-70%', count: filteredPredictions.filter(p => p.confidence >= 50 && p.confidence < 70).length },
        { range: '70-90%', count: filteredPredictions.filter(p => p.confidence >= 70 && p.confidence < 90).length },
        { range: '90-100%', count: filteredPredictions.filter(p => p.confidence >= 90).length }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Yield Predictions</h1>
                    <p className="text-gray-600">AI-powered maize yield predictions and analytics</p>
                </div>
                <button
                    onClick={() => navigate('/planting-sessions')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    disabled={loading.creating}
                >
                    {loading.creating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    <span>{loading.creating ? 'Generating...' : 'New Prediction'}</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Predictions"
                    value={stats.totalPredictions}
                    icon={Target}
                    color="bg-blue-500"
                    loading={loading.stats}
                />
                <StatCard
                    title="Avg Yield"
                    value={`${stats.avgYield.toFixed(1)} t/ha`}
                    icon={TrendingUp}
                    color="bg-green-500"
                    loading={loading.stats}
                />
                <StatCard
                    title="Avg Confidence"
                    value={`${Math.round(stats.avgConfidence)}%`}
                    icon={BarChart3}
                    color="bg-purple-500"
                    loading={loading.stats}
                />
                <StatCard
                    title="Completed"
                    value={stats.completedPredictions}
                    icon={CheckCircle}
                    color="bg-teal-500"
                    loading={loading.stats}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Yield Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Yield Distribution</h3>
                    </div>
                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yieldDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10B981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Confidence Levels */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Confidence Levels</h3>
                    </div>
                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={confidenceDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8B5CF6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search farms or crop varieties..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="LOW_CONFIDENCE">Low Confidence</option>
                        </select>
                        <button
                            onClick={fetchPredictions}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                            disabled={loading.predictions}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading.predictions ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Data Table</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => console.log('Export data')}
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                        <div className="flex">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                            <p className="text-yellow-800 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prediction ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Crop
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Predicted Yield
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Confidence
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading.predictions ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i}>
                                    {Array(8).fill(0).map((_, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filteredPredictions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center">
                                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Found</h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchTerm || statusFilter !== 'ALL'
                                            ? 'No predictions match your current filters.'
                                            : 'Start by creating planting sessions to generate yield predictions.'
                                        }
                                    </p>
                                    <button
                                        onClick={() => navigate('/planting-sessions')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Create Planting Session
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            filteredPredictions.map((prediction) => (
                                <PredictionRow
                                    key={prediction.id}
                                    prediction={prediction}
                                    onView={handleViewPrediction}
                                />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Prediction Details Modal */}
            {isViewModalOpen && selectedPrediction && (
                <PredictionModal
                    prediction={selectedPrediction}
                    onClose={() => setIsViewModalOpen(false)}
                />
            )}
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
                ) : (
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const PredictionRow = ({ prediction, onView }) => {
    const statusConfig = getStatusConfig(prediction.status);
    const confidenceLevel = getConfidenceLevel(prediction.confidence);
    const StatusIcon = statusConfig.icon;

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{prediction.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">{prediction.farmName}</div>
                        {prediction.farmLocation && (
                            <div className="text-sm text-gray-500">{prediction.farmLocation}</div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <Sprout className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm text-gray-900">{prediction.cropVariety}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {prediction.predictedYield > 0 ? `${prediction.predictedYield.toFixed(1)} t/ha` : 'Calculating...'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${confidenceLevel.color}-100 text-${confidenceLevel.color}-800`}>
          {prediction.confidence > 0 ? `${Math.round(prediction.confidence)}% (${confidenceLevel.level})` : 'Pending'}
        </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {new Date(prediction.createdAt).toLocaleDateString()}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
          <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
        </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={() => onView(prediction)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => console.log('Analyze prediction:', prediction.id)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Analyze"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const PredictionModal = ({ prediction, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Prediction Details</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Prediction ID</label>
                        <p className="text-gray-900">#{prediction.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Farm</label>
                        <p className="text-gray-900">{prediction.farmName}</p>
                    </div>
                </div>

                {/* Prediction Results */}
                <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3">Prediction Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Predicted Yield</label>
                            <p className="text-2xl font-bold text-green-900">
                                {prediction.predictedYield > 0 ? `${prediction.predictedYield.toFixed(2)} t/ha` : 'Calculating...'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Confidence Level</label>
                            <p className="text-2xl font-bold text-green-900">
                                {prediction.confidence > 0 ? `${Math.round(prediction.confidence)}%` : 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Farm Information */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Farm Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                            <p className="text-gray-900">{prediction.farmLocation || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Farm Size</label>
                            <p className="text-gray-900">
                                {prediction.farmSize ? `${prediction.farmSize} hectares` : 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Crop Variety</label>
                            <p className="text-gray-900">{prediction.cropVariety}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Planting Date</label>
                            <p className="text-gray-900">
                                {prediction.plantingDate ? new Date(prediction.plantingDate).toLocaleDateString() : 'Not specified'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Model Information */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Model Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Model Version</label>
                            <p className="text-gray-900">{prediction.modelVersion || 'Unknown'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Prediction Quality</label>
                            <p className="text-gray-900">{prediction.predictionQuality || 'Not assessed'}</p>
                        </div>
                    </div>
                </div>

                {/* Features Used */}
                {prediction.featuresUsed && prediction.featuresUsed.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Features Used in Prediction</h4>
                        <div className="flex flex-wrap gap-2">
                            {prediction.featuresUsed.map((feature, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Agricultural Practices */}
                {(prediction.seedRate || prediction.fertilizerType) && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Agricultural Practices</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {prediction.seedRate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Seed Rate</label>
                                    <p className="text-gray-900">{prediction.seedRate} kg/ha</p>
                                </div>
                            )}
                            {prediction.fertilizerType && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Fertilizer Type</label>
                                    <p className="text-gray-900">{prediction.fertilizerType}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Prediction Created</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(prediction.createdAt).toLocaleDateString()} at {new Date(prediction.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        {prediction.plantingDate && (
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Planting Date</p>
                                    <p className="text-sm text-gray-600">{new Date(prediction.plantingDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}
                        {prediction.expectedHarvestDate && (
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Expected Harvest</p>
                                    <p className="text-sm text-gray-600">{new Date(prediction.expectedHarvestDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Helper function for status configuration
const getStatusConfig = (status) => {
    const configs = {
        PENDING: { color: 'yellow', icon: AlertTriangle, label: 'Pending' },
        COMPLETED: { color: 'green', icon: CheckCircle, label: 'Completed' },
        PROCESSING: { color: 'blue', icon: RefreshCw, label: 'Processing' },
        LOW_CONFIDENCE: { color: 'orange', icon: AlertTriangle, label: 'Low Confidence' }
    };
    return configs[status] || configs.PENDING;
};

// Helper function for confidence level
const getConfidenceLevel = (confidence) => {
    if (confidence >= 90) return { level: 'High', color: 'green' };
    if (confidence >= 70) return { level: 'Medium', color: 'yellow' };
    if (confidence >= 50) return { level: 'Low', color: 'orange' };
    return { level: 'Very Low', color: 'red' };
};

export default PredictionsPage;