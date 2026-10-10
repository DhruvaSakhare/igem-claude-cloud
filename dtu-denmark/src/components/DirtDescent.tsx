// ─────────────────────────────────────────────────────────────────────────────
// UNDERGROUND — the cross-section beneath the field
//
// The second half of the home-page scene: the camera keeps going down past the
// two blades stuck in the field, the ground rises, and the soil profile is
// revealed stratum by stratum.
//
// NOT a scene of its own. It renders INSIDE ZoomToLandscape's one sticky stage,
// as the block directly below the landscape in that stage's travelling column.
// It had its own sticky section once, which meant the landscape was drawn twice
// — the first stage unpinning as the second pinned on the same view, so the
// page appeared to play the scene over again.
//
// Because it is simply the next block in that column, the dirt starts exactly
// where the ground ends at every window size, with no offsets to keep in sync.
// ─────────────────────────────────────────────────────────────────────────────

// === ART ===
// Four strata, each drawn as a band on the same 2160×1620 canvas with ragged
// boundaries, so stacking them in order rebuilds one continuous section.
//
// LOCAL FOR NOW — before this can deploy they must be converted to AVIF and
// uploaded to static.igem.wiki (the wiki asset rules forbid shipping them from
// public/). When that happens, replace each URL; nothing else changes.
const ART = `${import.meta.env.BASE_URL}Dirt_layers/`;

/**
 * Top to bottom, in drawing order.
 *
 * They are NOT given different parallax speeds. A soil profile is one
 * continuous face: sliding the strata against each other would tear the
 * boundaries the artwork drew, which is exactly the detail that makes it read
 * as ground rather than as wallpaper. Anything that genuinely sits at a
 * different depth — a rock, a root, an embedded blade — can have its own rate.
 */
const STRATA = [
  { img: `${ART}Topsoil.png`, name: "topsoil" },
  { img: `${ART}Clay.png`, name: "clay" },
  { img: `${ART}Bedrock.png`, name: "bedrock" },
  { img: `${ART}Bottomlayer.png`, name: "bottom layer" },
];

// === TUNEABLE ===
/**
 * How far the column travels upward during the descent, in **vw**.
 *
 * In vw, not vh, and this is the whole trick: the artwork is 2160×1620 and is
 * drawn at full width, so its height is always exactly 75vw whatever the window
 * is doing. Travelling 75vw therefore lands the BOTTOM of the section on the
 * bottom of the viewport precisely, at every window size.
 *
 * In vh it could only ever be right at one window shape — too little and the
 * deepest stratum was never reached, too much and the page showed through below
 * the dirt, which is why a block of flat colour used to be painted under it.
 *
 * Exported because ZoomToLandscape owns the column and applies it.
 */
export const DESCENT_TRAVEL_VW = 75;

// The dirt is pulled up by a single pixel so sub-pixel rounding can never open
// a hairline at the seam with the ground above. Deliberately NOT a percentage:
// at 1.5% of the canvas width that is ~19px, which showed as a strip of dirt
// along the bottom of the screen all through the above-ground half.
const SEAM_OVERLAP_PX = 1;

// Sampled from the artwork's own top edge, so nothing shows through a gap
// between the ragged strata.
const TOPSOIL_TOP_COLOR = "#241004";

// ── Facts ────────────────────────────────────────────────────────────────────
// Positioned as % of the SECTION canvas, so each travels with the stratum it
// belongs to rather than floating over the viewport. `at` is its fade window
// within the descent — ordered to arrive as its own layer comes into view.
//
// Each fades in and STAYS. Fading them out again as they pass is tempting and
// makes them unreadable.
//
// THE TEXT IS PLACEHOLDER. Every figure here must be replaced with a real,
// cited one from your own sourced research before this goes near judging.
const FACTS = [
  {
    at: [0.18, 0.3] as const,
    x: 58,
    y: 9,
    headline: "PLACEHOLDER — landfill",
    body: "Replace with a real, cited figure about blade landfilling.",
  },
  {
    at: [0.4, 0.52] as const,
    x: 6,
    y: 34,
    headline: "PLACEHOLDER — composite waste",
    body: "Replace with a real, cited figure about composite volumes.",
  },
  {
    at: [0.62, 0.74] as const,
    x: 56,
    y: 58,
    headline: "PLACEHOLDER — persistence",
    body: "Replace with a real, cited figure about how long this material lasts.",
  },
  {
    at: [0.82, 0.94] as const,
    x: 8,
    y: 80,
    headline: "PLACEHOLDER — our project",
    body: "Replace with one line on what Bye Bye Blade does about it.",
  },
];

/** Maps a value onto 0–1 across a window, clamped at both ends. */
function ramp(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

/**
 * The cross-section block.
 *
 * @param travelVw how far the column has travelled, in vw — available for
 *                 anything that should lag the section, such as a rock.
 * @param descent  0 → 1 across the below-ground half of the scene.
 */
export function Underground({
  travelVw,
  descent,
}: {
  travelVw: number;
  descent: number;
}) {
  // Referenced so the signature stays honest while nothing lags the section
  // yet; delete the parameter if nothing ever does.
  void travelVw;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        marginTop: `-${SEAM_OVERLAP_PX}px`,
        // The strata are drawn with ragged edges and transparency between them;
        // this is what sits behind, so no page blue can show through a gap.
        background: TOPSOIL_TOP_COLOR,
      }}
    >
      {/* The first stratum sits in normal flow and gives the block its height;
          the rest are laid over it at the same size, which is how the ragged
          boundaries line up exactly as drawn. */}
      {STRATA.map((layer, i) => (
        <img
          key={layer.name}
          src={layer.img}
          alt=""
          decoding="async"
          style={
            i === 0
              ? {
                  display: "block",
                  width: "100%",
                  position: "relative",
                  // Topsoil is nearest the viewer, so it is painted LAST and
                  // overlaps the strata beneath it — which is how its ragged
                  // lower edge cuts into the clay rather than being cut by it.
                  // The array is ordered top-to-bottom, so z-index counts DOWN.
                  zIndex: STRATA.length,
                }
              : {
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  zIndex: STRATA.length - i,
                  pointerEvents: "none",
                }
          }
        />
      ))}

      {FACTS.map((fact) => {
        const shown = ramp(descent, fact.at[0], fact.at[1]);
        return (
          <div
            key={fact.headline}
            style={{
              position: "absolute",
              left: `${fact.x}%`,
              top: `${fact.y}%`,
              maxWidth: "min(320px, 32%)",
              color: "#fff8ee",
              opacity: shown,
              // Drifts up slightly as it arrives, so it settles rather than
              // simply appearing.
              transform: `translate3d(0, ${(1 - shown) * 1.5}rem, 0)`,
              zIndex: 10,
              textShadow: "0 2px 12px rgba(0,0,0,0.55)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontFamily: '"iGEM Wiki Header", var(--font)',
                fontSize: "clamp(1.3rem, 2.6vw, 2rem)",
                lineHeight: 1.1,
                marginBottom: "0.35rem",
              }}
            >
              {fact.headline}
            </div>
            <div style={{ fontSize: "clamp(0.85rem, 1.2vw, 1rem)" }}>
              {fact.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
