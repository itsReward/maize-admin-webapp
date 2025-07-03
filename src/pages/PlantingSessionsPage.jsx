// src/pages/PlantingSessionsPage.jsx
import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Sprout, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

const PlantingSessionsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    farmId: '',
    maizeVariety: '',
    plantingDate: '',
    expectedHarvestDate: '',
    areaPlanted: '',
    seedQuantity: '',
    notes: ''
  });

  const getFarmNameById = (farmId) => {
    const farm = farmData.find(farm => farm.id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };


  const { data: sessions, loading, error, refetch } = useApi(
      () => apiService.getPlantingSessions(),
      []
  );

  const { data: farms } = useApi(
      () => apiService.getFarms(),
      []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await apiService.createPlantingSession(formData.farmId, {
        ...formData,
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString()
      });
      setIsCreateModalOpen(false);
      setFormData({
        farmId: '',
        maizeVariety: '',
        plantingDate: '',
        expectedHarvestDate: '',
        areaPlanted: '',
        seedQuantity: '',
        notes: ''
      });
      refetch();
    } catch (error) {
      alert(`Failed to create planting session: ${error.message}`);
    }
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setIsViewModalOpen(true);
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this planting session?')) {
      try {
        await apiService.deletePlantingSession(sessionId);
        refetch();
      } catch (error) {
        alert(`Failed to delete planting session: ${error.message}`);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANTED: { color: 'blue', icon: Clock, label: 'Planted' },
      GROWING: { color: 'green', icon: Sprout, label: 'Growing' },
      HARVESTED: { color: 'emerald', icon: CheckCircle, label: 'Harvested' },
      FAILED: { color: 'red', icon: AlertCircle, label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.PLANTED;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
          {config.label}
      </span>
    );
  };

  const columns = [
    { key: 'id', label: 'Session ID', render: (value) => `#${value}` },
    { key: 'farmId', label: 'Farm', render: (value) => (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            {getFarmNameById(value) || 'Unknown Farm'}
          </div>
      )},
    { key: 'maizeVariety', label: 'Crop Variety' , render: (value) =>
          value ? `${value.name}` : 'N/A'},
    { key: 'plantingDate', label: 'Planting Date', render: (value) => (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </div>
      )},
    { key: 'areaPlanted', label: 'Area (ha)', render: (value) =>
          value ? `${value} ha` : 'N/A'
    },
    { key: 'status', label: 'Status', render: (value) => getStatusBadge(value) },
    { key: 'progress', label: 'Progress', render: (value, row) => {
        const plantingDate = new Date(row.plantingDate);
        const harvestDate = new Date(row.expectedHarvestDate);
        const now = new Date();
        const totalDays = (harvestDate - plantingDate) / (1000 * 60 * 60 * 24);
        const daysPassed = (now - plantingDate) / (1000 * 60 * 60 * 24);
        const progress = Math.max(0, Math.min(100, (daysPassed / totalDays) * 100));

        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
              ></div>
            </div>
        );
      }},
    { key: 'actions', label: 'Actions', render: (_, session) => (
          <div className="flex space-x-2">
            <button
                onClick={() => handleViewSession(session)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
                onClick={() => console.log('Edit session:', session.id)}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Edit Session"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDeleteSession(session.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Delete Session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
      )}
  ];

  // Mock data if API fails
  const mockSessions = [
    {
      id: 1,
      farmName: 'Green Valley Farm',
      cropVariety: 'SC627',
      plantingDate: '2024-11-01',
      expectedHarvestDate: '2025-04-15',
      areaPlanted: 15.5,
      seedQuantity: 25,
      status: 'PLANTED',
      notes: 'Good soil conditions, regular irrigation planned'
    },
    {
      id: 2,
      farmName: 'Sunrise Agriculture',
      cropVariety: 'ZM621',
      plantingDate: '2024-10-15',
      expectedHarvestDate: '2025-03-30',
      areaPlanted: 22.3,
      seedQuantity: 35,
      status: 'GROWING',
      notes: 'Early planting, monitoring for pests'
    },
    {
      id: 3,
      farmName: 'Highland Farms',
      cropVariety: 'SC719',
      plantingDate: '2024-06-20',
      expectedHarvestDate: '2024-11-05',
      areaPlanted: 18.7,
      seedQuantity: 30,
      status: 'HARVESTED',
      notes: 'Excellent yield, good weather conditions'
    }
  ];

  const mockFarms = [
    { id: 1, name: 'Green Valley Farm' },
    { id: 2, name: 'Sunrise Agriculture' },
    { id: 3, name: 'Highland Farms' }
  ];

  const sessionData = error ? mockSessions : (sessions || []);
  const farmData = farms || mockFarms;

  // Calculate stats
  const totalSessions = sessionData.length;
  const currentDate = new Date();
  const activeSessions = sessionData.filter(s => new Date(s.expectedHarvestDate) > currentDate).length;
  const totalArea = sessionData.reduce((sum, session) => sum + (session.areaPlanted || 0), 0);
  const harvestedSessions = sessionData.filter(s => new Date(s.expectedHarvestDate) < currentDate).length;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Planting Sessions</h2>
            <p className="text-gray-600">Track and manage crop planting activities</p>
          </div>
          <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Sprout className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{activeSessions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Area</p>
                <p className="text-3xl font-bold text-gray-900">{totalArea.toFixed(1)} ha</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Harvested</p>
                <p className="text-3xl font-bold text-gray-900">{harvestedSessions}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <DataTable
            columns={columns}
            data={sessionData}
            loading={loading}
            error={error}
            onRetry={refetch}
            emptyMessage="No planting sessions found. Start your first planting session."
        />

        {/* Create Session Modal */}
        <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="New Planting Session"
            size="lg"
        >
          <form onSubmit={handleCreateSession} className="space-y-4">
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
                    value={formData.maizeVariety}
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
                  Expected Harvest Date *
                </label>
                <input
                    type="date"
                    name="expectedHarvestDate"
                    value={formData.expectedHarvestDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area Planted (hectares) *
                </label>
                <input
                    type="number"
                    name="areaPlanted"
                    value={formData.areaPlanted}
                    onChange={handleInputChange}
                    required
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seed Quantity (kg)
                </label>
                <input
                    type="number"
                    name="seedQuantity"
                    value={formData.seedQuantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Additional notes about this planting session..."
              />
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
                Create Session
              </button>
            </div>
          </form>
        </Modal>

        {/* View Session Modal */}
        <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title="Planting Session Details"
            size="md"
        >
          {selectedSession && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Session ID
                    </label>
                    <p className="text-gray-900 font-medium">#{selectedSession.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Farm
                    </label>
                    <p className="text-gray-900">{getFarmNameById(selectedSession.farmId)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Crop Variety
                    </label>
                    <p className="text-gray-900">{selectedSession.maizeVariety.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    {getStatusBadge(selectedSession.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Planting Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedSession.plantingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expected Harvest
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedSession.expectedHarvestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Area Planted
                    </label>
                    <p className="text-gray-900">{selectedSession.areaPlanted} hectares</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Seed Quantity
                    </label>
                    <p className="text-gray-900">{selectedSession.
                        seedRateKgPerHectare} kg</p>
                  </div>
                </div>

                {selectedSession.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Notes
                      </label>
                      <p className="text-gray-900">{selectedSession.notes}</p>
                    </div>
                )}
              </div>
          )}
        </Modal>

        {/* Error Notice */}
        {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Unable to load planting sessions from server. Showing sample data instead.
              </p>
            </div>
        )}
      </div>
  );
};

export default PlantingSessionsPage;