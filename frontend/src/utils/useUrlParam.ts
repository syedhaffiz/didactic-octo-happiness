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

// Date range encoded as "YYYY-MM-DD:YYYY-MM-DD" — matches the format the
// backend expects, so the URL value can flow straight into the API call.
export const useUrlDateRange = (
  key = "dateRange",
): [RangeTuple, (value: RangeTuple) => void, string | undefined] => {
  const [raw, setRaw] = useUrlParam(key);

  const value = useMemo<RangeTuple>(() => {
    if (!raw) return null;
    const [from, to] = raw.split(":");
    if (!from || !to) return null;
    const f = dayjs(from);
    const t = dayjs(to);
    if (!f.isValid() || !t.isValid()) return null;
    return [f, t];
  }, [raw]);

  const set = useCallback(
    (next: RangeTuple) => {
      if (!next || !next[0] || !next[1]) {
        setRaw(undefined);
        return;
      }
      setRaw(`${next[0].format("YYYY-MM-DD")}:${next[1].format("YYYY-MM-DD")}`);
    },
    [setRaw],
  );

  return [value, set, raw];
};
