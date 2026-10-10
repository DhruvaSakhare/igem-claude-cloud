/**
 * ReferenceBar
 *
 * Collapsed, it shows the first references in full and fades the next one out to
 * signal there is more; the toggle expands the list to full strength. Lists of
 * two or fewer references are shown in full instead, since the fade would cover
 * the last reference without promising anything beyond it. The panel is
 * transparent, so it sits directly on the page background.
 *
 */

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

export interface ReferenceBarProps {
  /** One node per reference: plain string or JSX (italics, links). */
  references: ReactNode[];
  /** Header label. Defaults to "References". */
  title?: string;
  /** Pixels of the second reference left visible under the fade. Default 48. */
  peek?: number;
  /** Set false when the page already prints its own heading above the bar (the
   *  Dry Lab pages head the section with `SectionHeading`, which is also what
   *  puts it in the table of contents). The heading is then not drawn a second
   *  time, and `title` labels the region for assistive tech instead. */
  showTitle?: boolean;
}

/* Scoped styles. Every rule is prefixed `.refbar-`, so nothing leaks out. The
 * transitions sit here rather than in JS so the reduced-motion media query at
 * the end can switch them all off. */
const REFBAR_CSS = `
.refbar {
  margin: 2rem 0;
}

.refbar-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.1rem;
  color: var(--color-darkblue, #005075);
  font-weight: 700;
}

/* Sized in em so the badge tracks the heading: a single digit renders as a
   circle roughly as tall as the title text, longer counts widen into a pill. */
.refbar-count {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.7em;
  height: 1.7em;
  padding: 0 0.4em;
  border-radius: 999px;
  background: var(--color-darkblue, #005075);
  color: var(--color-white, #ffffff);
  font-size: 0.6em;
  font-weight: 700;
  line-height: 1;
}

.refbar-clip {
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.refbar-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.refbar-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  color: var(--color-dark, #353b40);
  font-size: 0.95rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.refbar-item p {
  margin: 0;
}

.refbar-num {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  margin-top: 0.15rem;
  border-radius: 50%;
  background: var(--color-darkblue, #005075);
  color: var(--color-white, #ffffff);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  user-select: none;
}

.refbar-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding: 0.35rem 0;
  border: none;
  background: transparent;
  color: var(--color-darkblue, #005075);
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease;
}

.refbar-toggle:hover {
  color: var(--color-orange, #ff6a14);
}

.refbar-toggle:hover .refbar-toggle-text {
  text-decoration: underline;
}

.refbar-toggle:focus-visible {
  outline: 2px solid var(--color-brightblue, #57caff);
  outline-offset: 3px;
  border-radius: 4px;
}

.refbar-chevron {
  display: inline-flex;
  transition: transform 0.2s ease;
}

.refbar-toggle[aria-expanded="true"] .refbar-chevron {
  transform: rotate(180deg);
}

.refbar-item a:focus-visible {
  outline: 2px solid var(--color-brightblue, #57caff);
  outline-offset: 2px;
  border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .refbar-clip,
  .refbar-toggle,
  .refbar-chevron {
    transition: none;
  }
}
`;

/** Measured layout used to size the collapsed view and place the fade. */
interface Metrics {
  /** Height of the whole list. */
  full: number;
  /** Height of the collapsed view: first reference, plus `peek`. */
  collapsed: number;
  /** Percentage of the collapsed view that stays fully opaque. */
  solid: number;
}

const EMPTY_METRICS: Metrics = { full: 0, collapsed: 0, solid: 100 };

export default function ReferenceBar({
  references,
  title = "References",
  peek = 48,
  showTitle = true,
}: ReferenceBarProps) {
  const baseId = useId(); // unique per instance: several bars per page are safe
  const listId = `${baseId}-list`;
  const titleId = `${baseId}-title`;

  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);

  const listRef = useRef<HTMLOListElement | null>(null);
  const firstRef = useRef<HTMLLIElement | null>(null);
  const secondRef = useRef<HTMLLIElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // The fade exists to advertise references beyond the one it covers, so it
  // only earns its place once a third reference is hidden behind it.
  const collapsible = references.length > 2;

  // Measures the list so the collapsed view ends part-way through reference two.
  // Runs before paint, and again on resize; the equality check stops an
  // unchanged measurement from causing another render.
  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const first = firstRef.current;
      if (!list || !first) return;

      const second = secondRef.current;
      const full = list.scrollHeight;
      // Distance between the two rows, so the gap between them is included.
      const collapsed = second
        ? second.offsetTop - first.offsetTop + peek
        : full;
      const solid =
        collapsed > 0
          ? Math.min(100, (first.offsetHeight / collapsed) * 100)
          : 100;

      setMetrics((prev) =>
        prev.full === full &&
        prev.collapsed === collapsed &&
        prev.solid === solid
          ? prev
          : { full, collapsed, solid },
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [references, peek]);

  // Escape collapses an expanded list and returns focus to the toggle.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open && collapsible) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  };

  if (references.length === 0) return null;

  const measured = metrics.collapsed > 0;
  const faded = collapsible && !open && measured;

  // The fade is a mask rather than a white overlay, so the list dissolves into
  // whatever colour the page behind it happens to be.
  const mask = `linear-gradient(to bottom, #000 ${metrics.solid}%, transparent 100%)`;
  // A list too short to collapse gets no height cap at all, so it cannot be
  // clipped if its content reflows after measuring.
  const clipStyle: CSSProperties = collapsible
    ? {
        maxHeight: open
          ? metrics.full || undefined
          : measured
            ? metrics.collapsed
            : undefined,
        maskImage: faded ? mask : undefined,
        WebkitMaskImage: faded ? mask : undefined,
      }
    : {};

  return (
    <section
      className="refbar"
      aria-labelledby={showTitle ? titleId : undefined}
      aria-label={showTitle ? undefined : title}
      onKeyDown={handleKeyDown}
    >
      {/* `href` + `precedence` let React 19 hoist this into <head> once, however
          many bars are on the page. */}
      <style href="reference-bar-styles" precedence="medium">
        {REFBAR_CSS}
      </style>

      {showTitle && (
        <h2 id={titleId} className="refbar-head">
          {title}
          <span className="refbar-count">{references.length}</span>
        </h2>
      )}

      {/* Expands when focus reaches a link inside the faded region, so keyboard
          users never land on something they cannot see. */}
      <div
        className="refbar-clip"
        style={clipStyle}
        onFocus={() => {
          if (collapsible && !open) setOpen(true);
        }}
      >
        {/* The list carries the numbering semantics; the badge repeats it
            visually, so it is hidden from assistive tech. */}
        <ol id={listId} ref={listRef} className="refbar-list">
          {references.map((reference, index) => (
            <li
              key={index}
              ref={index === 0 ? firstRef : index === 1 ? secondRef : undefined}
              className="refbar-item"
            >
              <span className="refbar-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>{reference}</div>
            </li>
          ))}
        </ol>
      </div>

      {collapsible && (
        <button
          ref={toggleRef}
          type="button"
          className="refbar-toggle"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="refbar-toggle-text">
            {open ? "Show fewer" : `Show all ${references.length} references`}
          </span>
          <span className="refbar-chevron" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      )}
    </section>
  );
}
