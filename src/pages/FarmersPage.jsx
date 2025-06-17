import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const FarmersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: farmersData, loading, error, refetch } = useApi(
    () => apiService.getFarmers(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'farmCount', label: 'Farms Count' },
    { key: 'totalArea', label: 'Total Area (ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    },
    { key: 'activeSessions', label: 'Active Sessions' },
    { key: 'avgYield', label: 'Avg Yield (t/ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Farmer Management</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Add New Farmer
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={farmersData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default FarmersPage;
