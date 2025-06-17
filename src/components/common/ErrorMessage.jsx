import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => (
  <div className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between ${className}`}>
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <span className="text-red-800">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;
