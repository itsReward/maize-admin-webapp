// src/pages/FarmsPage.jsx - Debug version to identify the issue

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

    // Process farm data safely
    const farmData = useMemo(() => {
        if (!farms) return [];
        if (Array.isArray(farms)) return farms;
        if (farms.content && Array.isArray(farms.content)) return farms.content;
        return [];
    }, [farms]);

    // Enhanced handleViewFarm with extensive debugging
    const handleViewFarm = (farm) => {
        console.log('🔍 handleViewFarm called with:', farm);
        console.log('🔍 Farm object type:', typeof farm);
        console.log('🔍 Farm object keys:', Object.keys(farm || {}));
        console.log('🔍 All farm properties:');

        // Log ALL properties of the farm object
        if (farm && typeof farm === 'object') {
            for (const [key, value] of Object.entries(farm)) {
                console.log(`  🔑 ${key}: ${value} (${typeof value})`);
            }
        }

        // Check for common ID field variations
        const possibleIdFields = ['id', '_id', 'farmId', 'Id', 'ID', 'pk', 'key'];
        let foundId = null;
        let idField = null;

        for (const field of possibleIdFields) {
            if (farm && farm[field] !== undefined && farm[field] !== null) {
                foundId = farm[field];
                idField = field;
                console.log(`✅ Found ID in field '${field}':`, foundId);
                break;
            }
        }

        // Validate farm object
        if (!farm) {
            console.error('❌ No farm object provided');
            alert('Error: No farm data provided');
            return;
        }

        // If no standard ID found, show detailed error
        if (!foundId) {
            console.error('❌ No valid ID found in any expected field');
            console.error('❌ Available fields:', Object.keys(farm));

            // Show a more helpful error dialog
            const availableFields = Object.keys(farm).join(', ');
            alert(`Error: Farm has no valid ID field.\n\nAvailable fields: ${availableFields}\n\nCheck console for details.`);
            return;
        }

        // Convert ID to string for URL
        const farmIdStr = String(foundId);
        console.log('🔍 Using ID field:', idField);
        console.log('🔍 Converted farm ID to string:', farmIdStr);

        // Test navigation
        console.log('🚀 Attempting navigation to:', `/farms/${farmIdStr}`);

        try {
            navigate(`/farms/${farmIdStr}`);
            console.log('✅ Navigation successful');
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            alert('Navigation failed: ' + error.message);
        }
    };

    // Test function for direct navigation
    const testDirectNavigation = () => {
        console.log('🧪 Testing direct navigation...');
        navigate('/farms/1');
    };

    // Enhanced columns with debugging
    const columns = [
        {
            key: 'name',
            label: 'Farm Name',
            render: (value, row) => {
                console.log('🔍 Rendering farm row:', row);
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium">{value}</span>
                    </div>
                );
            }
        },
        { key: 'location', label: 'Location' },
        {
            key: 'sizeHectares',
            label: 'Size (hectares)',
            render: (value) => value ? `${value} ha` : 'N/A'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => {
                console.log('🔍 Actions column - Row data:', row);

                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                console.log('👆 View button clicked');
                                console.log('👆 Row data:', row);
                                handleViewFarm(row);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => console.log('Edit clicked for:', row.id)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => console.log('Delete clicked for:', row.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">


            {/* Original content */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Farm Management</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add New Farm
                </button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={farmData}
                loading={loading}
                error={error}
                onRetry={refetch}
            />

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Farm"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log('Form submitted:', formData);
                    // Add your create logic here
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Farm Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size (hectares)
                        </label>
                        <input
                            type="number"
                            name="size"
                            value={formData.size}
                            onChange={(e) => setFormData(prev => ({...prev, size: e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Create Farm
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FarmsPage;