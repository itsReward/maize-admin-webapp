// src/components/common/LoadingWithErrors.jsx - Enhanced loading component
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const LoadingWithErrors = ({ message = "Loading..." }) => {
    const { errors } = useAuth();

    const nonCriticalErrors = errors.filter(err => !err.critical);
    const hasApiErrors = nonCriticalErrors.some(err =>
        err.type === 'MISSING_ENDPOINT' || err.type === 'API_ERROR'
    );

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">{message}</p>

            {hasApiErrors && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-amber-600 mb-2">
                        Some features may not be available
                    </p>
                    <p className="text-xs text-gray-500">
                        The app is still loading but some endpoints are not implemented
                    </p>
                </div>
            )}
        </div>
    );
};

export { LoadingWithErrors };
export default ErrorDisplay;