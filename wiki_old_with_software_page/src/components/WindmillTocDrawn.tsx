import { useState } from "react";
import { useActiveSection } from "./WindmillToc";
import type { TocSection } from "./WindmillToc";

// ─────────────────────────────────────────────────────────────────────────────
// DRAWN WINDMILL TABLE OF CONTENTS
//
// Uses the hand-drawn art in /public/TOC. The bar (mast) is pinned to the far
// left with spinning blades attached to its top:
//   • Blades: one per section. As you scroll to the next section the rotor
//     spins so that section's blade becomes horizontal (scroll-spy driven).
//   • Tabs: your drawn points sit on the bar. Clicking one expands it (swaps
//     to the larger active drawing) and scrolls to that section.
//
// FOR iGEM DEPLOY: the CDN strips SVGs — export these as PNGs, upload via the
// uploads tool, and swap the URLs below for the static.igem.wiki ones.
// ─────────────────────────────────────────────────────────────────────────────

// === ART: your drawings (local dev paths) ===
const BAR_IMG =
  "https://static.igem.wiki/teams/6060/wiki/toc/toc-windmill-bar.avif"; // 80 × 1000
const POINT_IMG =
  "https://static.igem.wiki/teams/6060/wiki/toc/toc-windmill-point.avif"; // 153 × 33
const POINT_ACTIVE_IMG =
  "https://static.igem.wiki/teams/6060/wiki/toc/toc-windmill-point-active.avif"; // 184 × 42
const BLADE_IMG =
  "https://static.igem.wiki/teams/6060/wiki/toc/toc-windmill-blade.avif"; // 989 × 156
const NODE_IMG =
  "https://static.igem.wiki/teams/6060/wiki/toc/toc-windmill-node.avif"; // 207 × 188

// === TUNEABLE SIZES ===
const BAR_WIDTH = 60; // px — mast width. Lower = narrower bar.
const POINT_W = BAR_WIDTH; // idle tab is exactly as wide as the bar
const POINT_H = 22; // px — idle tab height
const POINT_ACTIVE_W = 125; // px — active tab width (sticks out past the bar)
const POINT_ACTIVE_H = 35; // px — active tab height
const BAR_HEIGHT = 600; // px — visible mast height

// Node art (native 207×188). Pinned rather than derived from BAR_WIDTH, so
// narrowing the mast no longer shrinks the whole rotor with it.
const NODE_W = 120;
const NODE_H = Math.round(NODE_W * (188 / 207));
// Blade length and height are independent: height is a fixed value instead of
// being derived from the length, so the blades can grow longer without also
// growing thicker. (This stretches the drawing past its native 6.3:1 ratio —
// that's intentional here; raise BLADE_W if they start to look too spindly.)
const BLADE_LEN = Math.round(NODE_W * 6); // px — blade length
const BLADE_W = 57; // px — blade thickness, held constant
// Rotor hub distance from the top of the nav. Smaller = node sits higher
// (upward-pointing blades may extend above the nav, which is fine visually).
const ROTOR_TOP = Math.round(BLADE_LEN * 0.55);
// Nudge the node drawing so its visible circle sits exactly on the rotation
// point (use these if the hub looks off-centre in the node's canvas).
const NODE_OFFSET_X = 0; // px — positive moves the node right
const NODE_OFFSET_Y = 0; // px — positive moves the node down
// How far the blade roots are tucked in under the node. 0 = roots end exactly
// at the rotation point (fully hidden behind the node).
const BLADE_ROOT_INSET = 0;
// Non-active blades are translucent so they don't hide the TOC tabs when a
// blade sweeps over the bar. The horizontal (active) blade stays solid.
const INACTIVE_BLADE_OPACITY = 0.35;

export function WindmillTocDrawn({ sections }: { sections: TocSection[] }) {
  // Scroll-spy: which section is currently in view (drives the rotor).
  const activeIndex = useActiveSection(sections);
  // Which tab is expanded from a click. null = none.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (sections.length === 0) return null;

  const n = sections.length;
  const step = 360 / n; // angular spacing between blades
  // Spin the rotor so the active section's blade lies horizontal (pointing right).
  const rotorAngle = activeIndex * step;
  const hubX = BAR_WIDTH / 2; // rotor sits centred on top of the bar

  return (
    <nav
      aria-label="Table of contents"
      style={{
        position: "fixed",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 900,
        width: BAR_WIDTH,
        height: ROTOR_TOP + BAR_HEIGHT,
      }}
    >
      {/* ── ROTOR: spinning blades attached to the top of the bar ─────────── */}
      <div
        style={{
          position: "absolute",
          left: hubX,
          top: ROTOR_TOP,
          width: 0,
          height: 0,
          transform: `rotate(${rotorAngle}deg)`,
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 1, // blades sit under the node
        }}
      >
        {sections.map((section, i) => {
          const active = i === activeIndex;
          const bladeAngle = i * step; // fixed position on the rotor
          return (
            <button
              key={`blade-${section.id}`}
              onClick={() => scrollTo(section.id)}
              title={section.label}
              style={{
                position: "absolute",
                // Offset by half the blade height so the pivot (left-centre of
                // the drawing) sits exactly on the hub for every angle.
                left: -BLADE_ROOT_INSET,
                top: -BLADE_W / 2,
                width: BLADE_LEN,
                height: BLADE_W,
                transformOrigin: `${BLADE_ROOT_INSET}px 50%`,
                transform: `rotate(${bladeAngle}deg)`,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                opacity: active ? 1 : INACTIVE_BLADE_OPACITY,
                transition: "opacity 0.4s ease",
              }}
            >
              {/* Your drawn blade (stays white; the horizontal one is the active section) */}
              <img
                src={BLADE_IMG}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Node (hub cap) — your drawing, centred on the rotation point,
          drawn over the blade roots to hide the seam */}
      <img
        src={NODE_IMG}
        alt=""
        style={{
          position: "absolute",
          left: hubX - NODE_W / 2 + NODE_OFFSET_X,
          top: ROTOR_TOP - NODE_H / 2 + NODE_OFFSET_Y,
          width: NODE_W,
          height: NODE_H,
          pointerEvents: "none",
          zIndex: 2, // overlaps the blade roots, hiding the seam
        }}
      />

      {/* ── SECTION HEADER on the horizontal blade ─────────────────────────
          The active section's title sits on the blade that is currently
          horizontal, making the blade act as the header of that section. */}
      <span
        key={sections[activeIndex]?.id} // re-mounts on change to replay the fade-in
        style={{
          position: "absolute",
          left: hubX + NODE_W / 2 + 12, // starts just right of the node
          top: ROTOR_TOP,
          transform: "translateY(-50%)",
          zIndex: 3,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 700,
          fontSize: "1.5rem",
          color: "#27476E",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          animation: "tocHeaderFade 0.8s ease both",
        }}
      >
        {sections[activeIndex]?.label}
      </span>
      <style>{`
        @keyframes tocHeaderFade {
          0%   { opacity: 0; }
          50%  { opacity: 0; }  /* wait for the rotor to finish most of its spin */
          100% { opacity: 1; }
        }
      `}</style>

      {/* ── The drawn bar (mast), hanging below the rotor ─────────────────── */}
      <img
        src={BAR_IMG}
        alt=""
        style={{
          position: "absolute",
          left: 0,
          top: ROTOR_TOP,
          width: BAR_WIDTH,
          height: BAR_HEIGHT,
          objectFit: "fill",
          pointerEvents: "none", // clicks pass through to the tabs
        }}
      />

      {/* ── The TOC tabs along the bar ───────────────────────────────────── */}
      {sections.map((section, i) => {
        const active = openIndex === i;
        const w = active ? POINT_ACTIVE_W : POINT_W;
        const h = active ? POINT_ACTIVE_H : POINT_H;
        return (
          <button
            key={section.id}
            onClick={() => {
              setOpenIndex(active ? null : i); // toggle expand
              scrollTo(section.id);
            }}
            style={{
              position: "absolute",
              // Spread tabs down the bar below the rotor.
              top: ROTOR_TOP + ((i + 0.5) / sections.length) * BAR_HEIGHT,
              left: 0,
              transform: "translateY(-50%)",
              width: w,
              height: h,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              zIndex: 3, // tabs stay clickable/visible above any sweeping blade
              // Smooth grow between the idle and active sizes.
              transition: "width 0.3s ease, height 0.3s ease",
            }}
          >
            {/* The drawn tab — swaps to the bigger active drawing on click */}
            <img
              src={active ? POINT_ACTIVE_IMG : POINT_IMG}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />

            {/* Section label — sits on top of the drawn tab */}
            <span
              style={{
                position: "relative",
                fontFamily: "Outfit, sans-serif",
                fontWeight: active ? 700 : 600,
                // Idle tabs are only as wide as the narrow bar, so their label
                // is set small to fit; the expanded tab gets room to breathe.
                fontSize: active ? "0.85rem" : "0.58rem",
                color: "#27476E",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                display: "block",
                padding: "0 8px",
                lineHeight: `${h}px`,
                transition: "font-size 0.3s ease",
              }}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
