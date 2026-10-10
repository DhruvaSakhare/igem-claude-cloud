import { useEffect, useRef, useState } from "react";
import type { GLViewer } from "3dmol";

import { mmjsonToPdb } from "../contents/dry-lab/mmjson";
import { LACCASE_STRUCTURES } from "../contents/dry-lab/laccase-structures";
import type { LaccaseStructure } from "../contents/dry-lab/laccase-structures";
import type { FileRef } from "../contents/dry-lab/structures";
import "./StructureViewer.css";

/* ========================================================================== *
 *  LaccaseViewer — the laccase branch's 3D viewer (3Dmol.js, lazy-loaded)
 *
 *  A separate component from StructureViewer, on purpose. That one is built
 *  around overlays that each arrive as their OWN uploaded file (pocket surface,
 *  channel, docked pose) and carries alignment, hover cards, a channel-radius
 *  scale and a role-coloured residue legend. A laccase needs none of it: one
 *  file per structure, a surface computed in the browser, and a site that is a
 *  position rather than a file. Teaching the 1,300-line component a second
 *  feature set would have put three working viewers at risk for no gain.
 *
 *  What it DOES share is the stylesheet: StructureViewer.css (.sv-*) is
 *  imported here too, so the two read as the same object on the page. Keep the
 *  markup below in step with that file's class names.
 *
 *  Always drawn, with a legend entry rather than a toggle:
 *    • T1 copper site   — one sphere, see T1Site in laccase-structures.ts
 *    • HCH residues     — the three residues holding the T1 copper, as sticks
 *    • Docked substrate — only where the file carries one (`ligand`)
 *  One toggle, off until the reader asks for it:
 *    • Protein surface  — molecular surface, computed client-side
 *
 *  WHY ONLY ONE SPHERE. Four of the six files carry all four coppers (T1 plus
 *  the T2/T3 trio), two carry none. Drawing what each file happens to have
 *  would show four spheres on some tabs and one on others, which reads as a
 *  difference between the ENZYMES rather than between the files. So the metals
 *  in the file are never drawn; the viewer draws a single sphere at the T1
 *  site, and every tab means the same thing by it.
 * ========================================================================== */

/** Cartoon colour of the protein. Flat, like the UPO viewer's. */
const PROTEIN = "#4E82C5";
/** The T1 site marker — the site orange (--color-orange), the colour the
 *  figures already use for the T1 copper — and the HCH sticks, a darker shade
 *  of it so the two read apart. */
const T1 = "#ff6a14";
const HCH = "#b84200";
/** A docked substrate, where the file carries one. Green, so it reads apart
 *  from both the protein's blue and the site's oranges. */
const LIGAND = "#2E9E5B";
/** The computed surface. Pale and translucent so the cartoon still reads. */
const SURFACE = "#BFD8EF";

type ViewerState = "loading" | "ready" | "error";

/** Fetch a structure file and hand back PDB text.
 *
 *  Small enough to keep here rather than export StructureViewer's copy: that
 *  one is private to a component that is deliberately not being touched, and a
 *  five-line duplicate is cheaper than a shared module that exists to hold five
 *  lines. If a third viewer ever wants it, extract it then. */
async function fetchAsPdb(ref: FileRef): Promise<string> {
  const res = await fetch(ref.url);
  if (!res.ok) throw new Error(`${ref.url}: ${res.status}`);
  const text = await res.text();
  return ref.format === "mmjson" ? mmjsonToPdb(text) : text;
}

export function LaccaseViewer({
  structures = LACCASE_STRUCTURES,
}: {
  structures?: LaccaseStructure[];
} = {}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<GLViewer | null>(null);
  // Camera right after the first fit, so Reset restores exactly that.
  const homeViewRef = useRef<unknown[] | null>(null);
  // Id of the last structure rendered, to tell a tab change from a toggle.
  const prevIdRef = useRef<string | null>(null);
  // PDB text of the structure on screen, so a toggle does not refetch it.
  const textRef = useRef<{ id: string; pdb: string } | null>(null);

  const [activeId, setActiveId] = useState(structures[0].id);
  const [showSurface, setShowSurface] = useState(false);
  const [state, setState] = useState<ViewerState>("loading");
  const [spinning, setSpinning] = useState(false);

  const active = structures.find((s) => s.id === activeId) ?? structures[0];

  useEffect(() => {
    let cancelled = false;
    setState((s) => (s === "error" ? "loading" : s));

    (async () => {
      try {
        const mod = await import("3dmol");
        // Tolerate CJS/ESM interop, as StructureViewer does.
        const $3Dmol: typeof import("3dmol") =
          (mod as { default?: typeof import("3dmol") }).default ?? mod;

        const cached = textRef.current;
        const pdb =
          cached && cached.id === active.id
            ? cached.pdb
            : await fetchAsPdb(active.base);
        if (cancelled || !hostRef.current) return;
        textRef.current = { id: active.id, pdb };

        let viewer = viewerRef.current;
        if (!viewer) {
          viewer = $3Dmol.createViewer(hostRef.current, {
            backgroundColor: "#ffffff",
          });
          viewerRef.current = viewer;
        }
        const v = viewer; // const alias keeps null-narrowing inside closures
        v.removeAllModels();
        v.removeAllSurfaces();
        v.removeAllShapes();

        const model = v.addModel(pdb, "pdb");

        // The cartoon, and nothing else by default. The coppers in the file are
        // deliberately left unstyled — see the note at the top of this file.
        v.setStyle({ model }, { cartoon: { color: PROTEIN, opacity: 0.85 } });

        const { his1, cys, his2 } = active.hch;
        v.addStyle(
          { model, resi: [his1, cys, his2], hetflag: false },
          { stick: { radius: 0.22, color: HCH } },
        );

        if (active.ligand) {
          v.addStyle(
            { model, resn: "UNL", hetflag: true },
            { stick: { radius: 0.25, color: LIGAND } },
          );
        }

        v.addSphere({
          center: { x: active.t1.x, y: active.t1.y, z: active.t1.z },
          radius: 1.4,
          color: T1,
        });

        if (showSurface) {
          // addSurface's typed spec is stricter than the runtime, as in
          // StructureViewer; call it loosely. Call it ON `v` — pulled out into
          // a variable it loses `this` and throws on `this.nextSurfID`.
          await (
            v.addSurface as (
              a: unknown,
              b: unknown,
              c: unknown,
            ) => Promise<unknown>
          )(
            $3Dmol.SurfaceType.MS,
            { opacity: 0.68, color: SURFACE },
            { model, hetflag: false },
          );
          if (cancelled) return;
        }

        // Fit on a tab change; keep the reader's camera through a toggle.
        if (prevIdRef.current !== active.id) {
          v.zoomTo({ model });
          prevIdRef.current = active.id;
          homeViewRef.current = v.getView() as unknown[];
        }

        v.render();
        v.spin(spinning ? "y" : false);
        if (!cancelled) setState("ready");
      } catch (e) {
        console.warn("LaccaseViewer:", e);
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, showSurface, spinning]);

  // Drop the WebGL context when the viewer leaves the page.
  useEffect(
    () => () => {
      viewerRef.current = null;
    },
    [],
  );

  const resetView = () => {
    const v = viewerRef.current;
    if (!v) return;
    if (homeViewRef.current) v.setView(homeViewRef.current as never);
    else v.zoomTo();
    v.render();
  };

  const busy = state !== "ready";

  return (
    <div className="sv">
      <div className="sv-stage">
        <div
          className="sv-frame"
          role="img"
          aria-label={`3D structure of ${active.label}${
            active.accession ? ` (${active.accession.id})` : ""
          }`}
        >
          <div ref={hostRef} className="sv-canvas" />

          {state !== "ready" && (
            <div className="sv-veil">
              {state === "error" ? (
                <>
                  <span className="sv-mono">Couldn’t load {active.label}</span>
                  <p>
                    The 3D viewer failed to load this structure. Check your
                    connection or try another structure.
                  </p>
                </>
              ) : (
                <span className="sv-mono">Loading {active.label}…</span>
              )}
            </div>
          )}
        </div>
        <p className="sv-hint">
          Drag to rotate, scroll to zoom, right-drag to pan. {active.note}
        </p>
      </div>

      <div className="sv-rail">
        <div className="sv-group">
          <span className="sv-grouphead">Structure</span>
          <div className="sv-tabs" role="tablist" aria-label="Choose a laccase">
            {structures.map((s) => (
              <div className="sv-tab-row" key={s.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={s.id === activeId}
                  className={`sv-tab${s.pocket ? " sv-tab-stack" : ""}${
                    s.id === activeId ? " active" : ""
                  }`}
                  onClick={() => setActiveId(s.id)}
                >
                  <span className="sv-tab-name">
                    {s.label}
                    {s.accession && s.accession.id !== s.label && (
                      <span className="sv-tab-acc">{s.accession.id}</span>
                    )}
                  </span>
                  {s.pocket && (
                    <span className="sv-tab-acc sv-tab-code">
                      Pocket laccase
                    </span>
                  )}
                </button>
                {s.accession && (
                  <a
                    className="sv-cite"
                    href={s.accession.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${s.accession.id} on ${s.accession.source}`}
                    title={`${s.accession.id} on ${s.accession.source}`}
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sv-group">
          <span className="sv-grouphead">Key</span>
          <ul className="sv-legend">
            <li>
              <span
                className="sv-sw"
                style={{ background: T1 }}
                aria-hidden="true"
              />
              T1 copper site
            </li>
            <li>
              <span
                className="sv-sw"
                style={{ background: HCH }}
                aria-hidden="true"
              />
              HCH residues: His{active.hch.his1} · Cys{active.hch.cys} · His
              {active.hch.his2}
            </li>
            {active.ligand && (
              <li>
                <span
                  className="sv-sw"
                  style={{ background: LIGAND }}
                  aria-hidden="true"
                />
                {active.ligand}
              </li>
            )}
          </ul>
        </div>

        <div className="sv-group">
          <span className="sv-grouphead">Show</span>
          <div className="sv-overlays">
            <label className={`sv-toggle${showSurface ? " on" : ""}`}>
              <input
                type="checkbox"
                checked={showSurface}
                disabled={busy}
                onChange={() => setShowSurface((on) => !on)}
              />
              <span
                className="sv-sw"
                style={{ background: SURFACE }}
                aria-hidden="true"
              />
              Protein surface
            </label>
          </div>
        </div>

        <div className="sv-actions">
          <button
            type="button"
            className="sv-action"
            onClick={resetView}
            disabled={busy}
          >
            Reset view
          </button>
          <button
            type="button"
            className="sv-action"
            onClick={() => setSpinning((s) => !s)}
            disabled={busy}
          >
            {spinning ? "Stop spin" : "Spin"}
          </button>
        </div>
      </div>
    </div>
  );
}
