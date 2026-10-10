import { Link } from "react-router-dom";
import TOC from "../../components/TOC";
import { SectionHeading, SubsectionHeading } from "./SectionHeading";
import { MODEL_PAGES, ModelPager } from "./ModelNav";
import { DetailsBox } from "./DetailsBox";
import { FigNum, NumberedFigures } from "./FigureNumbers";
import {
  ArchitectureFigure,
  ChannelProfileFigure,
  Terminal,
} from "./SoftwareFigures";
import "./software.css";

/* ========================================================================== *
 *  Software — channel-design
 *
 *  This page is about the TOOL. The science it produced lives on the
 *  Engineering page ("UPOs generative design"), and the CAVER method itself is
 *  on Methods ("UPO channel discovery"); both are linked from here rather than
 *  retold, so there is one copy of each.
 *
 *  What this page must answer is the Best Software ballot: standards and data
 *  formats, validation, reusability, integration, usability, and how well it is
 *  written for a future team to extend. The section order below follows that
 *  list rather than the order we built things in.
 *
 *  EVERY NUMBER HERE IS ALSO IN THE REPOSITORY, in docs/validation.md, with the
 *  command that produced it. If one changes, change it in both places -- this
 *  page is what a judge reads first, and the repository is what they check it
 *  against.
 * ========================================================================== */

const REPO = "https://gitlab.igem.org/2026/software/dtu-denmark/channel-design";

export function Software() {
  return (
    <>
      <TOC pages={MODEL_PAGES} activeKey="software" />

      <div className="page-start row mt-4">
        <NumberedFigures className="col-lg-12">
          {/* ---------------------------------------------------------------- */}
          <section id="software-what-it-is">
            <SectionHeading title="channel-design" />

            <div className="sw-repo">
              <span className="sw-repo-label">Repository</span>
              <code>
                <a href={REPO}>
                  gitlab.igem.org/2026/software/dtu-denmark/channel-design
                </a>
              </code>
              <span className="sw-repo-meta">Apache-2.0 &middot; Python</span>
            </div>

            <p className="mm-prose">
              A substrate only reacts if it can physically reach the active
              site. In unspecific peroxygenases (UPOs) that journey runs through
              a narrow tunnel to the heme, and for a bulky substrate the tunnel
              &mdash; not the chemistry &mdash; is what stops the reaction. The
              constriction we started from is under 1&nbsp;&Aring; in radius.
            </p>
            <div data-fig="profile">
              <ChannelProfileFigure />
            </div>

            <p className="mm-prose">
              <strong>
                channel-design measures that tunnel and then uses the
                measurement to redesign it.
              </strong>{" "}
              The tunnel geometry chooses which residues are allowed to move,
              rejects candidate backbones before they cost GPU time, and scores
              the finished designs. The loop closes on a physical measurement
              rather than on a model&rsquo;s own confidence in itself.
            </p>

            <ul className="sw-flow">
              <li className="sw-flow-key">
                <span className="sw-flow-step">Measure</span>
                <span className="sw-flow-tool">CAVER</span>
                <span className="sw-flow-what">
                  bottleneck radius; which residues line the tunnel
                </span>
              </li>
              <li>
                <span className="sw-flow-step">Remodel</span>
                <span className="sw-flow-tool">RFdiffusion3</span>
                <span className="sw-flow-what">
                  moves only those residues, holds the fold rigid
                </span>
              </li>
              <li>
                <span className="sw-flow-step">Redesign</span>
                <span className="sw-flow-tool">LigandMPNN</span>
                <span className="sw-flow-what">
                  new sequence for the tunnel lining
                </span>
              </li>
              <li>
                <span className="sw-flow-step">Refold</span>
                <span className="sw-flow-tool">RF3</span>
                <span className="sw-flow-what">
                  folds each design with heme and substrate
                </span>
              </li>
              <li className="sw-flow-key">
                <span className="sw-flow-step">Measure again</span>
                <span className="sw-flow-tool">CAVER</span>
                <span className="sw-flow-what">
                  rank by real change in bottleneck
                </span>
              </li>
            </ul>

            <p className="mm-prose">
              Two supporting tools come with it: a batch driver for{" "}
              <strong>Boltz-2</strong> (holo structures and binding affinity
              from sequence alone) and a command-line wrapper for{" "}
              <strong>AutoDock Vina</strong>. The results this produced for our
              own enzymes are on the{" "}
              <Link to="/model-engineering">Engineering</Link> page; the CAVER
              method itself is described on{" "}
              <Link to="/model-methods">Methods</Link>.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-architecture">
            <SectionHeading title="How it is put together" />

            <p className="mm-prose">
              Eight stages run in order. Three of them are expensive &mdash;
              they want a GPU and a model checkpoint &mdash; and the rest are
              cheap enough for a laptop. The design of the tool is almost
              entirely about <em>where the cheap measurement sits relative to
              the expensive stages</em>.
            </p>

            <div data-fig="architecture">
              <ArchitectureFigure />
            </div>

            <p className="mm-prose">
              It sits in the middle, at stage&nbsp;3. A diffusion model handed a
              narrow tunnel will sometimes close it completely, and no amount of
              sequence design reopens a channel that is not there. Measuring
              each candidate backbone before it reaches the two most expensive
              stages means a failure costs a minute of CPU instead of hours of
              GPU. Running the same measurement <em>after</em> the pipeline
              &mdash; the obvious place for it &mdash; would have told us the
              same thing and charged us for the privilege.
            </p>
            <p className="mm-prose">
              The gate <strong>fails open</strong>. If CAVER is not installed,
              or Java is missing, or no baseline has been measured, it says so
              and passes every backbone through, which is exactly how the
              pipeline behaved before the gate existed. A filter running
              unattended inside a queued job chain should never be able to
              quietly delete a run; the worst it does here is stop being an
              optimisation.
            </p>
            <p className="mm-prose">
              What a run needs is split three ways, shown along the top of
              Figure <FigNum of="architecture" />. The{" "}
              <strong>experiment</strong> &mdash; which enzyme, which residues
              may move, which substrate &mdash; is in version control and
              publishable. The <strong>machine</strong> &mdash; checkpoints,
              queues, scratch space &mdash; is one file with environment
              overrides. Your own paths are a third file that is never
              committed. That separation is why the configs in the repository
              can be read by anyone without exposing the filesystem they ran
              on, and why moving to a different cluster is one file rather than
              thirty.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-validation">
            <SectionHeading title="What we found by testing it" />

            <p className="mm-prose">
              The result we would most like other teams to take away is not the
              enzyme. It is that{" "}
              <strong>
                two artifacts in the standard way of comparing protein tunnels
                were each larger than the effect we were trying to measure.
              </strong>{" "}
              We found both by measuring the same structure twice and getting
              different answers. Anyone comparing tunnels with CAVER is exposed
              to them.
            </p>

            <table className="sw-table">
              <thead>
                <tr>
                  <th>Artifact</th>
                  <th>Size</th>
                  <th>Compared with</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Bound substrate.</strong> Designs come out of RF3{" "}
                    <em>holo</em>; the reference crystals are <em>apo</em>. The
                    substrate sits in the tunnel and narrows it.
                  </td>
                  <td className="sw-num">~0.45 &Aring;</td>
                  <td className="sw-num">
                    0.077 &Aring; real spread across three reference structures
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>The input filename.</strong> CAVER&rsquo;s tunnel
                    search is randomised and seeds from the file name, so the
                    same bytes under a different name give a different answer.
                  </td>
                  <td className="sw-num">0.0885 &Aring;</td>
                  <td className="sw-num">
                    0.0000 &Aring; over six runs with one name
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="mm-prose">
              The first is roughly <strong>six times</strong> the difference
              between real structures. Every comparison made before we found it
              was measuring how much of the tunnel the substrate filled, not how
              wide the protein&rsquo;s tunnel was. The clearest illustration is
              MroUPO: measured with its docked substrate it looks like
              0.745&nbsp;&Aring;, and measured apo it is 1.058&nbsp;&Aring;
              &mdash; the widest tunnel we measured. The same structure, read
              two ways, answers &ldquo;does this enzyme need widening?&rdquo;
              opposite ways.
            </p>
            <p className="mm-prose">
              Both are now enforced in code rather than left to whoever runs it:
              the substrate is stripped by default, every structure is staged
              under one constant filename, and the scripts refuse to compare a
              baseline measured one way against designs measured the other.
            </p>

            <SubsectionHeading title="Benchmark against public crystals" />
            <p className="mm-prose">
              Measured apo, one protocol throughout. The three references are
              public PDB entries, so these numbers can be checked against data
              we did not generate.
            </p>
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Structure</th>
                  <th>Bottleneck radius</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>5FUJ &mdash; reference UPO</td>
                  <td className="sw-num">0.975 &Aring;</td>
                </tr>
                <tr className="sw-highlight">
                  <td>PabUPO-II &mdash; our parent enzyme</td>
                  <td className="sw-num">0.983 &Aring;</td>
                </tr>
                <tr>
                  <td>9HE9 &mdash; PabUPO-II crystal</td>
                  <td className="sw-num">1.032 &Aring;</td>
                </tr>
                <tr>
                  <td>5OXU &mdash; reference UPO</td>
                  <td className="sw-num">1.050 &Aring;</td>
                </tr>
                <tr>
                  <td>MroUPO</td>
                  <td className="sw-num">1.058 &Aring;</td>
                </tr>
                <tr className="sw-highlight">
                  <td>Best design produced by the pipeline</td>
                  <td className="sw-num">1.094 &Aring; (+11.3&nbsp;%)</td>
                </tr>
              </tbody>
            </table>
            <p className="mm-prose">
              That the parent falls inside the range spanned by three
              independent crystal structures is what tells us the measurement is
              calibrated at all. The best design is wider than all three, at
              pLDDT&nbsp;0.96.
            </p>

            <div className="sw-caveat">
              <strong>What this does not show.</strong> Every number on this
              page is computational; no design has been expressed or assayed.
              The twenty designs measured so far all come from one backbone and
              are therefore correlated rather than representative, and the full
              174-design rescore is unfinished. The ceiling is also not
              geometric: the constriction in our parent is formed by two{" "}
              <em>catalytic</em> residues, so widening much further means
              touching the active site.
            </div>

            <SubsectionHeading title="Software testing" />
            <p className="mm-prose">
              The repository carries a test suite that runs in seconds on a
              laptop &mdash; no GPU, no cluster, no model weights, no network
              &mdash; because the parts a reviewer cannot run are not the parts
              worth testing. It covers the data contract between components,
              every shipped configuration, the cross-component path resolution,
              and two regression guards written against reproduced failures.
            </p>
            <DetailsBox label="More details on what the tests protect">
              <table className="sw-table">
                <tbody>
                  <tr>
                    <td>Machine paths and binaries</td>
                    <td>
                      Fails the build if a cluster path, a personal user id, a
                      committed binary or licence-restricted software re-enters
                      the repository.
                    </td>
                  </tr>
                  <tr>
                    <td>Every shipped configuration</td>
                    <td>
                      All of them import, find their structure, and write only
                      inside the run directory. This began as a real failure:
                      eleven team configurations were unrunnable at once because
                      one path was resolved a level too deep.
                    </td>
                  </tr>
                  <tr>
                    <td>Ligands are visible</td>
                    <td>
                      A substrate written as <code>ATOM</code> instead of{" "}
                      <code>HETATM</code> is invisible to every ligand-aware
                      step &mdash; CAVER finds zero tunnels. One of our own
                      configurations pointed at such a file.
                    </td>
                  </tr>
                  <tr>
                    <td>The Boltz-2 &rarr; clustering contract</td>
                    <td>
                      Runs the real join on fixture data, so a renamed column
                      cannot silently empty the result.
                    </td>
                  </tr>
                  <tr>
                    <td>Resuming a batch</td>
                    <td>
                      Written against a reproduced bug: resuming re-appended a
                      row per finished structure, so a twice-resumed run counted
                      every structure three times.
                    </td>
                  </tr>
                </tbody>
              </table>
            </DetailsBox>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-using-it">
            <SectionHeading title="Using it" />

            <p className="mm-prose">
              You do not need our cluster, and for a large part of it you do not
              need a GPU.
            </p>

            <div className="sw-tiers">
              <div className="sw-tier">
                <h4>A laptop</h4>
                <p>
                  The whole measurement half: pocket detection, tunnel geometry,
                  clustering, every analysis script, and the full test suite.
                </p>
              </div>
              <div className="sw-tier">
                <h4>One GPU</h4>
                <p>
                  The complete design pipeline, stage by stage, with{" "}
                  <code>run_local.py</code>. No scheduler needed.
                </p>
              </div>
              <div className="sw-tier">
                <h4>An LSF cluster</h4>
                <p>
                  The same stages submitted as job arrays for scale. On SLURM,
                  run <code>run_local.py</code> inside an allocation.
                </p>
              </div>
            </div>

            <SubsectionHeading title="Installing it" />
            <p className="mm-prose">
              One script, and it does not need conda. It installs{" "}
              <a href="https://docs.astral.sh/uv/">uv</a> if you do not have it
              (asking first), installs every Python dependency from a committed
              lockfile so the versions are exactly ours, downloads CAVER&nbsp;3.0
              from its authors and checks it against a SHA-256, builds fpocket
              from source, and checks for a JDK without installing one.
            </p>

            <div className="sw-cmd">
              <code>
                git clone {"<repo>"} &amp;&amp; cd channel-design
                <br />
                ./setup.sh <span className="sw-comment"># add --gpu for the design stages</span>
              </code>
            </div>

            <p className="mm-prose">
              Model checkpoints are deliberately <em>not</em> downloaded unless
              you ask with <code>--weights</code>: they are tens of gigabytes
              and are usually already on a shared filesystem. Point at the copy
              you have instead of fetching another. Then check what the install
              actually found &mdash; thirty seconds, and it is the difference
              between a clean start and discovering a missing checkpoint
              mid-run:
            </p>

            <Terminal
              title="./setup.sh --check"
              command="./setup.sh --check"
              lines={[
                { text: "== uv", kind: "head" },
                { text: "   ok    uv 0.13.0" },
                { text: "" },
                { text: "== External tools", kind: "head" },
                { text: "   ok    CAVER: third_party/caver" },
                { text: "   fail  fpocket: missing", kind: "key" },
                { text: '   ok    java: java version "1.8.0_481"' },
                { text: "" },
                { text: "== Model checkpoints", kind: "head" },
                {
                  text: "  RFD3_CKPT    .../ckpt/rfd3_latest.ckpt   <-- DOES NOT EXIST",
                  kind: "key",
                },
                {
                  text: "  MPNN_CKPT    .../ligandmpnn_v_32_010_25.pt   <-- DOES NOT EXIST",
                  kind: "key",
                },
                {
                  text: "   note  name them in envs/site.env, or ./setup.sh --gpu --weights",
                  kind: "dim",
                },
              ]}
            />
            <p className="mm-prose sw-figcap">
              A real <code>--check</code> on a laptop with no model weights.
              Every line is either <code>ok</code> or says exactly what is
              missing and how to supply it. The two failures here are expected:
              this machine measures tunnels and does not run the design stages,
              and <code>--check</code> is explicit about that rather than
              failing at the first missing file.
            </p>

            <SubsectionHeading title="A run, start to finish" />
            <p className="mm-prose">
              The shape of it is{" "}
              <em>
                measure &rarr; pilot &rarr; commit &rarr; re-measure &rarr;
                explain
              </em>
              . The expensive step is guarded on both sides.
            </p>

            <div className="sw-cmd">
              <code>
                <span className="sw-comment">
                  # 0. measure the parent: writes the tunnel-lining residues and
                  your baseline
                </span>
                <br />
                python partial_diffusion/scripts/00_caver_channel.py
                <br />
                <br />
                <span className="sw-comment">
                  # 1. pilot: one backbone, diffusion only, before spending
                  anything
                </span>
                <br />
                python partial_diffusion/scripts/run_local.py --stages
                prep-caver_filter
                <br />
                python partial_diffusion/scripts/08_probe_channel.py ...
                <br />
                <br />
                <span className="sw-comment"># 2. the full run</span>
                <br />
                python partial_diffusion/scripts/run_local.py
                <br />
                <br />
                <span className="sw-comment">
                  # 3. did it work? rank by measured widening, not confidence
                </span>
                <br />
                python partial_diffusion/scripts/07_caver_rescore.py
                <br />
                python partial_diffusion/scripts/09_compare_to_parent.py ...
              </code>
            </div>

            <Terminal
              title="00_caver_channel.py — measuring the parent"
              command="python 00_caver_channel.py examples/PabUPO-II_withHEMEFE_and_NNBT.pdb"
              lines={[
                { text: "Running CAVER (this takes a minute)...", kind: "dim" },
                { text: "Substrate : UNL — stripped (measuring apo)", kind: "dim" },
                { text: "" },
                { text: "Best channel — tunnel 1 (cluster 1)", kind: "head" },
                {
                  text: "  bottleneck radius : 0.983 A   <- the number to beat",
                  kind: "key",
                },
                { text: "  length            : 14.96 A" },
                { text: "  throughput        : 0.717" },
                { text: "  curvature         : 1.30" },
                { text: "" },
                { text: "Channel-lining residues on chain A:", kind: "head" },
                { text: "  sidechain-lining (20) : [52, 85, 86, 88, 89, 92, ...]" },
                { text: "  backbone-only     (7) : [90, 94, 204, 209, ...]" },
                {
                  text: "  -> FLEXIBLE_RESIDUES (27) : [52, 85, 86, 88, 89, 90, ...]",
                  kind: "key",
                },
                { text: "" },
                { text: "Wrote:", kind: "head" },
                { text: "  ..._flex.json        the residues, ready to paste" },
                { text: "  ..._baseline.json    what designs are compared against" },
                { text: "  ..._channel.pdb      the tunnel, as placeholder atoms" },
              ]}
            />
            <p className="mm-prose sw-figcap">
              Real output on the structure bundled with the repository, and the
              one command worth running if you try nothing else. The three
              numbers at the top are the same ones in Figure{" "}
              <FigNum of="profile" />; a reader can reproduce them in about a
              minute on a laptop, which is why they are quoted here rather than
              described.
            </p>

            <p className="mm-prose">
              <strong>
                Step 0 is the one that makes the tool worth using.
              </strong>{" "}
              It answers the hardest question in this kind of design work
              &mdash; which residues should I allow to change? &mdash; from
              measured geometry instead of intuition, and records the baseline
              the designs will be judged against.
            </p>
            <p className="mm-prose">
              <strong>Step 1 exists because the full run is expensive.</strong>{" "}
              One backbone tells you whether the tunnel opens at all. If it does
              not open here it will not open across two hundred designs, so you
              retune cheaply rather than discovering it a day later.
            </p>
            <p className="mm-prose">
              Three further scripts explain <em>why</em> a design worked:
              overlaying tunnel profiles, clustering designs by tunnel shape
              rather than by a single number, and naming the residues physically
              blocking the tunnel. That last one is how we learned our ceiling
              was catalytic &mdash; a conclusion the tool handed us rather than
              one we assumed.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-reuse">
            <SectionHeading title="Reusing it for another enzyme" />

            <p className="mm-prose">
              Nothing in the method is specific to peroxygenases. A Boltz-2 job
              is a short YAML file with a placeholder for the sequence and
              cofactors named by their standard PDB codes, so heme, copper,
              zinc, NAD and FAD all work the same way. One of the three bundled
              templates sets up four copper ions for multicopper oxidases, which
              is our evidence that it generalised past heme enzymes before we
              claimed it would.
            </p>
            <p className="mm-prose">
              To point the pipeline at your own enzyme you supply a prepared
              structure, let step&nbsp;0 choose the flexible residues, and set
              your substrate as a SMILES string. Machine-specific paths &mdash;
              checkpoints, queues, scratch directories &mdash; live in one file
              with environment-variable overrides, so adopting it does not mean
              editing the science.
            </p>
            <p className="mm-prose">
              If you only want the measurement, take that: the CAVER wrapper
              with the two protocol fixes above is useful to anyone comparing
              enzyme tunnels, needs no GPU and no model weights, and does not
              require you to adopt the design pipeline at all.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-standards">
            <SectionHeading title="Standards, formats and integration" />

            <p className="mm-prose">
              <strong>
                This project does not use SBOL, and we are not going to claim
                that it does.
              </strong>{" "}
              SBOL describes genetic parts and how they compose; it has no
              representation for the bottleneck radius of a substrate tunnel or
              for &ldquo;these twenty-two residues may move during
              diffusion&rdquo;. The DNA encoding our designs is real and
              standards-described, but it lives in our parts entries, not in
              this tool.
            </p>
            <p className="mm-prose">
              What is true, and what actually matters for reuse, is that{" "}
              <strong>
                every interface is a community-standard format and none of them
                is ours.
              </strong>{" "}
              That is the reason the four components chain together at all, and
              the reason you can cut into the workflow at any point with your
              own tools.
            </p>

            <table className="sw-table">
              <thead>
                <tr>
                  <th>Format</th>
                  <th>Standard</th>
                  <th>Used for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PDB, mmCIF/PDBx</td>
                  <td>wwPDB</td>
                  <td>every structure in and out of every stage</td>
                </tr>
                <tr>
                  <td>FASTA</td>
                  <td>de facto</td>
                  <td>sequence input; the header supplies the join key</td>
                </tr>
                <tr>
                  <td>A3M</td>
                  <td>HH-suite / ColabFold</td>
                  <td>multiple sequence alignments</td>
                </tr>
                <tr>
                  <td>SMILES</td>
                  <td>Daylight</td>
                  <td>substrate definition</td>
                </tr>
                <tr>
                  <td>Three-letter ligand codes</td>
                  <td>RCSB Chemical Component Dictionary</td>
                  <td>cofactors &mdash; HEM, CU, ZN, NAD, FAD</td>
                </tr>
                <tr>
                  <td>SDF, PDBQT</td>
                  <td>MDL, AutoDock</td>
                  <td>docking input</td>
                </tr>
                <tr>
                  <td>CSV</td>
                  <td>RFC 4180</td>
                  <td>every results table</td>
                </tr>
              </tbody>
            </table>

            <p className="mm-prose">
              Tables are addressed{" "}
              <strong>by column name, never by position</strong>, and a script
              that cannot find a column it needs exits with an error listing the
              columns it did find. The one place two components meet is a CSV:
              the Boltz-2 driver writes an accession, a confidence and a
              predicted affinity, and the tunnel clustering joins on the
              accession. Because that contract is a file and not a function
              call,{" "}
              <strong>
                any affinity predictor can be substituted for Boltz-2
              </strong>{" "}
              &mdash; emit those three columns and nothing else changes. A test
              runs that join on fixture data so it cannot drift.
            </p>
            <p className="mm-prose">
              Public identifiers are consumed rather than reinvented: RCSB
              accessions (5FUJ, 5OXU and 9HE9 are appended to every clustering
              run as calibration anchors), UniProt and NCBI accessions, CUPP
              clade assignments, and SignalP&nbsp;6.0 for trimming signal
              peptides.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-tradeoffs">
            <SectionHeading title="Design choices, and what they cost" />

            <p className="mm-prose">
              Every one of these was a decision with a downside. They are worth
              stating with the downside attached, because a tool described only
              by what it does well is not a description anyone can act on.
            </p>

            <div className="sw-tradeoffs">
              <div className="sw-tradeoff">
                <h4>Rank by measured geometry, not model confidence</h4>
                <p>
                  <span className="sw-to-gain">Why:</span> a model&rsquo;s
                  confidence in a structure says nothing about whether the
                  tunnel through it is wider. Ranking by pLDDT would have
                  selected for designs that fold predictably, which is not what
                  we wanted.
                </p>
                <p>
                  <span className="sw-to-cost">Cost:</span> a CAVER run per
                  design, which is minutes of CPU each and the slowest part of
                  scoring. We accept the wall-clock for a number that means
                  what it says.
                </p>
              </div>

              <div className="sw-tradeoff">
                <h4>The gate fails open</h4>
                <p>
                  <span className="sw-to-gain">Why:</span> it runs unattended
                  inside a queued job chain. A filter that can fail closed can
                  silently discard an entire run, hours after you stopped
                  watching.
                </p>
                <p>
                  <span className="sw-to-cost">Cost:</span> a run with CAVER
                  missing completes and looks normal while having skipped its
                  own central idea. The gate says so loudly in the log, and the
                  first thing to check on a disappointing run is whether it
                  actually ran.
                </p>
              </div>

              <div className="sw-tradeoff">
                <h4>Measure apo, even though designs are folded holo</h4>
                <p>
                  <span className="sw-to-gain">Why:</span> a bound substrate
                  costs about 0.45&nbsp;&Aring; of apparent bottleneck radius,
                  while the real spread across three reference crystals is
                  0.077&nbsp;&Aring;. Comparing a holo design against an apo
                  crystal measures the ligand, not the design &mdash; the
                  artifact is roughly six times the signal.
                </p>
                <p>
                  <span className="sw-to-cost">Cost:</span> the number we report
                  is not the tunnel the substrate actually travels through. It
                  is the one that can be compared across structures, which is
                  the only thing a ranking needs.
                </p>
              </div>

              <div className="sw-tradeoff">
                <h4>Three config layers instead of one file</h4>
                <p>
                  <span className="sw-to-gain">Why:</span> it is what lets an
                  experiment be published while the filesystem stays private,
                  and what made this repository publishable at all &mdash; the
                  working tree it came from had one contributor&rsquo;s user id
                  in it over five thousand times.
                </p>
                <p>
                  <span className="sw-to-cost">Cost:</span> three places to look
                  when a path is wrong instead of one. A{" "}
                  <code>--check</code> subcommand exists specifically to
                  collapse them back into one report.
                </p>
              </div>

              <div className="sw-tradeoff">
                <h4>Two drivers for one pipeline</h4>
                <p>
                  <span className="sw-to-gain">Why:</span> a single-GPU user
                  should not have to understand LSF, and a cluster user should
                  not run two hundred designs in series.
                </p>
                <p>
                  <span className="sw-to-cost">Cost:</span> they drifted apart
                  three separate times &mdash; a stage present in one and not
                  the other, a flag documented but only implemented in one, and
                  two pilots that tested different things. All three were real
                  bugs. The test suite now asserts the two expose the same
                  stages, which is a patch over a design that would be better
                  as one shared definition. It is written down as open work
                  rather than claimed as finished.
                </p>
              </div>

              <div className="sw-tradeoff">
                <h4>No SBOL, and no genetic-circuit standards</h4>
                <p>
                  <span className="sw-to-gain">Why:</span> this is structural
                  tooling. Its vocabulary is atoms, chains, residue numbers and
                  ligand codes, and the standards that matter for that are PDB,
                  mmCIF, FASTA and SMILES &mdash; all of which it reads and
                  writes.
                </p>
                <p>
                  <span className="sw-to-cost">Cost:</span> it does not plug
                  into the synthetic-biology tool ecosystem the way a
                  circuit-design tool would. Claiming SBOL support would be
                  easy and false, so we say plainly that there is none.
                </p>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-interfaces">
            <SectionHeading title="How you call it" />

            <p className="mm-prose">
              There is no web service and no REST API, and that is a deliberate
              choice rather than an omission: every stage is a command-line
              script that reads files and writes files, which is what makes it
              composable with a scheduler, a Makefile, or somebody
              else&rsquo;s pipeline. Three interfaces are stable enough to build
              on.
            </p>

            <div className="sw-api">
              <div className="sw-api-item">
                <h4>The command line</h4>
                <p>
                  Every script takes <code>--help</code>. The two drivers take{" "}
                  <code>--check</code> (what is installed and resolvable) and{" "}
                  <code>--dry-run</code> (print every command, run nothing), so
                  a whole run can be inspected before anything is spent. A test
                  in the suite asserts that every flag named in the
                  documentation actually exists &mdash; which it did not
                  always.
                </p>
              </div>

              <div className="sw-api-item">
                <h4>Python, importable</h4>
                <p>
                  <code>lib/caver_utils.py</code> is the measurement layer:
                  stage a structure, run CAVER, parse tunnels, lining residues
                  and profiles. If all you want is &ldquo;how wide is the
                  tunnel in this PDB&rdquo;, that is the import, and it needs no
                  GPU and no model weights.
                </p>
              </div>

              <div className="sw-api-item">
                <h4>A CSV contract between the tools</h4>
                <p>
                  The Boltz-2 driver writes{" "}
                  <code>accession, ligand_iptm, affinity_pred_value</code>; the
                  clustering script joins that against{" "}
                  <code>cluster_assignments.csv</code> on the file stem and
                  gates on <code>ligand_iptm &ge; 0.8</code>. That join is the
                  one place two separate tools in this repository have to agree,
                  so it is the one covered by a test that runs the real code on
                  fixtures.
                </p>
              </div>
            </div>

            <p className="mm-prose">
              <strong>
                Deploying it means cloning it and running one script.
              </strong>{" "}
              There is nothing to host, no database, no service to keep up.
              That is also why this page shows captured output rather than a
              live demo: the iGEM wiki is served as static files, so a button
              here could only call a server somewhere else &mdash; and a page
              that is archived permanently should not depend on a server that
              will not be.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-ai">
            <SectionHeading title="AI models used" />

            <p className="mm-prose">
              <strong>We trained nothing and fine-tuned nothing.</strong> Every
              model here is a published, pre-trained network used as released,
              and none of their weights are redistributed in our repository.
            </p>
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Role</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Boltz-2</td>
                  <td>holo structure and binding affinity from sequence</td>
                  <td>
                    <a href="https://github.com/jwohlwend/boltz">
                      jwohlwend/boltz
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>RFdiffusion3</td>
                  <td>
                    partial diffusion &mdash; remodels the tunnel residues
                  </td>
                  <td>
                    <a href="https://github.com/RosettaCommons/foundry">
                      RosettaCommons/foundry
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>LigandMPNN</td>
                  <td>ligand-aware inverse folding</td>
                  <td>
                    <a href="https://github.com/RosettaCommons/foundry">
                      RosettaCommons/foundry
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>RF3</td>
                  <td>folds and scores each design with its cofactors</td>
                  <td>
                    <a href="https://github.com/RosettaCommons/foundry">
                      RosettaCommons/foundry
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="mm-prose">
              Their training data is not ours to characterise &mdash; all four
              were trained by their authors, largely on the Protein Data Bank,
              and the upstream projects are the authority on composition and
              cut-off dates. What we supply at inference time is our own
              prepared structures, alignments fetched from the public
              ColabFold/MMseqs2 server, and substrate SMILES.
            </p>
            <p className="mm-prose">
              <strong>How we evaluated them is the important part.</strong> We
              did not evaluate them as models; we asked whether their output was
              fit for one question &mdash; is the tunnel wider? &mdash; and
              answered it with CAVER, a deterministic geometric algorithm that
              does not share failure modes with the networks that produced the
              structures. Model-reported confidence is used only to decide which
              structures are worth measuring, never as evidence that a design is
              better. Notably,{" "}
              <strong>our measurement was wrong before the models were.</strong>
            </p>
            <DetailsBox label="More details on the limitations we know about">
              <ul className="mm-prose">
                <li>
                  Nothing has been tested in a laboratory. A design that folds
                  confidently may not express, fold or function.
                </li>
                <li>
                  Confidence is not correctness. pLDDT&nbsp;0.96 says the
                  network is certain, not that it is right &mdash; and that
                  matters most at exactly the redesigned positions, which have
                  the least evolutionary signal behind them.
                </li>
                <li>
                  Affinity predictions are used for ranking. We make no claim
                  about their absolute calibration on UPOs, a family unlikely to
                  be well represented in training data.
                </li>
                <li>
                  Bottleneck radii measured on predicted structures carry the
                  prediction&rsquo;s error, which is why every comparison is
                  anchored to real crystals.
                </li>
                <li>
                  The pipeline inherits its models&rsquo; biases. A generative
                  model trained mostly on soluble, well-behaved proteins
                  proposes soluble, well-behaved proteins, whether or not that
                  suits an industrial enzyme.
                </li>
              </ul>
            </DetailsBox>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-related">
            <SectionHeading title="How this relates to existing tools" />

            <p className="mm-prose">
              Both halves of what we did are established fields on their own.
              Tunnel analysis has a mature ecosystem &mdash; CAVER, CaverDock
              and Caver&nbsp;Web detect tunnels and can simulate a ligand
              travelling through one. Generative enzyme design has another:
              RFdiffusion and LigandMPNN pipelines routinely filter candidates
              in the loop.
            </p>
            <p className="mm-prose">
              The filters in those design pipelines are about active-site motif
              geometry and whether the fold is self-consistent. We are not aware
              of one that uses{" "}
              <strong>tunnel bottleneck radius as the design objective</strong>{" "}
              &mdash; to select the residues to free, to reject backbones before
              they reach the expensive stages, and to rank the finished designs.
              Joining those two worlds is the contribution, and our tunnel
              analysis is a batch wrapper around CAVER rather than a new method
              for finding tunnels.
            </p>
          </section>

          {/* ---------------------------------------------------------------- */}
          <section id="software-for-future-teams">
            <SectionHeading title="For whoever picks this up" />

            <p className="mm-prose">
              The stage scripts are numbered in the order they run and each one
              works on its own. Configuration is deliberately layered: what the
              experiment <em>is</em> in one file, what the <em>machine</em> is
              in another, and personal overrides in a third that is never
              committed &mdash; so publishing an experiment never publishes
              somebody&rsquo;s home directory, and moving to a new cluster is
              one file rather than thirty.
            </p>
            <p className="mm-prose">
              The repository also carries the things that usually go unwritten:
              a record of seven traps that each cost us a run, with the commands
              to verify them; a laboratory notebook of what was tried and
              abandoned and why; and an honest account of what is still
              unfinished. If you read one file before changing anything, read
              the known-issues list.
            </p>
            <div className="sw-repo">
              <span className="sw-repo-label">Source, docs and tests</span>
              <code>
                <a href={REPO}>
                  gitlab.igem.org/2026/software/dtu-denmark/channel-design
                </a>
              </code>
              <span className="sw-repo-meta">Apache-2.0</span>
            </div>
          </section>

          <ModelPager active="software" />
        </NumberedFigures>
      </div>
    </>
  );
}
