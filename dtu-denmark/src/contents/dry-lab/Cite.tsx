import type { ReactNode } from "react";

import { entry } from "./bibliography";
import type { CitationKey } from "./bibliography";
import "./Cite.css";

/* ========================================================================== *
 *  Citations for the Dry Lab pages
 *
 *  Author–year rather than numbered, deliberately: the numbers in a numbered
 *  scheme have to stay in step with the order of a list somewhere else on the
 *  page, and they silently go wrong when a paragraph moves. "(Dolz et al.,
 *  2022)" carries its own meaning wherever it lands, and the reader can find it
 *  in the list without counting.
 *
 *  The inline citation and the page's reference list read the SAME
 *  bibliography.ts, so the two cannot disagree, and a key that is not in the
 *  bibliography does not compile.
 *
 *  The list itself is no longer rendered here. `ReferenceList` — a plain <ul>
 *  that these pages used to end on — was replaced by the site-wide
 *  `components/ReferenceBar`, which collapses a long list behind a fade. What
 *  stays here is `referenceNodes` below: it formats bibliography entries into
 *  the nodes that component takes, so the entries are still typed and still
 *  come from one source rather than being retyped into each page as JSX.
 *
 *  Page-local on purpose — this lives in contents/dry-lab/ rather than in
 *  components/, so it is not a site-wide component and nothing outside these
 *  pages is affected by changing it.
 * ========================================================================== */

/** Inline citation: "(Dolz et al., 2022)", linked to the paper's DOI. */
export function Cite({ id }: { id: CitationKey }) {
  const e = entry(id);
  return (
    <a
      className="cite"
      href={`https://doi.org/${e.doi}`}
      target="_blank"
      rel="noreferrer"
      title={`${e.title}${e.journal ? ` — ${e.journal}` : ""} (${e.year})`}
    >
      ({e.short})
    </a>
  );
}

/**
 * A page's references, formatted for `<ReferenceBar references={…} />`.
 *
 * `ids` is the page's own list, in the order it should be displayed — a page
 * cites a subset of the bibliography, and two pages citing the same work each
 * name it in their own list. Alphabetical by the short form is the usual
 * choice for author–year; pass them in whatever order you want them shown.
 *
 * ReferenceBar draws the list container, so what comes back is one node per
 * reference and no <ul>/<li> of our own. Each node keeps its `ref-<key>`
 * anchor, so an existing link to a specific reference still lands on it.
 */
export function referenceNodes(ids: readonly CitationKey[]): ReactNode[] {
  return ids.map((id) => {
    const e = entry(id);
    return (
      <span key={id} id={`ref-${id}`} className="cite-entry">
        <span className="cite-authors">{e.authors}</span> ({e.year}).{" "}
        <span className="cite-title">{e.title}</span>.{" "}
        {/* No journal on a preprint — print the title, then go straight to the
            DOI rather than leaving an empty italic gap and a stray comma. */}
        {e.journal ? (
          <>
            <i>{e.journal}</i>
            {e.volume ? <>, {e.volume}</> : null}
            {e.number ? <> ({e.number})</> : null}
            {e.pages ? <>, {e.pages}</> : null}.{" "}
          </>
        ) : null}
        <a
          className="cite-doi"
          href={`https://doi.org/${e.doi}`}
          target="_blank"
          rel="noreferrer"
        >
          doi:{e.doi}
        </a>
      </span>
    );
  });
}
