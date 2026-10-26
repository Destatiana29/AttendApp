import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFetch — generic async data fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(fetchUsers)
 *
 * - Runs `fetchFn` once on mount.
 * - `refetch` lets the caller manually re-trigger the fetch (e.g. "Try Again" button).
 * - Uses a ref for `fetchFn` so changing the function reference does NOT re-trigger
 *   the effect (avoids infinite loops with inline arrow functions).
 *
 * @param {Function} fetchFn - An async function that returns data or throws.
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: Function }}
 */
export function useFetch(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a stable ref so execute() never needs fetchFn in its dependency array.
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  /** Runs the fetch; can be called externally via `refetch`. */
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []); // empty deps → stable reference across renders

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
