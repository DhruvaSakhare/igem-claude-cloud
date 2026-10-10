import type { ReactNode } from "react";

import ReferenceBar from "../../components/ReferenceBar";
import { descriptionEntry } from "./descriptionReferences";
import type {
  DescriptionCitationKey,
  DescriptionEntry,
} from "./descriptionReferences";
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

function href(e: DescriptionEntry): string | undefined {
  if (e.doi) return `https://doi.org/${e.doi}`;
  return e.url;
}

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
  return <ReferenceBar references={referenceNodes(ids)} showTitle={false} />;
}

function referenceNodes(ids: readonly DescriptionCitationKey[]): ReactNode[] {
  return ids.map((id) => {
    const e = descriptionEntry(id);
    const link = href(e);
    return (
      <span key={id} id={`ref-${id}`} className="cite-entry">
        {e.authors ? <span className="cite-authors">{e.authors}</span> : null}
        {e.year ? <> ({e.year})</> : null}
        {e.authors || e.year ? ". " : null}
        {e.title ? (
          <>
            {/* No full stop after a title that already ends in "?" or "!". */}
            <span className="cite-title">{e.title}</span>
            {/[?!]$/.test(e.title) ? " " : ". "}
          </>
        ) : null}
        {e.journal ? (
          <>
            <i>{e.journal}</i>
            {e.volume ? <>, {e.volume}</> : null}
            {e.number ? <>({e.number})</> : null}
            {e.pages ? <>, {e.pages}</> : null}.{" "}
          </>
        ) : null}
        {e.source ? <>{e.source}. </> : null}
        {link ? (
          <a className="cite-doi" href={link} target="_blank" rel="noreferrer">
            {e.doi ? `doi:${e.doi}` : e.url}
          </a>
        ) : null}
        {e.todo ? (
          <>
            {" "}
            <Todo>TODO: {e.todo}</Todo>
          </>
        ) : null}
      </span>
    );
  });
}
