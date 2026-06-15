import { SectionHeading } from "../SectionHeading";

// One labelled paragraph block (used twice in the modal — Brief Facts +
// Current Status). Preserves embedded newlines.
export const CaseTextSection = ({ title, body }: { title: string; body: string }) => (
  <section>
    <SectionHeading style={{ marginBottom: 6 }}>{title}</SectionHeading>
    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-line" }}>
      {body}
    </p>
  </section>
);
