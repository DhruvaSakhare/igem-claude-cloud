import { useEffect } from "react";

import { MODEL_PAGES, ModelPager } from "./ModelNav";
import { FigNum, NumberedFigures, TabNum } from "./FigureNumbers";
import TOC from "../../components/TOC";
import { TextBox } from "../../components/TextBox";
import { StructureViewer } from "../../components/StructureViewer";
import type { Alignment } from "../../components/StructureViewer";
import {
  DESIGN_STRUCTURES,
  ENGINEERING_STRUCTURES,
  ENGINEERING_TEAM_STRUCTURES,
} from "./structures";
import { PageTitle, SectionHeading, SubsectionHeading } from "./SectionHeading";
import { MdFigureBlock } from "./MdFigures";
import { TunnelFigure, FigureRow, WikiFigure } from "./ChannelFigures";
import { Cite, referenceNodes } from "./Cite";
import type { CitationKey } from "./bibliography";
import { LACCASE_RATIONAL_CITATIONS } from "./citations";
import { DetailsBox } from "./DetailsBox";
import { MvizMoreInline } from "./MvizMoreInline";
import {
  MethodBlock,
  ModelPipeline,
  MvizInfo,
  RationalDesignStage,
  StabilityMutagenesisStage,
} from "./model_methods";
import type { PipelineStep } from "./model_methods";
import ReferenceBar from "../../components/ReferenceBar";
import PartsTable from "../../components/PartsTable";
import "./model_engineering.css";
import "./tracks.css";

/* Structure files are served from iGEM's asset host, not from public/. The
 * tabs in the RFdiffusion subsection are ENGINEERING_STRUCTURES in structures.ts
 * (the designed backbones, DESIGN_STRUCTURES, plus the 9HE9 reference) — each
 * entry becomes a tab and names its own files, so the
 * overlays are always tied to the chosen structure. A single enzyme (+ HEME) is
 * ~250 KB of JSON, so add a design as a TAB on the existing viewer rather than
 * as a second viewer. */

/** Where each design's MD plots are uploaded.
 *
 *  THE SLUG IS NOT THE STRUCTURE ID for these two, which is why this map has to
 *  exist. Everywhere else on the site a structure's plots sit under the same
 *  name as its 3D files, and the row is written `slug={s.id}` (see MdFigures).
 *  Here the 3D files were uploaded under the full RFdiffusion run name
 *  (`rfd3-partial-input-partial-rfd3-4-model-9-2-model-0`) and the plots under
 *  the short one (`rfd3-4-model-9-2-model-0`), so neither can be derived from
 *  the other and the pairing is written out.
 *
 *  Do NOT derive this from `code` in structures.ts even though the two happen
 *  to agree today: `code` is the tab chip, a display string someone may shorten
 *  further, and the plots would 404 silently when they did.
 *
 *  A design with no entry here simply gets no plots — see the filter at the
 *  call site. Add one only once all three plots answer 200 for it; a missing
 *  plot 403s and paints a broken image (MdFigures.tsx says the same).
 */
const DESIGN_MD_SLUGS: Record<string, string> = {
  "rfd3-partial-input-partial-rfd3-4-model-9-2-model-0":
    "rfd3-4-model-9-2-model-0",
  "rfd3-partial-input-partial-rfd3-0-model-0-9-model-0":
    "rfd3-0-model-0-9-model-0",
};

/** The superpositions offered on the RFdiffusion viewer: each design fitted
 *  onto the PabUPO-II reference, one pair at a time.
 *
 *  Reference held still in both, so the two comparisons are made in the same
 *  frame and can be flipped between without the camera meaning something
 *  different each time.
 *
 *  The fit runs on the heme, which all three structures carry with identical
 *  atom names — see superpose.ts for why the cofactor and not the backbone,
 *  and for what the reported RMSD does and does not mean. Ids here must match
 *  ENGINEERING_STRUCTURES in structures.ts; the designs' ids are their upload
 *  names, so a re-upload under a different name breaks this list and the
 *  alignment silently disappears from the menu. */
const UPO_ALIGNMENTS: Alignment[] = [
  {
    id: "pab-d1",
    label: "PabUPO-II + Design 1",
    refId: "9he9",
    mobileId: "rfd3-partial-input-partial-rfd3-4-model-9-2-model-0",
  },
  {
    id: "pab-d2",
    label: "PabUPO-II + Design 2",
    refId: "9he9",
    mobileId: "rfd3-partial-input-partial-rfd3-0-model-0-9-model-0",
  },
];

/* ========================================================================== *
 *  Model → Engineering  (route /model-engineering)
 *
 *  Enzyme-engineering results. No real results yet — this page is a scaffold of
 *  clearly-marked placeholders mirroring the results layout, to be filled once
 *  the team has designed and evaluated variants. Do NOT fabricate results.
 *
 *  Styling lives in model_engineering.css (.me-*). Navigation between the four
 *  model pages is handled by the TOC (see MODEL_PAGES in ModelNav.tsx).
 * ========================================================================== */

/** The laccase rational-design method, as the flowchart in that section and
 *  the two cards in the box under it (each card is titled from here). The
 *  blurbs only summarise what the box says about each step. */
const LACCASE_RATIONAL_WORKFLOW: PipelineStep[] = [
  {
    title: "Rational design",
    tag: "Literature-guided",
    blurb:
      "Transfer modifications reported for CueO to Itl-03, after confirming by BLAST that the two are more than 60% identical.",
  },
  {
    title: "MutateX",
    tag: "Stability check",
    blurb:
      "Predict the stability change (ΔΔG) of the chosen mutations and the positions around them before building them.",
  },
];

/** Table S of the team's document: identity to CueO of Itl-03 and the CUPP
 *  laccase candidates, from BLAST. */
const CUEO_IDENTITY: { id: string; identity: string }[] = [
  { id: "A0A517I632", identity: "25.85%" },
  { id: "A0AAJ2KTQ9", identity: "24.85%" },
  { id: "A0A1H2RLL0", identity: "27.29%" },
  { id: "A0A4R3UXC8", identity: "26.85%" },
  { id: "A0A7T1FRB0", identity: "25.23%" },
  { id: "Itl-03", identity: "63.53%" },
];

/** Everything the References section lists: exactly what this page cites.
 *  The laccase rational-design section's list, plus BarrosReguera2025, cited
 *  in the UPO rational-design prose. De-duplicated and sorted by key. */
const ENGINEERING_REFERENCES: readonly CitationKey[] = [
  ...new Set<CitationKey>([...LACCASE_RATIONAL_CITATIONS, "BarrosReguera2025"]),
].sort();

/**
 * ModelEngineering — the Engineering detail page. Placeholder results only.
 */
export function ModelEngineering() {
  // Constant light-blue page background across the Model section (removed on
  // unmount). Rule lives in model.css but Vite emits one global CSS bundle.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="engineering" />

        <PageTitle title="Engineering" />

        <div className="page-start row mt-4">
          <NumberedFigures className="col-lg-12">
            {/* --- Results, laccase branch ---
                Split per enzyme family, and within each family by design route:
                laccases first (rational design only — the laccase generative
                design section was removed), then UPOs, rational before
                generative. One <section id> apiece, so each gets its own TOC
                entry — the same shape as the Discovery page and the
                engineering split on Methods.

                THE `results` ID DOES NOT MATCH ITS TITLE ("UPOs rational
                design"). It was named when the split was by family alone and
                is kept so that any link already pointing at it still
                resolves. The other sections are named after their headings.

                The four result slots under a heading are generic placeholders
                (designed variants / predicted activity / stability / shortlist)
                that each track will need, not family-specific ones. */}
            <section id="laccases-rational-design" className="track-laccase">
              <SectionHeading title="Laccases rational design" />
              {/* Transcribed from the team's "Engineering section: Rational
                  design" document. Laid out like the Discovery page: the
                  introduction, then the method as a flowchart and a
                  collapsible box of method cards (the CUPP and channel
                  arrangement), then the reasoning and the MutateX results. */}
              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  We have found laccases that degrade NNBT either directly or
                  through a mediator, specifically CueO and Itl-03{" "}
                  <Cite id="Wongwattanarat2025" />. Our goal was to increase
                  activity through engineering of these enzymes in order to
                  increase activity and practicality of these enzymes. Two main
                  strategies could be followed: increased activity towards NNBT
                  and, consequently, towards the epoxy mash; or towards the
                  mediator. The latter was chosen as we imagine that mechanism is
                  more applicable to the final epoxy resin net because the
                  mediator, being smaller molecules, are more likely to penetrate
                  into the surface of the resin.
                </p>
              </TextBox>

              <ModelPipeline steps={LACCASE_RATIONAL_WORKFLOW} />
              <DetailsBox label="More details on the rational design methods">
                <MvizMoreInline value={true}>
                  <MethodBlock
                    id="laccase-method-rational-design"
                    step={LACCASE_RATIONAL_WORKFLOW[0]}
                  >
                    <div className="mviz">
                      <RationalDesignStage />
                      <MvizInfo title={LACCASE_RATIONAL_WORKFLOW[0].title}>
                        We used a rational design approach to select viable
                        modifications on Itl-03 and CueO aiming to increase
                        activity on a mediator. CueO and Itl-03 were blasted
                        against each other to confirm similarity higher than 60%
                        so we could be more certain that we could transfer
                        modifications on CueO described in the literature to
                        Itl-03. We analyzed some of these mutations using
                        MutateX <Cite id="Tiberti2022" /> to assess stability
                        through prediction of free energy change upon mutation
                        (ΔΔG).
                      </MvizInfo>
                    </div>
                  </MethodBlock>
                  <MethodBlock
                    id="laccase-method-mutatex"
                    step={LACCASE_RATIONAL_WORKFLOW[1]}
                  >
                    <div className="mviz">
                      <StabilityMutagenesisStage />
                      <MvizInfo
                        title={LACCASE_RATIONAL_WORKFLOW[1].title}
                        more={
                          <p>
                            We used MutateX on the sites we intended to mutate
                            based on the rational design and all the 5 positions
                            upstream and downstream from the target mutation
                            sites. We used this to validate stability of
                            mutations in the regions we intended to mutate.
                          </p>
                        }
                      >
                        MutateX is an automation software that uses FoldX
                        energy function to predict free energy change upon
                        mutation (ΔΔG) to all other possible amino acids in a
                        specific sequence position <Cite id="Tiberti2022" />.
                        FoldX uses empirical free energy functions to predict
                        the difference between reference wild type and
                        estimated free energy of folding of proposed variants{" "}
                        <Cite id="Tiberti2022" />.
                      </MvizInfo>
                    </div>
                  </MethodBlock>
                </MvizMoreInline>
              </DetailsBox>

              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  Itl-03 has not been thoroughly studied to our knowledge, so we
                  hypothesized that engineering strategies applied to CueO could
                  be translated to Itl-03 if their sequences were significantly
                  related (more than 60% identical, see Table{" "}
                  <TabNum of="laccase-cueo-identity" />). Blasting Itl-03 against
                  CueO confirmed they were ~63% identical. With that out of the
                  way, we began our literature search on modifications to CueO
                  that increase activity towards a mediator.
                </p>
              </TextBox>

              <PartsTable
                data={CUEO_IDENTITY}
                columns={[
                  { field: "id", header: "UniProt ID", rowHeader: true },
                  { field: "identity", header: "Percent Identity to CueO (P36649)" },
                ]}
                numberId="laccase-cueo-identity"
                caption={
                  <>
                    Percent identity of Itl-03 and candidates from CUPP pipeline
                    against CueO using BLAST <Cite id="Sayers2024" />.
                  </>
                }
              />

              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  CueO has 4 copper ions that we are interested in, a T1 in the
                  active site, a T2 and 2 T3 in the interior responsible for the
                  reducing end of the reaction with O<sub>2</sub> as an electron
                  acceptor <Cite id="Grass2004" /> <Cite id="Djoko2010" />. We
                  verified that Itl-03 also has the same Cu ions at analogous
                  locations by visually inspecting AlphaFold outputs in PyMOL.
                </p>
                <p style={{ color: "#123a52" }}>
                  CueO specificity is modulated by a methionine rich region
                  (Pro357–His406). This region contains an alpha-helix positioned
                  in front of the active site. A truncated version of CueO has
                  this portion removed, decreasing specificity and increasing
                  activity on mediator ABTS by 10 to 30 fold{" "}
                  <Cite id="Kataoka2007" />. Itl-03 also has a similar alpha
                  helix in the same region, so we hypothesize that this same
                  truncation can be translated into Itl-03, except that it should
                  be done on amino acids 538 to 422.
                </p>
                <p style={{ color: "#123a52" }}>
                  A few mutations are also known to change the redox environment
                  around the T1 Cu in CueO <Cite id="Kataoka2013" />. D439A and
                  H510L, when combined, are shown to increase CueO activity on
                  ABTS by 140 fold <Cite id="Kataoka2013" />. These same mutated
                  residues are conserved in Itl-03. Before mutating them directly
                  on Itl-03 though, we assessed the stability effects of
                  mutations on these important residues using MutateX{" "}
                  <Cite id="Tiberti2022" />. We used that to estimate whether
                  mutations in that region could be too detrimental to the
                  enzyme.
                </p>
                <p style={{ color: "#123a52" }}>
                  With that in mind, we designed 6 constructs to test:
                </p>
                <ul className="me-constructs">
                  <li>
                    CueO truncated (already expressed in the literature, but not
                    tested on NNBT)
                  </li>
                  <li>
                    CueO double mutant (already expressed in the literature, but
                    not tested on NNBT)
                  </li>
                  <li>CueO double mutant truncated</li>
                  <li>Itl-03 truncated</li>
                  <li>Itl-03 double mutant</li>
                  <li>Itl-03 double mutant truncated</li>
                </ul>
              </TextBox>

              {/* --- subsection: MutateX ----------------------------------- */}
              <div
                id="laccase-mutatex"
                className="dsub"
                data-toc-title="MutateX"
              >
                <SubsectionHeading title="MutateX" />
                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    As described in the rational engineering section, some
                    mutations are found to increase CueO activity on the reaction
                    mediator ABTS <Cite id="Kataoka2013" />. Two of these
                    mutations, D439A and M510L, when in combination, yielded 140
                    fold increase in activity <Cite id="Kataoka2013" />.
                  </p>
                  <p style={{ color: "#123a52" }}>
                    Before directly inserting them into Itl-03 as described in
                    that same section, we wanted to verify that these mutations
                    would not impact stability too negatively. Thus, we used
                    MutateX to verify that the regions we wanted to mutate were
                    stable when mutated to the amino acids we were interested in.
                  </p>
                  <p style={{ color: "#123a52" }}>
                    Beyond just Itl-03, CueO, and their respective truncated
                    versions, we also analyzed our CUPP candidate Laccases to
                    check if they could also benefit from these mutations even
                    though all of them had lower similarity to CueO than Itl-03
                    (all around 26% identical, details in Table{" "}
                    <TabNum of="laccase-cueo-identity" />).
                  </p>
                  <p style={{ color: "#123a52" }}>
                    Upon visually inspecting these CUPP candidates on PyMOL, we
                    verified that all conserved a M510 equivalent site, and most
                    of them conserved a polar amino acid at the equivalent
                    position of D439. Therefore, we selected a buffer zone to
                    generate MutateX saturation data on the residues around the
                    439 equivalent (+ and − 5 positions), as well as the 510
                    position equivalent. Results are listed below:
                  </p>
                </TextBox>

                {/* Figure 1 on the left, Figures 2 and 3 stacked on the right
                    to the same height — see .wfig-mosaic. Document order is
                    still 1, 2, 3, so the numbering is unchanged. */}
                <div className="wfig-mosaic">
                  <WikiFigure
                    wide
                    fig="laccase-d439-alignment"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/laccase-engineering/benchlingmutatex.avif"
                    alt="Sequence alignment around the D439-equivalent position across the laccase candidates, made in Benchling."
                  >
                    D439 equivalent position alignment made on Benchling.
                  </WikiFigure>
                  <div className="wfig-mosaic-stack">
                    <WikiFigure
                      wide
                      fig="laccase-mutatex-focus"
                      src="https://static.igem.wiki/teams/6060/wiki/drylab/laccase-engineering/mutatexspecificsites.avif"
                      alt="MutateX ΔΔG heatmap for the focus mutations across all laccase candidates."
                    >
                      MutateX ΔΔG results for focus mutations for all candidates.
                      Red indicates increase in ΔΔG while blue indicates a
                      decrease. Mutation site equivalence was determined by visual
                      inspection on PyMOL and the alignment on Figure{" "}
                      <FigNum of="laccase-d439-alignment" />.
                    </WikiFigure>
                    <WikiFigure
                      wide
                      fig="laccase-mutatex-all"
                      src="https://static.igem.wiki/teams/6060/wiki/drylab/laccase-engineering/mutatex-all-possible-aa.avif"
                      alt="MutateX ΔΔG heatmap for every possible substitution at the sites of interest in Itl-03 and CueO."
                    >
                      MutateX ΔΔG results for all possible mutations in the
                      specific sites we are interested in for Itl-03 and CueO.
                      These results were used to understand how generally stable
                      are the mutations in these regions. Red indicates increase in
                      ΔΔG while blue indicates a decrease.
                    </WikiFigure>
                  </div>
                </div>

                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    Based on the MutateX analysis, the D439A and its analogous
                    mutations show increased ΔΔG across all laccase candidates
                    (see Figures <FigNum of="laccase-d439-alignment" /> and{" "}
                    <FigNum of="laccase-mutatex-focus" />). Itl-03 and its
                    respective truncated version show higher ΔΔG respective to
                    its homolog CueO, indicating that that region is less stable
                    in Itl-03 (see Figure <FigNum of="laccase-mutatex-all" />).
                  </p>
                  <p style={{ color: "#123a52" }}>
                    The M510 analogous site, on the other hand, shows decreasing
                    ΔΔG when mutated to M510L across CueO, Itl-03 and their
                    truncated versions. We decided to proceed with testing the
                    combination of these mutations with and without the
                    truncation as the mutated versions of CueO have been
                    expressed and tested before <Cite id="Kataoka2013" />.
                  </p>
                </TextBox>
              </div>
            </section>

            {/* --- Results, UPO branch: the rational route --- */}
            <section id="results" className="mt-5 track-upo">
              <SectionHeading title="UPOs rational design" />
              {/* The rational-design variants (Zillo, Wampa, Taun-taun):
                  predicted models with a heme cofactor. A plain title — it
                  labels the viewer, it is not a TOC subsection. */}
              <SubsectionHeading
                plain
                title="Structure Viewer for solvent stable UPOs"
              />
              <StructureViewer structures={ENGINEERING_TEAM_STRUCTURES} />
            </section>

            {/* --- Results, UPO branch: the generative route ---
                The RFdiffusion → LigandMPNN → RoseTTAFold pipeline and the
                backbones it produced, split off from the section above so the
                two UPO routes are siblings the way the two laccase routes are.
                What moved here is exactly the pipeline: the hand-designed
                variants, their viewer and their MD row stay under rational
                design, because that is where they came from. */}
            <section id="upos-generative-design" className="mt-5 track-upo">
              <SectionHeading title="UPOs generative design" />

              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  In the UPO discovery section, we showed that a window at the
                  channel entrance of UPOs is the region that best separates
                  known reference UPOs from one another. We also found a
                  pattern linking the channel opening radius to NNBT
                  degradation activity. These observations guided our
                  generative engineering campaign for UPOs: if any region of
                  the channel were to be redesigned, it would most likely be
                  part of the entrance window.
                </p>
                <p style={{ color: "#123a52" }}>
                  Furthermore, PaDa-I has already been highly optimized through
                  a round of directed evolution: its channel exhibits a cone
                  shape very close to the ideal, based on relevant literature{" "}
                  <Cite id="BarrosReguera2025" />. Other UPOs, such as MroUPO
                  and GroGu, lack this near-ideal cone shape but still have a
                  sufficient channel opening to accommodate NNBT, which is
                  reflected in their high degradation rates (8% and 9%,
                  respectively). This left us with little choice but to focus
                  our design efforts on the UPO with the most room for
                  improvement: PabUPO-II.
                </p>
              </TextBox>
              <div
                id="rfd-ligandmpnn-rosettafold"
                className="dsub"
                data-toc-title="RFdiffusion, LigandMPNN, and RoseTTAFold"
              >
                <SubsectionHeading title="RFdiffusion, LigandMPNN, and RoseTTAFold" />

                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    By visualizing the pocket and channel of PabUPO-II in PyMOL,
                    we were able to identify which regions could theoretically be
                    shifted to widen the channel entrance. To illustrate this
                    more clearly, we present the following figures.
                  </p>
                </TextBox>

                {/* PLACEHOLDER — replace with the real PyMOL figure(s) once
                    uploaded: the pocket and channel of PabUPO-II, with the
                    intruding alpha helix (residues 319–336) highlighted, showing
                    how it bends the channel and compresses the pocket. */}
                <div
                  style={{
                    border: "2px dashed #b8c6d0",
                    borderRadius: "0.6rem",
                    padding: "2.5rem 1.5rem",
                    margin: "2rem 0",
                    textAlign: "center",
                    color: "#6b7c88",
                    background: "#f7fbfe",
                  }}
                >
                  Figure placeholder: PabUPO-II pocket and channel in PyMOL,
                  with the intruding alpha helix highlighted.
                </div>

                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    We observe that an alpha helix at the channel entrance
                    intrudes into and shifts the route of both the pocket and the
                    channel: the channel appears to bend, and the pocket appears
                    to be compressed. This suggests that repositioning this alpha
                    helix could create a more accessible channel.
                  </p>
                  <p style={{ color: "#123a52" }}>
                    This alpha helix is composed of residues 319–336. However, we
                    extended this range to residues 312–348 to additionally
                    include the closest loop on each side. This extended range is
                    set to be diffused and redesigned in our RFdiffusion
                    pipeline. Following the same reasoning as above, we
                    additionally included residues 86–107 in our flexible
                    residues list. These residues also form an alpha helix that
                    surrounds the channel.
                  </p>
                </TextBox>
              </div>

              <div
                id="channel-discovery-generative"
                className="dsub"
                data-toc-title="Channel discovery"
              >
                <SubsectionHeading title="Channel discovery" />

                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    After our generative design pipeline was completed, 352
                    designs (final RoseTTAFold predictions) survived the quality
                    thresholds. We then fed these 352 structures into our channel
                    discovery pipeline. Figure <FigNum of="gen-design-overlay" />{" "}
                    shows the channel overlay of the 352 designed channels,
                    alongside the seven reference UPOs presented in the discovery
                    section (PaDa-I, GroGu, MroUPO, PabUPO-II, Fett, Hypoxylon sp. UPO, MweUPO-1). The
                    corresponding dendrogram generated from this overlay is shown
                    in Figure <FigNum of="gen-design-dendrogram" />.
                  </p>
                  <p style={{ color: "#123a52" }}>
                    For this dendrogram, we did not use the default number of
                    clusters, <em>max(2, n_structures // 3)</em>; instead, we
                    forced the number of clusters to 10 for better visualization,
                    both in the dendrogram itself and in the cluster overlay plot
                    that follows. For the same reason, we removed the design ID
                    labels entirely; instead, the cluster overlay plots only the
                    seven reference structures alongside the two designs we
                    ultimately selected to move forward with (further details on
                    this selection follow below).
                  </p>
                </TextBox>

                {/* matchHeights: the dendrogram is much taller than the
                    overlay — without it the pair would come out at very
                    different heights, the same reasoning as the equivalent
                    Discovery-page row. */}
                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="gen-design-overlay"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery/9he9-rfdiffusion3-comparison/best-tunnel-overlay-uncolored.avif"
                    alt="Overlay of the channel profiles of the 352 generative-design candidates alongside the seven reference UPOs."
                  >
                    Channel overlay of the 352 designed channels and the seven
                    reference UPOs.
                  </WikiFigure>
                  <WikiFigure
                    fig="gen-design-dendrogram"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery/9he9-rfdiffusion3-comparison/best-tunnel-dendrogram.avif"
                    alt="Dendrogram from clustering the channel overlay of the 352 generative-design candidates, forced to 10 clusters."
                  >
                    Dendrogram from clustering the channel overlay, forced to
                    10 clusters.
                  </WikiFigure>
                </FigureRow>

                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    In the dendrogram, we observe two clearly distinct, widely
                    separated clusters. By extracting all clusters and examining
                    the corresponding cluster overlay plots (Figures{" "}
                    <FigNum of="gen-cluster-overlays" /> and{" "}
                    <FigNum of="gen-cluster-means" />), we identify two broad
                    categories of designs: those with a squeezed channel
                    (undesirable), and those with a channel equal to or wider
                    than the original PabUPO-II channel (desirable). We also
                    observe a substantial number of designs sharing a cluster
                    with reference UPOs of known activity other than PabUPO-II
                    itself, which served as the design template (e.g., GroGu,
                    MroUPO).
                  </p>
                  <p style={{ color: "#123a52" }}>
                    At first glance, we observe many candidates that achieved our
                    goal of a wider channel. However, we did not simply select
                    from these at random; instead, we manually iterated through
                    candidates from clusters 3 and 4, aligning each structure
                    with wild-type PabUPO-II until we observed a biologically
                    meaningful change (for example, a small drift or displacement
                    in an alpha helix). Again, a substantial number of candidates
                    met these criteria. However, given the practical upper limit
                    set by the wetlab group, we moved forward with two
                    candidates for further in vitro validation. The two final
                    candidates chosen were{" "}
                    <em>rfd3-4-model-9-2-model-0</em> (hereafter referred to as
                    design 1) and <em>rfd3-0-model-0-9-model-0</em> (hereafter
                    referred to as design 2). The justification for the
                    structural choices is presented in the structure viewer
                    below.
                  </p>
                </TextBox>

                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="gen-cluster-overlays"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery/9he9-rfdiffusion3-comparison/best-tunnel-cluster-overlays.avif"
                    alt="Grid of per-cluster channel profile overlays for the 352 generative-design candidates, showing the member profiles alone."
                  >
                    Grid of per-cluster channel overlays for the
                    generative-design candidates, without showing the mean ±
                    standard deviation for each cluster.
                  </WikiFigure>
                  <WikiFigure
                    fig="gen-cluster-means"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery/9he9-rfdiffusion3-comparison/best-tunnel-cluster-means.avif"
                    alt="Grid of per-cluster channel profile overlays for the 352 generative-design candidates, each panel showing the cluster mean with a shaded standard-deviation band."
                  >
                    Grid of per-cluster channel overlays for the
                    generative-design candidates, showing the mean ± standard
                    deviation for each cluster.
                  </WikiFigure>
                </FigureRow>

                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    Figure <FigNum of="gen-selected-overlay" /> shows the overlay
                    of the channels, including wild-type PabUPO-II, and more
                    clearly reveals where the two designs differ: both exhibit a
                    wider entrance and a slightly narrower base. This strongly
                    supports the channel-geometry–activity relationship we have
                    proposed throughout this work. We also observe that one
                    design has a wider entrance than the other, which raises the
                    question of why we did not identify a similarly wide design
                    among the alternatives.
                  </p>
                  <p style={{ color: "#123a52" }}>
                    Up to this point, we have not yet considered structural
                    stability, since we have primarily worked with natural
                    enzymes. It is worth examining what stability implications
                    arise in these two specific cases, given the established
                    connection between cavity/void formation and protein
                    stability. This is explored in more detail in the following
                    section.
                  </p>
                  <p style={{ color: "#123a52" }}>
                    Additionally, we used the equation derived from the four
                    reference UPOs with known activity values (see UPO
                    literature-based discovery) and mapped the channel opening of
                    our 2 designs onto that curve. Results are shown in Figure{" "}
                    <FigNum of="gen-selected-curve" />.
                  </p>
                </TextBox>

                <FigureRow cols={2} matchHeights>
                  <WikiFigure
                    fig="gen-selected-overlay"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery/9he9-rfdiffusion3-comparison/reference-overlay-selected.avif"
                    alt="Channel radius profiles of the two selected designs overlaid with wild-type PabUPO-II."
                  >
                    Overlay of the channel profiles for the two selected
                    designs, alongside wild-type PabUPO-II. The known
                    discrimination window is shaded.
                  </WikiFigure>
                  <WikiFigure
                    fig="gen-selected-curve"
                    src="https://static.igem.wiki/teams/6060/wiki/drylab/channel-discovery/9he9-rfdiffusion3-comparison/degradation-vs-channel-opening-curve-fit-with-engineered.avif"
                    alt="NNBT degradation rate against channel opening: the four reference UPOs as red points and the two selected designs as blue points placed on the dashed quadratic curve fitted to the references."
                  >
                    Predicted NNBT degradation activity of the two selected
                    designs, estimated by mapping their channel opening onto
                    the fitted curve.
                  </WikiFigure>
                </FigureRow>

                {/* The designs' raw channel profiles, the same figure and the
                    same explanatory paragraph the Discovery page uses for its
                    own nine candidates (see the equivalent block there): unlike
                    the normalized overlays above, these are not comparable to
                    one another and only say something about each channel's own
                    length.

                    Used to sit after the structure viewer below, paired with it
                    because the viewer can draw the same channel; moved up here,
                    right after the normalized overlay/curve pair, so it reads
                    with the explanatory paragraph rather than sitting
                    unexplained.

                    The slugs come from DESIGN_MD_SLUGS, NOT from `s.id`, for the
                    reason given there: the plots are uploaded under the short
                    run name and the 3D files under the full one. Both of these
                    were checked against the asset host. */}
                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    The following plots show the raw, pre-normalized 2D channel
                    profiles for the two selected designs. Note that, unlike the
                    channels shown in previous plots, <strong>these are not
                    directly comparable to one another</strong>; instead, they
                    provide information on the length of each channel.
                  </p>
                </TextBox>
                <div className="chf-row">
                  {DESIGN_STRUCTURES.filter((s) => DESIGN_MD_SLUGS[s.id]).map(
                    (s) => (
                      <TunnelFigure
                        key={s.id}
                        // The RFdiffusion id, so the label matches the id the
                        // paragraph above cites this design by.
                        label={`${s.label} (${DESIGN_MD_SLUGS[s.id]})`}
                        slug={DESIGN_MD_SLUGS[s.id]}
                        caption={`Selected channel for ${s.label}`}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* The designed backbones, in the same viewer the Discovery page
                  uses for the curated and searched-for sets — same controls,
                  same overlays, a different tab list (see ENGINEERING_STRUCTURES
                  in structures.ts). No active site has been annotated on them,
                  so the viewer frames the whole fold and shows no residue
                  legend.

                  PLACED AFTER ALL THREE PIPELINE STAGES, not inside the
                  RFdiffusion subsection: what it shows is the output of the
                  pipeline as a whole (RFdiffusion → LigandMPNN → RoseTTAFold),
                  so a reader meets every stage before the structures they
                  produced. It is a sibling of the three stage blocks and
                  belongs to none of them.

                  Showing the backbones is NOT a result: it is the raw output of
                  this pipeline. Nothing here says a design is good, and the
                  prose above must stay a placeholder until there is real
                  filtering or evaluation to report.

                  Which upload each tab is used to be spelled out in a list
                  under here. It is on the tabs themselves now: each carries a
                  shortened upload name as its chip (`code` in structures.ts),
                  with the full name as the tab's tooltip.

                  The tab list is the designs PLUS PabUPO-II (9HE9) as a
                  reference to compare them against — see ENGINEERING_STRUCTURES
                  in structures.ts, and say in the prose above what the
                  comparison is for. */}
              <SubsectionHeading
                plain
                title="Structure Viewer for generative designed UPOs"
              />
              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  This is the structure viewer for the two designs, showing
                  their best NNBT docking pose, best pocket, and channel. The
                  flexible residues selected by our pipeline are shown in green
                  when PabUPO-II is loaded. There is also an option to align
                  the designs with wild-type PabUPO-II and inspect the
                  structural differences directly.
                </p>
                <p style={{ color: "#123a52" }}>
                  We observe that in design 1, the external alpha helix has
                  shifted toward the channel and, at the same time, contains
                  one fewer helical turn. This makes the helix shorter, with
                  the loop region beginning earlier than in the wild type.
                  Since loops are generally less stable secondary structure
                  elements than helices, we expect the channel in this region
                  to remain wider.
                </p>
                <p style={{ color: "#123a52" }}>
                  In design 2, the same alpha helix has also shifted, but in
                  the opposite direction relative to the channel. Rather than
                  moving toward the channel as in design 1, this displacement
                  moves the helix away from it, which directly widens the
                  channel at this position. Unlike design 1, where the effect
                  on channel width is an indirect consequence of a shortened,
                  less stable helix, design 2 achieves a similar outcome
                  through a more direct geometric mechanism.
                </p>
              </TextBox>
              <StructureViewer
                structures={ENGINEERING_STRUCTURES}
                alignments={UPO_ALIGNMENTS}
              />

              {/* --- subsection: molecular dynamics -------------------------
                  Built exactly like the MD row under UPOs rational design: the
                  same three plots per structure from the shared MdFigures
                  module, in the same order as the viewer's tabs above it.

                  These plots did not exist when this section was written — the
                  note here used to say the backbones had none and that the host
                  403d — and they do now, for both designs. PabUPO-II is a tab
                  on that viewer as the reference, not a design, and has no
                  plots under this path, so it gets no block.

                  The slugs come from DESIGN_MD_SLUGS at the top of this file,
                  NOT from `s.id`: see the note there for why these two cannot
                  be derived. The filter is what keeps a future design that has
                  no plots yet from rendering three broken images. */}
              <div
                id="md-generative"
                className="dsub"
                data-toc-title="Molecular dynamics"
              >
                <SubsectionHeading title="Molecular dynamics" />
                <TextBox className="model-prose">
                  <p style={{ color: "#123a52" }}>
                    {/* PLACEHOLDER — the plots are real; this write-up is not.
                        Do not read a conclusion out of the figures here. */}
                    Placeholder: state the MD engine and version, force field and
                    water model, box and ion setup, equilibration protocol,
                    production length and the number of replicates run for the
                    designed backbones.
                  </p>
                </TextBox>

                {/* Name and plots only — no note under the name yet. To say
                    what a design's three plots show, pass that as children of
                    the block. */}
                {DESIGN_STRUCTURES.filter((s) => DESIGN_MD_SLUGS[s.id]).map(
                  (s) => (
                    <MdFigureBlock
                      key={s.id}
                      // The RFdiffusion id, so the name matches the id the
                      // prose above cites this design by.
                      name={`${s.label} (${DESIGN_MD_SLUGS[s.id]})`}
                      slug={DESIGN_MD_SLUGS[s.id]}
                    />
                  ),
                )}
              </div>
            </section>

            {/* Discussion */}
            <section id="discussion" className="mt-5">
              <SectionHeading title="Discussion" />
              <TextBox className="model-prose">
                <p style={{ color: "#123a52" }}>
                  {/* PLACEHOLDER — replace with the real discussion. */}
                  Placeholder discussion text. Interpret the engineering results,
                  note the limitations, and connect them back to the wetlab /
                  project goals.
                </p>
              </TextBox>
            </section>

            {/* References */}
            <section id="references" className="mt-5">
              <SectionHeading title="References" />
              {/* Built from ENGINEERING_REFERENCES, which must list exactly what
                  this page's <Cite> tags cite — see that constant. */}
              <ReferenceBar
                references={referenceNodes(ENGINEERING_REFERENCES)}
                showTitle={false}
              />
            </section>

            {/* Bottom prev/next navigation (Discovery ← Engineering) */}
            <ModelPager active="engineering" />
          </NumberedFigures>
        </div>
      </div>
    </>
  );
}
