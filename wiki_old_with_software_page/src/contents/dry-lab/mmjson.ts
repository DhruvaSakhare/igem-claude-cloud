/* ========================================================================== *
 *  mmCIF-as-JSON → PDB text
 *
 *  Structure files uploaded through the iGEM uploads tool cannot be `.pdb`, so
 *  they are shipped as JSON produced by gemmi's `doc.as_json()`: mmCIF
 *  category/item tags (`_atom_site.cartn_x`, …) holding column-major arrays.
 *
 *  3Dmol.js CANNOT read that schema. Its "json" parser is Chemical JSON
 *  (Avogadro) — a completely different format — and its "cif" parser expects
 *  *text* mmCIF. So the JSON is converted back to PDB text here and handed to
 *  3Dmol's well-tested "pdb" parser.
 *
 *  Shared by the Discovery test viewer and the Engineering StructureViewer.
 * ========================================================================== */

/**
 * Convert gemmi mmCIF-as-JSON into PDB text.
 *
 * Reads the `_atom_site.*` columns and writes fixed-width PDB ATOM/HETATM
 * records. The column positions follow the PDB spec exactly — serial 7-11,
 * name 13-16, altLoc 17, resName 18-20, chain 22, resSeq 23-26, iCode 27,
 * x/y/z 31-54, occupancy 55-60, tempFactor 61-66, element 77-78 — because
 * 3Dmol (and this project's own parseChannelPoints / parsePocketResidues)
 * read by column position, not by whitespace.
 *
 * @throws if the JSON has no data block or lacks the `_atom_site` columns.
 */
export function mmjsonToPdb(text: string): string {
  const doc = JSON.parse(text) as Record<string, Record<string, unknown>>;
  const block = Object.values(doc)[0];
  if (!block) throw new Error("mmJSON: no data block");

  const col = <T>(tag: string): T[] => {
    const v = block[tag];
    if (!Array.isArray(v)) throw new Error(`mmJSON: missing ${tag}`);
    return v as T[];
  };

  const group = col<string>("_atom_site.group_pdb");
  const serial = col<number>("_atom_site.id");
  const element = col<string>("_atom_site.type_symbol");
  const atomId = col<string>("_atom_site.label_atom_id");
  const altLoc = col<string | null>("_atom_site.label_alt_id");
  const comp = col<string>("_atom_site.label_comp_id");
  const chain = col<string>("_atom_site.auth_asym_id");
  const seq = col<number | null>("_atom_site.auth_seq_id");
  const ins = col<string | null>("_atom_site.pdbx_pdb_ins_code");
  const xs = col<number>("_atom_site.cartn_x");
  const ys = col<number>("_atom_site.cartn_y");
  const zs = col<number>("_atom_site.cartn_z");
  const occ = col<number | null>("_atom_site.occupancy");
  const bfac = col<number | null>("_atom_site.b_iso_or_equiv");

  // mmCIF writes absent values as "." or "?"; PDB wants a blank column.
  const clean = (v: string | null | undefined) =>
    v == null || v === "." || v === "?" ? "" : v;
  const chr = (v: string | null | undefined) => clean(v)[0] ?? " ";
  const num = (n: number, w: number, d: number) => n.toFixed(d).padStart(w);

  const lines: string[] = [];
  for (let i = 0; i < serial.length; i++) {
    const el = clean(element[i]).toUpperCase();
    const name = clean(atomId[i]);
    // PDB convention: single-letter elements are indented one column, unless
    // the atom name already fills all four.
    const nameField =
      name.length >= 4 || el.length > 1
        ? name.padEnd(4).slice(0, 4)
        : ` ${name.padEnd(3)}`;

    lines.push(
      (group[i] === "HETATM" ? "HETATM" : "ATOM").padEnd(6) +
        String(serial[i]).padStart(5) +
        " " +
        nameField +
        chr(altLoc[i]) +
        clean(comp[i]).slice(0, 3).padStart(3) +
        " " +
        chr(chain[i]) +
        String(seq[i] ?? 0).padStart(4) +
        chr(ins[i]) +
        "   " +
        num(xs[i], 8, 3) +
        num(ys[i], 8, 3) +
        num(zs[i], 8, 3) +
        num(occ[i] ?? 1, 6, 2) +
        num(bfac[i] ?? 0, 6, 2) +
        " ".repeat(10) +
        el.padStart(2),
    );
  }
  lines.push("END");
  return lines.join("\n");
}
