import { SectionHeading } from "../SectionHeading";

// One labelled paragraph block (used twice in the modal — Brief Facts +
// Current Status). `white-space: pre-wrap` preserves all whitespace from the
// backend (newlines, indents, paragraph breaks) so the rendered text matches
// however the source data is formatted.
export const CaseTextSection = ({ title, body }: { title: string; body: string }) => (
  <section>
    <SectionHeading style={{ marginBottom: 6 }}>{title}</SectionHeading>
    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
      {body}
    </p>
  </section>
);
