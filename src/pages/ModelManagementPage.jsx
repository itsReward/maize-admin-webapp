import React, { useState } from 'react';
import { Brain, Gauge, Activity, Eye, Play, Zap, Upload } from 'lucide-react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const ModelsPage = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const { data: modelVersions, loading: versionsLoading, error: versionsError, refetch: refetchVersions } = useApi(
    () => apiService.getModelVersions()
  );

  const { data: currentModel, loading: currentLoading, error: currentError } = useApi(
    () => apiService.getCurrentModel()
  );

  const { data: featureImportance, loading: featuresLoading, error: featuresError } = useApi(
    () => apiService.getFeatureImportance()
  );

  const handleTrainModel = async () => {
    try {
      setIsTraining(true);
      const trainingConfig = {
        dataPath: 'training_data.csv',
        hyperparameterOptimization: true,
        crossValidationFolds: 5
      };
      
      await apiService.trainModel(trainingConfig);
      alert('Model training initiated successfully!');
      refetchVersions();
    } catch (error) {
      alert(`Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleLoadModel = async (version) => {
    try {
      await apiService.loadModelVersion(version);
      alert(`Model version ${version} loaded successfully!`);
      refetchVersions();
    } catch (error) {
      alert(`Failed to load model: ${error.message}`);
    }
  };

  const columns = [
    { key: 'name', label: 'Model Name' },
    { key: 'type', label: 'Type' },
    { key: 'accuracy', label: 'Accuracy (%)', render: (value) => (
      <div className="flex items-center space-x-2">
        <div className="w-12 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full" 
            style={{ width: `${value || 0}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">{value ? `${value}%` : '--'}</span>
      </div>
    )},
    { key: 'trainingDate', label: 'Training Date', render: (value) => 
      value ? new Date(value).toLocaleDateString() : '--'
    },
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
        value === 'TESTING' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {value || 'Unknown'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (_, model) => (
      <div className="flex space-x-2">
        <button 
          onClick={() => setSelectedModel(model)}
          className="text-green-600 hover:text-green-900"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleLoadModel(model.version)}
          className="text-blue-600 hover:text-blue-900"
          title="Load Model"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ML Model Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleTrainModel}
            disabled={isTraining}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isTraining ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Training...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Train New Model</span>
              </>
            )}
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Import Model
          </button>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Models</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {versionsLoading ? '--' : modelVersions?.versions?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Model</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {currentLoading ? '--' : currentModel?.name || 'No active model'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {currentLoading ? '--' : currentModel?.accuracy ? `${currentModel.accuracy}%` : '--'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Models Table */}
      <DataTable 
        columns={columns} 
        data={modelVersions?.versions || []} 
        loading={versionsLoading}
        error={versionsError}
        onRetry={refetchVersions}
      />

      {/* Model Details Modal */}
      <Modal
        isOpen={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        title="Model Details"
        size="lg"
      >
        {selectedModel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Model Name</label>
                <p className="text-gray-900">{selectedModel.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900">{selectedModel.type || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Accuracy</label>
                <p className="text-gray-900">{selectedModel.accuracy ? `${selectedModel.accuracy}%` : 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900">{selectedModel.status || 'Unknown'}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Feature Importance</label>
              <div className="mt-2 space-y-2">
                {featuresLoading ? (
                  <LoadingSpinner size="sm" />
                ) : featuresError ? (
                  <p className="text-sm text-red-600">Failed to load feature importance</p>
                ) : featureImportance?.feature_importance ? (
                  Object.entries(featureImportance.feature_importance).map(([feature, importance]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${importance * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{(importance * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No feature importance data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModelsPage;
