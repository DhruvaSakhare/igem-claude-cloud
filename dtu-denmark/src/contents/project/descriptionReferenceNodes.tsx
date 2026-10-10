import type { ReactNode } from "react";

import { Todo } from "./DescriptionCite";
import { descriptionEntry } from "./descriptionReferences";
import type {
  DescriptionCitationKey,
  DescriptionEntry,
} from "./descriptionReferences";

/* ========================================================================== *
 *  The Project Description's reference entries, formatted for ReferenceBar.
 *
 *  A file of its own (rather than in DescriptionCite.tsx) because that file
 *  exports components, and React fast refresh wants component files to export
 *  nothing else. Used by the Description page's References section and by the
 *  Engineering page, which cites a few of these works too.
 * ========================================================================== */

/** Where an entry links to: its DOI if it has one, otherwise its URL. */
export function href(e: DescriptionEntry): string | undefined {
  if (e.doi) return `https://doi.org/${e.doi}`;
  return e.url;
}

export function descriptionReferenceNodes(
  ids: readonly DescriptionCitationKey[],
): ReactNode[] {
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
            {e.number ? <> ({e.number})</> : null}
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
