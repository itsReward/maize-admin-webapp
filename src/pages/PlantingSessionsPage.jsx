import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const PlantingSessionsPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: sessionsData, loading, error, refetch } = useApi(
    () => apiService.getPlantingSessions(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'farmerName', label: 'Farmer' },
    { key: 'maizeVarietyName', label: 'Crop Variety' },
    { key: 'plantingDate', label: 'Planting Date', render: (value) => 
      new Date(value).toLocaleDateString()
    },
    { key: 'area', label: 'Area (ha)', render: (value) => 
      value ? value.toFixed(2) : '--'
    },
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'GROWING' ? 'bg-green-100 text-green-800' : 
        value === 'HARVESTED' ? 'bg-blue-100 text-blue-800' : 
        value === 'PLANTED' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'predictedYield', label: 'Predicted Yield (t/ha)', render: (value) => 
      value ? value.toFixed(2) : 'Pending'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Planting Sessions</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          New Session
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={sessionsData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default PlantingSessionsPage;
