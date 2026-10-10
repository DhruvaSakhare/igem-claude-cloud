import { Cite } from "./Cite";
import { DetailsBox } from "./DetailsBox";
import {
  DockingSearchStage,
  MDStage,
  MethodBlock,
  MvizInfo,
} from "./model_methods";
import type { PipelineStep } from "./model_methods";
import { MvizMoreInline } from "./MvizMoreInline";
import "./structural-methods.css";

/* ========================================================================== *
 *  UPO structural assessment — the docking and molecular-dynamics methods
 *
 *  One "More details on …" box holding both write-ups the team's
 *  structural-assessment documents carry (it replaced the two separate docking
 *  and dynamics boxes). BOTH UPO sections on the Discovery page show it: the
 *  literature one, where the pipelines were validated on characterised
 *  enzymes, and the database one, where the same pipelines were applied to the
 *  candidates that survived the channel search. The write-up is identical in
 *  the two source documents, so it is ONE component rendered twice — the same
 *  arrangement as ChannelMethodsBox, and for the same reason: a second copy
 *  would be a second thing to keep in step.
 *
 *  TRANSCRIBED FROM THE TEAM'S DOCUMENTS, not summarised. Every parameter here
 *  (box sizes, exhaustiveness, force fields, timestep, replicate count) is the
 *  team's own; do not round one, fill a gap, or add a tool the source does not
 *  name. See .claude/RESPONSIBLE_AI_USE.md.
 *
 *  The prose uses .mm-prose and the parameter lists .smx-params; both come from
 *  one global CSS bundle, so they apply wherever the box is rendered.
 * ========================================================================== */

/** One numbered step of a pipeline: the heading the source gives it, then its
 *  paragraph. Kept as a component so every step in both write-ups is marked up the
 *  same way and the steps can be read as a sequence rather than as bold runs
 *  inside body text. */
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="smx-step">
      <h5 className="smx-step-title">
        <span className="smx-step-n" aria-hidden="true">
          {n}
        </span>
        {title}
      </h5>
      <p className="mm-prose">{children}</p>
    </div>
  );
}

/** The parameter table each pipeline ends on. The source writes it as a bullet
 *  list of "name → value: explanation"; the arrow is what separates the setting
 *  from what it was set to, so the two become the two halves of a definition
 *  list and the values line up down the page instead of being buried mid-line. */
function Params({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: React.ReactNode; note: React.ReactNode }[];
}) {
  return (
    <div className="smx-params">
      <h5 className="smx-params-title">{title}</h5>
      <dl>
        {rows.map((r) => (
          <div className="smx-param" key={r.name}>
            <dt>
              {r.name}
              <span className="smx-arrow" aria-hidden="true">
                →
              </span>
              <span className="smx-value">{r.value}</span>
            </dt>
            <dd>{r.note}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Molecular docking                                                          */
/* -------------------------------------------------------------------------- */

/** The introduction of the docking write-up, as inline content — the
 *  box at the end of this file hands it to a method card as the card's
 *  summary. */
function DockingIntro() {
  return (
    <>
      To predict how candidate substrates bind within the UPO active site,
      we built an automated docking pipeline combining RDKit{" "}
      <Cite id="Riniker2015" /> and Meeko (
      <a
        href="https://github.com/forlilab/Meeko"
        target="_blank"
        rel="noreferrer"
      >
        github.com/forlilab/Meeko
      </a>
      ) for ligand preparation with AutoDock Vina <Cite id="Trott2009" />{" "}
      <Cite id="Eberhardt2021" /> for pose generation and scoring. RDKit
      builds and optimizes the 3D ligand geometry, Meeko converts it into
      a docking-ready format, and Vina performs the actual search for
      favourable binding poses within the receptor. The pipeline supports
      two modes: targeted docking, which searches a user-defined region of
      the protein, and blind docking, which searches the entire protein
      surface when no prior region of interest is specified.
    </>
  );
}

/** The docking pipeline logic and parameter list, shared the same way. */
function DockingDetails() {
  return (
    <>
      <h4 className="smx-heading">Our pipeline logic</h4>

      <Step n={1} title="Receptor and grid box setup">
        Every docking run needs a defined search space. If the user supplies
        target coordinates, the pipeline runs in targeted mode, centering the
        search box on those coordinates with a default box size of 15 x 15 x 15
        Å (adjustable). If no coordinates are supplied, the pipeline switches to
        blind mode: it parses the receptor&apos;s atomic coordinates directly
        from the prepared receptor file, computes the geometric centre as the
        mean atomic position, and sets the box dimensions to span the full
        extent of the protein (the difference between its maximum and minimum
        coordinates along each axis) plus a 10 Å buffer, ensuring the entire
        protein surface falls within the search space.
      </Step>

      <Step n={2} title="Ligand preparation">
        Ligands can be supplied either as an SDF file or as a SMILES string
        (obtained from PubChem). In both cases, the ligand is loaded and
        converted into an RDKit molecule object; for SMILES input, the molecule
        is parsed directly, while for SDF input the first entry in the file is
        read. Hydrogens are then added explicitly, and a 3D conformer is
        generated using RDKit&apos;s ETKDG embedding algorithm, followed by
        energy minimisation with the MMFF force field to obtain a chemically
        reasonable starting geometry. The resulting 3D structure is passed to
        Meeko, which prepares it for docking by assigning the atom types,
        torsions, and partial charges required by Vina, and outputs the ligand
        in PDBQT format.
      </Step>

      <Step n={3} title="Docking execution">
        The prepared receptor and the calculated grid box parameters (centre and
        size) are used to compute Vina&apos;s affinity maps, a discretised
        representation of the receptor&apos;s interaction potential across the
        search space. The prepared ligand is then loaded into Vina, and a
        docking search is performed with a user-defined exhaustiveness setting,
        controlling how thoroughly the conformational space is sampled, and a
        user-defined number of output poses.
      </Step>

      <Step n={4} title="Output">
        The resulting poses are ranked by predicted binding affinity and written
        to a PDBQT file, named dynamically to encode the receptor, ligand, and
        docking mode (and, for targeted docking, the search centre coordinates)
        used in that run.
      </Step>

      <Params
        title="Docking pipeline parameters"
        rows={[
          {
            name: "Docking mode",
            value: "Targeted or Blind",
            note: "Targeted docking restricts the search to a user-specified centre and box size; blind docking searches the full receptor surface, with the box centre and dimensions calculated automatically from the receptor's atomic coordinates.",
          },
          {
            name: "Box size",
            value: "15 x 15 x 15 Å (default, targeted mode only)",
            note: "The default search box dimensions for targeted docking; adjustable by the user.",
          },
          {
            name: "Blind docking buffer",
            value: "10 Å",
            note: "Added to the protein's maximum coordinate span along each axis to ensure the full surface is captured within the search box.",
          },
          {
            name: "Exhaustiveness",
            value: "64",
            note: "Controls how thoroughly Vina samples the conformational and translational search space; higher values increase search thoroughness at the cost of runtime.",
          },
          {
            name: "Number of poses",
            value: "20",
            note: "The number of top-ranked binding poses retained and written to the output file.",
          },
        ]}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Molecular dynamics                                                         */
/* -------------------------------------------------------------------------- */

/** The introduction of the molecular dynamics write-up, as inline content — the
 *  box at the end of this file hands it to a method card as the card's
 *  summary. */
function MdIntro() {
  return (
    <>
      To evaluate the stability of substrate binding across our UPO
      candidates, we built an automated molecular dynamics pipeline using
      OpenMM <Cite id="Eastman2023" />. We ran molecular dynamics on the
      structures of interest, with the substrate NNBT placed by default at
      the most favourable position identified by molecular docking. Our
      aim was to validate the stability of the complex for known,
      literature-supported UPOs and also to filter down the candidate list
      in our enzyme discovery campaign.
    </>
  );
}

/** The md pipeline logic and parameter list, shared the same way. */
function MdDetails() {
  return (
    <>
      <h4 className="smx-heading">Our pipeline logic</h4>

      <Step n={1} title="Heme and ligand treatment">
        Because standard biomolecular force fields have no parameters for the
        reactive iron centre in heme, we removed the iron and treated the
        remaining porphyrin ring as an ordinary organic ligand, the same
        approach used for the substrate itself. This allowed every atom in the
        system, including the cofactor, to be described by a standard,
        well-validated force field, rather than requiring specialised (and much
        slower) reactive or QM/MM methods. The trade-off is that the iron&apos;s
        chemistry is not modelled directly (but this was an acceptable
        compromise, since we were probing binding pocket dynamics and substrate
        positioning rather than catalysis itself).
      </Step>

      <Step n={2} title="System preparation">
        Protein structures were cleaned and protonated at pH 7 with PDBFixer.
        The protein was described with the Amber ff14SB force field{" "}
        <Cite id="Maier2015" /> in explicit TIP3P water{" "}
        <Cite id="Jorgensen1983" />, using 0.15 M NaCl and 1.0 nm solvent
        padding, while the demetallated heme and small-molecule ligands were
        parameterised with the Open Force Field &ldquo;Sage&rdquo; 2.1 force
        field <Cite id="Boothroyd2023" /> using AM1-BCC partial charges{" "}
        <Cite id="Jakalian2002" /> computed via AmberTools&apos; sqm{" "}
        <Cite id="Case2023" />.
      </Step>

      <Step n={3} title="Equilibration and production">
        Each system was energy-minimized, then equilibrated at 300 K under NVT
        and subsequently NPT (1 atm) using a Langevin middle integrator{" "}
        <Cite id="Leimkuhler2012" /> and a Monte Carlo barostat{" "}
        <Cite id="qvist2004" />, before production runs using hydrogen mass
        repartitioning <Cite id="Hopkins2015" /> and bond constraints to allow a
        4 fs timestep. Production lengths ranged from 1 ns smoke tests up to 100
        ns for extended runs.
      </Step>

      <Step n={4} title="Replication">
        Structures were simulated in triplicate (three independent repeats from
        the same starting structure) to confirm that the binding behaviour
        observed was reproducible and not a one-off artefact of a single
        trajectory.
      </Step>

      <Step n={5} title="Trajectory analysis">
        Trajectories were post-processed to remove periodic boundary artefacts
        and rigid-body drift, then analysed via MDTraj{" "}
        <Cite id="McGibbon2015" /> for Cα RMSD (backbone stability), heme and
        ligand heavy-atom RMSD (cofactor/substrate drift from their starting
        pose), ligand to heme distance, and ligand solvent-accessible surface
        area, where a rising SASA signals substrate unbinding from the pocket.
        Together, these metrics give a consistent, comparable readout of binding
        stability. RMSD plots of the protein backbone, heme and NNBT, alongside
        the solvent-accessible surface area (SASA) of NNBT and the distance
        (both minimum and average) between heme and NNBT, were used to evaluate
        the potential of the novel UPOs.
      </Step>

      <Params
        title="Molecular dynamics pipeline parameters"
        rows={[
          {
            name: "Simulation engine",
            value: (
              <>
                OpenMM <Cite id="Eastman2023" />
              </>
            ),
            note: "All simulations were run using OpenMM.",
          },
          {
            name: "Protein force field",
            value: (
              <>
                Amber ff14SB <Cite id="Maier2015" />
              </>
            ),
            note: "Used to describe the protein.",
          },
          {
            name: "Water model",
            value: (
              <>
                TIP3P <Cite id="Jorgensen1983" />
              </>
            ),
            note: "Explicit solvent, with 0.15 M NaCl and 1.0 nm solvent padding.",
          },
          {
            name: "Ligand/cofactor force field",
            value: (
              <>
                Open Force Field &ldquo;Sage&rdquo; 2.1{" "}
                <Cite id="Boothroyd2023" />
              </>
            ),
            note: (
              <>
                Used to parameterise the demetallated heme and small-molecule
                ligands, with AM1-BCC partial charges <Cite id="Jakalian2002" />{" "}
                computed via AmberTools&apos; sqm <Cite id="Case2023" />.
              </>
            ),
          },
          {
            name: "Integrator",
            value: (
              <>
                Langevin middle integrator <Cite id="Leimkuhler2012" />
              </>
            ),
            note: "Used for equilibration and production.",
          },
          {
            name: "Barostat",
            value: (
              <>
                Monte Carlo barostat <Cite id="qvist2004" />
              </>
            ),
            note: "Used during NPT equilibration at 1 atm.",
          },
          {
            name: "Temperature",
            value: "300 K",
            note: "Equilibration temperature under NVT and NPT.",
          },
          {
            name: "Timestep",
            value: "4 fs",
            note: (
              <>
                Enabled by hydrogen mass repartitioning{" "}
                <Cite id="Hopkins2015" /> and bond constraints.
              </>
            ),
          },
          {
            name: "Production length",
            value: "1 to 100 ns",
            note: "Ranging from short smoke tests to extended production runs.",
          },
          {
            name: "Replicates",
            value: "3 independent repeats per structure",
            note: "To confirm reproducibility of binding behaviour.",
          },
          {
            name: "Trajectory analysis tool",
            value: (
              <>
                MDTraj <Cite id="McGibbon2015" />
              </>
            ),
            note: "Used to compute Cα RMSD, heme/ligand heavy-atom RMSD, ligand to heme distance, and ligand SASA.",
          },
        ]}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  The box: docking + dynamics together, in the channel-discovery format      */
/* -------------------------------------------------------------------------- */

/**
 * Both write-ups in ONE box, set out the way ChannelMethodsBox sets out the
 * channel methods — a card per method with its animation beside the
 * introduction, and the pipeline logic and parameters printed in the card
 * below it rather than behind a second toggle (MvizMoreInline).
 *
 * `steps` is the page's own structural flowchart, so each card is titled after
 * its step. `idPrefix` because the Discovery page renders this twice — see
 * ChannelMethodsBox.
 */
export function StructuralMethodsBox({
  idPrefix,
  steps,
}: {
  idPrefix: string;
  steps: PipelineStep[];
}) {
  return (
    <DetailsBox label="More details on the molecular docking and dynamics methods">
      <MvizMoreInline value={true}>
        <MethodBlock id={`${idPrefix}-method-docking`} step={steps[0]}>
          <div className="mviz">
            <DockingSearchStage />
            <MvizInfo title={steps[0].title} more={<DockingDetails />}>
              <DockingIntro />
            </MvizInfo>
          </div>
        </MethodBlock>
        <MethodBlock id={`${idPrefix}-method-md`} step={steps[1]}>
          <div className="mviz">
            <MDStage />
            <MvizInfo title={steps[1].title} more={<MdDetails />}>
              <MdIntro />
            </MvizInfo>
          </div>
        </MethodBlock>
      </MvizMoreInline>
    </DetailsBox>
  );
}
