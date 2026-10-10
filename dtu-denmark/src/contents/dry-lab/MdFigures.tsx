import type { ReactNode } from "react";

import { ExpandableImage } from "./ExpandableImage";
import "./MdFigures.css";

/* ========================================================================== *
 *  Molecular-dynamics figures (.mdf-*)
 *
 *  Real plots produced by the team's MD analysis, served from iGEM's asset host
 *  (required — no external CDNs). Each URL is
 *  `<MD_BASE>/<slug>/<plot>.avif`, which is how the uploads tool named them.
 *  The slug is USUALLY the same id the structure viewer uses for that structure
 *  (see structures.ts), so a structure's plots and its 3D files are addressed
 *  alike and adding a structure to a row is one entry in that row's list. It is
 *  not guaranteed: the two RFdiffusion designs were uploaded under their full
 *  run name for the 3D files and a shortened one for the plots, so that row
 *  carries an explicit id → slug map (DESIGN_MD_SLUGS in model_engineering.tsx)
 *  rather than passing `s.id`. Check the upload rather than assuming.
 *
 *  Shared by four rows, which is why it lives here rather than on a page:
 *    • Discovery — the literature structures, and the database candidates;
 *    • Engineering — the rationally engineered team variants, and the
 *      RFdiffusion designs under UPOs generative design.
 *
 *  A slug only belongs in a row's list once ALL THREE plots exist for it under
 *  `molecular-dynamics/`. The host answers 403 for a missing one, which paints
 *  a broken image rather than nothing — so check before adding, do not assume a
 *  structure that has 3D files also has plots. PabUPO-II is the current
 *  example: it is a tab on the RFdiffusion viewer as the reference to compare
 *  the designs against, and it has no plots under this path, so it has no
 *  block.
 *
 *  THE FIGURES ARE REAL; the surrounding prose is placeholder. Do not write
 *  conclusions from these plots — the captions name the observable only.
 * ========================================================================== */

export const MD_BASE =
  "https://static.igem.wiki/teams/6060/wiki/drylab/molecular-dynamics";

/* The three plots, captioned as the team's own figure descriptions name them,
 * and in the order those documents present them (RMSD, then ligand-to-heme
 * distance, then SASA). MdFigureBlock appends "for <structure>" to each, as
 * the source descriptions do and as the tunnel-figure captions do — with the
 * figures numbered, a caption is also read on its own (in a reference, or out
 * of view of the name above the row), so it has to say which structure it is. */
export const MD_PLOTS = [
  {
    file: "rmsd-replicate",
    label: "RMSD analysis of protein backbone, HEME and NNBT",
  },
  {
    file: "ligand-heme-dist-replicate",
    label: "Ligand to heme distance analysis of NNBT",
  },
  {
    file: "nbt-sasa-replicate",
    label: "Solvent Accessible Surface Area analysis of NNBT",
  },
];

/** One structure's block: its name, an optional note, then the three plots.
 *
 *  `name` is what the reader sees and what the alt text names; `slug` is the
 *  upload path. They differ — "PaDa-I (5OXU)" is served from `5oxu/` — so both
 *  are passed rather than derived from one another. */
export function MdFigureBlock({
  name,
  slug,
  children,
}: {
  name: string;
  slug: string;
  children?: ReactNode;
}) {
  return (
    <div className="mdf-cand">
      <h5 className="mdf-acc">{name}</h5>
      {children ? <p className="mdf-note">{children}</p> : null}
      <div className="mdf-grid">
        {MD_PLOTS.map((plot) => (
          <figure className="mdf-fig numfig" key={plot.file}>
            <ExpandableImage
              src={`${MD_BASE}/${slug}/${plot.file}.avif`}
              /* No "PDB" prefix: the name already carries the id in brackets
                 where there is one, and not every structure named this way
                 has one. */
              alt={`${plot.label}, ${name}`}
              caption={`${plot.label} for ${name}`}
            />
            <figcaption>
              {plot.label} for {name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
