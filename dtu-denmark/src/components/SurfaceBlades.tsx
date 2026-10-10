// ─────────────────────────────────────────────────────────────────────────────
// SURFACE BLADES — the two blades that end up stuck in the field
//
// ONE definition of where these blades sit, shared by BOTH halves of the scene:
//
//   ZoomToLandscape  drops them out of the sky   (drop 0 → 1)
//   Underground      picks them up where they landed, and carries them upward
//
// That shared ownership is the whole point of this file. While each half
// positioned its own copy they could never agree, and the blades jumped at the
// hand-over.
//
// The art is drawn so each blade runs off the BOTTOM of its canvas, and the
// dirt art picks up the same blade at the same x-position — measured, they line
// up to within half a percent of canvas width. So this layer and the dirt layer
// must stay the same width and the same horizontal position, always.
// ─────────────────────────────────────────────────────────────────────────────

// LOCAL FOR NOW — these live in public/dirt_and_blades while the scene is being
// built. Before this can deploy they must be converted to AVIF and uploaded to
// static.igem.wiki (the wiki asset rules forbid shipping them from public/).
const ART = `${import.meta.env.BASE_URL}dirt_and_blades/`;
export const BLADE_STRAIGHT_IMG = `${ART}Straight_Blade.png`;
export const BLADE_LEANING_IMG = `${ART}Leaning_Blade.png`;

// === TUNEABLE — the fall ===
// How far above the stage each blade starts, in vh. Enough that it is well out
// of sight before it drops, whatever the window height.
const FALL_FROM_VH = 135;
// Tilt while falling, in degrees — straightened out by the time it lands, so
// the blade swings upright as it comes down rather than dropping like a plank.
// Kept small: these are full-canvas-width images, so a few degrees moves the
// tip a long way across the screen.
const FALL_TILT_DEG = 7;
// The straight blade lands FIRST; the leaning one arrives a little later, so
// the two impacts read as separate events rather than one thud. This is a
// fraction of the drop window.
const SECOND_BLADE_DELAY = 0.18;
// After impact the blade jars backwards a touch and settles — what sells it as
// jamming INTO the ground rather than coming to rest on it.
const RECOIL_DEG = 3.5;
const RECOIL_WINDOW = 0.22; // last fraction of the fall spent recoiling

// Where each blade meets the ground, as % across its own canvas — measured from
// the art's alpha channel at the bottom edge, which is the same place the dirt
// scene's buried tips pick it up. Rotation pivots here, so the blade swings
// about the point it is driven into rather than about the canvas.
const PIVOT_STRAIGHT_X = 16; // from alpha bounds 10.8–21.2%
const PIVOT_LEANING_X = 37.4; // from alpha bounds 32.0–42.8%

/** Accelerating fall — gravity, not a constant glide. */
function gravity(t: number) {
  return t * t;
}

/** Maps a value onto 0–1 across a window, clamped at both ends. */
function ramp(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

/**
 * One blade, falling from above and jamming into the ground.
 *
 * `drop` 0 = out of sight above the stage, 1 = landed and settled.
 * `delay` staggers this blade within the same drop window.
 */
function Blade({
  src,
  drop,
  delay,
  tilt,
  pivotX,
  travelVh,
  zIndex,
}: {
  src: string;
  drop: number;
  delay: number;
  /** Direction of the fall tilt — opposite signs keep the two blades distinct. */
  tilt: number;
  /** Where this blade meets the ground, as % across its canvas. */
  pivotX: number;
  /** Extra vertical offset, used by the descent to carry the landed blades up. */
  travelVh: number;
  zIndex: number;
}) {
  // This blade's own 0 → 1 within the shared window.
  const t = ramp(drop, delay, 1);

  // Position: accelerating until it lands.
  const fallen = gravity(t);
  const y = (1 - fallen) * -FALL_FROM_VH;

  // Rotation: tilted while falling, upright on impact, then a short recoil.
  const settle = ramp(t, 1 - RECOIL_WINDOW, 1);
  const rotation =
    (1 - fallen) * tilt * FALL_TILT_DEG +
    // A single swing out and back: sin goes 0 → 1 → 0 across the window.
    Math.sin(settle * Math.PI) * -tilt * RECOIL_DEG;

  return (
    <img
      src={src}
      alt=""
      // The surface-blade art was lost and has not been redrawn yet. Hiding a
      // file that fails to load keeps a broken-image icon off the home page;
      // when the art is back this does nothing.
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      style={{
        position: "absolute",
        left: 0,
        // BOTTOM-anchored: this edge is the ground line, and the dirt block
        // below starts exactly here. Anchoring from the top instead made the
        // blades hang ~12vh past it, which put them over the buried ends
        // rather than continuing into them.
        bottom: 0,
        width: "100%",
        height: "auto",
        transform: `translate3d(0, ${y - travelVh}vh, 0) rotate(${rotation}deg)`,
        // Pivot at the tip, where the blade meets the ground — so the recoil
        // swings the blade's body while the buried end stays put. Rotating
        // about the canvas centre would sweep the tip across the screen.
        transformOrigin: `${pivotX}% 100%`,
        willChange: "transform",
        zIndex,
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * Both blades. Rendered identically by both halves of the scene, so the
 * hand-over between them is exact.
 *
 * @param drop     0 = above the stage, 1 = landed. The descent passes 1.
 * @param travelVh how far the landed blades have since been carried upward.
 */
export function SurfaceBlades({
  drop,
  travelVh = 0,
  zIndex = 40,
}: {
  drop: number;
  travelVh?: number;
  zIndex?: number;
}) {
  return (
    <>
      <Blade
        src={BLADE_STRAIGHT_IMG}
        drop={drop}
        delay={0}
        tilt={-1}
        pivotX={PIVOT_STRAIGHT_X}
        travelVh={travelVh}
        zIndex={zIndex}
      />
      <Blade
        src={BLADE_LEANING_IMG}
        drop={drop}
        delay={SECOND_BLADE_DELAY}
        tilt={1}
        pivotX={PIVOT_LEANING_X}
        travelVh={travelVh}
        zIndex={zIndex + 1}
      />
    </>
  );
}
