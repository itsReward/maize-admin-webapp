// src/pages/PredictionsPage.jsx
import React, { useState } from 'react';
import { Plus, Target, TrendingUp, Calendar, MapPin, Eye, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PredictionsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        farmId: '',
        cropVariety: '',
        plantingDate: '',
        soilMoisture: '',
        fertilizer: '',
        irrigationPlanned: false
    });

    const { data: predictions, loading, error, refetch } = useApi(
        () => apiService.getPredictions(),
        []
    );

    const { data: farms } = useApi(
        () => apiService.getFarms(),
        []
    );

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreatePrediction = async (e) => {
        e.preventDefault();
        try {
            await apiService.createPrediction(formData);
            setIsCreateModalOpen(false);
            setFormData({
                farmId: '',
                cropVariety: '',
                plantingDate: '',
                soilMoisture: '',
                fertilizer: '',
                irrigationPlanned: false
            });
            refetch();
        } catch (error) {
            alert(`Failed to create prediction: ${error.message}`);
        }
    };

    const handleViewPrediction = (prediction) => {
        setSelectedPrediction(prediction);
        setIsViewModalOpen(true);
    };

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 90) return 'text-green-600';
        if (accuracy >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceLevel = (confidence) => {
        if (confidence >= 90) return { level: 'High', color: 'green' };
        if (confidence >= 70) return { level: 'Medium', color: 'yellow' };
        return { level: 'Low', color: 'red' };
    };

    const columns = [
        { key: 'id', label: 'Prediction ID', render: (value) => `#${value}` },
        { key: 'farmName', label: 'Farm', render: (value) => (
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {value || 'Unknown Farm'}
                </div>
            )},
        { key: 'cropVariety', label: 'Crop' },
        { key: 'predictedYield', label: 'Predicted Yield', render: (value) =>
                value ? `${value} t/ha` : 'Calculating...'
        },
        { key: 'confidence', label: 'Confidence', render: (value) => {
                const conf = getConfidenceLevel(value);
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${conf.color}-100 text-${conf.color}-800`}>
          {value}% ({conf.level})
        </span>
                );
            }},
        { key: 'createdAt', label: 'Created', render: (value) => (
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {value ? new Date(value).toLocaleDateString() : 'N/A'}
                </div>
            )},
        { key: 'status', label: 'Status', render: (value) => {
                const statusConfig = {
                    PENDING: { color: 'yellow', icon: AlertTriangle, label: 'Pending' },
                    COMPLETED: { color: 'green', icon: CheckCircle, label: 'Completed' },
                    PROCESSING: { color: 'blue', icon: BarChart3, label: 'Processing' }
                };
                const config = statusConfig[value] || statusConfig.PENDING;
                const Icon = config.icon;

                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
          <Icon className="w-3 h-3 mr-1" />
                        {config.label}
        </span>
                );
            }},
        { key: 'actions', label: 'Actions', render: (_, prediction) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleViewPrediction(prediction)}
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
            )}
    ];

    // Mock data if API fails
    const mockPredictions = [
        {
            id: 1,
            farmName: 'Green Valley Farm',
            cropVariety: 'SC627',
            predictedYield: 4.8,
            confidence: 92,
            status: 'COMPLETED',
            createdAt: '2024-06-10',
            plantingDate: '2024-11-01',
            soilMoisture: 'Optimal',
            weatherConditions: 'Favorable',
            factors: {
                soilQuality: 85,
                weatherPattern: 90,
                cropHealth: 88,
                irrigation: 95
            }
        },
        {
            id: 2,
            farmName: 'Sunrise Agriculture',
            cropVariety: 'ZM621',
            predictedYield: 3.6,
            confidence: 78,
            status: 'PROCESSING',
            createdAt: '2024-06-15',
            plantingDate: '2024-10-15',
            soilMoisture: 'Good',
            weatherConditions: 'Average',
            factors: {
                soilQuality: 75,
                weatherPattern: 70,
                cropHealth: 80,
                irrigation: 85
            }
        },
        {
            id: 3,
            farmName: 'Highland Farms',
            cropVariety: 'SC719',
            predictedYield: 5.2,
            confidence: 95,
            status: 'COMPLETED',
            createdAt: '2024-06-05',
            plantingDate: '2024-12-01',
            soilMoisture: 'Excellent',
            weatherConditions: 'Optimal',
            factors: {
                soilQuality: 95,
                weatherPattern: 92,
                cropHealth: 90,
                irrigation: 98
            }
        }
    ];

    const mockFarms = [
        { id: 1, name: 'Green Valley Farm' },
        { id: 2, name: 'Sunrise Agriculture' },
        { id: 3, name: 'Highland Farms' }
    ];

    const predictionData = error ? mockPredictions : (predictions || []);
    const farmData = farms || mockFarms;

    // Calculate statistics
    const totalPredictions = predictionData.length;
    const avgYield = predictionData.reduce((sum, p) => sum + (p.predictedYield || 0), 0) / totalPredictions;
    const avgConfidence = predictionData.reduce((sum, p) => sum + (p.confidence || 0), 0) / totalPredictions;
    const completedPredictions = predictionData.filter(p => p.status === 'COMPLETED').length;

    // Chart data for yield distribution
    const yieldDistribution = [
        { range: '0-2 t/ha', count: predictionData.filter(p => p.predictedYield <= 2).length },
        { range: '2-4 t/ha', count: predictionData.filter(p => p.predictedYield > 2 && p.predictedYield <= 4).length },
        { range: '4-6 t/ha', count: predictionData.filter(p => p.predictedYield > 4 && p.predictedYield <= 6).length },
        { range: '6+ t/ha', count: predictionData.filter(p => p.predictedYield > 6).length }
    ];

    // Pie chart data for confidence levels
    const confidenceDistribution = [
        { name: 'High (90%+)', value: predictionData.filter(p => p.confidence >= 90).length, color: '#10b981' },
        { name: 'Medium (70-89%)', value: predictionData.filter(p => p.confidence >= 70 && p.confidence < 90).length, color: '#f59e0b' },
        { name: 'Low (<70%)', value: predictionData.filter(p => p.confidence < 70).length, color: '#ef4444' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Yield Predictions</h2>
                    <p className="text-gray-600">AI-powered maize yield predictions and analytics</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Prediction</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Predictions</p>
                            <p className="text-3xl font-bold text-gray-900">{totalPredictions}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Yield</p>
                            <p className="text-3xl font-bold text-gray-900">{avgYield.toFixed(1)} t/ha</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                            <p className="text-3xl font-bold text-gray-900">{avgConfidence.toFixed(0)}%</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-3xl font-bold text-gray-900">{completedPredictions}</p>
                        </div>
                        <div className="bg-emerald-100 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Yield Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={yieldDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#16a34a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Confidence Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Levels</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={confidenceDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {confidenceDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Predictions Table */}
            <DataTable
                columns={columns}
                data={predictionData}
                loading={loading}
                error={error}
                onRetry={refetch}
                emptyMessage="No predictions found. Create your first yield prediction."
            />

            {/* Create Prediction Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="New Yield Prediction"
                size="lg"
            >
                <form onSubmit={handleCreatePrediction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Farm *
                            </label>
                            <select
                                name="farmId"
                                value={formData.farmId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select a farm</option>
                                {farmData.map(farm => (
                                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Crop Variety *
                            </label>
                            <select
                                name="cropVariety"
                                value={formData.cropVariety}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select variety</option>
                                <option value="SC627">SC627 (Short season)</option>
                                <option value="ZM621">ZM621 (Medium season)</option>
                                <option value="SC719">SC719 (Long season)</option>
                                <option value="ZM623">ZM623 (Drought tolerant)</option>
                                <option value="SC513">SC513 (High yield)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Planting Date *
                            </label>
                            <input
                                type="date"
                                name="plantingDate"
                                value={formData.plantingDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Soil Moisture *
                            </label>
                            <select
                                name="soilMoisture"
                                value={formData.soilMoisture}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select moisture level</option>
                                <option value="poor">Poor (0-20%)</option>
                                <option value="fair">Fair (20-40%)</option>
                                <option value="good">Good (40-60%)</option>
                                <option value="optimal">Optimal (60-80%)</option>
                                <option value="excellent">Excellent (80%+)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fertilizer Type
                            </label>
                            <select
                                name="fertilizer"
                                value={formData.fertilizer}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select fertilizer</option>
                                <option value="none">None</option>
                                <option value="organic">Organic</option>
                                <option value="npk">NPK (Compound)</option>
                                <option value="urea">Urea</option>
                                <option value="compound-d">Compound D</option>
                            </select>
                        </div>

                        <div className="flex items-center mt-8">
                            <input
                                type="checkbox"
                                name="irrigationPlanned"
                                checked={formData.irrigationPlanned}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Irrigation planned
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Generate Prediction
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Prediction Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Prediction Details"
                size="lg"
            >
                {selectedPrediction && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Prediction ID
                                </label>
                                <p className="text-gray-900 font-medium">#{selectedPrediction.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Farm
                                </label>
                                <p className="text-gray-900">{selectedPrediction.farmName}</p>
                            </div>
                        </div>

                        {/* Prediction Results */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Prediction Results</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-green-700">Predicted Yield</p>
                                    <p className="text-2xl font-bold text-green-900">{selectedPrediction.predictedYield} t/ha</p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700">Confidence Level</p>
                                    <p className="text-2xl font-bold text-green-900">{selectedPrediction.confidence}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Contributing Factors */}
                        {selectedPrediction.factors && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Contributing Factors</h4>
                                <div className="space-y-3">
                                    {Object.entries(selectedPrediction.factors).map(([factor, score]) => (
                                        <div key={factor} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{score}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Soil Moisture
                                </label>
                                <p className="text-gray-900">{selectedPrediction.soilMoisture}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Weather Conditions
                                </label>
                                <p className="text-gray-900">{selectedPrediction.weatherConditions}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Error Notice */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                        Unable to load predictions from server. Showing sample data instead.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PredictionsPage;