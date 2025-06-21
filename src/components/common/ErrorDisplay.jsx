// src/components/common/ErrorDisplay.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, X, RefreshCw, Info } from 'lucide-react';

const ErrorDisplay = () => {
    const { errors, clearError, clearAllErrors, refreshSession } = useAuth();

    // Don't show if no errors
    if (!errors || errors.length === 0) {
        return null;
    }

    // Separate critical and non-critical errors
    const criticalErrors = errors.filter(err => err.critical);
    const nonCriticalErrors = errors.filter(err => !err.critical);

    const getErrorIcon = (type) => {
        switch (type) {
            case 'MISSING_ENDPOINT':
            case 'VALIDATION_ERROR':
                return <Info className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const getErrorColor = (type, critical) => {
        if (critical) {
            return 'bg-red-50 border-red-200 text-red-800';
        }

        switch (type) {
            case 'MISSING_ENDPOINT':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'SUCCESS':
                return 'bg-green-50 border-green-200 text-green-800';
            default:
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        }
    };

    const ErrorItem = ({ error }) => (
        <div className={`border rounded-lg p-3 mb-2 ${getErrorColor(error.type, error.critical)}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                    {getErrorIcon(error.type)}
                    <div className="flex-1">
                        <p className="font-medium text-sm">{error.message}</p>
                        {error.endpoint && (
                            <p className="text-xs opacity-75 mt-1">
                                Endpoint: {error.endpoint}
                            </p>
                        )}
                        {error.status && (
                            <p className="text-xs opacity-75">
                                Status: {error.status}
                            </p>
                        )}
                        <p className="text-xs opacity-60 mt-1">
                            {error.timestamp.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                    {error.type === 'SESSION_VALIDATION_FAILED' && (
                        <button
                            onClick={refreshSession}
                            className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                            title="Retry session validation"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    )}
                    <button
                        onClick={() => clearError(error.id)}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                        title="Dismiss"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
            {/* Critical errors - always visible */}
            {criticalErrors.map(error => (
                <ErrorItem key={error.id} error={error} />
            ))}

            {/* Non-critical errors - collapsible */}
            {nonCriticalErrors.length > 0 && (
                <div className="mt-2">
                    <details className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <summary className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                                {nonCriticalErrors.length} non-critical issue{nonCriticalErrors.length > 1 ? 's' : ''}
                            </span>
                        </summary>
                        <div className="p-3 pt-0">
                            {nonCriticalErrors.map(error => (
                                <ErrorItem key={error.id} error={error} />
                            ))}
                        </div>
                    </details>
                </div>
            )}

            {/* Clear all button */}
            {errors.length > 1 && (
                <div className="mt-2 text-center">
                    <button
                        onClick={clearAllErrors}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default ErrorDisplay;