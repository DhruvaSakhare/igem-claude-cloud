/* ========================================================================== *
 *  Structure catalogue for the 3D viewer
 *
 *  The structure lists StructureViewer can show, plus the types they are built
 *  from. Kept out of StructureViewer.tsx so that file exports only its
 *  component (react-refresh/only-export-components) and so a page can pick a
 *  list without pulling anything else in.
 *
 *  The lists, and which viewer each one feeds — two viewers on Discovery and
 *  one on Engineering:
 *    • LITERATURE_STRUCTURES — UPOs with experimentally measured activity.
 *      Also the viewer's default.
 *    • ADDITIONAL_STRUCTURES — the counterpart set, activity NOT measured.
 *      Neither of those two is a viewer of its own any more: each heads a
 *      group of tunnel figures in "UPOs literature discovery", and the
 *      structures are shown together by —
 *    • LITERATURE_ALL_STRUCTURES — both of the above, in the single viewer
 *      that closes that section's channel-discovery subsection.
 *    • DATABASE_STRUCTURES   — the database-search candidates, labelled by
 *      UniProt accession, shown under the channel-discovery subsection of
 *      "UPOs database discovery".
 *    • DESIGN_STRUCTURES     — the RFdiffusion backbones the team designed,
 *      shown in the RFdiffusion subsection of "UPOs engineering results" on the
 *      ENGINEERING page. The only list that is neither curated nor searched
 *      for, so the only one whose files are not named after a database entry.
 * ========================================================================== */

/**
 * Optional overlays layered on top of the chosen structure. Each structure
 * supplies its own file per overlay (see `Structure.overlays`), so a structure
 * can only ever show its OWN overlays. The user toggles any combination on/off.
 *   • pocket_surface — fpocket pocket-lining atoms → molecular surface
 *   • channel        — channel pseudo-atoms → spheres coloured by b-factor
 *                      (b-factor = channel radius along the path)
 *   • docking        — the docked NNBT ligand pose (ligand-only file) as sticks
 */
export type OverlayId = "pocket_surface" | "channel" | "docking";

/** How a fetched file is encoded. `mmjson` is gemmi's mmCIF-as-JSON, which
 *  3Dmol cannot parse — it is converted to PDB text before use (see mmjson.ts).
 *  Files served from iGEM's uploads host must use it, since the tool does not
 *  accept `.pdb`. */
export type FileFormat = "pdb" | "mmjson";
export type FileRef = { url: string; format: FileFormat };

/**
 * The database entry a structure comes from: the accession shown beside the
 * name on its tab, and the source page linked from the tab's ↗ chip. Kept as a
 * generic {id, href, source} rather than a bare PDB id because the two lists
 * below cite different databases — the literature set is RCSB PDB entries, the
 * candidate set is UniProt accessions.
 */
export type Accession = { id: string; href: string; source: string };

export const rcsb = (id: string): Accession => ({
  id,
  href: `https://www.rcsb.org/structure/${id}`,
  source: "RCSB PDB",
});
export const uniprot = (id: string): Accession => ({
  id,
  href: `https://www.uniprot.org/uniprotkb/${id}`,
  source: "UniProt",
});

/**
 * The role an annotated active-site residue plays. Purely a grouping key: the
 * label and colour each role is drawn with are the viewer's business and live
 * in FEATURES in StructureViewer.tsx, the same way OverlayId is defined here
 * but OVERLAYS (labels, swatches) is defined there.
 */
export type FeatureId =
  | "channel_entrance"
  | "aromatic_triad"
  | "structural_anchor"
  | "catalytic";

/**
 * One annotated residue: its number in the file, the code shown to the reader,
 * the role it is grouped under, and an optional note shown when the reader taps
 * it. `resi` must match the residue numbering of `Structure.base` — the viewer
 * selects on it directly.
 */
export type Residue = {
  resi: number;
  code: string;
  feature: FeatureId;
  note?: string;
};

/** A stretch of the chain whose cartoon is drawn in its own colour, inclusive
 *  at both ends. Like `Residue.resi`, `from`/`to` follow the numbering of
 *  `Structure.base`. `label` is what the legend calls it. */
export type Region = {
  from: number;
  to: number;
  label: string;
};

/** A selectable structure: one base file plus a file per available overlay.
 *  `residues` is optional — a structure that has none is simply shown without
 *  highlighted sticks, a legend or an active-site framing (see StructureViewer). */
export type Structure = {
  id: string;
  label: string;
  note: string;
  accession?: Accession;
  /** Short identifier shown on the tab beside the label, for a structure that
   *  has no `accession` to supply one. Same slot, same monospace treatment —
   *  the difference is that an accession also gets a ↗ link to its database
   *  entry, while a `code` links nowhere because there is nowhere to link to.
   *  Set it only to something that identifies the structure to a reader (the
   *  designed backbones use a shortened upload name); a tab with neither shows
   *  its label alone. */
  code?: string;
  base: FileRef;
  overlays: Partial<Record<OverlayId, FileRef>>;
  residues?: Residue[];
  regions?: Region[];
};

/* --- every structure is served from iGEM's asset host ---------------------- *
 * The uploads tool rejects .pdb, so these are gemmi mmCIF-as-JSON, converted
 * client-side by mmjsonToPdb(). The tool also normalises names, and it has done
 * so consistently for every file — `<id>/<id>-<suffix>.json`, id lowercase,
 * underscores to hyphens (5OXU_pocket_atm.pdb → 5oxu/5oxu-pocket-atm.json) — so
 * the URLs are derived from that convention. The same convention holds for the
 * database-search candidates, whose id is the UniProt accession lowercased
 * (A0A9P7RSA8 → a0a9p7rsa8/a0a9p7rsa8-heme.json).
 * A future upload that lands under a different name can still be written out in
 * full: `overlays` takes any FileRef, and `format: "pdb"` is still supported for
 * a file served from public/.
 *
 * static.igem.wiki sends `access-control-allow-origin: *`, so the cross-origin
 * fetch() is allowed — an <img> would not have needed it, but fetch() does. */
const IGEM_STRUCTURES =
  "https://static.igem.wiki/teams/6060/wiki/drylab/structures";
const igemJson = (id: string, suffix: string): FileRef => ({
  url: `${IGEM_STRUCTURES}/${id}/${id}-${suffix}.json`,
  format: "mmjson",
});
/** The base file with NO suffix — `<id>/<id>.json`. Everything curated or
 *  searched for names its base file `-heme`, but the designed backbones were
 *  uploaded under the bare id, so they need this instead. */
const igemBase = (id: string): FileRef => ({
  url: `${IGEM_STRUCTURES}/${id}/${id}.json`,
  format: "mmjson",
});

/** The upload suffix each overlay's file carries. One source of truth, so a
 *  structure supplying only SOME overlays (see `overlayFiles`) still points at
 *  the same names as one supplying all three. */
const OVERLAY_SUFFIX: Record<OverlayId, string> = {
  pocket_surface: "pocket-atm",
  channel: "channel",
  docking: "docking-nnbt",
};

/** Overlay files for the overlays a structure ACTUALLY has — or, for a set
 *  the team has chosen to show fewer overlays for (see `teamModel`), the ones
 *  it SHOULD show.
 *
 *  `true` means the conventional suffix above; a STRING is an explicit suffix,
 *  for an upload that landed under a different name. Nothing needs one today —
 *  Design 1's blind-docking pose did until it was re-uploaded conventionally
 *  (see DESIGN_STRUCTURES) — but the uploads tool keeps producing odd names, so
 *  the escape hatch stays. Only name an overlay whose
 *  file was really uploaded: the viewer greys out a toggle a structure does not
 *  name, but a named-yet-missing file is a fetch error at the click. */
const overlayFiles = (
  id: string,
  overlays: Partial<Record<OverlayId, true | string>>,
): Structure["overlays"] => {
  const files: Structure["overlays"] = {};
  for (const key of Object.keys(overlays) as OverlayId[]) {
    const suffix = overlays[key];
    if (!suffix) continue;
    files[key] = igemJson(id, suffix === true ? OVERLAY_SUFFIX[key] : suffix);
  }
  return files;
};

/** All three overlays, each under its conventional name — what every curated
 *  and searched-for structure supplies. */
const igemOverlays = (id: string): Structure["overlays"] =>
  overlayFiles(id, { pocket_surface: true, channel: true, docking: true });

/** The UPOs of the "UPOs literature discovery" section whose activity has been
 *  measured, headed "Known UPOs with experimentally measured activity". Still
 *  the StructureViewer component's default prop value, though no viewer on the
 *  site passes it on its own any more — the section's viewer takes
 *  LITERATURE_ALL_STRUCTURES, this list plus the one below.
 *
 *  That heading is what this list means: UPOs whose activity HAS been measured
 *  experimentally. ADDITIONAL_STRUCTURES below is the counterpart, the ones
 *  where it has not. The distinction is the team's — nothing in the files
 *  records it — so keep the two lists in step with the two headings in
 *  model_discovery.tsx. Moving a structure from one list to the other is a
 *  claim about whether its activity was measured, not a presentation tweak.
 *
 *  Membership is therefore not about provenance: the first three are
 *  literature-curated PDB entries, each carrying the active-site residues
 *  annotated for it (the residue numbers are the team's own reading of the
 *  entry), while GroGu, added last, is a team structure with no database entry
 *  and no annotated residues. They sit together because of the measurement,
 *  not because of where they came from. */
/** PabUPO-II (PDB 9HE9). Pulled out of the list below into a named const
 *  because it appears in TWO viewers: the literature set on the Discovery page,
 *  and the Engineering page's viewer, where it sits alongside the designed
 *  backbones (see ENGINEERING_STRUCTURES). One definition, so its files,
 *  accession and annotated residues cannot drift between the two. */
export const PABUPO_II: Structure = {
  id: "9he9",
  label: "PabUPO-II",
  note: "Reference heme enzyme (PDB 9HE9) with a HEME cofactor.",
  accession: rcsb("9HE9"),
  base: igemJson("9he9", "heme"),
  overlays: igemOverlays("9he9"),
  residues: [
    {
      resi: 92,
      code: "Val92",
      feature: "channel_entrance",
      note: "Aliphatic — replaces the protruding phenylalanines seen at the entrance of some canonical UPOs.",
    },
    {
      resi: 207,
      code: "Ile207",
      feature: "channel_entrance",
      note: "Aliphatic — replaces the protruding phenylalanines seen at the entrance of some canonical UPOs.",
    },
    { resi: 85, code: "Phe85", feature: "aromatic_triad" },
    { resi: 137, code: "Phe137", feature: "aromatic_triad" },
    { resi: 215, code: "Phe215", feature: "aromatic_triad" },
    {
      resi: 212,
      code: "Glu212",
      feature: "catalytic",
      note: "Flexible — adopts alternate proximal and distal conformations relative to the substrate. Acid–base pair with Arg205.",
    },
    {
      resi: 205,
      code: "Arg205",
      feature: "catalytic",
      note: "Acid–base pair with Glu212.",
    },
  ],
};

export const LITERATURE_STRUCTURES: Structure[] = [
  {
    id: "5oxu",
    label: "PaDa-I",
    note: "Reference heme enzyme (PDB 5OXU) with a HEME cofactor.",
    accession: rcsb("5OXU"),
    base: igemJson("5oxu", "heme"),
    overlays: igemOverlays("5oxu"),
    residues: [
      { resi: 76, code: "Phe76", feature: "channel_entrance" },
      { resi: 191, code: "Phe191", feature: "channel_entrance" },
      { resi: 69, code: "Phe69", feature: "aromatic_triad" },
      { resi: 121, code: "Phe121", feature: "aromatic_triad" },
      { resi: 199, code: "Phe199", feature: "aromatic_triad" },
      { resi: 196, code: "Glu196", feature: "catalytic" },
      { resi: 189, code: "Arg189", feature: "catalytic" },
    ],
  },
  {
    id: "5fuj",
    label: "MroUPO",
    note: "Reference heme enzyme (PDB 5FUJ) with a HEME cofactor.",
    accession: rcsb("5FUJ"),
    base: igemJson("5fuj", "heme"),
    overlays: igemOverlays("5fuj"),
    residues: [
      { resi: 160, code: "Phe160", feature: "structural_anchor" },
      { resi: 157, code: "Glu157", feature: "catalytic" },
      { resi: 86, code: "His86", feature: "catalytic" },
    ],
  },
  PABUPO_II,
  {
    // Team structure, not a database entry — hence no `accession`, so the tab
    // shows the name alone with no id chip and no ↗ source link (the viewer
    // makes both conditional on `accession`).
    //
    // No `residues` either: its active site has not been annotated, so the
    // viewer draws it without highlighted sticks or a legend and opens framed
    // on the whole fold instead of on the cofactor. Add a `residues` list here
    // to give it the same treatment as the entries above.
    //
    // What the uploaded file contains, read off the file rather than assumed:
    // 334 protein residues on chain A, one heme b (HEM, 43 atoms) on chain B,
    // and no metal ion — the reference entries above each carry an Mg²⁺ as
    // well. Its B-factor column runs 57.6–99.0 with a mean of 97.7, which is a
    // pLDDT confidence range rather than crystallographic B-factors, so this is
    // a predicted model. All four files (base + three overlays) are uploaded.
    id: "grogu",
    label: "GroGu",
    note: "Team structure GroGu — a predicted heme-enzyme model with a HEME cofactor. PLACEHOLDER description: replace with what GroGu actually is (how it was produced, and what it is meant to show) once that can be stated accurately.",
    base: igemJson("grogu", "heme"),
    overlays: igemOverlays("grogu"),
  },
];

/** The second set of the "UPOs literature discovery" section, headed "Known
 *  UPOs with not experimentally measured activity". It had its own viewer
 *  below the one above; both are now the one viewer built from
 *  LITERATURE_ALL_STRUCTURES, and what this list still drives on its own is
 *  that heading and its row of tunnel figures.
 *
 *  That heading is what separates the two lists: these are UPOs whose activity
 *  has NOT been measured experimentally, while the set above holds the ones
 *  where it has. The distinction is the team's — nothing in the files records
 *  it — so keep the two lists in step with the two headings in
 *  model_discovery.tsx. Moving a structure from one list to the other is a
 *  claim about whether its activity was measured, not a presentation tweak.
 *
 *  Same shape as that list: reference UPO entries from the PDB plus one team
 *  structure. None carries `residues` — no active site has been annotated for
 *  these three, so the viewer draws them without highlighted sticks or a legend
 *  and frames the whole fold. Add a `residues` list to any entry to give it the
 *  same treatment as the annotated entries above. */
export const ADDITIONAL_STRUCTURES: Structure[] = [
  {
    // Team structure, like GroGu above: no `accession`, so no id chip and no ↗
    // source link on the tab.
    //
    // From the file: 329 protein residues on chain A, one heme b on chain B and
    // no metal ion. B-factors run 72.3–99.0, mean 98.6 — a pLDDT range, so this
    // is a predicted model. Its heme is labelled LIG rather than HEM, which is
    // how the Boltz-predicted models name every non-polymer component; the
    // viewer copes because parseHetGroups classifies HETATM groups by SHAPE
    // (a >1-atom residue is a molecule, drawn as sticks) rather than by name.
    id: "fett",
    label: "Fett",
    note: "Team structure Fett — a predicted heme-enzyme model, heme labelled LIG. PLACEHOLDER description: replace with what Fett actually is (how it was produced, and what it is meant to show) once that can be stated accurately.",
    base: igemJson("fett", "heme"),
    overlays: igemOverlays("fett"),
  },
  {
    // Experimental entry: single chain A (resi -3..304, 240 residues), HEME +
    // one Mg²⁺, B-factors 17.2–70.3 (crystallographic, not pLDDT).
    // Label and description are taken verbatim from the PDB entry title, which
    // names the enzyme MweUPO-1.
    id: "8rnj",
    label: "MweUPO-1",
    note: "Unspecific peroxygenase from Marasmius wettsteinii (MweUPO-1), PDB 8RNJ, with a HEME cofactor.",
    accession: rcsb("8RNJ"),
    base: igemJson("8rnj", "heme"),
    overlays: igemOverlays("8rnj"),
  },
  {
    // Experimental entry: single chain A (resi 25..303, 227 residues), HEME +
    // one Mg²⁺, B-factors 6.1–91.3 (crystallographic, not pLDDT).
    // The PDB title gives no short enzyme name for this one, so the label is
    // the organism from that title rather than an abbreviation invented here.
    id: "7o1r",
    label: "Hypoxylon sp. UPO",
    note: "Unspecific peroxygenase from Hypoxylon sp. EC38, PDB 7O1R, solved in complex with imidazole; the uploaded file carries a HEME cofactor.",
    accession: rcsb("7O1R"),
    base: igemJson("7o1r", "heme"),
    overlays: igemOverlays("7o1r"),
  },
];

/** The two lists above in one viewer: all seven literature UPOs, measured set
 *  first.
 *
 *  The split between them is still real and still drives the page — each set
 *  has its own heading, its own intro and its own row of tunnel figures — but
 *  the STRUCTURES are now shown together, in a single viewer that closes the
 *  channel-discovery subsection. Two viewers, one per group, put the same three
 *  overlays and the same controls on screen twice and made comparing a measured
 *  UPO against an unmeasured one a matter of scrolling between two WebGL
 *  canvases.
 *
 *  A module-level constant rather than a spread at the call site: the viewer
 *  keys state off `structures[0].id` and reads the array on every render, so a
 *  fresh array each time would be needless work. Order is tab order, and the
 *  first entry is the one the viewer opens on — PaDa-I, the most active
 *  reference, as before. */
export const LITERATURE_ALL_STRUCTURES: Structure[] = [
  ...LITERATURE_STRUCTURES,
  ...ADDITIONAL_STRUCTURES,
];

/** One database-search candidate, built from its UniProt accession alone.
 *  Every field is derived: the tab label is the accession, the id is it
 *  lowercased (which is also the upload-tool file id), and the four files
 *  follow the `<id>/<id>-<suffix>.json` convention documented above. So adding
 *  a candidate is one accession in the list below — as long as its four files
 *  were uploaded under that convention. A candidate that needs anything
 *  bespoke (an annotated active site, an oddly-named upload) should be written
 *  out as a full `Structure` literal instead, the way the literature set is. */
const candidate = (acc: string): Structure => {
  const id = acc.toLowerCase();
  return {
    id,
    label: acc,
    note: `Database-search candidate, UniProt ${acc}, with a HEME cofactor.`,
    accession: uniprot(acc),
    base: igemJson(id, "heme"),
    overlays: igemOverlays(id),
  };
};

/** The database-search candidates, labelled by UniProt accession, shown in the
 *  viewer headed "Putative UPOs from our CUPP discovery pipeline".
 *
 *  PUTATIVE is the operative word and the reason this list is titled apart from
 *  the two above: those hold known UPOs, split by whether their activity was
 *  measured, while these are UniProt hits whose UPO assignment comes from
 *  sequence alone. Their structures are predicted, not solved — the files carry
 *  pLDDT-range B-factors and a LIG-named heme, the Boltz convention. Nothing
 *  here is experimentally established, so keep any wording about them hedged.
 *
 *  Same four files per entry as the sets above (base + three overlays), so the
 *  viewer behaves identically — only the file ids differ. No `residues`: their
 *  active sites have not been annotated, so the viewer shows them without
 *  highlights and frames the whole protein instead.
 *
 *  Order is the tab order, and the first entry is the one the viewer opens on,
 *  so the original three stay at the front; the rest follow alphabetically. */
export const DATABASE_STRUCTURES: Structure[] = [
  candidate("A0A9P7RSA8"),
  candidate("A0A0C9UQE3"),
  candidate("A0A0C9VQZ5"),
  candidate("A0A0C4E1P3"),
  candidate("A0A2H3E6E9"),
  candidate("A0A4S8L4J7"),
  candidate("A0A8H6HXY8"),
  candidate("A0A9P5XE54"),
  candidate("A0A9P5Z220"),
];

/** One designed backbone, built from the name it was uploaded under. Unlike the
 *  sets above these are not database entries and not curated from anywhere, so:
 *    • no `accession` — the tab would otherwise show an id chip and a ↗ link to
 *      a source page that does not exist;
 *    • no `residues` — nothing has been annotated on them, so the viewer draws
 *      them without highlighted sticks or a legend and frames the whole fold;
 *    • `igemBase`, not `igemJson(id, "heme")` — see the note on igemBase.
 *
 *  `overlays` names only the overlay files that exist for that design, `true`
 *  for the conventional suffix or a string for one uploaded under a different
 *  name. Do not pad it out: an overlay named here but missing on the host is a
 *  fetch error when the reader clicks it, whereas one simply left out is a
 *  greyed-out toggle, which is the honest state.
 *
 *  The id derivation (lowercase, underscores to hyphens) is the same upload-tool
 *  normalisation documented on IGEM_STRUCTURES above; these names just make it
 *  much more visible than a four-character PDB id does. */
const design = (
  file: string,
  label: string,
  overlays: Partial<Record<OverlayId, true | string>>,
): Structure => {
  const id = file.toLowerCase().replace(/_/g, "-");
  return {
    id,
    label,
    // Short handle for the tab chip, since "Design 1" is positional and says
    // nothing about which upload it is. Only the RUN PREFIX is dropped —
    // `partial_input_partial_rfd3_` is byte-identical across every design, so
    // it distinguishes nothing, while everything that does identify a design is
    // kept verbatim. The full name stays in `note`, which the viewer shows as
    // the tab's tooltip, so the abbreviation never loses the trail.
    code: file.replace("partial_input_partial_rfd3_", ""),
    // Names the source upload, so a placeholder-labelled tab can always be
    // traced back to a file. Shown as the tab's hover/focus tooltip by the
    // viewer.
    note: `RFdiffusion partial-diffusion backbone \`${file}\`, with a HEME cofactor.`,
    base: igemBase(id),
    overlays: overlayFiles(id, overlays),
  };
};

/** The designed UPO backbones, in tab order — the first opens on mount.
 *
 *  Both carry a docked NNBT pose — the same 18-atom UNL ligand — and all
 *  two are now named conventionally, `-docking-nnbt`. Design 1 used to point
 *  at `-nnbt-blind-docking-nnbt` instead, because that was the only name its
 *  pose had been uploaded under; the same file has since been re-uploaded under
 *  the conventional name (identical bytes), so the special case is gone. The
 *  old name still resolves and can be dropped from the uploads tool.
 *
 *  BOTH POSES COME FROM A BLIND DOCKING RUN — a grid box covering the
 *  whole receptor, not one centred on the pocket. That is not visible in the
 *  file names any more, so it has to be said in the page prose instead. It is
 *  read off the files, not assumed: each design's pose is bit-identical to
 *  model 1 of that design's `<name>_NNBT_blind.pdbqt` (the naming docking.py
 *  writes for a run with no `--center`), and Design 1's uploaded JSON still
 *  carries `_entry.id: ..._NNBT_blind_docking_NNBT` from its source file.
 *  Design 2 lost that provenance when its pose was renamed to
 *  `_docking_NNBT` locally before upload; the coordinates are what identify
 *  them. If a design is ever re-docked with a targeted box, say so per design —
 *  do not let a uniform file name imply a uniform method.
 *
 *  Read off the files rather than assumed. Each is one protein chain A plus one
 *  heme b (HEM, 43 atoms) on chain B, with no metal ion — the experimental
 *  entries in the sets above each carry an Mg²⁺ as well. Design 1 is 335
 *  residues (numbered 1..335) and Design 2 is 336, so do NOT assume a
 *  shared residue numbering across the tabs: an annotation added for one design
 *  does not automatically transfer to another. Their B-factor column is flat
 *  (0.0–0.1), so unlike the predicted team structures (GroGu, Fett) these carry
 *  NO per-residue confidence: do not read the base structure's colouring as
 *  pLDDT. The channel overlays are unaffected — those store the channel radius
 *  in the same column (1.0–3.2 Å here) and still colour by it.
 *
 *  PLACEHOLDER LABELS: "Design 1..2" are stand-ins so the tabs stay readable —
 *  the upload names are far too long for a tab. Swap them for the team's own
 *  variant names once those exist; `note` keeps the upload name either way, so
 *  renaming a tab loses nothing. Because the numbers are positional and carry
 *  no meaning, they are RENUMBERED to stay contiguous when a design is dropped
 *  (a tab list starting at "Design 2" reads as a bug) — which means a number
 *  can change file between revisions. What ties a tab to its upload is the
 *  `code` chip on the tab itself (shortened) and the tooltip (`note`, in full);
 *  there used to be a list under the viewer on the Engineering page saying the
 *  same thing, and it was dropped as a duplicate once the tabs carried it. */
export const DESIGN_STRUCTURES: Structure[] = [
  design("rfd3_partial_input_partial_rfd3_4_model_9_2_model_0", "Design 1", {
    pocket_surface: true,
    channel: true,
    docking: true,
  }),
  design("rfd3_partial_input_partial_rfd3_0_model_0_9_model_0", "Design 2", {
    pocket_surface: true,
    channel: true,
    docking: true,
  }),
];

/** The tab list the ENGINEERING page's viewer is given: PabUPO-II (9HE9) as the
 *  reference, then the designed backbones.
 *
 *  Kept separate from DESIGN_STRUCTURES, which means "the backbones the team
 *  designed" and is used to say how many there are and what they are. 9HE9 is
 *  not one of them: it is an experimental PDB entry, so mixing it into that
 *  list would make the list a claim it is not.
 *
 *  REFERENCE FIRST, so the viewer opens on it and the reader meets the solved
 *  UPO before the generated backbones — a stated ordering choice, so keep the
 *  reference at the head if a design is added or dropped.
 *
 *  Note what opening here changes, since 9HE9 is unlike every other tab in this
 *  list: it is the only one with an accession (so the only one with an id chip
 *  and a ↗ link), and the only one carrying annotated active-site residues, so
 *  the viewer opens framed on the cofactor with the active-site legend shown
 *  and drops both when the reader moves to a design. That difference is honest
 *  — nothing has been annotated on the designs — but it does mean the first
 *  thing a reader sees is the tab LEAST representative of this section's
 *  subject, which the prose should account for.
 *
 *  WHAT THE COMPARISON MEANS IS FOR THE PAGE PROSE TO STATE. Whether 9HE9 is
 *  the partial-diffusion input, a benchmark, or simply the nearest solved UPO
 *  is not recorded in any file here — do not let the tab's position imply it. */
export const ENGINEERING_STRUCTURES: Structure[] = [
  // Region highlighted on THIS viewer only — the Discovery viewers use
  // PABUPO_II as it is. Same `id`, so UPO_ALIGNMENTS still finds it.
  {
    ...PABUPO_II,
    regions: [
      { from: 86, to: 107, label: "Residues 86–107" },
      { from: 312, to: 348, label: "Residues 312–348" },
    ],
  },
  ...DESIGN_STRUCTURES,
];

/** One rationally-engineered team variant shown in the Engineering section,
 *  built from the name it was uploaded under. Same construction as `design()`
 *  above — no `accession` and no `residues`, and `igemBase` rather than
 *  `igemJson(id, "heme")`, because these were uploaded under the bare id too —
 *  but kept a separate helper because these are NOT the RFdiffusion backbones
 *  and should not inherit that function's note wording. */
const teamModel = (id: string, label: string): Structure => ({
  id,
  label,
  // Two different kinds of statement, kept apart on purpose:
  //   • "predicted model … heme on chain B, labelled LIG" is read off the file.
  //   • "rationally engineered … for solvent stability" is the TEAM'S claim,
  //     taken from the heading they gave this viewer on the Engineering page.
  //     It is not in the file — if that heading changes, change this too.
  // What is still missing is per-structure: how each was made and how the three
  // differ from one another. That stays an explicit placeholder.
  note: `${label} — a rationally engineered UPO variant for solvent stability, as a predicted model with a 43-atom heme on chain B, labelled LIG. PLACEHOLDER description: replace with the design rationale for ${label} specifically (what was changed, and how it was evaluated) once that can be stated accurately.`,
  base: igemBase(id),
  // Docking pose only. The pocket and channel files were uploaded for all
  // three, but the team chose not to show those overlays for this set, so the
  // viewer on the Engineering page offers the docked NNBT and nothing else. To
  // bring them back, use igemOverlays(id) as every other structure does.
  overlays: overlayFiles(id, { docking: true }),
});

/** The three rationally-engineered variants shown in their own viewer on the
 *  ENGINEERING page, headed "Rational Engineered UPOs for Solvent Stability",
 *  above the viewer holding the RFdiffusion backbones.
 *
 *  The two viewers are two different engineering routes, not two halves of one:
 *  this list is the rational-design track, the other is the RFdiffusion track
 *  ("RFdiffusion Engineered UPOs for Better Channel"). Keep them in separate
 *  lists and separate viewers for that reason.
 *
 *  Read off the uploaded files rather than assumed, and note this makes them a
 *  DIFFERENT KIND of file from DESIGN_STRUCTURES — do not describe the two sets
 *  the same way:
 *    • one protein chain A (Zillo 348 residues, Wampa 328, Taun-taun 334) plus
 *      one 43-atom heme b on chain B, and no metal ion;
 *    • the heme is named LIG, which is how Boltz-predicted models name every
 *      non-polymer component (Fett in ADDITIONAL_STRUCTURES is the same). The
 *      viewer copes: parseHetGroups classifies HETATM groups by shape, not by
 *      name;
 *    • their B-factor columns run 47.3–99.0, 71.2–99.0 and 59.9–99.0 with means
 *      of 96–99, which is a pLDDT confidence range — so these are PREDICTED
 *      models, unlike the RFdiffusion backbones whose B-factor column is flat
 *      (0.0–0.1) and carries no confidence at all.
 *
 *  ONLY THE DOCKING OVERLAY IS SHOWN. All three had pocket and channel files
 *  uploaded under the conventional suffixes too, but the team chose to show
 *  neither for this set, so `teamModel` names the docking pose alone — and the
 *  viewer, finding no structure in its list with a pocket or channel, leaves
 *  those two toggles out altogether. Their docked NNBT pose is named
 *  `-docking-nnbt` with no mode token, so unlike the designs nothing in the
 *  files says whether the run was blind or targeted: state it in the page prose
 *  from what was actually run, do not infer it.
 *
 *  IF THE CHANNEL OVERLAY IS EVER RESTORED: Wampa's channel reaches 4.89 Å,
 *  past the top of the viewer's fixed 0–4 Å colour scale, so its widest points
 *  would all take the end colour. That is what the scale's "4 Å and wider" note
 *  is for, but if reading Wampa's mouth width off the colour matters, widen
 *  CHANNEL_MAX_A in StructureViewer.tsx instead — and accept that it re-colours
 *  every structure.
 *
 *  PLACEHOLDER LABELS ARE NOT THE ISSUE HERE — the names are the team's own
 *  upload names, and the viewer heading says what the set is for. What is still
 *  missing is the per-structure rationale; see `teamModel`. */
export const ENGINEERING_TEAM_STRUCTURES: Structure[] = [
  teamModel("zillo", "Zillo"),
  teamModel("wampa", "Wampa"),
  teamModel("taun-taun", "Taun-taun"),
];
