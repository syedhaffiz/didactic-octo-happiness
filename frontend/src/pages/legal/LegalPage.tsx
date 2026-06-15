import { useState } from "react";
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
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

// Single Legal page — segmented control switches between "Critical Cases" and
// "Critical Issues" via the `?tab=` URL param. Page chrome (header, summary,
// tabs) renders once; only the table card swaps. The Case Details modal is
// opened/closed via local state — not URL-wired.
//
// Date range defaults to "today − 1 month → today" when the user hasn't set
// one; setting the picker writes to the URL, clearing it reverts to default.

export const LegalPage = () => {
  const { start, end, value, rawRange, setRange } = useDateRangeWithDefault(1);
  const [tab] = useLegalTab();
  const [selectedCase, setSelectedCase] = useState<string | undefined>(undefined);

  const summary = useApi(["legal", "summary", rawRange], () =>
    legalApi.summary({ dateRange: rawRange }),
  );
  const cases = useApi(["legal", "critical-cases", rawRange], () =>
    legalApi.criticalCases({ dateRange: rawRange }),
  );
  const issues = useApi(["legal", "critical-issues", rawRange], () =>
    legalApi.criticalIssues({ dateRange: rawRange }),
  );

  const isIssues = tab === "critical-issues";

  return (
    <>
      <PageHeader
        title="Legal"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
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
          onOpenDetails={setSelectedCase}
        />
      )}

      <CaseDetailsModal
        caseNo={selectedCase}
        onClose={() => setSelectedCase(undefined)}
      />
    </>
  );
};
