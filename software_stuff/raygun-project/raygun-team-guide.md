CLAUDE WROTE THIS BTW

# Raygun — how to use it on the DTU HPC

Installed 26 Aug 2026 for the BioBuilders project, alongside BAGEL, so we can
compare two approaches to shrinking the same enzyme. Ask me if anything here
doesn't work.

Everything lives in one folder, separate from BAGEL:

```
/work3/s215098/BioBuilders2026/software/raygun-project/
```

Nothing was installed into anyone's home directory. Deleting that folder
removes the whole thing. BAGEL is untouched and has its own environment.

---

## 1. What Raygun actually does

It shrinks proteins, like BAGEL, but by a completely different route.

BAGEL walks: propose a deletion, score it, keep or reject, repeat 100,000
times. Raygun doesn't search at all. It encodes your template protein into a
fixed-length representation, adds a controlled amount of noise, and decodes it
back out at whatever length you asked for. One shot, about half a second per
candidate. Then it generates a pile of them and keeps the best by
pseudo-log-likelihood (PLL) under ESM-2.

The practical consequences of that difference:

| | BAGEL | Raygun |
|---|---|---|
| Output per run | one optimised sequence | hundreds of candidates |
| Time | hours | minutes |
| Catalytic residues | **hard-frozen during the search** | **no constraint mechanism at all** |
| You control | which residues can't change | target length, noise level |

That third row is the one that matters. **Raygun cannot be told to preserve
your catalytic residues.** There is no equivalent of BAGEL's
`crucial_residues_indices`. It preserves what it preserves because the
representation captures the protein's character, and whether your active site
survived is something you measure *afterwards*, not something you specify.

So the workflow is generate-many-then-filter, and the filtering is your job as
the biologist. Same as BAGEL, **a Raygun output is a hypothesis, not a result** —
designs still need folding (Boltz / ESMFold / Chai-1) and checking.

One caveat worth keeping in mind when we compare the two: both tools sit on
ESM-2 650M. If BAGEL and Raygun agree on a design, that may just mean ESM-2
likes it. An independent verdict has to come from structure prediction.

---

## 2. Setup — every single time

```bash
source /work3/s215098/BioBuilders2026/software/raygun-project/env.sh
```

Use the **full path**. Every new SSH session and every `voltash` gives you a
fresh shell where `$RG_ROOT` doesn't exist yet.

That line strips conda off your PATH, points the model caches at `/work3`
instead of your home directory, and puts the Raygun commands on your PATH. It
downloads nothing and changes nothing permanent.

After sourcing you have `$RG_ROOT` (project folder), `$RAYGUN_ROOT` (the repo),
and the commands `raygun-sample-single`, `raygun-sample-multiple`,
`raygun-train`.

**Don't source this and BAGEL's `env.sh` in the same shell.** The Raygun one
refuses to load if it detects BAGEL's, because mixing them can let a package
install land in the wrong venv. One shell, one project.

---

## 3. Setting up your own target

### Make a folder

```bash
mkdir -p $RG_ROOT/work/<yourname>/<target>
cd $RG_ROOT/work/<yourname>/<target>
```

Work in your own folder, not the repo. Output goes wherever you point it, so
this keeps results separate and out of the shared git clone.

### Prepare the template FASTA

**One record per file.** `raygun-sample-single` takes the first record it finds
and ignores the rest, which is a silent way to design the wrong protein. If you
have a multi-record file, split it:

```bash
awk '/^>/{f=($0 ~ /<yourseq>/)} f' input.fasta > template.fasta
grep -c ">" template.fasta        # must print 1
```

Check the length, because every length argument you pass is relative to it:

```bash
awk '/^>/{if(s)print length(s); s=""; next}{s=s$0}END{print length(s)}' template.fasta
```

**Decide which sequence you mean.** For a PDB-derived target you have a choice:
the full deposited SEQRES, or only the residues with coordinates. BAGEL works
from the coordinate range (CueO: residues 31–516, 486 aa). If you want the
comparison to mean anything, feed Raygun the same 486 aa, or the two tools'
"35% smaller" won't refer to the same starting point. Write down which you used.

### Choose your length targets

Raygun needs a target length range, and this is where you have to be honest
about what the method has been shown to do. The paper demonstrates
miniaturization of EGFP and mCherry in the **10–15%** range. BAGEL's CueO probe
came out at 35% smaller. That's well outside demonstrated territory.

So run a ladder rather than one aggressive target — for CueO (486 aa):

| Range | Reduction | Why |
|---|---|---|
| 430–440 | ~10% | what the paper demonstrates |
| 405–415 | ~15% | upper end of demonstrated range |
| 310–320 | ~35% | matched to BAGEL's result |

If the aggressive one produces garbage, the ladder tells you whether that's a
Raygun limitation or a CueO one. Without it you can't distinguish those.

---

## 4. Running it

### The arguments that matter

Verified against `--help` on the installed version — the README's spelling is
inconsistent, so trust this table over the paper:

| Flag | What it does |
|---|---|
| `--model 8.8M` | which checkpoint. **Always pass this.** It's the only one we downloaded; anything else tries to fetch from the internet and a batch node has none |
| `--minlength` / `--maxlength` | target range. Both required |
| `--noiseratio` | 0–0.5. More noise, more diversity, less like the template. Start at 0.1 |
| `--num_raygun_samples_to_generate` | how many you keep **after** PLL filtering |
| `--sample_ratio` | underscore, not hyphen. How many are generated per one kept. Default 10 |
| `--randomize_noise` | picks a random noise level per sample, up to `--noiseratio` |
| `--device` | GPU index, or `-1` for CPU |
| `--penalizerepeats` | discourage repeated segments |
| `--finetune` | only if zero-shot reconstruction of your template is below 0.9 identity. Rarely needed on this model version |

So `--num_raygun_samples_to_generate 200 --sample_ratio 25` means 5,000
generated, 200 kept.

### Test run first — always

```bash
voltash
source /work3/s215098/BioBuilders2026/software/raygun-project/env.sh
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"

cd $RG_ROOT/work/<yourname>/<target>
raygun-sample-single --model 8.8M --minlength <min> --maxlength <max> \
    --noiseratio 0.1 --num_raygun_samples_to_generate 10 \
    template.fasta out_test/
exit
```

The CUDA line must print `True` and name the GPU. Then check the output — the
counts and the lengths, not just that it finished:

```bash
grep -c ">" out_test/filtered_*.fasta
awk '/^>/{if(s)print length(s); s=""; next}{s=s$0}END{print length(s)}' out_test/filtered_*.fasta
```

**Etiquette:** `voltash` is a shared interactive GPU. Short tests only, and
`exit` when you're done. Real runs go through `bsub`.

### Timing

Measured on a V100 with the 239 aa EGFP template: ~25 s to load the models,
then ~2.3 samples/s to generate and ~16/s to PLL-score. 100 samples took under
a minute end to end.

Scale by sequence length — CueO at 486 aa is roughly twice as slow per sample.
5,000 samples of a 486 aa protein should land around 40–60 minutes. Nothing
like BAGEL's multi-hour runs.

### Production run

Save as `$RG_ROOT/jobs/<target>.lsf`:

```bash
#!/bin/bash
#BSUB -J rg_<target>
#BSUB -q gpuv100
#BSUB -gpu "num=1:mode=exclusive_process"
#BSUB -n 4
#BSUB -R "rusage[mem=8GB]"
#BSUB -R "span[hosts=1]"
#BSUB -W 2:00
#BSUB -o /work3/s215098/BioBuilders2026/software/raygun-project/logs/<target>_%J.out
#BSUB -e /work3/s215098/BioBuilders2026/software/raygun-project/logs/<target>_%J.err

set -e
source /work3/s215098/BioBuilders2026/software/raygun-project/env.sh
nvidia-smi

cd $RG_ROOT/work/<yourname>/<target>

for RANGE in "430 440" "405 415" "310 320"; do
    set -- $RANGE
    raygun-sample-single --model 8.8M --minlength $1 --maxlength $2 \
        --noiseratio 0.1 --num_raygun_samples_to_generate 200 \
        --sample_ratio 25 template.fasta out_$1_$2/
done
```

```bash
bsub < $RG_ROOT/jobs/<target>.lsf
bstat
```

Notes on the BSUB block, since it differs from the CPU scripts we use for BLAST:

- The `-gpu` line is **mandatory**. Without it you get a GPU node but no GPU,
  and the job silently runs on CPU.
- `-n 4`, not 64. GPU nodes have ~20–24 cores and `-n 64` with
  `span[hosts=1]` will never schedule.
- `rusage[mem]` is **per core**, so this asks for 4 × 8 = 32 GB of host RAM.
  That's unrelated to the 16 GB of VRAM on the card.
- No `CUDA_VISIBLE_DEVICES` lines — LSF sets it, and the node banner asks us
  not to.
- All three length targets in one job, because each is only minutes.

---

## 5. Reading the output

Each run writes three files, named after the parameters used:

```
out_310_320/
├── filtered_0.1_200.fasta        <- the 200 you keep, PLL-filtered
├── unfiltered_0.1_5000.fasta     <- everything generated
└── unfiltered_0.1_5000.pll.tsv   <- PLL scores, for ranking
```

Careful measuring lengths: the FASTAs are hard-wrapped at 60 characters, so
`wc -c` or naive `awk` on lines gives you nonsense. Use:

```bash
awk '/^>/{if(s)print length(s); s=""; next}{s=s$0}END{print length(s)}' out_*/filtered_*.fasta
```

The `.pll.tsv` is worth keeping — it lets you rank designs beyond the filter,
and PLL is the only quality signal Raygun gives you internally.

---

## 6. Checking whether the active site survived

This is the part that matters, and it's entirely on us — Raygun does nothing
here.

**You cannot check by residue number.** Raygun's insertions and deletions shift
the numbering arbitrarily, so "position 101" in a design means nothing. You have
to align each design to the wild-type and ask what sits opposite each catalytic
residue. `check_conserved.py` (in `$RG_ROOT/scripts/`) does this with Biopython,
which is already installed:

```bash
python $RG_ROOT/scripts/check_conserved.py \
    --wt template.fasta \
    --designs out_310_320/filtered_0.1_200.fasta \
    --offset 31 \
    --residues 101,103,112,139,141,143,439,443,444,446,448,499,500,501,502,505,506,510
```

Use the same residue list and offset as the BAGEL run, so the two tools are
scored identically. It reports, per design, how many of your crucial residues
are present and correctly aligned, plus a summary.

**What to expect.** BAGEL preserves all of them because it's forbidden from
touching them. Raygun isn't, so the fraction of its candidates that happen to
keep the full set is itself the measurement — "Raygun retained all 18 copper
ligands in N of 200 candidates" is a real result and the most interesting number
we'll get out of this comparison.

After that, the same motif-spacing analysis from the BAGEL guide applies: pick
short motifs around the catalytic residues, check they survived, and measure the
spacing between them versus wild-type. Where the deletions landed matters far
more than how many there were.

---

## 7. What happens next

Same gap as BAGEL — stage 2 doesn't exist for either tool yet. The plan is to
fold survivors from both with ESMFold / Chai-1 / Boltz-2, keep the ones where
the active-site geometry holds across all three, then MD.

Because Raygun gives us hundreds of candidates cheaply where BAGEL gives one,
Raygun is the better source of the *diverse ensemble* the paper's stage 1 is
supposed to produce. That's an argument for using both rather than picking one.

---

## 8. Things that will trip you up

| Symptom | Cause |
|---|---|
| `raygun-sample-single: command not found` | didn't source `env.sh`, or sourced it with a relative path |
| `(base)` in your prompt | conda is back; source `env.sh` again |
| ERROR about the BAGEL env | you sourced both in one shell; open a fresh one |
| Tries to download a checkpoint in a batch job | you forgot `--model 8.8M`; batch nodes have no internet |
| Designed the wrong protein | your template FASTA had more than one record |
| Lengths look like 60 and 89 | you measured wrapped lines, not sequences |
| Job pending forever | `-n` too high for a GPU node, or wrong queue |
| Job ran but was slow, no GPU in `nvidia-smi` | missing the `#BSUB -gpu` line |
| CUDA out of memory | lower `--sample_ratio`; the ESM-2 PLL step is the memory hog |

---

## 9. Technical notes

- Python 3.11, torch **2.5.1**+cu124, fair-esm 2.0.0, numpy 1.26.4, raygun 0.2.5
- **torch is deliberately 2.5.1, not 2.6.0 like BAGEL.** fair-esm 2.0.0 calls
  `torch.load()` without `weights_only=False`, and torch 2.6 changed that
  default in a way that breaks loading ESM-2's checkpoint. Don't "upgrade" it.
- Raygun's `pyproject.toml` pins nothing, so `$RG_ROOT/requirements.lock` is our
  only record of a working environment. Reinstall from it, not from scratch.
- Model weights (2.5 GB ESM-2 + 3.1 GB Raygun) are pre-downloaded to
  `$TORCH_HOME` and verified to load offline.
- Installed editable (`uv pip install -e .`), so the clone in
  `$RAYGUN_ROOT` is the live source — edits take effect without reinstalling.
- The venv hardcodes absolute paths — **don't move or copy the project folder.**
- Licence: the README says CC-BY-NC-SA 4.0 with a carve-out permitting academics
  to commercialise derived molecules; `pyproject.toml` says MIT. They disagree.
  Assume the stricter one. Academic use at DTU is clearly fine.
- `/work3` is **not backed up**. Copy anything you care about elsewhere.

Ask me if you get stuck.
