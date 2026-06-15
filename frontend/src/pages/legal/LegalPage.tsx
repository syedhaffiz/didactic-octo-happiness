import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ErrorRetry } from "../../components/ErrorRetry";
import { LegalSummaryCards } from "../../components/legal/LegalSummaryCards";
import { LegalTabsNav, useLegalTab } from "../../components/legal/LegalTabsNav";
import { CriticalCasesListCard } from "../../components/legal/CriticalCasesListCard";
import { CriticalIssuesCard } from "../../components/legal/CriticalIssuesCard";
import { CaseDetailsModal } from "../../components/legal/CaseDetailsModal";
import { legalApi } from "../../api/legal";
import { useApi } from "../../api/useApi";
import { useUrlDateRange, useUrlParam } from "../../utils/useUrlParam";

// Single Legal page — segmented control switches between "Critical Cases"
// and "Critical Issues" via the `?tab=` URL param (default = critical-cases).
// Page chrome (header, summary, tabs) renders once; only the table card
// swaps. The Case Details modal coexists via `?case=`.
//
// Date range: defaults to "today − 1 month → today" when the user hasn't set
// one (URL stays clean). Setting the picker writes to the URL; clearing it
// reverts to the default.

const RANGE_FORMAT = "YYYY-MM-DD";
const PILL_FORMAT = "DD MMM YY";

const formatPill = (start: Dayjs, end: Dayjs) =>
  `${start.format(PILL_FORMAT)} – ${end.format(PILL_FORMAT)}`;

export const LegalPage = () => {
  const [dateRange, setDateRange, rawRange] = useUrlDateRange();
  const [tab] = useLegalTab();
  const [caseNo, setCaseNo] = useUrlParam("case");

  // Stable "now" so the default range doesn't drift across re-renders.
  const today = useMemo(() => dayjs(), []);
  const defaultStart = useMemo(() => today.subtract(1, "month"), [today]);

  const effectiveStart = dateRange?.[0] ?? defaultStart;
  const effectiveEnd = dateRange?.[1] ?? today;
  const effectiveRangeRaw =
    rawRange ??
    `${defaultStart.format(RANGE_FORMAT)}:${today.format(RANGE_FORMAT)}`;

  // Both queries fire regardless of active tab — payloads are tiny and we
  // avoid a fetch-on-switch lag when the user toggles tabs.
  const summary = useApi(["legal", "summary", effectiveRangeRaw], () =>
    legalApi.summary({ dateRange: effectiveRangeRaw }),
  );
  const cases = useApi(["legal", "critical-cases", effectiveRangeRaw], () =>
    legalApi.criticalCases({ dateRange: effectiveRangeRaw }),
  );
  const issues = useApi(["legal", "critical-issues", effectiveRangeRaw], () =>
    legalApi.criticalIssues({ dateRange: effectiveRangeRaw }),
  );

  const isIssues = tab === "critical-issues";

  return (
    <>
      <PageHeader
        title="Legal"
        datePill={formatPill(effectiveStart, effectiveEnd)}
        filters={
          <DateRangeFilter
            value={[effectiveStart, effectiveEnd]}
            onChange={setDateRange}
          />
        }
      />

      <LegalSummaryCards summary={summary.data} loading={summary.isLoading} />

      <LegalTabsNav />

      {isIssues ? (
        issues.isError ? (
          <ErrorRetry
            title="Could not load critical issues"
            error={issues.error}
            onRetry={issues.refetch}
          />
        ) : (
          <CriticalIssuesCard items={issues.data?.items} loading={issues.isLoading} />
        )
      ) : cases.isError ? (
        <ErrorRetry
          title="Could not load critical cases"
          error={cases.error}
          onRetry={cases.refetch}
        />
      ) : (
        <CriticalCasesListCard
          items={cases.data?.items}
          loading={cases.isLoading}
          onOpenDetails={(no) => setCaseNo(no)}
        />
      )}

      <CaseDetailsModal caseNo={caseNo} onClose={() => setCaseNo(undefined)} />
    </>
  );
};
