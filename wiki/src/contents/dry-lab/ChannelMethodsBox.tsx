import {
  CHANNEL_WORKFLOW,
  CaverViz,
  ChannelClusterViz,
  FpocketVizV2,
  MethodBlock,
  ModelPipeline,
} from "./model_methods";
import { MvizMoreInline } from "./MvizMoreInline";
import { DetailsBox } from "./DetailsBox";
import "./ChannelMethodsBox.css";

/* ========================================================================== *
 *  The UPO channel discovery METHOD, shown on the Discovery page
 *
 *  The Discovery page presents channel-discovery RESULTS twice — once for the
 *  literature structures and once for the database candidates — and each time
 *  used to end by sending the reader to the Methods page to find out how those
 *  results were produced. This module brings the method to them instead: the
 *  same flowchart and the same three method cards that the Methods page shows,
 *  rendered at the end of both subsections.
 *
 *  WHAT IS IN THE BOX: the three method cards — fpocket, CAVER and the
 *  channel discovery pipeline — and nothing else. That is the whole of the
 *  team's channel-discovery methods document, in its order, so a reader who
 *  opens the box gets that document and no other material.
 *
 *  It does NOT open on `ChannelIntro`, the section introduction, although it
 *  used to. Those paragraphs are background on UPO channel biology rather than
 *  part of the method, and they are not in the methods document; the Methods
 *  page still opens its channel section with them, which is where they belong.
 *
 *  NOTHING IS DUPLICATED. The flowchart, the card wrapper and the three
 *  illustrations are imported straight out of model_methods.tsx, which is where
 *  they are defined and where the Methods page renders them too, so editing a
 *  method in one place changes it in every appearance and the two pages cannot
 *  drift apart.
 *
 *  WHY THE IMPORT GOES ONE WAY. model_methods.tsx must never import this file:
 *  a mutual import would be a cycle, and the module-level constants in that
 *  file (FP2_ATOMS, CCL_PATHS, …) are computed at import time, so a cycle would
 *  not merely be untidy, it could evaluate them before their dependencies
 *  exist. Anything both files need — the citation lists, for instance — goes in
 *  ChannelIntro.tsx, which imports neither of them.
 *
 *  Styling comes from model_methods.css (.mm-prose, .mp-*, .mviz-*, .fp2-*,
 *  .cav-*, .ccl-*) plus this file's own .cmbox-*. Nothing extra is needed on
 *  the Discovery page: every page is statically imported, so Vite emits ONE
 *  global CSS bundle and those rules are already present — the same property
 *  the Model pages already rely on for `.model-bg`.
 * ========================================================================== */

/** The channel-discovery workflow flowchart.
 *
 *  Kept OUT of the collapsible below and rendered in the normal flow, so the
 *  three steps of the pipeline are visible without anyone having to open
 *  anything — the flowchart is the summary, the box is the detail. */
export function ChannelWorkflow() {
  return <ModelPipeline steps={CHANNEL_WORKFLOW} />;
}

/**
 * The method write-up, behind a disclosure.
 *
 * `idPrefix` exists because this appears TWICE on the Discovery page and the
 * cards carry ids: without it both copies would render `id="method-fpocket"`
 * and the document would have duplicate ids, which is invalid and makes any
 * `#method-fpocket` link ambiguous. Pass a different prefix per instance.
 * The Methods page renders the cards directly with their own unprefixed ids,
 * so its anchors (`#method-fpocket`, …) are unaffected.
 *
 * BOTH COPIES RENDER THE SAME. The box opens once and everything inside it is
 * then plain: `MvizMoreInline` drops the "More about this method" toggle inside
 * each of the three cards and prints that text straight into the card, and the
 * stylesheet strips the cards' own frames, so the three methods read as
 * sections of one document — told apart by a rule and the space around it —
 * rather than as three boxes inside a box. This was briefly true of the
 * literature copy only, behind a `flattenCards` prop; the prop is gone now that
 * both copies want it, so there is nothing to keep in step between them.
 */
export function ChannelMethodsBox({ idPrefix }: { idPrefix: string }) {
  return (
    <DetailsBox label="More details on the channel discovery method">
      <MvizMoreInline value={true}>
        <>
          <MethodBlock
            id={`${idPrefix}-method-fpocket`}
            step={CHANNEL_WORKFLOW[0]}
          >
            <FpocketVizV2 />
          </MethodBlock>
          <MethodBlock
            id={`${idPrefix}-method-caver`}
            step={CHANNEL_WORKFLOW[1]}
          >
            <CaverViz />
          </MethodBlock>
          <MethodBlock
            id={`${idPrefix}-method-channel-clustering`}
            step={CHANNEL_WORKFLOW[2]}
          >
            <ChannelClusterViz />
          </MethodBlock>
        </>
      </MvizMoreInline>
    </DetailsBox>
  );
}
