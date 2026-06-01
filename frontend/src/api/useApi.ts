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

// In-flight request dedup. When multiple components mount concurrently with
// the same deps key (e.g. three filter dropdowns reading the shared /filters
// payload, or React StrictMode's double-invoke in dev), they share a single
// network request instead of racing each other.
const inFlight = new Map<string, Promise<unknown>>();

interface Options {
  // When true, the most recent successful result is stored under the cache
  // key and reused on subsequent mounts with the same key — no refetch.
  // Suitable for reference data that never (or rarely) changes during a
  // session. `refetch()` always bypasses the cache.
  cache?: boolean;
}

// Lightweight data-fetching hook. `deps` is the dependency array that
// participates in the cache key and triggers a refetch when changed —
// equivalent in spirit to TanStack Query's `queryKey`.
//
// Behaviour:
//   • cache: true + key in cache + first render → no fetch (use cached value).
//   • Multiple components, same key, same render cycle → one network call.
//   • Filter spam → only the latest result commits; earlier ones discarded.
//   • refetch() → bypasses cache, always hits the network.
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
    const id = ++callIdRef.current;
    /* eslint-disable react-hooks/set-state-in-effect */

    // Cache hit on initial render — skip the network call entirely. A manual
    // refetch (tick > 0) bypasses this so the caller can force a refresh.
    if (opts.cache && tick === 0 && referenceCache.has(key)) {
      setData(referenceCache.get(key) as T);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    // Dedupe concurrent calls for the same key. If a request is already in
    // flight, reuse its promise instead of starting another.
    let promise = inFlight.get(key) as Promise<T> | undefined;
    if (!promise) {
      promise = fn();
      inFlight.set(key, promise);
      // Drop the in-flight entry once settled so future calls re-fetch
      // (unless cache: true, in which case the cache catches them first).
      promise.finally(() => {
        if (inFlight.get(key) === promise) inFlight.delete(key);
      });
    }

    promise
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
