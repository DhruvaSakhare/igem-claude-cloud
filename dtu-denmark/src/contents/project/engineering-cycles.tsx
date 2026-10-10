import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Cite } from "../dry-lab/Cite";
import { DetailsBox } from "../dry-lab/DetailsBox";
import type { CitationKey } from "../dry-lab/bibliography";
import { DescCite, Todo } from "./DescriptionCite";
import type { DescriptionCitationKey } from "./descriptionReferences";

/* ========================================================================== *
 *  Engineering page — the content
 *
 *  WHY THIS FILE EXISTS
 *  engineering.tsx is the layout: the intro, the flow chart and the loop that
 *  draws a cycle. Everything written lives here instead, so writing up a cycle
 *  means editing prose in one file and never touching the page machinery.
 *
 *  WHERE IT COMES FROM
 *  docs/sources/Engineering page-review.docx, kept as written apart from
 *  typographic fixes, citations turned into <Cite>/<DescCite> and the
 *  document's cross-references ("see Model-discovery section") turned into
 *  links. The two "More about …" boxes in the introduction were moved here
 *  from the Project Description page, unchanged. <Todo> marks a gap the
 *  document itself still has (a placeholder, an unfinished sentence) — fix it
 *  in the document, then here; never with a guess.
 *
 *  HOW TO WRITE A SECTION
 *  Every piece of text below is either `body` (the written content, any JSX)
 *  or `pending` (one quiet line saying what is still to be written). While a
 *  section has no body, its `pending` line is what the page shows. Once the
 *  real text is in, delete the `pending` line.
 *
 *  DO NOT INVENT RESULTS HERE. A stage with nothing real to say yet keeps its
 *  `pending` line; a stage with neither `body` nor `pending` is not drawn.
 * ========================================================================== */

/** A block of text: what is written, and what is still outstanding. */
export type Stage = {
  /** The written content. Omit while there is nothing real to say. */
  body?: ReactNode;
  /** One short line naming what is still missing, shown under `body` (or
   *  alone). Keep it factual — it says work is outstanding, never what the
   *  result will be. */
  pending?: string;
};

/** The enzyme family a cycle belongs to. It picks the colour the cycle is
 *  drawn in — the same blue (laccases) and orange (UPOs) as the Model pages
 *  (dry-lab/tracks.css). */
export type Family = "laccase" | "upo";

export const FAMILY_LABEL: Record<Family, string> = {
  laccase: "Laccases",
  upo: "UPOs",
};

export type Cycle = {
  /** Section id, and therefore the scroll target of the flow chart. */
  id: string;
  family: Family;
  /** Short form, shown under the cycle's ring in the flow chart. */
  label: string;
  /** Full heading. */
  title: string;
  /** The question the cycle set out to answer, shown under the heading. */
  question: Stage;
  design: Stage;
  build: Stage;
  test: Stage;
  learn: Stage;
};

/* -------------------------------------------------------------------------- *
 *  Introduction — the paragraph that opens the page.
 * -------------------------------------------------------------------------- */

export const INTRO: Stage = {
  body: (
    <>
      <p>
        The challenge of degrading wind turbine-grade epoxy resins is a very
        complex and challenging task. The cured polymer forms an intricate and
        almost impenetrable 3-dimensional mesh, and breaking it down into
        defined products that can be repurposed is impossible in one single
        step. This is why we decided to break this project work down into
        several small steps.
      </p>
      <p>
        As mentioned in the <Link to="/description">Project Description</Link>,
        ByeByeBlade sees itself as a part of a bigger process to degrade and
        recover glass fiber-reinforced polymers (GFRPs). It would act downstream
        of a mild solvolysis step that releases polymer fragments of different
        sizes into an aqueous solution. Only then would our enzyme cocktail act
        to yield defined molecules from this mixture, which could then be
        recovered using different downstream processing techniques that are out
        of the scope of this project.
      </p>
      <p>
        During this project, we organized our work in several
        design-build-test-learn (DBTL) cycles to find, test, and improve
        suitable enzyme candidates that can work in this process.
      </p>
      <p>
        We chose to design our process to eventually work in a sequential
        manner, where very active enzymes (but not resulting in a precise
        reaction product) attack and degrade the fragments released by the
        solvolysis step. We found that laccases are a suitable enzyme class for
        this task. Two DBTL cycles were carried out on this enzyme class: one on
        sequence-based discovery of homologs, and the other on engineering
        variants of the best performing laccase from the literature.
      </p>

      <DetailsBox label="More about laccases">
        <p>
          Laccases are multicopper-containing extracellular fungal or bacterial
          enzymes that catalyse the oxidation of phenolic compounds. In nature
          they are very often involved in lignin degradation. Lignin, a major
          component of wood, is a complex three-dimensional phenolic polymer
          that binds cellulose fibres together and thereby gives wood its
          stiffness. These characteristics are similar to those of the epoxy
          resins used in wind turbine GFRPs, which is why lignin-degrading
          enzymes such as laccases are of high interest for enzymatic GFRP
          degradation <DescCite ids={["Ali2019", "Shah2023"]} />.
        </p>
        <p>
          Their active site consists of two copper centres, T1 and T2/3,
          containing one and three copper atoms respectively. The T1 centre
          catalyses the oxidation of the substrate and transfers electrons to
          the T2/3 centre at the core of the enzyme, where oxygen is reduced to
          water.
        </p>
        <p>
          Because of their relatively high molecular weight (50–150 kDa),
          laccases cannot penetrate the dense mesh of lignocellulose in nature,
          or of GFRPs in the lab. They are therefore often used together with a
          redox mediator, a small molecule acting as an intermediate between
          enzyme and substrate. The mediator, for example guaiacol or ABTS, is
          oxidised by the laccase, diffuses into the mesh, and oxidises the
          final substrate.
        </p>
      </DetailsBox>

      <p>
        The laccase products (smaller fragments) still need to be broken down
        into defined molecules that can be used for other purposes. An enzyme
        class that could break down these fragments into defined products by
        oxidative activity could be unspecific peroxygenases (UPOs). We also did
        two DBTL cycles for this enzyme class: one enzyme discovery cycle to
        find homologs, and one RFdiffusion/MPNN-based engineering pipeline to
        tweak the reaction catalyzed by one UPO towards our desired product.
      </p>

      <DetailsBox label="More about unspecific peroxygenases (UPOs)">
        <p>
          UPOs are a class of fungal heme-containing enzymes that catalyse
          oxygenation reactions on a wide range of organic substrates, which is
          where the &quot;unspecific&quot; in the name comes from. They require
          hydrogen peroxide as a cofactor but can perform highly specific and
          complex reactions such as epoxidations and hydroxylations without
          auxiliary proteins or costly cofactors, which makes them a very hot
          topic in biocatalytic chemistry. Their active site consists of a
          channel leading to a heme group where the reaction takes place{" "}
          <DescCite ids={["Monterrey2023"]} />.
        </p>
        <p>
          Phylogenetically, they split into two distinct groups: long UPOs
          (around 40 kDa) and short UPOs (around 30 kDa). They also differ in
          substrate range. Long UPOs tend to accept smaller molecules, whereas
          short UPOs also accept bulkier substrates. Both groups are notoriously
          difficult to express heterologously, and directed evolution campaigns
          have produced an evolved long-UPO variant, PaDa-I, which expresses
          more readily and has become the starting point for many UPO
          engineering campaigns.
        </p>
        <p>
          Recently, several studies and funding programmes, such as the Bizente
          project <DescCite ids={["Bizente"]} />, have focused on the
          degradation of thermoset epoxy resins by UPOs. We chose to build on
          this work when selecting candidates for our project{" "}
          <Cite id="Dolz2022" />.
        </p>
      </DetailsBox>
    </>
  ),
};

/* -------------------------------------------------------------------------- *
 *  The four cycles, in the order they appear on the page.
 * -------------------------------------------------------------------------- */

export const CYCLES: Cycle[] = [
  {
    id: "laccase-discovery",
    family: "laccase",
    label: "Discovery",
    title: "Laccase discovery cycle",
    question: {
      body: (
        <p>
          Are there already enzymes in the literature that have shown activity
          on our model compound, and how can we find similar enzymes (homologs)?
        </p>
      ),
    },
    design: {
      body: (
        <>
          <p>
            Before diving into the search for potential candidates, we had to
            find a starting point. We needed to find a compound that represents
            the complex 3-dimensional structure of an epoxy resin used in the
            wind industry (our model substrate), and an enzyme that had
            previously shown activity on that compound.
          </p>
          <p>
            N,N-bis(2-hydroxypropyl)-p-toluidine (NNBT) is a precursor used in
            aviation and wind turbine-grade epoxy resins (specifically the RTM6
            scaffold), and several studies exist that show enzymatic degradation
            of this compound. This compound has a tertiary amine bond, which
            forms the crosslinks in cured epoxy resins, making them even harder
            to degrade <Cite id="Dolz2022" /> <Cite id="Wongwattanarat2025" />.
            More specifically, the laccase ItL03, derived from the European
            spruce bark beetle metagenome, and CueO from <i>E. coli</i> (in the
            iGEM Registry as BioBrick{" "}
            <Todo>BioBrick number missing in the source document</Todo>) showed
            significant degradation of NNBT, and the rate of degradation was
            enhanced by the addition of a mediator (a small molecule that acts
            as an oxidizing intermediate between the laccase and the substrate,
            see &quot;More about laccases&quot; in the introduction){" "}
            <Cite id="Wongwattanarat2025" />.
          </p>
          <p>
            Moreover, the breaking of the tertiary amine bond in NNBT releases
            lactaldehyde, which can be detected by a colorimetric assay using
            Purpald (4-amino-3-hydrazino-5-mercapto-1,2,4-triazole, or AHMT).
            This high-throughput assay was developed for unspecific
            peroxygenases (UPOs), but we decided to try it on laccases{" "}
            <Cite id="Dolz2022" />.
          </p>
          <p>
            As a first engineering cycle, we selected ItL03, the best-performing
            enzyme from the literature, and CueO as starting points for our
            sequence-based discovery. When analyzing the sequences, we observed
            that ItL03 and CueO share the same two Pfam accession numbers. Pfam
            is a large collection of protein domain families, and we wanted to
            mine the sequence space for enzymes with the same two Pfams. We got
            a pool of around 1,500 sequences, which we then filtered based on
            clustering results and enzyme-substrate prediction models to pick
            four candidates. This database discovery process is described in
            detail on the <Link to="/model-discovery">Model: Discovery</Link>{" "}
            page.
          </p>
          <p className="eng-lead-in">Our objectives were:</p>
          <ul>
            <li>
              To know whether we could repeat the findings from the literature
            </li>
            <li>
              To validate our assay system, and specifically, to verify if the
              Purpald assay, which was designed for UPOs, could work for
              laccases to give us a high-throughput assay we could use during
              further steps
            </li>
            <li>
              To see whether our four homologs showed activity on NNBT and could
              potentially outcompete the reference (ItL03)
            </li>
            <li>
              To characterize the products of the enzymatic reaction of laccases
              on NNBT using MALDI-TOF (Matrix-Assisted Laser
              Desorption/Ionization Time-of-Flight Mass Spectrometry)
            </li>
          </ul>
        </>
      ),
    },
    build: {
      body: (
        <p>
          The four shortlisted sequences were synthesised as plasmid constructs
          (IDT) and expressed in <i>E. coli</i> using the same backbone and tag
          configuration as Cycle 1{" "}
          <Todo>
            &quot;Cycle 1&quot; is this cycle — check against the source
            document
          </Todo>
          , so that activity could be compared directly against ItL03 and CueO
          without a construct-level confound.
        </p>
      ),
      pending:
        "Being rewritten in more detail. Still to add: a table of the BioBricks used, and a note on the missing His-tag.",
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
            This colorimetric assay is a standard procedure to determine
            oxidative enzymatic activity{" "}
            <a
              className="cite"
              href="https://doi.org/10.1016/bs.mie.2023.09.006"
              target="_blank"
              rel="noreferrer"
            >
              [doi:10.1016/bs.mie.2023.09.006]
            </a>
            . In this assay,
            2,2&apos;-azino-bis(3-ethylbenzothiazoline-6-sulfonic acid) (ABTS),
            a colourless compound, is oxidized to form a blue-greenish radical
            that absorbs at 420 nm. The measurement is continuous over 30
            minutes, and we used it to determine how much general oxidative
            activity our enzymes had.
          </p>

          <h4 className="eng-assay">Purpald assay</h4>
          <p>
            The main question we had for this assay was: does this UPO assay
            work for laccases? This high-throughput colorimetric assay was
            designed to analyze which UPO could best degrade the tertiary amine
            bond of NNBT <Cite id="Dolz2022" />. The reaction analyzed by this
            assay is the formation of lactaldehyde by N-dealkylation of NNBT.
            The lactaldehyde then reacts with Purpald to form a purple compound
            that absorbs at 530 nm.
          </p>

          <h4 className="eng-assay">MALDI-TOF</h4>
          <p>
            Matrix-Assisted Laser Desorption/Ionization Time-of-Flight
            (MALDI-TOF) is a mass spectrometry technique used to analyze what
            compounds are in a liquid sample. We used it to answer the question:
            what exactly are the products of the enzymatic reaction we are
            analyzing?
          </p>

          <p>
            The exact protocols are on our{" "}
            <Link to="/measurement">Measurement</Link> page.
          </p>
        </>
      ),
    },
    learn: {
      body: (
        <>
          <p>
            This cycle taught us several things (detailed results are shown on
            our <Link to="/results">Results</Link> page).
          </p>
          <p className="eng-lead-in">The main findings were:</p>
          <ul>
            <li>The Purpald assay works on laccases.</li>
            <li>
              Even though we did not obtain pure homolog samples (missing
              His-tag), the unbound samples still show activity on both ABTS and
              NNBT, with Bre showing the strongest results.
            </li>
            <li>
              MALDI-TOF shows us that the reaction products are messy
              (polymerization can happen at high enzyme activity), but the
              method isn&apos;t sensitive enough to detect products as small as
              lactaldehyde.
            </li>
          </ul>
          <p className="eng-lead-in">
            Based on these results, the next steps would be to:
          </p>
          <ul>
            <li>
              Assemble and express the homologs again, this time with the
              His-tag, and determine:
              <ul>
                <li>whether all four express properly,</li>
                <li>
                  the normalized activity values on ABTS and the model
                  substrate,
                </li>
                <li>
                  whether one enzyme can reach the activity level of ItL03.
                </li>
              </ul>
            </li>
            <li>
              Run other, more quantitative mass spectrometry analyses on the
              reaction products (LC-MS, …) to see if lactaldehyde can be
              produced in a detectable amount.
            </li>
            <li>
              Add cofactors (copper, …) to the reaction mix to prevent
              polymerization.
            </li>
          </ul>
        </>
      ),
    },
  },
  {
    id: "laccase-engineering",
    family: "laccase",
    label: "Engineering",
    title: "Laccase engineering cycle",
    question: { pending: "Question to be written." },
    design: { pending: "To be written." },
    build: { pending: "To be written." },
    test: { pending: "To be written." },
    learn: { pending: "To be written." },
  },
  {
    id: "upo-discovery",
    family: "upo",
    label: "Discovery",
    title: "UPO discovery cycle",
    question: { pending: "Question to be written." },
    design: { pending: "To be written." },
    build: { pending: "To be written." },
    test: { pending: "To be written." },
    learn: { pending: "To be written." },
  },
  {
    id: "upo-engineering",
    family: "upo",
    label: "Engineering",
    title: "UPO engineering cycle",
    question: { pending: "Question to be written." },
    design: { pending: "To be written." },
    build: { pending: "To be written." },
    test: { pending: "To be written." },
    learn: { pending: "To be written." },
  },
];

/* -------------------------------------------------------------------------- *
 *  Future steps — the paragraph that closes the page.
 * -------------------------------------------------------------------------- */

export const FUTURE_STEPS: Stage = {
  pending: "Future steps to be written.",
};

/* -------------------------------------------------------------------------- *
 *  References
 *
 *  Exactly the works the page cites. REFERENCES holds those cited with
 *  <Cite id="…" /> (../dry-lab/Cite, keys from contents/dry-lab/bibliography.ts);
 *  DESCRIPTION_REFERENCES_CITED those cited with <DescCite>. The page merges
 *  both into one alphabetical list.
 * -------------------------------------------------------------------------- */

export const REFERENCES: readonly CitationKey[] = [
  "Dolz2022",
  "Wongwattanarat2025",
];

/** Works cited with <DescCite> (the boxes moved from the Project Description
 *  page), from that page's list in descriptionReferences.ts. Shown in one
 *  list with REFERENCES, sorted together. */
export const DESCRIPTION_REFERENCES_CITED: readonly DescriptionCitationKey[] = [
  "Ali2019",
  "Bizente",
  "Monterrey2023",
  "Shah2023",
];
