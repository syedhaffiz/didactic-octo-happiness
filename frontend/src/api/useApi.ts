import { useEffect, useRef, useState } from "react";

interface UseApiResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// Module-level cache for reference data (filter dropdowns, etc.). Cleared on
// full reload because it's in memory only.
const referenceCache = new Map<string, unknown>();

interface Options {
  // When true, the most recent successful result is stored under the cache key
  // and used as the initial value on the next mount with the same key. Suitable
  // for reference data that never (or rarely) changes during a session.
  cache?: boolean;
}

// Lightweight data-fetching hook. `deps` is the dependency array that
// participates in the cache key and triggers a refetch when changed —
// equivalent in spirit to TanStack Query's `queryKey`.
//
// Only the latest in-flight request commits its result; earlier ones are
// discarded so filter spam doesn't show stale data.
export const useApi = <T>(
  deps: ReadonlyArray<unknown>,
  fn: () => Promise<T>,
  opts: Options = {},
): UseApiResult<T> => {
  const key = JSON.stringify(deps);
  const cached = opts.cache ? (referenceCache.get(key) as T | undefined) : undefined;

  const [data, setData] = useState<T | undefined>(cached);
  const [isLoading, setIsLoading] = useState<boolean>(cached === undefined);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const callIdRef = useRef(0);

  useEffect(() => {
    // The effect kicks off an async fetch and commits the result into state.
    // Setting state inside an effect is the correct pattern for data-fetching
    // hooks; the set-state-in-effect lint rule is too strict here.
    const id = ++callIdRef.current;
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsLoading(true);
    setIsError(false);
    setError(null);
    fn()
      .then((result) => {
        if (id !== callIdRef.current) return;
        setData(result);
        setIsLoading(false);
        if (opts.cache) referenceCache.set(key, result);
      })
      .catch((err: unknown) => {
        if (id !== callIdRef.current) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
    /* eslint-enable react-hooks/set-state-in-effect */
    // Keyed off serialised deps + refetch tick; fn's closure captures the latest deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => setTick((t) => t + 1),
  };
};
