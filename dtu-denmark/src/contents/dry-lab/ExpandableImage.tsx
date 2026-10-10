import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import "./ExpandableImage.css";

/* ========================================================================== *
 *  ExpandableImage — a plot with an "expand" button (.xim-*)
 *
 *  Renders the <img> exactly as before, wrapped in a block that carries a small
 *  expand button in its top-right corner. The button opens the same image in a
 *  full-screen viewer (portalled to <body>, so no card's overflow or stacking
 *  context can clip it), at up to the full window size, with its caption under
 *  it. A close button in the viewer's top-right corner — or Esc, or a click on
 *  the dimmed backdrop — closes it and returns focus to the expand button.
 *
 *  Used by every plot on the Model pages: WikiFigure and TunnelFigure
 *  (ChannelFigures.tsx) and the MD plots (MdFigures.tsx). The wrapper is a
 *  plain block, so the existing `.wfig img` / `.chf-fig img` / `.mdf-fig img`
 *  rules still size the image as they did.
 * ========================================================================== */
export function ExpandableImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  /** Shown under the image in the expanded view. */
  caption?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Lock the page behind the viewer, focus the close button, close on Esc.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const trigger = openBtn.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="xim">
      <img src={src} alt={alt} loading="lazy" />
      <button
        ref={openBtn}
        type="button"
        className="xim-btn xim-open"
        aria-label={`Expand figure: ${alt}`}
        title="Expand"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            className="xim-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <button
              ref={closeBtn}
              type="button"
              className="xim-btn xim-close"
              aria-label="Close expanded figure"
              title="Close"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <figure className="xim-figure">
              <img
                src={src}
                alt={alt}
                // Its aspect ratio lets the CSS scale it up to the largest size
                // that fits the window — small plots are enlarged too.
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight)
                    img.style.setProperty(
                      "--xim-ar",
                      String(img.naturalWidth / img.naturalHeight),
                    );
                }}
              />
              {caption ? <figcaption>{caption}</figcaption> : null}
            </figure>
          </div>,
          document.body,
        )}
    </div>
  );
}
