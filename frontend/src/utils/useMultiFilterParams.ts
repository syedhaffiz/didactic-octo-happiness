import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { splitCsv } from "./csv";

export interface MultiFilterParams<K extends string> {
  /** The raw URL params — for screen-specific keys (dates, toggles, …). */
  searchParams: URLSearchParams;
  /** Current values per filter (parsed from the comma-joined URL params). */
  multi: Record<K, string[]>;
  /** Non-empty filters, comma-joined — spread straight into the API query. */
  csv: Partial<Record<K, string>>;
  setMulti: (key: K, values: string[]) => void;
  /** Commit many keys atomically in one URL update. Used by the Filters drawer. */
  setMany: (entries: Partial<Record<K, string[]>>) => void;
  /** Clear every multi-select key (other params are left alone). */
  clearMulti: () => void;
  /** Apply an arbitrary edit to the URL params in one replace-navigation. */
  update: (mutate: (out: URLSearchParams) => void) => void;
  /** How many filters hold a value — for the Filters button badge. */
  activeCount: number;
}

// URL-backed state for a screen's multi-select side-panel filters. Each key is
// comma-joined in the URL (empty ⇒ "All"), so a selection is shareable and
// survives reload/back-forward. Screens layer their own extra params (date
// range, toggles) on top via `searchParams` + `update`.
export const useMultiFilterParams = <K extends string>(
  keys: readonly K[],
): MultiFilterParams<K> => {
  const [searchParams, setParams] = useSearchParams();
  const keysSig = keys.join("|");

  const multi = useMemo(() => {
    const out = {} as Record<K, string[]>;
    for (const k of keys) out[k] = splitCsv(searchParams.get(k));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keys tracked via keysSig
  }, [searchParams, keysSig]);

  const csv = useMemo(() => {
    const out: Partial<Record<K, string>> = {};
    for (const k of keys) if (multi[k].length) out[k] = multi[k].join(",");
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keys tracked via keysSig
  }, [multi, keysSig]);

  const update = useCallback(
    (mutate: (out: URLSearchParams) => void) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          mutate(out);
          return out;
        },
        { replace: true },
      ),
    [setParams],
  );

  const setMulti = useCallback(
    (key: K, values: string[]) =>
      update((out) => {
        if (values.length) out.set(key, values.join(","));
        else out.delete(key);
      }),
    [update],
  );

  // One updater for all keys — separate setMulti calls would each close over
  // the render-time params and clobber one another.
  const setMany = useCallback(
    (entries: Partial<Record<K, string[]>>) =>
      update((out) => {
        for (const [k, v] of Object.entries(entries) as [K, string[] | undefined][]) {
          if (v?.length) out.set(k, v.join(","));
          else out.delete(k);
        }
      }),
    [update],
  );

  const clearMulti = useCallback(
    () =>
      update((out) => {
        for (const k of keys) out.delete(k);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keys tracked via keysSig
    [update, keysSig],
  );

  const activeCount = keys.filter((k) => multi[k].length > 0).length;

  return { searchParams, multi, csv, setMulti, setMany, clearMulti, update, activeCount };
};
