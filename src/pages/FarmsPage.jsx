// src/pages/FarmsPage.jsx
import React, { useState } from 'react';
import { Plus, MapPin, User, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FarmsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        size: '',
        soilType: '',
        ownerName: '',
        contactNumber: ''
    });

    const { data: farms, loading, error, refetch } = useApi(
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

    const handleCreateFarm = async (e) => {
        e.preventDefault();
        try {
            await apiService.createFarm(formData);
            setIsCreateModalOpen(false);
            setFormData({
                name: '',
                location: '',
                size: '',
                soilType: '',
                ownerName: '',
                contactNumber: ''
            });
            refetch();
        } catch (error) {
            alert(`Failed to create farm: ${error.message}`);
        }
    };

    const handleViewFarm = (farm) => {
        setSelectedFarm(farm);
        setIsViewModalOpen(true);
    };

    const handleDeleteFarm = async (farmId) => {
        if (window.confirm('Are you sure you want to delete this farm?')) {
            try {
                await apiService.deleteFarm(farmId);
                refetch();
            } catch (error) {
                alert(`Failed to delete farm: ${error.message}`);
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Farm Name' },
        { key: 'location', label: 'Location', render: (value) => (
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {value || 'N/A'}
                </div>
            )},
        { key: 'size', label: 'Size (hectares)', render: (value) =>
                value ? `${value} ha` : 'N/A'
        },
        { key: 'soilType', label: 'Soil Type' },
        { key: 'ownerName', label: 'Owner', render: (value) => (
                <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    {value || 'N/A'}
                </div>
            )},
        { key: 'createdAt', label: 'Created', render: (value) => (
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {value ? new Date(value).toLocaleDateString() : 'N/A'}
                </div>
            )},
        { key: 'actions', label: 'Actions', render: (_, farm) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleViewFarm(farm)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => console.log('Edit farm:', farm.id)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Edit Farm"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteFarm(farm.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Farm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
    ];

    // Mock data if API fails
    const mockFarms = [
        {
            id: 1,
            name: 'Green Valley Farm',
            location: 'Harare, Zimbabwe',
            size: 25.5,
            soilType: 'Clay Loam',
            ownerName: 'John Mukamuri',
            contactNumber: '+263 77 123 4567',
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            name: 'Sunrise Agriculture',
            location: 'Bulawayo, Zimbabwe',
            size: 40.2,
            soilType: 'Sandy Loam',
            ownerName: 'Mary Chivhayo',
            contactNumber: '+263 71 987 6543',
            createdAt: '2024-02-20'
        },
        {
            id: 3,
            name: 'Highland Farms',
            location: 'Mutare, Zimbabwe',
            size: 18.7,
            soilType: 'Red Clay',
            ownerName: 'Peter Moyo',
            contactNumber: '+263 78 456 7890',
            createdAt: '2024-03-10'
        }
    ];

    const farmData = error ? mockFarms : (farms || []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Farm Management</h2>
                    <p className="text-gray-600">Manage and monitor agricultural farms</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Farm</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Farms</p>
                            <p className="text-3xl font-bold text-gray-900">{farmData.length}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Area</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {farmData.reduce((sum, farm) => sum + (farm.size || 0), 0).toFixed(1)} ha
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Farmers</p>
                            <p className="text-3xl font-bold text-gray-900">{farmData.length}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Farm Size</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {farmData.length > 0
                                    ? (farmData.reduce((sum, farm) => sum + (farm.size || 0), 0) / farmData.length).toFixed(1)
                                    : '0'
                                } ha
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <MapPin className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Farms Table */}
            <DataTable
                columns={columns}
                data={farmData}
                loading={loading}
                error={error}
                onRetry={refetch}
                emptyMessage="No farms found. Add your first farm to get started."
            />

            {/* Create Farm Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Farm"
                size="lg"
            >
                <form onSubmit={handleCreateFarm} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Farm Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter farm name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="City, Province"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Size (hectares) *
                            </label>
                            <input
                                type="number"
                                name="size"
                                value={formData.size}
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
                                Soil Type
                            </label>
                            <select
                                name="soilType"
                                value={formData.soilType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select soil type</option>
                                <option value="Clay">Clay</option>
                                <option value="Clay Loam">Clay Loam</option>
                                <option value="Sandy Loam">Sandy Loam</option>
                                <option value="Sandy">Sandy</option>
                                <option value="Loam">Loam</option>
                                <option value="Red Clay">Red Clay</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Owner Name *
                            </label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Farm owner's name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="+263 77 123 4567"
                            />
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
                            Create Farm
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Farm Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Farm Details"
                size="md"
            >
                {selectedFarm && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Farm Name
                                </label>
                                <p className="text-gray-900 font-medium">{selectedFarm.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Location
                                </label>
                                <p className="text-gray-900">{selectedFarm.location}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Size
                                </label>
                                <p className="text-gray-900">{selectedFarm.size} hectares</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Soil Type
                                </label>
                                <p className="text-gray-900">{selectedFarm.soilType || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Owner
                                </label>
                                <p className="text-gray-900">{selectedFarm.ownerName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Contact
                                </label>
                                <p className="text-gray-900">{selectedFarm.contactNumber || 'Not provided'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Created Date
                            </label>
                            <p className="text-gray-900">
                                {selectedFarm.createdAt ? new Date(selectedFarm.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Error Notice */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                        Unable to load farms from server. Showing sample data instead.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FarmsPage;