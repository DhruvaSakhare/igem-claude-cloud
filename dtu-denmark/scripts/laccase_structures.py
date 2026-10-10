#!/usr/bin/env python
"""Turn the laccase PyMOL sessions into the files the wiki viewer needs.

For each session in `docs/sources/structures wiki/` this writes, into
`scripts/out/`:

  <id>.pdb    the protein plus any copper ions, nothing else
  <id>.json   the same file as gemmi mmCIF-as-JSON, which is what gets
              uploaded (the iGEM uploads tool rejects .pdb) and what
              src/contents/dry-lab/mmjson.ts converts back in the browser
  report.json every T1 site and HCH motif it found, with the distances it
              decided on, for the team to check before anything ships

HOW THE T1 SITE IS CHOSEN
  In a multicopper oxidase the T1 copper is the one with a cysteine sulphur in
  its coordination sphere; the T2/T3 trio is held by histidines alone. So where
  a session carries real coppers, T1 is the copper with a CYS ligand within
  3.2 A — and in all four such sessions exactly one copper qualifies, so
  nothing is guessed.

  Where a session carries no copper, the site is the centroid of the three HCH
  ligating atoms (His ND1/NE2, Cys SG, His ND1/NE2), which is the same
  definition the team's docking program uses for its search box.

  The HCH motif itself is found from the structure, not from the sequence: the
  T1 cysteine, plus the two histidines whose ND1/NE2 lie nearest its SG.

WHY THE SESSIONS' OWN PSEUDOATOMS ARE NOT USED
  Two sessions mark the site with a pseudoatom. A0A517I632's `t1_centroid` is
  1.1 A from the HCH centroid, i.e. right. A0A7T1FRB0's `Cu_site` is 16.3 A
  away, i.e. wrong: its coordinates are three of the run's affinity values
  (-5.143, -5.042, -4.978), pasted into the position field from the wrong
  columns of the results CSV. That enzyme's docking itself used the correct
  centre (t1_cu = 11.9, -5.18, -3.63 in the results table, 1.1 A from the
  centroid computed here), so only the session is affected. Computing the site
  from the structure every time sidesteps the whole class of mistake.

RUNNING IT
  PyMOL is only needed for the .pse reading, gemmi only for the JSON:

    /Applications/PyMOL.app/Contents/MacOS/PyMOL -cq -r scripts/laccase_structures.py
    conda run -n biobuilders python scripts/laccase_structures.py --json

  The first pass writes the PDBs and the report; the second converts them.

UPLOADING THE RESULT
  Upload the six .json files — NOT the .pdb, which the iGEM uploads tool
  rejects, and not the .pse. Put each one in a folder named after its id, so it
  ends up at

    https://static.igem.wiki/teams/6060/wiki/drylab/structures/<id>/<id>.json

  which is the layout src/contents/dry-lab/laccase-structures.ts expects and the
  same one the UPO structures already use. If the tool renames a file, write the
  URL it actually gives you into that file instead — every entry's `base` takes
  a full URL.
"""

from __future__ import annotations

import json
import os
import sys

def _repo_root() -> str:
    """The checkout this script lives in.

    NOT derived from __file__: PyMOL's `-r` rewrites it to a path inside the
    app bundle, and the script then tries to write its output into
    /Applications. Walking up from the working directory to the package.json is
    stable under both PyMOL and a plain python.
    """
    d = os.path.abspath(os.getcwd())
    while True:
        if os.path.exists(os.path.join(d, "package.json")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            raise SystemExit("run this from inside the repository")
        d = parent


ROOT = _repo_root()
HERE = os.path.join(ROOT, "scripts")
SESSIONS = os.path.join(ROOT, "docs", "sources", "structures wiki")
OUT = os.path.join(HERE, "out")

# id -> (session file, object holding the protein; None = the one with most CAs)
# CueO.pse is the A0A517I632 session with the real CueO superposed onto it, so
# its protein has to be named explicitly or the wrong object comes out.
STRUCTURES = {
    "itl03": ("ItL03.pse", None),
    "cueo": ("CueO.pse", "reference"),
    "a0a517i632": ("A0A517I632.pse", "A0A517I632"),
    "a0a7t1frb0": ("A0A7T1FRB0.pse", "A0A7T1FRB0_2"),
    "a0a1h2rll0": ("A0A1H2RLL0.pse", None),
    "a0aaj2ktq9": ("A0AAJ2KTQ9.pse", None),
}

CU_LIGAND_CUTOFF = 3.2  # A, copper to His N / Cys S


def extract_all() -> None:
    """PyMOL pass: write <id>.pdb and report.json."""
    from pymol import cmd

    os.makedirs(OUT, exist_ok=True)
    report = {}

    for sid, (fname, want) in STRUCTURES.items():
        cmd.reinitialize()
        cmd.load(os.path.join(SESSIONS, fname), partial=0)

        objects = cmd.get_names("objects")
        prot = want or max(
            objects, key=lambda o: cmd.count_atoms("%%%s and name CA" % o)
        )

        # Protein and coppers only. Pseudoatoms are deliberately dropped: see
        # the module docstring.
        sel = "(%%%s and polymer) or (%%%s and elem Cu)" % (prot, prot)
        cmd.save(os.path.join(OUT, "%s.pdb" % sid), sel)

        entry = {
            "session": fname,
            "protein_object": prot,
            "other_objects": [o for o in objects if o != prot],
            "n_residues": cmd.count_atoms("%%%s and name CA" % prot),
            "n_copper": cmd.count_atoms("%%%s and elem Cu" % prot),
        }

        t1_cu = None
        for cu in cmd.get_model("%%%s and elem Cu" % prot).atom:
            cmd.pseudoatom("_probe", pos=cu.coord)
            ligands = _ligands_near(cmd, prot, "_probe", CU_LIGAND_CUTOFF)
            cmd.delete("_probe")
            if any(l["resn"] == "CYS" for l in ligands):
                if t1_cu is not None:
                    entry["WARNING"] = "more than one copper has a Cys ligand"
                t1_cu = {
                    "chain": cu.chain,
                    "resi": cu.resi,
                    "pos": [round(c, 3) for c in cu.coord],
                    "ligands": ligands,
                }
        entry["t1_from_copper"] = t1_cu

        if t1_cu is None:
            entry["t1_from_hch"] = _hch_site(cmd, prot)

        report[sid] = entry

    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    sys.stderr.write("wrote %s\n" % os.path.join(OUT, "report.json"))


def _ligands_near(cmd, prot: str, probe: str, cutoff: float) -> list:
    """His/Cys coordinating atoms within `cutoff` of `probe`, nearest per residue."""
    probe_pos = cmd.get_model(probe).atom[0].coord
    found = {}
    # `within` is an infix operator in PyMOL's selection language — "A and
    # within X of B" is a syntax error, "(A) within X of B" is what it wants.
    sel = "((%s) and polymer and resn HIS+CYS and name NE2+ND1+SG) within %s of %s" % (
        prot,
        cutoff,
        probe,
    )
    for a in cmd.get_model(sel).atom:
        d = sum((a.coord[i] - probe_pos[i]) ** 2 for i in range(3)) ** 0.5
        key = int(a.resi)
        if key not in found or d < found[key]["dist"]:
            found[key] = {
                "resi": key,
                "resn": a.resn,
                "atom": a.name,
                "dist": round(d, 2),
            }
    return sorted(found.values(), key=lambda x: x["resi"])


def _hch_site(cmd, prot: str) -> dict:
    """The HCH motif and its centroid, for a structure with no copper.

    The T1 cysteine is the one with two histidine nitrogens closest to its SG;
    in a laccase fold no other cysteine comes close, so the pick is not tight.
    """
    best = None
    for cys in cmd.get_model("(%s) and polymer and resn CYS and name SG" % prot).atom:
        his = []
        for a in cmd.get_model(
            "(%s) and polymer and resn HIS and name ND1+NE2" % prot
        ).atom:
            d = sum((a.coord[i] - cys.coord[i]) ** 2 for i in range(3)) ** 0.5
            his.append((d, int(a.resi), a.name, a.coord))
        his.sort()
        # one nitrogen per histidine
        picked, seen = [], set()
        for d, resi, name, coord in his:
            if resi in seen:
                continue
            seen.add(resi)
            picked.append((d, resi, name, coord))
            if len(picked) == 2:
                break
        score = picked[1][0]
        if best is None or score < best["score"]:
            centroid = [
                round(
                    (cys.coord[i] + picked[0][3][i] + picked[1][3][i]) / 3.0,
                    3,
                )
                for i in range(3)
            ]
            best = {
                "score": score,
                "cys": {"resi": int(cys.resi), "atom": "SG"},
                "his": [
                    {"resi": p[1], "atom": p[2], "dist_to_sg": round(p[0], 2)}
                    for p in picked
                ],
                "centroid": centroid,
            }
    best.pop("score", None)
    return best


def to_json() -> None:
    """gemmi pass: write <id>.json beside each <id>.pdb."""
    import gemmi

    for sid in STRUCTURES:
        pdb = os.path.join(OUT, "%s.pdb" % sid)
        if not os.path.exists(pdb):
            sys.stderr.write("missing %s — run the PyMOL pass first\n" % pdb)
            continue
        st = gemmi.read_structure(pdb)
        st.setup_entities()
        doc = st.make_mmcif_document()
        out = os.path.join(OUT, "%s.json" % sid)
        with open(out, "w") as fh:
            fh.write(doc.as_json())
        sys.stderr.write(
            "%s -> %s (%.0f kB)\n" % (pdb, out, os.path.getsize(out) / 1024)
        )


if __name__ == "__main__":
    if "--json" in sys.argv:
        to_json()
    else:
        extract_all()
