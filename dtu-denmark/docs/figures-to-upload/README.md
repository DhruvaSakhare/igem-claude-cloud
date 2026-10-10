# Figures waiting to be uploaded

Files here are **not used by the site**. They are figures that have been fixed
locally and still need to go through the iGEM uploads tool, because that is the
only way an image may be served on the wiki (see the repo README).

Once a file here is uploaded and its URL is swapped into the page, delete it
from this folder.

---

## `laccase-prosmith-docking-tree-trimmed.png`

**Replaces:** Figure 4 on the Model — Discovery page (the 189-sequence tree
after ProSmith & docking analysis), currently served from
`https://static.igem.wiki/teams/6060/wiki/drylab/laccase-discovery/screenshot-2026-06-12-at-11-11-05.avif`

**What was wrong:** the uploaded screenshot is 1504×1234, and its left 398
pixels are completely blank — no ink at all. That empty band is what pushed the
tree off-centre.

**What was done:** the blank band on the left and the blank strip along the top
were trimmed off. Nothing inside the figure was altered: no part of the tree,
the circles, the stars or the red ellipse was moved, redrawn or recoloured. The
result is 1126×1192 with the tree centred.

**What is still wrong, and only you can fix it:** the screenshot was taken with
the right-hand side of the plot already cut off — the red ellipse runs off the
right edge of the image file, and some of the outer labels and bars with it.
Trimming cannot bring back something the file never contained. To fix it
properly, re-export the figure from iTOL (or re-take the screenshot) with the
whole ellipse inside the frame, and upload that instead of this one.

### How to swap it in

1. Upload the file with the iGEM uploads tool.
2. Copy the URL it gives you.
3. In `src/contents/dry-lab/model_discovery.tsx`, find `screenshot-2026-06-12`
   and replace that whole `src` line with the new URL.
4. Delete this file and this section from the README.
