# BAGEL mini-enzymes — how to use it on the DTU HPC

I installed this for the BioBuilders project. This guide covers how to run it
on your own target. Ask me if anything here doesn't work.

Everything lives in one folder:

```
/work3/s215098/BioBuilders2026/software/bagel-project/
```

Nothing was installed into anyone's home directory. If we ever need to start
over, deleting that folder removes the whole thing.

---

## 1. What BAGEL actually does

It shrinks proteins. You give it a wild-type sequence and a list of residues
that must not change (catalytic residues, metal ligands, whatever your enzyme
needs). It then runs a Monte Carlo search: propose a random deletion, insertion
or substitution somewhere in the mutable regions, score it, keep it if the score
improved, mostly reject it if not. Repeat thousands of times.

The score has two parts:

| Term | Weight | What it does |
|---|---|---|
| `embeddings_similarity` | 1.0 | keep the ESM-2 embedding close to wild-type |
| `chem_pot` | 0.001 | penalise length — this is what makes it shrink |

**Important: no structure is used in the search.** ESM-2 is a protein language
model, not a folding model. It takes a sequence and returns an embedding — a
vector describing what the model "understands" about each position. Low drift
from wild-type means the model still recognises the sequence as doing the same
job. That's a proxy for "still folds and still works", and it's a cheap one
(~25 ms per candidate), which is why we can afford 100,000 of them.

The PDB file is read once at the start, only to get the reference sequence and
work out which residues to freeze. After that it's pure sequence manipulation.

Because it's only a proxy, **a BAGEL output is a hypothesis, not a result.**
Designs have to be folded (Boltz / ESMFold / Chai-1) and checked for whether the
active site survived, then ideally run through MD. That's stages 2 and 3 and
we haven't built them yet.

---

## 2. Setup — every single time

```bash
source /work3/s215098/BioBuilders2026/software/bagel-project/env.sh
```

Use the **full path**. Every new SSH session, and every time you jump to a GPU
node with `voltash`, you get a fresh shell where the shortcut variables don't
exist yet. This is the single most common way to get confusing errors.

That one line strips conda off your PATH (it would otherwise shadow our Python)
and points all the model caches at `/work3` instead of your home directory,
which has a small quota. It downloads nothing and changes nothing permanent.

After sourcing you have `$BB_ROOT` (the project folder) and `$BAGEL_ROOT` (the
cloned repo) as shortcuts.

---

## 3. Setting up your own target

### Make a folder and copy the template

```bash
mkdir -p /work3/s215098/BioBuilders2026/<yourname>/bagel/<target>
cd /work3/s215098/BioBuilders2026/<yourname>/bagel/<target>
cp $BAGEL_ROOT/scripts/mini-enzymes/{petase.py,utils.py} .
mv petase.py <target>.py
```

Copy `utils.py` too — the script imports from it directly and will fail without
it sitting alongside.

Work in **your own folder**, not the repo. Output is written relative to wherever
you run from, so this keeps your results separate from everyone else's and out
of the shared git clone.

### Work out your numbering offset

This is the part that will silently ruin your run if you get it wrong.

PDB residue numbers rarely start at 1. The script converts residue numbers to
sequence positions by subtracting an offset, so you need the residue number of
the **first residue with coordinates**:

```bash
grep "^ATOM" YOURPDB.pdb | head -1
grep "^ATOM" YOURPDB.pdb | tail -1
```

Read the residue number out of columns 23–26. For CueO/1KV7 that gave 31 and
516, so `offset = 31`, range `31..516`.

Also check for **internal gaps** — residues in SEQRES with no coordinates:

```bash
grep "^REMARK 465" YOURPDB.pdb
```

BAGEL fills these from the FASTA, so the numbering stays continuous and the
offset still works. But those filled residues are mutable and unprotected, so
expect them to be deleted early.

**Warning about numbering gaps.** Some structures (e.g. deletion mutants like
2YXV) keep the wild-type numbering across a deletion, so the numbers jump. If
your PDB does that, the simple `residue - offset` formula breaks and you need a
piecewise mapping. Check with:

```bash
grep "^ATOM" YOURPDB.pdb | awk 'substr($0,22,1)=="A"{print substr($0,23,4)+0}' \
  | sort -nu | awk 'NR>1 && $1!=p+1 {print "GAP: "p" -> "$1} {p=$1}'
```

No output means you're fine.

### Edit five things in your script

```python
log_path = pl.Path("./logs") / 'mini-enzymes' / '<target>'    # line ~27
offset = 31                                                   # your offset
full_sequence = get_sequence_from_pdb_id(pdb_id="1kv7", ...)  # your PDB ID
chain_atoms = ... fetch("1kv7", format="pdb") ...             # your PDB ID
chain_atoms = get_atomarray_in_residue_range(chain_atoms, start=offset, end=516)
```

Then the two residue lists. **They must be in the same order** — the script
checks them against each other positionally.

```python
crucial_residues_indices = [101, 103, 112, 139, 141, 143, 439, 443, 444,
                            446, 448, 499, 500, 501, 502, 505, 506, 510]
```

```python
expected_crucial_residues = [
    "His101", "His103", "Asp112", "Trp139", "His141", "His143",
    "Asp439", "His443", "Pro444", "His446", "His448",
    "His499", "Cys500", "His501", "Leu502", "His505",
    "Glu506", "Met510"
]
```

Sort both ascending by residue number and you can't get them out of sync.

**The buffer is automatic.** You only list the crucial residues themselves —
the script freezes 4 residues either side of each one. Overlapping buffers
merge. For CueO, 18 residues became 66 conserved positions.

### Where to get your crucial residues

Not from the software. This is your job as the biologist. Sources:

- The `LINK` records in the PDB file (metal coordination)
- The `SITE` records (depositor-annotated functional sites)
- The literature on your enzyme's mechanism

```bash
grep "^LINK" YOURPDB.pdb
grep "^SITE" YOURPDB.pdb
```

Err on the side of freezing too much. Freezing something unnecessary costs you a
slightly larger final protein. Freezing too little costs you a dead enzyme you
don't find out about until the bench.

---

## 4. Running it

### Test run first — always

```bash
voltash
source /work3/s215098/BioBuilders2026/software/bagel-project/env.sh
cd /work3/s215098/BioBuilders2026/<yourname>/bagel/<target>
$BAGEL_ROOT/.venv/bin/python <target>.py --use_modal=False --n_steps=20
```

Use `$BAGEL_ROOT/.venv/bin/python`, **not** `uv run` — uv looks for a project
file in the current directory and won't find one in your folder.

Three things to check in the output:

1. **No assertion error.** The script validates every crucial residue against
   both your expected list and the actual structure. If your offset or residue
   numbers are wrong, it stops and tells you exactly which one. This is your
   safety net — take it seriously if it fires.
2. **`Number of conserved residues: N`** — sanity-check the number.
3. It reaches `Step=20`.

Two things that look alarming but are fine:

- **Hundreds of `Mismatch between PDB and sequence` warnings.** These appear
  when the FASTA and the coordinates are offset from each other (usually
  unobserved residues at the N-terminus). The PDB residue always wins, so the
  sequence used is correct. Only the gap-filled residues get slightly wrong
  identities, and those are unprotected anyway.
- **A help page appearing at the end.** That's the script *finishing* — it
  returns an object that `fire` doesn't know how to print, so it dumps
  documentation. Press `q`. Not an error.

### Then a probe run

Don't jump straight to 100,000 steps. Run 2,000 first (~90 seconds) and look at
how fast it's shrinking:

```bash
$BAGEL_ROOT/.venv/bin/python <target>.py --use_modal=False \
    --n_steps=2000 --experiment_name=<target>_probe

tail -5 logs/mini-enzymes/<target>/<target>_probe/best/energies.csv
```

The third column is the residue count. Compare against your starting length.

- **Barely moved?** The `chem_pot` weight is too low for your protein. Raise it.
- **Collapsed?** Too high. Lower it — change `weight=1e-3` to `1e-4` around
  line 108.
- **Decelerating toward a plateau?** Good. Scale up.

For CueO, 486 → 314 in 2,000 steps looked alarming until we noticed the rate had
dropped to roughly one deletion per forty steps by the end — it was converging,
not crashing. Look at the *rate*, not just the total.

The right weight depends on your protein's size and how tolerant its embedding
is. The paper's 0.001 is a starting point, not a universal value.

### Production run

Timing scales with sequence length — roughly 0.025 s/step at 263 aa, 0.07 s at
486 aa. So 100k steps is somewhere between 45 minutes and 2 hours.

Save as `<target>.lsf`:

```bash
#!/bin/bash
#BSUB -J <target>
#BSUB -q gpuv100
#BSUB -gpu "num=1:mode=exclusive_process"
#BSUB -n 4
#BSUB -R "rusage[mem=16GB]"
#BSUB -R "span[hosts=1]"
#BSUB -W 4:00
#BSUB -o /work3/s215098/BioBuilders2026/<yourname>/bagel/<target>/logs/%J.out
#BSUB -e /work3/s215098/BioBuilders2026/<yourname>/bagel/<target>/logs/%J.err

source /work3/s215098/BioBuilders2026/software/bagel-project/env.sh
export HF_HUB_OFFLINE=1

cd /work3/s215098/BioBuilders2026/<yourname>/bagel/<target>
$BAGEL_ROOT/.venv/bin/python <target>.py --use_modal=False \
    --n_steps=100000 --experiment_name=<target>_run1
```

```bash
mkdir -p logs
bsub < <target>.lsf
bstat                 # check on it
```

Always pass `--experiment_name`. Without it the run gets a timestamp name and
you can't resume it.

**Etiquette:** `voltash` gives you an interactive GPU shared with other people.
Use it for short tests only, and `exit` when you're done. Real runs go through
`bsub`.

---

## 5. Reading the output

```
logs/mini-enzymes/<target>/<experiment_name>/
├── best/           <- lowest-energy sequence found
│   ├── state_A.fasta        every improvement, appended
│   ├── state_A.mask.fasta   'I' marks conserved positions
│   └── energies.csv
├── current/        <- where the walk is now
├── config.csv      <- the energy terms and weights used
└── optimization.log
```

Final sequence:

```bash
tail -2 logs/mini-enzymes/<target>/<experiment_name>/best/state_A.fasta
```

`energies.csv` columns: step, embedding drift, residue count, state energy,
system energy.

Note the FASTA is **cumulative** — each entry is a snapshot at the step where
the energy improved. The last one is the best.

### Check where the deletions landed

Total residues lost tells you much less than *where* they came from. Pick some
short motifs around your crucial residues from the wild-type sequence and test
whether they survived:

```python
for motif in ['TTLHWHGLEVPGEVD', 'CWFHPHQH', 'DMMLHPFHIHG']:
    print('PRESENT' if motif in design else 'MISSING', motif)
```

Then measure the spacing between them in wild-type versus design. For CueO this
showed 143 of 172 deletions came from one region — the copper-free domain —
with zero deletions between any pair of copper ligands. That's a much more
interesting result than "35% smaller", and it's the kind of thing worth checking
before you fold anything.

---

## 6. What happens next

Stage 1 is all we have running. The full pipeline from the paper is:

1. **BAGEL Monte Carlo** ← we are here
2. **Structural filter** — fold designs with ESMFold, Chai-1, Boltz-2; keep
   those where the active-site geometry is preserved across all three
3. **MD** — check the survivors are actually stable

Stage 2 isn't built. Boltz is already installed somewhere in
`software/boltz2_env`, so the quickest version is: fold your designs, check
pLDDT, then measure distances between your catalytic residues and compare
against the wild-type crystal structure. High confidence alone is **not**
sufficient — a design can fold beautifully into something with a wrecked active
site.

Note that ESMFold is ESM-2 with a folding head bolted on, so its verdict isn't
fully independent of the embedding that generated the design. Chai-1 and Boltz
are architecturally independent and therefore the more informative votes.

---

## 7. Things that will trip you up

| Symptom | Cause |
|---|---|
| `No module named 'bagel'` | used `uv run` instead of `$BAGEL_ROOT/.venv/bin/python`, or didn't source `env.sh` |
| `cannot stat '/scripts/...'` | `$BAGEL_ROOT` empty — source `env.sh` with the full path |
| A help page appears | the run **finished**; press `q` |
| Hundreds of mismatch warnings | normal, see above |
| `AssertionError: Residue identity mismatches` | your offset or residue numbers are wrong — read which position it names |
| `(base)` in your prompt | conda is back; source `env.sh` again |
| Protein collapses to almost nothing | `chem_pot` weight too high for your protein's size |

---

## 8. Technical notes

- Python 3.12, torch 2.6.0+cu124, boileroom 0.2.2, ESM-2 650M
- `--use_modal=False` runs locally on the node's GPU. Modal is a cloud service
  we don't use and don't have credentials for.
- No containers needed. Apptainer isn't available on DCC, but boileroom 0.2.2
  (which the lockfile pins) still supports local execution, so it doesn't matter.
- Model weights are pre-downloaded and verified to load offline, so batch jobs
  don't need internet.
- The venv hardcodes absolute paths — **don't move or copy the project folder.**
- Chai-1's weights are non-commercial licence. Fine for our academic work.

Ask me if you get stuck.
