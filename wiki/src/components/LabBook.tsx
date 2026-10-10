import { useEffect, useLayoutEffect, useState } from "react";
import "./LabBook.css";
import type { NotebookWeek } from "../contents/wet-lab/notebook-data";
import DailyLog from "./DailyLog";
import { prefersReducedMotion } from "../utils/prefersReducedMotion";

// ─────────────────────────────────────────────────────────────────────────────
// THE LAB BOOK
//
// A physical notebook that opens and turns its pages. One SPREAD per week —
// the same weeks notebook-data.ts already groups the entries into — with the
// week's heading and summary on the left page and its daily logs on the right.
//
// HOW THE FLIP WORKS
//   The book is a stack of SHEETS hinged at the spine. Each sheet has two
//   faces, and a spread is made of two DIFFERENT sheets: the back of the sheet
//   you just turned (left page) and the front of the next one (right page).
//
//     sheet 0 front .............. the cover
//     sheet s back  + sheet s+1 front ....... spread for week s
//
//   so W weeks need W + 1 sheets. `flipped` is how many sheets have been turned:
//   0 is the closed book, s + 1 shows week s.
//
//   Every sheet rotates about the spine with the same duration, but each gets a
//   STAGGERED DELAY proportional to how far it is from where the book is going.
//   That is what makes jumping from April to June visibly riffle through many
//   pages instead of turning one — and what makes the edge stacks shift from
//   thin-left/thick-right to the reverse as it travels.
//
// ART
//   The cover is drawn. The paper, its ruling and the page-edge stacks are CSS
//   stand-ins until the artwork exists (see the drawing brief) — set the URLs
//   below and they take over, exactly as the landscape art did for the home
//   page. Nothing else needs to change.
// ─────────────────────────────────────────────────────────────────────────────

// === ART ===
const COVER_IMG =
  "https://static.igem.wiki/teams/6060/wiki/wetlab-notebook/labbook-wiki-notebook-red.avif";
// The back board. The same drawing as the front for now — mirrored in CSS where
// it needs to be, so the spine strip always falls on the spine side. Point this
// at its own file if a back is ever drawn separately.
const BACK_COVER_IMG = COVER_IMG;
// Set these once drawn; null keeps the CSS stand-in.
const PAGE_IMG: string | null = null;
const EDGE_STACK_IMG: string | null = null;

// === TUNEABLE ===
// One page's proportions, from the drawn cover (1283 × 1820). The open spread
// is two of these side by side.
const PAGE_ASPECT = 1283 / 1820;
// How long ONE sheet takes to turn.
const FLIP_MS = 620;
// Extra delay per sheet of distance travelled, so a long jump riffles. Capped so
// that crossing the whole season still resolves in a couple of seconds.
const STAGGER_MS = 70;
const MAX_TOTAL_MS = 2200;
// Widest the page-edge stack gets, as % of one page.
const EDGE_MAX_PCT = 9;

interface LabBookProps {
  weeks: NotebookWeek[];
  /** Spread to turn to, as an index into `weeks`. */
  spread: number;
  onSpreadChange: (index: number) => void;
  /** False until the reader opens the book — it starts closed on its cover. */
  open: boolean;
  onOpen: () => void;
  /** Shut the book again — offered once the reader is back at the first week. */
  onClose: () => void;
}

/**
 * DEV ONLY — watching the turn in slow motion.
 *
 * Add `?slowflip` to the URL and every page turn runs 10x slower, so a frame
 * that normally passes in a tenth of a second can be looked at, and
 * screenshotted. `?slowflip=30` sets the factor directly.
 *
 * Exists for the same reason ZoomToLandscape has `?scrub`: an animation that
 * only exists for half a second cannot be debugged by watching it at speed.
 * Returns 1 in normal use, so it can never affect the real wiki.
 */
function useFlipSlowdown(): number {
  if (typeof window === "undefined") return 1;
  const value = new URLSearchParams(window.location.search).get("slowflip");
  if (value === null) return 1;
  const factor = Number(value);
  return Number.isFinite(factor) && factor > 0 ? factor : 10;
}

export function LabBook({
  weeks,
  spread,
  onSpreadChange,
  open,
  onOpen,
  onClose,
}: LabBookProps) {
  const reduceMotion = prefersReducedMotion();
  const slowdown = useFlipSlowdown();
  const flipMs = FLIP_MS * slowdown;
  // Which end the book is shut at. Closing from the first week puts it down on
  // its front cover; closing from the last week closes it the other way, so the
  // reader is left looking at the back — the same gesture as finishing a real
  // book. Only meaningful while `open` is false.
  const [shutAt, setShutAt] = useState<"front" | "back">("front");
  // Reopening a book that was shut at the BACK would otherwise sweep every
  // sheet across the stage at once — the reader sees the whole block of pages
  // fly past before the cover even opens. Instead the book passes through the
  // shut-at-front state first, without animating, and then opens with the same
  // single-page turn it does from cold. Both shut states sit centred, so that
  // reset is invisible: the cover simply stays where it is.
  const [resetting, setResetting] = useState(false);

  // W weeks + the cover.
  const sheetCount = weeks.length + 1;

  // How many sheets are turned. 0 = closed on the cover; week s = s + 1.
  // Derived rather than stored: the book has no state of its own to fall out of
  // step with the spread it was asked for.
  const flipped = resetting
    ? 0
    : open
      ? spread + 1
      : shutAt === "back"
        ? sheetCount
        : 0;

  // Before paint, so the sweep is never drawn.
  useLayoutEffect(() => {
    if (open && shutAt === "back") {
      setResetting(true);
      setShutAt("front");
    }
  }, [open, shutAt]);

  // Two frames: one for the browser to apply the un-transitioned reset, the
  // next to start the opening turn from it. The timer is a fallback, because a
  // backgrounded tab never runs its animation frames — without it, opening the
  // book and switching away would leave it stuck shut on return.
  useEffect(() => {
    if (!resetting) return;
    const done = () => setResetting(false);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(done);
    });
    const fallback = window.setTimeout(done, 60);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      window.clearTimeout(fallback);
    };
  }, [resetting]);

  // THE TURN IN PROGRESS — which sheets are moving, and in which direction.
  //
  // Derived from state during render, NOT from a ref inside an effect. It used
  // to write `previous.current = flipped` at the top of an effect and compare
  // against it; React's StrictMode runs every effect twice in development, and
  // the second run read the ref the first had just written, found `from ===
  // flipped`, and cancelled the turn a few milliseconds after it began. The
  // page-edge strips reappeared mid-turn and the sheets dropped out of their
  // in-flight z-order — the whole reason those two fixes appeared not to work.
  // Deriving it from state is idempotent, so it behaves identically however
  // many times React replays a render.
  const [seen, setSeen] = useState(flipped);
  const [turning, setTurning] = useState<{ from: number; to: number } | null>(
    null,
  );
  if (seen !== flipped) {
    setSeen(flipped);
    setTurning(reduceMotion || resetting ? null : { from: seen, to: flipped });
  }

  // Cleared once the pages have landed, so the z-order and the edges settle.
  useEffect(() => {
    if (!turning) return;
    const distance = Math.abs(turning.to - turning.from) || 1;
    const total =
      flipMs +
      Math.min(STAGGER_MS, MAX_TOTAL_MS / distance) * distance * slowdown +
      80;
    const id = window.setTimeout(() => setTurning(null), total);
    return () => window.clearTimeout(id);
  }, [turning, flipMs, slowdown]);

  const inMotion = turning;

  const lo = inMotion ? Math.min(inMotion.from, inMotion.to) : 0;
  const hi = inMotion ? Math.max(inMotion.from, inMotion.to) : 0;
  const forward = inMotion ? inMotion.to > inMotion.from : true;

  // Opening and closing are the two turns where one half of the stage is EMPTY
  // for the duration: no page has landed on it yet. The page-edge stacks must
  // wait for the page rather than widen into that gap on their own — a lone
  // strip of paper edge floating beside an empty half is what it looks like
  // otherwise.
  const openingOrClosing =
    inMotion !== null &&
    (inMotion.from === 0 ||
      inMotion.to === 0 ||
      inMotion.from === sheetCount ||
      inMotion.to === sheetCount);

  // Hidden outright for the duration of that turn — not merely delayed. A
  // delay still leaves the strip free to appear if the timing drifts, and a
  // lone sliver of page edge beside an empty half is the one thing the eye
  // catches. It fades back in once the page has landed.
  const edgeDelay = openingOrClosing ? flipMs : 0;

  // Distance being travelled, used to stagger the sheets between here and there.
  const travel = hi - lo || 1;
  const stagger = Math.min(STAGGER_MS, MAX_TOTAL_MS / Math.max(travel, 1));

  // Page edges: the further into the book, the thicker the left stack.
  const progress = sheetCount > 1 ? flipped / (sheetCount - 1) : 0;
  const leftEdge = EDGE_MAX_PCT * progress;
  const rightEdge = EDGE_MAX_PCT * (1 - progress);

  const closed = !open;
  const closedAtBack = closed && shutAt === "back";
  const lastSpread = weeks.length - 1;
  const currentWeek =
    weeks[Math.min(Math.max(flipped - 1, 0), weeks.length - 1)];

  return (
    <div className="labbook-outer">
      <div
        className={`labbook ${
          closed
            ? `is-closed ${closedAtBack ? "is-closed-back" : "is-closed-front"}`
            : "is-open"
        } ${resetting ? "is-resetting" : ""}`}
        style={{ aspectRatio: `${PAGE_ASPECT * 2} / 1` }}
      >
        {/* NO BOARDS BEHIND THE STACK.
            An earlier version put a cover-sized board under each half. Because
            a board is exactly page-sized, it is completely hidden by the pages
            whenever the book is open — its only visible moment was the opening
            and closing turn, where it popped into the half the cover had not
            reached yet. The sheets carry the covers instead: sheet 0's front is
            the front, the last sheet's back is the back. */}

        {/* Page-edge stacks. Their widths are what make depth in the book
            readable at a glance — thin on the left near the start, thick near
            the end. */}
        <div
          className="labbook-edge labbook-edge-left"
          style={{
            opacity: openingOrClosing ? 0 : undefined,
            width: `${leftEdge}%`,
            transitionDelay: reduceMotion ? "0ms" : `${edgeDelay}ms`,
            backgroundImage: EDGE_STACK_IMG
              ? `url(${EDGE_STACK_IMG})`
              : undefined,
          }}
          aria-hidden="true"
        />
        <div
          className="labbook-edge labbook-edge-right"
          style={{
            opacity: openingOrClosing ? 0 : undefined,
            width: `${rightEdge}%`,
            transitionDelay: reduceMotion ? "0ms" : `${edgeDelay}ms`,
            backgroundImage: EDGE_STACK_IMG
              ? `url(${EDGE_STACK_IMG})`
              : undefined,
          }}
          aria-hidden="true"
        />

        {/* The sheets, drawn back to front. */}
        {Array.from({ length: sheetCount }, (_, i) => {
          const isFlipped = i < flipped;
          const inFlight = inMotion !== null && i >= lo && i < hi;

          // AT REST — turned sheets stack in the opposite order to unturned
          // ones, or the page being read would sit under the pile it came from.
          const restingZ = isFlipped ? i : sheetCount - i;

          // IN FLIGHT — lifted clear of both piles, and ordered among
          // themselves so the page that lands last ends up on top.
          const zIndex =
            (inFlight
              ? sheetCount + (forward ? i : sheetCount - i)
              : restingZ) + 1;

          // Pages turn in the order a hand would turn them: the one nearest
          // where the book is NOW goes first, the far one last. Ordering by
          // distance from the DESTINATION instead — which is what this did —
          // turned the pile back to front, so pages landed underneath ones
          // already lying there.
          const order = forward ? i - lo : hi - 1 - i;

          return (
            <div
              key={i}
              className={`labbook-sheet ${isFlipped ? "is-flipped" : ""}`}
              style={{
                zIndex,
                // Only the pages actually moving get promoted to their own
                // compositing layer; six permanently-promoted layers is what
                // makes a flip stutter on a laptop.
                willChange: inFlight ? "transform" : "auto",
                transitionDuration:
                  reduceMotion || resetting ? "0ms" : `${flipMs}ms`,
                transitionDelay:
                  reduceMotion || resetting || !inFlight
                    ? "0ms"
                    : `${order * stagger * slowdown}ms`,
              }}
            >
              {/* FRONT — the cover on sheet 0, otherwise a right-hand page. */}
              <div className="labbook-face labbook-face-front">
                {i === 0 ? (
                  <img
                    className="labbook-cover"
                    src={COVER_IMG}
                    alt={closed ? "Our lab notebook, closed" : ""}
                  />
                ) : (
                  <Page side="right" week={weeks[i - 1]} img={PAGE_IMG} />
                )}
              </div>

              {/* BACK — a left-hand page, except on the last sheet, whose back
                  is the back cover: it is what the reader is left facing once
                  the book is closed from the final week. */}
              <div className="labbook-face labbook-face-back">
                {i === sheetCount - 1 ? (
                  <img
                    className="labbook-cover labbook-cover-back"
                    src={BACK_COVER_IMG}
                    alt={closedAtBack ? "Our lab notebook, closed" : ""}
                  />
                ) : (
                  <Page side="left" week={weeks[i]} img={PAGE_IMG} />
                )}
              </div>
            </div>
          );
        })}
        {/* The way in. Sits on the cover while the book is shut, and is the
            only control offered until it is opened. */}
        {/* Held back until the pages have actually landed. It used to mount the
            instant the book was asked to close, so an orange pill appeared over
            a book still in mid-turn — and when closing from the last week it
            sits on the LEFT half, which is exactly where that stray orange was
            coming from. */}
        {closed && (
          <button
            type="button"
            className={`labbook-open ${
              closedAtBack ? "labbook-open-back" : ""
            } ${inMotion ? "is-waiting" : ""}`}
            onClick={onOpen}
            aria-hidden={inMotion !== null}
            tabIndex={inMotion !== null ? -1 : undefined}
          >
            Explore our work
          </button>
        )}
      </div>

      {/* Controls. The calendar drives the book too, but the book has to be
          usable on its own — and with a keyboard. Hidden while shut: there is
          nothing to page through yet. */}
      <div className="labbook-controls" hidden={closed}>
        {/* At the first week there is no previous page — so the same control
            shuts the book instead of sitting there disabled. */}
        <button
          type="button"
          onClick={() => {
            if (spread > 0) return onSpreadChange(spread - 1);
            setShutAt("front");
            onClose();
          }}
        >
          <span className="pi pi-chevron-left" aria-hidden="true" />{" "}
          {spread > 0 ? "Previous week" : "Close the book"}
        </button>
        <p className="labbook-position" aria-live="polite">
          Week {currentWeek.weekNumber} · {currentWeek.dateRange}
        </p>
        {/* At the last week there is no next page — so this shuts the book the
            other way up, leaving the reader on the back cover. */}
        <button
          type="button"
          onClick={() => {
            if (spread < lastSpread) return onSpreadChange(spread + 1);
            setShutAt("back");
            onClose();
          }}
        >
          {spread < lastSpread ? "Next week" : "Close the book"}{" "}
          <span className="pi pi-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** One page of the book. Left carries the week's heading and summary, right
 *  carries its daily logs — so the reader always knows which week they are in
 *  without scrolling. */
function Page({
  side,
  week,
  img,
}: {
  side: "left" | "right";
  week?: NotebookWeek;
  img: string | null;
}) {
  return (
    <div
      className={`labbook-page labbook-page-${side}`}
      style={img ? { backgroundImage: `url(${img})` } : undefined}
    >
      <div className="labbook-page-inner">
        {!week ? null : side === "left" ? (
          <>
            <h2 className="labbook-week-title">Week {week.weekNumber}</h2>
            <p className="labbook-week-dates">{week.dateRange}</p>
            {week.summary && <p className="labbook-summary">{week.summary}</p>}
            <p className="labbook-count">
              {week.entries.length}{" "}
              {week.entries.length === 1 ? "entry" : "entries"}
            </p>
          </>
        ) : (
          week.days.map((day, index) => (
            <div key={day.date} className="labbook-day">
              {index > 0 && <hr className="labbook-day-divider" />}
              {day.entries.map((entry, entryIndex) => (
                <div
                  key={`${entry.date}-${entryIndex}`}
                  className="labbook-entry"
                >
                  <DailyLog entry={entry} />
                  {entry.result && (
                    <a className="labbook-result" href={entry.result.href}>
                      <span className="labbook-circle" aria-hidden="true" />
                      {entry.result.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LabBook;

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE ARTWORK STILL NEEDS (see the drawing brief)
//
//   PAGE_IMG        one page of paper, 1280 × 1816, ruling and margin only —
//                   no lettering, no shadows. Used for BOTH faces of every
//                   sheet; the left page is this file mirrored in CSS.
//   EDGE_STACK_IMG  the fan of page edges at full thickness, 380 × 1816. It is
//                   revealed outward from the spine, so it must be uniform
//                   along its width.
//
// Both are drop-in: set the constant at the top of this file and the CSS
// stand-in gets out of the way.
// ─────────────────────────────────────────────────────────────────────────────
