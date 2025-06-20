// src/components/common/ErrorMessage.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
    // Handle different types of error messages
    const getErrorMessage = (error) => {
        if (typeof error === 'string') {
            return error;
        }
        if (error instanceof Error) {
            return error.message || 'An unexpected error occurred';
        }
        if (error && typeof error === 'object' && error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    };

    const errorMessage = getErrorMessage(message);

    return (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3 flex-1">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;