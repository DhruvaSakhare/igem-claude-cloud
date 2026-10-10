import { useEffect } from "react";

import { MODEL_PAGES, ModelPager } from "./ModelNav";
import { FigNum, NumberedFigures, TabNum } from "./FigureNumbers";
import TOC from "../../components/TOC";
import { TextBox } from "../../components/TextBox";
import { StructureViewer } from "../../components/StructureViewer";
import { LaccaseViewer } from "../../components/LaccaseViewer";
import { CHANNEL_BASE } from "./channel-assets";
import { TunnelFigure, FigureRow, WikiFigure } from "./ChannelFigures";
import { DATABASE_STRUCTURES, LITERATURE_ALL_STRUCTURES } from "./structures";
import { PageTitle, SectionHeading, SubsectionHeading } from "./SectionHeading";
import { referenceNodes } from "./Cite";
import type { CitationKey } from "./bibliography";
import { MD_BASE, MdFigureBlock } from "./MdFigures";
import { DetailsBox } from "./DetailsBox";
import { StructuralMethodsBox } from "./structural-methods";
import {
  BlastStage,
  BoltzStage,
  LaccaseDockStage,
  MethodBlock,
  ModelPipeline,
  MvizInfo,
  PhyloStage,
  ProSmithStage,
} from "./model_methods";
import { MvizMoreInline } from "./MvizMoreInline";
import type { PipelineStep } from "./model_methods";
import { Cite } from "./Cite";
import { ChannelMethodsBox, ChannelWorkflow } from "./ChannelMethodsBox";
import {
  CHANNEL_METHOD_CITATIONS,
  CHANNEL_RESULTS_CITATIONS,
  DOCKING_METHOD_CITATIONS,
  LACCASE_CITATIONS,
  MD_METHOD_CITATIONS,
  UPO_CUPP_CITATIONS,
  UPO_LITERATURE_INTRO_CITATIONS,
  UPO_STRUCTURAL_CITATIONS,
} from "./citations";
import ReferenceBar from "../../components/ReferenceBar";
import PartsTable from "../../components/PartsTable";
import type { TableRow } from "../../components/PartsTable";
import "./model_discovery.css";
import "./tracks.css";

/* ========================================================================== *
 *  Model → Discovery  (route /model-discovery)
 *
 *  Enzyme-discovery results: laccase discovery, then UPO discovery from the
 *  literature and from databases. The page opens on the shared windmill
 *  PageHero (title, lead and illustration from its entry in pages.ts).
 *
 *  Styling lives in model_discovery.css. Navigation
 *  between the four model pages is handled by the TOC (see MODEL_PAGES).
 * ========================================================================== */

/* -------------------------------------------------------------------------- *
 *  Channel-discovery figures (.chf-*)
 *
 *  The figure itself is `TunnelFigure`, shared with the Engineering page (see
 *  ChannelFigures.tsx). What stays here is which structures each row lists and
 *  in what order, plus the further asset paths derived from CHANNEL_BASE below.
 *
 *  The FIGURES are real; the surrounding prose is placeholder.
 * -------------------------------------------------------------------------- */

/** Where the laccase-discovery figures are uploaded. */
const LACCASE_BASE =
  "https://static.igem.wiki/teams/6060/wiki/drylab/laccase-discovery";

/** Where the CUPP channel-clustering figures are uploaded — the overlays, the
 *  dendrogram and the per-cluster grids of the database branch.
 *
 *  It also holds the two figures for the literature UPOs whose activity was not
 *  measured (the profile overlay and the projection onto the reference curve
 *  fit), which belong to the LITERATURE branch — they were uploaded here rather
 *  than beside the four-reference comparison figures. Read off the asset host,
 *  not inferred: check the upload before assuming a figure's folder follows its
 *  section. */
const CUPP_CLUSTER_BASE = `${CHANNEL_BASE}/cupp-clustering`;

/** Where the four-reference comparison figures of the literature branch are
 *  uploaded: the channel overlay with its spread and |ΔR| panels, and the three
 *  degradation-rate-against-channel-opening plots. */
const REFERENCE_COMPARISON_BASE = `${CHANNEL_BASE}/5oxu-9he9-5fuj-grogu-comparison`;

/** The UPO structural workflow — dock, then run dynamics on the pose — as the
 *  flowchart that opens the docking-and-dynamics subsection in both UPO
 *  branches.
 *
 *  A COPY of the Methods page's own structural flowchart, not a shared
 *  constant. That page still has its own (UPO_STRUCTURAL_WORKFLOW in
 *  model_methods.tsx, module-private and left exactly as it is); exporting it
 *  for this page to read would tie the two pages' flowcharts together, so that
 *  retitling a step here silently retitles it there. They are the same two
 *  steps today and may well diverge — this page is describing what was run on
 *  these enzymes, that one is describing the method in general.
 *
 *  What IS shared is `ModelPipeline`, the component that draws any flowchart on
 *  the Model pages. That is the same arrangement the laccase flowchart below
 *  already uses: shared renderer, page's own steps.
 *
 *  KEEP IN STEP BY HAND, or deliberately let them differ — but do not replace
 *  this with an import. */
const STRUCTURAL_WORKFLOW: PipelineStep[] = [
  {
    title: "Molecular docking",
    tag: "Binding",
    blurb:
      "Dock the substrate into the target pocket and score candidate poses.",
  },
  {
    title: "Molecular dynamics",
    tag: "Dynamics",
    blurb:
      "Relax the docked complex and follow how it moves over a trajectory.",
  },
];

/** The laccase discovery pipeline, shaped like UPO_CUPP_WORKFLOW below:
 *  sequence space → CUPP → ProSmith → the structural step, one step per TOOL
 *  rather than per document heading, so a reader who has seen one branch's
 *  flowchart can read the other's the same way. The two branches then differ
 *  only where the method does — Boltz co-folding for UPOs, our MSA + docking
 *  tool for laccases.
 *
 *  Seeding and the UniProt query are one "Sequence space" step here, as BLAST
 *  and MMseqs2 are one on the UPO side; the subsection below is where that step
 *  is told in full. Every step is named and described from the team's own
 *  laccase document; nothing is added to round the shape out.
 *
 *  This is ALSO what the method cards in the pipeline box use — all four
 *  steps, one card each, exactly as the UPO box uses its own array. One
 *  definition, so the flowchart and the cards cannot drift apart. */
const LACCASE_DISCOVERY_WORKFLOW: PipelineStep[] = [
  {
    title: "Sequence space",
    tag: "InterPro + UniProt + MMseqs2",
    blurb:
      "Annotate the ItL-03 seed with InterPro, query UniProt with its two Pfam entries, keep the better-annotated hits and homology-reduce them at 90% identity.",
  },
  {
    title: "CUPP",
    tag: "Clustering",
    blurb:
      "Group the sequence space into CUPP groups by conserved unique peptide patterns, with positive and negative anchors marking where the functional boundary falls.",
  },
  {
    title: "ProSmith",
    tag: "Substrate scoring",
    blurb:
      "Score every sequence against NNBT and against the mediator guaiacol, and keep the clusters that score high.",
  },
  {
    title: "MSA + docking",
    tag: "Binding at the T1 copper",
    blurb:
      "Locate the HCH motive by alignment, then dock both substrates in a box centred on the T1 copper and rank the results by affinity.",
  },
];

/** How each literature structure is named in every figure on this page: the
 *  common enzyme name first, its PDB id in brackets after — "PaDa-I (5OXU)".
 *  A reader meets the enzyme first and the database entry second, and the same
 *  structure is never labelled two different ways in two different figures.
 *
 *  Keyed by slug, which is both the upload path under `channel-discovery/` and
 *  `molecular-dynamics/` and the id used by the structure viewer. The names
 *  match the `label`s in structures.ts, which is where the viewer tabs take
 *  theirs from — keep the two in step.
 *
 *  GroGu and Fett are team structures with no database entry, so they are the
 *  bare name with nothing in brackets. 7O1R's PDB title gives no short enzyme
 *  name, so it is named by organism rather than an abbreviation invented here.
 *
 *  The UniProt candidates further down are NOT in here: they take their labels
 *  from DATABASE_STRUCTURES, and an accession is all they have. */
const LIT_NAMES: Record<string, string> = {
  "9he9": "PabUPO-II (9HE9)",
  "5fuj": "MroUPO (5FUJ)",
  "5oxu": "PaDa-I (5OXU)",
  "8rnj": "MweUPO-1 (8RNJ)",
  "7o1r": "Hypoxylon sp. UPO (7O1R)",
  grogu: "GroGu",
  fett: "Fett",
};

/** The structures shown in the literature MOLECULAR-DYNAMICS rows, as slugs
 *  into LIT_NAMES, split and ordered as the team's document presents them.
 *
 *  The measured four run by DESCENDING NNBT degradation rate — PaDa-I 12%,
 *  GroGu 9%, MroUPO 8%, PabUPO-II 4% — which is the order the paragraph above
 *  them names. That is the reverse of the channel row further up, which the
 *  same document orders by ASCENDING rate; both are deliberate, so do not
 *  "fix" one to match the other.
 *
 *  They stay SEPARATE lists rather than being spliced from the channel ones:
 *  the sets diverged once already (only 9HE9, 5FUJ and 5OXU had plots), and a
 *  row that owns its own list can diverge again without anything breaking
 *  silently.
 *
 *  Only add an entry once all three MD plots exist for it under
 *  `molecular-dynamics/` — the host answers 403 for a missing one, which paints
 *  a broken image. */
const LIT_MD_MEASURED = ["5oxu", "grogu", "5fuj", "9he9"];

const LIT_MD_UNMEASURED = ["fett", "7o1r", "8rnj"];

/** The structures shown in the literature CHANNEL rows, as slugs into
 *  LIT_NAMES.
 *
 *  Split into two lists mirroring the section's two activity groups, so a
 *  reader meets the tunnels in the same grouping as the prose: measured
 *  activity first, then not-measured. (The structures themselves are no longer
 *  split — one viewer closes the subsection with all seven — so it is the
 *  headings rather than the viewers that pair the rows up.) The two render as
 *  separate rows and are laid out differently — see the `chf-row-2col` note in
 *  model_discovery.css.
 *
 *  The measured four are in the order their paragraph gives them, by INCREASING
 *  NNBT degradation rate: 4% (PabUPO-II), 8% (MroUPO), 9% (GroGu), 12% (PaDa-I).
 *  The prose says "from left to right", so the order is part of the claim — a
 *  reshuffle would make that sentence wrong.
 *
 *  Kept apart from the MD lists even though the four now cover the same
 *  structures — see the note there for why each row owns its list. */
const LIT_CHANNEL_MEASURED = ["9he9", "5fuj", "grogu", "5oxu"];

const LIT_CHANNEL_UNMEASURED = ["fett", "8rnj", "7o1r"];

/** The UPO CUPP pipeline, step by step — the flowchart that opens the CUPP
 *  discovery subsection, and the four cards in the box under it (each card's
 *  title is read from here, so the two cannot drift apart). The blurbs only
 *  summarise what that box says about each step. */
const UPO_CUPP_WORKFLOW: PipelineStep[] = [
  {
    title: "Sequence space",
    tag: "BLAST + MMseqs2",
    blurb:
      "BLAST the seeds against two UniProt databases, merge the hits and homology-reduce them with MMseqs2.",
  },
  {
    title: "CUPP",
    tag: "Clustering",
    blurb:
      "Group the sequence space into CUPP groups by conserved unique peptide patterns, as a dendrogram.",
  },
  {
    title: "ProSmith",
    tag: "Substrate scoring",
    blurb:
      "Score every sequence in the dendrogram against NNBT and keep the top 100.",
  },
  {
    title: "Boltz-2",
    tag: "Co-folding",
    blurb:
      "Co-fold each shortlisted sequence with heme and NNBT, giving the structures the channel and docking analyses start from.",
  },
];

/** Blind docking of NNBT into the three literature UPOs without measured
 *  degradation rates — the table under "UPOs with not experimentally measured
 *  activity", transcribed from the team's results. No activity column: there
 *  is no measured rate to put in it. */
const LIT_DOCKING_UNMEASURED = [
  {
    enzyme: "Hypoxylon sp. UPO",
    structure: "7O1R, crystal",
    score: "−6.81",
    ligandFe: "4.22",
  },
  {
    enzyme: "MweUPO-1",
    structure: "8RNJ, crystal",
    score: "−6.13",
    ligandFe: "3.13",
  },
  {
    enzyme: "Fett",
    structure: "Boltz-2 prediction",
    score: "−6.49",
    ligandFe: "7.21",
  },
];

/** Where the PyMOL renders of the docked reference UPOs are uploaded. */
const UPO_PYMOL_BASE =
  "https://static.igem.wiki/teams/6060/wiki/drylab/upo-pymol";

/** Blind docking of NNBT into the four reference UPOs with measured
 *  degradation rates — the table under "UPOs with experimentally measured
 *  activity", transcribed from the team's results. */
const LIT_DOCKING_MEASURED = [
  {
    enzyme: "PaDa-I",
    structure: "5OXU, crystal",
    activity: "12%",
    score: "−6.91",
    ligandFe: "3.27",
  },
  {
    enzyme: "GroGu",
    structure: "Boltz-2 prediction",
    activity: "9%",
    score: "−6.35",
    ligandFe: "6.42",
  },
  {
    enzyme: "MroUPO",
    structure: "5FUJ, crystal",
    activity: "8%",
    score: "−6.18",
    ligandFe: "4.02",
  },
  {
    enzyme: "PabUPO-II",
    structure: "9HE9, crystal",
    activity: "4%",
    score: "−6.28",
    ligandFe: "3.34",
  },
];

/** The rationale shared by the nine candidates the channel pipeline chose. */
const CHANNEL_PICK =
  "Chosen through channel discovery pipeline. More info in the next section.";

/** The final twelve UPO candidates and why each was picked, as the table in
 *  the CUPP discovery subsection lists them. */
const UPO_FINAL_CANDIDATES: { id: string; rationale: string }[] = [
  {
    id: "A0A0C9U748",
    rationale:
      "Sole representative of its CUPP group with a high Boltz-2 confidence score.",
  },
  {
    id: "A0A0C9TXI4",
    rationale:
      "From the same organism as A0A0C9U748, indicating it may have a different function.",
  },
  {
    id: "A0A5C3KL04",
    rationale:
      "Closely related to a seed according to CUPP dendrogram and has a very high Boltz-2 confidence score.",
  },
  { id: "A0A0C4E1P3", rationale: CHANNEL_PICK },
  { id: "A0A0C9VQZ5", rationale: CHANNEL_PICK },
  { id: "A0A2H3E6E9", rationale: CHANNEL_PICK },
  { id: "A0A4S8L4J7", rationale: CHANNEL_PICK },
  { id: "A0A8H6HXY8", rationale: CHANNEL_PICK },
  { id: "A0A9P5XE54", rationale: CHANNEL_PICK },
  { id: "A0A9P5Z220", rationale: CHANNEL_PICK },
  { id: "A0A9P7RSA8", rationale: CHANNEL_PICK },
  { id: "A0A0C9UQE3", rationale: CHANNEL_PICK },
];

/** UniProt accessions taken into MD, in the order the viewer above tabs them
 *  (DATABASE_STRUCTURES in structures.ts). Lowercase form is the upload path.
 *
 *  This is now every candidate in that viewer; it was the first three only,
 *  until the rest of the plots were uploaded. The figures themselves come from
 *  the shared MdFigures module — read the 403 warning there before adding one. */
const MD_CANDIDATES = [
  { accession: "A0A9P7RSA8", slug: "a0a9p7rsa8" },
  { accession: "A0A0C9UQE3", slug: "a0a0c9uqe3" },
  { accession: "A0A0C9VQZ5", slug: "a0a0c9vqz5" },
  { accession: "A0A0C4E1P3", slug: "a0a0c4e1p3" },
  { accession: "A0A2H3E6E9", slug: "a0a2h3e6e9" },
  { accession: "A0A4S8L4J7", slug: "a0a4s8l4j7" },
  { accession: "A0A8H6HXY8", slug: "a0a8h6hxy8" },
  { accession: "A0A9P5XE54", slug: "a0a9p5xe54" },
  { accession: "A0A9P5Z220", slug: "a0a9p5z220" },
];

/** The works this page cites in its OWN prose, as opposed to the ones it
 *  inherits by showing a method write-up in a box.
 *
 *  Derived from the per-section lists in citations.ts rather than typed out
 *  again here, so adding a citation to a section's prose is one edit, in the
 *  file that already records what that section cites. */
const DISCOVERY_OWN_CITATIONS: readonly CitationKey[] = [
  ...CHANNEL_RESULTS_CITATIONS,
  ...UPO_STRUCTURAL_CITATIONS,
  ...LACCASE_CITATIONS,
  ...UPO_CUPP_CITATIONS,
  ...UPO_LITERATURE_INTRO_CITATIONS,
];

/** Everything the References section lists.
 *
 *  Derived rather than typed out, because half of it is not this page's to
 *  maintain: the channel method write-up renders here too (see
 *  ChannelMethodsBox), and it cites fpocket and CAVER inside its own cards. If
 *  a citation is added to that method, it appears in this list automatically
 *  instead of being silently missing from the page that shows it.
 *
 *  From the channel box it is the METHOD's citations, not the whole channel
 *  section's: that box shows the three method cards only, so the works the
 *  Methods page's section introduction cites reach this page through the
 *  results prose above instead, not through the box.
 *
 *  De-duplicated because the two sets can overlap, and sorted by key, which for these entries is alphabetical by first author —
 *  the usual order for an author–year scheme. */
const DISCOVERY_REFERENCES: readonly CitationKey[] = [
  ...new Set([
    ...DISCOVERY_OWN_CITATIONS,
    ...CHANNEL_METHOD_CITATIONS,
    ...DOCKING_METHOD_CITATIONS,
    ...MD_METHOD_CITATIONS,
  ]),
].sort();

/* -------------------------------------------------------------------------- */
/*  Section content (headings come from the shared SectionHeading component)    */
/* -------------------------------------------------------------------------- */

/** The sequences added before clustering the laccase space, as the anchor
 *  table lists them — transcribed entry for entry. Rows sharing a `group` are
 *  merged into one cell. */
const LACCASE_ANCHORS: TableRow[] = [
  {
    group: "Positive anchors",
    id: "D4GPK6",
    description: (
      <>
        Lignin degrading laccase, from archea <i>Haloferax vulcanii</i>
      </>
    ),
  },
  {
    group: "Positive anchors",
    id: "P07788",
    description: (
      <>
        <i>B. subtilis</i>, MCO laccase catalyzing oxidation of a variety of
        substrates (including phenolic compounds)
      </>
    ),
  },
  {
    group: "Positive anchors",
    id: "P36649",
    description: (
      <>
        CueO enzyme from <i>E. coli</i>, reference enzyme for the group
      </>
    ),
  },
  { group: "seeds", id: "ItL01, 02 & 03", description: "Seed sequences" },
  {
    group: "Negative anchors",
    id: "Q12737",
    description: (
      <>
        Bilirubin oxidase, <i>Albifimbria verrucari</i>
      </>
    ),
  },
  {
    group: "Negative anchors",
    id: "P37064",
    description: (
      <>
        <i>Cucurbita pepo</i> (zucchini) Ascorbate oxidase
      </>
    ),
  },
  {
    group: "Negative anchors",
    id: "P00450",
    description:
      "Human ceruloplasmin/ferroxidase, iron transport across cell membrane",
  },
];

/** The four laccase candidates ordered for wetlab testing. */
const LACCASE_SHORTLIST: TableRow[] = [
  {
    id: <strong>A0A517I632</strong>,
    rationale: (
      <>
        Chosen as part of its CUPP group. Showed good docking results, one of
        the &ldquo;pocket laccases&rdquo;.
      </>
    ),
  },
  {
    id: "A0A7T1FRB0",
    rationale: "same CUPP group as ItL03, good ProSmith results on NNBT",
  },
  {
    id: "A0AAJ2KTQ9",
    rationale:
      "Quite distant structurally from the other cupp groups, good results on Guaiacol docking & ProSmith. Chosen member from its CUPP group",
  },
  {
    id: "A0A1H2RLL0",
    rationale:
      "Chosen member of its CUPP group, good ProSmith results on Guaiacol",
  },
];

/** The UPO seeds the CUPP databases were built from. Rows sharing an
 *  `activity` are merged into one cell. */
const UPO_SEEDS: TableRow[] = [
  {
    activity: "Known",
    id: "B9W4V6",
    description: (
      <>
        Aromatic peroxygenase from <em>Cyclocybe aegerita</em>
      </>
    ),
  },
  {
    activity: "Known",
    id: "A0A4Q2DF10",
    description: (
      <>
        Heme-thiolate peroxidase from <em>Candolleomyces aberdarensis</em>
      </>
    ),
  },
  {
    activity: "Known",
    id: "A0A4V1Q376",
    description: (
      <>
        Heme-thiolate peroxidase from <em>Candolleomyces aberdarensis</em>
      </>
    ),
  },
  {
    activity: "Known",
    id: "A0A023H437",
    description: (
      <>
        Heme-thiolate peroxidase from <em>Marasmius rotula</em>
      </>
    ),
  },
  {
    activity: "Not known",
    id: "A0ACB7PKW6",
    description: (
      <>
        Chloroperoxidase from <em>Chaetomium tenue</em>
      </>
    ),
  },
  {
    activity: "Not known",
    id: "AEO60306.1",
    description: (
      <>
        Chloroperoxidase from <em>Thermothelomyces thermophilus</em>
      </>
    ),
  },
  {
    activity: "Not known",
    id: "AEO68242.1",
    description: (
      <>
        Heme haloperoxidase family profile domain-containing protein from{" "}
        <em>Thermothielavioides terrestris</em>
      </>
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * ModelDiscovery — the Discovery detail page: enzyme-discovery result figures
 * and the interactive pocket/docking/MD walk-through on PaDa-I.
 */
export function ModelDiscovery() {
  // Constant light-blue page background across the Model section (removed on
  // unmount). Rule lives in model.css but Vite emits one global CSS bundle.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="discovery" />

        <PageTitle title="Discovery" />

        <div className="page-start row mt-4">
          <NumberedFigures className="col-lg-12">
            {/* Page introduction, from the team's "Discovery_Introduction"
                document. Both works it cites are already in the page's
                reference list (via CHANNEL_RESULTS_CITATIONS and
                LACCASE_CITATIONS in citations.ts). */}
            <TextBox className="model-prose">
              <p className="md-prose">
                The discovery of enzymes capable of degrading NNBT started with a
                literature search. Two main groups of enzymes were identified as
                strong candidates for NNBT degradation: unspecific peroxygenases
                (UPOs), and laccases <Cite id="Dolz2022" />{" "}
                <Cite id="Wongwattanarat2025" />. Because of their different
                structural characteristics, our approach to discovering other
                enzymes that can also perform the reaction had to be divided in
                two, one focusing on each group.
              </p>
              <p className="md-prose">
                In both cases we built similarity based sequence databases
                starting from the enzymes confirmed to perform our reaction of
                interest. These databases were organized and clustered into
                dendrograms and the resulting sequences screened through different
                pipelines depending on whether they were UPOs or laccases.
              </p>
            </TextBox>

            {/* --- Group 1: the laccase branch ---
                Both discovery routes are split per enzyme family, one sibling
                section each, so every branch gets its own TOC entry (the same
                shape as the engineering split on the Methods page).
                The four sections are ordered by enzyme family first — each
                family's literature route is followed by its database route —
                rather than grouping both families under each route.
                Laccases lead and UPOs follow; the UPO halves nonetheless keep
                the original `literature-based` and `database-based` ids, so
                existing links to them still resolve.

                The laccase branch has no literature section: everything the
                team's laccase document contains describes the DATABASE route —
                seeding a UniProt search, clustering the hits with CUPP, scoring
                the clusters — so all of it sits in the section below. --- */}

            {/* --- Group 1b: database-based discovery, laccase branch ---
                Introduction, then the method (the flowchart and one box per
                tool it names), then the results. Every section on this page is
                arranged that way: a reader who wants the method has it before
                the findings, and a reader who does not is past it in one
                screen. */}
            <section id="database-based-laccases" className="track-laccase">
              <SectionHeading title="Laccases discovery" />

              <TextBox className="model-prose">
                <p className="md-prose">
                  In this section, we explain our computational enzyme discovery
                  strategy to find laccase/multicopper oxidase enzyme candidates,
                  spanning from initial sequence seeding to the selection of 5
                  candidate enzymes.
                </p>
                <p className="md-prose">
                  More specifically, we started by identifying ItL03 as a
                  promising candidate enzyme from the literature, which we used to
                  query the UniProt/Swissprot database. We then investigated the
                  protein families of ItL03 to find potential homologs. For this,
                  we partitioned the sequence space into functional groups using
                  CUPP <Cite id="Barrett2020" />, a clustering algorithm. To
                  select which of these clusters were relevant for our search, we
                  relied on enzyme-substrate docking and ProSmith
                  (enzyme-substrate pair prediction) <Cite id="Kroll2024" />, and
                  selected one candidate from the most relevant clusters to be
                  tested in the Wetlab.
                </p>
                <p className="md-prose">
                  Our approach mainly relied on 3 tools: CUPP (for sequence-based
                  clustering based on conserved peptide patterns), ProSmith (an
                  enzyme-substrate prediction algorithm based on the protein LLM
                  ESM), and our laccase-specific docking programme based on
                  AutoDock Vina.
                </p>
              </TextBox>

              {/* The flowchart the source document asks for at this point.
                  Same component AND same four-step shape as the UPO branch's
                  flowchart further down — sequence space, then one step per
                  tool — so the two branches read alike. */}
              <ModelPipeline steps={LACCASE_DISCOVERY_WORKFLOW} />

              {/* ONE box for all three tools the paragraph above names, built
                  like the "More details on the CUPP pipeline" box in the UPO
                  branch further down: a short introduction, then one
                  MethodBlock per tool, each an animation beside its summary
                  with the longer detail folded in underneath.

                  It replaces the three separate "More about …" boxes that stood
                  here (CUPP, ProSmith, our MSA and docking tool). No text was
                  dropped in the merge — each box's first paragraph is now its
                  tool's summary and the rest is its `more`.

                  The cards take their titles from LACCASE_DISCOVERY_WORKFLOW —
                  the same array the flowchart above renders, as the UPO box
                  does with its own — so a tool is named identically in
                  the flowchart and on its card, and renaming it in one place
                  renames it in both.

                  All of it is the team's own method documents (docs/sources:
                  "CUPP Explained.docx", "Enzyme_discovery_methods.docx",
                  "Laccase docking.docx") plus the ProSmith wording already on
                  this page; nothing is filled in from elsewhere.
                  TEAM TODO: the ProSmith half is still shorter than the other
                  two — expand it from your own notes if you want it to match.
                  See .claude/RESPONSIBLE_AI_USE.md. */}
              <DetailsBox label="More details on the laccase pipeline">
                <p className="mm-prose">
                  This section describes how we built the laccase sequence
                  space, and the three tools we used to reduce it and select
                  candidates for testing. The longer description is folded in
                  underneath each block.
                </p>

                <MvizMoreInline value={true}>
                  {/* Step 0, the counterpart of the UPO box's BLAST card, with
                      the same query-against-database animation. The laccase
                      branch did NOT use BLAST — its source document
                      ("Laccase_Discovery_Pipeline.docx") builds the sequence
                      space from InterPro and a Pfam query of UniProt — so the
                      card says that, not BLAST. */}
                  <MethodBlock
                    id="laccase-method-sequence-space"
                    step={LACCASE_DISCOVERY_WORKFLOW[0]}
                  >
                    <div className="mviz">
                      <BlastStage />
                      <MvizInfo
                        title={LACCASE_DISCOVERY_WORKFLOW[0].title}
                        more={
                          <>
                            <p>
                              The Pfam query of UniProt yielded 80,000 results,
                              which exceeded the computational capacity
                              available for clustering with CUPP. The dataset
                              was therefore filtered to retain only entries with
                              an annotation score of ≥3, reducing the set to
                              approximately 4,500 sequences.
                            </p>
                            <p>
                              Redundancy was further reduced by applying a 90%
                              homology-reducing step using MMseqs2{" "}
                              <Cite id="Gabler2020" />{" "}
                              <Cite id="Zimmermann2018" />, removing
                              near-identical entries while preserving sequence
                              diversity.
                            </p>
                          </>
                        }
                      >
                        Where the UPO branch built its sequence space with
                        BLAST, the laccase branch started from protein families.
                        As ItL-03 was absent from UniProt/SwissProt, we
                        annotated it with InterPro, which placed it in the
                        multicopper oxidase superfamily with two Pfam entries
                        (PF07731 and PF07732). We used these two Pfams to query
                        UniProt and create the sequence space that was later
                        grouped using CUPP.
                      </MvizInfo>
                    </div>
                  </MethodBlock>
                  <MethodBlock
                    id="laccase-method-cupp"
                    step={LACCASE_DISCOVERY_WORKFLOW[1]}
                  >
                    <div className="mviz">
                      <PhyloStage />
                      <MvizInfo
                        title={LACCASE_DISCOVERY_WORKFLOW[1].title}
                        more={
                          <>
                            <p>
                              If you give CUPP a set of amino acid sequences, it
                              will perform unsupervised clustering of these
                              sequences into so-called CUPP groups. It is also
                              able to fetch metadata such as protein superfamily
                              or EC number from public databases, which is very
                              useful to annotate the sequence space and draw a
                              functional boundary <Cite id="Barrett2020" />.
                            </p>
                          </>
                        }
                      >
                        Conserved unique peptide patterns (CUPP) is a platform
                        to annotate and group peptides and enzymes based on
                        conserved patterns/domains in their sequences. It can be
                        run on the{" "}
                        <a
                          className="md-link"
                          href="https://cupp.info/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CUPP web server
                        </a>{" "}
                        or locally on your computer. Though originally designed
                        for carbohydrate-active enzymes (CAZymes), it can now be
                        used for any enzyme or peptide class.
                      </MvizInfo>
                    </div>
                  </MethodBlock>
                  <MethodBlock
                    id="laccase-method-prosmith"
                    step={LACCASE_DISCOVERY_WORKFLOW[2]}
                  >
                    <div className="mviz">
                      <ProSmithStage />
                      <MvizInfo
                        title={LACCASE_DISCOVERY_WORKFLOW[2].title}
                        more={
                          <>
                            <p>
                              It leverages embeddings from the protein large
                              language model ESM <Cite id="Rives2021" /> to
                              score that compatibility, and has been trained on
                              many different substrates. NNBT is not among them,
                              which is why we scored our sequences on the
                              mediator guaiacol as well as on NNBT itself.
                            </p>
                          </>
                        }
                      >
                        ProSmith is a machine learning based enzyme-substrate
                        pair prediction tool <Cite id="Kroll2024" />. It
                        processes protein amino acid sequences and small
                        molecule strings (SMILES) and gives a score that
                        indicates how likely it is that a specific small
                        molecule is a substrate of a given enzyme sequence.
                      </MvizInfo>
                    </div>
                  </MethodBlock>
                  <MethodBlock
                    id="laccase-method-docking"
                    step={LACCASE_DISCOVERY_WORKFLOW[3]}
                  >
                    <div className="mviz">
                      <LaccaseDockStage />
                      <MvizInfo
                        title={LACCASE_DISCOVERY_WORKFLOW[3].title}
                        more={
                          <>
                            <p>
                              For laccases the active site consists of 4 copper
                              atoms in 2 different centres (T1 contains 1 copper
                              atom, T2/3 has the remaining 3). Oxygen gets
                              reduced to water at the T2/3 copper site, while
                              the substrate gets oxidised at the T1 copper
                              centre, transferring its electrons to the T2/3
                              centre. Therefore, the T1 copper centre is
                              effectively our point of interest for docking,
                              since the reaction happens there. This copper atom
                              is maintained into place by a few histidine and
                              cysteine residues, which we will call the HCH
                              motive <Cite id="Aza2023" />.
                            </p>
                            <p>
                              Our docking program first maps the T1 copper
                              centre residues using a multiple sequence
                              alignment tool (mafft), basing itself on a known
                              reference (CueO from <i>E. coli</i>). Then, it
                              downloads the pdb structures for the provided
                              sequences and it runs a targeted docking using
                              Autodock Vina with a 22 Å box centered on the
                              predicted centroid of the HCH motive, which is
                              where the T1 copper should roughly be. The results
                              are then ranked based on their affinity (kcal/mol)
                              values.
                            </p>
                          </>
                        }
                      >
                        Although we already used docking for UPOs, the laccase
                        pipeline required a different approach because of the
                        underlying biology. The active site of UPOs is clearly
                        defined as their pocket, which contains the heme group,
                        and this in turn defines where the search box for
                        targeted docking should be placed. Laccases have no such
                        pocket, so the alignment is what finds the target.
                      </MvizInfo>
                    </div>
                  </MethodBlock>
                </MvizMoreInline>
              </DetailsBox>

              <div
                id="laccase-candidate-selection"
                className="dsub"
                data-toc-title="Candidate selection"
              >
                <SubsectionHeading title="Candidate selection" />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    We grounded our seed sequence selection in
                    Wongwattanarat&apos;s dissertation from 2025{" "}
                    <Cite id="Wongwattanarat2025" />, which provided the primary
                    basis for identifying enzyme candidates capable of degrading
                    epoxy resin and its precursors. Although the work was
                    conducted in the context of aviation-grade epoxy resins, the
                    substrates and enzymatic targets examined are directly
                    transferable to the present use case. The study isolated
                    enzymatic sequences from a European spruce bark beetle (
                    <i>Ips typographus</i>) gut metagenome, heterologously
                    expressed a subset of these, and screened them against a panel
                    of epoxy model substrates (NNBT, BMAP, and BBCM), which
                    contain key resin motives of Hexflow® RTM6, an aerospace-grade
                    epoxy resin with a complex crosslinked architecture. Among the
                    candidates characterized, ItL-03 exhibited the highest
                    activity across substrates, establishing it as the primary
                    seed sequence for this discovery campaign. The less active
                    ItL-02 and ItL-01 sequences were also retained as seed
                    sequences, alongside CueO (copper-efflux oxidase) from{" "}
                    <i>E. coli</i>, which served as a functional reference in the
                    original study.
                  </p>
                  <p className="md-prose">
                    As ItL-03 was absent from the UniProt/SwissProt database at
                    the time of this work, we submitted its sequence to InterPro
                    for domain and protein family annotation. The analysis placed
                    ItL-03 within the multicopper oxidase (MCO) superfamily, a
                    functionally diverse group encompassing laccases, bilirubin
                    oxidases, ascorbate oxidases, ferroxidases, and CueO-type
                    enzymes. InterPro further resolved its domain architecture
                    into two protein family (Pfam) entries: PF07731 and PF07732.
                  </p>
                </TextBox>
                <WikiFigure
                  src={`${LACCASE_BASE}/pfam.avif`}
                  alt="InterPro domain annotation of ItL-03, with the two predicted Pfam domains marked along the length of the sequence."
                >
                  InterPro analysis of ItL03 with predicted Pfam domains (in
                  dark blue)
                </WikiFigure>
              </div>

              {/* --- subsection: CUPP discovery ----------------------------- */}
              <div
                id="cupp-database-laccases"
                className="dsub"
                data-toc-title="CUPP discovery"
              >
                <SubsectionHeading title="CUPP discovery" />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    We used these 2 Pfams to query the Uniprot database, which
                    yielded 80,000 results. This exceeded the computational
                    capacity available for processing with the CUPP clustering
                    algorithm; the dataset was therefore filtered to retain only
                    entries with an annotation score of ≥3, reducing the set to
                    approximately 4,500 sequences. Redundancy was further reduced
                    by applying a 90% homology-reducing step using MMseqs2,
                    removing near-identical entries while preserving sequence
                    diversity.
                  </p>

                  <p className="md-prose">
                    Before clustering these 4,500 sequences, we decided to add
                    more seeds to the selection in order to later help us
                    visualizing a functional boundary within the selection. We
                    chose some positive anchors, i.e. enzymes that have shown very
                    similar activities (mainly lignin degradation) to the one we
                    are looking for, and negative anchors (unrelated functions).
                    They are shown in Table <TabNum of="laccase-anchors" />.
                  </p>
                </TextBox>

                {/* The anchor table, transcribed entry for entry. */}
                <PartsTable
                  data={LACCASE_ANCHORS}
                  columns={[
                    { field: "group", rowHeader: true },
                    { field: "id", header: "UniProtKB ID" },
                    { field: "description", header: "Description" },
                  ]}
                  groupRowsBy="group"
                  numberId="laccase-anchors"
                  caption="The sequences added to the selection before clustering: the seeds themselves, plus anchors on either side of the functional boundary we wanted to see."
                />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    These sequences were then clustered using CUPP3, and it became
                    clear that all sequences of interest (green and black)
                    clustered together in a subspace of 189 sequences, which
                    became our curated sequence space, while the negative anchors
                    landed away.
                  </p>
                </TextBox>
                {/* NOT `wide`, deliberately. This upload is only 904×444 — the
                    smallest figure on the page — and `wide` let it render at
                    its full 904 CSS px, which on a 2× display is one image
                    pixel stretched over two device pixels, i.e. the blur the
                    team reported. Capped at the standard 620px it is drawn at
                    ~1.5 device pixels per image pixel and reads sharp.
                    TEAM TODO: the real fix is a bigger export — re-save this
                    iTOL figure at ≥1800px wide, re-upload it, and `wide` can
                    come back and show both panels larger AND sharper. */}
                <WikiFigure
                  src={`${LACCASE_BASE}/cupp-v2.avif`}
                  alt="Two CUPP sequence-space trees: the full set with the seeds and anchors marked, and the curated subspace containing the positive anchors."
                >
                  a) sequence space of the +- 1,500 sequences of proteins in
                  both PF07731 and PF07732 on Uniprot after homology reduction
                  at 90% sequence identity and retaining only annotation scores
                  3 and higher. ItL sequences an CueO are in black, positive
                  anchors in green, and negative anchors in red. b) curated
                  subspace of 189 sequences containing all the positive anchors
                </WikiFigure>
              </div>

              {/* --- subsection: selection of clusters ---------------------- */}
              <div
                id="laccase-cluster-selection"
                className="dsub"
                data-toc-title="Selection of clusters"
              >
                <SubsectionHeading title="Selection of clusters" />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    The curated sequence space was now analyzed using ProSmith.
                  </p>
                  <p className="md-prose">
                    ProSmith leverages embeddings from the protein large language
                    model ESM to score enzyme-substrate compatibility, and it has
                    been trained on many different substrates{" "}
                    <Cite id="Kroll2024" />. Unfortunately for us, NNBT is not
                    among the substrates on which ProSmith has been trained,
                    making predictions on NNBT alone very unreliable. However,
                    laccases are enzymes that often rely on a redox mediator to
                    perform their reaction on the substrate. They reduce/oxidise
                    the mediator which in turn reduces/oxidises the substrate{" "}
                    <Cite id="Aza2023" />.
                  </p>
                </TextBox>

                <WikiFigure
                  src={`${LACCASE_BASE}/mediator.avif`}
                  alt="Scheme of mediated oxidation: the laccase oxidises a small mediator, which in turn oxidises the substrate."
                >
                  Mechanism of mediated substrate oxidation from laccases, from
                  Aza et al <Cite id="Aza2023" />
                </WikiFigure>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    One of the most common mediators, guaiacol, was present in
                    ProSmith&apos;s training data and was used by Wongwattanarat
                    together with ItL03 in her dissertation, showing improved
                    results compared to NNBT + enzyme alone. This is why we
                    thought of performing ProSmith predictions on both NNBT and
                    guaiacol and choose the best performers for both. ProSmith
                    showed us that only 82 of the 189 initial sequences were in
                    clusters that have high ProSmith scores, which is why we
                    discarded the other sequences.
                  </p>
                </TextBox>
                <WikiFigure
                  wide
                  /* The source document writes this one's path with the
                     screenshot's original filename, spaces, capitals, dots and
                     all. The uploads tool does not keep that: it lowercases and
                     slugifies, so the file is served under the name below and
                     the document's own path answers 403. Checked, not
                     assumed — as every path on this page should be. */
                  src={`${LACCASE_BASE}/screenshot-2026-06-12-at-11-11-0523.avif`}
                  alt="The 189-sequence tree after ProSmith and docking analysis, with the discarded left-hand part and the sequences lacking copper-binding domains marked, and the retained region circled."
                >
                  Subspace of 189 sequences after ProSmith &amp; docking
                  analysis. ProSmith discarded the left part of the tree (almost
                  no values &gt;0.1), and the MSA from docking showed that the
                  sequences in red do not have the copper-binding domains that
                  laccases need to form their active site, which is why only the
                  part circled in red was chosen for further analysis.
                </WikiFigure>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    Our rationale for choosing our candidates was to select one
                    member from each CUPP group. That candidate should ideally
                    score high on ProSmith predictions with guaiacol and NNBT.
                  </p>

                  <p className="md-prose">
                    Since we based our UPO selection (see the sections below) on
                    our Boltz + docking algorithm, we chose to slightly modify the
                    program and run it on our laccase pool of 82 enzymes, out of
                    curiosity. The algorithm first does a multiple sequence
                    alignment (MSA) to locate the 2 active sites (T1 + T2/3), then
                    predicts the 3D structure of the enzyme with 4 copper residues
                    using AlphaFold3. It then docks the enzyme structure with both
                    guaiacol and NNBT. Doing this, we found out that one of our
                    clades didn&apos;t have the copper-binding domains, which is
                    why we discarded 21 more sequences. We also found out that the
                    best performing enzymes all cluster in one CUPP group, which,
                    as shown in our viewer, is because a small pocket on the
                    surface of the T1 copper binds the substrate.
                  </p>
                </TextBox>
                <WikiFigure
                  wide
                  src={`${LACCASE_BASE}/results.avif`}
                  alt="The CUPP tree with the best ProSmith hits and the top docking results marked, and the chosen candidates coloured."
                >
                  CUPP tree with the best ProSmith hits (red: between 0.2-0.3,
                  orange: 0.1-0.2) and top 15 docking results. Chosen candidates
                  Uniprot IDs have been coloured in green/yellow. Nb: A0A4R3UXC8
                  wasn&apos;t ordered in the end.
                </WikiFigure>

                {/* The viewer the paragraph above points at ("as shown in our
                    viewer"). Its own subsection so the table of contents can
                    reach it, and so the figure above is not squeezed between
                    the prose and a 500px-tall interactive frame. */}
                <div
                  id="laccase-viewer"
                  className="dsub"
                  data-toc-title="Structure viewer"
                >
                  <SubsectionHeading title="The laccases in 3D" />
                  <TextBox className="model-prose">
                    <p className="md-prose">
                      This viewer shows the 3D structures of the laccase candidates, with the T1 sites highlighted. You can rotate, zoom, and explore the structures to see how the active sites are arranged. 
                    </p>
                  </TextBox>
                  <LaccaseViewer />
                </div>
              </div>

              {/* --- subsection: candidate shortlist ------------------------ */}
              <div
                id="laccase-shortlist"
                className="dsub"
                data-toc-title="Candidate shortlist"
              >
                <SubsectionHeading title="Candidate shortlist" />
                <PartsTable
                  data={LACCASE_SHORTLIST}
                  columns={[
                    { field: "id", header: "UniProt ID", rowHeader: true },
                    { field: "rationale", header: "Rationale" },
                  ]}
                  numberId="laccase-shortlist"
                  caption="The four laccase candidates ordered for wetlab testing, and why each was chosen."
                />

                {/* The source document selects five candidates but tables only
                    four: A0A4R3UXC8 was selected and then not ordered, as the
                    figure caption above says. The page keeps both facts rather
                    than quietly dropping one. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    We ended up choosing 4 candidates for wetlab testing, where we
                    tried to choose one representant of each CUPP group.
                    Unfortunately, 2 groups had to be left out, and we had to
                    focus on the ones with the best results from ProSmith. A fifth
                    selected candidate, A0A4R3UXC8, was not ordered in the end.
                  </p>
                </TextBox>
              </div>

              {/* --- subsection: enzyme classification note ----------------- */}
              <div
                id="laccase-classification-note"
                className="dsub"
                data-toc-title="Note on enzyme classification"
              >
                <SubsectionHeading title="Important note on enzyme classification" />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    4 of the 5 selected candidates (A0A517I632, A0AAJ2KTQ9,
                    A0A1H2RLL0, and A0A4R3UXC8) are labeled as{" "}
                    <i>copper-containing nitrite reductases</i> on UniProt. This
                    is a different enzyme class compared to laccases, and it
                    matters for wetlab work (types of expression methods and
                    assays used). However, all of these annotations are
                    automatically generated, none of them actually have
                    experimental work backing up this classification. Moreover,
                    when looking at the sequence space (for example using a CUPP
                    tree), it became clear to us that the closest validated
                    enzymes to these 4 are actually laccases. The confirmed
                    nitrite reductases all clustered far away from the 4 chosen
                    sequences, which led us to take the decision to treat them as
                    laccases in our wetlab work.
                  </p>
                </TextBox>
              </div>
            </section>

            {/* --- Group 2: the UPO branch --- */}
            {/* --- Group 2a: literature-based discovery, UPO branch ---
                ORDER: the structural work (docking and molecular dynamics)
                comes FIRST, then channel discovery. Both are applied to the
                same characterised enzymes to validate the method against
                known activity, so neither feeds the other here — unlike the
                database branch below, where the channel search is what selects
                the structures that are then simulated, and therefore runs
                first. */}
            <section id="literature-based" className="track-upo">
              <SectionHeading title="UPOs literature discovery" />
              {/* From the team's "Introduction_Literature_Discovery"
                  document. */}
              <TextBox className="model-prose">
                <p className="md-prose">
                  Unspecific peroxygenases (UPOs, EC 1.11.2.1) are a class of
                  fungal heme-thiolate enzymes. In contrast with laccases, UPOs
                  present a more complex catalytic site structure as it is in the
                  proximity of the heme buried inside the enzyme. In AaeUPO, for
                  instance, the substrate accesses this region through a channel
                  and is guided by specific amino acids{" "}
                  <Cite id="Hofrichter2014" /> <Cite id="RamirezEscudero2018" />.
                  Furthermore, the proximity to the heme determines the kind of
                  reaction, peroxidase or peroxygenase{" "}
                  <Cite id="Hofrichter2014" /> <Cite id="RamirezEscudero2018" />.
                </p>
                <p className="md-prose">
                  Given these constraints, we saw the need for a pipeline to
                  simulate molecular docking, molecular dynamics, and perform
                  channel analysis to characterize known enzymes. Parts of this
                  pipeline also served to screen novel candidates, and further
                  engineer candidate enzymes (described in the UPOs database
                  discovery, and engineering sections respectively).
                </p>
                <p className="md-prose">
                  Here we present our computational work on known,
                  well-characterized reference UPOs from the literature. We
                  started by validating our methods reproducing existing research
                  findings to establish a baseline for comparison in our
                  subsequent database discovery and engineering campaigns.
                </p>
                <p className="md-prose">
                  The four reference UPOs with experimentally measured activity
                  analyzed here are:
                </p>
                {/* The source lists each enzyme with a colon and nothing after
                    it — a description per enzyme is still to be written. */}
                <ul className="md-list">
                  <li>AaeUPO, PaDa-I Variant</li>
                  <li>MroUPO</li>
                  <li>PabUPO-II</li>
                  <li>GroGu</li>
                </ul>
                <p className="md-prose">
                  The three known UPOs with not experimentally measured activity
                  analyzed here are:
                </p>
                <ul className="md-list">
                  <li>Fett</li>
                  <li>Hypoxylon sp. UPO</li>
                  <li>MweUPO-1</li>
                </ul>
              </TextBox>

              {/* --- subsection: molecular docking and molecular dynamics ----
                  ONE subsection, not two. The source document introduces the
                  two techniques together and runs them as one pipeline — the
                  docking pose is what the dynamics then start from — and it
                  reports no docking results of its own on these enzymes, only
                  the trajectories below. Splitting it in two would give the
                  docking half a heading, a method box and nothing else.
                  The database branch keeps its own split headings inside this
                  same subsection, where there ARE docking results to report. */}
              <div
                id="structural-literature"
                className="dsub"
                data-toc-title="Molecular docking and dynamics"
              >
                <SubsectionHeading title="Molecular docking and molecular dynamics" />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    Molecular Docking and Molecular Dynamics simulations are
                    computational modelling techniques commonly applied to UPOs
                    research, offering insights into the stability of structures
                    and interactions formed in substrate binding. For PaDa-I, the
                    best-characterized engineered UPO, molecular dynamics has been
                    used to investigate how single point mutations at
                    channel-lining phenylalanine residues (F76, F191) alter the
                    flexibility and topography of the substrate access channel{" "}
                    <Cite id="RamirezRamirez2020" />.
                  </p>
                  <p className="md-prose">
                    In MroUPO, MD simulations of substrate-binding pathways were
                    used to predict how heme channel mutations would shift the
                    balance between epoxidation and hydroxylation of oleic acid,{" "}
                    <strong>a prediction later validated experimentally</strong>,
                    with variant I153T showing strongly enriched epoxide formation
                    relative to the wild type <Cite id="Knorrscheidt2021" />.
                  </p>
                  <p className="md-prose">
                    In this section, we attempt to perform Molecular Docking and
                    Molecular Dynamics simulations in established UPOs to{" "}
                    <strong>
                      validate our algorithm&apos;s logic and create a baseline
                    </strong>{" "}
                    for comparison with novel or engineered UPO candidates.
                  </p>
                </TextBox>

                {/* The two steps as a flowchart, then the write-up behind each
                    one's box — the same shape the channel subsection has, and
                    the same order every section on this page follows:
                    introduction, method, results. */}
                <ModelPipeline steps={STRUCTURAL_WORKFLOW} />

                {/* Both method write-ups in one box, straight after the
                    flowchart and before any result. Not a copy: the same
                    component is rendered by the database branch
                    (structural-methods.tsx). */}
                <StructuralMethodsBox
                  idPrefix="lit"
                  steps={STRUCTURAL_WORKFLOW}
                />

                {/* Docking results first, straight after the method boxes,
                    then the molecular-dynamics results below. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    <strong>Molecular Docking</strong> analysis was run across the
                    entire receptor for each enzyme using identical parameters
                    throughout (AutoDock Vina 1.2.5, exhaustiveness 128, 50 poses,
                    fixed seed and with heme kept in place each time). Our docking
                    results consistently returned the same output: the
                    best-fitting pose was always inside the active site pocket,
                    never somewhere else on the protein surface.
                  </p>
                  <p className="md-prose">
                    Surface-binding poses (more than 12 Å from the iron)
                    weren&apos;t just slightly worse; they scored 0.7–1.4 kcal/mol
                    higher than the best pose (within the active site pocket).
                    Additionally in 6 of the 7 enzymes, no surface-bound pose even
                    made it into the top 15 poses (out of the total 50 poses). So
                    while binding elsewhere on the protein isn&apos;t physically
                    impossible, it&apos;s clearly and consistently disfavored.
                    This confirms our docking protocol is consistent with the
                    functional active site across the enzyme panel, supporting its
                    use as a reliable step in the broader pipeline.
                  </p>
                </TextBox>

                {/* A box of its own: this is where the docking results end
                    and the molecular-dynamics results begin. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    <strong>Molecular dynamics</strong> analysis of our literature
                    candidates showed that, beyond having stable structures
                    overall (expected, since these are in-vitro validated
                    wild-type enzymes),{" "}
                    <strong>
                      all candidates were also able to maintain the given docking
                      pose within their pockets
                    </strong>{" "}
                    (evident both from the simulation GIF and from the analysis
                    plots below).
                  </p>
                  <p className="md-prose">
                    Root mean square deviation (RMSD) is a fundamental metric in
                    molecular dynamics simulations, as it quantifies the average
                    displacement of atoms (or a selected subset, such as the
                    backbone, a ligand, or a cofactor) relative to a reference
                    structure (here the energy-minimized conformation) over the
                    simulation.
                  </p>
                  <p className="md-prose">
                    By tracking RMSD over time, we can assess the conformational
                    stability of a system:{" "}
                    <strong>
                      a plateauing RMSD indicates that the structure has reached
                      equilibrium
                    </strong>{" "}
                    and is not undergoing large-scale structural rearrangements,
                    while a continuously increasing or highly fluctuating RMSD may
                    signal unfolding, instability, or a poor starting
                    conformation.
                  </p>
                  <p className="md-prose">
                    In the context of our analysis, RMSD allows us to evaluate
                    whether the protein backbone, the heme cofactor, and the bound
                    ligand (NNBT) each maintain a stable configuration throughout
                    the simulation, providing a first indication of whether the
                    docked pose and the overall enzyme structure are physically
                    reasonable and consistent with the expected biological
                    behavior. Across all of our candidates,{" "}
                    <strong>we observed low and stable RMSD values</strong>,
                    confirming that each system reached a well-behaved equilibrium
                    without significant structural drift (a strong positive result
                    that supports the reliability of our simulations and the
                    validity of the docked poses used for downstream analysis).
                  </p>
                  <p className="md-prose">
                    Ligand-to-heme distance and relative SASA (solvent-accessible
                    surface area) were used to capture this docking placement
                    within the pocket, tracking NNBT&apos;s distance to the active
                    site and its exposure to the external environment. This
                    indicates that{" "}
                    <strong>our docking runs were successful</strong> and that the
                    predicted pose has biological plausibility.
                  </p>
                </TextBox>

                <SubsectionHeading
                  plain
                  title="UPOs with experimentally measured activity"
                />
                {/* Docking results for the four measured UPOs, ahead of their
                    molecular-dynamics results below. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    The first UPOs analyzed and presented in this section are
                    PaDa-I, GroGu, MroUPO, and PabUPO-II, with corresponding NNBT
                    degradation rates of 12%, 9%, 8%, and 4%, respectively.
                    Results from docking analysis in these four UPOs with
                    experimentally measured activity are shown in Table{" "}
                    <TabNum of="lit-docking-measured" />. Three out of the four
                    reference UPOs with experimentally measured activity (PaDa-I,
                    MroUPO, PabUPO-II) placed NNBT between 3.27 and 4.02 Å of the
                    heme iron. GroGu was the exception, with NNBT binding in the
                    pocket but stopping 6.42 Å short of the catalytic centre. This
                    gap may come down to GroGu&apos;s access channel shape, which
                    here is based on a Boltz-2-predicted structure rather than an
                    experimental one. Boltz-2&apos;s confidence score was high, but
                    that doesn&apos;t rule out the channel looking different in
                    the real enzyme. Separately, calculated affinities span a
                    narrow range and cannot separate the panel: the four differ by
                    0.73 kcal/mol across a threefold range of degradation rates.
                  </p>
                </TextBox>

                <PartsTable
                  data={LIT_DOCKING_MEASURED}
                  columns={[
                    { field: "enzyme", header: "Enzyme", rowHeader: true },
                    { field: "structure", header: "Structure" },
                    { field: "activity", header: "Activity" },
                    { field: "score", header: "Top score (kcal/mol)" },
                    { field: "ligandFe", header: "Ligand–Fe (Å)" },
                  ]}
                  numberId="lit-docking-measured"
                  caption={
                    <>
                      Blind docking results for the four reference UPOs with measured
                      NNBT degradation rates. &ldquo;Ligand–Fe&rdquo; is the shortest
                      distance from any NNBT heavy atom to the heme iron in the
                      top-scoring pose.
                    </>
                  }
                />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    PyMOL figures showing the placement of NNBT in the pocket of
                    UPOs are shown in Figures <FigNum of="lit-docking-pymol" />.
                  </p>
                </TextBox>
                {/* A 2×2 grid, in the table's order. */}
                <div data-fig="lit-docking-pymol">
                  <FigureRow cols={2}>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/5oxu-layered-whole-with-substrate.avif`}
                      alt="PyMOL render of PaDa-I (PDB 5OXU) with docked NNBT in its pocket."
                    >
                      PyMOL figure of PaDa-I (PDB id: 5OXU).
                    </WikiFigure>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/grogu-layered-whole-with-substrate.avif`}
                      alt="PyMOL render of GroGu (Boltz-2-predicted structure) with docked NNBT in its pocket."
                    >
                      PyMOL figure of GroGu (Boltz-2 predicted structure).
                    </WikiFigure>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/5fuj-whole-with-substrate.avif`}
                      alt="PyMOL render of MroUPO (PDB 5FUJ) with docked NNBT in its pocket."
                    >
                      PyMOL figure of MroUPO (PDB id: 5FUJ).
                    </WikiFigure>
                    <WikiFigure
                      src={`${UPO_PYMOL_BASE}/9he9-layered-whole-with-substrate.avif`}
                      alt="PyMOL render of PabUPO-II (PDB 9HE9) with docked NNBT in its pocket."
                    >
                      PyMOL figure of PabUPO-II (PDB id: 9HE9).
                    </WikiFigure>
                  </FigureRow>
                </div>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    Providing the docking poses from above, enabled us to perform
                    our Molecular Dynamics simulations.{" "}
                    <strong>
                      All four candidates show stable backbones and maintain NNBT
                      within their pockets throughout the simulation
                    </strong>
                    , as shown in the following figures (Figures{" "}
                    <FigNum of="lit-md-measured" />
                    ).
                  </p>
                </TextBox>
                {/* Wrapper only so the paragraph above can cite the whole run
                    of plots as one range. */}
                <div data-fig="lit-md-measured">
                  {/* The trajectory animations first, as a 2×2 grid in the
                      same order as the PyMOL grid above; the plots follow. */}
                  <FigureRow cols={2}>
                    <WikiFigure
                      src={`${MD_BASE}/5oxu/5oxu-md-gif.webp`}
                      alt="Animation of the molecular-dynamics trajectory of PaDa-I (PDB 5OXU) with docked NNBT."
                    >
                      Molecular dynamics trajectory of PaDa-I (PDB id: 5OXU).
                    </WikiFigure>
                    <WikiFigure
                      src={`${MD_BASE}/grogu/grogu-md-gif.webp`}
                      alt="Animation of the molecular-dynamics trajectory of GroGu (Boltz-2-predicted structure) with docked NNBT."
                    >
                      Molecular dynamics trajectory of GroGu (Boltz-2 predicted
                      structure).
                    </WikiFigure>
                    <WikiFigure
                      src={`${MD_BASE}/5fuj/5fuj-md-gif.webp`}
                      alt="Animation of the molecular-dynamics trajectory of MroUPO (PDB 5FUJ) with docked NNBT."
                    >
                      Molecular dynamics trajectory of MroUPO (PDB id: 5FUJ).
                    </WikiFigure>
                    <WikiFigure
                      src={`${MD_BASE}/9he9/9he9-md-gif.webp`}
                      alt="Animation of the molecular-dynamics trajectory of PabUPO-II (PDB 9HE9) with docked NNBT."
                    >
                      Molecular dynamics trajectory of PabUPO-II (PDB id: 9HE9).
                    </WikiFigure>
                  </FigureRow>
                  {LIT_MD_MEASURED.map((slug) => (
                    <MdFigureBlock
                      key={slug}
                      name={LIT_NAMES[slug]}
                      slug={slug}
                    />
                  ))}
                </div>

                <SubsectionHeading
                  plain
                  title="UPOs with not experimentally measured activity"
                />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    Beyond those 4 UPOs with experimentally measured activity,
                    molecular dynamics analysis of three additional UPOs known
                    from the literature: Fett, Hypoxylon sp. UPO (PDB ID: 7O1R), and MweUPO-1 (PDB
                    ID: 8RNJ) was performed. Results from analysis are shown in
                    Table <TabNum of="lit-docking-unmeasured" />. These UPOs had
                    similar docking results to the ones with measured activity
                    above. Hypoxylon sp. UPO and MweUPO-1 placed NNBT 4.22 and
                    3.13 Å from the iron respectively. However, docking pose from
                    Fett did not reach the catalytic centre, stopping 7.21 Å
                    short; its channel profile is also atypical.
                  </p>
                </TextBox>

                <PartsTable
                  data={LIT_DOCKING_UNMEASURED}
                  columns={[
                    { field: "enzyme", header: "Enzyme", rowHeader: true },
                    { field: "structure", header: "Structure" },
                    { field: "score", header: "Top score (kcal/mol)" },
                    { field: "ligandFe", header: "Ligand–Fe (Å)" },
                  ]}
                  numberId="lit-docking-unmeasured"
                  caption={
                    <>
                      Blind docking results for the three literature UPOs without
                      measured NNBT degradation rates. &ldquo;Ligand–Fe&rdquo; as in
                      Table <TabNum of="lit-docking-measured" />.
                    </>
                  }
                />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    Their corresponding Molecular Dynamics analysis{" "}
                    <strong>showed the same consistent trend</strong>: stable RMSD
                    profiles, well-maintained ligand-to-heme distances, and SASA
                    values indicative of a properly buried NNBT within the active
                    site. These results confirm that the docking poses generated
                    for all three additional literature candidates are
                    structurally sound and biologically plausible, reinforcing the
                    robustness of our computational pipeline across a diverse set
                    of previously characterized UPO structures.
                  </p>
                </TextBox>
                {LIT_MD_UNMEASURED.map((slug) => (
                  <MdFigureBlock
                    key={slug}
                    name={LIT_NAMES[slug]}
                    slug={slug}
                  />
                ))}
              </div>

              {/* --- subsection: channel discovery ---------------------------
                  A <div>, not a <section id>, and SubsectionHeading renders no
                  <h1> — both keep it out of the TOC, which lists only the
                  numbered sections.

                  WITHIN IT, each activity group is complete before the next
                  one starts: the measured references get their tunnel profiles
                  and the analysis drawn from them, and only then does the
                  not-measured group begin. The structures of both groups are
                  shown together by the single viewer that closes the
                  subsection, immediately before "UPOs database discovery". */}
              <div
                id="channel-literature"
                className="dsub"
                data-toc-title="Channel discovery"
              >
                <SubsectionHeading title="Channel discovery" />

                {/* The section introduction. It opens the channel work on both
                    Model pages — the Methods page renders the same three
                    paragraphs from ChannelIntro.tsx — but here they are page
                    prose rather than part of the method box, which is what the
                    source document asks for. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    Unspecific peroxygenases (UPOs) carry a heme cofactor buried
                    deep within the protein. The heme is isolated from the
                    surrounding solvent at the base of an access channel that
                    connects the enzyme surface to the heme iron{" "}
                    <Cite id="RamirezEscudero2018" />. For a substrate to be
                    oxidized,{" "}
                    <strong>it must first travel through this channel</strong>,
                    which, in native and engineered <i>Agrocybe aegerita</i> UPO
                    (AaeUPO/PaDa-I), consists mainly of hydrophobic and aromatic
                    residues. Several of these residues, including a triad of
                    phenylalanines, orient the substrate toward the heme, while
                    others delimit the entrance and act as a gate to the catalytic
                    pocket <Cite id="RamirezEscudero2018" />.
                  </p>
                  <p className="md-prose">
                    The dimensions of this channel are not fixed across the UPO
                    family: reported widths range from 9.8 Å in AaeUPO to around 12.9 Å
                    in the shorter, wider channel of MroUPO{" "}
                    <Cite id="RamirezRamirez2020" />. This variability is not
                    random: mutagenesis studies show that{" "}
                    <strong>
                      even single substitutions at positions lining the channel
                      can reshape its topography
                    </strong>
                    , in some cases expanding channel volume by 70 to 90 percent
                    and in others constricting it, directly altering how readily a
                    substrate can access the heme <Cite id="RamirezRamirez2020" />
                    . Consistent with this, engineering the entrance of the
                    channel, for instance the F311L substitution in PaDa-I, which
                    widened the outer entrance from 8 to 12 Å, has been shown to
                    directly enhance substrate accessibility to the catalytic site{" "}
                    <Cite id="RamirezEscudero2018" />.
                  </p>
                  <p className="md-prose">
                    At the family level, a comparative structural survey across
                    phylogenetically diverse UPO clades further supports the
                    channel&apos;s role as a gatekeeper of catalytic outcome:
                    enzymes with a broad, funnel-shaped channel and a narrow base
                    predominantly favour peroxidase-type reactivity, whereas UPOs
                    possessing a more constrained channel, often paired with an
                    accessory &ldquo;aliphatic pocket&rdquo; near the heme, tend
                    to retain substrate closer to the active site and favour the
                    peroxygenase reaction instead <Cite id="BarrosReguera2025" />.
                    Taken together, these findings indicate that the geometry of
                    the access channel is{" "}
                    <strong>
                      one of the strongest structural determinants of a UPO&apos;s
                      reaction selectivity
                    </strong>
                    .
                  </p>
                  <p className="md-prose">
                    Motivated by this link between channel geometry and UPO
                    activity, we investigated existing methods for calculating and
                    evaluating enzyme channels. Although tools such as CAVER{" "}
                    <Cite id="Chovancova2012" /> provide quantitative per-channel
                    descriptors (e.g., bottleneck radius, length, and curvature),
                    they are not designed for systematic comparison across large
                    sets of structures, typically requiring manual,
                    structure-by-structure curation. We therefore sought a method
                    capable of scalable, quantitative channel comparison, reducing
                    the bias inherent to case-by-case, visual inspection.{" "}
                    <strong>
                      This led to the development of our novel channel discovery
                      pipeline
                    </strong>
                    : a workflow that identifies channels (and pockets) of
                    interest, normalizes them for length via linear interpolation,
                    and thereby makes diverse channels directly comparable. The
                    final stage of the pipeline performs clustering, grouping UPOs
                    according to their channel geometry; this step is not applied
                    in the present section but is instead leveraged later, in the
                    database discovery and engineering sections.
                  </p>
                </TextBox>

                {/* The method, brought to the results, at the point the source
                    document asks for it — directly after the paragraph that
                    names the pipeline. The flowchart sits in the normal flow
                    (it is the summary of what that paragraph just described);
                    the full write-up — the same one the Methods page carries —
                    is behind the disclosure, so a reader can have it here
                    instead of leaving the page. See ChannelMethodsBox.tsx:
                    nothing here is a copy, both pages render the same
                    components. */}
                <ChannelWorkflow />
                <ChannelMethodsBox idPrefix="lit" />

                {/* `plain` matches the viewer titles too: these label a figure
                    group, they are not subsections of the page (the TOC lists
                    neither). */}
                <SubsectionHeading
                  plain
                  title="Known UPOs with experimentally measured activity"
                />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    Here, we apply our channel discovery pipeline (without the
                    final clustering step) to the four reference UPOs with
                    experimental activity values available from the literature.
                    Note that no filtering step can disqualify pockets or channels
                    identified in these reference UPOs; filtering is applied
                    exclusively to database-derived candidates. Results are shown
                    in the following figures (
                    <FigNum of="lit-channels-measured" />
                    ), which show the cross-sectional radius profiles of the
                    selected tunnels, plotted as +R and its mirror −R to visualize
                    the channel&apos;s shape along its length (before length
                    normalization). <strong>The channels, from left to right, correspond
                    to structures with increasing NNBT degradation rates</strong>, at 4%
                    (PabUPO-II, PDB ID: 9HE9), 8% (MroUPO, PDB ID: 5FUJ), 9%
                    (GroGu, Boltz-2 predicted structure) and 12% (PaDa-I, PDB ID:
                    5OXU) <Cite id="Dolz2022" />.
                  </p>
                </TextBox>

                {/* Tunnel cross-sections, in two rows mirroring the two
                    activity groups, each under that group's heading.

                    The measured-activity four go two to a row, so they read as
                    a 2x2 block; the not-measured three go on one row. Both
                    counts divide evenly into their column count, which is the
                    point — a shared row would leave an orphan figure on a line
                    of its own.
 */}
                <div
                  className="chf-row chf-row-2col"
                  data-fig="lit-channels-measured"
                >
                  {LIT_CHANNEL_MEASURED.map((slug) => (
                    <TunnelFigure
                      key={slug}
                      label={LIT_NAMES[slug]}
                      slug={slug}
                      caption={`Selected channel for ${LIT_NAMES[slug]}`}
                    />
                  ))}
                </div>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    An overlay of these channels (after length normalization) is
                    shown in Figure <FigNum of="lit-reference-region" /> (top
                    panel). This pattern agrees with the study linking UPO
                    activity to channel geometry <Cite id="BarrosReguera2025" />.
                    UPOs with higher activity, such as PaDa-I (PDB ID: 5OXU),{" "}
                    <strong>
                      display a funnel-shaped channel, with a narrow diameter
                      close to the heme and a wide diameter toward the entrance
                    </strong>
                    . In contrast, UPOs with lower activity, such as PabUPO-II
                    (PDB ID: 9HE9),{" "}
                    <strong>
                      have a narrower entrance and widen closer to the heme
                    </strong>
                    . The funnel-shaped, narrow-base geometry of the former
                    restricts the substrate&apos;s proximity to the heme,
                    favouring rapid substrate entry and product exit and thereby
                    promoting peroxidase activity (favouring NNBT degradation),
                    whereas the more constrained overall channel of the latter
                    keeps the substrate closer to the heme for longer, promoting
                    peroxygenase activity instead (not favouring NNBT
                    degradation).
                  </p>
                  <p className="md-prose">
                    To identify which stretch of the substrate access channel best
                    distinguishes tunnel geometry among structurally characterized
                    reference peroxidases, we analysed the radius (R) profile of
                    their CAVER channels.
                  </p>
                  <p className="md-prose">
                    <strong>Spread metric.</strong> At each of the 100 grid
                    positions, the cross reference spread of R was computed as the
                    standard deviation of the four resampled radius values at
                    that position. This spread curve is a purely descriptive
                    measure of separation magnitude; it does not test statistical
                    significance, which is not meaningful at n = 4 references.
                  </p>
                  <p className="md-prose">
                    <strong>Window selection.</strong> The position of maximum
                    spread was taken as the peak. Starting from the peak, the
                    window was extended left and right as long as the spread
                    remained at least 50% of the peak value, producing a
                    contiguous &ldquo;high discrimination&rdquo; interval on the
                    normalized distance axis. For this run, the peak occurred at
                    normalized distance 0.91,{" "}
                    <strong>
                      giving a window of [0.59, 1.00], corresponding to the last
                      approximately 40% of the channel
                    </strong>
                    , that is, the region nearest the solvent facing exit.
                  </p>
                  <p className="md-prose">
                    The bottom panel of the figure below shows pairwise absolute
                    radius differences (|ΔR|) for all six reference pairs,
                    included to confirm that the selected window separates all
                    pairs of references rather than being driven by a single
                    outlier structure.
                  </p>
                </TextBox>

                <WikiFigure
                  wide
                  fig="lit-reference-region"
                  src={`${REFERENCE_COMPARISON_BASE}/reference-region-simple.avif`}
                  alt="Three stacked panels: the overlaid normalized channel profiles of the four reference UPOs, the per-position spread across them with the peak and window marked, and the pairwise absolute radius differences."
                >
                  The first panel shows the overlay of the tunnels across the 4
                  reference UPOs. The middle panel shows the per position spread
                  (standard deviation across the four references) as a function
                  of normalized distance, with a dashed horizontal line marking
                  the 50% of peak threshold used to define the window, a red
                  dotted vertical line marking the peak position and the peak
                  location and window bounds reported alongside. The bottom
                  panel shows pairwise absolute radius differences (|ΔR|) for
                  all six reference pairs, included to confirm that the
                  selected window separates all pairs of references rather than
                  being driven by a single outlier structure.
                </WikiFigure>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    The calculated window from the reference UPOs suggests that{" "}
                    <strong>
                      the width of the entrance may be the most crucial factor for
                      UPO activity
                    </strong>{" "}
                    (though this does not imply that the region close to the heme
                    is unimportant).
                  </p>

                  <p className="md-prose">
                    To further probe this relationship, a scatter plot showing the
                    degradation rate of the four reference UPOs against their
                    corresponding channel opening is presented in Figure{" "}
                    <FigNum of="lit-scatter" />. Visually, the points suggest a
                    possible linear trend. Such a linear fit (shown in Figure{" "}
                    <FigNum of="lit-linear-fit" />) would imply that degradation
                    rate increases proportionally with channel opening. However,
                    this relationship shows no plateau, which we suspect does not
                    reflect biological reality. For this reason,{" "}
                    <strong>we instead fitted a quadratic curve</strong> (shown in
                    Figure <FigNum of="lit-curve-fit" />
                    ), which we believe offers a more biologically plausible
                    representation of the relationship. This, too, remains a
                    simplification of a rather complex underlying relationship;
                    the true functional form could, for instance, be sigmoidal
                    instead.
                  </p>

                  <p className="md-prose">
                    Although the trend observed in Figure{" "}
                    <FigNum of="lit-curve-fit" /> is strong, it is based on
                    relatively few data points and is therefore not sufficient, on
                    its own, to propose an entirely new theory for specifically
                    UPOs research. For this reason,{" "}
                    <strong>
                      we also look directly at the channel opening radius as a
                      second, complementary approach
                    </strong>
                    , without setting aside the geometry-activity relationship
                    established above. We treat the two as complementary rather
                    than competing, and use each where it best fits our needs.
                    Full channel geometry analysis is more appropriate for
                    filtering UPO candidates generated by the CUPP and Boltz-2
                    pipeline, and for providing detailed insight into the
                    structures of our engineered candidates. The single
                    entrance-radius metric, meanwhile, offers a faster estimate of
                    NNBT degradation potential and is used to filter candidates
                    produced by RFdiffusion.
                  </p>

                  <p className="md-prose">
                    Note that this trend is not intended as a generalized,
                    production-level model; rather, it is used to better elucidate
                    the relationship between channel geometry/opening and
                    activity. Although this trend is later used to predict
                    activity for UPOs without experimental measurements available,
                    or for novel UPO candidates,{" "}
                    <strong>
                      it is intended mainly for qualitative comparison
                    </strong>{" "}
                    (e.g., &quot;UPO X is probably more active than UPO Y&quot;)
                    rather than strict quantitative prediction.
                  </p>
                </TextBox>

                {/* The source document's Figures 6, 7 and 8 (the page numbers its
                    own figures — see FigureNumbers.tsx). It gives no upload
                    path for them, so these three were supplied separately;
                    every one was checked against the asset host before being
                    put here. */}
                {/* All three across, because they are the SAME four points
                    drawn three ways — bare, under a linear fit, under the curve
                    fit — and the paragraph above asks the reader to compare the
                    fits. Side by side that comparison is one glance; stacked it
                    is three screens of scrolling. */}
                <FigureRow cols={3}>
                  <WikiFigure
                    fig="lit-scatter"
                    src={`${REFERENCE_COMPARISON_BASE}/degradation-vs-channel-opening.avif`}
                    alt="Scatter plot with one point per reference UPO: channel opening on one axis, NNBT degradation rate on the other."
                  >
                    Scatter plot of the NNBT degradation rate of the four
                    reference UPOs against their corresponding channel opening.
                  </WikiFigure>
                  <WikiFigure
                    fig="lit-linear-fit"
                    src={`${REFERENCE_COMPARISON_BASE}/degradation-vs-channel-opening-linear-fit.avif`}
                    alt="The same four points with a straight line fitted through them."
                  >
                    The same points with a linear fit, which would imply that
                    degradation rate increases proportionally with channel
                    opening.
                  </WikiFigure>
                  <WikiFigure
                    fig="lit-curve-fit"
                    src={`${REFERENCE_COMPARISON_BASE}/degradation-vs-channel-opening-curve-fit.avif`}
                    alt="The same four points with a curve fitted through them, levelling off rather than rising without limit."
                  >
                    The same points with the curve fit used instead, whose
                    equation is reused in the database discovery section below
                    and on the engineering page.
                  </WikiFigure>
                </FigureRow>

                {/* The channels of the literature UPOs whose activity has not
                    been measured, laid out like the measured group above:
                    intro and tunnel figures. The structures themselves are not
                    here: both groups share the one viewer below, under a
                    heading of its own. */}
                <SubsectionHeading
                  plain
                  title="Known UPOs with not experimentally measured activity"
                />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    As in the Molecular Docking/Dynamics section above, we present
                    the results for the other three reference UPOs (those without
                    experimentally measured activity) in a separate subsection.
                    Their channels (before normalization) appear in Figures{" "}
                    <FigNum of="lit-channels-unmeasured" />.
                  </p>
                </TextBox>
                <div className="chf-row" data-fig="lit-channels-unmeasured">
                  {LIT_CHANNEL_UNMEASURED.map((slug) => (
                    <TunnelFigure
                      key={slug}
                      label={LIT_NAMES[slug]}
                      slug={slug}
                      caption={`Selected channel for ${LIT_NAMES[slug]}`}
                    />
                  ))}
                </div>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    There is no additional knowledge to extract from their channel
                    geometry alone, since we do not have NNBT degradation rates
                    available for them. However, after normalization (see Figure{" "}
                    <FigNum of="lit-unmeasured-overlay" />
                    ), we projected their channel opening radius onto the curve
                    fit produced in the section above and estimated their NNBT
                    degradation activity values (see Figure{" "}
                    <FigNum of="lit-unmeasured-projection" />
                    ).{" "}
                    <strong>We expect Fett to have the greatest activity</strong>,
                    with the other two showing roughly similar values to one
                    another. Note, however, that Fett&apos;s channel appears
                    unique in terms of its distribution; given the very small
                    pocket produced by fpocket, we cannot exclude the possibility
                    that this channel is the result of a structural artifact.
                  </p>
                </TextBox>

                {/* The two of them across, because the second is the first one
                    read against the references: the overlay shows the three
                    channels, the scatter puts the opening radius each of them
                    ends on back onto the curve fitted to the measured four.
                    `matchHeights` because the overlay is much wider than it is
                    tall and the scatter is nearly square — left to themselves
                    they come out at different heights side by side. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="lit-unmeasured-overlay"
                    src={`${CUPP_CLUSTER_BASE}/fett-hsp-mwe-reference-region-simple-profiles.avif`}
                    alt="Overlaid normalized channel profiles for Fett, Hypoxylon sp. UPO and MweUPO-1, each drawn as +R and its mirror −R against normalized distance from heme to exit, with the last quarter of the channel shaded."
                  >
                    The normalized channel profiles of the three UPOs without
                    measured activity, overlaid; the shaded band marks the
                    clustering window. Fett widens fastest towards the exit,
                    while the other two stay close to one another over most of
                    the channel.
                  </WikiFigure>
                  <WikiFigure
                    fig="lit-unmeasured-projection"
                    src={`${CUPP_CLUSTER_BASE}/degradation-vs-channel-opening-with-fett-hsp-mwe-curve-fit.avif`}
                    alt="The degradation-rate against channel-opening scatter plot with the four measured references marked in red on the quadratic fit, and Fett, Hypoxylon sp. UPO and MweUPO-1 placed on that fit in blue at their own channel openings."
                  >
                    The three UPOs (blue) placed on the curve fitted to the four
                    measured references (red) at their own channel opening,
                    giving the degradation rate the fit predicts for each.
                  </WikiFigure>
                </FigureRow>

                {/* The viewer gets a group of its own, headed like the two
                    activity groups above it, because it belongs to neither:
                    it holds all seven structures. Same `plain`
                    SubsectionHeading, so the three read as siblings and none
                    of them reaches the TOC. */}
                <SubsectionHeading
                  plain
                  title="Structure Viewer for known UPOs"
                />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    In the structure viewer below, you can see all seven known
                    UPOs analyzed above (both those with known and unknown
                    activity), along with their best NNBT docking pose and their
                    corresponding pockets/channels.
                  </p>
                </TextBox>

                {/* Interactive 3D structure viewer (3Dmol.js, lazy-loaded).
                  Moved here from the Engineering page; it stays with the UPO
                  branch because the structures listed in it are heme enzymes.

                  POSITION AND CONTENTS: one viewer for the whole section,
                  closing it, immediately before "UPOs database discovery". The
                  two activity groups each used to end on a viewer of their own,
                  which put the same three overlays and the same controls on
                  screen twice and made comparing across the groups a matter of
                  scrolling between two canvases. They now share this one, built
                  from LITERATURE_ALL_STRUCTURES (see structures.ts), whose tabs
                  list the measured four first. The groups keep their own
                  headings, intros and tunnel figures — only the structures were
                  pooled. No heading of its own: the reader arrives here from
                  the group above and StructureViewer renders none.

                  Two WebGL contexts now live on this page — this one and the
                  database viewer further down — and the lazily-imported 3Dmol
                  chunk is shared between them, so this costs no extra
                  download. */}
                <StructureViewer structures={LITERATURE_ALL_STRUCTURES} />
              </div>
            </section>

            {/* --- Group 2b: database-based discovery, UPO branch ---
                ORDER: channel discovery FIRST, then docking and dynamics. The
                channel search is what picks most of the structures that are
                then simulated (9 of the 12 selected accessions, per the intro
                below), so it cannot come after them. That is the one thing
                arranged differently from the literature branch above. */}
            <section id="database-based" className="mt-5 track-upo">
              <SectionHeading title="UPOs database discovery" />
              <TextBox className="model-prose">
                <p className="md-prose">
                  In this section, we demonstrate how we used the CUPP pipeline
                  for novel UPO discovery. After filtering the set of CUPP
                  sequences down to 100, we used Boltz-2 to predict their
                  structures. From this set, 12
                  accessions were ultimately selected, based on a practical limit
                  set by the wetlab group. Of these 12 accessions, 9 were chosen
                  using our channel discovery pipeline, and 3 from the CUPP tree
                  to ensure distributed tree representation.
                </p>
              </TextBox>

              {/* --- subsection: CUPP discovery ----------------------------- */}
              <div
                id="cupp-database"
                className="dsub"
                data-toc-title="CUPP discovery"
              >
                <SubsectionHeading title="CUPP discovery" />
                {/* Transcribed from the team's "CUPP_Database_Discovery"
                    document; the method half is folded into the box at the
                    end, like the laccase and structural boxes elsewhere on
                    this page. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    To discover other enzymes that may perform our reaction of
                    interest more efficiently than known enzymes, we devised a
                    strategy to explore relevant sequence space. It consisted of
                    building a sequence space based on blasting a list of seed
                    sequences against large databases, generating a dendrogram
                    based on CUPP, a clustering tool, followed by docking and
                    binding analysis of candidates across the resulting CUPP
                    groups.
                  </p>
                </TextBox>
                {/* The CUPP pipeline as a flowchart, then its method write-up
                    behind a disclosure — the same arrangement as the channel
                    discovery subsections (ChannelWorkflow + ChannelMethodsBox):
                    one card per step, animation beside the summary, and the rest
                    of the write-up printed in the card rather than behind a
                    second toggle. */}
                <ModelPipeline steps={UPO_CUPP_WORKFLOW} />
                <DetailsBox label="More details on the CUPP pipeline">
                  <p className="mm-prose">
                    In order to explore more diverse enzymes that may have
                    activity with NNBT, we built a sequence space from sequences
                    at UniProt using BLAST and MMseqs2. We created two
                    databases: one containing all reviewed sequences with an EC
                    number and another with all sequences in the hemethiolate
                    peroxidase enzyme superfamily (SSF47571). We BLASTed our
                    seeds against these two databases, then we made the union of
                    both BLAST results and homology reduced this union using
                    MMseqs2. The resulting sequence space was then used to
                    create a dendrogram using CUPP.
                  </p>
                  <p className="mm-prose">
                    In the case of the UPOs, the resulting CUPP dendrogram
                    contained about 1,500 sequences. As a broad filter for
                    further docking and structural analysis, we used ProSmith to
                    score all ~1,500 sequences, narrowing them down to the top
                    100 highest ProSmith score against the substrate NNBT. We
                    predicted the structures of these 100 sequences using Boltz-2
                    and acquired 100 structures. First the channel discovery
                    pipeline was applied and led to the selection of 9
                    structures with promising and diverse channel profiles. More
                    details regarding this step are presented in the following
                    section.
                  </p>
                  <p className="mm-prose">
                    The disposition on the CUPP tree of the final 100 structures
                    from Boltz-2, molecular dynamics, channel discovery pipeline,
                    and taxonomy was used to choose 12 homolog sequences for
                    production and wetlab testing.
                  </p>
                  <MvizMoreInline value={true}>
                    <MethodBlock
                      id="upo-cupp-method-sequence-space"
                      step={UPO_CUPP_WORKFLOW[0]}
                    >
                      <div className="mviz">
                        <BlastStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[0].title}
                          more={
                            <>
                              <p>
                                We Blasted our seed sequences against two
                                databases extracted from UniProt. One was all
                                enzymes at UniProt which had an EC number and
                                were reviewed. The other was all UniProt
                                sequences from the hemethiolate peroxidase
                                enzyme superfamily (SSF47571).
                              </p>
                              <p>
                                The sequence space was homology reduced using
                                MMseqs2 <Cite id="Gabler2020" />{" "}
                                <Cite id="Zimmermann2018" /> to prevent bias
                                towards too similar sequences when clustering
                                them.
                              </p>
                            </>
                          }
                        >
                          Basic Local Alignment Search Tool (BLAST) compares
                          sequence similarity based on statistical significance
                          of matches, finding regions of similarity across
                          sequences <Cite id="Sayers2024" />. We used it to
                          create a sequence space of relevant sequences that
                          were later grouped using CUPP.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                    <MethodBlock
                      id="upo-cupp-method-cupp"
                      step={UPO_CUPP_WORKFLOW[1]}
                    >
                      <div className="mviz">
                        <PhyloStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[1].title}
                          more={
                            <>
                              <p>
                                The CUPP analysis generated a dendrogram on
                                which we plotted seed information (whether known
                                to have activity on NNBT), CUPP group, taxonomy,
                                Boltz-2 ranking results, ProSmith, and channel
                                data.
                              </p>
                            </>
                          }
                        >
                          CUPP is a clustering and functional annotation tool
                          that groups proteins based on conserved unique peptide
                          patterns <Cite id="Barrett2019" />. We used it to
                          group our sequences contained in the sequence space
                          generated through the previously described Blast
                          searches. We refer to these groups as CUPP groups.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                    <MethodBlock
                      id="upo-cupp-method-prosmith"
                      step={UPO_CUPP_WORKFLOW[2]}
                    >
                      <div className="mviz">
                        <ProSmithStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[2].title}
                          more={
                            <>
                              <p>
                                ProSmith is trained on a list of substrates that
                                does not contain NNBT; however, when plotted
                                against the CUPP dendrogram, the sequences with
                                the top 100 highest ProSmith score for NNBT were
                                all concentrated on the branches containing the
                                enzymes known to react with NNBT. Therefore, we
                                used it as a primary screening tool to shortlist
                                100 sequences for further analysis using Boltz-2
                                and our channel discovery pipeline.
                              </p>
                            </>
                          }
                        >
                          We used ProSmith, a machine learning based enzyme
                          substrate pair prediction (ProSmith) tool to score the
                          sequences in our CUPP dendrogram. It processes protein
                          amino acid sequences and small molecule strings and
                          gives a score that indicates how likely it is that a
                          specific small molecule string is a substrate to a
                          given enzyme sequence <Cite id="Kroll2024" />.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                    <MethodBlock
                      id="upo-cupp-method-boltz"
                      step={UPO_CUPP_WORKFLOW[3]}
                    >
                      <div className="mviz">
                        <BoltzStage />
                        <MvizInfo
                          title={UPO_CUPP_WORKFLOW[3].title}
                          more={
                            <>
                              <p>
                                Each sequence was folded as a complex rather
                                than alone. The prediction specification
                                contained the protein sequence, the heme
                                cofactor as CCD entry HEM, and NNBT as a SMILES
                                string, with the affinity property set on NNBT.
                                Co-folding the heme is what makes these
                                structures usable downstream: the access channel
                                is traced outward from the heme iron, so a model
                                folded without its cofactor gives the tunnel
                                search no starting point, and docking into a
                                vacant porphyrin cavity would let the substrate
                                occupy the space the cofactor should fill.
                                Multiple sequence alignments were generated
                                through the Boltz-2 MSA server.
                              </p>
                              <p>
                                Predictions were run through our batch script
                                that takes a YAML template and a FASTA file and
                                submits one prediction per sequence, executed on
                                an NVIDIA A100 GPU. The template holds the
                                ligand definitions and a <code>{"{seq}"}</code>{" "}
                                placeholder, so the same driver serves both
                                enzyme families: the UPO template specifies heme
                                and NNBT, while the laccase template specifies
                                four copper ions and no substrate. The script is
                                resume-safe, so an interrupted run continues
                                from the last completed accession, and it writes
                                every confidence and affinity metric Boltz-2
                                reports into a single summary table alongside
                                each predicted structure converted to PDB.
                              </p>
                            </>
                          }
                        >
                          Boltz-2 is a co-folding model that predicts the
                          structure of a protein together with its ligands in a
                          single pass, and additionally predicts a binding
                          affinity for a nominated ligand{" "}
                          <Cite id="Passaro2025" /> <Cite id="Wohlwend2024" />{" "}
                          <Cite id="Mirdita2022" />. We used it to generate
                          structures for the 100 sequences shortlisted by
                          ProSmith, none of which has an experimental structure,
                          and on which all subsequent pocket, channel, docking
                          and dynamics analysis depends.
                        </MvizInfo>
                      </div>
                    </MethodBlock>
                  </MvizMoreInline>
                </DetailsBox>
                <TextBox className="model-prose">
                  <p className="md-prose">
                    We began by selecting a list of seed enzyme sequences that may
                    or may not have been reported in literature to have the
                    activity we were looking for. The list is depicted in Table{" "}
                    <TabNum of="upo-seeds" />. By including seeds that were not
                    known to perform the reaction, we hoped to enhance the
                    sequence space with more variety and perhaps get clues based
                    on the disposition of the seeds across the tree. We then
                    blasted these seeds against two sequence databases, one
                    containing all verified enzymes with an EC number, and another
                    that contained all enzymes in the same superfamilies as the
                    seed sequences. We then combined these blast results, homology
                    reduced them and made sure the seeds were in the final
                    sequence space. We then used CUPP to generate a dendrogram in
                    which sequences are clustered into CUPP groups based on motifs
                    and similarities.
                  </p>
                </TextBox>

                <PartsTable
                  data={UPO_SEEDS}
                  columns={[
                    { field: "activity", header: "Activity on NNBT", rowHeader: true },
                    { field: "id", header: "UniProt ID" },
                    { field: "description", header: "Description" },
                  ]}
                  groupRowsBy="activity"
                  numberId="upo-seeds"
                  caption="List of seeds used to build the databases clustered by CUPP."
                />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    In the case of the UPOs, the seeds known to do the NNBT
                    reaction were all clustered on one side of the tree, while the
                    seeds not known to do the NNBT reaction were on another. We
                    interpreted that as indicating that one side of the tree was
                    far more relevant for our analysis.
                  </p>
                  <p className="md-prose">
                    To further help us reduce the amount of sequences we would
                    analyze, we scored all of the sequences in the dendrogram with
                    ProSmith (Enzyme-Substrate Pair Prediction). ProSmith is a
                    machine learning based model that predicts enzyme-substrate
                    pairs and provides a score all based on the sequence and
                    SMILES of the substrate.
                  </p>
                  <p className="md-prose">
                    Interestingly, the sequences with the top 100 highest ProSmith
                    scores were all on the same side of the tree as the seeds
                    known to do the NNBT reaction, furthermore, they were
                    surrounding the branches around these seeds (see Figure{" "}
                    <FigNum of="upo-cupp-tree" />
                    ). ProSmith is not trained on NNBT and even though the scores
                    were overall low, the fact that they were all present in the
                    same side of the tree as the NNBT reacting seeds convinced us
                    that we could rely on it as a preliminary filter. Therefore,
                    we selected the top 100 ProSmith score sequences for further
                    analysis in binding, molecular dynamics, etc.
                  </p>
                </TextBox>
                <WikiFigure
                  wide
                  fig="upo-cupp-tree"
                  src="https://static.igem.wiki/teams/6060/wiki/drylab/upo-discovery/finalupotree.avif"
                  alt="CUPP dendrogram of the UPO sequence space, ringed by CUPP group, organism family and CAVER channel-size score bars."
                >
                  CUPP dendrogram for UPOs. Inner most circle represents the
                  CUPP groups while outer most circle represents the family of
                  the organism of origin. CAVER channel size scores are
                  represented by score bars.
                </WikiFigure>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    The 100 shortlisted sequences have no experimental structures,
                    so structures were predicted with Boltz-2, which folds the
                    protein together with its ligands in one pass. Each sequence
                    was folded as a complex with the heme cofactor and NNBT,
                    giving a starting point for the channel and docking analyses
                    that follow. Predictions were ranked on Boltz-2&apos;s
                    confidence score and its predicted affinity for NNBT, with
                    low-confidence structures excluded; see Methods for the
                    thresholds and their limitations.
                  </p>
                  <p className="md-prose">
                    Three candidates were chosen at this point. A0A0C9U748 is the
                    only representative of its CUPP group so its addition enhances
                    the diversity of our candidate pool. We found A0A0C9TXI4 to be
                    from the same organism as A0A0C9U748. That indicates these two
                    enzymes might have different functions, so we also included it
                    to enhance diversity. Lastly, we chose A0A5C3KL04 due to its
                    close location to a seed known to have activity on NNBT, and
                    its high confidence score from Boltz-2.
                  </p>
                  <p className="md-prose">
                    Our final selection took into consideration the results from
                    our channel discovery pipeline (presented in the next
                    section), molecular docking and molecular dynamics analysis,
                    as well as disposition of the sequences across the CUPP tree.
                    We aimed to represent all relevant CUPP groups and to explore
                    the sequence space farther away from our seeds as well as
                    sequences that scored high in our analysis and were close to
                    the seeds in the CUPP tree. The final 12 candidates are
                    depicted in Table <TabNum of="upo-final-candidates" />.
                  </p>
                </TextBox>

                <PartsTable
                  data={UPO_FINAL_CANDIDATES}
                  columns={[
                    { field: "id", header: "UniProt ID", rowHeader: true },
                    { field: "rationale", header: "Rationale" },
                  ]}
                  numberId="upo-final-candidates"
                  caption="List of final novel candidate UPOs."
                />
              </div>

              {/* --- subsection: channel discovery --------------------------- */}
              <div
                id="channel-database"
                className="dsub"
                data-toc-title="Channel discovery"
              >
                <SubsectionHeading title="Channel discovery" />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    As described in the literature-based UPO discovery section,
                    our novel channel discovery pipeline is able to identify
                    channels with NNBT degradation potential based on channel
                    geometry. This means it can be applied to the structures
                    generated by the CUPP and Boltz-2 pipeline to <strong>identify which
                    ones have channels resembling the desired geometry</strong>.
                  </p>
                </TextBox>

                {/* The same method write-up as the literature branch above —
                    see the note there. A separate `idPrefix` so the two copies
                    of the cards do not collide on ids. */}
                <ChannelWorkflow />
                <ChannelMethodsBox idPrefix="db" />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    The starting point for this analysis is the set of 100
                    structures produced by Boltz-2. These structures were <strong>filtered
                    using a confidence threshold of 0.85</strong>. The structures that
                    survived this filtering were then given as input to our
                    channel discovery pipeline. Figure{" "}
                    <FigNum of="db-overlay-window" /> shows an overlay of all
                    channels that survived pocket/channel filtering, alongside our
                    reference UPOs (which did not undergo pocket/channel
                    filtering). It additionally displays the window calculated in
                    the literature-based channel discovery section, allowing the
                    reader to focus on the region of highest discrimination.
                  </p>

                  <p className="md-prose">
                    The dendrogram produced from clustering on the entrance window
                    alone is shown in Figure <FigNum of="db-dendrogram" />. We
                    used the default number of clusters,{" "}
                    <em>max(2, n_structures // 3)</em>.{" "}
                    <strong>
                      Clustering on the entrance window alone reduces noise
                      introduced by other regions of the channel.
                    </strong>{" "}
                    As previously mentioned, the cone base is also an important
                    feature; however, at least within the set of structures we are
                    working with, it appears to remain almost constant and would
                    not meaningfully differentiate the results.
                  </p>
                  <p className="md-prose">
                    Extracting the clusters from the dendrogram and generating
                    per-cluster overlays produces Figure{" "}
                    <FigNum of="db-cluster-overlays" />, which shows the cluster
                    overlays of the raw channels directly. Figure{" "}
                    <FigNum of="db-cluster-means" /> is produced from the same
                    clusters but instead plots mean/std.
                  </p>
                  <p className="md-prose">
                    In these plots (dendrogram and cluster overlays), we have
                    annotated the reference UPOs with red labels, while the
                    accessions chosen for wetlab validation are labeled in
                    blue. Justification for the selection follows below.
                  </p>
                </TextBox>

                {/* The overlay and the tree it is clustered into, side by side.
                    matchHeights because the tree is much taller than the
                    overlay — without it the pair would come out at very
                    different heights. */}
                <FigureRow cols={2} matchHeights>
                  {/* NOTE THE NAME. This one is not
                      `best-tunnel-overlay-uncolored-with-window`, which is what
                      the figures around it would lead you to expect —
                      "with-window" sits in the MIDDLE, after `best-tunnel`.
                      That is why it could not be found by pattern and had to be
                      supplied; checked against the asset host, like the rest. */}
                  <WikiFigure
                    fig="db-overlay-window"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-overlay-uncolored.avif`}
                    alt="The same overlay of CUPP and Boltz-2 channel profiles, with the high-discrimination window marked across the normalized distance axis."
                  >
                    Overlay of the channels from the structures generated by the
                    CUPP and Boltz-2 enzyme discovery pipeline, alongside the
                    discrimination window.
                  </WikiFigure>
                  <WikiFigure
                    fig="db-dendrogram"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-dendrogram.avif`}
                    alt="Hierarchical clustering dendrogram of the channel shape profiles, with each leaf labelled by accession and the reference UPOs among them."
                  >
                    Dendrogram showing the clustering of the novel enzymes
                    (labeled by accession ID) together with the seven known
                    UPOs.
                  </WikiFigure>
                </FigureRow>

                <TextBox className="model-prose">
                  <p className="md-prose">
                    Our goal was to choose structures with diverse channel
                    geometry. We therefore aimed to{" "}
                    <strong>
                      select accessions covering as much of the dendrogram as
                      possible
                    </strong>
                    , which allows us to further elucidate the relationship
                    between channel geometry and activity. Additionally, since
                    some of our selections cluster close to different reference
                    UPOs, we expect (if the structure prediction is close to
                    reality and our proposed theory is valid) to obtain candidates
                    with variation in their NNBT degradation activity.
                  </p>
                  <p className="md-prose">
                    After choosing an initial, promising set of seven structures
                    (accession IDs: A0A9P7RSA8, A0A0C9UQE3, A0A0C9VQZ5,
                    A0A0C4E1P3, A0A4S8L4J7, A0A8H6HXY8, A0A9P5Z220), we decided to
                    soften the fpocket filtering threshold to identify{" "}
                    <strong>
                      two additional structures covering unexplored regions of the
                      dendrogram
                    </strong>
                    . The accession IDs of these structures are A0A9P5XE54 and
                    A0A2H3E6E9.
                  </p>
                </TextBox>
                {/* The shapes the clusters turn out to have — the same
                    per-cluster grid twice, once with the member profiles
                    alone and once with the mean ± standard deviation band
                    over it. The tree that defines them now sits beside the
                    overlay above. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="db-cluster-overlays"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-cluster-overlays.avif`}
                    alt="A grid of per-cluster channel profile overlays showing the member profiles alone, without a mean or standard-deviation band, and the discrimination window shaded grey toward the channel entrance."
                  >
                    Grid of per-cluster channel overlays, without showing the
                    mean ± standard deviation for each cluster.
                  </WikiFigure>
                  <WikiFigure
                    fig="db-cluster-means"
                    src={`${CUPP_CLUSTER_BASE}/best-tunnel-with-window-cluster-means.avif`}
                    alt="A grid of per-cluster channel profile overlays, each panel showing the cluster mean with a shaded standard-deviation band, and the discrimination window shaded grey toward the channel entrance."
                  >
                    Grid of per-cluster channel overlays, showing the mean ±
                    standard deviation for each cluster.
                  </WikiFigure>
                </FigureRow>

                {/* The source document numbers these two figures 6 and 7 —
                    its own count, not the page's. Both are cited by id here,
                    so they carry whatever number they end up with on the
                    page, and follow the figures if either moves. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    Extracting the channels of the nine candidates and creating a
                    separate overlay for them enables a better justification of
                    our choices. In Figure <FigNum of="db-candidates-overlay" />,
                    the variation in channel geometries is shown.
                  </p>
                  <p className="md-prose">
                    Furthermore, we used the equation derived from the four
                    reference UPOs with known activity values (see UPO
                    literature-based discovery) and mapped the channel opening of
                    our nine candidates onto that curve. It is worth reiterating
                    that we do not aim for a strong quantitative prediction of
                    activity, but rather a qualitative approximation; for example,
                    based on Figure <FigNum of="db-candidates-curve" />,{" "}
                    <strong>
                      we expect A0A0C9UQE3 to have higher activity than A0A9P7RSA8
                    </strong>
                    .
                  </p>
                </TextBox>
                {/* The candidates' own channels on the left, in the same
                    discrimination window as the database-wide overlay further
                    up; the curve they are mapped onto on the right. The two
                    plots are different shapes, so the row matches their
                    heights. The prose above cites the curve by id, so its
                    number follows it to the right. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="db-candidates-overlay"
                    src={`${CUPP_CLUSTER_BASE}/candidates-overlay-uncolored.avif`}
                    alt="Channel radius profiles of the nine chosen candidates overlaid on one normalized axis from the heme (0) to the channel exit (1), with the high-discrimination window shaded towards the exit."
                  >
                    Overlay of the channels of the nine chosen candidates,
                    alongside the discrimination window.
                  </WikiFigure>
                  <WikiFigure
                    fig="db-candidates-curve"
                    src={`${CUPP_CLUSTER_BASE}/degradation-vs-channel-opening-curve-fit-with-candidates.avif`}
                    alt="NNBT degradation rate against channel opening: the four reference UPOs as red points and the nine candidate accessions as blue points placed on the dashed quadratic curve fitted to the references."
                  >
                    Predicted NNBT degradation activity of the nine chosen
                    candidates, estimated by mapping their channel opening onto
                    the fitted curve.
                  </WikiFigure>
                </FigureRow>

                {/* Every candidate's channel, in ONE row and one group.

                    Driven off DATABASE_STRUCTURES, the same list the viewer
                    below tabs, so the channels and the structures can never
                    disagree about which candidates there are: adding one to
                    that list adds it here too, in the same order. The slug is
                    the accession lowercased, which is also the upload path —
                    all nine plots checked against the asset host. */}
                <TextBox className="model-prose">
                  <p className="md-prose">
                    The following plots show the raw, pre-normalized 2D channel
                    profiles for the nine chosen candidates. Note that, unlike the
                    channels shown in previous plots,{" "}
                    <strong>
                      these are not directly comparable to one another
                    </strong>
                    ; instead, they provide information on the length of each
                    channel.
                  </p>
                </TextBox>
                <div className="chf-row">
                  {DATABASE_STRUCTURES.map((st) => (
                    <TunnelFigure
                      key={st.id}
                      label={st.label}
                      slug={st.id}
                      caption={`Selected channel for ${st.label}`}
                    />
                  ))}
                </div>
              </div>

              {/* --- subsection: molecular docking and molecular dynamics ----
                  Same subsection as the literature branch, and the same shape
                  inside it: heading, flowchart, both method boxes, then the
                  results as ONE run of prose and figures.

                  The results used to carry a plain "Molecular docking" and
                  "Molecular dynamics" heading of their own. They are gone: the
                  two techniques are one pipeline here — the docking poses are
                  what the dynamics start from, and the paragraphs read
                  straight on from one another — so splitting them put two
                  headings between a reader and three paragraphs, and made this
                  section look unlike the literature one for no reason. What
                  separates the results is still in their first words
                  ("Molecular docking successfully generated poses…", "As shown
                  in the following figures…"). */}
              <div
                id="structural-database"
                className="dsub"
                data-toc-title="Molecular docking and dynamics"
              >
                <SubsectionHeading title="Molecular docking and molecular dynamics" />
                {/* The same flowchart and the same box as the literature
                    branch: one pipeline, applied to a second set of
                    structures. */}
                <ModelPipeline steps={STRUCTURAL_WORKFLOW} />
                <StructuralMethodsBox
                  idPrefix="db"
                  steps={STRUCTURAL_WORKFLOW}
                />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    <strong>
                      Molecular docking successfully generated poses with the
                      expected NNBT orientation in all 9 structures
                    </strong>
                    , with the aromatic ring oriented toward the heme and the two
                    oxygen atoms facing the solvent.
                  </p>
                  <p className="md-prose">
                    Comparing NNBT poses across the set revealed that the
                    ligand&apos;s proximity to the heme varied between structures,{" "}
                    <strong>
                      reflecting the strong influence of channel geometry and
                      length on NNBT placement
                    </strong>
                    .
                  </p>
                </TextBox>

                {/* Headed like the literature section's viewer ("Structure
                    Viewer for known UPOs"), with the same `plain`
                    SubsectionHeading, so the two viewers on this page are
                    introduced the same way and neither reaches the TOC. */}
                <SubsectionHeading
                  plain
                  title="Structure Viewer for candidate UPOs"
                />
                <TextBox className="model-prose">
                  <p className="md-prose">
                    This is the structure viewer for the nine chosen candidates,
                    showing their best NNBT docking pose, best pocket, and
                    channel.
                  </p>
                </TextBox>
                {/* The same interactive 3D viewer as in the literature section
                  above, pointed at the database-search candidates instead of
                  the literature-curated reference structures (the tab list is
                  a prop — see DATABASE_STRUCTURES in structures.ts).
                  Two instances means two WebGL contexts on this page, but the
                  lazily-imported 3Dmol chunk is shared between them. */}
                <StructureViewer structures={DATABASE_STRUCTURES} />

                <TextBox className="model-prose">
                  <p className="md-prose">
                    Heading into the molecular dynamics validation of our
                    candidates and their NNBT docking poses, we provided the best
                    docking pose for each candidate and ran the same MD pipeline
                    as in the literature-based discovery section.
                  </p>
                  <p className="md-prose">
                    As shown in the following figures,{" "}
                    <strong>most structures exhibit relatively low RMSD</strong>{" "}
                    compared to the baseline established during literature
                    discovery of UPOs, indicating good overall stability.
                    Additionally, inspection of the ligand-to-heme and SASA plots,
                    together with visual analysis of the trajectories,{" "}
                    <strong>
                      confirmed that NNBT did not escape the pocket in any case
                    </strong>
                    .
                  </p>
                </TextBox>

                {/* Accession and plots only — see the note on the literature
                    rows above for where a per-candidate description would go. */}
                {MD_CANDIDATES.map((c) => (
                  <MdFigureBlock
                    key={c.accession}
                    name={c.accession}
                    slug={c.slug}
                  />
                ))}
              </div>
            </section>

            {/* Discussion */}
            <section id="discussion" className="mt-5">
              <SectionHeading title="Discussion" />
              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  {/* PLACEHOLDER — replace with the real discussion. */}
                  Placeholder discussion text. Interpret the discovery results,
                  note the limitations, and connect them back to the wetlab /
                  project goals.
                </p>
              </TextBox>
            </section>

            {/* References */}
            <section id="references" className="mt-5">
              <SectionHeading title="References" />
              {/* Everything here comes from the channel-method cards, which
                  this page renders at the end of both Channel discovery
                  subsections — the rest of the page is placeholder text and
                  cites nothing. The list is built from DISCOVERY_REFERENCES
                  rather than typed out, so it follows whatever that method
                  cites; add to DISCOVERY_OWN_CITATIONS when a section on this
                  page starts citing works of its own. */}
              <ReferenceBar
                references={referenceNodes(DISCOVERY_REFERENCES)}
                showTitle={false}
              />
            </section>

            {/* Bottom prev/next navigation (Methods ← Discovery → Engineering) */}
            <ModelPager active="discovery" />
          </NumberedFigures>
        </div>
      </div>
    </>
  );
}
