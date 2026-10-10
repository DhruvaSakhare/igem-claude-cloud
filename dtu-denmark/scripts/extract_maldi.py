#!/usr/bin/env python3
"""
Turn raw Bruker flex (XMASS) MALDI folders into compact JSON the wiki can load.

WHY THIS EXISTS
    The instrument writes one folder per sample containing `fid` (raw) and
    pdata/1/1r (processed) as 4-byte integers with NO m/z axis, plus `acqus`
    holding the calibration constants the axis is computed from. None of that is
    loadable by a browser, and the raw tree is ~13 MB of binary.

    This reads that tree and writes:
        spectra/axis.json      the shared m/z axis (identical for every sample)
        spectra/<id>.json      one sample's intensities
        spectra/index.json     the sample list + metadata

HOW THE m/z AXIS IS COMPUTED
    Bruker TOF2 calibration. For point i:
        t = DELAY + i * DW                      (flight time, ns)
        A = ML3,  B = sqrt(1e12 / ML1),  C = ML2 - t
        m/z = ((-B + sqrt(B^2 - 4AC)) / 2A)^2   (or (C/B)^2 when A == 0)
    ML1/ML2/ML3, DELAY and DW all come from `acqus`. This is the same formula
    used by readBrukerFlexData (MALDIquantForeign), and it reproduces the mass
    range flexAnalysis shows for these files.

DOWNSAMPLING
    Full resolution is 72,874 points per spectrum — 1.5M numbers across 21
    samples, which is far more than a plot needs and slow to ship. Points are
    reduced by MAX-pooling into BINS buckets: the tallest point in each bucket
    wins, so peak heights and positions survive. Averaging would flatten them.

USAGE
    python3 scripts/extract_maldi.py <raw-folder> <output-folder>
"""

import json
import math
import os
import re
import struct
import sys

# Display resolution. At 100–1000 Da this is ~0.075 Da per point, comfortably
# finer than the peak width of a linear TOF run, so nothing visible is lost.
BINS = 12000

# Which copy of the data to read: "1r" is the processed spectrum flexAnalysis
# shows (baseline-corrected, smoothed); "fid" is the untouched raw signal.
SOURCE = "1r"


def read_params(path):
    """Parse a Bruker `acqus`/`acqu` parameter file into a dict."""
    out = {}
    with open(path, errors="ignore") as fh:
        for line in fh:
            m = re.match(r"##\$(\w+)=\s*(.*)", line.strip())
            if m:
                out[m.group(1)] = m.group(2).strip()
    return out


def mz_axis(p):
    """The m/z value of every point, from the calibration constants."""
    td = int(p["TD"])
    dw = float(p["DW"])
    delay = float(p["DELAY"])
    ml1, ml2, ml3 = float(p["ML1"]), float(p["ML2"]), float(p["ML3"])

    b = math.sqrt(1e12 / ml1)
    axis = []
    for i in range(td):
        t = delay + i * dw
        c = ml2 - t
        if ml3 == 0:
            axis.append((c / b) ** 2)
            continue
        disc = b * b - 4 * ml3 * c
        axis.append(((-b + math.sqrt(disc)) / (2 * ml3)) ** 2 if disc >= 0 else float("nan"))
    return axis


def read_intensities(path, byte_order):
    """The 4-byte integer intensities, in acquisition order."""
    raw = open(path, "rb").read()
    n = len(raw) // 4
    fmt = ("<" if byte_order == 0 else ">") + str(n) + "i"
    return list(struct.unpack(fmt, raw[: n * 4]))


def max_pool(xs, bins):
    """Reduce to `bins` points, keeping the tallest value in each bucket."""
    if len(xs) <= bins:
        return xs
    step = len(xs) / bins
    return [max(xs[int(i * step) : max(int((i + 1) * step), int(i * step) + 1)]) for i in range(bins)]


def describe(sample):
    """
    Split a folder name like `Ny_2Hours_26002_Auto1` into its parts.

    The grouping is inferred from the names ONLY — it drives how the viewer
    lists and colours the spectra, nothing scientific. Check it against what you
    actually ran, and correct the index afterwards if a name is misleading.
    """
    name = sample.replace("Ny_", "")
    timepoint = "?"
    for key, label in (("30Minutes", "30 min"), ("2Hours", "2 h")):
        if key in name:
            timepoint = label
            name = name.replace(key + "_", "").replace(key, "")
    parts = [p for p in name.split("_") if p]
    strain = parts[0] if parts else "?"
    condition = parts[1] if len(parts) > 1 else ""
    replicate = ""
    m = re.match(r"([A-Za-z]+)(\d+)$", condition)
    if m:
        condition, replicate = m.group(1), m.group(2)
    return {
        "timepoint": timepoint,
        "strain": strain,
        "condition": condition,
        "replicate": replicate,
    }


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    raw_root, out_root = sys.argv[1], sys.argv[2]
    os.makedirs(out_root, exist_ok=True)

    axis = None
    index = []

    for dirpath, _, files in sorted(os.walk(raw_root)):
        if "acqus" not in files:
            continue
        data_file = os.path.join(dirpath, "pdata", "1", "1r") if SOURCE == "1r" else os.path.join(dirpath, "fid")
        if not os.path.exists(data_file):
            print("  skip (no %s): %s" % (SOURCE, dirpath))
            continue

        params = read_params(os.path.join(dirpath, "acqus"))
        rel = os.path.relpath(dirpath, raw_root).split(os.sep)
        sample, well = rel[0], rel[1] if len(rel) > 1 else "?"
        sample_id = re.sub(r"[^A-Za-z0-9]+", "-", sample).strip("-").lower()

        if axis is None:
            axis = max_pool(mz_axis(params), BINS)
            # 3 decimals is well inside the instrument's accuracy here and keeps
            # the file small.
            axis = [round(v, 3) for v in axis]
            json.dump(axis, open(os.path.join(out_root, "axis.json"), "w"))
            print("axis: %d points, %.1f – %.1f m/z" % (len(axis), axis[0], axis[-1]))

        ys = max_pool(read_intensities(data_file, int(params.get("BYTORDA", 0))), BINS)
        json.dump(
            {"id": sample_id, "intensity": ys},
            open(os.path.join(out_root, sample_id + ".json"), "w"),
        )

        entry = {"id": sample_id, "name": sample, "well": well, "max": max(ys)}
        entry.update(describe(sample))
        index.append(entry)
        print("  %-32s %s  max %d" % (sample, well, max(ys)))

    json.dump(
        {
            "source": os.path.basename(raw_root.rstrip("/")),
            "points": BINS,
            "data": SOURCE,
            "samples": index,
        },
        open(os.path.join(out_root, "index.json"), "w"),
        indent=1,
    )
    print("\n%d spectra written to %s" % (len(index), out_root))


if __name__ == "__main__":
    main()
