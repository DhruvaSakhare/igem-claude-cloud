/* ========================================================================== *
 *  Laccase structure catalogue for LaccaseViewer
 *
 *  Kept apart from structures.ts because the two viewers want different data.
 *  A UPO `Structure` carries one file per overlay (pocket surface, channel,
 *  docked pose), each uploaded separately. A laccase carries ONE file: the
 *  surface is computed in the browser, and the T1 site is a position, so
 *  neither needs a file of its own.
 *
 *  WHERE THE NUMBERS COME FROM
 *  Every value below was computed from the team's own PyMOL sessions by
 *  scripts/laccase_structures.py, which prints what it found and the distances
 *  it decided on (scripts/out/report.json). Nothing here was looked up or
 *  estimated. Read that script's docstring before changing anything in here.
 *
 *  In a multicopper oxidase the T1 copper is the one with a cysteine sulphur in
 *  its coordination sphere; the T2/T3 trio is held by histidines alone. In each
 *  of the four sessions carrying real coppers exactly one copper qualified, so
 *  the pick was never ambiguous. Two sessions carry no copper at all, and for
 *  those the site is the centroid of the three HCH ligating atoms — the same
 *  definition the team's docking program uses for its search box.
 *
 *  The method checks out against the literature: CueO came out as
 *  His443/Cys500/His505, which is the published T1 site of E. coli CueO, and
 *  that was not fed to the script. Every structure also shows the same
 *  His-Cys-X4-His spacing.
 *
 *  THE SESSIONS' OWN PSEUDOATOMS ARE DELIBERATELY NOT USED. A0A517I632's
 *  `t1_centroid` is right (1.1 A from the centroid below), but A0A7T1FRB0's
 *  `Cu_site` is 16.3 A out: its coordinates are three affinity values from the
 *  results CSV, pasted in from the wrong columns. The docking run itself used
 *  the correct centre, so only that session is affected — but computing the
 *  site from the structure every time avoids the whole class of mistake.
 * ========================================================================== */

import type { Accession, FileRef } from "./structures";
import { uniprot } from "./structures";

/** A point in the structure's own coordinates, with how it was arrived at.
 *  `copper` is a real copper ion in the file; `hch_centroid` is the centroid of
 *  the HCH ligating atoms, for a structure predicted without its metals. The
 *  viewer draws both the same way — one sphere — because they mean the same
 *  thing to a reader: this is where the substrate is oxidised. */
export type T1Site = {
  x: number;
  y: number;
  z: number;
  source: "copper" | "hch_centroid";
};

/** The three residues holding the T1 copper, in sequence order. `cys` sits
 *  between the two histidines, four to five residues before the second. */
export type HchMotif = {
  his1: number;
  cys: number;
  his2: number;
};

export type LaccaseStructure = {
  id: string;
  label: string;
  /** One line under the tabs: what this structure is to the campaign. */
  note: string;
  accession?: Accession;
  /** One of the "pocket laccases" — the subgroup whose T1 copper carries a
   *  small surface pocket. Shown as a tag under the tab's label. */
  pocket?: boolean;
  /** Name of a docked substrate carried in the base file as HETATM residue
   *  `UNL`. The viewer draws it as sticks and adds it to the key. */
  ligand?: string;
  base: FileRef;
  t1: T1Site;
  hch: HchMotif;
};

/* The uploads tool rejects .pdb, so these are gemmi mmCIF-as-JSON converted
 * client-side by mmjsonToPdb(), exactly like the UPO structures. Same host and
 * the same `<id>/<id>.json` layout the team's designed backbones use — upload
 * each file into a folder named after its id. */
const IGEM_STRUCTURES =
  "https://static.igem.wiki/teams/6060/wiki/drylab/structures";
/* `?v=` is for browsers, not the CDN. The host sends these files with a
 * two-year max-age, so a browser that fetched a file before it was last
 * re-uploaded keeps serving its old copy and the tab fails to load. A new query
 * string is a new cache entry; CloudFront ignores it and serves the current
 * file. Bump it whenever these files are re-uploaded under the same name. */
const CACHE_BUST = "v=2";
const igemBase = (id: string): FileRef => ({
  url: `${IGEM_STRUCTURES}/${id}/${id}.json?${CACHE_BUST}`,
  format: "mmjson",
});

/**
 * The six laccases the viewer offers, in the order the campaign met them: the
 * seed first, then the reference it was aligned against, then the four
 * candidates ordered for the wetlab (same order as the shortlist table).
 *
 * ItL-03 has no `accession` because it is not in UniProt — that absence is why
 * the campaign went through InterPro and Pfam at all.
 */
export const LACCASE_STRUCTURES: LaccaseStructure[] = [
  {
    id: "itl03",
    label: "ItL-03",
    note: "The seed: the most active enzyme in the dissertation this campaign started from.",
    base: igemBase("itl03"),
    t1: { x: -9.081, y: 8.974, z: 3.716, source: "copper" },
    hch: { his1: 459, cys: 516, his2: 521 },
  },
  {
    id: "cueo",
    label: "CueO",
    note: "The reference: the experimentally solved structure the alignment locates every other T1 site against.",
    accession: uniprot("P36649"),
    base: igemBase("cueo"),
    t1: { x: 23.347, y: 0.05, z: 39.904, source: "copper" },
    hch: { his1: 443, cys: 500, his2: 505 },
  },
  {
    id: "a0a517i632",
    label: "A0A517I632",
    note: "One of the “pocket laccases” — the subgroup whose T1 copper carries a small surface pocket.",
    accession: uniprot("A0A517I632"),
    pocket: true,
    // Protein plus the top-ranked of the nine guaiacol poses in the team's
    // Pocket.pse session (same protein coordinates as the plain file, so the
    // T1 site and HCH numbers below still hold). Uploaded under its own name
    // because overwriting a file on the iGEM host never reaches the CDN.
    ligand: "Docked guaiacol",
    base: {
      url: `${IGEM_STRUCTURES}/a0a517i632/a0a517i632-2.json`,
      format: "mmjson",
    },
    t1: { x: 12.39, y: 6.094, z: -1.749, source: "hch_centroid" },
    hch: { his1: 445, cys: 498, his2: 503 },
  },
  {
    id: "a0a7t1frb0",
    label: "A0A7T1FRB0",
    note: "Same CUPP group as ItL-03, and the best ProSmith score on NNBT.",
    accession: uniprot("A0A7T1FRB0"),
    base: igemBase("a0a7t1frb0"),
    t1: { x: 11.112, y: -4.502, z: -4.031, source: "hch_centroid" },
    hch: { his1: 419, cys: 492, his2: 497 },
  },
  {
    id: "a0aaj2ktq9",
    label: "A0AAJ2KTQ9",
    note: "The structurally most distant candidate, chosen from its own CUPP group.",
    accession: uniprot("A0AAJ2KTQ9"),
    base: igemBase("a0aaj2ktq9"),
    t1: { x: 2.785, y: 14.859, z: -1.225, source: "copper" },
    hch: { his1: 438, cys: 491, his2: 496 },
  },
  {
    id: "a0a1h2rll0",
    label: "A0A1H2RLL0",
    note: "Chosen member of its CUPP group, on its ProSmith score with guaiacol.",
    accession: uniprot("A0A1H2RLL0"),
    base: igemBase("a0a1h2rll0"),
    t1: { x: 7.117, y: -7.26, z: -2.335, source: "copper" },
    hch: { his1: 424, cys: 476, his2: 481 },
  },
];
