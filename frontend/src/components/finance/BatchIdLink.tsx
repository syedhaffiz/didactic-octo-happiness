import { ExportOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { brand } from "../../theme/tokens";

// Vessel-table cell rendering the Batch ID as an accent-blue link with the
// little "open in new" icon, navigating to the batch detail under the given
// base path. Reusable for any future table that needs a clickable id cell.
//
// The list page's filters (date range, handling category, currency, tab) live
// in the query string, so we forward the current `search` onto the detail URL.
// That lets the detail page's breadcrumb link back to the list with the exact
// same filters applied instead of resetting them to defaults.
export const BatchIdLink = ({
  batchId,
  basePath,
}: {
  batchId: string;
  basePath: string;
}) => {
  const { search } = useLocation();
  return (
  <Link
    to={`${basePath}/${encodeURIComponent(batchId)}${search}`}
    style={{
      color: brand.accent,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    {batchId}
    <ExportOutlined style={{ fontSize: 12 }} />
  </Link>
  );
};
