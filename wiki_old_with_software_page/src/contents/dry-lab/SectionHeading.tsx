import "./SectionHeading.css";

/* ========================================================================== *
 *  Shared section headings for the four Dry Lab pages
 *
 *  Centred, navy, title only. Both components used to take a bold `subtitle`
 *  and a muted grey `lead` as well; both were dropped, so a heading is now just
 *  its name.
 *
 *  The TOC indexes `section[id] h1`, so:
 *    • SectionHeading renders an <h1> and APPEARS in the contents.
 *    • SubsectionHeading renders no <h1>. Subsections reach the contents a
 *      different way: put `data-toc-title` on the wrapper element and the TOC
 *      nests it under its parent section (see components/TOC.tsx).
 * ========================================================================== */

/** Heading for a numbered section: the <h1> the TOC picks up. */
export function SectionHeading({ title }: { title: string }) {
  return (
    <header className="dlh">
      <h1 className="dlh-title">{title}</h1>
    </header>
  );
}

/** Heading for a subsection nested inside a section. One size down, no <h1>.
 *
 *  `plain` keeps the size but drops the bold, for a label that sits at this
 *  size without being a subsection of the page — the two structure-viewer
 *  titles on the Discovery page. Weight is then the only thing telling the two
 *  apart, so the size stays defined once (see SectionHeading.css) and a real
 *  subsection heading still reads as the heavier of the two. */
export function SubsectionHeading({
  title,
  plain,
}: {
  title: string;
  plain?: boolean;
}) {
  return (
    <header className="dlh dlh-sub">
      <p className={`dlh-sub-title${plain ? " dlh-plain" : ""}`}>{title}</p>
    </header>
  );
}
