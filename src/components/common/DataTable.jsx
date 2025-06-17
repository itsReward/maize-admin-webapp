import React, { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const DataTable = ({ columns, data, onRowClick, loading = false, error = null, onRetry }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  if (loading) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <LoadingSpinner />
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ErrorMessage message={error} onRetry={onRetry} />
        </div>
    );
  }

  if (!data || data.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-500">No data available</p>
        </div>
    );
  }

  const filteredData = data.filter(item =>
      Object.values(item).some(val =>
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Data Table</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.label}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
                <tr
                    key={item.id || index}
                    onClick={() => onRowClick?.(item)}
                    className="hover:bg-gray-50 cursor-pointer"
                >
                  {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                  ))}
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
              </p>
              <div className="flex items-center space-x-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-green-600 text-white rounded-lg">
              {currentPage}
            </span>
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default DataTable;