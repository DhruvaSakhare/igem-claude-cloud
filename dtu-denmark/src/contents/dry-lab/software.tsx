import { useEffect } from "react";
import { Link } from "react-router-dom";

import TOC from "../../components/TOC";
import { TextBox } from "../../components/TextBox";
import PartsTable from "../../components/PartsTable";
import type { TableColumn } from "../../components/PartsTable";
import { PageTitle, SectionHeading, SubsectionHeading } from "./SectionHeading";
import { MODEL_PAGES, ModelPager } from "./ModelNav";
import { DetailsBox } from "./DetailsBox";
import { FigNum, NumberedFigures, TabNum } from "./FigureNumbers";
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
 *
 *  LAYOUT follows the other four Model pages (model_methods, model_discovery,
 *  model_engineering): page-container > TOC + PageTitle + NumberedFigures,
 *  prose in a TextBox, every table a numbered PartsTable. The page-specific
 *  blocks (.sw-*) are styled as the site's cards -- 16px corners, the solid
 *  drop shadow from TextBox.css, orange for the one thing being pointed at.
 * ========================================================================== */

const REPO = "https://gitlab.igem.org/2026/software/dtu-denmark/channel-design";

/* --- table definitions ----------------------------------------------------
   Kept out of the JSX so the sections below read as prose with a table in
   them. Each is a PartsTable given a `numberId`, which is what puts "Table N."
   on it and what `<TabNum of=…>` refers to. */

/* No `rowHeader` on the description column: it sets `white-space: nowrap`
   (PartsTable.css), which is right for an accession or a part id and wrong for
   a sentence — it pushed the other two columns off the page. The same applies
   to TEST_COLUMNS below. */
const ARTIFACT_COLUMNS: TableColumn[] = [
  { field: "artifact", header: "Artifact" },
  { field: "size", header: "Size" },
  { field: "against", header: "Compared with" },
];

const ARTIFACT_ROWS = [
  {
    artifact: (
      <>
        <strong>Bound substrate.</strong> Designs come out of RF3 <em>holo</em>;
        the reference crystals are <em>apo</em>. The substrate sits in the
        tunnel and narrows it.
      </>
    ),
    size: <span className="sw-num">~0.45 Å</span>,
    against: "0.077 Å real spread across three reference structures",
  },
  {
    artifact: (
      <>
        <strong>The input filename.</strong> CAVER’s tunnel search is randomised
        and seeds from the file name, so the same bytes under a different name
        give a different answer.
      </>
    ),
    size: <span className="sw-num">0.0885 Å</span>,
    against: "0.0000 Å over six runs with one name",
  },
];

const BENCH_COLUMNS: TableColumn[] = [
  { field: "structure", header: "Structure", rowHeader: true },
  { field: "radius", header: "Bottleneck radius" },
];

/* Ordered by radius, not by provenance, because the point of the table is
   where the parent and the best design fall in that order. The two rows that
   are ours are bold — the ranking is the message, so they are marked in the
   cells rather than by colouring whole rows. */
const BENCH_ROWS = [
  {
    structure: "5FUJ — reference UPO",
    radius: <span className="sw-num">0.975 Å</span>,
  },
  {
    structure: <strong>PabUPO-II — our parent enzyme</strong>,
    radius: (
      <strong className="sw-num">0.983 Å</strong>
    ),
  },
  {
    structure: "9HE9 — PabUPO-II crystal",
    radius: <span className="sw-num">1.032 Å</span>,
  },
  {
    structure: "5OXU — reference UPO",
    radius: <span className="sw-num">1.050 Å</span>,
  },
  { structure: "MroUPO", radius: <span className="sw-num">1.058 Å</span> },
  {
    structure: <strong>Best design produced by the pipeline</strong>,
    radius: (
      <strong className="sw-num">1.094 Å (+11.3 %)</strong>
    ),
  },
];

const TEST_COLUMNS: TableColumn[] = [{ field: "what" }, { field: "why" }];

const TEST_ROWS = [
  {
    what: <strong>Machine paths and binaries</strong>,
    why: "Fails the build if a cluster path, a personal user id, a committed binary or licence-restricted software re-enters the repository.",
  },
  {
    what: <strong>Every shipped configuration</strong>,
    why: "All of them import, find their structure, and write only inside the run directory. This began as a real failure: eleven team configurations were unrunnable at once because one path was resolved a level too deep.",
  },
  {
    what: <strong>Ligands are visible</strong>,
    why: (
      <>
        A substrate written as <code>ATOM</code> instead of <code>HETATM</code>{" "}
        is invisible to every ligand-aware step — CAVER finds zero tunnels. One
        of our own configurations pointed at such a file.
      </>
    ),
  },
  {
    what: <strong>The Boltz-2 → clustering contract</strong>,
    why: "Runs the real join on fixture data, so a renamed column cannot silently empty the result.",
  },
  {
    what: <strong>Resuming a batch</strong>,
    why: "Written against a reproduced bug: resuming re-appended a row per finished structure, so a twice-resumed run counted every structure three times.",
  },
];

const FORMAT_COLUMNS: TableColumn[] = [
  { field: "format", header: "Format", rowHeader: true },
  { field: "standard", header: "Standard" },
  { field: "use", header: "Used for" },
];

const FORMAT_ROWS = [
  {
    format: "PDB, mmCIF/PDBx",
    standard: "wwPDB",
    use: "every structure in and out of every stage",
  },
  {
    format: "FASTA",
    standard: "de facto",
    use: "sequence input; the header supplies the join key",
  },
  {
    format: "A3M",
    standard: "HH-suite / ColabFold",
    use: "multiple sequence alignments",
  },
  { format: "SMILES", standard: "Daylight", use: "substrate definition" },
  {
    format: "Three-letter ligand codes",
    standard: "RCSB Chemical Component Dictionary",
    use: "cofactors — HEM, CU, ZN, NAD, FAD",
  },
  { format: "SDF, PDBQT", standard: "MDL, AutoDock", use: "docking input" },
  { format: "CSV", standard: "RFC 4180", use: "every results table" },
];

const MODEL_COLUMNS: TableColumn[] = [
  { field: "model", header: "Model", rowHeader: true },
  { field: "role", header: "Role" },
  { field: "source", header: "Source" },
];

const FOUNDRY = (
  <a href="https://github.com/RosettaCommons/foundry">RosettaCommons/foundry</a>
);

const MODEL_ROWS = [
  {
    model: "Boltz-2",
    role: "holo structure and binding affinity from sequence",
    source: <a href="https://github.com/jwohlwend/boltz">jwohlwend/boltz</a>,
  },
  {
    model: "RFdiffusion3",
    role: "partial diffusion — remodels the tunnel residues",
    source: FOUNDRY,
  },
  {
    model: "LigandMPNN",
    role: "ligand-aware inverse folding",
    source: FOUNDRY,
  },
  {
    model: "RF3",
    role: "folds and scores each design with its cofactors",
    source: FOUNDRY,
  },
];

/** The five stages of the loop, as the strip under the opening section. The
 *  two CAVER steps are the contribution, so they are the marked ones. */
const FLOW = [
  {
    step: "Measure",
    tool: "CAVER",
    what: "bottleneck radius; which residues line the tunnel",
    key: true,
  },
  {
    step: "Remodel",
    tool: "RFdiffusion3",
    what: "moves only those residues, holds the fold rigid",
  },
  {
    step: "Redesign",
    tool: "LigandMPNN",
    what: "new sequence for the tunnel lining",
  },
  {
    step: "Refold",
    tool: "RF3",
    what: "folds each design with heme and substrate",
  },
  {
    step: "Measure again",
    tool: "CAVER",
    what: "rank by real change in bottleneck",
    key: true,
  },
];

/** What a run needs, by how much hardware you have. */
const TIERS = [
  {
    title: "A laptop",
    body: (
      <>
        The whole measurement half: pocket detection, tunnel geometry,
        clustering, every analysis script, and the full test suite.
      </>
    ),
  },
  {
    title: "One GPU",
    body: (
      <>
        The complete design pipeline, stage by stage, with{" "}
        <code>run_local.py</code>. No scheduler needed.
      </>
    ),
  },
  {
    title: "An LSF cluster",
    body: (
      <>
        The same stages submitted as job arrays for scale. On SLURM, run{" "}
        <code>run_local.py</code> inside an allocation.
      </>
    ),
  },
];

/** Each design decision with the thing it cost us. A decision stated without
 *  its downside is not something a reader can act on. */
const TRADEOFFS = [
  {
    title: "Rank by measured geometry, not model confidence",
    why: "a model’s confidence in a structure says nothing about whether the tunnel through it is wider. Ranking by pLDDT would have selected for designs that fold predictably, which is not what we wanted.",
    cost: "a CAVER run per design, which is minutes of CPU each and the slowest part of scoring. We accept the wall-clock for a number that means what it says.",
  },
  {
    title: "The gate fails open",
    why: "it runs unattended inside a queued job chain. A filter that can fail closed can silently discard an entire run, hours after you stopped watching.",
    cost: "a run with CAVER missing completes and looks normal while having skipped its own central idea. The gate says so loudly in the log, and the first thing to check on a disappointing run is whether it actually ran.",
  },
  {
    title: "Measure apo, even though designs are folded holo",
    why: "a bound substrate costs about 0.45 Å of apparent bottleneck radius, while the real spread across three reference crystals is 0.077 Å. Comparing a holo design against an apo crystal measures the ligand, not the design — the artifact is roughly six times the signal.",
    cost: "the number we report is not the tunnel the substrate actually travels through. It is the one that can be compared across structures, which is the only thing a ranking needs.",
  },
  {
    title: "Three config layers instead of one file",
    why: "it is what lets an experiment be published while the filesystem stays private, and what made this repository publishable at all — the working tree it came from had one contributor’s user id in it over five thousand times.",
    cost: (
      <>
        three places to look when a path is wrong instead of one. A{" "}
        <code>--check</code> subcommand exists specifically to collapse them
        back into one report.
      </>
    ),
  },
  {
    title: "Two drivers for one pipeline",
    why: "a single-GPU user should not have to understand LSF, and a cluster user should not run two hundred designs in series.",
    cost: "they drifted apart three separate times — a stage present in one and not the other, a flag documented but only implemented in one, and two pilots that tested different things. All three were real bugs. The test suite now asserts the two expose the same stages, which is a patch over a design that would be better as one shared definition. It is written down as open work rather than claimed as finished.",
  },
  {
    title: "No SBOL, and no genetic-circuit standards",
    why: "this is structural tooling. Its vocabulary is atoms, chains, residue numbers and ligand codes, and the standards that matter for that are PDB, mmCIF, FASTA and SMILES — all of which it reads and writes.",
    cost: "it does not plug into the synthetic-biology tool ecosystem the way a circuit-design tool would. Claiming SBOL support would be easy and false, so we say plainly that there is none.",
  },
];

/** The repository line, which opens the page and closes it. */
function RepoBar({ label }: { label: string }) {
  return (
    <div className="sw-repo">
      <span className="sw-repo-label">{label}</span>
      <code>
        <a href={REPO}>gitlab.igem.org/2026/software/dtu-denmark/channel-design</a>
      </code>
      <span className="sw-repo-meta">Apache-2.0 · Python</span>
    </div>
  );
}

export function Software() {
  // Constant light-blue page background across the Model section (removed on
  // unmount). Rule lives in model.css but Vite emits one global CSS bundle.
  useEffect(() => {
    document.body.classList.add("model-bg");
    return () => document.body.classList.remove("model-bg");
  }, []);

  return (
    <>
      <div className="page-container">
        <TOC pages={MODEL_PAGES} activeKey="software" />

        {/* The hero (pages.ts) already says "Software" — the name of the
            deliverable. This names the thing the page is ABOUT, the way
            Discovery and Engineering name theirs, so the two do not repeat. */}
        <PageTitle title="channel-design" />

        <div className="page-start row mt-4">
          <NumberedFigures className="col-lg-12">
            {/* ---------------------------------------------------------------- */}
            <section id="software-what-it-is">
              <SectionHeading title="What it is" />

              <RepoBar label="Repository" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  A substrate only reacts if it can physically reach the active
                  site. In unspecific peroxygenases (UPOs) that journey runs
                  through a narrow tunnel to the heme, and for a bulky substrate
                  the tunnel &mdash; not the chemistry &mdash; is what stops the
                  reaction. The constriction we started from is under
                  1&nbsp;&Aring; in radius.
                </p>
              </TextBox>

              <div data-fig="profile">
                <ChannelProfileFigure />
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  <strong>
                    channel-design measures that tunnel and then uses the
                    measurement to redesign it.
                  </strong>{" "}
                  The tunnel geometry chooses which residues are allowed to
                  move, rejects candidate backbones before they cost GPU time,
                  and scores the finished designs. The loop closes on a physical
                  measurement rather than on a model&rsquo;s own confidence in
                  itself.
                </p>
              </TextBox>

              <ul className="sw-flow">
                {FLOW.map((f) => (
                  <li
                    key={f.step}
                    className={f.key ? "sw-flow-key" : undefined}
                  >
                    <span className="sw-flow-step">{f.step}</span>
                    <span className="sw-flow-tool">{f.tool}</span>
                    <span className="sw-flow-what">{f.what}</span>
                  </li>
                ))}
              </ul>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Two supporting tools come with it: a batch driver for{" "}
                  <strong>Boltz-2</strong> (holo structures and binding affinity
                  from sequence alone) and a command-line wrapper for{" "}
                  <strong>AutoDock Vina</strong>. The results this produced for
                  our own enzymes are on the{" "}
                  <Link to="/model-engineering">Engineering</Link> page; the
                  CAVER method itself is described on{" "}
                  <Link to="/model-methods">Methods</Link>.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-architecture" className="mt-5">
              <SectionHeading title="How it is put together" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Eight stages run in order. Three of them are expensive &mdash;
                  they want a GPU and a model checkpoint &mdash; and the rest
                  are cheap enough for a laptop. The design of the tool is
                  almost entirely about{" "}
                  <em>
                    where the cheap measurement sits relative to the expensive
                    stages
                  </em>
                  .
                </p>
              </TextBox>

              <div data-fig="architecture">
                <ArchitectureFigure />
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  It sits in the middle, at stage&nbsp;3. A diffusion model
                  handed a narrow tunnel will sometimes close it completely, and
                  no amount of sequence design reopens a channel that is not
                  there. Measuring each candidate backbone before it reaches the
                  two most expensive stages means a failure costs a minute of
                  CPU instead of hours of GPU. Running the same measurement{" "}
                  <em>after</em> the pipeline &mdash; the obvious place for it
                  &mdash; would have told us the same thing and charged us for
                  the privilege.
                </p>
                <p className="mm-prose">
                  The gate <strong>fails open</strong>. If CAVER is not
                  installed, or Java is missing, or no baseline has been
                  measured, it says so and passes every backbone through, which
                  is exactly how the pipeline behaved before the gate existed. A
                  filter running unattended inside a queued job chain should
                  never be able to quietly delete a run; the worst it does here
                  is stop being an optimisation.
                </p>
                <p className="mm-prose">
                  What a run needs is split three ways, shown along the top of
                  Figure <FigNum of="architecture" />. The{" "}
                  <strong>experiment</strong> &mdash; which enzyme, which
                  residues may move, which substrate &mdash; is in version
                  control and publishable. The <strong>machine</strong> &mdash;
                  checkpoints, queues, scratch space &mdash; is one file with
                  environment overrides. Your own paths are a third file that is
                  never committed. That separation is why the configs in the
                  repository can be read by anyone without exposing the
                  filesystem they ran on, and why moving to a different cluster
                  is one file rather than thirty.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-validation" className="mt-5">
              <SectionHeading title="What we found by testing it" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The result we would most like other teams to take away is not
                  the enzyme. It is that{" "}
                  <strong>
                    two artifacts in the standard way of comparing protein
                    tunnels were each larger than the effect we were trying to
                    measure.
                  </strong>{" "}
                  We found both by measuring the same structure twice and
                  getting different answers. Anyone comparing tunnels with CAVER
                  is exposed to them (Table <TabNum of="artifacts" />
                  ).
                </p>
              </TextBox>

              <PartsTable
                columns={ARTIFACT_COLUMNS}
                data={ARTIFACT_ROWS}
                numberId="artifacts"
                caption="The two measurement artifacts, each next to the real difference it has to be seen against."
              />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The first is roughly <strong>six times</strong> the difference
                  between real structures. Every comparison made before we found
                  it was measuring how much of the tunnel the substrate filled,
                  not how wide the protein&rsquo;s tunnel was. The clearest
                  illustration is MroUPO: measured with its docked substrate it
                  looks like 0.745&nbsp;&Aring;, and measured apo it is
                  1.058&nbsp;&Aring; &mdash; the widest tunnel we measured. The
                  same structure, read two ways, answers &ldquo;does this enzyme
                  need widening?&rdquo; opposite ways.
                </p>
                <p className="mm-prose">
                  Both are now enforced in code rather than left to whoever runs
                  it: the substrate is stripped by default, every structure is
                  staged under one constant filename, and the scripts refuse to
                  compare a baseline measured one way against designs measured
                  the other.
                </p>
              </TextBox>

              <SubsectionHeading title="Benchmark against public crystals" />
              <TextBox className="model-prose">
                <p className="mm-prose">
                  Measured apo, one protocol throughout. The three references
                  are public PDB entries, so the numbers in Table{" "}
                  <TabNum of="bench" /> can be checked against data we did not
                  generate.
                </p>
              </TextBox>

              <PartsTable
                columns={BENCH_COLUMNS}
                data={BENCH_ROWS}
                numberId="bench"
                caption="Bottleneck radius of every structure we measured, narrowest first. Ours are in bold."
              />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  That the parent falls inside the range spanned by three
                  independent crystal structures is what tells us the
                  measurement is calibrated at all. The best design is wider
                  than all three, at pLDDT&nbsp;0.96.
                </p>
              </TextBox>

              <div className="sw-caveat">
                <strong>What this does not show.</strong> Every number on this
                page is computational; no design has been expressed or assayed.
                The twenty designs measured so far all come from one backbone
                and are therefore correlated rather than representative, and the
                full 174-design rescore is unfinished. The ceiling is also not
                geometric: the constriction in our parent is formed by two{" "}
                <em>catalytic</em> residues, so widening much further means
                touching the active site.
              </div>

              <SubsectionHeading title="Software testing" />
              <TextBox className="model-prose">
                <p className="mm-prose">
                  The repository carries a test suite that runs in seconds on a
                  laptop &mdash; no GPU, no cluster, no model weights, no
                  network &mdash; because the parts a reviewer cannot run are
                  not the parts worth testing. It covers the data contract
                  between components, every shipped configuration, the
                  cross-component path resolution, and two regression guards
                  written against reproduced failures.
                </p>
              </TextBox>

              <DetailsBox label="More details on what the tests protect">
                <PartsTable
                  columns={TEST_COLUMNS}
                  data={TEST_ROWS}
                  showHeaders={false}
                />
              </DetailsBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-using-it" className="mt-5">
              <SectionHeading title="Using it" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  You do not need our cluster, and for a large part of it you do
                  not need a GPU.
                </p>
              </TextBox>

              <div className="sw-tiers">
                {TIERS.map((t) => (
                  <div className="sw-tier" key={t.title}>
                    <h4>{t.title}</h4>
                    <p>{t.body}</p>
                  </div>
                ))}
              </div>

              <SubsectionHeading title="Installing it" />
              <TextBox className="model-prose">
                <p className="mm-prose">
                  One script, and it does not need conda. It installs{" "}
                  <a href="https://docs.astral.sh/uv/">uv</a> if you do not have
                  it (asking first), installs every Python dependency from a
                  committed lockfile so the versions are exactly ours, downloads
                  CAVER&nbsp;3.0 from its authors and checks it against a
                  SHA-256, builds fpocket from source, and checks for a JDK
                  without installing one.
                </p>
              </TextBox>

              <div className="sw-cmd">
                <code>
                  git clone {"<repo>"} &amp;&amp; cd channel-design
                  <br />
                  ./setup.sh{" "}
                  <span className="sw-comment">
                    # add --gpu for the design stages
                  </span>
                </code>
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Model checkpoints are deliberately <em>not</em> downloaded
                  unless you ask with <code>--weights</code>: they are tens of
                  gigabytes and are usually already on a shared filesystem.
                  Point at the copy you have instead of fetching another. Then
                  check what the install actually found &mdash; thirty seconds,
                  and it is the difference between a clean start and discovering
                  a missing checkpoint mid-run.
                </p>
              </TextBox>

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
                missing and how to supply it. The two failures here are
                expected: this machine measures tunnels and does not run the
                design stages, and <code>--check</code> is explicit about that
                rather than failing at the first missing file.
              </p>

              <SubsectionHeading title="A run, start to finish" />
              <TextBox className="model-prose">
                <p className="mm-prose">
                  The shape of it is{" "}
                  <em>
                    measure &rarr; pilot &rarr; commit &rarr; re-measure &rarr;
                    explain
                  </em>
                  . The expensive step is guarded on both sides.
                </p>
              </TextBox>

              <div className="sw-cmd">
                <code>
                  <span className="sw-comment">
                    # 0. measure the parent: writes the tunnel-lining residues
                    and your baseline
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
                  {
                    text: "Running CAVER (this takes a minute)...",
                    kind: "dim",
                  },
                  {
                    text: "Substrate : UNL — stripped (measuring apo)",
                    kind: "dim",
                  },
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
                  {
                    text: "  sidechain-lining (20) : [52, 85, 86, 88, 89, 92, ...]",
                  },
                  { text: "  backbone-only     (7) : [90, 94, 204, 209, ...]" },
                  {
                    text: "  -> FLEXIBLE_RESIDUES (27) : [52, 85, 86, 88, 89, 90, ...]",
                    kind: "key",
                  },
                  { text: "" },
                  { text: "Wrote:", kind: "head" },
                  { text: "  ..._flex.json        the residues, ready to paste" },
                  {
                    text: "  ..._baseline.json    what designs are compared against",
                  },
                  {
                    text: "  ..._channel.pdb      the tunnel, as placeholder atoms",
                  },
                ]}
              />
              <p className="mm-prose sw-figcap">
                Real output on the structure bundled with the repository, and
                the one command worth running if you try nothing else. The three
                numbers at the top are the same ones in Figure{" "}
                <FigNum of="profile" />; a reader can reproduce them in about a
                minute on a laptop, which is why they are quoted here rather
                than described.
              </p>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  <strong>
                    Step 0 is the one that makes the tool worth using.
                  </strong>{" "}
                  It answers the hardest question in this kind of design work
                  &mdash; which residues should I allow to change? &mdash; from
                  measured geometry instead of intuition, and records the
                  baseline the designs will be judged against.
                </p>
                <p className="mm-prose">
                  <strong>
                    Step 1 exists because the full run is expensive.
                  </strong>{" "}
                  One backbone tells you whether the tunnel opens at all. If it
                  does not open here it will not open across two hundred
                  designs, so you retune cheaply rather than discovering it a
                  day later.
                </p>
                <p className="mm-prose">
                  Three further scripts explain <em>why</em> a design worked:
                  overlaying tunnel profiles, clustering designs by tunnel shape
                  rather than by a single number, and naming the residues
                  physically blocking the tunnel. That last one is how we
                  learned our ceiling was catalytic &mdash; a conclusion the
                  tool handed us rather than one we assumed.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-reuse" className="mt-5">
              <SectionHeading title="Reusing it for another enzyme" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Nothing in the method is specific to peroxygenases. A Boltz-2
                  job is a short YAML file with a placeholder for the sequence
                  and cofactors named by their standard PDB codes, so heme,
                  copper, zinc, NAD and FAD all work the same way. One of the
                  three bundled templates sets up four copper ions for
                  multicopper oxidases, which is our evidence that it
                  generalised past heme enzymes before we claimed it would.
                </p>
                <p className="mm-prose">
                  To point the pipeline at your own enzyme you supply a prepared
                  structure, let step&nbsp;0 choose the flexible residues, and
                  set your substrate as a SMILES string. Machine-specific paths
                  &mdash; checkpoints, queues, scratch directories &mdash; live
                  in one file with environment-variable overrides, so adopting
                  it does not mean editing the science.
                </p>
                <p className="mm-prose">
                  If you only want the measurement, take that: the CAVER wrapper
                  with the two protocol fixes above is useful to anyone
                  comparing enzyme tunnels, needs no GPU and no model weights,
                  and does not require you to adopt the design pipeline at all.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-standards" className="mt-5">
              <SectionHeading title="Standards, formats and integration" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  <strong>
                    This project does not use SBOL, and we are not going to
                    claim that it does.
                  </strong>{" "}
                  SBOL describes genetic parts and how they compose; it has no
                  representation for the bottleneck radius of a substrate tunnel
                  or for &ldquo;these twenty-two residues may move during
                  diffusion&rdquo;. The DNA encoding our designs is real and
                  standards-described, but it lives in our parts entries, not in
                  this tool.
                </p>
                <p className="mm-prose">
                  What is true, and what actually matters for reuse, is that{" "}
                  <strong>
                    every interface is a community-standard format and none of
                    them is ours
                  </strong>{" "}
                  (Table <TabNum of="formats" />
                  ). That is the reason the four components chain together at
                  all, and the reason you can cut into the workflow at any point
                  with your own tools.
                </p>
              </TextBox>

              <PartsTable
                columns={FORMAT_COLUMNS}
                data={FORMAT_ROWS}
                numberId="formats"
                caption="Every format the pipeline reads or writes at a component boundary. All of them are community standards; none were invented here."
              />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Tables are addressed{" "}
                  <strong>by column name, never by position</strong>, and a
                  script that cannot find a column it needs exits with an error
                  listing the columns it did find. The one place two components
                  meet is a CSV: the Boltz-2 driver writes an accession, a
                  confidence and a predicted affinity, and the tunnel clustering
                  joins on the accession. Because that contract is a file and
                  not a function call,{" "}
                  <strong>
                    any affinity predictor can be substituted for Boltz-2
                  </strong>{" "}
                  &mdash; emit those three columns and nothing else changes. A
                  test runs that join on fixture data so it cannot drift.
                </p>
                <p className="mm-prose">
                  Public identifiers are consumed rather than reinvented: RCSB
                  accessions (5FUJ, 5OXU and 9HE9 are appended to every
                  clustering run as calibration anchors), UniProt and NCBI
                  accessions, CUPP clade assignments, and SignalP&nbsp;6.0 for
                  trimming signal peptides.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-tradeoffs" className="mt-5">
              <SectionHeading title="Design choices, and what they cost" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Every one of these was a decision with a downside. They are
                  worth stating with the downside attached, because a tool
                  described only by what it does well is not a description
                  anyone can act on.
                </p>
              </TextBox>

              <div className="sw-tradeoffs">
                {TRADEOFFS.map((t) => (
                  <div className="sw-tradeoff" key={t.title}>
                    <h4>{t.title}</h4>
                    <p>
                      <span className="sw-to-gain">Why:</span> {t.why}
                    </p>
                    <p>
                      <span className="sw-to-cost">Cost:</span> {t.cost}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-interfaces" className="mt-5">
              <SectionHeading title="How you call it" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  There is no web service and no REST API, and that is a
                  deliberate choice rather than an omission: every stage is a
                  command-line script that reads files and writes files, which
                  is what makes it composable with a scheduler, a Makefile, or
                  somebody else&rsquo;s pipeline. Three interfaces are stable
                  enough to build on.
                </p>
              </TextBox>

              <div className="sw-api">
                <div className="sw-api-item">
                  <h4>The command line</h4>
                  <p>
                    Every script takes <code>--help</code>. The two drivers take{" "}
                    <code>--check</code> (what is installed and resolvable) and{" "}
                    <code>--dry-run</code> (print every command, run nothing),
                    so a whole run can be inspected before anything is spent. A
                    test in the suite asserts that every flag named in the
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
                    tunnel in this PDB&rdquo;, that is the import, and it needs
                    no GPU and no model weights.
                  </p>
                </div>

                <div className="sw-api-item">
                  <h4>A CSV contract between the tools</h4>
                  <p>
                    The Boltz-2 driver writes{" "}
                    <code>accession, ligand_iptm, affinity_pred_value</code>;
                    the clustering script joins that against{" "}
                    <code>cluster_assignments.csv</code> on the file stem and
                    gates on <code>ligand_iptm &ge; 0.8</code>. That join is the
                    one place two separate tools in this repository have to
                    agree, so it is the one covered by a test that runs the real
                    code on fixtures.
                  </p>
                </div>
              </div>

              <TextBox className="model-prose">
                <p className="mm-prose">
                  <strong>
                    Deploying it means cloning it and running one script.
                  </strong>{" "}
                  There is nothing to host, no database, no service to keep up.
                  That is also why this page shows captured output rather than a
                  live demo: the iGEM wiki is served as static files, so a
                  button here could only call a server somewhere else &mdash;
                  and a page that is archived permanently should not depend on a
                  server that will not be.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-ai" className="mt-5">
              <SectionHeading title="AI models used" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  <strong>We trained nothing and fine-tuned nothing.</strong>{" "}
                  Every model in Table <TabNum of="models" /> is a published,
                  pre-trained network used as released, and none of their
                  weights are redistributed in our repository.
                </p>
              </TextBox>

              <PartsTable
                columns={MODEL_COLUMNS}
                data={MODEL_ROWS}
                numberId="models"
                caption="The four pre-trained networks the pipeline calls, and where each comes from."
              />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Their training data is not ours to characterise &mdash; all
                  four were trained by their authors, largely on the Protein
                  Data Bank, and the upstream projects are the authority on
                  composition and cut-off dates. What we supply at inference
                  time is our own prepared structures, alignments fetched from
                  the public ColabFold/MMseqs2 server, and substrate SMILES.
                </p>
                <p className="mm-prose">
                  <strong>How we evaluated them is the important part.</strong>{" "}
                  We did not evaluate them as models; we asked whether their
                  output was fit for one question &mdash; is the tunnel wider?
                  &mdash; and answered it with CAVER, a deterministic geometric
                  algorithm that does not share failure modes with the networks
                  that produced the structures. Model-reported confidence is
                  used only to decide which structures are worth measuring,
                  never as evidence that a design is better. Notably,{" "}
                  <strong>
                    our measurement was wrong before the models were.
                  </strong>
                </p>
              </TextBox>

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
                    about their absolute calibration on UPOs, a family unlikely
                    to be well represented in training data.
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
            <section id="software-related" className="mt-5">
              <SectionHeading title="How this relates to existing tools" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  Both halves of what we did are established fields on their
                  own. Tunnel analysis has a mature ecosystem &mdash; CAVER,
                  CaverDock and Caver&nbsp;Web detect tunnels and can simulate a
                  ligand travelling through one. Generative enzyme design has
                  another: RFdiffusion and LigandMPNN pipelines routinely filter
                  candidates in the loop.
                </p>
                <p className="mm-prose">
                  The filters in those design pipelines are about active-site
                  motif geometry and whether the fold is self-consistent. We are
                  not aware of one that uses{" "}
                  <strong>
                    tunnel bottleneck radius as the design objective
                  </strong>{" "}
                  &mdash; to select the residues to free, to reject backbones
                  before they reach the expensive stages, and to rank the
                  finished designs. Joining those two worlds is the
                  contribution, and our tunnel analysis is a batch wrapper
                  around CAVER rather than a new method for finding tunnels.
                </p>
              </TextBox>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section id="software-for-future-teams" className="mt-5">
              <SectionHeading title="For whoever picks this up" />

              <TextBox className="model-prose">
                <p className="mm-prose">
                  The stage scripts are numbered in the order they run and each
                  one works on its own. Configuration is deliberately layered:
                  what the experiment <em>is</em> in one file, what the{" "}
                  <em>machine</em> is in another, and personal overrides in a
                  third that is never committed &mdash; so publishing an
                  experiment never publishes somebody&rsquo;s home directory,
                  and moving to a new cluster is one file rather than thirty.
                </p>
                <p className="mm-prose">
                  The repository also carries the things that usually go
                  unwritten: a record of seven traps that each cost us a run,
                  with the commands to verify them; a laboratory notebook of
                  what was tried and abandoned and why; and an honest account of
                  what is still unfinished. If you read one file before changing
                  anything, read the known-issues list.
                </p>
              </TextBox>

              <RepoBar label="Source, docs and tests" />
            </section>

            {/* Bottom prev/next navigation (Engineering ← Software) */}
            <ModelPager active="software" />
          </NumberedFigures>
        </div>
      </div>
    </>
  );
}
