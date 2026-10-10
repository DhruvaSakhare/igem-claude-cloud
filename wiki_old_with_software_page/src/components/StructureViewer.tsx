import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AtomSelectionSpec, GLViewer } from "3dmol";

import { mmjsonToPdb } from "../contents/dry-lab/mmjson";
import { hetAtomsByName, superpose, transformPdb } from "./superpose";
import { LITERATURE_STRUCTURES } from "../contents/dry-lab/structures";
import type {
  FeatureId,
  FileRef,
  OverlayId,
  Structure,
} from "../contents/dry-lab/structures";
import "./StructureViewer.css";

/* ========================================================================== *
 *  StructureViewer — interactive 3D structure viewer (3Dmol.js, lazy-loaded)
 *
 *  Extracted from model_engineering.tsx so it can sit on whichever page needs
 *  it, and now a shared component rather than a Dry Lab one. It is currently
 *  rendered twice by the Discovery page — once in the literature-discovery
 *  section and once under the channel-discovery subsection of database
 *  discovery.
 *
 *  What stays in src/contents/dry-lab/ is the DATA, not the viewer: the
 *  structure catalogue (structures.ts, also read by the Discovery page) and the
 *  mmJSON→PDB converter for the way those files are shipped. Which structures
 *  this component shows is the `structures` prop; the literature list is only
 *  its default.
 *
 *  A grey caption under the frame used to repeat the structure note plus the
 *  drag / zoom / pan hints. It was removed; a single one-line hint sits under
 *  the frame instead.
 *
 *  Styling is in StructureViewer.css (.sv-*).
 * ========================================================================== */

/** Presentation for each overlay id — the label and legend swatch shown in the
 *  menu. The ids themselves (and what each overlay contains) are documented on
 *  `OverlayId` in structures.ts. */
type Overlay = {
  id: OverlayId;
  label: string;
  swatch: string; // legend colour ("gradient" = b-factor gradient)
};

const OVERLAYS: Overlay[] = [
  { id: "pocket_surface", label: "Pocket surface", swatch: "#38bdf8" },
  { id: "channel", label: "Channel", swatch: "gradient" },
  { id: "docking", label: "Docking pose (NNBT)", swatch: "#e879f9" },
];

/** Presentation for each annotated-residue role: the legend label and the
 *  colour its sticks are drawn in. Single source of truth for both — the CSS
 *  never repeats these values, it takes them inline. The roles themselves are
 *  defined on `FeatureId` in structures.ts. */
const FEATURES: Record<FeatureId, { label: string; color: string }> = {
  channel_entrance: { label: "Access-channel entrance", color: "#348B8B" },
  aromatic_triad: { label: "Aromatic triad", color: "#D0AA51" },
  structural_anchor: { label: "Structural anchor", color: "#D0AA51" },
  catalytic: { label: "Catalytic residues", color: "#27476E" },
};

/** Legend order (only the roles a structure actually uses are listed). */
const FEATURE_ORDER: FeatureId[] = [
  "channel_entrance",
  "aromatic_triad",
  "structural_anchor",
  "catalytic",
];

/** Tone for everything shown for context rather than as a highlight: the
 *  cofactors and the metal centres. */
const NEUTRAL = "#7A8699";

/** Cartoon colour of the protein itself. Flat, not a spectrum: the highlighted
 *  residues are the point of the picture, and role colours cannot read against
 *  ribbons that are already every hue. */
const PROTEIN = "#4E82C5";

/** Cartoon colour of a highlighted region (`regions` in structures.ts).
 *  Green, so it reads against the blue fold and the blue/teal/gold roles. */
const REGION = "#2FA84F";

/** One offered superposition: two of this viewer's own structures, fitted on
 *  their shared cofactor. See `alignments` on the component and superpose.ts
 *  for what the fit does and does not claim. */
export type Alignment = {
  id: string;
  /** Menu label. */
  label: string;
  /** Structure held still; drawn in PROTEIN. Must be an id in `structures`. */
  refId: string;
  /** Structure moved onto it; drawn in PROTEIN_MOBILE. Likewise. */
  mobileId: string;
  /** Residue name of the group the fit runs on. Both structures must contain
   *  it with matching atom names — the heme is the only such group here, so
   *  this defaults to HEM rather than being guessed per pair. */
  on?: string;
};

/** Cartoon colour of the moved structure in an alignment. Warm, against the
 *  reference's blue, so the two folds are told apart by hue alone — the shapes
 *  are interleaved once superposed and outlines are no help. */
const PROTEIN_MOBILE = "#D08A3E";

/** Channel colours in an alignment: the same two hues as the cartoons, but
 *  deepened. A channel drawn in its cartoon's exact colour disappears into the
 *  ribbons it runs through — same hue, same lightness, and the cartoon is in
 *  front of it half the time. Darkening keeps the identity ("the blue one is
 *  the blue structure's") while giving the tube an edge against the fold. */
const CHANNEL_REF = "#123C7A";
const CHANNEL_MOBILE = "#A64B00";

/** Cartoon opacity in an alignment while any overlay is on. Two folds at the
 *  normal 0.85 bury whatever is threaded between them; at this the overlays
 *  read and the folds are still there as context. */
const ALIGN_CARTOON_FADED = 0.4;

type ViewerState = "loading" | "ready" | "error";

/** Solvent, never drawn. */
const SOLVENT = ["HOH", "WAT", "DOD", "H2O", "SOL", "TIP3"];

/** ELEMENTS (not residue names) drawn as a sphere wherever they occur, and
 *  offered as hover targets. Selecting by element is what puts a marker on the
 *  iron at the centre of a heme: that iron is one atom inside the cofactor
 *  residue, so no residue-name selection reaches it. Read from PDB columns
 *  77-78, so there is no clash with same-spelled ATOM NAMES — a heme's NA/NB/
 *  NC/ND nitrogens and a protein's CA backbone carbon are elements N and C
 *  here, not sodium and calcium.
 *
 *  CAPITALISATION IS LOAD-BEARING. 3Dmol's PDB parser normalises the symbol to
 *  `Fe`/`Mg` (first letter upper, rest lower) and matches a selection with `==`
 *  on the raw string, so an all-caps `elem: "FE"` silently matches nothing —
 *  which is why the heme iron never got its sphere before. Written the way the
 *  parser stores it, and parseHetGroups normalises the file the same way. */
const ION_ELEMENTS = [
  "Fe",
  "Mg",
  "Zn",
  "Mn",
  "Ca",
  "Na",
  "K",
  "Cu",
  "Co",
  "Ni",
  "Cl",
];

/** Ions left out of every viewer altogether. The crystal structures carry a
 *  magnesium and, in some entries, chloride from the crystallisation
 *  conditions; neither is part of what these figures are about, and their
 *  spheres read as if they were. Removed from the BASE structure text as soon
 *  as it is fetched (see withoutHiddenIons), so they are not drawn, not
 *  hoverable, and not in an alignment either — one rule for every viewer
 *  instance. Overlay files (pocket, channel, docking) are left as they are.
 *  Same capitalisation as ION_ELEMENTS. */
const HIDDEN_ELEMENTS = ["Mg", "Cl"];

/** Readable names for the elements above, used in the hover/tap labels. */
const ELEMENT_NAMES: Record<string, string> = {
  Fe: "Iron",
  Mg: "Magnesium",
  Zn: "Zinc",
  Mn: "Manganese",
  Ca: "Calcium",
  Na: "Sodium",
  K: "Potassium",
  Cu: "Copper",
  Co: "Cobalt",
  Ni: "Nickel",
  Cl: "Chloride",
};

/** Readable names for the cofactors we expect to meet. Anything not listed is
 *  labelled by its own residue code — never guessed at. */
const HET_NAMES: Record<string, string> = {
  HEM: "Heme b",
  HEB: "Heme b",
  HEC: "Heme c",
};

/** Session cache of fetched-and-converted PDB text, keyed by URL. Switching
 *  back to a structure, or re-enabling an overlay, then costs no network. */
const pdbCache = new Map<string, string>();

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return res.text();
}

/** Fetch a structure file (or read it from cache) and normalise it to PDB text,
 *  so everything below this point works on one format regardless of how the
 *  file was shipped. */
async function fetchAsPdb(ref: FileRef): Promise<string> {
  const cached = pdbCache.get(ref.url);
  if (cached !== undefined) return cached;
  const text = await fetchText(ref.url);
  const pdb = ref.format === "mmjson" ? mmjsonToPdb(text) : text;
  pdbCache.set(ref.url, pdb);
  return pdb;
}

/** A base structure's PDB text with the HIDDEN_ELEMENTS atoms taken out. Only
 *  HETATM records are touched, and only by element (columns 77-78, normalised
 *  as 3Dmol does), so a protein atom is never dropped. Any CONECT record still
 *  naming a removed atom is harmless: 3Dmol skips bonds to atoms it does not
 *  have. */
function withoutHiddenIons(pdbText: string): string {
  return pdbText
    .split("\n")
    .filter((line) => {
      if (!line.startsWith("HETATM")) return true;
      const raw = line.slice(76, 78).trim();
      const el = raw && raw[0].toUpperCase() + raw.slice(1).toLowerCase();
      return !HIDDEN_ELEMENTS.includes(el);
    })
    .join("\n");
}

/** Channel pseudo-atoms: xyz + b-factor (= channel radius at that point). Parsed
 *  from fixed PDB columns so it's independent of the library. */
type ChannelPoint = { x: number; y: number; z: number; b: number };
function parseChannelPoints(pdbText: string): ChannelPoint[] {
  const pts: ChannelPoint[] = [];
  for (const line of pdbText.split("\n")) {
    if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) continue;
    const x = parseFloat(line.slice(30, 38));
    const y = parseFloat(line.slice(38, 46));
    const z = parseFloat(line.slice(46, 54));
    const b = parseFloat(line.slice(60, 66));
    if ([x, y, z, b].some(Number.isNaN)) continue;
    pts.push({ x, y, z, b });
  }
  return pts;
}

/** The channel colour scale, in ångström of channel RADIUS.
 *
 *  FIXED, not per-file. It used to be each file's own min→max, which meant red
 *  said "the narrowest point of this particular channel" and blue "the widest
 *  of this one" — so the same colour meant a different radius on every tab and
 *  two structures could not be compared. With a fixed domain a colour means one
 *  radius everywhere, which is what makes the legend below meaningful.
 *
 *  0–4 Å covers the uploaded data: across all 19 channel files the radii run
 *  0.93–4.14 Å. The top of the range is clamped rather than extended, so the
 *  handful of points above 4 Å (5OXU and Fett peak at 4.14) read as "4 Å or
 *  wider" instead of stretching the scale for everything else. Widen MAX if a
 *  future channel makes that clamping lose something worth seeing. */
const CHANNEL_MIN_A = 0;
const CHANNEL_MAX_A = 4;

/** ROYGB colour (low = red → high = blue) as a hex string, for a b-factor.
 *  `t` is clamped, so a value outside [min, max] takes the end colour. */
function bColorHex(value: number, min: number, max: number): string {
  const raw = max > min ? (value - min) / (max - min) : 0.5;
  const t = Math.min(1, Math.max(0, raw));
  return hslToHex(t * 240, 0.9, 0.5); // hue 0=red → 240=blue via yellow/green/cyan
}

/** The scale as a CSS gradient, BUILT FROM bColorHex rather than written out by
 *  hand, so the key in the rail cannot drift from the colours actually drawn in
 *  the scene. (It used to be five hand-picked hex stops, which were close but
 *  not the ramp: they included an orange the function never produces and missed
 *  the cyan it does.) */
const CHANNEL_GRADIENT = `linear-gradient(90deg, ${Array.from(
  { length: 9 },
  (_, i) => bColorHex(i / 8, 0, 1) + ` ${((i / 8) * 100).toFixed(1)}%`,
).join(", ")})`;

/** Tick labels under the scale — every whole ångström across the domain. */
const CHANNEL_TICKS = Array.from(
  { length: CHANNEL_MAX_A - CHANNEL_MIN_A + 1 },
  (_, i) => CHANNEL_MIN_A + i,
);
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (val: number) =>
    Math.round((val + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** The pocket-lining atoms of an fpocket `_pocket_atm.pdb`. Only ATOM records
 *  are read, so HEM (a HETATM) is naturally excluded — it stays visible as
 *  sticks instead of buried in surface.
 *
 *  Both granularities are returned because fpocket lists individual ATOMS, not
 *  whole residues: in A0A2H3E6E9, 79 atoms spread over 29 residues, 8 of which
 *  contribute a single atom each. `atomKeys` (`resi|atomName`) is what the
 *  surface is displayed for; `resi` is kept only as a fallback for the case
 *  where the atom names in this file do not match the base structure's, so a
 *  name mismatch degrades to the old coarser pocket rather than to no pocket
 *  at all. See the call site for why the atom-level set matters. */
function parsePocketAtoms(text: string): {
  chain: string;
  resi: number[];
  atomKeys: Set<string>;
} {
  const resis = new Set<number>();
  const atomKeys = new Set<string>();
  let chain = "A";
  for (const line of text.split("\n")) {
    if (!line.startsWith("ATOM")) continue; // protein atoms only
    const ch = line.slice(21, 22).trim();
    const ri = parseInt(line.slice(22, 26), 10);
    const name = line.slice(12, 16).trim(); // PDB atom-name columns
    if (Number.isNaN(ri)) continue;
    if (ch) chain = ch;
    resis.add(ri);
    if (name) atomKeys.add(`${ri}|${name}`);
  }
  return { chain, resi: [...resis], atomKeys };
}

/**
 * The non-protein groups of a base structure, split into molecules, single
 * atoms, and the metal/ion ELEMENTS actually present, so each can be given the
 * style that suits it — and so the hover targets below can be built from what
 * the file contains rather than from a hard-coded name.
 *
 * They CANNOT be selected by name. The two families of structure this viewer
 * shows disagree about what a cofactor is called: the experimental PDB entries
 * use the chemical-component code (the heme is `HEM`), while the Boltz-predicted
 * models label every non-polymer component `LIG` — same 43-atom heme b, same
 * atom names (CHA…FE), different residue name. Hard-coding `resn: "HEM"` drew
 * nothing at all for the predicted models, which is why their heme was missing.
 *
 * So classify by shape instead, which needs no vocabulary: a HETATM residue with
 * more than one atom is a molecule (drawn as sticks); a one-atom residue is an
 * ion (drawn as a sphere). Solvent is dropped. This also picks up any cofactor
 * added later — HEC, FAD, a second ligand — with no code change.
 */
function parseHetGroups(pdbText: string): {
  molecules: string[];
  ions: string[];
  elements: string[];
} {
  // atoms per residue INSTANCE, keyed resn|chain|resSeq — a name is judged by
  // the largest instance carrying it.
  const sizes = new Map<string, number>();
  const elements = new Set<string>();
  for (const line of pdbText.split("\n")) {
    if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
      // Same normalisation 3Dmol applies (see ION_ELEMENTS), so the symbols
      // collected here are the ones a selection will actually match.
      const raw = line.slice(76, 78).trim();
      const el = raw && raw[0].toUpperCase() + raw.slice(1).toLowerCase();
      if (el && ION_ELEMENTS.includes(el)) elements.add(el);
    }
    if (!line.startsWith("HETATM")) continue;
    const resn = line.slice(17, 20).trim().toUpperCase();
    if (!resn || SOLVENT.includes(resn)) continue;
    const key = `${resn}|${line.slice(21, 22)}|${line.slice(22, 27)}`;
    sizes.set(key, (sizes.get(key) ?? 0) + 1);
  }

  const biggest = new Map<string, number>();
  for (const [key, n] of sizes) {
    const resn = key.slice(0, key.indexOf("|"));
    biggest.set(resn, Math.max(biggest.get(resn) ?? 0, n));
  }

  const molecules: string[] = [];
  const ions: string[] = [];
  for (const [resn, n] of biggest) (n > 1 ? molecules : ions).push(resn);
  return { molecules, ions, elements: [...elements] };
}

/**
 * One hoverable / tappable thing in the scene: a highlighted residue, a
 * cofactor, or a metal centre. `sel` is the 3Dmol selection that picks it out
 * (the model is added when the scene is built).
 */
type Pick = {
  id: string;
  sel: Record<string, unknown>;
  title: string;
  sub: string;
  color: string;
  note?: string;
};

/**
 * StructureViewer — interactive 3D structure viewer (3Dmol.js).
 *
 * Performance-first design so the page stays light:
 *  • 3Dmol.js is lazy-loaded via a dynamic import(), so it is a SEPARATE chunk
 *    that only downloads when this page opens — the main bundle and every other
 *    page are unaffected.
 *  • One WebGL context is reused across structures/overlays and disposed on
 *    unmount, and fetched files are cached for the session (see pdbCache).
 *
 * Which structures it lists is a PROP, so the same component serves more than
 * one section of the Discovery page: the literature-discovery instance passes
 * LITERATURE_ALL_STRUCTURES and the database-discovery one passes
 * DATABASE_STRUCTURES. (The default, LITERATURE_STRUCTURES, is the measured
 * half of the first of those — no call site relies on it today.) Each instance
 * keeps its own tab/overlay/camera state and
 * its own WebGL context; the lazily-imported 3Dmol chunk is shared, so a second
 * instance costs no extra download.
 *
 * What it shows:
 *  • Base structure — a flat cartoon, cofactors as neutral sticks, ions and
 *    metal centres as neutral spheres. Which residues those are is read off the
 *    file by parseHetGroups rather than named, so an experimental PDB entry and
 *    a Boltz-predicted model both render their heme.
 *    Loaded by default (first entry in `structures`); tabs switch.
 *  • Annotated active-site residues — the ones a structure lists in
 *    `Structure.residues`, drawn as sticks coloured by the role they play
 *    (FEATURES), with a legend of the roles that structure uses. A structure
 *    with no annotations simply gets none of this.
 *  • Hover / tap — every highlighted residue, cofactor and metal centre is a
 *    target: hovering shows a label at the pointer, clicking pins a card with
 *    the note written for it. Nothing is asserted here that isn't in
 *    structures.ts.
 *  • Overlays (OVERLAYS) — any combination toggled on. Each structure names its
 *    own overlay files in `Structure.overlays`, so overlays are ALWAYS tied to
 *    the chosen structure; you can't mix another structure's overlays in, and a
 *    structure that omits one simply has that toggle disabled. An overlay that
 *    NO structure in the list supplies is left out of the menu instead, since a
 *    toggle that is greyed out on every tab offers nothing. The pocket
 *    renders as a molecular surface, the channel as spheres coloured by
 *    b-factor, and the docking overlay shows only the NNBT ligand.
 *
 * "Reset view" restores the exact starting camera (orientation + zoom + pan).
 * The whole scene is rebuilt when the structure OR the overlay set changes; the
 * camera is only re-fit on a structure change, so toggling overlays doesn't
 * jump the view. An annotated structure opens framed on its cofactor (the
 * active site); an unannotated one opens on the whole fold.
 */
export function StructureViewer({
  structures = LITERATURE_STRUCTURES,
  alignments,
}: {
  /** The tabs to offer, in order. The first one loads on mount. */
  structures?: Structure[];
  /** Superpositions to offer, if any. OMITTED BY DEFAULT: a viewer that is not
   *  given this prop shows no alignment control and behaves exactly as before,
   *  so adding one to a page cannot change any other page's viewer. */
  alignments?: Alignment[];
} = {}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<GLViewer | null>(null);
  // Saved camera right after the initial fit, so Reset can restore it exactly.
  const homeViewRef = useRef<unknown[] | null>(null);
  // Id of the last-rendered structure — to detect structure vs overlay change.
  const prevBaseRef = useRef<string | null>(null);
  // Pointer position inside the frame, for placing the hover label.
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [activeId, setActiveId] = useState(structures[0].id);
  const [enabled, setEnabled] = useState<Record<OverlayId, boolean>>({
    pocket_surface: false,
    channel: false,
    docking: false,
  });
  // Which superposition is showing, or null for the ordinary single-structure
  // view. Mutually exclusive with the tabs by design: picking a tab clears it.
  const [alignId, setAlignId] = useState<string | null>(null);
  const [state, setState] = useState<ViewerState>("loading");
  const [busy, setBusy] = useState(false); // rebuilding overlays (viewer stays up)
  const [spinning, setSpinning] = useState(false);
  // Hover/tap targets of the CURRENT scene. Built inside the effect, because
  // the cofactors and metals among them are read off the fetched file.
  const [picks, setPicks] = useState<Pick[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const active = structures.find((s) => s.id === activeId) ?? structures[0];
  // The overlays this viewer offers at all: those at least one of its
  // structures has a file for. See "Overlays" in the comment above.
  const offeredOverlays = OVERLAYS.filter((o) =>
    structures.some((s) => s.overlays[o.id]),
  );
  const align = alignId
    ? (alignments?.find((a) => a.id === alignId) ?? null)
    : null;
  const alignRef = align
    ? (structures.find((s) => s.id === align.refId) ?? null)
    : null;
  const alignMobile = align
    ? (structures.find((s) => s.id === align.mobileId) ?? null)
    : null;
  // Stable primitive dep: which overlays are on (order-independent).
  const enabledKey = OVERLAYS.filter((o) => enabled[o.id])
    .map((o) => o.id)
    .join(",");

  // The roles this structure actually annotates, in legend order.
  const legendFeatures = useMemo<FeatureId[]>(() => {
    // Empty while an alignment is showing — the sticks those colours describe
    // are not drawn then (see the scene build), so a legend for them would name
    // nothing on screen.
    if (align) return [];
    const seen = new Set<FeatureId>();
    for (const r of active.residues ?? []) seen.add(r.feature);
    return FEATURE_ORDER.filter((f) => seen.has(f));
  }, [active, align]);

  const pickById = (id: string | null) =>
    id ? (picks.find((p) => p.id === id) ?? null) : null;

  // (Re)build the whole scene when the structure or the overlay set changes,
  // lazily loading 3Dmol and reusing the same viewer/WebGL context.
  useEffect(() => {
    let cancelled = false;
    // An alignment is a scene in its own right, so it counts as a structure
    // change: switching into or out of one re-fits the camera.
    const sceneKey = align ? `align:${align.id}` : active.id;
    // In an alignment the REFERENCE drives everything the single-structure path
    // already does — base file, overlays, annotated residues, opening camera —
    // and the mobile structure is layered on top of it further down.
    const baseStruct = alignRef ?? active;
    const structureChanged = prevBaseRef.current !== sceneKey;
    if (structureChanged) {
      setState("loading");
      setHovered(null);
      setPinned(null);
    } else {
      setBusy(true);
    }

    (async () => {
      try {
        const mod = await import("3dmol");
        // Tolerate CJS/ESM interop: API may be on the namespace or on .default.
        const $3Dmol: typeof import("3dmol") =
          (mod as { default?: typeof import("3dmol") }).default ?? mod;

        // Fetch base + every enabled overlay THIS structure actually provides.
        const enabledOverlays = OVERLAYS.filter(
          (o) => enabled[o.id] && baseStruct.overlays[o.id],
        );
        const baseText = withoutHiddenIons(await fetchAsPdb(baseStruct.base));
        const overlayTexts = await Promise.all(
          enabledOverlays.map(async (o) => {
            try {
              return { o, text: await fetchAsPdb(baseStruct.overlays[o.id]!) };
            } catch (e) {
              console.warn("StructureViewer: overlay missing", o.id, e);
              return { o, text: null as string | null };
            }
          }),
        );
        if (cancelled || !hostRef.current) return;

        let viewer = viewerRef.current;
        if (!viewer) {
          viewer = $3Dmol.createViewer(hostRef.current, {
            backgroundColor: "#ffffff",
          });
          viewerRef.current = viewer;
        }
        const v = viewer; // const alias keeps null-narrowing inside closures
        v.removeAllModels();
        v.removeAllSurfaces();
        v.removeAllShapes();

        // addSurface's typed spec is stricter than the runtime; call loosely.
        // (stype, style, atomsel = show for these atoms, allsel = compute over these)
        const surf = (
          stype: unknown,
          style: unknown,
          sel: unknown,
          all?: unknown,
        ) =>
          (
            v.addSurface as (
              a: unknown,
              b: unknown,
              c: unknown,
              d?: unknown,
            ) => Promise<unknown>
          )(stype, style, sel, all);
        const ST = $3Dmol.SurfaceType;

        // Same over-strict typing on selections: `resn`/`elem` are declared as a
        // single string, but the runtime takes a LIST and matches any of the
        // values (see atomIsSelected in 3Dmol — "can be any of the listed
        // values"). Widen the spec rather than issuing one addStyle per value.
        const anyOf = (s: Record<string, unknown>) => s as AtomSelectionSpec;

        // --- base structure ---
        const baseModel = v.addModel(baseText, "pdb");
        // Flat cartoon; cofactors and metal centres in a quiet neutral tone so
        // the role-coloured residues below are the only thing that reads as a
        // highlight. Which residues the cofactors and ions are is read off the
        // file (see parseHetGroups), not hard-coded, so this works for an
        // experimental PDB entry and a Boltz-predicted model alike.
        const het = parseHetGroups(baseText);
        // Fade both folds in an alignment that has an overlay on, so whatever
        // is threaded between them stays visible (see ALIGN_CARTOON_FADED).
        const cartoonOpacity =
          align && enabledOverlays.length > 0 ? ALIGN_CARTOON_FADED : 0.85;
        v.setStyle(
          { model: baseModel },
          { cartoon: { color: PROTEIN, opacity: cartoonOpacity } },
        );
        // Highlighted regions recolour the cartoon over their residue range.
        // Only on the structure's own tab, like the annotated residues below.
        for (const g of align ? [] : (baseStruct.regions ?? [])) {
          v.setStyle(
            anyOf({ model: baseModel, resi: `${g.from}-${g.to}`, hetflag: false }),
            { cartoon: { color: REGION, opacity: cartoonOpacity } },
          );
        }
        if (het.molecules.length) {
          v.addStyle(anyOf({ model: baseModel, resn: het.molecules }), {
            stick: { radius: 0.16, color: NEUTRAL },
          });
        }
        if (het.ions.length) {
          v.addStyle(anyOf({ model: baseModel, resn: het.ions }), {
            sphere: { scale: 0.3, color: NEUTRAL },
          });
        }
        // Metal centres — including a heme's iron, which is an atom WITHIN the
        // cofactor and so is missed by every residue-level selection above.
        v.addStyle(anyOf({ model: baseModel, elem: ION_ELEMENTS }), {
          sphere: { scale: 0.32, color: NEUTRAL },
        });
        // Annotated active-site residues, as sticks coloured by their role.
        // Not while an alignment is showing: the scene is then about the two
        // superposed folds, and a third set of colours belonging to only one of
        // them is noise the reader has to filter out. The annotations are still
        // there on that structure's own tab.
        for (const r of align ? [] : (baseStruct.residues ?? [])) {
          v.addStyle(
            { model: baseModel, resi: r.resi },
            { stick: { radius: 0.22, color: FEATURES[r.feature].color } },
          );
        }

        /** Draw a channel file as spheres.
         *
         *  `tint` switches what COLOUR encodes, and is passed only in an
         *  alignment:
         *    • single structure — colour is the channel radius, on the fixed
         *      0–4 Å scale the rail shows a key for;
         *    • alignment — colour is WHICH STRUCTURE the channel belongs to.
         *      Two channels from the same heme lie on top of one another, and
         *      radius-coloured they are one indistinguishable mass; telling
         *      them apart is the whole point of putting them in one scene.
         *      Nothing is lost by the swap: a sphere's RADIUS is the channel
         *      radius either way, so the tube still visibly narrows and flares
         *      — the geometry is in the shape, and colour is free to carry
         *      identity instead.
         *
         *  The tint is a DEEPENED version of the structure's colour, not the
         *  cartoon colour itself: identical-coloured spheres threaded through
         *  identical-coloured ribbons are invisible. The cartoons also fade
         *  while an overlay is on (see ALIGN_CARTOON_FADED). */
        const drawChannel = (text: string, tint?: string) => {
          for (const pt of parseChannelPoints(text)) {
            v.addSphere({
              center: { x: pt.x, y: pt.y, z: pt.z },
              radius: pt.b,
              color: tint ?? bColorHex(pt.b, CHANNEL_MIN_A, CHANNEL_MAX_A),
            });
          }
        };

        // --- the moved structure, when an alignment is showing ------------
        //
        // Fitted on the cofactor both structures share (see superpose.ts for
        // why that frame and not the backbone). Everything downstream then
        // treats it as ordinary PDB text, so its overlays land in the same
        // frame simply by being transformed with the same matrix.
        if (align && alignMobile) {
          const on = align.on ?? "HEM";
          const mobileRaw = withoutHiddenIons(
            await fetchAsPdb(alignMobile.base),
          );
          const t = superpose(
            hetAtomsByName(mobileRaw, on),
            hetAtomsByName(baseText, on),
          );
          if (!t) {
            // No shared group to fit on. Refuse rather than draw the two
            // structures in their own unrelated coordinate frames, which would
            // look like a result and mean nothing.
            throw new Error(
              `Cannot superpose ${alignMobile.label} on ${baseStruct.label}: fewer than three ${on} atoms in common`,
            );
          }
          const mobileText = transformPdb(mobileRaw, t);
          const mobileModel = v.addModel(mobileText, "pdb");
          const mHet = parseHetGroups(mobileText);
          v.setStyle(
            { model: mobileModel },
            { cartoon: { color: PROTEIN_MOBILE, opacity: cartoonOpacity } },
          );
          if (mHet.molecules.length) {
            v.addStyle(anyOf({ model: mobileModel, resn: mHet.molecules }), {
              stick: { radius: 0.16, color: NEUTRAL },
            });
          }
          if (mHet.ions.length) {
            v.addStyle(anyOf({ model: mobileModel, resn: mHet.ions }), {
              sphere: { scale: 0.3, color: NEUTRAL },
            });
          }
          v.addStyle(anyOf({ model: mobileModel, elem: ION_ELEMENTS }), {
            sphere: { scale: 0.32, color: NEUTRAL },
          });

          // Its overlays too, moved by the same transform — an overlay is only
          // meaningful in its own structure's frame, so it has to travel with
          // it. Only the ones this structure actually supplies AND that are
          // switched on; a missing file is skipped, as in the single view.
          for (const o of OVERLAYS) {
            if (!enabled[o.id] || !alignMobile.overlays[o.id]) continue;
            let text: string;
            try {
              text = transformPdb(
                await fetchAsPdb(alignMobile.overlays[o.id]!),
                t,
              );
            } catch (e) {
              console.warn("StructureViewer: mobile overlay missing", o.id, e);
              continue;
            }
            if (cancelled) return;
            if (o.id === "channel") {
              drawChannel(text, CHANNEL_MOBILE);
            } else if (o.id === "pocket_surface") {
              // Painted in the moved structure's own colour, unlike the single
              // view's blue: with two pockets in one scene, which structure a
              // pocket belongs to matters more than that it is a pocket.
              const pm = v.addModel(text, "pdb");
              v.setStyle({ model: pm }, {});
              await surf(
                ST.MS,
                { opacity: 0.75, color: PROTEIN_MOBILE },
                { model: pm },
                { model: pm },
              );
            } else {
              const dm = v.addModel(text, "pdb");
              v.setStyle(
                { model: dm },
                { stick: { radius: 0.2, color: PROTEIN_MOBILE } },
              );
            }
            if (cancelled) return;
          }
        }

        // --- hover / tap targets ---
        // Order matters where selections overlap: a heme's iron belongs to both
        // the cofactor residue and the Fe element, and the LAST registration
        // wins for a shared atom. Elements go last so the iron reads as the
        // metal centre rather than as the whole cofactor.
        const scenePicks: Pick[] = [
          ...(align ? [] : (baseStruct.residues ?? [])).map((r) => ({
            id: `res-${r.resi}`,
            sel: { resi: r.resi },
            title: r.code,
            sub: FEATURES[r.feature].label,
            color: FEATURES[r.feature].color,
            note: r.note,
          })),
          ...het.molecules.map((resn) => ({
            id: `het-${resn}`,
            sel: { resn: [resn] },
            title: HET_NAMES[resn] ?? resn,
            sub: "Cofactor",
            color: NEUTRAL,
            note: "Shown for context — not one of the highlighted features.",
          })),
          ...het.elements.map((el) => ({
            id: `elem-${el}`,
            sel: { elem: [el] },
            title: ELEMENT_NAMES[el] ?? el,
            sub: "Metal centre",
            color: NEUTRAL,
            note: "Shown for context — not one of the highlighted features.",
          })),
        ];
        type Sel = Parameters<typeof v.setHoverable>[0];
        for (const p of scenePicks) {
          const sel = { model: baseModel, ...p.sel } as unknown as Sel;
          v.setHoverable(
            sel,
            true,
            () => setHovered(p.id),
            () => setHovered((h) => (h === p.id ? null : h)),
          );
          v.setClickable(sel, true, () =>
            setPinned((cur) => (cur === p.id ? null : p.id)),
          );
        }
        if (!cancelled) setPicks(scenePicks);

        // --- overlays ---
        for (const { o, text } of overlayTexts) {
          if (!text) continue;

          if (o.id === "channel") {
            // Channel as spheres whose RADIUS = the b-factor (channel radius at
            // that point). A surface over these thin points was barely visible,
            // so we draw explicit spheres. Colour is the radius on its own, and
            // the structure's identity in an alignment — see drawChannel.
            drawChannel(text, align ? CHANNEL_REF : undefined);
            continue;
          }

          if (o.id === "pocket_surface") {
            // The pocket is drawn as a molecular surface over the pocket-LINING
            // ATOMS ALONE — both what is displayed and what the geometry is
            // computed from are that same set. It reads as one smooth rounded
            // body sitting in the cavity, which stays legible through the
            // cartoon.
            //
            // Note what this is and is not: it is the surface of the atoms that
            // LINE the cavity, not the cavity's own volume. The volume would
            // come from fpocket's alpha spheres (`_pocket_vert.pqr`), which are
            // not among the uploaded files.
            //
            // Two details matter, and they are independent of each other:
            //
            // 1. The selection is per-ATOM, not per-residue. fpocket lists the
            //    individual atoms lining the cavity, about 2.5-3 per residue
            //    and often just one (A0A2H3E6E9: 8 of its 29 residues). Taking
            //    the whole RESIDUE, as this did originally, also drew the rest
            //    of each side chain, and a pocket residue usually has its other
            //    face pointing at the protein's EXTERIOR - so cyan patches were
            //    painted all over the outside of the fold and read as scattered
            //    confetti rather than as a pocket. Every structure was affected:
            //    all of them selected 2.5-4x more atoms than fpocket reported.
            //
            // 2. `allsel` is the pocket, NOT the whole protein. Computing over
            //    the whole protein and clipping to the pocket yields the cavity
            //    WALL, which is geometrically the truer pocket surface but lies
            //    inside the protein and stayed mostly hidden behind the cartoon
            //    as thin slivers. A VDW surface over the pocket atoms was also
            //    tried; same body, but visibly the union of atom spheres rather
            //    than smooth. Since the surface here is built without the
            //    surrounding protein, how well it coheres depends on how densely
            //    the pocket atoms pack — a sparse pocket can resolve into
            //    separate lumps rather than one body.
            //
            // A `predicate` is used because the atoms wanted are specific
            // (resi, name) PAIRS: passing `{resi: [...], atom: [...]}` would
            // match any listed name in any listed residue — the cross product,
            // which is close to the residue-level selection this replaces.
            const { chain, resi, atomKeys } = parsePocketAtoms(text);
            const perAtom = {
              model: baseModel,
              chain,
              predicate: (a: { resi?: number; atom?: string }) =>
                atomKeys.has(`${a.resi}|${a.atom}`),
            } as unknown as AtomSelectionSpec;
            // Fall back to the residue-level selection if the atom names in the
            // pocket file do not match the base structure's, so a mismatch
            // costs precision rather than showing no pocket at all.
            const matched = v.selectedAtoms(perAtom).length;
            const pocketSel =
              matched > 0 ? perAtom : { model: baseModel, chain, resi };
            await surf(
              ST.MS,
              { opacity: 0.9, color: "#38bdf8" },
              pocketSel, // atomsel: what is drawn
              pocketSel, // allsel: what the geometry is computed from
            );
            if (cancelled) return;
            continue;
          }

          // docking — ligand-only file (the docked NNBT pose), all as sticks
          const m = v.addModel(text, "pdb");
          v.setStyle(
            { model: m },
            { stick: { radius: 0.2, colorscheme: "magentaCarbon" } },
          );
          if (cancelled) return;
        }

        if (structureChanged) {
          // An annotated structure opens on its active site (the cofactor the
          // highlighted residues surround); one with no annotations opens on
          // the whole fold, since there is no site to point at yet.
          //
          // An ALIGNMENT always opens on the whole fold, even though its
          // reference may be annotated: the thing being shown is two
          // superposed structures, and the active-site framing is tight enough
          // that neither fold is visible in it — the reader would not be able
          // to see that there are two. Zooming to the site is one scroll away.
          if (
            !align &&
            (baseStruct.residues?.length ?? 0) > 0 &&
            het.molecules.length
          ) {
            v.zoomTo(anyOf({ model: baseModel, resn: het.molecules }));
            v.zoom(0.45);
          } else {
            v.zoomTo({ model: baseModel });
            v.zoom(1.1);
          }
          homeViewRef.current = v.getView(); // remember the starting camera
        }
        v.render();
        v.spin(spinning ? "y" : false);
        prevBaseRef.current = sceneKey;
        if (!cancelled) {
          setState("ready");
          setBusy(false);
        }
      } catch (err) {
        console.error("StructureViewer:", err);
        if (!cancelled) {
          setState("error");
          setBusy(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // spinning read at run time, not a trigger; deps below cover the rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, enabledKey, alignId]);

  // Keep the canvas sized to its container; dispose the WebGL context on unmount.
  //
  // The window listener alone is not enough: the frame's height no longer comes
  // from its own width via `aspect-ratio` in every case. When the control rail
  // is the taller column the frame grows to fill the row instead (see the
  // .sv-stage note in StructureViewer.css), so the rail's height now feeds the
  // canvas — and that can settle AFTER 3Dmol has read the container, e.g. when
  // a late web font changes the tab rows. A ResizeObserver on the host catches
  // any such change, window-driven or not.
  useEffect(() => {
    const onResize = () => {
      viewerRef.current?.resize();
      viewerRef.current?.render();
    };
    window.addEventListener("resize", onResize);
    const host = hostRef.current;
    const ro = host ? new ResizeObserver(onResize) : null;
    if (host && ro) ro.observe(host);
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      viewerRef.current?.clear();
      viewerRef.current = null;
    };
  }, []);

  const toggleSpin = () => {
    const v = viewerRef.current;
    if (!v) return;
    const next = !spinning;
    v.spin(next ? "y" : false);
    setSpinning(next);
  };

  const resetView = () => {
    const v = viewerRef.current;
    if (!v || !homeViewRef.current) return;
    v.setView(homeViewRef.current); // restores orientation + zoom + pan
    v.render();
    setPinned(null);
  };

  const controlsDisabled = state === "loading" || busy;
  const tip = pickById(hovered);
  const card = pickById(pinned);
  const hasCofactorPick = picks.some((p) => p.color === NEUTRAL);

  return (
    <div className="sv">
      {/* Left: the viewer */}
      <div className="sv-stage">
        <div
          className="sv-frame"
          role="img"
          aria-label={`3D structure of ${active.label}${
            active.accession
              ? ` (${active.accession.id})`
              : active.code
                ? ` (${active.code})`
                : ""
          }${
            active.residues?.length
              ? " with highlighted active-site residues"
              : ""
          }`}
        >
          {/* 3Dmol renders its WebGL canvas into this host */}
          <div
            ref={hostRef}
            className="sv-canvas"
            onMouseMove={(e) => {
              const b = e.currentTarget.getBoundingClientRect();
              pointerRef.current = {
                x: e.clientX - b.left,
                y: e.clientY - b.top,
              };
            }}
          />

          {state !== "ready" && (
            <div className="sv-veil">
              {state === "error" ? (
                <>
                  <span className="sv-mono">Couldn’t load {active.label}</span>
                  <p>
                    The 3D viewer failed to load this structure. Check your
                    connection or try another structure.
                  </p>
                </>
              ) : (
                <span className="sv-mono">Loading {active.label}…</span>
              )}
            </div>
          )}

          {busy && state === "ready" && (
            <span className="sv-busy" aria-hidden="true">
              Updating…
            </span>
          )}

          {tip && !card && state === "ready" && (
            <div
              className="sv-tip"
              style={
                {
                  left: pointerRef.current.x + 14,
                  top: pointerRef.current.y + 14,
                  "--tone": tip.color,
                } as CSSProperties
              }
            >
              <strong>{tip.title}</strong> · {tip.sub}
            </div>
          )}

          {card && state === "ready" && (
            <div
              className="sv-card"
              style={{ "--tone": card.color } as CSSProperties}
              role="dialog"
              aria-label={card.title}
            >
              <button
                type="button"
                className="sv-x"
                onClick={() => setPinned(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <span className="sv-kind">{card.sub}</span>
              <h4 className="sv-cardtitle">{card.title}</h4>
              {card.note && <p className="sv-note">{card.note}</p>}
            </div>
          )}
        </div>
        <p className="sv-hint">
          Drag to rotate · scroll to zoom · hover or tap a residue for its role.
        </p>
      </div>

      {/* Right: structure, overlay and camera controls */}
      <div className="sv-rail">
        <div className="sv-group">
          <span className="sv-grouphead">Structure</span>
          <div
            className="sv-tabs"
            role="tablist"
            aria-label="Choose a structure"
          >
            {structures.map((s) => (
              <div className="sv-tab-row" key={s.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!align && s.id === activeId}
                  /* `code` sits on its own line under the label (see
                     .sv-tab-stack), because the identifiers that need one are
                     far longer than an accession and would not fit beside it in
                     the 240px rail. */
                  className={`sv-tab${!align && s.id === activeId ? " active" : ""}${
                    !s.accession && s.code ? " sv-tab-stack" : ""
                  }`}
                  /* Picking a structure leaves the alignment: the two are
                     different scenes, and a tab that quietly did nothing while
                     an alignment was on would be worse than one that exits. */
                  onClick={() => {
                    setAlignId(null);
                    setActiveId(s.id);
                  }}
                >
                  <span className="sv-tab-name">
                    {s.label}
                    {s.accession && s.accession.id !== s.label && (
                      <span className="sv-tab-acc">{s.accession.id}</span>
                    )}
                  </span>
                  {!s.accession && s.code && (
                    <span className="sv-tab-acc sv-tab-code">{s.code}</span>
                  )}
                </button>
                {s.accession && (
                  <a
                    className="sv-cite"
                    href={s.accession.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${s.accession.id} on ${s.accession.source}`}
                    title={`${s.accession.id} on ${s.accession.source}`}
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Superpositions, when the page offered any. A viewer with no
            `alignments` prop renders nothing here at all. */}
        {alignments && alignments.length > 0 && (
          <div className="sv-group">
            <span className="sv-grouphead">Align</span>
            <div className="sv-aligns">
              {alignments.map((a) => {
                const on = alignId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    className={`sv-align${on ? " active" : ""}`}
                    onClick={() => setAlignId(on ? null : a.id)}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
            {align && (
              <p className="sv-align-note">
                <span className="sv-align-key">
                  <span
                    className="sv-sw"
                    style={{ background: PROTEIN }}
                    aria-hidden="true"
                  />
                  {alignRef?.label}
                  <span
                    className="sv-sw"
                    style={{ background: PROTEIN_MOBILE }}
                    aria-hidden="true"
                  />
                  {alignMobile?.label}
                </span>
              </p>
            )}
          </div>
        )}

        {offeredOverlays.length > 0 && (
          <div className="sv-group">
            <span className="sv-grouphead">Overlays</span>
            {/* Toggles apply to the selected structure's files only */}
            <div className="sv-overlays">
              {offeredOverlays.map((o) => (
                <label
                  key={o.id}
                  className={`sv-toggle${enabled[o.id] ? " on" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={enabled[o.id]}
                    // a structure that doesn't supply this overlay can't show it
                    disabled={controlsDisabled || !active.overlays[o.id]}
                    onChange={() =>
                      setEnabled((e) => ({ ...e, [o.id]: !e[o.id] }))
                    }
                  />
                  <span
                    className="sv-sw"
                    style={{
                      background:
                        o.swatch === "gradient" ? CHANNEL_GRADIENT : o.swatch,
                    }}
                    aria-hidden="true"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Channel radius key. Shown only while the channel overlay is actually
            on for this structure — it explains colours that are not on screen
            otherwise. The bar is the same ramp the spheres are coloured with
            (CHANNEL_GRADIENT is built from bColorHex), and the ticks are the
            fixed domain, so a colour can be read back as a radius. */}
        {/* Hidden in an alignment: the channel is coloured by STRUCTURE there,
            not by radius (see drawChannel), so this scale would be a key to
            colours that are not on screen. The radius is still readable in an
            alignment — it is the width of the tube — it just has no colour
            scale to go with it. */}
        {enabled.channel && !align && active.overlays.channel && (
          <div className="sv-group">
            <span className="sv-grouphead">Channel radius</span>
            <div className="sv-scale">
              <span
                className="sv-scale-bar"
                style={{ background: CHANNEL_GRADIENT }}
                aria-hidden="true"
              />
              <div className="sv-scale-ticks" aria-hidden="true">
                {CHANNEL_TICKS.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <span className="sv-scale-unit">
                ångström
                {/* The top of the scale is a clamp, not a maximum — say so, so
                    a wide point is not read as exactly 4 Å. */}
                <span className="sv-scale-note">
                  {" "}
                  · {CHANNEL_MAX_A} Å and wider share the end colour
                </span>
              </span>
              <span className="sv-sr">
                Channel radius from {CHANNEL_MIN_A} to {CHANNEL_MAX_A} ångström,
                coloured red for the narrowest through to blue for the widest.
              </span>
            </div>
          </div>
        )}

        {/* Only structures that annotate their active site get a legend. */}
        {legendFeatures.length > 0 && (
          <div className="sv-group">
            <span className="sv-grouphead">Active site</span>
            <ul className="sv-legend">
              {legendFeatures.map((f) => (
                <li key={f}>
                  <span
                    className="sv-sw"
                    style={{ background: FEATURES[f].color }}
                    aria-hidden="true"
                  />
                  {FEATURES[f].label}
                </li>
              ))}
              {hasCofactorPick && (
                <li>
                  <span
                    className="sv-sw"
                    style={{ background: NEUTRAL }}
                    aria-hidden="true"
                  />
                  Cofactors &amp; metals
                </li>
              )}
            </ul>
          </div>
        )}

        {!align && (active.regions?.length ?? 0) > 0 && (
          <div className="sv-group">
            <span className="sv-grouphead">Highlighted region</span>
            <ul className="sv-legend">
              {active.regions!.map((g) => (
                <li key={`${g.from}-${g.to}`}>
                  <span
                    className="sv-sw"
                    style={{ background: REGION }}
                    aria-hidden="true"
                  />
                  {g.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="sv-actions">
          <button
            type="button"
            className="sv-action"
            onClick={resetView}
            disabled={controlsDisabled}
          >
            Reset view
          </button>
          <button
            type="button"
            className="sv-action"
            onClick={toggleSpin}
            disabled={controlsDisabled}
          >
            {spinning ? "Stop spin" : "Spin"}
          </button>
        </div>
      </div>
    </div>
  );
}
