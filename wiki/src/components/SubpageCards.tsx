import "./SubpageCards.css";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

/* =============================================================================
 * SubpageCards — one illustrated, clickable card per subpage.
 *
 * Used in page heroes to link to that page's subpages. Shared so every page
 * gets the same cards; restyle it for one page with the CSS variables listed in
 * SubpageCards.css, set on a wrapper or passed through `className`/`style`.
 *
 * WHY THE CROPPING
 *   The header illustrations are 2160×1620 canvases with very different amounts
 *   of empty space around each drawing. Shown as-is they come out at wildly
 *   different sizes, so each card crops to the drawing itself. `box` is where
 *   the drawing sits on its canvas, [left, top, right, bottom] in %, measured
 *   from the file. Re-measure if an illustration is re-exported.
 * ========================================================================== */

export type ArtBox = [number, number, number, number];

export interface Subpage {
  to: string;
  title: string;
  /** Header illustration. Omit to show a placeholder until the art exists. */
  img?: string;
  /** Where the drawing sits on its canvas. Omit to show the whole canvas. */
  box?: ArtBox;
  /**
   * Canvas shape of THIS illustration, as width / height — e.g. 466 / 310.
   * Only needed when the file is not the usual 4:3; without it a differently
   * shaped image is squashed to 4:3, because artFrame() sets both the width
   * and the height of the <img>.
   */
  aspect?: number;
}

const ART_CANVAS_ASPECT = 2160 / 1620; // width / height of the illustrations
const ART_FRAME_ASPECT = 4 / 3; // must match aspect-ratio in SubpageCards.css
const ART_FILL = 0.82; // how much of the frame the drawing may occupy

/**
 * Size and place an illustration so its drawing is centred and scaled to fit
 * the frame — object-fit: contain, but on the drawing's bounds rather than the
 * whole canvas.
 */
function artFrame(
  [l, t, r, b]: ArtBox,
  canvasAspect: number = ART_CANVAS_ASPECT,
): CSSProperties {
  const cw = (r - l) / 100;
  const ch = (b - t) / 100;
  const contentAspect = (cw * canvasAspect) / ch;

  // Image width as a fraction of the frame, limited by whichever side of the
  // drawing would reach the frame edge first.
  const imgW =
    contentAspect >= ART_FRAME_ASPECT
      ? ART_FILL / cw
      : (ART_FILL / ch) * (canvasAspect / ART_FRAME_ASPECT);
  const imgH = imgW * (ART_FRAME_ASPECT / canvasAspect);

  const cx = (l + r) / 200;
  const cy = (t + b) / 200;
  return {
    width: `${imgW * 100}%`,
    height: `${imgH * 100}%`,
    left: `${(0.5 - cx * imgW) * 100}%`,
    top: `${(0.5 - cy * imgH) * 100}%`,
  };
}

export function SubpageCards({
  pages,
  label = "Subpages",
  className,
  style,
}: {
  pages: Subpage[];
  /** Accessible name for the group of links. */
  label?: string;
  /** Extra class for per-page restyling. */
  className?: string;
  /** Inline overrides, e.g. { "--subpage-card-bg": "#123" }. */
  style?: CSSProperties;
}) {
  return (
    <nav
      className={`subpage-cards${className ? ` ${className}` : ""}`}
      aria-label={label}
      style={style}
    >
      {pages.map((p) => (
        <Link key={p.to} to={p.to} className="subpage-card">
          <span className="subpage-card-art">
            {p.img ? (
              <img
                src={p.img}
                alt=""
                style={artFrame(p.box ?? [0, 0, 100, 100], p.aspect)}
              />
            ) : (
              // Deliberately looks unfinished, so a missing illustration is
              // obvious in review and never mistaken for the final design.
              <span className="subpage-card-placeholder">Illustration</span>
            )}
          </span>
          <span className="subpage-card-title">{p.title}</span>
        </Link>
      ))}
    </nav>
  );
}
