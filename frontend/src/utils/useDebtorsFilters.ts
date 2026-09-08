import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import type { Currency, DebtorsFilterOptions, DebtorsParams } from "../types/finance";

const FMT = "YYYY-MM-DD";

// The Filters side-panel dropdowns. Each is a single-select defaulting to "All"
// (an absent URL param). `optionsKey` ties a field to its option list in the
// /filters payload so the drawer and the applied-filter chips stay in lock-step.
export interface DebtorsFieldMeta {
  key: DebtorsDrawerKey;
  label: string;
  optionsKey: keyof DebtorsFilterOptions;
}
export const DEBTORS_DRAWER_KEYS = [
  "zone",
  "port",
  "segment",
  "customer",
  "group",
  "aging",
  "type",
] as const;
export type DebtorsDrawerKey = (typeof DEBTORS_DRAWER_KEYS)[number];

export const DEBTORS_DRAWER_FIELDS: DebtorsFieldMeta[] = [
  { key: "zone", label: "Zone", optionsKey: "zones" },
  { key: "port", label: "Port", optionsKey: "ports" },
  { key: "segment", label: "Segment", optionsKey: "segments" },
  { key: "customer", label: "Customer", optionsKey: "customers" },
  { key: "group", label: "Group", optionsKey: "groups" },
  { key: "aging", label: "Aging", optionsKey: "agings" },
  { key: "type", label: "Type", optionsKey: "types" },
];

// Currency + the as-of date live in the top control row; the rest are the
// drawer dropdowns. All are backed by URL params so a selection is shareable and
// survives reload/back-forward.
const TOP_KEYS = ["currency", "tillDate"] as const;
const ALL_KEYS: string[] = [...DEBTORS_DRAWER_KEYS, ...TOP_KEYS];

export interface DebtorsFiltersState {
  /** Cleaned query object for the API + a stable useApi query-key member. */
  params: DebtorsParams;
  /** Current single-select values keyed by drawer field. */
  values: Record<DebtorsDrawerKey, string | undefined>;
  currency: Currency;
  /** As-of date, or null when unset (defaults to "till date" on the server). */
  tillDate: Dayjs | null;
  setValue: (key: DebtorsDrawerKey, value: string | undefined) => void;
  /** Commit many keys atomically in one URL update — used by the drawer. */
  setMany: (entries: Record<string, string | undefined>) => void;
  setCurrency: (currency: Currency) => void;
  setTillDate: (date: Dayjs | null) => void;
  clearKeys: (keys: string[]) => void;
  clearAll: () => void;
  /** How many drawer filters are active — for the Filters button badge. */
  drawerActiveCount: number;
}

export const useDebtorsFilters = (): DebtorsFiltersState => {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const out = {} as Record<DebtorsDrawerKey, string | undefined>;
    for (const k of DEBTORS_DRAWER_KEYS) out[k] = params.get(k) ?? undefined;
    return out;
  }, [params]);

  const currency: Currency = params.get("currency") === "USD" ? "USD" : "INR";

  const tillDate = useMemo<Dayjs | null>(() => {
    const raw = params.get("tillDate");
    if (!raw) return null;
    const d = dayjs(raw);
    return d.isValid() ? d : null;
  }, [params]);

  const apiParams = useMemo<DebtorsParams>(() => {
    const out: Record<string, string> = {};
    for (const k of ALL_KEYS) {
      const v = params.get(k);
      if (v) out[k] = v;
    }
    return out as DebtorsParams;
  }, [params]);

  const setKey = useCallback(
    (key: string, value: string | undefined) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!value) out.delete(key);
          else out.set(key, value);
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setValue = useCallback(
    (key: DebtorsDrawerKey, value: string | undefined) => setKey(key, value),
    [setKey],
  );

  // One updater applies every entry — a per-key loop would not compose, since
  // React Router's functional updater closes over the render-time params.
  const setMany = useCallback(
    (entries: Record<string, string | undefined>) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(entries)) {
            if (!v) out.delete(k);
            else out.set(k, v);
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // INR is the default — store it as an absent param so the URL stays clean.
  const setCurrency = useCallback(
    (c: Currency) => setKey("currency", c === "INR" ? undefined : c),
    [setKey],
  );

  const setTillDate = useCallback(
    (date: Dayjs | null) => setKey("tillDate", date ? date.format(FMT) : undefined),
    [setKey],
  );

  const clearKeys = useCallback(
    (keys: string[]) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          for (const k of keys) out.delete(k);
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clearAll = useCallback(() => clearKeys(ALL_KEYS), [clearKeys]);

  const drawerActiveCount = DEBTORS_DRAWER_KEYS.filter((k) => Boolean(values[k])).length;

  return {
    params: apiParams,
    values,
    currency,
    tillDate,
    setValue,
    setMany,
    setCurrency,
    setTillDate,
    clearKeys,
    clearAll,
    drawerActiveCount,
  };
};
