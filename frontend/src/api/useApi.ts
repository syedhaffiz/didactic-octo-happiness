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

  // The fetch effect is keyed only on [key, tick] so it does not restart on
  // every render. `fn` and `cache` are read through refs so the effect always
  // sees the latest values without making them effect dependencies — a fresh
  // `fn` identity each render would otherwise re-run the request constantly.
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const cache = opts.cache ?? false;
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const readCache = (): T | undefined =>
    cacheRef.current && referenceCache.has(key)
      ? (referenceCache.get(key) as T)
      : undefined;

  const [data, setData] = useState<T | undefined>(readCache);
  const [isLoading, setIsLoading] = useState<boolean>(() => readCache() === undefined);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Each effect run owns its own cancellation flag. The cleanup flips it on
    // unmount or before the next run (deps change / refetch), so a late or
    // superseded response can never commit to a stale render. This replaces
    // the old mutable call-id counter, which — with no per-run cleanup — could
    // drop a valid result when an in-flight promise was shared across
    // StrictMode's double-invoke or multiple components, surfacing as empty
    // data despite a successful response.
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */

    // Cache hit on a non-forced load — serve the stored value and skip the
    // network entirely. refetch() bumps `tick` above 0 to bypass this.
    if (cacheRef.current && tick === 0 && referenceCache.has(key)) {
      setData(referenceCache.get(key) as T);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    // Reuse an in-flight request for this key if one exists; otherwise start
    // one and register it. The entry is dropped once settled so later mounts
    // re-fetch (cache: true short-circuits above before reaching here).
    let promise = inFlight.get(key) as Promise<T> | undefined;
    if (!promise) {
      promise = fnRef.current();
      inFlight.set(key, promise);
      promise.finally(() => {
        if (inFlight.get(key) === promise) inFlight.delete(key);
      });
    }

    promise
      .then((result) => {
        // Guard on this run's own flag — NOT a shared counter — so a reused
        // in-flight promise still commits to every live subscriber.
        if (cancelled) return;
        setData(result);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        if (cacheRef.current) referenceCache.set(key, result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
    /* eslint-enable react-hooks/set-state-in-effect */

    return () => {
      cancelled = true;
    };
    // Keyed off serialised deps + refetch tick; fn/cache are read via refs.
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
