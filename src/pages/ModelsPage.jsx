// src/pages/ModelsPage.jsx
import React, { useState } from 'react';
import { Brain, Play, Pause, Upload, Download, BarChart3, Settings, Eye, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ModelsPage = () => {
    const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingConfig, setTrainingConfig] = useState({
        modelName: '',
        algorithm: 'random_forest',
        epochs: 100,
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2
    });

    // API calls
    const { data: models, loading, error, refetch } = useApi(
        () => apiService.getModelVersions(),
        []
    );

    const { data: currentModel, loading: currentLoading, error: currentError } = useApi(
        () => apiService.getCurrentModel?.() || Promise.resolve(null),
        []
    );

    const { data: modelMetrics, loading: metricsLoading, error: metricsError } = useApi(
        () => apiService.getModelMetrics?.() || Promise.resolve(null),
        []
    );

    const handleTrainingConfigChange = (e) => {
        const { name, value, type } = e.target;
        setTrainingConfig(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleTrainModel = async (e) => {
        e.preventDefault();
        setIsTraining(true);
        try {
            await apiService.trainModel(trainingConfig);
            setIsTrainModalOpen(false);
            setTrainingConfig({
                modelName: '',
                algorithm: 'random_forest',
                epochs: 100,
                learningRate: 0.001,
                batchSize: 32,
                validationSplit: 0.2
            });
            refetch();
            alert('Model training started successfully!');
        } catch (error) {
            alert(`Failed to start training: ${error.message}`);
        } finally {
            setIsTraining(false);
        }
    };

    const handleViewModel = (model) => {
        setSelectedModel(model);
        setIsViewModalOpen(true);
    };

    const handleDeleteModel = async (modelId) => {
        if (window.confirm('Are you sure you want to delete this model?')) {
            try {
                await apiService.deleteModel?.(modelId);
                refetch();
                alert('Model deleted successfully!');
            } catch (error) {
                alert(`Failed to delete model: ${error.message}`);
            }
        }
    };

    const handleDeployModel = async (modelId) => {
        try {
            await apiService.deployModel?.(modelId);
            refetch();
            alert('Model deployed successfully!');
        } catch (error) {
            alert(`Failed to deploy model: ${error.message}`);
        }
    };

    const handleUploadModel = () => {
        // Create file input for model upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pkl,.joblib,.h5,.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('model', file);
                    await apiService.uploadModel?.(formData);
                    refetch();
                    alert('Model uploaded successfully!');
                } catch (error) {
                    alert(`Failed to upload model: ${error.message}`);
                }
            }
        };
        input.click();
    };

    const handleDownloadModel = async (modelId) => {
        try {
            const blob = await apiService.downloadModel?.(modelId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `model-${modelId}.pkl`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Failed to download model: ${error.message}`);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            TRAINING: { color: 'blue', icon: Clock, label: 'Training' },
            COMPLETED: { color: 'green', icon: CheckCircle, label: 'Completed' },
            DEPLOYED: { color: 'emerald', icon: CheckCircle, label: 'Deployed' },
            FAILED: { color: 'red', icon: AlertCircle, label: 'Failed' },
            PENDING: { color: 'yellow', icon: Clock, label: 'Pending' }
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
                {config.label}
      </span>
        );
    };

    const columns = [
        { key: 'id', label: 'Model ID', render: (value) => `#${value}` },
        { key: 'name', label: 'Model Name' },
        { key: 'algorithm', label: 'Algorithm', render: (value) =>
                value?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'
        },
        { key: 'accuracy', label: 'Accuracy', render: (value) => (
                <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${
                                value >= 90 ? 'bg-green-600' :
                                    value >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${value || 0}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-medium">{value ? `${value}%` : '--'}</span>
                </div>
            )},
        { key: 'status', label: 'Status', render: (value) => getStatusBadge(value) },
        { key: 'createdAt', label: 'Created', render: (value) =>
                value ? new Date(value).toLocaleDateString() : 'N/A'
        },
        { key: 'actions', label: 'Actions', render: (_, model) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleViewModel(model)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {model.status === 'COMPLETED' && (
                        <button
                            onClick={() => handleDeployModel(model.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Deploy Model"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => handleDownloadModel(model.id)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Download Model"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Model"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
    ];

    // Calculate statistics from real data
    const totalModels = models?.length || 0;
    const deployedModels = models?.filter(m => m.status === 'DEPLOYED').length || 0;
    const avgAccuracy = models && models.length > 0
        ? models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length
        : 0;
    const trainingModels = models?.filter(m => m.status === 'TRAINING').length || 0;

    // Performance comparison data from real models
    const performanceData = models?.map(model => ({
        name: model.name?.substring(0, 15) + '...' || `Model ${model.id}`,
        accuracy: model.accuracy || 0,
        precision: model.metrics?.precision || model.precision || 0,
        recall: model.metrics?.recall || model.recall || 0
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">ML Model Management</h2>
                    <p className="text-gray-600">Train, deploy, and monitor machine learning models</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleUploadModel}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload Model</span>
                    </button>
                    <button
                        onClick={() => setIsTrainModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <Brain className="w-4 h-4" />
                        <span>Train New Model</span>
                    </button>
                </div>
            </div>

            {/* Current Model Status */}
            {currentLoading ? (
                <div className="bg-gray-100 p-6 rounded-xl animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-48"></div>
                            <div className="h-3 bg-gray-300 rounded w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-40"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    </div>
                </div>
            ) : currentError ? (
                <ErrorMessage message="Failed to load current model status" />
            ) : currentModel ? (
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Currently Deployed Model</h3>
                            <p className="text-green-100">{currentModel.name}</p>
                            <p className="text-green-100 text-sm">
                                Accuracy: {currentModel.accuracy}% | Status: {currentModel.status}
                            </p>
                        </div>
                        <div className="bg-green-800 p-3 rounded-lg">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-900">No Model Deployed</h3>
                            <p className="text-yellow-700">Train and deploy a model to start making predictions.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Models</p>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">{totalModels}</p>
                            )}
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Deployed</p>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">{deployedModels}</p>
                            )}
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">{avgAccuracy.toFixed(1)}%</p>
                            )}
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Training</p>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">{trainingModels}</p>
                            )}
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Comparison Chart */}
            {performanceData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="accuracy" fill="#16a34a" name="Accuracy" />
                            <Bar dataKey="precision" fill="#3b82f6" name="Precision" />
                            <Bar dataKey="recall" fill="#8b5cf6" name="Recall" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Models Table */}
            <DataTable
                columns={columns}
                data={models || []}
                loading={loading}
                error={error}
                onRetry={refetch}
                emptyMessage="No models found. Train your first model to get started."
            />

            {/* Train Model Modal */}
            <Modal
                isOpen={isTrainModalOpen}
                onClose={() => setIsTrainModalOpen(false)}
                title="Train New Model"
                size="lg"
            >
                <form onSubmit={handleTrainModel} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model Name *
                        </label>
                        <input
                            type="text"
                            name="modelName"
                            value={trainingConfig.modelName}
                            onChange={handleTrainingConfigChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter model name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Algorithm *
                        </label>
                        <select
                            name="algorithm"
                            value={trainingConfig.algorithm}
                            onChange={handleTrainingConfigChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="random_forest">Random Forest</option>
                            <option value="neural_network">Neural Network</option>
                            <option value="gradient_boosting">Gradient Boosting</option>
                            <option value="linear_regression">Linear Regression</option>
                            <option value="svm">Support Vector Machine</option>
                            <option value="decision_tree">Decision Tree</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Epochs
                            </label>
                            <input
                                type="number"
                                name="epochs"
                                value={trainingConfig.epochs}
                                onChange={handleTrainingConfigChange}
                                min="1"
                                max="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Learning Rate
                            </label>
                            <input
                                type="number"
                                name="learningRate"
                                value={trainingConfig.learningRate}
                                onChange={handleTrainingConfigChange}
                                step="0.0001"
                                min="0.0001"
                                max="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Batch Size
                            </label>
                            <input
                                type="number"
                                name="batchSize"
                                value={trainingConfig.batchSize}
                                onChange={handleTrainingConfigChange}
                                min="1"
                                max="512"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Validation Split
                            </label>
                            <input
                                type="number"
                                name="validationSplit"
                                value={trainingConfig.validationSplit}
                                onChange={handleTrainingConfigChange}
                                step="0.1"
                                min="0.1"
                                max="0.5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Training Information</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Training will use the latest available dataset</li>
                            <li>• You will be notified when training completes</li>
                            <li>• Training time varies based on algorithm and data size</li>
                            <li>• Models are automatically validated during training</li>
                        </ul>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsTrainModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isTraining}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isTraining}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTraining ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Starting Training...
                                </div>
                            ) : (
                                'Start Training'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Model Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Model Details"
                size="lg"
            >
                {selectedModel && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Model ID
                                </label>
                                <p className="text-gray-900 font-medium">#{selectedModel.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Name
                                </label>
                                <p className="text-gray-900">{selectedModel.name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Algorithm
                                </label>
                                <p className="text-gray-900 capitalize">
                                    {selectedModel.algorithm?.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Status
                                </label>
                                {getStatusBadge(selectedModel.status)}
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Accuracy</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedModel.accuracy || '--'}%</p>
                                </div>
                                {selectedModel.metrics && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600">Precision</p>
                                            <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.precision || '--'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Recall</p>
                                            <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.recall || '--'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">F1 Score</p>
                                            <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.f1Score || '--'}%</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Training Configuration */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Training Configuration</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedModel.trainingData && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Training Data Size
                                        </label>
                                        <p className="text-gray-900">{selectedModel.trainingData.toLocaleString()} samples</p>
                                    </div>
                                )}
                                {selectedModel.epochs && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Epochs
                                        </label>
                                        <p className="text-gray-900">{selectedModel.epochs}</p>
                                    </div>
                                )}
                                {selectedModel.learningRate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Learning Rate
                                        </label>
                                        <p className="text-gray-900">{selectedModel.learningRate}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Created Date
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedModel.createdAt ? new Date(selectedModel.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        {selectedModel.features && selectedModel.features.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Input Features</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedModel.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                        >
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Model Info */}
                        {selectedModel.description && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                                <p className="text-gray-700">{selectedModel.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ModelsPage;