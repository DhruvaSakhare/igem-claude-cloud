import type { ReactNode } from "react";

import "./DetailsBox.css";

/* ========================================================================== *
 *  DetailsBox — the "More details on …" collapsible
 *
 *  The Discovery page reports results; the method behind each one is folded
 *  into a box beside it, so a reader can have the detail without leaving the
 *  page and without it standing between them and the findings. The team's
 *  source documents mark these directly: a section headed "More details on the
 *  molecular docking methods" is one of these boxes, not a page heading.
 *
 *  Closed by default, on purpose — the box is the detail, the prose above it is
 *  the result.
 *
 *  It renders a plain <details>, so the browser handles the open/close state,
 *  keyboard operation and find-in-page (Chrome and Safari can open a closed
 *  <details> to reveal a match; a div toggled by JS cannot). Styling is the
 *  .cmbox-* rules in DetailsBox.css, which every box on the page shares.
 * ========================================================================== */
export function DetailsBox({
  label,
  children,
}: {
  /** The summary line. Written out in full ("More details on the molecular
   *  docking methods") rather than assembled from a fragment, so the label a
   *  reader sees is the one written in the file. */
  label: string;
  children: ReactNode;
}) {
  return (
    <details className="cmbox">
      <summary className="cmbox-toggle">
        <span className="cmbox-label">{label}</span>
        <span className="cmbox-chev" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="cmbox-body">{children}</div>
    </details>
  );
}
