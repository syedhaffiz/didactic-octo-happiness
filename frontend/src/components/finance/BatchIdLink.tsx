import { ExportOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { brand } from "../../theme/tokens";

// Vessel-table cell rendering the Batch ID as an accent-blue link with the
// little "open in new" icon, navigating to the batch detail under the given
// base path. Reusable for any future table that needs a clickable id cell.
export const BatchIdLink = ({
  batchId,
  basePath,
}: {
  batchId: string;
  basePath: string;
}) => (
  <Link
    to={`${basePath}/${encodeURIComponent(batchId)}`}
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
