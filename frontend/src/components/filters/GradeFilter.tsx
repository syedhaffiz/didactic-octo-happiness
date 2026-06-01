import { SelectFilter } from "./SelectFilter";

export const GradeFilter = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) => <SelectFilter label="Grade" kind="grades" value={value} onChange={onChange} />;
