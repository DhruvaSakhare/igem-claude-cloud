#!/usr/bin/env python3
"""
Concatenate rep PNGs side by side for comparison.

Usage:
    python concat_reps.py <input_dir> <output_dir>

Example:
    python concat_reps.py ~/Desktop/MD_results ~/Desktop/MD_results/combined

Looks for folders matching A0* inside input_dir, finds PNGs with the same
base name across _rep1, _rep2, _rep3 folders, and stitches them horizontally.
"""

import sys
import os
import re
from pathlib import Path
from collections import defaultdict
from PIL import Image


def find_rep_folders(input_dir: Path) -> dict[str, list[Path]]:
    """Group A0* folders by their base name (without _repN suffix)."""
    groups = defaultdict(dict)
    for folder in sorted(input_dir.glob("A0*")):
        if not folder.is_dir():
            continue
        match = re.match(r"^(.*?)(_rep(\d+))?$", folder.name)
        if match:
            base = match.group(1)
            rep = int(match.group(3)) if match.group(3) else 1
            groups[base][rep] = folder
    return groups


def concat_images_horizontally(images: list[Image.Image]) -> Image.Image:
    """Stitch images side by side, aligning to max height."""
    max_height = max(img.height for img in images)
    total_width = sum(img.width for img in images)
    combined = Image.new("RGBA", (total_width, max_height), (255, 255, 255, 0))
    x_offset = 0
    for img in images:
        combined.paste(img, (x_offset, 0))
        x_offset += img.width
    return combined


def process_groups(input_dir: Path, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    groups = find_rep_folders(input_dir)

    if not groups:
        print(f"No A0* folders found in {input_dir}")
        return

    for base, rep_folders in sorted(groups.items()):
        if len(rep_folders) < 2:
            print(f"[SKIP] {base} — only 1 rep folder, nothing to combine")
            continue

        # Collect all PNG names present in every rep folder
        png_sets = {
            rep: {p.name for p in folder.glob("*.png")}
            for rep, folder in rep_folders.items()
        }
        shared_pngs = set.intersection(*png_sets.values())

        if not shared_pngs:
            print(f"[SKIP] {base} — no matching PNG names across reps")
            continue

        print(f"\n[{base}] Found {len(shared_pngs)} shared PNG(s) across reps {sorted(rep_folders.keys())}")

        base_output = output_dir / base
        base_output.mkdir(parents=True, exist_ok=True)

        for png_name in sorted(shared_pngs):
            images = []
            for rep in sorted(rep_folders.keys()):
                img_path = rep_folders[rep] / png_name
                img = Image.open(img_path).convert("RGBA")
                images.append(img)

            combined = concat_images_horizontally(images)
            # Save as RGB PNG (no alpha needed for most plots)
            out_path = base_output / png_name
            combined.convert("RGB").save(out_path)
            print(f"  ✓ {png_name}  ({' | '.join(f'rep{r}' for r in sorted(rep_folders.keys()))})")

    print(f"\nDone! Combined images saved to: {output_dir}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python concat_reps.py <input_dir> <output_dir>")
        sys.exit(1)

    input_dir = Path(sys.argv[1]).expanduser().resolve()
    output_dir = Path(sys.argv[2]).expanduser().resolve()

    if not input_dir.exists():
        print(f"Error: input directory not found: {input_dir}")
        sys.exit(1)

    process_groups(input_dir, output_dir)
