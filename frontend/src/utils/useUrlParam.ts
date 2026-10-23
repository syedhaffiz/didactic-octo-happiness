import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";

// Single query-string key as a string-or-undefined value. Returns a
// useState-shaped tuple so call sites read identically to local state.
// Updates use `replace` so filter changes don't pollute browser history.
export const useUrlParam = (
  key: string,
): [string | undefined, (value: string | undefined) => void] => {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? undefined;

  const setValue = useCallback(
    (next: string | undefined) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next === undefined || next === "") out.delete(key);
          else out.set(key, next);
          return out;
        },
        { replace: true },
      );
    },
    [key, setParams],
  );

  return [value, setValue];
};

// A union of param keys, all set/cleared in one URL update. Useful for
// "Reset Filters" buttons that need to clear several params atomically.
export const useUrlParams = (
  keys: ReadonlyArray<string>,
): {
  values: Record<string, string | undefined>;
  set: (key: string, next: string | undefined) => void;
  reset: () => void;
} => {
  const [params, setParams] = useSearchParams();
  const keysSig = keys.join("|");
  const values = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const k of keys) out[k] = params.get(k) ?? undefined;
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, keysSig]);

  const set = useCallback(
    (key: string, next: string | undefined) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next === undefined || next === "") out.delete(key);
          else out.set(key, next);
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => {
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        for (const k of keys) out.delete(k);
        return out;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setParams, keysSig]);

  return { values, set, reset };
};

type RangeTuple = [Dayjs | null, Dayjs | null] | null;

const FMT = "YYYY-MM-DD";

// Date range as separate `fromDate` and `toDate` URL params — matches the API
// contract (every endpoint accepts the two as independent query params, so the
// URL value flows straight through). Both keys are written/cleared in a single
// setSearchParams call so they can never be momentarily out of sync.
export const useUrlDateRange = (
  fromKey = "fromDate",
  toKey = "toDate",
): [RangeTuple, (value: RangeTuple) => void] => {
  const [params, setParams] = useSearchParams();
  const fromRaw = params.get(fromKey) ?? undefined;
  const toRaw = params.get(toKey) ?? undefined;

  const value = useMemo<RangeTuple>(() => {
    if (!fromRaw || !toRaw) return null;
    const f = dayjs(fromRaw);
    const t = dayjs(toRaw);
    if (!f.isValid() || !t.isValid()) return null;
    return [f, t];
  }, [fromRaw, toRaw]);

  const set = useCallback(
    (next: RangeTuple) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!next || !next[0] || !next[1]) {
            out.delete(fromKey);
            out.delete(toKey);
          } else {
            out.set(fromKey, next[0].format(FMT));
            out.set(toKey, next[1].format(FMT));
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams, fromKey, toKey],
  );

  return [value, set];
};
