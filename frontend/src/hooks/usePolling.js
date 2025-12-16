/**
 * usePolling Hook
 * Custom hook for polling API endpoints at regular intervals
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling(apiFunction, interval = 2000, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (...args) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      if (mountedRef.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'An error occurred');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction]);

  const startPolling = useCallback((...args) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    fetchData(...args);

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchData(...args);
    }, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    startPolling,
    stopPolling,
    fetchData
  };
}

export default usePolling;

