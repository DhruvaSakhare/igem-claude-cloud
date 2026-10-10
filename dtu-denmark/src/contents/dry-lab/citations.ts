import type { CitationKey } from "./bibliography";

/* ========================================================================== *
 *  What each section of the Dry Lab pages cites
 *
 *  Split the way the section itself is split, because the two pages showing it
 *  no longer show the same amount of it: the METHODS page renders the
 *  introduction and the three method cards, while the two boxes on the
 *  DISCOVERY page render the method cards alone (see ChannelMethodsBox.tsx).
 *  Each page's reference list must contain exactly what that page cites — a
 *  work listed but never cited is worse than one missing — so each takes the
 *  list that matches what it renders.
 *
 *  Its own module, with no imports but a type, for two reasons: both pages and
 *  the box can read it without anyone importing a page (model_methods.tsx must
 *  never import ChannelMethodsBox.tsx — that would be a cycle), and constants
 *  exported from a file that also exports components trip
 *  react-refresh/only-export-components. Same reasoning as MvizMoreInline.ts.
 *
 *  KEEP IN STEP WITH THE PROSE. These lists are written out, not derived: add a
 *  key here when you add a `<Cite>` to the matching component, and remove it
 *  when the sentence carrying it goes.
 * ========================================================================== */

/** What the three introduction paragraphs cite (see ChannelIntro.tsx). */
export const CHANNEL_INTRO_CITATIONS: readonly CitationKey[] = [
  "BarrosReguera2025",
  "RamirezEscudero2018",
  "RamirezRamirez2020",
];

/** What the three method cards cite: fpocket cites LeGuilloux2009 and CAVER
 *  cites Chovancova2012; the channel-discovery-pipeline card cites nothing.
 *  The cards themselves are in model_methods.tsx. */
export const CHANNEL_METHOD_CITATIONS: readonly CitationKey[] = [
  "Chovancova2012",
  "LeGuilloux2009",
];

/** The whole section — introduction and method cards — for a page showing
 *  both. Sorted by key, which for these entries is alphabetical by first
 *  author, the usual order for an author–year scheme. */
export const CHANNEL_CITATIONS: readonly CitationKey[] = [
  ...CHANNEL_INTRO_CITATIONS,
  ...CHANNEL_METHOD_CITATIONS,
].sort();

/* -------------------------------------------------------------------------- *
 *  UPO structural assessment — the docking and molecular-dynamics methods
 *
 *  What the two boxes in structural-methods.tsx cite. Both UPO sections render
 *  both boxes, so both sections carry these works.
 * -------------------------------------------------------------------------- */

/** The docking pipeline: RDKit, and AutoDock Vina's two papers. (Meeko is
 *  cited by its repository URL in the prose, not as a paper.) */
export const DOCKING_METHOD_CITATIONS: readonly CitationKey[] = [
  "Eberhardt2021",
  "Riniker2015",
  "Trott2009",
];

/** The molecular-dynamics pipeline: the engine, the force fields and water
 *  model, the charge method, the integrator and barostat, the long-timestep
 *  method, and the trajectory analysis library. */
export const MD_METHOD_CITATIONS: readonly CitationKey[] = [
  "Boothroyd2023",
  "Case2023",
  "Eastman2023",
  "Hopkins2015",
  "Jakalian2002",
  "Jorgensen1983",
  "Leimkuhler2012",
  "Maier2015",
  "McGibbon2015",
  "qvist2004",
];

/* -------------------------------------------------------------------------- *
 *  The result sections' own prose
 * -------------------------------------------------------------------------- */

/** The UPO structural-assessment introduction, which motivates docking and MD
 *  from what has been done on PaDa-I and MroUPO. */
export const UPO_STRUCTURAL_CITATIONS: readonly CitationKey[] = [
  "Knorrscheidt2021",
  "RamirezRamirez2020",
];

/** The literature channel-discovery results: the activity measurements the
 *  four reference UPOs are ordered by, the family-level structure-function
 *  survey their geometry is read against, and CAVER, named in the paragraph on
 *  why a comparison method was needed at all. */
export const CHANNEL_RESULTS_CITATIONS: readonly CitationKey[] = [
  "BarrosReguera2025",
  "Chovancova2012",
  "Dolz2022",
  "RamirezEscudero2018",
  "RamirezRamirez2020",
];

/** The laccase discovery pipeline: the dissertation the seed sequences come
 *  from, the review the mediator mechanism and the T1 copper centre are taken
 *  from, and the three works behind the tools the method boxes describe — CUPP,
 *  ProSmith, and the ESM protein language model ProSmith embeds its enzymes
 *  with. Kroll2024 is ProSmith; Kroll2023 (ESP) is a different paper by the
 *  same group and is NOT what the laccase pipeline used. */
export const LACCASE_CITATIONS: readonly CitationKey[] = [
  "Aza2023",
  "Barrett2020",
  "Kroll2024",
  "Rives2021",
  "Wongwattanarat2025",
];

/** The UPO CUPP database discovery: BLAST (via the NCBI resources paper),
 *  MMseqs2 (via the two MPI Bioinformatics Toolkit papers), CUPP, ProSmith, and
 *  Boltz-2 with the two works cited alongside it. All are cited inside the
 *  "More details on the CUPP pipeline" box in model_discovery.tsx. */
export const UPO_CUPP_CITATIONS: readonly CitationKey[] = [
  "Barrett2019",
  "Gabler2020",
  "Kroll2024",
  "Mirdita2022",
  "Passaro2025",
  "Sayers2024",
  "Wohlwend2024",
  "Zimmermann2018",
];

/** The laccase rational-design section on the Engineering page: the paper the
 *  two starting laccases come from, the CueO copper-site and engineering
 *  papers the design is transferred from, MutateX, and BLAST (via the NCBI
 *  resources paper) for the identity table. */
export const LACCASE_RATIONAL_CITATIONS: readonly CitationKey[] = [
  "Djoko2010",
  "Grass2004",
  "Kataoka2007",
  "Kataoka2013",
  "Sayers2024",
  "Tiberti2022",
  "Wongwattanarat2025",
];

/** The UPOs literature discovery introduction on the Discovery page: the
 *  review and the PaDa-I structure paper behind its description of the UPO
 *  active site and access channel. */
export const UPO_LITERATURE_INTRO_CITATIONS: readonly CitationKey[] = [
  "Hofrichter2014",
  "RamirezEscudero2018",
];
