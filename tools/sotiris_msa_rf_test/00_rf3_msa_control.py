#!/usr/bin/env python3
"""
00_rf3_msa_control.py — standalone RF3 smoke test for the MSA fix.

Folds ONLY the native sequence (no RFD3, no MPNN, no full pipeline) twice:
  - native_enzyme_only : chain A alone
  - native_with_ligands: chain A + heme + substrate
both with NATIVE_MSA_PATH attached (if set). This is the decisive control:
if native pLDDT jumps from ~0.4 (no MSA, see README troubleshooting) to
~0.85-0.9, the MSA fix works and it's safe to re-run the full RF3 stage on
real designs. If it doesn't move, something about the MSA (wrong sequence,
bad format) is still wrong — don't burn GPU time re-folding everything yet.

Uses few diffusion steps and only 2 sequences so the GPU job is short — this
is meant to be a fast go/no-go check, not production-quality folding.

This folder (smoke_test/) is self-contained — it has its own copy of the
input PDB, the RF3 wrapper, and a tiny config (smoke_config.py), so it can be
zipped/scp'd to the HPC and run on its own, without the rest of the pipeline
checked out. Only the RF3 install itself (QUEUE/RF3_RELEASE/RF3_CKPT in
smoke_config.py) still assumes the DTU HPC.

Run from anywhere, with the conda env active:
  python 00_rf3_msa_control.py           (from inside smoke_test/)
  python smoke_test/00_rf3_msa_control.py    (from its parent folder)

Then:
  bsub < <printed submit script path>
  bstat
  # once done:
  cat <printed CTRL dir>/out/*.score
"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import smoke_config as C

THREE_TO_ONE = {
    "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C", "GLN": "Q",
    "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I", "LEU": "L", "LYS": "K",
    "MET": "M", "PHE": "F", "PRO": "P", "SER": "S", "THR": "T", "TRP": "W",
    "TYR": "Y", "VAL": "V",
}

CTRL_STEPS = 20  # fast smoke test, not production quality — just checking pLDDT moves


def extract_native_sequence(pdb_path, chain="A"):
    residues = {}
    with open(pdb_path) as f:
        for line in f:
            if line[:4] == "ATOM" and line[12:16].strip() == "CA" and line[21] == chain:
                resnum = int(line[22:26])
                resn = line[17:20].strip()
                residues[resnum] = THREE_TO_ONE.get(resn, "X")
    if not residues:
        raise RuntimeError(f"No CA atoms found for chain {chain} in {pdb_path}")
    return "".join(residues[k] for k in sorted(residues))


def main():
    native_msa = getattr(C, "NATIVE_MSA_PATH", "") or None
    if not native_msa:
        print("WARNING: NATIVE_MSA_PATH is not set in smoke_config.py — this control will")
        print("  fold single-sequence and just reproduce the ~0.4 pLDDT failure.")
        print("  Set _NATIVE_MSA_FILE first (see 00_generate_msa.py).\n")

    seq = extract_native_sequence(C.INPUT_PDB, chain="A")
    print(f"Native chain-A sequence: {len(seq)} aa")
    print(f"MSA                    : {native_msa or 'NONE'}")

    chain_a_only = {"seq": seq, "chain_id": "A"}
    chain_a_lig  = {"seq": seq, "chain_id": "A"}
    if native_msa:
        chain_a_only["msa_path"] = native_msa
        chain_a_lig["msa_path"]  = native_msa

    heme_entry = {"ccd_code": C.HEME_CCD}
    if C.SUBSTRATE_CCD:
        substrate_entry = {"ccd_code": C.SUBSTRATE_CCD}
    elif C.SUBSTRATE_SMILES:
        substrate_entry = {"smiles": C.SUBSTRATE_SMILES}
    else:
        sys.exit("Set SUBSTRATE_SMILES or SUBSTRATE_CCD in smoke_config.py")

    designs = [
        {"name": "native_enzyme_only",  "components": [chain_a_only]},
        {"name": "native_with_ligands", "components": [chain_a_lig, heme_entry, substrate_entry]},
    ]

    ctrl_dir = C.OUT_ROOT / "rf3_msa_control"
    ctrl_dir.mkdir(parents=True, exist_ok=True)
    control_json = ctrl_dir / "control.json"
    control_json.write_text(json.dumps(designs, indent=2))
    print(f"\nControl input JSON -> {control_json}")

    out_dir = ctrl_dir / "out"
    rf3_wrapper = C.LIB_ROOT / "rf3_wrapper.py"
    script_path = ctrl_dir / "rf3_msa_control.sh"
    script_path.write_text(f"""#!/bin/sh
#BSUB -q {C.QUEUE}
#BSUB -J rf3_msa_control
#BSUB -n 4
#BSUB -gpu "num=1:mode=exclusive_process"
#BSUB -W 1:00
#BSUB -R "rusage[mem=10GB]"
#BSUB -R "span[hosts=1]"
#BSUB -o {ctrl_dir}/ctrl_%J.out
#BSUB -e {ctrl_dir}/ctrl_%J.err

module load cuda/12.4
source {C.RF3_RELEASE}/activate_env.sh
export DISABLE_CUEQUIVARIANCE=true

python {rf3_wrapper} fold inference_engine=rf3 \\
    inputs={control_json} out_dir={out_dir} \\
    ckpt_path={C.RF3_CKPT} \\
    num_steps={CTRL_STEPS} \\
    annotate_b_factor_with_plddt=True \\
    early_stopping_plddt_threshold=0

echo "Done at $(date)"

_PGID=$(ps -o pgid= -p $$ | tr -d ' ')
for _pid in $(pgrep -g "$_PGID" 2>/dev/null); do
    [ "$_pid" != "$$" ] && kill -9 "$_pid" 2>/dev/null
done
exit 0
""")
    script_path.chmod(0o755)

    print(f"Submit script       -> {script_path}")
    print(f"\n--- SUBMIT ---")
    print(f"  bsub < {script_path}")
    print(f"\nThen wait (~5-15 min, only {CTRL_STEPS} steps / 2 sequences):  bstat")
    print(f"Then check pLDDT:")
    print(f"  grep -i chainwise_plddt {out_dir}/*.score")
    print(f"\nInterpretation:")
    print(f"  ~0.85-0.9 -> MSA fix confirmed. Copy this .a3m.gz into the main pipeline's")
    print(f"               inputs/ folder too, set NATIVE_MSA_PATH in its config.py, and")
    print(f"               re-run partial_diffusion/scripts/04_rf3_submit.py there.")
    print(f"  still ~0.3-0.5 -> MSA isn't helping; check the .a3m query sequence")
    print(f"               matches the native FASTA exactly (same length/order)")


if __name__ == "__main__":
    main()
