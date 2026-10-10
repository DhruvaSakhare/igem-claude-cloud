import "./PageHero.css";
import { useState, type CSSProperties } from "react";

/* =============================================================================
 * PageHero — the full-screen hero at the top of every subpage
 * (Description, Results, Experiments, Notebook, Education…).
 *
 *        [windmill]      Title           [windmill]
 *        [  left  ]      Lead text       [  right ]
 *        [        ]    [ page icon ]     [        ]
 *
 * Title, lead and icon all come from the page's entry in pages.ts
 * (`title`, `lead`, `illustration`). App.tsx decides which pages get it.
 * ========================================================================== */

/* The two windmill drawings. Change these if the uploaded files end up with a
   different folder or extension (e.g. .png instead of .avif). */
const WINDMILL_LEFT =
  "https://static.igem.wiki/teams/6060/wiki/header-illustrations/windmill-left.avif";
const WINDMILL_RIGHT =
  "https://static.igem.wiki/teams/6060/wiki/header-illustrations/windmill-right.avif";

export type ArtBox = [number, number, number, number];

export interface PageIllustration {
  img: string;
  /** Where the drawing sits on its canvas, [left, top, right, bottom] in %. */
  box?: ArtBox;
  /** Canvas width / height, only when the file is not 4:3. */
  aspect?: number;
  /**
   * Make this page's icon bigger (or smaller) than the rest, e.g. 1.3 = 30%
   * bigger. Widens the icon's frame, so the drawing is never cropped.
   */
  scale?: number;
}

interface PageHeroProps {
  title: string;
  lead: string;
  illustration?: PageIllustration;
  /** Full-width pages sit flush against the hero, with no gap below it. */
  noMargin?: boolean;
}

const DEFAULT_CANVAS_ASPECT = 2160 / 1620; // most illustrations are 4:3
const ICON_FRAME_ASPECT = 4 / 3; // must match aspect-ratio in PageHero.css
const ICON_FILL = 0.9; // how much of the frame the drawing may fill

/**
 * The illustrations have very different amounts of empty canvas around the
 * drawing, so crop to the drawing itself (its `box`) and scale that to fit the
 * frame — like object-fit: contain, but on the drawing rather than the file.
 */
export function iconStyle(
  [l, t, r, b]: ArtBox,
  canvasAspect: number = DEFAULT_CANVAS_ASPECT,
): CSSProperties {
  const cw = (r - l) / 100;
  const ch = (b - t) / 100;
  const contentAspect = (cw * canvasAspect) / ch;

  const imgW =
    contentAspect >= ICON_FRAME_ASPECT
      ? ICON_FILL / cw
      : (ICON_FILL / ch) * (canvasAspect / ICON_FRAME_ASPECT);
  const imgH = imgW * (ICON_FRAME_ASPECT / canvasAspect);

  const cx = (l + r) / 200;
  const cy = (t + b) / 200;
  return {
    width: `${imgW * 100}%`,
    height: `${imgH * 100}%`,
    left: `${(0.5 - cx * imgW) * 100}%`,
    top: `${(0.5 - cy * imgH) * 100}%`,
  };
}

/** A windmill that quietly disappears if its file isn't uploaded yet. */
function Windmill({ src, side }: { src: string; side: "left" | "right" }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`page-hero-windmill page-hero-windmill-${side}`}>
      {!missing && (
        <img src={src} alt="" onError={() => setMissing(true)} />
      )}
    </div>
  );
}

export function PageHero({ title, lead, illustration, noMargin }: PageHeroProps) {
  return (
    <header className={`page-hero${noMargin ? " page-hero-flush" : ""}`}>
      <Windmill src={WINDMILL_LEFT} side="left" />

      <div className="page-hero-center">
        <h1 className="page-hero-title">{title}</h1>
        {lead && <p className="page-hero-lead">{lead}</p>}

        {illustration?.img && (
          <div
            className="page-hero-icon"
            style={
              { "--icon-scale": illustration.scale ?? 1 } as CSSProperties
            }
          >
            <img
              src={illustration.img}
              alt=""
              style={iconStyle(
                illustration.box ?? [0, 0, 100, 100],
                illustration.aspect,
              )}
            />
          </div>
        )}
      </div>

      <Windmill src={WINDMILL_RIGHT} side="right" />
    </header>
  );
}
