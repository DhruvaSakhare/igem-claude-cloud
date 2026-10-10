import type { ReactNode } from "react";

import ReferenceBar from "../../components/ReferenceBar";
import { descriptionEntry } from "./descriptionReferences";
import type { DescriptionCitationKey } from "./descriptionReferences";
import { descriptionReferenceNodes, href } from "./descriptionReferenceNodes";
// The Dry Lab citation styles (.cite, .cite-entry, …), imported as-is so the
// references on this page read exactly like the ones on the Model pages.
import "../dry-lab/Cite.css";

/* ========================================================================== *
 *  Citations for the Project Description page
 *
 *  The same author–year idiom as contents/dry-lab/Cite.tsx, but reading this
 *  page's own list (descriptionReferences.ts), which holds web pages and
 *  DOI-less articles the Dry Lab bibliography has no room for. A key that is
 *  not in that list does not compile.
 * ========================================================================== */

/** Inline citation. One id renders "(Dolz et al., 2022)"; several render
 *  "(Siemens Gamesa; WindEurope)", each name linked to its source. */
export function DescCite({ ids }: { ids: DescriptionCitationKey[] }) {
  const parts = ids.map((id, i) => {
    const e = descriptionEntry(id);
    const link = href(e);
    const label = e.short;
    const body = link ? (
      <a
        className="cite"
        href={link}
        target="_blank"
        rel="noreferrer"
        title={e.title ?? e.short}
      >
        {label}
      </a>
    ) : (
      <span className="cite desc-cite-plain" title={e.title ?? e.short}>
        {label}
      </span>
    );
    return (
      <span key={id}>
        {i > 0 ? "; " : null}
        {body}
      </span>
    );
  });
  return <span className="desc-cite-group">({parts})</span>;
}

/** Visible marker for an unresolved problem in the source text. Kept on the
 *  page on purpose, so it cannot be forgotten before the wiki freeze. */
export function Todo({ children }: { children: ReactNode }) {
  return <span className="desc-todo">[{children}]</span>;
}

/** The page's References list: the site-wide ReferenceBar, filled from this
 *  page's own list. The heading is the section's <h1>, so the bar does not
 *  draw a second one. */
export function DescriptionReferences({
  ids,
}: {
  ids: readonly DescriptionCitationKey[];
}) {
  return (
    <ReferenceBar
      references={descriptionReferenceNodes(ids)}
      showTitle={false}
    />
  );
}
