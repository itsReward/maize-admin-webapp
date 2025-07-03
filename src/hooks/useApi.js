// src/hooks/useApi.js - Enhanced version with better error handling

import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    immediate = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    transform
  } = options;

  const executeRequest = useCallback(async (attempt = 1) => {
    // Skip if no API function provided
    if (!apiFunction) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      console.log(`🔄 API Request attempt ${attempt}/${retryAttempts + 1}`);

      const result = await apiFunction();

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🚫 API Request aborted');
        return;
      }

      // Transform data if transform function provided
      const transformedData = transform ? transform(result) : result;

      setData(transformedData);
      setError(null);

      console.log('✅ API Request successful');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(transformedData);
      }

    } catch (err) {
      console.error(`❌ API Request failed (attempt ${attempt}):`, err);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🚫 API Request aborted');
        return;
      }

      // Retry logic for certain types of errors
      const shouldRetry = attempt <= retryAttempts && (
          err.status >= 500 || // Server errors
          err.name === 'NetworkError' ||
          err.message?.includes('fetch') ||
          !navigator.onLine // Offline
      );

      if (shouldRetry) {
        console.log(`🔄 Retrying API request in ${retryDelay}ms...`);
        setTimeout(() => {
          executeRequest(attempt + 1);
        }, retryDelay * attempt); // Exponential backoff
        return;
      }

      // Set error state
      setError(err);
      setData(null);

      // Call error callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retryAttempts, retryDelay, transform, onSuccess, onError]);

  // Refetch function for manual retries
  const refetch = useCallback(() => {
    executeRequest(1);
  }, [executeRequest]);

  // Reset function to clear data/error state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Effect to trigger API call when dependencies change
  useEffect(() => {
    if (immediate) {
      executeRequest(1);
    }

    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [...dependencies, immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    isOffline: !navigator.onLine
  };
};

// Enhanced version specifically for farm data
export const useFarmApi = (farmId, options = {}) => {
  const farmApi = useCallback(async () => {
    if (!farmId) return null;

    // Dynamic import to avoid circular dependencies
    const { default: apiService } = await import('../services/apiService');
    return apiService.getFarmById(farmId);
  }, [farmId]);

  return useApi(farmApi, [farmId], {
    immediate: !!farmId,
    retryAttempts: 3,
    ...options
  });
};

// Hook for planting sessions data
export const usePlantingSessionsApi = (farmId, options = {}) => {
  const sessionsApi = useCallback(async () => {
    // Dynamic import to avoid circular dependencies
    const { default: apiService } = await import('../services/apiService');
    return farmId ?
        apiService.getPlantingSessionsByFarmId(farmId) :
        apiService.getPlantingSessions();
  }, [farmId]);

  return useApi(sessionsApi, [farmId], {
    immediate: true,
    retryAttempts: 2,
    ...options
  });
};

export default useApi;