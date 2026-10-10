/* ========================================================================== *
 *  Structural superposition — least-squares fit of one structure onto another
 *
 *  3Dmol.js has NO superposition routine (its "align" symbols are sprite
 *  alignment and zlib internals), so the fit is done here and the moved
 *  structure is handed to 3Dmol as ordinary PDB text.
 *
 *  WHAT IS FITTED ONTO WHAT, and why it is defensible:
 *
 *  The two structures are superposed on their SHARED HEME, not on their
 *  backbones. That choice is what makes this honest without a sequence
 *  alignment:
 *    • The heme is one chemical entity with 43 atoms carrying standard PDB
 *      names (C1A, CHA, FE, NA…). Every structure in this catalogue that has a
 *      heme has the same 43 names, so atom-to-atom correspondence is EXACT and
 *      read off the files — nothing is guessed, threaded or aligned.
 *    • Backbone superposition would need a residue-to-residue correspondence
 *      between proteins of different length and different numbering (9HE9 vs a
 *      335-residue designed backbone). That means sequence or structure
 *      alignment, with its own parameters and failure modes — a much bigger
 *      claim to bury inside a viewer.
 *    • It is the frame the comparison is about: putting both cofactors in
 *      register puts both active sites in register, which is the point when
 *      comparing the access channels above them.
 *
 *  So a fit here says "these two cofactors have been placed on top of each
 *  other" and NOTHING about how similar the two proteins are. Do not present
 *  the RMSD it reports as a measure of structural similarity between the
 *  enzymes: it is the residual on the heme atoms alone, and on a rigid planar
 *  group it is small (~0.4 Å) even for structures that differ everywhere else.
 *
 *  METHOD: the quaternion form of the optimal-rotation problem (Horn 1987),
 *  not SVD — the largest eigenvector of a symmetric 4×4 built from the
 *  correlation matrix is the rotation, and a 4×4 symmetric eigenproblem is a
 *  short Jacobi sweep, where an SVD would need a whole decomposition routine.
 *  It is the same optimum either way.
 * ========================================================================== */

export type Vec3 = [number, number, number];

/** The rigid motion taking the mobile structure onto the reference: rotate
 *  about the mobile centroid, then translate onto the reference centroid. */
export type Transform = {
  /** Row-major 3×3 rotation. */
  rot: number[];
  /** Centroid of the fitted mobile atoms (subtracted before rotating). */
  from: Vec3;
  /** Centroid of the fitted reference atoms (added after rotating). */
  to: Vec3;
  /** Residual on the FITTED ATOMS ONLY — see the header note. */
  rmsd: number;
  /** How many atoms were paired. */
  n: number;
};

/**
 * Atoms of one HETATM residue type, keyed by atom name.
 *
 * Reads the fixed PDB columns rather than splitting on whitespace, for the same
 * reason the rest of this project does: the fields can run together.
 */
export function hetAtomsByName(
  pdbText: string,
  resName: string,
): Map<string, Vec3> {
  const out = new Map<string, Vec3>();
  for (const line of pdbText.split("\n")) {
    if (!line.startsWith("HETATM")) continue;
    if (line.slice(17, 20).trim() !== resName) continue;
    const name = line.slice(12, 16).trim();
    const x = parseFloat(line.slice(30, 38));
    const y = parseFloat(line.slice(38, 46));
    const z = parseFloat(line.slice(46, 54));
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) continue;
    // First occurrence wins: an altLoc or a second copy of the cofactor would
    // otherwise silently replace the atom already paired.
    if (!out.has(name)) out.set(name, [x, y, z]);
  }
  return out;
}

const centroid = (pts: Vec3[]): Vec3 => {
  const c: Vec3 = [0, 0, 0];
  for (const p of pts) {
    c[0] += p[0];
    c[1] += p[1];
    c[2] += p[2];
  }
  return [c[0] / pts.length, c[1] / pts.length, c[2] / pts.length];
};

/** Largest-eigenvalue eigenvector of a symmetric 4×4, by cyclic Jacobi. */
function largestEigenvector(m: number[][]): number[] {
  // Work on copies: the sweep destroys both.
  const a = m.map((r) => r.slice());
  const v = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  for (let sweep = 0; sweep < 64; sweep++) {
    let off = 0;
    for (let p = 0; p < 4; p++)
      for (let q = p + 1; q < 4; q++) off += a[p][q] * a[p][q];
    if (off < 1e-18) break;
    for (let p = 0; p < 4; p++) {
      for (let q = p + 1; q < 4; q++) {
        if (Math.abs(a[p][q]) < 1e-18) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t =
          Math.sign(theta || 1) /
          (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < 4; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < 4; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  let best = 0;
  for (let i = 1; i < 4; i++) if (a[i][i] > a[best][best]) best = i;
  return [v[0][best], v[1][best], v[2][best], v[3][best]];
}

/**
 * Least-squares rigid fit of `mobile` onto `ref`, over the atom names present
 * in both maps. Returns null if fewer than three atoms pair up — two points
 * leave the rotation about their axis undetermined, so there is no fit to
 * report rather than a silently arbitrary one.
 */
export function superpose(
  mobile: Map<string, Vec3>,
  ref: Map<string, Vec3>,
): Transform | null {
  const names = [...mobile.keys()].filter((k) => ref.has(k)).sort();
  if (names.length < 3) return null;

  const P = names.map((n) => mobile.get(n)!);
  const Q = names.map((n) => ref.get(n)!);
  const cp = centroid(P);
  const cq = centroid(Q);
  const p = P.map((a): Vec3 => [a[0] - cp[0], a[1] - cp[1], a[2] - cp[2]]);
  const q = Q.map((a): Vec3 => [a[0] - cq[0], a[1] - cq[1], a[2] - cq[2]]);

  // Correlation matrix R = Σ p ⊗ q.
  const R = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let k = 0; k < p.length; k++)
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) R[i][j] += p[k][i] * q[k][j];

  // Horn's symmetric 4×4; its top eigenvector is the optimal rotation as a
  // quaternion (w, x, y, z).
  const [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]] = R;
  const K = [
    [xx + yy + zz, yz - zy, zx - xz, xy - yx],
    [yz - zy, xx - yy - zz, xy + yx, zx + xz],
    [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
    [xy - yx, zx + xz, yz + zy, -xx - yy + zz],
  ];
  const [w, x, y, z] = largestEigenvector(K);

  const rot = [
    1 - 2 * (y * y + z * z),
    2 * (x * y - w * z),
    2 * (x * z + w * y),
    2 * (x * y + w * z),
    1 - 2 * (x * x + z * z),
    2 * (y * z - w * x),
    2 * (x * z - w * y),
    2 * (y * z + w * x),
    1 - 2 * (x * x + y * y),
  ];

  let sum = 0;
  for (let k = 0; k < p.length; k++) {
    const a = p[k];
    const rx = rot[0] * a[0] + rot[1] * a[1] + rot[2] * a[2];
    const ry = rot[3] * a[0] + rot[4] * a[1] + rot[5] * a[2];
    const rz = rot[6] * a[0] + rot[7] * a[1] + rot[8] * a[2];
    sum +=
      (rx - q[k][0]) ** 2 + (ry - q[k][1]) ** 2 + (rz - q[k][2]) ** 2;
  }

  return {
    rot,
    from: cp,
    to: cq,
    rmsd: Math.sqrt(sum / p.length),
    n: p.length,
  };
}

/**
 * Apply a transform to every ATOM/HETATM record of a PDB text, leaving all
 * other columns byte-identical.
 *
 * Rewrites columns 31–54 in place at the same 8.3 precision the format uses, so
 * the result stays valid fixed-column PDB for 3Dmol AND for this project's own
 * column-reading parsers (parseChannelPoints, parsePocketAtoms, parseHetGroups).
 * Coordinates outside ±9999.999 cannot be written in 8.3 and would corrupt the
 * columns; nothing in this catalogue comes close, and such a line is left
 * untouched rather than written wrong.
 */
export function transformPdb(pdbText: string, t: Transform): string {
  const { rot, from, to } = t;
  const num = (v: number) => v.toFixed(3).padStart(8);
  return pdbText
    .split("\n")
    .map((line) => {
      if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) return line;
      const x = parseFloat(line.slice(30, 38)) - from[0];
      const y = parseFloat(line.slice(38, 46)) - from[1];
      const z = parseFloat(line.slice(46, 54)) - from[2];
      if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) return line;
      const nx = rot[0] * x + rot[1] * y + rot[2] * z + to[0];
      const ny = rot[3] * x + rot[4] * y + rot[5] * z + to[1];
      const nz = rot[6] * x + rot[7] * y + rot[8] * z + to[2];
      if (Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz)) > 9999.999)
        return line;
      return line.slice(0, 30) + num(nx) + num(ny) + num(nz) + line.slice(54);
    })
    .join("\n");
}
