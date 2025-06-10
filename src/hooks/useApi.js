// src/hooks/useApi.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Generic hook to call an async API function and manage loading/error state
 * @param {Function} apiFn  – async function, e.g. getMyPurchases(lang)
 * @param {Array<any>} args – array of arguments to pass to apiFn
 * @returns {{ data: any, loading: boolean, error: any, reload: Function }}
 */
export function useApi(apiFn, args = []) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result);
    } catch (err) {
      console.error(`Error in useApi calling ${apiFn.name}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiFn, ...args]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, reload: fetchData };
}
