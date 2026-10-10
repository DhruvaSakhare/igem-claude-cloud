#!/usr/bin/env python3
"""
00_generate_msa.py — extract the native chain-A sequence and help produce an
MSA (.a3m/.a3m.gz) for it, needed so RF3 folds designs confidently.

Background: RF3 (an AlphaFold3-class model) needs a multiple-sequence
alignment to fold most proteins with any confidence. Without one, it collapses
to ~0.3-0.5 pLDDT even on the native, crystal-validated sequence — this was
confirmed on PabUPO-II via a positive-control fold (native alone: 0.42 pLDDT;
native+ligands: 0.37 pLDDT; both ~21 Å PAE). Because partial-diffusion designs
keep ~99% of the native sequence (only FLEXIBLE_RESIDUES differ), ONE MSA for
the native sequence is reused for every design — generate it once here.

This script does NOT run a heavy search itself (the right tool and database
paths are specific to this HPC install and may need a GPU/CPU job of their
own). Instead it:
  1. Writes the native chain-A sequence to a FASTA file.
  2. Detects which MSA-search tools are available on this system.
  3. Prints the RF3 install's own docs/examples for the exact input format,
     and the next command to run for whichever tool is available.

This folder (smoke_test/) is self-contained — it has its own copy of the
input PDB and its own tiny config (smoke_config.py), so it can be zipped/scp'd
to the HPC and run on its own, without the rest of the pipeline checked out.

Run from anywhere, with the conda env active:
  python 00_generate_msa.py          (from inside smoke_test/)
  python smoke_test/00_generate_msa.py   (from its parent folder)

Once you have an .a3m or .a3m.gz file, copy it into smoke_test/inputs/ and
set _NATIVE_MSA_FILE in smoke_config.py to its filename.
"""
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import smoke_config as C

THREE_TO_ONE = {
    "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C", "GLN": "Q",
    "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I", "LEU": "L", "LYS": "K",
    "MET": "M", "PHE": "F", "PRO": "P", "SER": "S", "THR": "T", "TRP": "W",
    "TYR": "Y", "VAL": "V",
}

MSA_TOOLS = ["colabfold_search", "colabfold_batch", "mmseqs", "jackhmmer", "hhblits", "phmmer"]


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
    pdb_stem = Path(C.INPUT_PDB).stem
    seq = extract_native_sequence(C.INPUT_PDB, chain="A")

    fasta_path = Path(__file__).resolve().parent / f"{pdb_stem}_A.fasta"
    fasta_path.write_text(f">{pdb_stem}_A\n{seq}\n")
    print(f"Native chain-A sequence ({len(seq)} aa) -> {fasta_path}")

    suggested_a3m_name = f"{pdb_stem}_A.a3m.gz"
    suggested_a3m_path = Path(C.INPUT_PDB).parent / suggested_a3m_name

    print("\n--- Checking for MSA-search tools on this system ---")
    found = {tool: shutil.which(tool) for tool in MSA_TOOLS}
    any_found = False
    for tool, path in found.items():
        if path:
            any_found = True
            print(f"  [found]     {tool:<16} -> {path}")
        else:
            print(f"  [not found] {tool}")

    print("\n--- Checking the RF3 install for its own MSA docs/examples ---")
    rf3_release = getattr(C, "RF3_RELEASE", None)
    if rf3_release and Path(rf3_release).exists():
        print(f"  RF3_RELEASE = {rf3_release}")
        print("  Run these on the login node to find the exact MSA workflow for this install:")
        print(f"""
    cd {rf3_release}
    grep -rniE "\\bmsa\\b|a3m|msa_search|use_msa" README.md docs/ 2>/dev/null | grep -viE "mask|message" | head -40
    find docs -name "*with_msa*.json" -o -name "*a3m*" 2>/dev/null
""")
    else:
        print(f"  RF3_RELEASE path not found ({rf3_release}) — run this on the HPC login node")
        print("  with the pipeline's conda env active, or fix RF3_RELEASE in smoke_config.py.")

    print("--- Next step ---")
    if any_found:
        print("  A tool is available above — use it to search the native sequence")
        print(f"  ({fasta_path}) against a sequence database and produce an .a3m(.gz).")
        print("  (Database paths are site-specific; check with whoever maintains the")
        print("   RF3/foundry install — e.g. ask 'where's the UniRef/colabfold DB on this cluster?')")
    else:
        print("  No MSA-search tool found in PATH. Compute nodes here likely have no internet")
        print("  anyway, so the simplest route is to generate it off-cluster and upload it:")
        print(f"    1. Copy {fasta_path.name} to your laptop (or just paste its sequence).")
        print("    2. Run it through an online MSA tool (e.g. the ColabFold web notebook —")
        print("       it uses the MMseqs2 search server). Save the resulting .a3m.")
        print("    3. Check the .a3m's FIRST (query) sequence matches the FASTA sequence")
        print("       EXACTLY (same length/order) — a mismatch silently misaligns the fold.")
        print("    4. gzip it and scp it into THIS folder's inputs/:")
        print(f"         gzip your_download.a3m")
        print(f"         scp your_download.a3m.gz hpclogin1:.../smoke_test/inputs/{suggested_a3m_name}")
        print("  Alternatively, ask the RF3/DBL foundry maintainer which tool + database")
        print("  this cluster uses, if an on-cluster search is preferred.")

    print(f"\nOnce the file is in smoke_test/inputs/, point smoke_config.py at it:")
    print(f'  _NATIVE_MSA_FILE = "{suggested_a3m_name}"')
    print("\nThen run the standalone control fold:")
    print("  python 00_rf3_msa_control.py")


if __name__ == "__main__":
    main()
