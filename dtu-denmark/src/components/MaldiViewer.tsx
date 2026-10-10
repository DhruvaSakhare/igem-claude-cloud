import { useEffect, useMemo, useRef, useState } from "react";
import "./MaldiViewer.css";

/* ===========================================================================
 * MALDI SPECTRUM VIEWER
 *
 * Plots MALDI-TOF spectra exported from the raw Bruker flex folders by
 * scripts/extract_maldi.py. Pick samples from the list, overlay them, drag to
 * zoom, hover to read a value, click an annotated peak for its note.
 *
 * WHERE THE DATA COMES FROM
 *   public/measurements/spectra/
 *     index.json   the sample list + metadata
 *     axis.json    the m/z axis, shared by every sample (same acquisition)
 *     <id>.json    one sample's intensities, same length as the axis
 *
 *   Spectra are fetched ONLY when first selected, so the page costs ~20 KB
 *   until someone asks for a trace.
 *
 * ANNOTATIONS ARE NOT FILLED IN. `PEAKS` below is empty on purpose: every
 * assignment has to come from your own interpretation, with a reference. See
 * the note above it before adding any.
 * ======================================================================== */

const DATA = `${import.meta.env.BASE_URL}measurements/spectra/`;

interface Sample {
  id: string;
  name: string;
  well: string;
  max: number;
  timepoint: string;
  strain: string;
  condition: string;
  replicate: string;
}

/* ── What each sample actually WAS ──────────────────────────────────────────
 * FILL THIS IN. The instrument files record only the plate position and the
 * folder name, so nothing in the data says which enzyme or substrate a sample
 * contained — only you know that.
 *
 * Every id below comes from the folder names; add the enzyme and substrate for
 * each. Whatever you write becomes a filter option, so keep the spelling
 * consistent ("UPO" and "Upo" would appear as two different enzymes).
 *
 * Use "—" for a sample where the field does not apply, e.g. a blank or a
 * calibrant. Anything left blank is listed under "unspecified".
 * ------------------------------------------------------------------------- */
interface SampleMeta {
  enzyme: string;
  substrate: string;
}

const SAMPLE_META: Record<string, SampleMeta> = {
  "ny-2hours-26002-lb2": { enzyme: "Itl03", substrate: "NNBT" },
  "ny-2hours-26013-lb2": { enzyme: "CueO", substrate: "NNBT" },
  "ny-2hours-heatshocked": { enzyme: "Laccase Control", substrate: "NNBT" },
  "ny-2hours-water": { enzyme: "—", substrate: "—" },
  "ny-30minutes-26002-lb2": { enzyme: "Itl03", substrate: "NNBT" },
  "ny-30minutes-26013-lb2": { enzyme: "CueO", substrate: "NNBT" },
  "ny-30minutes-heatshocked": { enzyme: "Laccase Control", substrate: "NNBT" },
  "ny-30minutes-water": { enzyme: "—", substrate: "—" },
  phosphor: { enzyme: "—", substrate: "—" },
};

/* ── Enzyme families ────────────────────────────────────────────────────────
 * The headers the enzyme toggles are grouped under. Add each enzyme name you
 * used in SAMPLE_META to the family it belongs to — spelled identically.
 *
 * Nothing in the data says which enzyme is a laccase and which is a UPO, so
 * this is the only place that knows, and the grouping is a scientific claim —
 * which is why it is left for you to fill in rather than guessed here.
 * Anything used in SAMPLE_META but not listed stays visible, under "Other".
 * ------------------------------------------------------------------------- */
const ENZYME_FAMILIES: { family: string; enzymes: string[] }[] = [
  { family: "Laccases", enzymes: [] },
  { family: "UPOs", enzymes: [] },
];

const UNSET = "unspecified";
const metaOf = (id: string): SampleMeta => ({
  enzyme: SAMPLE_META[id]?.enzyme || UNSET,
  substrate: SAMPLE_META[id]?.substrate || UNSET,
});

interface Index {
  source: string;
  points: number;
  data: string;
  samples: Sample[];
}

/* ── Annotated peaks ──────────────────────────────────────────────────────── */
interface Peak {
  /** Where the marker sits on the plot. */
  mz: number;
  /** Drawn on the plot, so keep it short. */
  label: string;
  /** Shown in the annotation list below the plot. */
  note: string;
  /**
   * Which spectra this annotation belongs to. Omit a field and it is not
   * restricted by it; omit all three and the peak is marked on every panel.
   *
   * A peak is drawn ONLY on the panels it applies to, so a product peak that
   * exists in one reaction and not another is marked in the one place it is
   * real — which is usually the point being made.
   */
  only?: {
    /** Sample ids, as listed in SAMPLE_META. */
    samples?: string[];
    enzyme?: string;
    substrate?: string;
  };
}

/** Does this annotation belong on this sample's panel? */
function peakApplies(peak: Peak, id: string) {
  const only = peak.only;
  if (!only) return true;
  const meta = metaOf(id);
  if (only.samples && !only.samples.includes(id)) return false;
  if (only.enzyme && meta.enzyme !== only.enzyme) return false;
  if (only.substrate && meta.substrate !== only.substrate) return false;
  return true;
}

const PEAKS: Peak[] = [
  {
    mz: 387.2,
    label: "387.2",
    note: "Dont remember.",
  },
  {
    mz: 246.3,
    label: "246.3",
    note: "NNBT addukt, why: ... reference: ...",
  },
  {
    mz: 224,
    label: "224",
    note: "NNBT, why: ... reference: ...",
  },
];

/* ── Colour ─────────────────────────────────────────────────────────────────
 * Fixed order, never cycled: a sample keeps its colour as others are toggled
 * on and off. Validated for colour-vision deficiency and for contrast against
 * the white plot surface (all six checks pass).
 * ------------------------------------------------------------------------- */
const SERIES_COLORS = [
  "#1b7fa8",
  "#e35d0a",
  "#2f9e6b",
  "#b1365b",
  "#7a5cc7",
  "#9a7b16",
];
const MAX_SERIES = SERIES_COLORS.length;

// Plot geometry, in SVG user units.
//
// The spectra are stacked as SMALL MULTIPLES — one panel each, sharing a single
// m/z axis along the bottom — rather than overlaid. Overlaid traces hide one
// another exactly where they differ most, which is the thing you are looking
// at; stacked, each spectrum is read on its own and the shared axis lines the
// peaks up vertically, so a difference between samples shows as a gap in a
// column.
const W = 1000;
const PANEL_H = 250; // one spectrum's plot area
const PANEL_GAP = 1; // breathing room between panels
// `bottom` has to hold BOTH the tick numbers and the "m/z" title below
// them. At 44 the title sat on the same line as the numbers and read as
// one of them.
const PAD = { top: 16, right: 16, bottom: 62, left: 64 };

/** Nicely spaced tick values covering [lo, hi]. */
function ticks(lo: number, hi: number, count = 6) {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * mag >= raw)! * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v);
  return out;
}

export function MaldiViewer() {
  const [index, setIndex] = useState<Index | null>(null);
  const [axis, setAxis] = useState<number[] | null>(null);
  const [traces, setTraces] = useState<Record<string, number[]>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [normalise, setNormalise] = useState(true);
  // Filters narrow the sample LIST; they never change what is already plotted,
  // so a spectrum cannot vanish from the figure because a filter moved.
  // Empty = no filter, i.e. everything shows. Several can be on at once.
  const [enzymeFilter, setEnzymeFilter] = useState<string[]>([]);
  const [substrateFilter, setSubstrateFilter] = useState<string[]>([]);

  const toggleIn = (
    set: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) =>
    set((xs) =>
      xs.includes(value) ? xs.filter((x) => x !== value) : [...xs, value],
    );
  const [showTable, setShowTable] = useState(false);
  const [zoom, setZoom] = useState<[number, number] | null>(null);
  const [drag, setDrag] = useState<[number, number] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [openPeak, setOpenPeak] = useState<Peak | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Spectra listed in the index whose file could not be fetched. One missing
  // file must not take the whole figure down with it — the rest still plot,
  // and the gap is shown honestly in the sample list rather than hidden.
  const [missing, setMissing] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  // Read inside the fetch callbacks, which close over stale state otherwise.
  const indexRef = useRef<Index | null>(null);
  const missingRef = useRef<string[]>([]);
  indexRef.current = index;
  missingRef.current = missing;

  // Index + axis once.
  useEffect(() => {
    Promise.all([
      fetch(DATA + "index.json").then((r) => r.json()),
      fetch(DATA + "axis.json").then((r) => r.json()),
    ])
      .then(([i, a]: [Index, number[]]) => {
        setIndex(i);
        setAxis(a);
        // Open on one real trace so the plot is never an empty box.
        if (i.samples.length) setSelected([i.samples[0].id]);
      })
      .catch(() => setError("Could not load the spectra."));
  }, []);

  // Each spectrum on first selection.
  useEffect(() => {
    selected.forEach((id) => {
      if (traces[id]) return;
      fetch(DATA + id + ".json")
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then((d: { intensity: number[] }) =>
          setTraces((t) => ({ ...t, [id]: d.intensity })),
        )
        .catch(() => {
          setMissing((m) => (m.includes(id) ? m : [...m, id]));
          // Drop it, and if that empties the plot, fall forward to the next
          // sample that has not already failed — so a gap at the top of the
          // list does not leave the figure blank on arrival.
          setSelected((sel) => {
            const kept = sel.filter((x) => x !== id);
            if (kept.length > 0) return kept;
            const next = indexRef.current?.samples.find(
              (sm) => sm.id !== id && !missingRef.current.includes(sm.id),
            );
            return next ? [next.id] : kept;
          });
        });
    });
  }, [selected, traces]);

  const colorOf = (id: string) =>
    SERIES_COLORS[selected.indexOf(id) % SERIES_COLORS.length];

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id)
        ? s.filter((x) => x !== id)
        : s.length >= MAX_SERIES
          ? s
          : [...s, id],
    );

  // Visible m/z window and the axis slice inside it.
  const [lo, hi] = zoom ?? [axis?.[0] ?? 0, axis?.[axis.length - 1] ?? 1];
  const slice = useMemo(() => {
    if (!axis) return { from: 0, to: 0 };
    let from = axis.findIndex((v) => v >= lo);
    let to = axis.findIndex((v) => v > hi);
    if (from < 0) from = 0;
    if (to < 0) to = axis.length;
    return { from, to };
  }, [axis, lo, hi]);

  /**
   * The value each panel's height represents, per sample.
   *
   * Normalised: each panel scales to its OWN tallest visible peak, so a weak
   * spectrum is still readable — but heights are then only comparable within a
   * panel, never between them.
   * Not normalised: every panel shares the tallest value across all of them, so
   * panel heights are directly comparable.
   *
   * Both follow the zoom, so zooming into a small peak fills the panel with it.
   */
  const scaleMax = useMemo(() => {
    const perSample: Record<string, number> = {};
    let shared = 0;
    selected.forEach((id) => {
      const t = traces[id];
      if (!t) return;
      let m = 0;
      for (let i = slice.from; i < slice.to; i++) m = Math.max(m, t[i]);
      perSample[id] = m || 1;
      shared = Math.max(shared, m);
    });
    if (normalise) return perSample;
    const flat: Record<string, number> = {};
    selected.forEach((id) => (flat[id] = shared || 1));
    return flat;
  }, [selected, traces, slice, normalise]);

  const plotW = W - PAD.left - PAD.right;
  // The whole figure grows with the number of spectra on show.
  const stackH = selected.length * (PANEL_H + PANEL_GAP);
  const H = PAD.top + stackH + PAD.bottom;
  const xOf = (mz: number) => PAD.left + ((mz - lo) / (hi - lo || 1)) * plotW;
  /** Top edge of panel `row`. */
  const panelTop = (row: number) => PAD.top + row * (PANEL_H + PANEL_GAP);
  /** Baseline of panel `row` — where intensity 0 sits. */
  const panelBase = (row: number) => panelTop(row) + PANEL_H;
  /** A value in panel `row`, against that panel's own scale. */
  const yOf = (row: number, v: number, scaleMax: number) =>
    panelBase(row) - (v / (scaleMax || 1)) * PANEL_H;

  /** One spectrum as an SVG path in its own panel, thinned to ~1 point/pixel. */
  const pathFor = (id: string, row: number) => {
    const t = traces[id];
    if (!t || !axis) return "";
    const n = slice.to - slice.from;
    const stride = Math.max(1, Math.floor(n / plotW));
    const max = scaleMax[id] ?? 1;
    let d = "";
    for (let i = slice.from; i < slice.to; i += stride) {
      d += `${d ? "L" : "M"}${xOf(axis[i]).toFixed(1)} ${yOf(row, t[i], max).toFixed(1)}`;
    }
    return d;
  };

  /** Pointer position as an m/z value. */
  const mzAt = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    const x = ((clientX - r.left) / r.width) * W;
    if (x < PAD.left || x > W - PAD.right) return null;
    return lo + ((x - PAD.left) / plotW) * (hi - lo);
  };

  const hoverReadout = useMemo(() => {
    if (hover == null || !axis) return null;
    let i = axis.findIndex((v) => v >= hover);
    if (i < 0) i = axis.length - 1;
    return selected
      .filter((id) => traces[id])
      .map((id) => ({
        id,
        name: index?.samples.find((s) => s.id === id)?.name ?? id,
        // Always the real count — the panel scaling is a display choice and
        // should never change the number someone reads off the plot.
        value: traces[id][i],
      }));
  }, [hover, axis, selected, traces, index]);

  const enzymes = index
    ? Array.from(new Set(index.samples.map((x) => metaOf(x.id).enzyme))).sort()
    : [];
  const substrates = index
    ? Array.from(
        new Set(index.samples.map((x) => metaOf(x.id).substrate)),
      ).sort()
    : [];
  const matchesFilters = (id: string) => {
    const m = metaOf(id);
    return (
      (enzymeFilter.length === 0 || enzymeFilter.includes(m.enzyme)) &&
      (substrateFilter.length === 0 || substrateFilter.includes(m.substrate))
    );
  };

  /** Enzymes present in the data, grouped under their declared families. */
  const enzymeGroups = (() => {
    const claimed = new Set(ENZYME_FAMILIES.flatMap((g) => g.enzymes));
    const groups = ENZYME_FAMILIES.map((g) => ({
      family: g.family,
      enzymes: g.enzymes.filter((e) => enzymes.includes(e)),
    })).filter((g) => g.enzymes.length > 0);
    const rest = enzymes.filter((e) => !claimed.has(e));
    if (rest.length) groups.push({ family: "Other", enzymes: rest });
    return groups;
  })();

  if (error) return <p className="maldi-error">{error}</p>;
  if (!index || !axis) return <p className="maldi-loading">Loading spectra…</p>;

  // Grouped sample list — timepoint, then the rest in file order.
  const groups = Array.from(new Set(index.samples.map((s) => s.timepoint)));
  const visiblePeaks = PEAKS.filter((p) => p.mz >= lo && p.mz <= hi);

  return (
    <div className="maldi">
      {/* Controls in one row above the plot. */}
      <div className="maldi-controls">
        <label className="maldi-toggle">
          <input
            type="checkbox"
            checked={normalise}
            onChange={(e) => setNormalise(e.target.checked)}
          />
          Normalise each spectrum to its tallest visible peak
        </label>
        <button
          type="button"
          className="maldi-btn"
          onClick={() => setZoom(null)}
          disabled={!zoom}
        >
          Reset zoom
        </button>
        <button
          type="button"
          className="maldi-btn"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
        >
          {showTable ? "Hide" : "Show"} values as a table
        </button>
      </div>

      {missing.length > 0 && (
        <p className="maldi-warning">
          {missing.length} spectr{missing.length === 1 ? "um is" : "a are"}{" "}
          listed but{" "}
          {missing.length === 1 ? "its data file is" : "their data files are"}{" "}
          missing, so {missing.length === 1 ? "it" : "they"} cannot be plotted.
          Re-run <code>scripts/extract_maldi.py</code> against the raw Bruker
          folders to restore {missing.length === 1 ? "it" : "them"}.
        </p>
      )}

      {/* ── Filters ────────────────────────────────────────────────────────
          Toggles rather than dropdowns: every option is visible at once, so
          what exists and what is active can both be read without opening
          anything. Several may be on together.

          These narrow the SAMPLE LIST only. Nothing already plotted is removed
          by a filter — a figure that silently loses a trace when a control
          changes is worse than one that needs a second click. */}
      {(enzymeGroups.length > 0 || substrates.length > 0) && (
        <div className="maldi-filters">
          {enzymeGroups.length > 0 && (
            <div className="maldi-filter-set">
              <p className="maldi-filter-head">
                Enzyme
                {enzymeFilter.length > 0 && (
                  <button
                    type="button"
                    className="maldi-clear"
                    onClick={() => setEnzymeFilter([])}
                  >
                    clear
                  </button>
                )}
              </p>
              {enzymeGroups.map((g) => (
                <div key={g.family} className="maldi-family">
                  <p className="maldi-family-head">{g.family}</p>
                  <div className="maldi-pills">
                    {g.enzymes.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className={
                          enzymeFilter.includes(e)
                            ? "maldi-pill is-on"
                            : "maldi-pill"
                        }
                        aria-pressed={enzymeFilter.includes(e)}
                        onClick={() => toggleIn(setEnzymeFilter, e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {substrates.length > 0 && (
            <div className="maldi-filter-set">
              <p className="maldi-filter-head">
                Substrate
                {substrateFilter.length > 0 && (
                  <button
                    type="button"
                    className="maldi-clear"
                    onClick={() => setSubstrateFilter([])}
                  >
                    clear
                  </button>
                )}
              </p>
              <div className="maldi-pills">
                {substrates.map((x) => (
                  <button
                    key={x}
                    type="button"
                    className={
                      substrateFilter.includes(x)
                        ? "maldi-pill is-on"
                        : "maldi-pill"
                    }
                    aria-pressed={substrateFilter.includes(x)}
                    onClick={() => toggleIn(setSubstrateFilter, x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="maldi-main">
        {/* ── Sample picker ──────────────────────────────────────────────── */}
        <div className="maldi-samples">
          <p className="maldi-samples-head">
            Samples{" "}
            <span className="maldi-count">
              {selected.length}/{MAX_SERIES}
            </span>
          </p>
          {groups.map((g) => {
            const inGroup = index.samples.filter(
              (s) =>
                s.timepoint === g &&
                (matchesFilters(s.id) || selected.includes(s.id)),
            );
            if (inGroup.length === 0) return null;
            return (
              <fieldset key={g} className="maldi-group">
                <legend>{g}</legend>
                {inGroup.map((s) => {
                  const on = selected.includes(s.id);
                  const gone = missing.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={
                        gone ? "maldi-sample is-missing" : "maldi-sample"
                      }
                      title={
                        gone
                          ? "This spectrum is listed in the index but its data file is missing."
                          : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={
                          gone || (!on && selected.length >= MAX_SERIES)
                        }
                        onChange={() => toggle(s.id)}
                      />
                      <span
                        className="maldi-swatch"
                        style={{
                          background: on ? colorOf(s.id) : "transparent",
                          borderColor: on ? colorOf(s.id) : "#9bb4c4",
                        }}
                        aria-hidden
                      />
                      {s.strain} {s.condition} {s.replicate}
                      {gone && (
                        <span className="maldi-missing-tag">no data</span>
                      )}
                    </label>
                  );
                })}
              </fieldset>
            );
          })}
        </div>

        {/* ── The plot ───────────────────────────────────────────────────── */}
        <div className="maldi-plot">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="maldi-svg"
            role="img"
            aria-label={`MALDI spectra, m/z ${lo.toFixed(0)} to ${hi.toFixed(0)}`}
            onPointerDown={(e) => {
              const mz = mzAt(e.clientX);
              if (mz != null) setDrag([mz, mz]);
            }}
            onPointerMove={(e) => {
              const mz = mzAt(e.clientX);
              setHover(mz);
              if (drag && mz != null) setDrag([drag[0], mz]);
            }}
            onPointerUp={() => {
              if (drag && Math.abs(drag[1] - drag[0]) > (hi - lo) / 200) {
                setZoom([Math.min(...drag), Math.max(...drag)]);
              }
              setDrag(null);
            }}
            onPointerLeave={() => {
              setDrag(null);
              setHover(null);
            }}
            onDoubleClick={() => setZoom(null)}
          >
            {/* One panel per spectrum, each with its own baseline, label and
                scale note. The m/z axis is drawn once, under the stack. */}
            {selected.map((id, row) => {
              const sample = index.samples.find((x) => x.id === id);
              const max = scaleMax[id] ?? 1;
              return (
                <g key={id}>
                  {/* Panel baseline — doubles as the zero line. */}
                  <line
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={panelBase(row)}
                    y2={panelBase(row)}
                    className="maldi-axis"
                  />
                  {/* Half-height gridline, so peak heights can be judged. */}
                  <line
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={yOf(row, max / 2, max)}
                    y2={yOf(row, max / 2, max)}
                    className="maldi-grid"
                  />
                  {/* Direct label: identity never depends on colour alone. */}
                  <text
                    x={PAD.left + 6}
                    y={panelTop(row) + 13}
                    className="maldi-panel-label"
                    fill={colorOf(id)}
                  >
                    {sample
                      ? `${sample.strain} ${sample.condition}${sample.replicate} · ${sample.timepoint}`
                      : id}
                  </text>
                  {/* What this panel's full height is worth. */}
                  <text
                    x={PAD.left - 8}
                    y={panelTop(row) + 11}
                    className="maldi-tick maldi-tick-y"
                  >
                    {max >= 1000
                      ? Math.round(max / 1000) + "k"
                      : Math.round(max)}
                  </text>
                  <text
                    x={PAD.left - 8}
                    y={panelBase(row) + 4}
                    className="maldi-tick maldi-tick-y"
                  >
                    0
                  </text>
                  <path
                    d={pathFor(id, row)}
                    fill="none"
                    stroke={colorOf(id)}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}

            {/* The shared m/z axis, once, beneath every panel. */}
            {ticks(lo, hi).map((v) => (
              <g key={"x" + v}>
                <line
                  x1={xOf(v)}
                  x2={xOf(v)}
                  y1={PAD.top}
                  y2={PAD.top + stackH}
                  className="maldi-grid maldi-grid-v"
                />
                <text
                  x={xOf(v)}
                  y={PAD.top + stackH + 22}
                  className="maldi-tick"
                >
                  {v.toFixed(0)}
                </text>
              </g>
            ))}
            <text
              x={W / 2}
              y={PAD.top + stackH + 48}
              className="maldi-axis-label"
            >
              m/z
            </text>
            <text
              transform={`rotate(-90) translate(${-(PAD.top + stackH / 2)} 14)`}
              className="maldi-axis-label"
            >
              intensity (counts)
            </text>

            {/* Annotated peaks, drawn ONLY on the panels they apply to.
                A peak scoped to one enzyme or substrate is marked on those
                spectra alone, so the figure shows where it is real rather than
                implying every sample has it. */}
            {selected.map((id, row) =>
              visiblePeaks
                .filter((p) => peakApplies(p, id))
                .map((p) => (
                  <g
                    key={id + "-" + p.mz}
                    className={
                      openPeak?.mz === p.mz
                        ? "maldi-peak is-open"
                        : "maldi-peak"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPeak(openPeak?.mz === p.mz ? null : p);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Peak ${p.mz}: ${p.label}`}
                  >
                    <line
                      x1={xOf(p.mz)}
                      x2={xOf(p.mz)}
                      y1={panelTop(row)}
                      y2={panelBase(row)}
                      className="maldi-peak-line"
                    />
                    {/* Labelled once, on the top panel it applies to, so a
                        marker spanning several panels is not labelled over and
                        over down the stack. */}
                    {selected.findIndex((x) => peakApplies(p, x)) === row && (
                      <text
                        x={xOf(p.mz)}
                        y={panelTop(row) - 2}
                        className="maldi-peak-label"
                      >
                        {p.label}
                      </text>
                    )}
                  </g>
                )),
            )}

            {/* Crosshair while hovering. */}
            {hover != null && !drag && (
              <line
                x1={xOf(hover)}
                x2={xOf(hover)}
                y1={PAD.top}
                y2={PAD.top + stackH}
                className="maldi-crosshair"
              />
            )}

            {/* The drag-to-zoom band. */}
            {drag && (
              <rect
                x={xOf(Math.min(...drag))}
                width={Math.abs(xOf(drag[1]) - xOf(drag[0]))}
                y={PAD.top}
                height={stackH}
                className="maldi-band"
              />
            )}
          </svg>

          {/* Readout under the plot rather than a floating tooltip, so it never
              covers the trace it is describing. */}
          <div className="maldi-readout" aria-live="polite">
            {hover != null ? (
              <>
                <b>m/z {hover.toFixed(1)}</b>
                {hoverReadout?.map((r) => (
                  <span key={r.id} className="maldi-readout-item">
                    <span
                      className="maldi-swatch"
                      style={{ background: colorOf(r.id) }}
                      aria-hidden
                    />
                    {r.name}{" "}
                    {normalise ? r.value.toFixed(3) : Math.round(r.value)}
                  </span>
                ))}
              </>
            ) : (
              <span className="maldi-hint">
                Drag across the plot to zoom · double-click to reset
              </span>
            )}
          </div>

          {/* No legend: every panel carries its own name in its own colour,
              so identity never depends on matching a swatch to a trace. */}
        </div>
      </div>

      {/* ── Annotations ───────────────────────────────────────────────────
          Every annotated peak's note is shown here permanently, not behind a
          click: these notes ARE the interpretation of the figure, and a reader
          should not have to discover that the markers are clickable to find
          them. Clicking a marker on the plot highlights the matching note. */}
      {PEAKS.length > 0 && (
        <div className="maldi-notes">
          <h4 className="maldi-notes-head">Annotated peaks</h4>
          <ul>
            {PEAKS.map((p) => (
              <li
                key={p.mz}
                className={
                  openPeak?.mz === p.mz
                    ? "maldi-note-item is-open"
                    : "maldi-note-item"
                }
              >
                <button
                  type="button"
                  className="maldi-note-jump"
                  onClick={() => setOpenPeak(openPeak?.mz === p.mz ? null : p)}
                >
                  m/z {p.mz}
                </button>{" "}
                <b>{p.label}</b>
                {p.only && (
                  <span className="maldi-note-scope">
                    {[
                      p.only.enzyme && `enzyme: ${p.only.enzyme}`,
                      p.only.substrate && `substrate: ${p.only.substrate}`,
                      p.only.samples &&
                        `${p.only.samples.length} sample${p.only.samples.length === 1 ? "" : "s"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}{" "}
                — {p.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showTable && (
        <table className="maldi-table">
          <caption>
            Tallest point of each selected spectrum in the visible m/z window (
            {lo.toFixed(0)}–{hi.toFixed(0)}).
          </caption>
          <thead>
            <tr>
              <th scope="col">Sample</th>
              <th scope="col">Well</th>
              <th scope="col">m/z at maximum</th>
              <th scope="col">Intensity</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((id) => {
              const t = traces[id];
              const s = index.samples.find((x) => x.id === id);
              if (!t || !s) return null;
              let bestI = slice.from;
              for (let i = slice.from; i < slice.to; i++)
                if (t[i] > t[bestI]) bestI = i;
              return (
                <tr key={id}>
                  <th scope="row">{s.name}</th>
                  <td>{s.well}</td>
                  <td>{axis[bestI].toFixed(2)}</td>
                  <td>{t[bestI].toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
