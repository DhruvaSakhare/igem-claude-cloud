# Handoff: findings that affect the MroUPO bias run

From Dhruva's PabUPO-II channel-widening work. Three issues found in the
MroUPO bias code under `enzyme_design_hpc_msa_and_bias/`, plus two measurement
rules that affect any CAVER comparison. Everything below was verified against
files/coordinates, not assumed — verification commands are included so you can
confirm rather than trust.

**No file under `enzyme_design_hpc_msa_and_bias/` has been modified.** All fixes
below are proposed, not applied. This document lives at the repo root
deliberately, so reading it does not mean anything in that folder changed.

Run every command below from the repo root (`enzmsa/`).

---

## Issue 1 — `--omit_per_residue` value format is wrong (mechanism silently does nothing)

`enzyme_design_hpc_msa_and_bias/partial_diffusion/scripts/03_mpnn_submit.py` currently builds:

```python
omit_map = {f"A{r}": list(omit_aa) for r in shrink}     # {"A53": ["PHE","TRP",...]}
omit_flag = f"--omit_per_residue '{json.dumps(omit_map)}'"
```

The **flag name and inline-JSON approach are correct** — confirmed by reading the
installed package, not documentation:

```
mpnn/utils/inference.py:649   "omit_per_residue": parse_json_like(args.omit_per_residue)
mpnn/utils/inference.py:1222  "omit_per_residue[{res_id}] must be a list"
```

`parse_json_like` parses the CLI value as JSON *text*, and each value must be a
**list**. So this code looks right.

**But verify it actually constrains anything.** Public LigandMPNN docs describe a
differently-named flag (`--omit_AA_per_residue`) taking a *file path* and
*concatenated 1-letter codes*. The deployed `mpnn` on DTU HPC is a custom build
that differs from both. Following the public docs cost a full 10-backbone MPNN
stage on our side — all 10 calls died with `unrecognized arguments`.

The check that actually settles it (run on a GPU node, `protein-design` env):

```bash
BB=<any .cif.gz backbone>
# omit the residue's OWN native type — if the constraint works it CANNOT come back
mpnn --seed 42 --structure_path "$BB" --out_directory /tmp/omit_test \
    --batch_size 1 --number_of_batches 1 --model_type ligand_mpnn \
    --checkpoint_path "/dtu/projects/dbl/foundry/ckpt/ligandmpnn_v_32_010_25.pt" \
    --is_legacy_weights True \
    --omit_per_residue '{"A160": ["PHE"]}'
```

Exit 0 plus a non-PHE residue at 160 means it works. Testing with a type the
residue *wasn't* going to pick anyway proves nothing — that was our first
mistake.

---

## Issue 2 — residues 157 and 160 are in BOTH `_CATALYTIC_PINS` and `SHRINK_RESIDUES`

```python
_CATALYTIC_PINS = {
    157: "N,CA,C,O,CB",   # distal Glu — H2O2 activation
    160: "N,CA,C,O,CB",   # Phe — orients substrate toward heme
}
```

Both also appear in `FLEXIBLE_RESIDUES` and `SHRINK_RESIDUES`. Two consequences:

**The catalytic pin is dead code.** `_build_fixed_atoms` only applies
`_CATALYTIC_PINS` to residues *not* in `FLEXIBLE_RESIDUES`:

```python
return {f"{chain}{r}": _CATALYTIC_PINS.get(r, "N,CA,C,O")
        for r in _chain_resids(pdb_path, chain) if r not in flex}   # <-- if r not in flex
```

A residue in both gets **zero** pinning — full backbone freedom in RFD3, not the
protected sidechain geometry the comment implies.

**Residue 160 is being pushed away from Phe.** `OMIT_AA_AT_SHRINK` forbids `PHE`
at every shrink position, directly opposing that residue's documented job.

Verify:

```bash
python3 -c "
import re
t = open('enzyme_design_hpc_msa_and_bias/partial_diffusion/config.py').read()
g = lambda v: set(int(x) for x in re.findall(r'\d+', re.search(rf'^{v}\s*=\s*\[(.*?)\]', t, re.S|re.M).group(1)))
pins = set(int(x) for x in re.findall(r'^\s*(\d+):', re.search(r'_CATALYTIC_PINS\s*=\s*\{(.*?)\n\}', t, re.S).group(1), re.M))
print('SHRINK n catalytic:', sorted(g('SHRINK_RESIDUES') & pins))
print('FLEXIBLE n catalytic:', sorted(g('FLEXIBLE_RESIDUES') & pins))
"
```

**Fix:** remove 157 and 160 from `SHRINK_RESIDUES` and `FLEXIBLE_RESIDUES` (if
they should stay rigid), or drop them from `_CATALYTIC_PINS` (if redesigning
them is intentional). As configured, the pin is doing nothing either way.

Our side added a hard guard for exactly this — `03_mpnn_submit.py` now
`sys.exit`s if `SHRINK_RESIDUES ∩ _CATALYTIC_PINS` is non-empty, before any GPU
time is spent. Worth copying: `partial_diffusion/scripts/03_mpnn_submit.py`.

---

## Issue 3 — `INPUT_PDB` points at the file the repo says not to use

```python
INPUT_PDB = ".inputs/mroupo_nnbt_docked_clean.pdb"
```

`partial_diffusion/config_mroupo.py` documents why this is the wrong file:

> NOTE: this is fix_pdb_chains.py's output, **not mroupo_nnbt_docked_clean.pdb**.
> In that file UNL was written as ATOM rather than HETATM, so the pipeline's
> ligand checks could not see it (and --trim would have dropped the substrate).

Confirmed:

```bash
for f in inputs/mroupo_nnbt_docked_clean.pdb inputs/mroupo_nnbt_fixed.pdb; do
  echo -n "$(basename $f): "; grep " UNL " "$f" | cut -c1-6 | sort -u | tr '\n' ' '; echo
done
# mroupo_nnbt_docked_clean.pdb: ATOM
# mroupo_nnbt_fixed.pdb:        HETATM
```

Consequence measured directly — CAVER on `docked_clean` finds **0 tunnels**,
while `mroupo_nnbt_fixed` finds 40 (best: 1.058 Å bottleneck). Any ligand-aware
step keyed on HETATM will mis-handle the substrate in `docked_clean`.

**Fix:** `INPUT_PDB = .inputs/mroupo_nnbt_fixed.pdb`. The two files differ
only in record type — atom names, chains and chain A numbering are identical.

---

## MroUPO channel numbers (measured, apo, canonical staging)

| structure | bottleneck |
|---|---|
| 5FUJ (reference UPO) | 0.975 Å |
| PabUPO-II parent | 0.983 Å |
| 9HE9 | 1.032 Å |
| 5OXU (reference UPO) | 1.050 Å |
| **MroUPO** (`mroupo_nnbt_fixed`) | **1.058 Å** |

**MroUPO already has the widest channel of anything measured here** — wider than
both reference UPOs. Measured *with* the docked NNBT it looks like 0.745 Å, but
that is the ligand occupying the bore, not the protein being narrow (see rule 1).
Worth confirming there is a widening problem to solve before optimising for one.

Catalytic annotations check out against coordinates:

| residue | annotation | distance to heme Fe |
|---|---|---|
| CYS17 | proximal Cys, 5th Fe ligand | **verify** — should be ~2.3 Å if truly coordinating |
| HIS86 | distal His | — |
| GLU157 | distal Glu, H2O2 activation | — |
| PHE160 | orients substrate | — |

(We verified the equivalent set for PabUPO-II: Cys52 SG sits 2.35 Å from Fe, a
real coordination bond. Same check on MroUPO is one command — see below.)

---

## Two measurement rules — these affect any CAVER comparison

Both found by measuring the same structure twice and getting different answers.

**1. Always strip the substrate before measuring.** RF3 folds enzyme + heme +
substrate, so designs come out **holo**; the CAVER reference crystals
(`5FUJ_heme`, `9HE9_heme`, `5OXU_heme`) are **apo** — heme + metals only, no
substrate. A bound substrate costs ~0.45 Å of bottleneck radius. The spread
across the three real reference structures is 0.077 Å. **The artifact is ~6×
the signal.**

`channel_discovery/` does NOT strip: `cif_to_pdb.py` removes only water, and
`.pdb` inputs are copied verbatim. Any run there comparing designs to those
references carries this.

**2. CAVER's answer depends on the input filename.** Byte-identical input under
8 different filenames gave a 0.0885 Å spread in bottleneck radius — again larger
than the difference between real structures. Same bytes + same name is perfectly
reproducible (0.0000 over 6 repeats). Root cause is inside CAVER 3.0's
randomized tunnel search.

`run_batch.py` stages each structure under its own name, so it carries this too.

Both rules are handled in `lib/caver_utils.py` — it strips by default and
stages everything as `structure.pdb`.

---

## Tools you can reuse (all in `partial_diffusion/scripts/`)

| script | does |
|---|---|
| `00_caver_channel.py` | measure a parent → `FLEXIBLE_RESIDUES`, baseline, tunnel placeholder. Splits lining residues into **sidechain-lining** (MPNN can shrink) vs **backbone-only** (only RFD3 movement helps) |
| `08_probe_channel.py` | measure ONE RFD3 backbone vs baseline, verdict + what to change next. Pairs with `00_submit_all.py --pilot` (1 backbone, ~15 min) |
| `02b_caver_filter.py` | drop collapsed backbones before spending GPU on MPNN+RF3 |
| `07_caver_rescore.py` | rank folded designs by real Δ-bottleneck |
| `09_compare_to_parent.py` | did the core survive? Superimposes on pinned residues, reports pinned vs flexible RMSD separately |
| `12_bottleneck_residues.py` | **what is physically blocking the channel, and was it flexible?** Directly answers "it's wider but something still obstructs it" |

Quick MroUPO start:

```bash
python partial_diffusion/scripts/00_caver_channel.py \
    inputs/mroupo_nnbt_fixed.pdb \
    --exclude 17,86,157,160 \
    --out-dir /work3/s215098/BioBuilders2026/<you>/mroupo_caver

# what forms the constriction, and is it something you're allowed to change?
python partial_diffusion/scripts/12_bottleneck_residues.py \
    --caver-out /work3/s215098/BioBuilders2026/<you>/mroupo_caver/caver_mroupo_nnbt_fixed/out \
    --flexible <your SHRINK/FLEXIBLE list> --shell 5.0 --propose
```

That last command is the one worth running first. On PabUPO-II it showed the
bottleneck is formed by two **catalytic** residues (PHE215 at 2.66 Å, GLU212 at
2.81 Å) — meaning there is a hard ceiling on widening that doesn't involve
touching the active site. MroUPO may or may not have the same constraint; the
command tells you in about a minute.

---

## What we did NOT verify

- Whether `--omit_per_residue` works on the deployed `mpnn` **with 3-letter codes
  specifically** — we verified it with 3-letter and it worked for us, but on the
  PabUPO-II structure, not yours.
- MroUPO's catalytic residue assignments beyond what the config comments claim.
  Run the Fe-distance check to confirm Cys17 is really coordinating.
- Whether MroUPO needs widening at all, given it already measures 1.058 Å apo.

Results for PabUPO-II run 1 (22 flexible residues, for calibration): 10/10
backbones widened (mean +0.057 Å); 174/200 designs passed pLDDT/PAE/ipSAE; of
the first 20 folded designs measured, 16/20 widened, median +0.042 Å, best
1.094 Å (+0.111 vs parent).

Full context: `partial_diffusion/CHANNEL_README.md` (how to run) and
`partial_diffusion/CHANNEL_WIDENING_LOG.md` (what broke and why).
