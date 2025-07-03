// src/pages/FarmsPage.jsx
import React, { useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import { Plus, MapPin, User, Edit, Trash2, Eye, Mail, Phone } from 'lucide-react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

const FarmsPage = () => {
    const navigate = useNavigate();
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

    const owners = useMemo(() => {
        if (!farms || farms.length === 0) return [];

        // Create a map of unique owners using farm.ownerId (or similar identifier)
        const ownersMap = new Map();

        farms.forEach(farm => {
            // Assuming each farm has ownerId, ownerName, and contactNumber
            if (farm.ownerId && !ownersMap.has(farm.ownerId)) {
                ownersMap.set(farm.ownerId, {
                    id: farm.ownerId,
                    name: farm.ownerName || 'Unknown Owner',
                    phone: farm.contactNumber || 'N/A',
                    email: farm.ownerEmail || 'N/A'
                });
            }
        });

        return Array.from(ownersMap.values());
    }, [farms]);


    const getOwnerDetailsById = (ownerId, ownersList) => {
        // Handle case where ownersList is not yet loaded or ownerId is missing
        if (!ownersList || !ownerId) {
            return { name: 'Unknown Owner', email: 'N/A', phone: 'N/A' };
        }

        const owner = ownersList.find(owner => owner.id === ownerId);

        // If owner is found, return their details, otherwise return default values
        return owner || { name: 'Unknown Owner', email: 'N/A', phone: 'N/A' };
    };


    // Safe data handling with fallbacks
    const farmData = React.useMemo(() => {
        // Ensure we always have an array to work with
        if (!farms) {
            console.log('🔍 Farms data is null/undefined, using empty array');
            return [];
        }

        if (!Array.isArray(farms)) {
            console.log('🔍 Farms data is not an array:', typeof farms, farms);
            // Try to extract array from paginated response
            if (farms.content && Array.isArray(farms.content)) {
                console.log('🔍 Extracting farms from paginated response');
                return farms.content;
            }
            // Last resort: return empty array
            console.warn('⚠️ Could not extract array from farms data, using empty array');
            return [];
        }

        return farms;
    }, [farms]);

    // Debug logging
    React.useEffect(() => {
        console.log('🏠 FarmsPage render state:', {
            loading,
            error: error?.message,
            farmsRawData: farms,
            farmDataArray: farmData,
            farmDataLength: farmData?.length,
            farmDataType: typeof farmData,
            isArray: Array.isArray(farmData)
        });
    }, [loading, error, farms, farmData]);

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
            console.error('❌ Failed to create farm:', error);
            alert(`Failed to create farm: ${error.message}`);
        }
    };

    const handleViewFarm = (farm) => {
        console.log('🔍 Viewing farm details:', farm);
        // Navigate to the farm detail page
        navigate(`/farms/${farm.id}`);
    };

    const handleDeleteFarm = async (farmId) => {
        if (window.confirm('Are you sure you want to delete this farm?')) {
            try {
                await apiService.deleteFarm(farmId);
                refetch();
            } catch (error) {
                console.error('❌ Failed to delete farm:', error);
                alert(`Failed to delete farm: ${error.message}`);
            }
        }
    };

    const handleEditFarm = (farmId) => {
        console.log('Edit farm:', farmId);
        // TODO: Navigate to edit page or open edit modal
        // Example: navigate(`/farms/${farmId}/edit`);
    };

    // Safe calculation helpers
    const getTotalFarms = () => {
        return Array.isArray(farmData) ? farmData.length : 0;
    };

    const getTotalArea = () => {
        if (!Array.isArray(farmData) || farmData.length === 0) return 0;
        try {
            return farmData.reduce((sum, farm) => sum + (parseFloat(farm.sizeHectares) || 0), 0);
        } catch (error) {
            console.error('❌ Error calculating total area:', error);
            return 0;
        }
    };

    const getAverageSize = () => {
        const totalFarms = getTotalFarms();
        if (totalFarms === 0) return 0;
        return getTotalArea() / totalFarms;
    };

    const columns = [
        {
            key: 'name',
            label: 'Farm Name',
            render: (value, farm) => (
                <div>
                    <p className="font-medium text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">ID: {farm.id}</p>
                </div>
            )
        },
        {
            key: 'location',
            label: 'Location',
            render: (value) => (
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{value}</span>
                </div>
            )
        },
        {
            key: 'sizeHectares',
            label: 'Size (Hectares)',
            render: (value) => `${value} ha`
        },
        {
            key: 'ownerName',
            label: 'Owner',
            render: (value, farm) => (
                <div>
                    <p className="font-medium text-gray-900">{value || 'Unknown Owner'}</p>
                    <p className="text-xs text-gray-500">ID: {farm.ownerId}</p>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Contact',
            render: (_, farm) => (
                <div className="space-y-1">
                    {farm.ownerEmail ? (
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            <a
                                href={`mailto:${farm.ownerEmail}`}
                                className="hover:text-blue-600 truncate max-w-32"
                                title={farm.ownerEmail}
                            >
                                {farm.ownerEmail}
                            </a>
                        </div>
                    ) : null}
                    {farm.ownerPhone ? (
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            <a
                                href={`tel:${farm.ownerPhone}`}
                                className="hover:text-blue-600"
                            >
                                {farm.ownerPhone}
                            </a>
                        </div>
                    ) : null}
                    {!farm.ownerEmail && !farm.ownerPhone && (
                        <span className="text-sm text-gray-400">No contact info</span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, farm) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleViewFarm(farm.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleEditFarm(farm.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Farm"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteFarm(farm.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Farm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Mock data for development/fallback
    const mockFarms = [
        {
            id: 1,
            name: 'Green Valley Farm',
            location: 'Harare, Zimbabwe',
            size: 25.5,
            soilType: 'Loamy',
            ownerName: 'John Mukamuri',
            contactNumber: '+263 77 123 4567'
        },
        {
            id: 2,
            name: 'Sunrise Agriculture',
            location: 'Bulawayo, Zimbabwe',
            size: 40.2,
            soilType: 'Clay',
            ownerName: 'Mary Chikwanha',
            contactNumber: '+263 71 987 6543'
        },
        {
            id: 3,
            name: 'Highland Farms',
            location: 'Mutare, Zimbabwe',
            size: 18.7,
            soilType: 'Sandy Loam',
            ownerName: 'Peter Moyo',
            contactNumber: '+263 78 456 7890'
        }
    ];

    // Use mock data if there's an error and no real data
    const displayData = error && farmData.length === 0 ? mockFarms : farmData;

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

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                        <div>Loading: {loading ? 'Yes' : 'No'}</div>
                        <div>Error: {error ? error.message : 'None'}</div>
                        <div>Raw Data Type: {typeof farms}</div>
                        <div>Is Array: {Array.isArray(farmData) ? 'Yes' : 'No'}</div>
                        <div>Farm Count: {farmData.length}</div>
                        <div>Using Mock Data: {error && farmData.length === 0 ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Farms</p>
                            <p className="text-3xl font-bold text-gray-900">{getTotalFarms()}</p>
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
                                {getTotalArea().toFixed(1)} ha
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
                            <p className="text-3xl font-bold text-gray-900">{getTotalFarms()}</p>
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
                                {getAverageSize().toFixed(1)} ha
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <MapPin className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-red-800">
                            <h4 className="font-semibold">Failed to load farms data</h4>
                            <p className="text-sm mt-1">
                                {error.message}.
                                {farmData.length === 0 && ' Showing sample data below.'}
                            </p>
                            <button
                                onClick={refetch}
                                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Farms Table */}
            <DataTable
                columns={columns}
                data={displayData}
                loading={loading}
                error={null} // We handle error display above
                onRetry={refetch}
                emptyMessage="No farms found. Add your first farm to get started."
            />

            {/* Create Farm Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Farm"
            >
                <form onSubmit={handleCreateFarm} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Farm Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size (hectares) *
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Soil Type
                        </label>
                        <select
                            name="soilType"
                            value={formData.soilType}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">Select soil type</option>
                            <option value="Loamy">Loamy</option>
                            <option value="Clay">Clay</option>
                            <option value="Sandy">Sandy</option>
                            <option value="Sandy Loam">Sandy Loam</option>
                            <option value="Clay Loam">Clay Loam</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owner Name *
                        </label>
                        <input
                            type="text"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number
                        </label>
                        <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="+263 77 123 4567"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
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
            >
                {selectedFarm && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Farm Name</label>
                                <p className="text-lg font-semibold">{selectedFarm.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Location</label>
                                <p className="text-lg">{selectedFarm.location}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Size</label>
                                <p className="text-lg">{selectedFarm.sizeHectares} hectares</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Soil Type</label>
                                <p className="text-lg">{selectedFarm.soilType || 'Not specified'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Owner</label>
                                <p className="text-lg">{selectedFarm.ownerName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Contact</label>
                                <p className="text-lg">{selectedFarm.contactNumber || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FarmsPage;