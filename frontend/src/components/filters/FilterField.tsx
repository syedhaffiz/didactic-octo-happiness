import type { ReactNode } from "react";
import { useBrandTokens } from "../../theme/useBrandTokens";

// Shared "label above a control" wrapper used by every page filter.
export const FilterField = ({
  label,
  width = 160,
  children,
}: {
  label: string;
  width?: number;
  children: ReactNode;
}) => {
  const t = useBrandTokens();
  return (
    <div style={{ minWidth: width }}>
      <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 2 }}>{label}</div>
      {children}
    </div>
  );
};
