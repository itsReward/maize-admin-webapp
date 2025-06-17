import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/common/DataTable';

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: usersData, loading, error, refetch } = useApi(
    () => apiService.getUsers(page, 10, searchTerm),
    [page, searchTerm]
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'lastLogin', label: 'Last Login', render: (value) => 
      value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  const handleCreateUser = async () => {
    // Implementation for user creation modal/form
    console.log('Create user clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button 
          onClick={handleCreateUser}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add New User
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={usersData?.content || []} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default UsersPage;
