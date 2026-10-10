import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { CHANNEL_BASE } from "./channel-assets";

/* ========================================================================== *
 *  Channel-discovery figures (.chf-*)
 *
 *  Real CAVER tunnel plots, served from iGEM's asset host (required — no
 *  external CDNs). Each is `<CHANNEL_BASE>/<slug>/tunnel-1-r-shape.avif`: the
 *  plot is titled "Tunnel 1 (cross-section profile)" and shows R (Å) as +R and
 *  its mirror −R against distance along the tunnel, which is where the default
 *  caption below comes from.
 *
 *  Shared, so it lives here rather than on a page: the DISCOVERY page renders
 *  three rows of these (the two literature sets and the database candidates)
 *  and the ENGINEERING page one (the RFdiffusion designs). Every row is the
 *  same markup — they differ only in which structures they list and how many
 *  columns they use — so a change to the figure changes all four.
 *
 *  Extracted from model_discovery.tsx, where it used to be page-local, when the
 *  Engineering page needed the same figure. Same arrangement as MdFigures.tsx,
 *  and for the same reason: one definition, so two pages cannot drift apart.
 *
 *  Styling (.chf-fig, .chf-pdb, and the .chf-row the caller wraps these in) is
 *  in model_discovery.css. Nothing extra is needed on the Engineering page:
 *  every page is statically imported, so Vite emits ONE global CSS bundle and
 *  those rules are already present — the same property ChannelMethodsBox and
 *  `.model-bg` already rely on.
 *
 *  THE FIGURES ARE REAL; check a slug's plot answers 200 before adding a row.
 *  The host 403s a missing file, which paints a broken image rather than
 *  nothing.
 * ========================================================================== */

/** One tunnel cross-section figure.
 *
 *  `label` is what the reader sees above the plot and what the alt text names;
 *  `slug` is the upload path. They differ — "PaDa-I" is served from `5oxu/` —
 *  so both are passed rather than derived from one another. */
export function TunnelFigure({
  label,
  slug,
  caption,
}: {
  label: string;
  slug: string;
  /** What the figure is called under the plot. Defaults to what the plot
   *  itself is titled; the literature row passes the description its source
   *  document gives instead ("Selected channel for …"). */
  caption?: ReactNode;
}) {
  return (
    <figure className="chf-fig numfig">
      <span className="chf-pdb">{label}</span>
      <img
        src={`${CHANNEL_BASE}/${slug}/tunnel-1-r-shape.avif`}
        alt={`Tunnel 1 cross-section profile, ${label}`}
        loading="lazy"
      />
      <figcaption>{caption ?? "Tunnel 1 cross-section profile"}</figcaption>
    </figure>
  );
}

/** Several figures side by side on one line.
 *
 *  For a set that is one comparison rather than several findings: the same
 *  plot with and without its window, or the same points under three different
 *  fits. Read across, they answer "what changed?"; stacked down the page, the
 *  reader has to hold each one in their head to compare it with the next.
 *
 *  `cols` is the MAXIMUM number across, not a guarantee: the row is the same
 *  auto-fit grid the tunnel rows use (see .chf-row in model_discovery.css), so
 *  it drops to fewer columns and finally to one as the column narrows. Pass the
 *  number of figures you put in it.
 *
 *  A figure inside a row gives up its own width cap and centring — the grid
 *  cell sizes it instead. It still never renders past its own resolution.
 *
 *  Shared with TunnelFigure above, for the same reason: the Discovery page's
 *  overlay+dendrogram pairs and the Engineering page's generative-design pair
 *  are the same comparison shape, so one definition keeps them from drifting
 *  apart. Styling (.wfig, .wfig-row*) is in model_discovery.css, already in
 *  Vite's single global CSS bundle — see the file header above. */
export function FigureRow({
  cols,
  matchHeights,
  children,
}: {
  cols: 2 | 3;
  /** Give every plot in the row the SAME height, for figures of different
   *  shapes that would otherwise come out at different heights side by side.
   *  Each column is sized in proportion to its image's aspect ratio, so at
   *  equal heights nothing is stretched, cropped or padded. See
   *  .wfig-row-matched in model_discovery.css. */
  matchHeights?: boolean;
  children: ReactNode;
}) {
  const row = useRef<HTMLDivElement>(null);

  // The aspect ratios are read off the loaded images rather than written in,
  // so a plot re-uploaded at a new size still lines up without anyone having
  // to update a number. Until an image loads its figure counts as square.
  useEffect(() => {
    const el = row.current;
    if (!matchHeights || !el) return;
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>(".wfig img"));
    const measure = (img: HTMLImageElement) => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      img.parentElement?.style.setProperty(
        "--wfig-ar",
        String(img.naturalWidth / img.naturalHeight),
      );
    };
    const listeners = imgs.map((img) => {
      const onLoad = () => measure(img);
      measure(img);
      img.addEventListener("load", onLoad);
      return () => img.removeEventListener("load", onLoad);
    });
    return () => listeners.forEach((off) => off());
  }, [matchHeights]);

  return (
    <div
      ref={row}
      className={`wfig-row wfig-row-${cols}col${matchHeights ? " wfig-row-matched" : ""}`}
    >
      {children}
    </div>
  );
}

/** A single figure served from iGEM's asset host: the image, then the
 *  description the team's source document gives it, verbatim.
 *
 *  `alt` is separate from the caption and required, because the caption is
 *  written for someone who can see the plot ("the middle panel shows …") and
 *  is of little use as a substitute for it. Nothing here is decorative, so
 *  there is no empty-alt case to allow for.
 *
 *  `wide` drops the width cap, for a figure whose panels are stacked and would
 *  be unreadable at half width. */
export function WikiFigure({
  src,
  alt,
  wide,
  fig,
  children,
}: {
  src: string;
  alt: string;
  wide?: boolean;
  /** Id the prose refers to this figure by — see FigureNumbers.tsx. */
  fig?: string;
  children: ReactNode;
}) {
  return (
    <figure className={`wfig numfig${wide ? " wfig-wide" : ""}`} data-fig={fig}>
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>{children}</figcaption>
    </figure>
  );
}
