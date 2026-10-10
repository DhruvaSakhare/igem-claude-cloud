import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import "./FigureNumbers.css";

/* ========================================================================== *
 *  Figure numbering (.numfigs / .numfig)
 *
 *  Numbers every `figure.numfig` inside a <NumberedFigures> root in page order,
 *  and lets the prose refer to those numbers without hard-coding them — so a
 *  figure added, removed or moved renumbers the captions AND the references to
 *  them, instead of leaving "see Figure 7" pointing at the wrong plot.
 *
 *  Two halves, which must agree on what counts as a figure:
 *    • the CAPTIONS are numbered by a CSS counter (FigureNumbers.css), so they
 *      are right from the first paint and need no JavaScript;
 *    • the REFERENCES (<FigNum>) are resolved after mount by walking the same
 *      `figure.numfig` elements in document order.
 *  Both count exactly `figure.numfig` in document order, so they give the same
 *  numbers. The one way they could part: an element with `display: none` is
 *  skipped by a CSS counter but not by the walk — so never hide a numbered
 *  figure; remove it.
 *
 *  To make a figure referenceable, give it (or any element wrapping a run of
 *  them, such as a figure row) a `data-fig` id, then write
 *  `Figure <FigNum of="that-id" />` in the prose. A wrapper resolves to the
 *  range of the figures inside it ("27–30"). An id that matches nothing renders
 *  "?", so a broken reference shows on the page rather than hiding.
 *
 *  TABLES are numbered the same way but on a counter of their own, so adding a
 *  table never shifts the figure numbers (or the other way round): a
 *  `table.numtab` gets "Table N." in front of its <caption>, and is referred to
 *  by a `data-tab` id and `Table <TabNum of="that-id" />`. The same rule about
 *  `display: none` applies.
 * ========================================================================== */

type Numbers = { fig: Record<string, string>; tab: Record<string, string> };

const FigureNumbersContext = createContext<Numbers>({ fig: {}, tab: {} });

/** Map each `[data-<attr>]` inside `root` to the number, or range, of the
 *  `selector` elements it is or contains, counted in document order. */
function numberTargets(
  root: HTMLElement,
  selector: string,
  attr: "fig" | "tab",
): Record<string, string> {
  const items = Array.from(root.querySelectorAll(selector));
  const found: Record<string, string> = {};
  root.querySelectorAll<HTMLElement>(`[data-${attr}]`).forEach((target) => {
    const inside = target.matches(selector)
      ? [target]
      : Array.from(target.querySelectorAll(selector));
    if (inside.length === 0) return;
    const first = items.indexOf(inside[0]) + 1;
    const last = items.indexOf(inside[inside.length - 1]) + 1;
    found[target.dataset[attr]!] =
      first === last ? `${first}` : `${first}–${last}`;
  });
  return found;
}

/** The root that numbering counts within. Renders the `div` it replaces, so it
 *  can stand in for an existing wrapper without adding a level to the DOM. */
export function NumberedFigures({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [numbers, setNumbers] = useState<Numbers>({ fig: {}, tab: {} });

  // Layout effect, so references are filled in before the first paint rather
  // than flashing "?". The figures are static once mounted, hence run once.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    setNumbers({
      fig: numberTargets(el, "figure.numfig", "fig"),
      tab: numberTargets(el, "table.numtab", "tab"),
    });
  }, []);

  return (
    <div ref={root} className={`numfigs${className ? ` ${className}` : ""}`}>
      <FigureNumbersContext.Provider value={numbers}>
        {children}
      </FigureNumbersContext.Provider>
    </div>
  );
}

/** The number (or range) of the figure(s) carrying `data-fig={of}`. Only the
 *  number — the word "Figure"/"Figures" stays in the prose around it. */
export function FigNum({ of }: { of: string }) {
  return <>{useContext(FigureNumbersContext).fig[of] ?? "?"}</>;
}

/** The number (or range) of the table(s) carrying `data-tab={of}`. Only the
 *  number — the word "Table"/"Tables" stays in the prose around it. */
export function TabNum({ of }: { of: string }) {
  return <>{useContext(FigureNumbersContext).tab[of] ?? "?"}</>;
}
