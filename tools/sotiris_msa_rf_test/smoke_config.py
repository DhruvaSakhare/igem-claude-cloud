"""
smoke_config.py — minimal, self-contained config for the smoke_test/ folder.

Deliberately independent of partial_diffusion/config.py so this whole folder
can be zipped/scp'd to the HPC and run entirely on its own, without checking
out the rest of the pipeline. If you change the enzyme/substrate in the real
config.py, mirror the change here by hand.

Everything under here is relative to this file's own directory (HERE), so it
doesn't matter where on the HPC you place this folder.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent

YOUR_NAME = "kristine"    # only used to label the local output folder

# ---------------------------------------------------------------------------
# ● PER ENZYME — mirrors partial_diffusion/config.py
# ---------------------------------------------------------------------------
INPUT_PDB        = str(HERE / "inputs" / "PabUPO-II_withHEMEFE_and_NNBT.pdb")
HEME_CCD         = "HEM"
SUBSTRATE_SMILES = "CC1CCC(N(C[C@@H](C)O)C[C@@H](C)O)CC1"
SUBSTRATE_CCD    = ""

# Set this to the a3m/a3m.gz filename once you've generated one with
# 00_generate_msa.py and copied it into smoke_test/inputs/. Leave "" to fold
# single-sequence (reproduces the ~0.4 pLDDT failure — useful as a baseline).
_NATIVE_MSA_FILE = "PabUPO-II_withHEMEFE_and_NNBT_A.a3m.gz"
NATIVE_MSA_PATH = str(HERE / "inputs" / _NATIVE_MSA_FILE) if _NATIVE_MSA_FILE else ""

# ---------------------------------------------------------------------------
# ● cluster paths — these still assume the DTU HPC install; everything else
# in this folder is self-contained and portable.
# ---------------------------------------------------------------------------
QUEUE       = "gpua100"
RF3_RELEASE = "/dtu/projects/dbl/rf3/release"
RF3_CKPT    = "/dtu/projects/dbl/rf3/release/ckpt/rf3_latest.pt"

LIB_ROOT = HERE / "lib"       # local copy of rf3_wrapper.py
OUT_ROOT = HERE / "work"      # self-contained output — no /work3 dependency
