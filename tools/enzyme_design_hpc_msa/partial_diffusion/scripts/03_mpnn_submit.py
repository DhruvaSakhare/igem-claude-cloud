#!/usr/bin/env python3
"""
Stage 2 — LigandMPNN: design sequences on each backbone.

Writes a .cmds file (one mpnn command per backbone) and an LSF array submit
script, then prints the bsub command.

Run after 02_rfd3_process.py:
  python scripts/03_mpnn_submit.py

After submitting, wait for the job (bstat), then run:
  python scripts/04_rf3_submit.py
"""
import sys
import glob
import math
import os
import importlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
C = importlib.import_module(os.environ.get("PIPELINE_BASE_CONFIG", "partial_diffusion.config"))
sys.path.insert(0, str(C.LIB_ROOT))
import jupyter_utils

C.make_workdirs()

# Prefer clash-filtered backbones; fall back to all if filter wasn't run
filtered = sorted(glob.glob(str(C.DIFFUSION_DIR / "passing" / "*.cif.gz")))
structures = filtered if filtered else sorted(glob.glob(str(C.DIFFUSION_DIR / "*.cif.gz")))

if not structures:
    sys.exit(f"No .cif.gz backbones in {C.DIFFUSION_DIR} — run RFD3 first.")

print(f"Using {len(structures)} backbone(s)"
      + (" (clash/break-filtered)" if filtered else " (all — filter not applied)"))

cmds_file = str(C.CMDS_DIR / "mpnn.cmds")
n_written = 0
with open(cmds_file, "w") as f:
    for structure in structures:
        bn = os.path.basename(structure).replace(".cif.gz", "")
        this_out = str(C.MPNN_DIR / bn)
        os.makedirs(this_out, exist_ok=True)

        # Confirm this backbone has a valid RFD3 sidecar JSON before using it.
        # If only CIFs were copied into passing/ (not the JSONs), also check
        # the parent diffusion_out/ directory.
        side_json = Path(structure.replace(".cif.gz", ".json"))
        if not side_json.exists():
            side_json = side_json.parent.parent / side_json.name
        if not side_json.exists():
            print(f"  [skip] no sidecar JSON for {bn}")
            continue

        # partial diffusion preserves residue numbering (no index remapping),
        # so pin catalytic residues directly by their input labels. This mpnn
        # build splits --fixed_residues on commas, so join with "," (a space
        # separator makes it read the whole list as one invalid residue ID).
        fixed_resis = ",".join(C.CATRES)

        fixed_flag = f'--fixed_residues "{fixed_resis}"' if fixed_resis else ""

        cmd = (
            f'mpnn --seed 42 --structure_path "{structure}" '
            f'--out_directory "{this_out}" '
            f'--batch_size {C.MPNN_BATCH_SIZE} '
            f'--number_of_batches {C.MPNN_NUMBER_OF_BATCHES} '
            f'--model_type ligand_mpnn '
            f'--checkpoint_path "{C.MPNN_CKPT}" '
            f'--is_legacy_weights True '
            # NOTE: --fixed_residues and --designed_chains are mutually exclusive
            # in LigandMPNN. We pin catalytic residues with --fixed_residues; the
            # only protein chain is A (HEM/NNBT are ligand context), so everything
            # else on chain A is designed automatically — no --designed_chains needed.
            + fixed_flag
        ).rstrip()
        f.write(cmd + "\n")
        n_written += 1

if n_written == 0:
    sys.exit("No MPNN commands written — are sidecar JSONs present next to each .cif.gz?")

n_tasks = sum(1 for _ in open(cmds_file))
sub_script = jupyter_utils.make_sub_script(
    cmds_file,
    n_task=n_tasks,
    group_size=10,
    mem="10G",
    queue=C.QUEUE,
    job_name="mpnn",
    cores=4,
    time_limit="2:00",
    env=C.PROTEIN_ENV,
)

print(f"\n{n_tasks} MPNN command(s) -> {cmds_file}")
print(f"LSF submit script    -> {sub_script}")
print(f"\n--- SUMMARY ---")
print(f"  Backbones going into MPNN : {len(structures)}")
print(f"  Sequences per backbone    : {C.MPNN_BATCH_SIZE * C.MPNN_NUMBER_OF_BATCHES}")
print(f"  Total sequences expected  : {len(structures) * C.MPNN_BATCH_SIZE * C.MPNN_NUMBER_OF_BATCHES}")
print(f"  Output FASTAs will go to  : {C.MPNN_DIR}/<backbone>/")
print(f"\n--- SUBMIT ---")
print(f"  bsub < {sub_script}")
print(f"\nThen wait:  bstat")
print(f"Then check: ls {C.MPNN_DIR}/")
print(f"Then run:   python partial_diffusion/scripts/04_rf3_submit.py")
