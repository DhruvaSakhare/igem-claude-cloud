import { TextBox } from "../../components/TextBox";
import { Cite } from "./Cite";

/* ========================================================================== *
 *  UPO channel discovery — the section introduction
 *
 *  The three team-written paragraphs that open "UPO channel discovery" on the
 *  METHODS page. They live here rather than inline on that page because the
 *  DISCOVERY page shows the same method write-up too, at the end of each of its
 *  two Channel discovery subsections (see ChannelMethodsBox.tsx), so a reader
 *  does not have to leave the results to find out how they were produced.
 *
 *  ONE COPY, TWO PAGES — that is the point of this file. Edit the prose here
 *  and both pages follow; do not paste a second copy onto either page.
 *
 *  This file deliberately imports nothing from model_methods.tsx: that page
 *  imports THIS one, and a mutual import would be a cycle. The heavier pieces
 *  of the section (the flowchart and the three method cards) go the other way
 *  round — ChannelMethodsBox.tsx pulls them out of model_methods.tsx.
 *
 *  WHAT THESE PARAGRAPHS CITE is listed in channelCitations.ts, not here — a
 *  page can then build its reference list without re-reading the prose, and the
 *  boxes on the Discovery page, which show the method cards WITHOUT this
 *  introduction, can list the method's works alone.
 *
 *  NOT SectionIntro: that is the centred one-line blurb the other method groups
 *  open with, and three full paragraphs of centred body text are hard to read —
 *  the eye loses the left edge on every line. .mm-prose is left-aligned on a
 *  centred column, and is defined in model_methods.css (one global CSS bundle,
 *  so it applies on the Discovery page too).
 * ========================================================================== */

/** The three opening paragraphs of the UPO channel discovery section. */
export function ChannelIntro() {
  return (
    <TextBox className="model-prose">
      <p className="mm-prose">
        Unspecific peroxygenases (UPOs) carry a heme cofactor buried deep within
        the protein. The heme is isolated from the surrounding solvent at the
        base of an access channel that connects the enzyme surface to the heme
        iron <Cite id="RamirezEscudero2018" />. For a substrate to be oxidized,
        it must first travel through this channel, which, in native and
        engineered <i>Agrocybe aegerita</i> UPO (AaeUPO/PaDa-I), consists mainly
        of hydrophobic and aromatic residues. Several of these residues,
        including a triad of phenylalanines, orient the substrate toward the
        heme, while others delimit the entrance and act as a gate to the
        catalytic pocket <Cite id="RamirezEscudero2018" />.
      </p>
      <p className="mm-prose">
        The dimensions of this channel are not fixed across the UPO family:
        reported widths range from 9.8 Å in AaeUPO to around 12.9 Å in the shorter, wider channel of
        MroUPO, with the identity of the lining residues also shifting from
        mostly aromatic to aliphatic between enzymes{" "}
        <Cite id="RamirezRamirez2020" />. This variability is not random:
        mutagenesis studies show that even single substitutions at
        channel-lining positions can markedly reshape its topography, in some
        cases expanding channel volume by 70 to 90 percent and in others
        constricting it, directly altering how readily a substrate can access
        the heme <Cite id="RamirezRamirez2020" />. Consistent with this,
        engineering the entrance of the channel, for instance the F311L
        substitution in PaDa-I, which widened the outer entrance from 8 to 12 Å,
        has been shown to directly enhance substrate accessibility to the
        catalytic site <Cite id="RamirezEscudero2018" />.
      </p>
      <p className="mm-prose">
        At the family level, a comparative structural survey across
        phylogenetically diverse UPO clades further supports the channel&apos;s
        role as a gatekeeper of catalytic outcome: enzymes with a broad,
        funnel-shaped channel and a narrow base predominantly favour
        peroxidase-type reactivity, whereas UPOs possessing a more constrained
        channel, often paired with an accessory &ldquo;aliphatic pocket&rdquo;
        near the heme, tend to retain substrate closer to the active site and
        favour the peroxygenase reaction instead <Cite id="BarrosReguera2025" />
        . Taken together, these findings indicate that the geometry of the
        access channel, its width, length, and the position of its narrowest
        point, is one of the strongest structural determinants of a UPO&apos;s
        substrate scope and reaction selectivity.
      </p>
    </TextBox>
  );
}
