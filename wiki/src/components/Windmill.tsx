// ─────────────────────────────────────────────────────────────────────────────
// WINDMILL — tower with three spinning blades
//
// All four parts were exported from the same 2160×1620 Procreate canvas, so
// they are already pixel-aligned: stacking them at identical size and position
// reassembles the turbine exactly as drawn. Nothing needs positioning by hand.
//
// THE HUB is where the three blade roots converge, measured from the artwork's
// alpha channel at x 49.14%, y 40.56% of the canvas. That point becomes each
// blade's `transformOrigin`, so they pivot about the nacelle rather than about
// their own centres (which would make them orbit rather than spin).
//
// All three blades share ONE animation at the same speed, so they keep their
// drawn 120° spacing. `transform: rotate()` is GPU-composited, so several
// turbines spinning at once costs essentially nothing.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://static.igem.wiki/teams/6060/wiki/homepage/scene1";
const BAR_IMG = `${BASE}/windmill-bar.avif`;
const BLADE_IMGS = [
  `${BASE}/windmill-blade1.avif`,
  `${BASE}/windmill-blade2.avif`,
  `${BASE}/windmill-blade3.avif`,
];

// Measured from the blade roots in the artwork — see the note above.
const HUB_X = 49.14;
const HUB_Y = 40.56;

// ── Where each blade ends up once it has fallen ──────────────────────────────
// One entry per blade, in the same order as BLADE_IMGS. Values are % of the
// turbine's own width/height, so a blade lands in the same place relative to
// its tower no matter how big that tower is or where on the page it stands —
// which is what makes this safe to reuse when you add or move turbines.
//
//   x   sideways drift from the hub  (+ = right)
//   y   how far down it falls        (+ = down; ~55 lands it at the base)
//   rot final resting angle in degrees
//
// Tuned to read as a HEAP, not a row. Three things do that:
//   • the x values are close together, so the blades OVERLAP rather than
//     sitting side by side;
//   • the y values differ slightly, so they stack in front of each other
//     instead of all lying on one line;
//   • the rotations are spread wide, so they cross at angles the way dropped
//     objects actually settle.
const BLADE_LANDINGS = [
  { x: -8, y: 55, rot: -68 },
  { x: 1, y: 58, rot: 14 },
  { x: 7, y: 56.5, rot: 103 },
];

// Each blade starts falling slightly after the previous one, so the pile builds
// up rather than all three dropping in unison. Fraction of the fall window.
const BLADE_FALL_STAGGER = 0.13;

/** Gravity easing: things accelerate as they fall, so t² not t. */
function gravity(t: number) {
  return t * t;
}

/** Clamped 0→1 ramp. */
function ramp(v: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

export interface WindmillProps {
  /** Horizontal position of the turbine's centre, as % of its container. */
  x: number;
  /** Vertical position of the tower's BASE, as % of its container. */
  y: number;
  /** Width of the whole turbine, as % of its container. */
  width: number;
  /** Seconds per full revolution. Higher = lazier. */
  spinSeconds?: number;
  /** Reverse the spin direction. */
  reverse?: boolean;
  zIndex?: number;
  /**
   * 0 → spinning normally. Above 0 the blades stop and drop, reaching their
   * resting pile at 1. Drive this from scroll progress.
   */
  fall?: number;
  stopped?: boolean;
  /**
   * Fades just the blades (the tower stays). Used to hand the fallen blades
   * over to the scene-level BladeField once they are lying still.
   */
  bladeOpacity?: number;
  /**
   * 0 → all three blades still lying there. 1 → all gone.
   *
   * They disappear ONE AT A TIME rather than together: the field is filling up
   * at the same moment, so a staggered vanish reads as blades being carted off
   * one by one instead of the pile blinking out.
   */
  vanish?: number;
  /** Shifts this turbine's vanish later, so turbines clear in sequence. */
  vanishDelay?: number;
}

export function Windmill({
  x,
  y,
  width,
  spinSeconds = 8,
  reverse = false,
  zIndex = 2,
  fall = 0,
  stopped = false,
  bladeOpacity = 1,
  vanish = 0,
  vanishDelay = 0,
}: WindmillProps) {
  const falling = fall > 0;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        // Anchor by the tower's base, so `y` reads as "where it meets the
        // ground" rather than "where the top of the canvas is".
        transform: "translate(-50%, -100%)",
        zIndex,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {/* Static tower. Sets the box every blade is measured against. */}
      <img
        src={BAR_IMG}
        alt=""
        style={{ display: "block", width: "100%", height: "auto" }}
      />

      {/* The three blades. Each is TWO nested elements on purpose:
            • the outer div carries the FALL (drop + tumble)
            • the inner img carries the SPIN
          They would otherwise be fighting over the same `transform` property,
          and the spin would wipe out the fall. Nesting composes them instead. */}
      {BLADE_IMGS.map((src, i) => {
        const land = BLADE_LANDINGS[i] ?? BLADE_LANDINGS[0];
        // Each blade starts a moment after the one before, so the pile builds.
        const t = ramp(fall, i * BLADE_FALL_STAGGER, 1);
        const drop = gravity(t); // accelerating descent
        const tumble = t; // rotation turns at a steady rate

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${land.x * drop}%, ${land.y * drop}%) rotate(${land.rot * tumble}deg)`,
              transformOrigin: `${HUB_X}% ${HUB_Y}%`,
              // Staggered so this turbine's three blades leave in sequence,
              // and `vanishDelay` offsets the whole turbine against the others.
              opacity:
                bladeOpacity *
                (1 - ramp(vanish, vanishDelay + i * 0.18, vanishDelay + i * 0.18 + 0.22)),
              willChange: falling ? "transform" : undefined,
            }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                transformOrigin: `${HUB_X}% ${HUB_Y}%`,
                animation: `windmillSpin ${spinSeconds}s linear infinite${reverse ? " reverse" : ""}`,
                // Freeze mid-rotation the instant the fall begins, so the blade
                // drops from wherever it happened to be rather than snapping
                // back to its drawn angle first.
                animationPlayState: stopped || falling ? "paused" : "running",
                willChange: "transform",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The shared keyframes. Render this ONCE per page rather than inside every
 * turbine, so the rule isn't duplicated for each one.
 */
export function WindmillKeyframes() {
  return (
    <style>{`
      @keyframes windmillSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        @keyframes windmillSpin { from, to { transform: rotate(0deg); } }
      }
    `}</style>
  );
}
