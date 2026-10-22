import { useState } from "react";
import { FilterDrawer } from "../../filters/FilterDrawer";
import { SelectFilter } from "../../filters/SelectFilter";
import { AGING_DRAWER_FIELDS, type AgingDrawerValues } from "./agingFilterFields";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Committed (URL) values — the draft is seeded from these on each open. */
  values: AgingDrawerValues;
  /** Commit every drawer field at once. */
  onApply: (next: AgingDrawerValues) => void;
}

const EMPTY: AgingDrawerValues = {
  zone: undefined,
  port: undefined,
  origin: undefined,
  segment: undefined,
  mine: undefined,
};

// Aging Filters side-panel: Zone / Port / Origin / Segment / Mine single-selects
// fed by the shared /filters catalogue. Edits stay in a local draft and only
// commit on "Apply filters"; "Cancel" discards and "Clear all" empties it.
export const AgingFilterDrawer = ({ open, onClose, values, onApply }: Props) => {
  const [draft, setDraft] = useState<AgingDrawerValues>(values);

  // Re-sync the draft to the committed values on each open transition. Done in
  // render (not an effect) so the panel always opens showing the live state.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(values);
  }

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <FilterDrawer open={open} onClose={onClose} onApply={apply} onClearAll={() => setDraft(EMPTY)}>
      {AGING_DRAWER_FIELDS.map((f) => (
        <SelectFilter
          key={f.key}
          label={f.label}
          kind={f.kind}
          value={draft[f.key]}
          onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
        />
      ))}
    </FilterDrawer>
  );
};
