import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Cite } from "../dry-lab/Cite";
import type { CitationKey } from "../dry-lab/bibliography";

/* ========================================================================== *
 *  Engineering page — the content of the two branches
 *
 *  WHY THIS FILE EXISTS
 *  engineering.tsx is the layout: the hero intro, the flow chart, the toggle
 *  and the loop that draws a cycle. Everything a biologist would want to edit
 *  is here instead, so writing up a cycle means editing prose in one file and
 *  never touching the page machinery.
 *
 *  WHERE IT COMES FROM
 *  Transcribed from the team's "Engineering page" document. The laccase branch
 *  is written up; the UPO branch is still the author's draft and is marked as
 *  such (see `draft` on the branch below), which is what puts the visible
 *  "draft" notice on the page.
 *
 *  DO NOT INVENT RESULTS HERE. Where the source document still holds a note to
 *  the team rather than a finding — "Table with biobricks", "Did we beat
 *  literature?", an empty Learn section — the stage carries a short `pending`
 *  line instead and the open questions stay in the document. A stage with
 *  neither `body` nor `pending` renders nothing at all.
 * ========================================================================== */

/** One stage of a DBTL cycle: what is written, and what is still outstanding. */
export type Stage = {
  /** The written content. Omit while the stage has nothing real to say. */
  body?: ReactNode;
  /** One short line naming what is still missing, shown under `body` (or
   *  alone). Keep it factual — it says work is outstanding, never what the
   *  result will be. */
  pending?: string;
};

export type Cycle = {
  /** Section id, and therefore the scroll target of the flow chart above.
   *  Unique across BOTH branches — only one branch is mounted at a time, but
   *  the ids are also written into links. */
  id: string;
  /** Short form for the windmill table of contents and the flow chart. */
  label: string;
  /** Full heading, as the document titles it. */
  title: string;
  /** The question the cycle set out to answer. Rendered as the banner under
   *  the heading — it is the spine of the page, so every cycle needs one. */
  question: string;
  design: Stage;
  build: Stage;
  test: Stage;
  learn: Stage;
};

export type BranchKey = "laccases" | "upos";

export type Branch = {
  key: BranchKey;
  /** Label on the toggle button. */
  label: string;
  /** One line under the toggle, saying what this track is for. */
  blurb: ReactNode;
  /** Set while the branch is still an outline rather than a write-up. Puts a
   *  visible notice above the cycles; remove it once the prose is real. */
  draft?: boolean;
  cycles: Cycle[];
  /** Exactly the works this branch cites, in display order. A work listed but
   *  never cited is worse than one missing — keep this in step with the
   *  <Cite> tags in the prose above. */
  references: readonly CitationKey[];
};

/* -------------------------------------------------------------------------- *
 *  LACCASES — written up from the team's document.
 * -------------------------------------------------------------------------- */

const LACCASE_CYCLES: Cycle[] = [
  {
    id: "lac-cycle-1",
    label: "Cycle 1",
    title: "Cycle 1: Literature research",
    question:
      "Are there already enzymes in the literature that have shown activity on our model compound, and do they work in our assay system?",
    design: {
      body: (
        <>
          <p>
            We based a large part of our first cycle on the work of
            Wongwattanarat et al. <Cite id="Wongwattanarat2025" /> on a
            chemo-enzymatic oxidative approach to the bio-based recycling of
            epoxy-based carbon-fibre-reinforced polymers (CFRPs). That work
            describes an enzymatic approach to degrade precursors of
            aviation-grade epoxy resins. Although the materials used in the
            aviation industry aren't the same as those used by the wind
            industry, they have to meet very similar requirements and are
            therefore quite alike in terms of molecular structure.
          </p>
          <p>
            The study concluded that ItL-03, a bacterial laccase isolated from a
            metagenome, was the most promising candidate, showing a significant
            amount of degradation on several precursors of a specific resin
            scaffold (RTM6) — specifically on <i>N,N</i>-bis(2-hydroxypropyl)-
            <i>p</i>-toluidine (NNBT). NNBT showcases a tertiary amine bond,
            which is a common feature in cured wind-turbine epoxy polymers.
          </p>
          <p>
            As a first engineering cycle, we selected ItL-03, the
            best-performing enzyme from the study, and CueO, a well-studied
            enzyme from <i>E. coli</i> that was used as a benchmark in the same
            work. The two enzymes share 60% homology, which means that anything
            we learn about engineering one could be used to engineer the other —
            which we took advantage of in Cycle 3.
          </p>
          <p className="eng-lead-in">Our objective was:</p>
          <ul>
            <li>
              To know whether we could repeat the findings from the study — that
              ItL-03 outperforms CueO on NNBT.
            </li>
            <li>
              To validate our assay system, and specifically to verify whether
              the purpald assay from Dolz et al. <Cite id="Dolz2022" />, which
              was designed for UPOs, could work for laccases and give us a
              high-throughput assay to use in later cycles.
            </li>
            <li>
              To characterise the products of the enzymatic reaction of laccases
              on NNBT.
            </li>
          </ul>
        </>
      ),
    },
    build: {
      body: (
        <p>
          Both enzymes were ordered as plasmid constructs, expressed in{" "}
          <i>E. coli</i> and purified.
        </p>
      ),
      pending:
        "Construct details and the parts table for this cycle are still being compiled.",
    },
    test: {
      body: (
        <>
          <p>
            We used our standard assay system to test our enzymes, which we
            slightly adapted to fit laccases. Specifically:
          </p>

          <h4 className="eng-assay">ABTS assay</h4>
          <p>
            This colorimetric assay is a fairly standard procedure for
            determining oxidant enzymatic activity. In it,
            2,2′-azino-bis(3-ethylbenzothiazoline-6-sulfonic acid) (ABTS), a
            colourless compound, is oxidised to form a blue-green radical that
            absorbs at 420 nm. We used it to determine how much oxidative
            activity our enzymes had.
          </p>

          <h4 className="eng-assay">Purpald</h4>
          <p>
            The main question for this assay was: does this UPO assay work for
            laccases? This high-throughput colorimetric assay was designed by
            Dolz et al. <Cite id="Dolz2022" /> to analyse which UPO could best
            degrade the tertiary amine bond of NNBT. The reaction it follows is
            the formation of lactaldehyde by <i>N</i>-dealkylation of NNBT; the
            lactaldehyde then reacts with purpald to form a purple compound that
            absorbs at 530 nm.
          </p>

          <h4 className="eng-assay">MALDI-TOF</h4>
          <p>
            Matrix-Assisted Laser Desorption/Ionisation Time-of-Flight
            (MALDI-TOF) is a mass-spectrometry technique used to analyse which
            compounds are in a liquid sample. We used it to answer the question:
            what exactly are the products of the enzymatic reaction we are
            analysing?
          </p>

          <p>
            The exact protocols are under{" "}
            <Link to="/measurement">Measurement</Link>.
          </p>
        </>
      ),
    },
    learn: {
      body: (
        <>
          <p>
            This first cycle showed us several things, which we then used to
            move on to Cycles 2 and 3. Detailed results are on the{" "}
            <Link to="/results">Results</Link> page; the main findings were:
          </p>
          <ul>
            <li>Purpald works for laccases, not only for UPOs.</li>
            <li>
              The enzymes are very active — more so than the UPOs in the
              parallel track.
            </li>
            <li>
              The reaction is messier, leaving some products we have not yet
              identified.
            </li>
          </ul>
          <p className="eng-takeaway">
            We have active enzymes with messy products → find homologs with
            clearer activity.
          </p>
        </>
      ),
      pending:
        "The head-to-head comparison of ItL-03 and CueO is still being analysed.",
    },
  },
  {
    id: "lac-cycle-2",
    label: "Cycle 2",
    title: "Cycle 2: Sequence-based discovery",
    question:
      "Do the hits from literature share features we can mine the sequence space for?",
    design: {
      body: (
        <>
          <p>
            Cycle 1 showed us that both ItL-03 and CueO show activity on our
            model compound, NNBT, but that the reaction yields undesired side
            products. We wanted to mine their sequence space for enzyme
            candidates with similar characteristics, which might exhibit a
            cleaner, more specific activity.
          </p>
          <p>
            When analysing the sequences, we observed that ItL-03 and CueO share
            the same two Pfam accession numbers. Pfam is a large collection of
            protein domain families, and we mined the sequence space for enzymes
            carrying both of them (PF07731 and PF07732). That gave a pool of
            around 1,500 sequences, which we then filtered on clustering
            results, enzyme–substrate prediction (ESP) models{" "}
            <Cite id="Kroll2023" /> and molecular docking to pick five
            candidates. This database-discovery process is described in detail
            under <Link to="/model-discovery">Model — Discovery</Link>.
          </p>
        </>
      ),
    },
    build: {
      body: (
        <p>
          The five shortlisted sequences were synthesised as plasmid constructs
          (IDT) and expressed in <i>E. coli</i> using the same backbone and tag
          configuration as Cycle 1, so that activity could be compared directly
          against ItL-03 and CueO without a construct-level confound.
        </p>
      ),
      pending: "The parts table for this cycle is still being compiled.",
    },
    test: {
      body: (
        <p>
          The identical ABTS / purpald / MALDI-TOF panel was applied,
          deliberately unchanged. Holding the measurement constant across cycles
          is what allowed us to compare Cycle 1 with Cycle 2.
        </p>
      ),
    },
    learn: {
      pending:
        "The candidates from this cycle are still being evaluated; this section will be written up once those results are in.",
    },
  },
  {
    id: "lac-cycle-3",
    label: "Cycle 3",
    title: "Cycle 3: Rational engineering",
    question:
      "Based on what has previously been done in the literature — truncations and point mutations in laccases, solvent point mutations in UPOs — how can we implement these modifications on our best-performing enzyme?",
    design: {
      body: (
        <>
          <p>
            With a working scaffold established, further gains had to come from
            engineering the enzyme rather than from finding a different one. We
            drew on two independent lines of CueO engineering, chosen because
            they act through different mechanisms — one steric, one
            thermodynamic — and could therefore plausibly combine.
          </p>

          <h4 className="eng-assay">Truncation — opening substrate access</h4>
          <p>
            CueO is unusual among multicopper oxidases in that its
            substrate-binding site sits buried beneath a methionine-rich helical
            region (α-helices 5–7) that obstructs the approach of organic
            substrates to the type I copper. Kataoka et al.{" "}
            <Cite id="Kataoka2007" /> deleted this region — residues
            Pro357–His406, fifty residues containing thirteen methionines — and
            replaced it with a Gly-Gly linker. The consequence was a functional
            swap: cuprous oxidase activity fell to roughly a tenth of the parent
            enzyme, while activity toward laccase substrates including ABTS and
            2,6-dimethoxyphenol rose, because those substrates could now reach
            the T1 copper. The methionine-rich helices are, in effect, a
            specificity filter that makes CueO a cuprous oxidase by preventing
            it from being a good laccase.
          </p>
          <p>
            That is precisely the trade we want. Our substrate is bulky and our
            target is an organic bond; cuprous oxidase activity is irrelevant to
            us. We identified the equivalent methionine-rich loop in ItL-03 by
            alignment in PyMOL against CueO (60% homology) and removed it
            following the same design.
          </p>

          <h4 className="eng-assay">
            Point mutations — tuning the driving force
          </h4>
          <p>
            Kataoka et al. <Cite id="Kataoka2013" /> modified the first and
            second coordination spheres of the T1 copper at Asp439, Pro444 and
            Met510. The Met510→Leu substitution shifts the T1 redox potential
            positive, increasing the driving force for electron transfer from
            substrate to copper; combining it with the Asp439 and Pro444 changes
            produced synergistic enhancement of laccase activity up to 140-fold
            over wild-type CueO. Equivalent positions in ItL-03 were identified
            by multiple sequence alignment with CueO.
          </p>

          <h4 className="eng-assay">Why combine them</h4>
          <p>
            The two modifications address different bottlenecks. Truncation
            determines whether the substrate can reach the copper; the
            coordination-sphere mutations determine how favourably electron
            transfer proceeds once it does. Neither can compensate for the
            other, and if both bottlenecks are real in our system, the effects
            should be at least additive. That is why we made three variants for
            each enzyme — to test each modification separately and see whether
            the effects add up.
          </p>
        </>
      ),
    },
    build: {
      body: (
        <p>
          Six variants were designed, three for CueO and three for ItL-03:
          truncated, point-mutated, and combined. The CueO variants serve a
          second purpose beyond their own activity — because the published
          effects were measured on CueO, they function as a positive control.
        </p>
      ),
    },
    test: {
      body: <p>The assay platform was, again, the same.</p>,
    },
    learn: {
      pending:
        "The variants are still being characterised; this section will be written up once those results are in.",
    },
  },
];

/* -------------------------------------------------------------------------- *
 *  UPOs — still the author's draft. Everything below is outline-level, and the
 *  branch carries `draft: true` so the page says so out loud.
 * -------------------------------------------------------------------------- */

const UPO_CYCLES: Cycle[] = [
  {
    id: "upo-cycle-1",
    label: "Cycle 1",
    title: "Cycle 1: Literature research",
    question:
      "Are there already enzymes in the literature that have shown activity on our model compound, and do they work in our assays?",
    design: {
      body: (
        <ul>
          <p>
            The first cycle in the UPO branch was a literature search for
            enzymes that could potentially work on our model substrate NNBT, as
            well as establishing an assay to actually test our final enzymes. In
            addition to this, our first cycle involved a lot of collaboration
            and advice from experts in the UPO field, including the CPE group at
            BRIGHT, DTU, that provided us with protocols, training in working
            with the expression host K. phaffii, and sequences of interesting
            candidate enzymes to test.
          </p>
          <li>
            The engineering of PaDa-I, a directed-evolution variant of the
            unspecific peroxygenase from <i>Agrocybe aegerita</i>{" "}
            <Cite id="MolinaEspeja2014" />, and the mapping of its peroxidative
            activity <Cite id="MolinaEspeja2021" />.
          </li>
          <li>
            The high-throughput colorimetric assay for NNBT degradation by UPOs{" "}
            <Cite id="Dolz2022" />.
          </li>
          <li>
            From CBE??? An in-house collection with verified expression in a
            shared backbone.
          </li>
        </ul>
      ),
      pending:
        "Draft — the introduction to UPOs and the rationale for this cycle still need writing.",
    },
    build: {
      body: (
        <p>
          Coding sequences were assembled into the standard CPE backbone by
          Golden Gate assembly, propagated in <i>E. coli</i>, and transformed
          into <i>Pichia pastoris</i> (<i>Komagataella phaffii</i>) for
          expression. We worked with the supernatant, without purification.
        </p>
      ),
    },
    test: {
      body: (
        <ul>
          <li>MALDI-TOF — which products the reaction gives.</li>
          <li>ABTS — how active the enzyme is (peroxidation).</li>
          <li>NBD assay — how active the enzyme is (peroxygenation).</li>
          <li>
            Purpald — how active the enzyme is on our reference compound (see{" "}
            <Link to="/experiments">Experiments</Link>).
          </li>
        </ul>
      ),
    },
    learn: {
      pending:
        "Draft — results for this cycle are still being analysed; see the Results page.",
    },
  },
  {
    id: "upo-cycle-2",
    label: "Cycle 2",
    title: "Cycle 2: Sequence-based discovery",
    question:
      "Do the hits from literature share features we can mine the sequence space for?",
    design: {
      body: (
        <ul>
          <p>
            Taking the seeds from the literature in Cycle 1 and working within
            the UPO superfamily.
          </p>
          <li>
            The link between channel shape and reaction type in UPOs{" "}
            <Cite id="BarrosReguera2025" />.
          </li>
        </ul>
      ),
      pending: "Draft — the selection rationale still needs writing.",
    },
    build: {
      body: (
        <p>
          Seeds from Cycle 1 → CUPP → ESP <Cite id="Kroll2023" /> → docking and
          molecular dynamics → selection based on CUPP groups, giving five
          candidates. The pipeline is described under{" "}
          <Link to="/model-discovery">Model — Discovery</Link>.
        </p>
      ),
    },
    test: {
      body: <p>The same assays as Cycle 1.</p>,
    },
    learn: {
      pending:
        "Draft — results for this cycle are still being analysed; see the Results page.",
    },
  },
  {
    id: "upo-cycle-3",
    label: "Cycle 3",
    title: "Cycle 3: Engineering",
    question:
      "How can we modify our best enzymes so that they perform even better?",
    design: {
      body: (
        <p>
          Channel shape influences which reaction a UPO catalyses{" "}
          <Cite id="BarrosReguera2025" />. We want to widen the channel opening
          to promote the peroxidation reaction and make the enzymes more
          specific.
        </p>
      ),
      pending: "Draft — the design rationale still needs writing.",
    },
    build: {
      body: (
        <p>
          LigandMPNN, RFdiffusion and the CAVER pipeline (see{" "}
          <Link to="/model-engineering">Model — Engineering</Link>): fix the
          active-site residues and diffuse the rest, starting from the worst
          channel shape (PabUPO-II) and trying to widen it. Candidates from the
          pipeline are then selected for testing in the lab.
        </p>
      ),
    },
    test: {
      body: <p>The same assays as Cycle 1.</p>,
    },
    learn: {
      pending:
        "Draft — results for this cycle are still being analysed; see the Results page.",
    },
  },
];

/* -------------------------------------------------------------------------- *
 *  The two branches, in the order the toggle shows them.
 * -------------------------------------------------------------------------- */

export const BRANCHES: Record<BranchKey, Branch> = {
  laccases: {
    key: "laccases",
    label: "Laccases",
    blurb: (
      <>
        Active site on the outside — the better fit for real-life substrates and
        bigger polymers.
      </>
    ),
    cycles: LACCASE_CYCLES,
    references: [
      "Dolz2022",
      "Kataoka2007",
      "Kataoka2013",
      "Kroll2023",
      "Wongwattanarat2025",
    ],
  },
  upos: {
    key: "upos",
    label: "UPOs",
    blurb: (
      <>
        Channel-including enzymes — improved activity on our model substrate
        NNBT.
      </>
    ),
    draft: true,
    cycles: UPO_CYCLES,
    references: [
      "BarrosReguera2025",
      "Dolz2022",
      "Kroll2023",
      "MolinaEspeja2014",
      "MolinaEspeja2021",
    ],
  },
};

/** The toggle's buttons, in order. */
export const BRANCH_ORDER: BranchKey[] = ["laccases", "upos"];
