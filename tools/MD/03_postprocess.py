"""
Stage 3 (run in the `md-analysis` conda env):
   load production trajectory -> fix PBC wrapping -> remove rigid-body drift
   -> optionally strip waters/ions -> save a clean light-weight trajectory
   suitable for visualization in PyMOL/VMD and downstream analysis.

Usage:
    python 03_postprocess.py
    python 03_postprocess.py --keep-solvent      # do not strip waters/ions
    python 03_postprocess.py --output-dir md_output

Inputs (in --output-dir, written by 02_run.py):
    system_solvated.pdb   full topology
    production.dcd        raw PBC-wrapped trajectory

Outputs (in --output-dir):
    production_solute.dcd   imaged + aligned, solvent stripped (default)
    solute_top.pdb          single-frame topology matching the cleaned DCD
                            (or production_imaged.dcd + imaged_top.pdb if
                             --keep-solvent is set)
    rmsd.csv                time series: protein-CA + HEM + NBT RMSD (Angstrom)
    rmsd.png                plot of the same three RMSD time series
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import mdtraj as md

# Use a non-interactive matplotlib backend so the script works on headless
# nodes (HPC compute nodes, CI) without a display.
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output-dir", default="md_output")
    p.add_argument(
        "--trajectory",
        default="production.dcd",
        help="trajectory filename inside --output-dir",
    )
    p.add_argument(
        "--topology",
        default="system_solvated.pdb",
        help="topology filename inside --output-dir",
    )
    p.add_argument(
        "--keep-solvent",
        action="store_true",
        help="keep waters/ions in the output (default: strip them)",
    )
    p.add_argument(
        "--align-selection",
        default="protein and name CA",
        help="MDTraj selection used to superpose every frame onto frame 0",
    )
    p.add_argument(
        "--solvent-resnames",
        default="HOH NA CL",
        help="space-separated residue names to strip when not --keep-solvent",
    )
    p.add_argument(
        "--hem-resname",
        default="HEM",
        help="residue name of the demetallated heme ligand in the topology",
    )
    p.add_argument(
        "--ligand-resname",
        default="NBT",
        help="residue name of the NNBT inhibitor in the topology",
    )
    p.add_argument(
        "--no-ligand",
        action="store_true",
        help="Apo-HEM run: skip the substrate RMSD series and emit a 3-column CSV "
             "(time, protein Cα, HEM).",
    )
    p.add_argument(
        "--rmsd-csv",
        default="rmsd.csv",
        help="output filename for the RMSD time series CSV",
    )
    p.add_argument(
        "--rmsd-png",
        default="rmsd.png",
        help="output filename for the RMSD plot PNG",
    )
    p.add_argument(
        "--dist-csv",
        default="ligand_heme_dist.csv",
        help="output filename for the ligand–heme distance CSV",
    )
    p.add_argument(
        "--dist-png",
        default="ligand_heme_dist.png",
        help="output filename for the ligand–heme distance plot PNG",
    )

    p.add_argument(
        "--sasa-csv",
        default="nbt_sasa.csv",
        help="output filename for the ligand SASA time series CSV",
    )
    p.add_argument(
        "--sasa-png",
        default="nbt_sasa.png",
        help="output filename for the ligand SASA plot PNG",
    )
    p.add_argument(
        "--ligand-label",
        default=None,
        help="display name for the substrate ligand used in plot legends and printed "
             "stats (e.g. 'BADGE', 'NNBT'). Does not affect residue resolution logic.",
    )
    p.add_argument(
        "--substrate-atoms",
        nargs="+",
        type=str,
        default=None,
        metavar="NAME",
        help="atom names of the substrate heavy atoms to track, as shown in column 3 "
             "of solute_top.pdb (e.g. C1x, N2x). An extra line is added to the "
             "distance and SASA plots for the centroid of these atoms. "
             "Example: --substrate-atoms C1x C2x",
    )
    p.add_argument(
        "--frame-spacing-ps",
        type=float,
        default=10.0,
        help="time between trajectory frames in ps; used only when the "
             "trajectory file does not contain valid time stamps (default: "
             "10.0, matching --report-interval 2500 at 4 fs in 02_run.py)",
    )
    p.add_argument(
        "--phe-resseqs",
        nargs="+",
        type=int,
        default=None,
        metavar="RESSEQ",
        help="PDB residue numbers (resSeq) of Phe (or any) residues whose "
             "minimum heavy-atom distance to the ligand is tracked over time. "
             "Example: --phe-resseqs 67 103 189",
    )
    p.add_argument(
        "--phe-dist-csv",
        default="phe_nbt_dist.csv",
        help="output filename for the Phe–ligand minimum distance CSV",
    )
    p.add_argument(
        "--phe-dist-png",
        default="phe_nbt_dist.png",
        help="output filename for the Phe–ligand minimum distance plot PNG",
    )
    p.add_argument(
        "--phe-centroid-png",
        default="phe_nbt_centroid_dist.png",
        help="output filename for the Phe–ligand centroid distance plot PNG",
    )
    p.add_argument(
        "--phe-rmsd-png",
        default="phe_rmsd.png",
        help="output filename for the residue RMSD plot PNG",
    )
    return p.parse_args()


def banner(title: str) -> None:
    print("\n" + "=" * 78)
    print(f"  {title}")
    print("=" * 78, flush=True)


# --------------------------------------------------------------------------- #
# Load
# --------------------------------------------------------------------------- #
# Reasoning: mdtraj infers the periodic box from the DCD if present, or from
# the topology's CRYST1 line as a fallback. We need real box vectors for
# image_molecules to work, so we assert they exist before proceeding.
def load_trajectory(traj_path: Path, top_path: Path) -> md.Trajectory:
    banner(f"Stage 3.1: loading trajectory {traj_path.name}")
    if not traj_path.exists():
        raise SystemExit(f"trajectory not found: {traj_path}")
    if not top_path.exists():
        raise SystemExit(f"topology not found: {top_path}")
    t = md.load(str(traj_path), top=str(top_path))
    print(
        f"[OK] loaded {t.n_frames} frames, {t.n_atoms} atoms, "
        f"{t.topology.n_residues} residues"
    )
    if t.unitcell_vectors is None:
        raise SystemExit(
            "no periodic box vectors found in trajectory or topology -- "
            "cannot image PBC"
        )
    return t


# --------------------------------------------------------------------------- #
# Imaging
# --------------------------------------------------------------------------- #
# Reasoning: OpenMM writes wrapped coordinates -- atoms that drift across a
# box face reappear on the opposite side. image_molecules stitches every
# molecule back together in the same periodic image as the chosen anchor
# (the protein chains). mdtraj wants anchor_molecules as a list of sets of
# Atom *objects* (not indices), one per whole molecule -- so we pull the
# full molecule decomposition from the topology and keep the ones containing
# any protein atom.
def fix_pbc(t: md.Trajectory) -> md.Trajectory:
    banner("Stage 3.2: re-imaging molecules across PBC (anchor = protein)")
    prot_idx = set(int(i) for i in t.topology.select("protein"))
    if not prot_idx:
        raise SystemExit("no 'protein' atoms found -- check your topology")
    all_molecules = t.topology.find_molecules()
    anchors = [mol for mol in all_molecules
               if any(a.index in prot_idx for a in mol)]
    if not anchors:
        raise SystemExit(
            "no whole molecule contains protein atoms -- "
            "topology bonds may be missing"
        )
    t.image_molecules(inplace=True, anchor_molecules=anchors)
    print(
        f"[OK] imaged using {len(anchors)} anchor molecule(s) "
        f"covering {len(prot_idx)} protein atoms"
    )
    return t


# --------------------------------------------------------------------------- #
# Rigid-body alignment
# --------------------------------------------------------------------------- #
# Reasoning: even after imaging, the whole protein can translate and rotate
# in the box from frame to frame. Aligning every frame onto frame 0 using a
# stable selection (default: protein C-alphas) kills that rigid-body drift,
# so any apparent motion of the ligands is real motion relative to the
# binding site. Falls back gracefully if the user passes a custom selection
# that doesn't match anything.
def align_frames(t: md.Trajectory, selection: str) -> md.Trajectory:
    banner(f"Stage 3.3: superposing every frame onto frame 0  ({selection!r})")
    idx = t.topology.select(selection)
    if len(idx) == 0:
        raise SystemExit(
            f"alignment selection {selection!r} matched zero atoms"
        )
    t.superpose(t, frame=0, atom_indices=idx)
    print(f"[OK] aligned on {len(idx)} atoms")
    return t


# --------------------------------------------------------------------------- #
# Solvent strip + save
# --------------------------------------------------------------------------- #
# Reasoning: waters dominate the trajectory file size but rarely the
# analysis. Stripping them gives a ~10x smaller DCD that PyMOL/VMD load
# instantly. We also write a single-frame PDB so the user has a topology
# whose atom count matches the stripped DCD -- otherwise PyMOL throws an
# atom-count-mismatch error on load_traj.
def save_outputs(
    t: md.Trajectory,
    out_dir: Path,
    keep_solvent: bool,
    solvent_resnames: str,
) -> None:
    if keep_solvent:
        banner("Stage 3.4: saving full imaged trajectory (--keep-solvent)")
        traj_out = out_dir / "production_imaged.dcd"
        top_out = out_dir / "imaged_top.pdb"
        sel_traj = t
    else:
        sel = f"not resname {' '.join(solvent_resnames.split())}"
        banner(f"Stage 3.4: stripping solvent ({sel!r}) and saving")
        keep = t.topology.select(sel)
        if len(keep) == 0:
            raise SystemExit(f"selection {sel!r} matched zero atoms")
        sel_traj = t.atom_slice(keep)
        traj_out = out_dir / "production_solute.dcd"
        top_out = out_dir / "solute_top.pdb"

    sel_traj.save_dcd(str(traj_out))
    sel_traj[0].save_pdb(str(top_out))
    print(
        f"[OK] wrote {traj_out.name}  ({sel_traj.n_atoms} atoms, "
        f"{sel_traj.n_frames} frames)"
    )
    print(f"[OK] wrote {top_out.name}  (single-frame topology)")


# --------------------------------------------------------------------------- #
# RMSD analysis
# --------------------------------------------------------------------------- #
# Reasoning: we run the analysis on the in-memory imaged+aligned trajectory
# `t`, AFTER align_frames has superposed every frame onto frame 0 using the
# protein C-alphas. Two semantically distinct RMSDs are computed:
#
#   * Protein C-alpha RMSD -- md.rmsd does its own optimal alignment on the
#     CA atoms; this measures backbone fluctuation regardless of any prior
#     superposition. Use this to judge whether the fold is stable.
#
#   * HEM and NBT RMSD -- computed as positional drift in the protein-aligned
#     frame (no further alignment). This is what tells you "did the ligand
#     stay put in the binding site?". We bypass md.rmsd here because md.rmsd
#     always re-optimizes alignment on the requested atoms, which would
#     measure internal conformational change of the ligand instead of its
#     displacement relative to the protein.
#
# Heavy atoms only (skip hydrogens) so the numbers are comparable to typical
# literature ligand-RMSD values. Output: a 4-column CSV (time + 3 RMSDs in
# Angstrom) plus a PNG plot.
_STANDARD_SOLVENT_OR_ION = {"HOH", "WAT", "SOL", "NA", "CL", "K", "MG", "ZN"}
_STANDARD_AMINO_ACIDS = {
    "ACE", "AIB", "ALA", "ARG", "ARGN", "ASN", "ASN1", "ASP", "ASP1", "ASPH",
    "ASPP", "ASH", "CT3", "CYS", "CYS1", "CYS2", "CYM", "CYX", "DALA", "GLN",
    "GLU", "GLUH", "GLUP", "GLH", "GLY", "HIS", "HIE", "HID", "HIP", "HISD",
    "HISE", "HISH", "HSD", "HSE", "HSP", "HYP", "ILE", "LEU", "LSN", "LYS",
    "LYSH", "LYN", "MET", "ORN", "PGLU", "PHE", "PRO", "SER", "THR", "TRP",
    "TRPH", "TRPO", "TYR", "VAL", "PHEH", "TYM", "CYSH", "NME", "NMA",
}
_EXCLUDED_RESNAMES = _STANDARD_SOLVENT_OR_ION | _STANDARD_AMINO_ACIDS


def _list_non_standard_resnames(top: md.Topology) -> list[str]:
    """Return resnames that are not amino acids/water/ions, for friendlier errors."""
    found = []
    for res in top.residues:
        if res.name in _EXCLUDED_RESNAMES:
            continue
        if res.name not in found:
            found.append(res.name)
    return found


def _list_ligand_residues(top: md.Topology) -> list[tuple]:
    """Return every non-amino-acid, non-solvent residue as
    (residue, heavy_atom_indices), sorted by descending heavy-atom count.

    We deliberately blocklist standard residue names rather than relying on
    mdtraj's `is_protein`/`is_water` heuristics, because those can misclassify
    OpenFF-generated ligand residues (e.g. UNK with element-only atom names
    like 'C', 'N', 'O') as protein.
    """
    out = []
    for res in top.residues:
        if res.name in _EXCLUDED_RESNAMES:
            continue
        heavy = np.array(
            [a.index for a in res.atoms if a.element.symbol != "H"], dtype=int
        )
        if len(heavy) == 0:
            continue
        out.append((res, heavy))
    out.sort(key=lambda x: -len(x[1]))
    return out


def _resolve_ligand(
    top: md.Topology,
    hint: str,
    rank: int,
    label: str,
) -> tuple[np.ndarray, str]:
    """Resolve a ligand to (heavy atom indices, human-readable name).

    1. Try exact resname match first (covers the standard case).
    2. If that fails, fall back to size-ranked non-standard residues: rank 0
       is the largest ligand, rank 1 the second-largest, etc. This handles
       the common situation where OpenFF-generated ligands all share a
       fallback resname like UNK or LIG and resname alone can't tell them
       apart.
    """
    idx = top.select(f"resname {hint} and not element H")
    if len(idx) > 0:
        return idx, hint

    ligs = _list_ligand_residues(top)
    if len(ligs) <= rank:
        print(
            f"[WARN] {label}: no atoms with resname {hint!r} and fewer than "
            f"{rank + 1} non-standard residues found "
            f"(non-standard resnames: {_list_non_standard_resnames(top)}). "
            f"{label} RMSD will be skipped."
        )
        return np.array([], dtype=int), hint

    res, heavy = ligs[rank]
    picked = (
        f"{res.name}:{res.resSeq} (chain {res.chain.index}, "
        f"{len(heavy)} heavy atoms)"
    )
    print(
        f"[..] {label}: resname {hint!r} not found; auto-picked "
        f"non-standard residue ranked #{rank} by size -> {picked}"
    )
    return heavy, f"{label} [{picked}]"


def _drift_rmsd(t: md.Trajectory, atom_indices: np.ndarray) -> np.ndarray:
    """RMSD of atom_indices vs frame 0, with NO further re-alignment.

    Requires that `t` has already been superposed on some stable reference
    (e.g. protein C-alphas). Result is in nanometers (mdtraj's native unit).
    """
    ref = t.xyz[0, atom_indices, :]                       # (n_atoms, 3)
    diffs = t.xyz[:, atom_indices, :] - ref[None, :, :]   # (n_frames, n_atoms, 3)
    return np.sqrt(np.mean(np.sum(diffs ** 2, axis=-1), axis=-1))


def compute_rmsds(
    t: md.Trajectory,
    out_dir: Path,
    hem_resname: str,
    ligand_resname: str,
    csv_name: str,
    png_name: str,
    frame_spacing_ps: float = 10.0,
    no_ligand: bool = False,
    dist_csv: str = "ligand_heme_dist.csv",
    dist_png: str = "ligand_heme_dist.png",

    sasa_csv: str = "nbt_sasa.csv",
    sasa_png: str = "nbt_sasa.png",
    substrate_atoms: list | None = None,
    ligand_label: str | None = None,
) -> None:
    series_label = "protein, HEM" if no_ligand else "protein, HEM, NBT"
    banner(f"Stage 3.5: computing RMSD time series ({series_label})")

    ca_idx = t.topology.select("protein and name CA")
    if len(ca_idx) == 0:
        print("[WARN] no 'protein and name CA' atoms found -- skipping RMSD")
        return

    # Print the discovered ligand inventory so the user can sanity-check the
    # auto-assignment.
    ligs = _list_ligand_residues(t.topology)
    print(f"[..] non-standard ligand residues discovered (n={len(ligs)}):")
    for res, heavy in ligs:
        print(
            f"      {res.name}:{res.resSeq}  chain {res.chain.index}  "
            f"{len(heavy)} heavy atoms"
        )

    # Try resname first, then auto-discover by size if needed. Rank 0 is the
    # largest non-standard residue (HEM ~42 heavy atoms in 8AV5), rank 1 the
    # second-largest (NBT ~16 heavy atoms).
    hem_idx, hem_label = _resolve_ligand(t.topology, hem_resname, rank=0, label="HEM")
    if no_ligand:
        nbt_idx = np.array([], dtype=int)
        nbt_label = "NBT"
    else:
        nbt_idx, nbt_label = _resolve_ligand(t.topology, ligand_resname, rank=1, label="NBT")
    if ligand_label is not None and not no_ligand:
        nbt_label = ligand_label

    # Protein CA RMSD with mdtraj's optimal alignment (Kabsch).
    prot_rmsd_A = md.rmsd(t, t, frame=0, atom_indices=ca_idx) * 10.0  # nm -> A

    n_frames = t.n_frames
    hem_rmsd_A = (_drift_rmsd(t, hem_idx) * 10.0
                  if len(hem_idx) > 0 else np.full(n_frames, np.nan))
    nbt_rmsd_A = (_drift_rmsd(t, nbt_idx) * 10.0
                  if len(nbt_idx) > 0 else np.full(n_frames, np.nan))

    # Time axis: always use the user-supplied inter-frame spacing. OpenMM's
    # DCDReporter is unreliable about writing real picosecond time stamps --
    # it often stores frame indices (0, 1, 2, ...) that look monotonic but
    # are not in ps. The spacing is unambiguous from the run configuration:
    # frame_spacing_ps = --report-interval * timestep_fs / 1000.
    times_ps = np.arange(n_frames, dtype=float) * frame_spacing_ps
    print(
        f"[..] time axis built from --frame-spacing-ps={frame_spacing_ps} "
        f"-> {times_ps[0]:.1f} - {times_ps[-1]:.1f} ps "
        f"({times_ps[-1] / 1000:.3f} ns total)"
    )

    # CSV: emit 3 columns in --no-ligand mode (time, protein Cα, HEM); 4 cols otherwise.
    csv_path = out_dir / csv_name
    if no_ligand:
        np.savetxt(
            csv_path,
            np.column_stack([times_ps, prot_rmsd_A, hem_rmsd_A]),
            delimiter=",",
            header="time_ps,protein_CA_RMSD_A,HEM_RMSD_A",
            comments="",
            fmt="%.4f",
        )
    else:
        np.savetxt(
            csv_path,
            np.column_stack([times_ps, prot_rmsd_A, hem_rmsd_A, nbt_rmsd_A]),
            delimiter=",",
            header="time_ps,protein_CA_RMSD_A,HEM_RMSD_A,NBT_RMSD_A",
            comments="",
            fmt="%.4f",
        )
    print(f"[OK] wrote {csv_path.name}  ({n_frames} rows)")

    # Plot
    fig, ax = plt.subplots(figsize=(10, 6))
    times_ns = times_ps / 1000.0
    ax.plot(times_ns, prot_rmsd_A,
            label=f"Protein Cα  (n={len(ca_idx)})", linewidth=1.6)
    if len(hem_idx) > 0:
        ax.plot(times_ns, hem_rmsd_A,
                label=f"{hem_label} heavy atoms  (n={len(hem_idx)})",
                linewidth=1.6)
    if len(nbt_idx) > 0:
        ax.plot(times_ns, nbt_rmsd_A,
                label=f"{nbt_label} heavy atoms  (n={len(nbt_idx)})",
                linewidth=1.6)
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("RMSD (Å)")
    ax.set_title("RMSD vs time -- protein Cα aligned reference")
    ax.legend(loc="best")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    png_path = out_dir / png_name
    fig.savefig(png_path, dpi=150)
    plt.close(fig)
    print(f"[OK] wrote {png_path.name}")

    # Summary stats
    print(
        f"[..] protein Cα RMSD : "
        f"mean {np.mean(prot_rmsd_A):.2f} Å, max {np.max(prot_rmsd_A):.2f} Å"
    )
    if len(hem_idx) > 0:
        print(
            f"[..] HEM drift RMSD ({hem_label}): "
            f"mean {np.mean(hem_rmsd_A):.2f} Å, max {np.max(hem_rmsd_A):.2f} Å"
        )
    if len(nbt_idx) > 0:
        print(
            f"[..] NBT drift RMSD ({nbt_label}): "
            f"mean {np.mean(nbt_rmsd_A):.2f} Å, max {np.max(nbt_rmsd_A):.2f} Å"
        )

    # --------------------------------------------------------------------------- #
    # Ligand–heme distance (skipped in apo mode or if either index is missing)
    # --------------------------------------------------------------------------- #
    # Reasoning: two distance metrics capture different aspects of binding.
    # Centroid-to-centroid (geometric mean of heavy atoms) gives a stable,
    # low-noise signal for tracking overall approach/departure. Minimum
    # heavy-atom distance captures the closest contact and is sensitive to
    # transient interactions at the binding interface. Both are measured in the
    # protein-aligned frame (after align_frames), so the signal reflects real
    # relative motion of the two molecules, not rigid-body translation of the
    # protein. Pairwise broadcast over (n_hem × n_nbt) is fast because both
    # ligands are small (<50 heavy atoms each).
    if no_ligand or len(hem_idx) == 0 or len(nbt_idx) == 0:
        if not no_ligand:
            print("[WARN] HEM or NBT indices empty; skipping ligand–heme distance plot")
        return

    banner("Stage 3.6: ligand–heme distance over time")

    hem_xyz = t.xyz[:, hem_idx, :]   # (n_frames, n_hem, 3)  nm
    nbt_xyz = t.xyz[:, nbt_idx, :]   # (n_frames, n_nbt, 3)  nm

    centroid_dist_A = np.linalg.norm(
        hem_xyz.mean(axis=1) - nbt_xyz.mean(axis=1), axis=1
    ) * 10.0   # nm -> Å

    # Pairwise: (n_frames, n_hem, 1, 3) - (n_frames, 1, n_nbt, 3) -> min over atoms
    diff = hem_xyz[:, :, None, :] - nbt_xyz[:, None, :, :]
    min_dist_A = np.sqrt((diff ** 2).sum(axis=-1)).min(axis=(1, 2)) * 10.0

    # Compute solute_mask here — reused in Stage 3.7 for SASA.
    solute_mask = np.array([a.index for a in t.topology.atoms
                            if a.residue.name not in _STANDARD_SOLVENT_OR_ION])

    # Validate and resolve the optional atom subset by atom name.
    # Names are read directly from column 3 of solute_top.pdb — no index arithmetic.
    subset_positions = None   # positions within nbt_idx; used later for SASA
    subset_global = None      # full-trajectory atom indices; used for t.xyz distance
    subset_label = ""
    if substrate_atoms is not None:
        nbt_name_to_idx = {t.topology.atom(int(i)).name: int(i) for i in nbt_idx}
        bad = [n for n in substrate_atoms if n not in nbt_name_to_idx]
        if bad:
            print(
                f"[WARN] --substrate-atoms names not found in NBT heavy atoms: "
                f"{bad} — subset ignored\n"
                f"       available NBT atom names: {sorted(nbt_name_to_idx.keys())}"
            )
        else:
            full_indices = [nbt_name_to_idx[n] for n in substrate_atoms]
            subset_global = np.array(full_indices, dtype=int)
            subset_positions = np.array(
                [np.where(nbt_idx == fi)[0][0] for fi in full_indices], dtype=int
            )
            subset_label = ", ".join(substrate_atoms)
            sub_centroid_dist_A = np.linalg.norm(
                hem_xyz.mean(axis=1) - t.xyz[:, subset_global, :].mean(axis=1), axis=1
            ) * 10.0
            print(f"[..] subset — {len(subset_global)} atoms selected:")
            for name, fi in zip(substrate_atoms, full_indices):
                atom = t.topology.atom(fi)
                n_ter = atom.residue.chain.index  # one TER per preceding chain
                pdb_serial = atom.index + 1 + n_ter
                print(f"       name {atom.name:<4s}  elem {atom.element.symbol}  serial {pdb_serial}")

    dist_csv_path = out_dir / dist_csv
    if subset_positions is not None:
        np.savetxt(
            dist_csv_path,
            np.column_stack([times_ps, centroid_dist_A, min_dist_A, sub_centroid_dist_A]),
            delimiter=",",
            header="time_ps,centroid_dist_A,min_dist_A,subset_centroid_dist_A",
            comments="",
            fmt="%.4f",
        )
    else:
        np.savetxt(
            dist_csv_path,
            np.column_stack([times_ps, centroid_dist_A, min_dist_A]),
            delimiter=",",
            header="time_ps,centroid_dist_A,min_dist_A",
            comments="",
            fmt="%.4f",
        )
    print(f"[OK] wrote {dist_csv_path.name}  ({n_frames} rows)")

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(times_ns, centroid_dist_A,
            label=f"Centroid–centroid  ({nbt_label} vs {hem_label})",
            linewidth=1.6)
    ax.plot(times_ns, min_dist_A,
            label=f"Min heavy-atom  ({nbt_label} vs {hem_label})",
            linewidth=1.2, alpha=0.7)
    if subset_positions is not None:
        ax.plot(times_ns, sub_centroid_dist_A,
                label=f"Subset centroid  ({subset_label} vs {hem_label})",
                linewidth=1.4, linestyle="--")

    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("Distance (Å)")
    ax.set_title("Ligand–heme distance over time")
    ax.legend(loc="best")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    dist_png_path = out_dir / dist_png
    fig.savefig(dist_png_path, dpi=150)
    plt.close(fig)
    print(f"[OK] wrote {dist_png_path.name}")

    print(
        f"[..] centroid dist : "
        f"mean {np.mean(centroid_dist_A):.2f} Å, "
        f"min {np.min(centroid_dist_A):.2f} Å, "
        f"max {np.max(centroid_dist_A):.2f} Å"
    )
    print(
        f"[..] min atom dist : "
        f"mean {np.mean(min_dist_A):.2f} Å, "
        f"min {np.min(min_dist_A):.2f} Å, "
        f"max {np.max(min_dist_A):.2f} Å"
    )


    # --------------------------------------------------------------------------- #
    # Ligand SASA over time
    # --------------------------------------------------------------------------- #
    # Reasoning: SASA is computed on a solvent-stripped view of the trajectory
    # (protein + HEM + NBT only) so the protein shields the ligand atoms that are
    # buried in the binding site. Running Shrake-Rupley on the full solvated
    # trajectory would inflate the SASA (solvent molecules temporarily overlap
    # the probe sphere) and is 10× slower. We re-map nbt_idx from global atom
    # indices to solute-space indices after slicing. Rising SASA over time signals
    # the ligand exposing itself to solvent -- an early indicator of unbinding that
    # often precedes the distance threshold being crossed.
    banner("Stage 3.7: ligand SASA over time  (protein-shielded)")
    t_solute = t.atom_slice(solute_mask)
    global_to_solute = {int(orig): new for new, orig in enumerate(solute_mask)}
    nbt_idx_solute = np.array([global_to_solute[int(i)] for i in nbt_idx], dtype=int)

    sasa_nm2 = md.shrake_rupley(t_solute, mode="atom")      # (n_frames, n_solute) nm²
    nbt_sasa_A2 = sasa_nm2[:, nbt_idx_solute].mean(axis=1) * 100.0  # nm² -> Å² per atom

    sasa_csv_path = out_dir / sasa_csv
    if subset_positions is not None:
        subset_solute = nbt_idx_solute[subset_positions]
        sub_sasa_A2 = sasa_nm2[:, subset_solute].mean(axis=1) * 100.0
        np.savetxt(
            sasa_csv_path,
            np.column_stack([times_ps, nbt_sasa_A2, sub_sasa_A2]),
            delimiter=",",
            header="time_ps,nbt_mean_sasa_A2,subset_mean_sasa_A2",
            comments="",
            fmt="%.4f",
        )
    else:
        np.savetxt(
            sasa_csv_path,
            np.column_stack([times_ps, nbt_sasa_A2]),
            delimiter=",",
            header="time_ps,nbt_mean_sasa_A2",
            comments="",
            fmt="%.4f",
        )
    print(f"[OK] wrote {sasa_csv_path.name}  ({n_frames} rows)")

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(times_ns, nbt_sasa_A2, linewidth=1.4, color="tab:orange",
            label=f"{nbt_label}  ({len(nbt_idx)} heavy atoms)")
    if subset_positions is not None:
        ax.plot(times_ns, sub_sasa_A2, linewidth=1.4, linestyle="--",
                label=f"Subset  ({subset_label},  {len(subset_positions)} atoms)")
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("Mean SASA per atom (Ų)")
    ax.set_title("Ligand mean SASA per atom over time\n(protein-shielded — rising = unbinding)")
    ax.legend(loc="best")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    sasa_png_path = out_dir / sasa_png
    fig.savefig(sasa_png_path, dpi=150)
    plt.close(fig)
    print(f"[OK] wrote {sasa_png_path.name}")
    print(
        f"[..] NBT SASA : "
        f"mean {np.mean(nbt_sasa_A2):.1f} Ų, "
        f"min {np.min(nbt_sasa_A2):.1f} Ų, "
        f"max {np.max(nbt_sasa_A2):.1f} Ų"
    )
    if subset_positions is not None:
        print(
            f"[..] subset SASA ({subset_label}): "
            f"mean {np.mean(sub_sasa_A2):.1f} Ų, "
            f"min {np.min(sub_sasa_A2):.1f} Ų, "
            f"max {np.max(sub_sasa_A2):.1f} Ų"
        )


# --------------------------------------------------------------------------- #
# Residue–ligand minimum distance
# --------------------------------------------------------------------------- #
# Reasoning: minimum heavy-atom distance between a residue and the ligand is
# the most direct measure of contact. Centroid distance can miss tight contacts
# between large sidechains, so we broadcast (n_frames, n_res_atoms, n_nbt) and
# take the per-frame minimum. Results in Angstrom, one column per residue.
def compute_residue_nbt_distances(
    t: md.Trajectory,
    out_dir: Path,
    resseqs: list[int],
    ligand_resname: str,
    frame_spacing_ps: float,
    nbt_label: str | None,
    csv_name: str,
    png_name: str,
    centroid_png_name: str,
    rmsd_png_name: str,
) -> None:
    banner(f"Stage 3.8: residue–ligand minimum distances  (resSeq {resseqs})")

    nbt_idx, nbt_label_resolved = _resolve_ligand(t.topology, ligand_resname, rank=1, label="NBT")
    if len(nbt_idx) == 0:
        print("[WARN] ligand atoms not found; skipping residue–ligand distances")
        return
    if nbt_label is not None:
        nbt_label_resolved = nbt_label

    times_ps = np.arange(t.n_frames, dtype=float) * frame_spacing_ps
    times_ns = times_ps / 1000.0
    nbt_xyz = t.xyz[:, nbt_idx, :]  # (n_frames, n_nbt, 3)

    nbt_centroid = nbt_xyz.mean(axis=1)  # (n_frames, 3)

    results: dict[int, tuple[np.ndarray, np.ndarray, str, int]] = {}
    for resseq in resseqs:
        idx = t.topology.select(f"protein and resSeq {resseq} and not element H")
        if len(idx) == 0:
            print(f"[WARN] no heavy atoms found for resSeq {resseq}; skipping")
            continue
        res_name = t.topology.atom(int(idx[0])).residue.name
        res_xyz = t.xyz[:, idx, :]                              # (n_frames, n_res, 3)
        diff = res_xyz[:, :, None, :] - nbt_xyz[:, None, :, :] # (n_frames, n_res, n_nbt, 3)
        min_dist_A = np.sqrt((diff ** 2).sum(-1)).min(axis=(1, 2)) * 10.0
        centroid_dist_A = np.linalg.norm(res_xyz.mean(axis=1) - nbt_centroid, axis=1) * 10.0
        rmsd_A = _drift_rmsd(t, idx) * 10.0
        results[resseq] = (min_dist_A, centroid_dist_A, rmsd_A, res_name, len(idx))
        print(
            f"[OK] resSeq {resseq} ({res_name}): {len(idx)} heavy atoms  "
            f"min dist mean {np.mean(min_dist_A):.2f} Å  "
            f"centroid dist mean {np.mean(centroid_dist_A):.2f} Å  "
            f"RMSD mean {np.mean(rmsd_A):.2f} Å"
        )

    if not results:
        print("[WARN] no valid residues resolved; skipping")
        return

    cols = [times_ps]
    header_parts = ["time_ps"]
    for resseq, (min_arr, centroid_arr, rmsd_arr, res_name, _) in results.items():
        cols.extend([min_arr, centroid_arr, rmsd_arr])
        header_parts.extend([
            f"{res_name}{resseq}_min_dist_A",
            f"{res_name}{resseq}_centroid_dist_A",
            f"{res_name}{resseq}_rmsd_A",
        ])

    csv_path = out_dir / csv_name
    np.savetxt(
        csv_path,
        np.column_stack(cols),
        delimiter=",",
        header=",".join(header_parts),
        comments="",
        fmt="%.4f",
    )
    print(f"[OK] wrote {csv_path.name}  ({t.n_frames} rows)")

    # Minimum distance plot
    fig, ax = plt.subplots(figsize=(10, 6))
    for resseq, (min_arr, _, _rmsd, res_name, n_atoms) in results.items():
        ax.plot(times_ns, min_arr,
                label=f"{res_name}{resseq} ({n_atoms} heavy atoms)", linewidth=1.4)
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("Min distance (Å)")
    ax.set_title(f"Residue–{nbt_label_resolved} minimum heavy-atom distance over time")
    ax.legend(loc="best")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    png_path = out_dir / png_name
    fig.savefig(png_path, dpi=150)
    plt.close(fig)
    print(f"[OK] wrote {png_path.name}")

    # Centroid distance plot
    fig, ax = plt.subplots(figsize=(10, 6))
    for resseq, (_, centroid_arr, _rmsd, res_name, n_atoms) in results.items():
        ax.plot(times_ns, centroid_arr,
                label=f"{res_name}{resseq} ({n_atoms} heavy atoms)", linewidth=1.4)
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("Centroid distance (Å)")
    ax.set_title(f"Residue–{nbt_label_resolved} centroid distance over time")
    ax.legend(loc="best")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    centroid_png_path = out_dir / centroid_png_name
    fig.savefig(centroid_png_path, dpi=150)
    plt.close(fig)
    print(f"[OK] wrote {centroid_png_path.name}")

    # RMSD plot
    fig, ax = plt.subplots(figsize=(10, 6))
    for resseq, (_, _dist, rmsd_arr, res_name, n_atoms) in results.items():
        ax.plot(times_ns, rmsd_arr,
                label=f"{res_name}{resseq} ({n_atoms} heavy atoms)", linewidth=1.4)
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("RMSD (Å)")
    ax.set_title("Residue RMSD vs time  (protein Cα-aligned frame, drift from frame 0)")
    ax.legend(loc="best")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    rmsd_png_path = out_dir / rmsd_png_name
    fig.savefig(rmsd_png_path, dpi=150)
    plt.close(fig)
    print(f"[OK] wrote {rmsd_png_path.name}")


def main() -> int:
    args = parse_args()
    out_dir = Path(args.output_dir)
    if not out_dir.is_dir():
        raise SystemExit(f"output dir {out_dir} not found")
    traj_path = out_dir / args.trajectory
    top_path = out_dir / args.topology

    t = load_trajectory(traj_path, top_path)
    fix_pbc(t)
    align_frames(t, args.align_selection)
    save_outputs(t, out_dir, args.keep_solvent, args.solvent_resnames)
    compute_rmsds(
        t,
        out_dir,
        args.hem_resname,
        args.ligand_resname,
        args.rmsd_csv,
        args.rmsd_png,
        args.frame_spacing_ps,
        args.no_ligand,
        args.dist_csv,
        args.dist_png,

        args.sasa_csv,
        args.sasa_png,
        args.substrate_atoms,
        args.ligand_label,
    )

    if args.phe_resseqs and not args.no_ligand:
        compute_residue_nbt_distances(
            t,
            out_dir,
            args.phe_resseqs,
            args.ligand_resname,
            args.frame_spacing_ps,
            args.ligand_label,
            args.phe_dist_csv,
            args.phe_dist_png,
            args.phe_centroid_png,
            args.phe_rmsd_png,
        )

    banner("Stage 3 complete")
    if args.keep_solvent:
        print(
            "Load in PyMOL with:\n"
            f"  load {out_dir / 'imaged_top.pdb'}, sys\n"
            f"  load_traj {out_dir / 'production_imaged.dcd'}, sys"
        )
    else:
        print(
            "Load in PyMOL with:\n"
            f"  load {out_dir / 'solute_top.pdb'}, sys\n"
            f"  load_traj {out_dir / 'production_solute.dcd'}, sys"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
