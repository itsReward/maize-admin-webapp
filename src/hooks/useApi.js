// src/hooks/useApi.js - Enhanced API Hook with Retry and Error Recovery
import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (
    apiCall,
    dependencies = [],
    options = {}
) => {
  const {
    immediate = true,
    retryAttempts = 2,
    retryDelay = 1000,
    timeout = 30000,
    fallbackData = null,
    onError = null,
    onSuccess = null,
    enableCache = false,
    cacheKey = null,
    cacheDuration = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetch, setLastFetch] = useState(null);

  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const timeoutRef = useRef(null);

  // Cache management
  const getCachedData = useCallback((key) => {
    if (!enableCache || !key) return null;

    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cacheDuration;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [enableCache, cacheDuration]);

  const setCachedData = useCallback((key, data) => {
    if (!enableCache || !key) return;

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [enableCache]);

  // Sleep utility for retry delays
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Execute API call with retry logic
  const executeApiCall = useCallback(async (attempt = 0) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache first
    if (attempt === 0 && enableCache && cacheKey) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return cachedData;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Set timeout
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, timeout);
      }

      // Execute the API call
      const result = await apiCall(abortControllerRef.current.signal);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update state with successful result
      setData(result);
      setError(null);
      setRetryCount(0);
      setLastFetch(Date.now());

      // Cache the result
      if (enableCache && cacheKey) {
        setCachedData(cacheKey, result);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (err) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Don't handle aborted requests
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`API call failed (attempt ${attempt + 1}):`, err);

      // Determine if we should retry
      const shouldRetry = attempt < retryAttempts &&
          err.status !== 401 &&
          err.status !== 403 &&
          err.status !== 422;

      if (shouldRetry) {
        setRetryCount(attempt + 1);
        console.log(`Retrying API call in ${retryDelay}ms... (attempt ${attempt + 2}/${retryAttempts + 1})`);

        await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        return executeApiCall(attempt + 1);
      } else {
        // Final failure
        setError(err);
        setRetryCount(attempt);

        // Use fallback data if available
        if (fallbackData !== null) {
          setData(fallbackData);
        } else if (enableCache && cacheKey) {
          // Try to use stale cache data as fallback
          const staleData = cacheRef.current.get(cacheKey)?.data;
          if (staleData) {
            setData(staleData);
            console.warn('Using stale cached data due to API failure');
          }
        }

        // Call error callback
        if (onError) {
          onError(err);
        }

        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [
    apiCall,
    retryAttempts,
    retryDelay,
    timeout,
    fallbackData,
    onError,
    onSuccess,
    enableCache,
    cacheKey,
    getCachedData,
    setCachedData
  ]);

  // Manual refetch function
  const refetch = useCallback(() => {
    return executeApiCall(0);
  }, [executeApiCall]);

  // Reset function to clear data and errors
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setData(fallbackData);
    setLoading(false);
    setError(null);
    setRetryCount(0);
    setLastFetch(null);
  }, [fallbackData]);

  // Effect to trigger API call when dependencies change
  useEffect(() => {
    if (immediate) {
      executeApiCall(0).catch(() => {
        // Error is already handled in executeApiCall
      });
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    retryCount,
    lastFetch,
    isStale: enableCache && lastFetch && (Date.now() - lastFetch > cacheDuration)
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (
    apiCall,
    dependencies = [],
    options = {}
) => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(options.pageSize || 10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const enhancedApiCall = useCallback(async (signal) => {
    const result = await apiCall(page, size, signal);

    // Extract pagination info
    if (result && typeof result === 'object') {
      setTotalElements(result.totalElements || 0);
      setTotalPages(result.totalPages || 0);
      return result.content || result.data || result;
    }

    return result;
  }, [apiCall, page, size]);

  const apiResult = useApi(enhancedApiCall, [page, size, ...dependencies], options);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const changePageSize = useCallback((newSize) => {
    setSize(newSize);
    setPage(0); // Reset to first page
  }, []);

  return {
    ...apiResult,
    page,
    size,
    totalElements,
    totalPages,
    goToPage,
    changePageSize,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0
  };
};

// Hook for infinite scroll/loading
export const useInfiniteApi = (
    apiCall,
    dependencies = [],
    options = {}
) => {
  const [allData, setAllData] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const enhancedApiCall = useCallback(async (signal) => {
    const result = await apiCall(page, options.pageSize || 10, signal);

    if (result && Array.isArray(result.content || result.data || result)) {
      const newData = result.content || result.data || result;

      if (page === 0) {
        setAllData(newData);
      } else {
        setAllData(prev => [...prev, ...newData]);
      }

      setHasMore(newData.length === (options.pageSize || 10));
      return newData;
    }

    setHasMore(false);
    return result;
  }, [apiCall, page, options.pageSize]);

  const apiResult = useApi(
      enhancedApiCall,
      [page, ...dependencies],
      { ...options, immediate: true }
  );

  const loadMore = useCallback(() => {
    if (!apiResult.loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [apiResult.loading, hasMore]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(0);
    setHasMore(true);
    apiResult.reset();
  }, [apiResult]);

  return {
    ...apiResult,
    data: allData,
    loadMore,
    hasMore,
    reset
  };
};

// Hook for real-time data with polling
export const usePollingApi = (
    apiCall,
    dependencies = [],
    options = {}
) => {
  const { interval = 30000, enablePolling = true } = options;
  const [isPolling, setIsPolling] = useState(enablePolling);

  const apiResult = useApi(apiCall, dependencies, {
    ...options,
    immediate: true
  });

  useEffect(() => {
    if (!isPolling || apiResult.loading) return;

    const intervalId = setInterval(() => {
      apiResult.refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [isPolling, interval, apiResult.loading, apiResult.refetch]);

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  return {
    ...apiResult,
    isPolling,
    startPolling,
    stopPolling
  };
};

export default useApi;