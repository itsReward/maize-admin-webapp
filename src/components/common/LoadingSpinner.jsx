import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className={`border-2 border-green-200 border-t-green-600 rounded-full animate-spin ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
