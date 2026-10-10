// ─────────────────────────────────────────────────────────────────────────────
// DIRT BAND — the wavy soil edge that sits on top of the footer.
//
// HOW IT'S BUILT
//   Only the wavy TOP EDGE is artwork. Everything below it is a solid colour
//   (DIRT_COLOR) that fills down to the bottom of the page, so the footer can
//   grow taller without stretching your drawing vertically.
//
// TO SWAP IN YOUR AFFINITY DRAWING
//   1. In Affinity, draw ONLY the wave strip — e.g. a 1000 × 120 artboard with
//      the wave along the top and solid fill below it. Transparent background.
//   2. Export as SVG to /public/footer/dirt-top.svg (and a PNG for iGEM deploy).
//   3. Open the .svg in a text editor and add preserveAspectRatio="none" inside
//      the <svg …> tag so it stretches to the page width instead of centring.
//   4. Set USE_DRAWN_ART = true below.
// ─────────────────────────────────────────────────────────────────────────────

// === ART ===
const USE_DRAWN_ART = true; // flip to true once dirt-top.svg exists
const DIRT_TOP_IMG = "/dtu-denmark/footer/dirt-top.svg";

// === TUNEABLE ===
const DIRT_COLOR = "#aa4e36"; // the soil colour (matches the fill in your drawing)
const WAVE_HEIGHT = 70; // px — how tall the wavy edge renders

export function DirtBand() {
  return (
    <div style={{ position: "relative", lineHeight: 0 }}>
      {USE_DRAWN_ART ? (
        // Your exported drawing, stretched across the full page width.
        <img
          src={DIRT_TOP_IMG}
          alt=""
          style={{
            display: "block",
            width: "100%",
            height: WAVE_HEIGHT,
            objectFit: "fill",
          }}
        />
      ) : (
        // Placeholder wave — same silhouette as the drawing, so the layout is
        // correct before the real art is exported.
        <svg
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: WAVE_HEIGHT }}
        >
          <path
            d="M0,22 C 90,2 170,4 250,20 C 330,36 400,34 480,22
               C 560,10 640,10 720,24 C 800,38 890,34 1000,14
               L1000,70 L0,70 Z"
            fill={DIRT_COLOR}
          />
        </svg>
      )}
    </div>
  );
}

// Exported so the footer can paint the same colour below the wave.
export { DIRT_COLOR };
