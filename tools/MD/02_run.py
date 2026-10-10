"""
Stage 2 (run in the `md-run` conda env -- only needs OpenMM):
   load serialized System + topology -> minimize -> NVT -> NPT -> production.

Usage:
    python 02_run.py --mode cpu  --prod-steps 1000          # smoke test
    python 02_run.py --mode gpu  --prod-steps 250000        # 1 ns @ 4 fs

Inputs (in --output-dir, written by 01_prep.py):
    system.xml
    system_solvated.pdb

Outputs:
    nvt.log, npt.log, production.log
    equilibrated.pdb, production.dcd, production.chk
    final.pdb, final.xml
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import numpy as np

import openmm as mm
from openmm import app, unit
from openmm.app import (
    CheckpointReporter,
    DCDReporter,
    PDBFile,
    Simulation,
    StateDataReporter,
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output-dir", default="md_output")
    p.add_argument(
        "--mode",
        choices=("cpu", "gpu"),
        default="cpu",
        help="cpu (testing) or gpu (CUDA mixed precision, production)",
    )
    p.add_argument("--min-steps", type=int, default=0)
    p.add_argument("--nvt-steps", type=int, default=25_000)
    p.add_argument("--npt-steps", type=int, default=25_000)
    p.add_argument("--prod-steps", type=int, default=250_000)
    p.add_argument("--report-interval", type=int, default=1_000)
    p.add_argument("--seed", type=int, default=2026)
    return p.parse_args()


def banner(title: str) -> None:
    print("\n" + "=" * 78)
    print(f"  {title}")
    print("=" * 78, flush=True)


# --------------------------------------------------------------------------- #
# Platform selection
# --------------------------------------------------------------------------- #
# Reasoning: gpu mode wants CUDA mixed precision but should silently fall back
# to CPU if the CUDA platform isn't registered (laptop / sandbox).
def pick_platform(mode: str) -> tuple[mm.Platform, dict]:
    if mode == "gpu":
        try:
            return mm.Platform.getPlatformByName("CUDA"), {"Precision": "mixed"}
        except Exception as exc:
            print(f"[WARN] CUDA unavailable ({exc}); falling back to CPU")
    return mm.Platform.getPlatformByName("CPU"), {}


# --------------------------------------------------------------------------- #
# Load serialized System + topology
# --------------------------------------------------------------------------- #
# Reasoning: the System (forces, masses, constraints, box) is the same across
# all stages -- only the integrator and barostat change. We deserialize once
# and pass the same `system` object through to each stage. Box vectors live in
# the PDB CRYST1 record and are read by PDBFile.
def load_inputs(out_dir: Path) -> tuple[mm.System, PDBFile]:
    banner("Stage 2.0: loading System + topology")
    system = mm.XmlSerializer.deserialize((out_dir / "system.xml").read_text())
    pdb = PDBFile(str(out_dir / "system_solvated.pdb"))
    print(
        f"[OK] System: {system.getNumParticles()} particles, "
        f"{system.getNumConstraints()} constraints"
    )
    print(
        f"[OK] Topology: {pdb.topology.getNumAtoms()} atoms, "
        f"{pdb.topology.getNumResidues()} residues"
    )
    return system, pdb


# --------------------------------------------------------------------------- #
# Minimization (NVT integrator)
# --------------------------------------------------------------------------- #
# Reasoning: addSolvent leaves grid-placed waters with multi-kJ clashes. We
# minimize first to avoid blowing up the integrator. Print energy before/after
# and abort if non-finite.
def minimize(sim: Simulation, max_iter: int) -> None:
    banner("Stage 2.1: energy minimization")
    e0 = (
        sim.context.getState(getEnergy=True)
        .getPotentialEnergy()
        .value_in_unit(unit.kilojoule_per_mole)
    )
    print(f"[..] PE before: {e0:,.1f} kJ/mol")
    t0 = time.time()
    sim.minimizeEnergy(maxIterations=max_iter if max_iter > 0 else 0)
    e1 = (
        sim.context.getState(getEnergy=True)
        .getPotentialEnergy()
        .value_in_unit(unit.kilojoule_per_mole)
    )
    print(f"[OK] PE after:  {e1:,.1f} kJ/mol   (dt = {time.time() - t0:.1f}s)")
    if not np.isfinite(e1):
        raise RuntimeError("Minimization produced non-finite energy")


# --------------------------------------------------------------------------- #
# NVT heating
# --------------------------------------------------------------------------- #
# Reasoning: thermalize at constant volume first -- velocity assignment causes
# pressure spikes that an NPT barostat would amplify into box thrashing. 2 fs
# timestep during equilibration; HBonds constraints make that safe.
def equilibrate_nvt(
    sim: Simulation, steps: int, report_interval: int, out_dir: Path
) -> None:
    dt_fs = sim.integrator.getStepSize().value_in_unit(unit.femtoseconds)
    banner(f"Stage 2.2: NVT equilibration ({steps} steps @ {dt_fs:g} fs)")
    sim.context.setVelocitiesToTemperature(300 * unit.kelvin)
    sim.reporters.append(
        StateDataReporter(
            str(out_dir / "nvt.log"),
            report_interval,
            step=True,
            time=True,
            potentialEnergy=True,
            kineticEnergy=True,
            totalEnergy=True,
            temperature=True,
            speed=True,
            separator="\t",
        )
    )
    sim.step(steps)
    print("[OK] NVT done")


# --------------------------------------------------------------------------- #
# NPT equilibration
# --------------------------------------------------------------------------- #
# Reasoning: add the MonteCarloBarostat to the existing System, then
# `reinitialize(preserveState=True)` so the context picks up the new force
# without losing positions/velocities.
def equilibrate_npt(
    sim: Simulation, steps: int, report_interval: int, out_dir: Path
) -> None:
    dt_fs = sim.integrator.getStepSize().value_in_unit(unit.femtoseconds)
    banner(f"Stage 2.3: NPT equilibration ({steps} steps @ {dt_fs:g} fs)")
    sim.system.addForce(
        mm.MonteCarloBarostat(1.0 * unit.atmospheres, 300 * unit.kelvin, 25)
    )
    sim.context.reinitialize(preserveState=True)
    sim.reporters.clear()
    sim.reporters.append(
        StateDataReporter(
            str(out_dir / "npt.log"),
            report_interval,
            step=True,
            time=True,
            potentialEnergy=True,
            temperature=True,
            volume=True,
            density=True,
            speed=True,
            separator="\t",
        )
    )
    sim.step(steps)
    state = sim.context.getState(getPositions=True, getVelocities=True)
    with open(out_dir / "equilibrated.pdb", "w") as fh:
        PDBFile.writeFile(sim.topology, state.getPositions(), fh, keepIds=True)
    print("[OK] NPT done -> equilibrated.pdb")


# --------------------------------------------------------------------------- #
# Production
# --------------------------------------------------------------------------- #
# Reasoning: the System was built by 01_prep.py with HMR (hydrogenMass=4 amu)
# + HBonds constraints + rigid water, which makes a 4 fs timestep safe through
# every stage. We therefore use a single Simulation/Context for the whole
# pipeline (minimize -> NVT -> NPT -> production). Building a second Context
# over the same System on the same GPU was the root cause of the
# "No compatible CUDA device" failure mid-run.
def production(
    sim: Simulation,
    steps: int,
    report_interval: int,
    out_dir: Path,
) -> None:
    dt_fs = sim.integrator.getStepSize().value_in_unit(unit.femtoseconds)
    banner(f"Stage 2.4: production MD ({steps} steps @ {dt_fs:g} fs)")
    sim.reporters.clear()
    sim.reporters.append(
        DCDReporter(str(out_dir / "production.dcd"), report_interval)
    )
    sim.reporters.append(
        StateDataReporter(
            str(out_dir / "production.log"),
            report_interval,
            step=True,
            time=True,
            potentialEnergy=True,
            temperature=True,
            volume=True,
            density=True,
            speed=True,
            remainingTime=True,
            totalSteps=steps,
            separator="\t",
        )
    )
    sim.reporters.append(
        CheckpointReporter(str(out_dir / "production.chk"), report_interval * 10)
    )

    t0 = time.time()
    sim.step(steps)
    elapsed = time.time() - t0
    ns = steps * dt_fs * 1e-6
    print(
        f"[OK] production done: {ns:.3f} ns in {elapsed:.1f}s "
        f"(~{ns / max(elapsed / 86400, 1e-9):.2f} ns/day)"
    )

    final_state = sim.context.getState(
        getPositions=True, getVelocities=True, enforcePeriodicBox=True
    )
    with open(out_dir / "final.pdb", "w") as fh:
        PDBFile.writeFile(
            sim.topology, final_state.getPositions(), fh, keepIds=True
        )
    sim.saveState(str(out_dir / "final.xml"))
    print("[OK] final.pdb and final.xml written")


def main() -> int:
    args = parse_args()
    out_dir = Path(args.output_dir)

    if not out_dir.exists():
        raise SystemExit(
           f"output dir {out_dir} not found -- run 01_prep.py first"
        )

    system, pdb = load_inputs(out_dir)

    # Single integrator used throughout: 4 fs is safe because 01_prep.py
    # baked HMR (hydrogenMass=4 amu) + HBonds constraints + rigid water into
    # the System. Reusing one Context/Simulation across all stages avoids the
    # double-Context CUDA failure we hit when recreating it for production.
    integrator = mm.LangevinMiddleIntegrator(
        300 * unit.kelvin, 1.0 / unit.picosecond, 4.0 * unit.femtoseconds
    )
    integrator.setRandomNumberSeed(args.seed)
    platform, plat_props = pick_platform(args.mode)
    sim = Simulation(pdb.topology, system, integrator, platform, plat_props)
    sim.context.setPositions(pdb.positions)
    if pdb.topology.getPeriodicBoxVectors() is not None:
        sim.context.setPeriodicBoxVectors(*pdb.topology.getPeriodicBoxVectors())
    print(f"[OK] platform = {platform.getName()}  (props={plat_props})")

    minimize(sim, args.min_steps)
    equilibrate_nvt(sim, args.nvt_steps, args.report_interval, out_dir)
    equilibrate_npt(sim, args.npt_steps, args.report_interval, out_dir)
    production(sim, args.prod_steps, args.report_interval, out_dir)

    banner("All stages complete")
    print(f"[OK] outputs in {out_dir.resolve()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
