// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      // Convert error to a consistent format
      const errorMessage = err instanceof Error ? err.message :
          err && typeof err === 'object' && err.message ? err.message :
              typeof err === 'string' ? err :
                  'An unexpected error occurred';

      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useApi;