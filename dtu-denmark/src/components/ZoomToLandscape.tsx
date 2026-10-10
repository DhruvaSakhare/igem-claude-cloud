import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "./Landscape";
import { Windmill, WindmillKeyframes } from "./Windmill";
import { BladeLayers } from "./BladeLayers";
import { SurfaceBlades } from "./SurfaceBlades";
import { Underground, DESCENT_TRAVEL_VW } from "./DirtDescent";

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM TO LANDSCAPE
//
// Scroll-driven opening scene for the home page:
//
//   1. A map of Europe fills the screen.
//   2. As you scroll it zooms in on Denmark, growing to ~10×.
//   3. Part-way through the zoom the map dissolves and a windmill landscape
//      fades in beneath it, so it reads as arriving on the ground in Denmark.
//
// HOW THE SCROLL DRIVES IT
//   The outer <section> is deliberately much taller than the screen — that
//   extra height is the "runway" that gives us scroll distance to animate over.
//   The inner div is `position: sticky`, so it stays pinned to the viewport
//   while you scroll the runway past it. `useScrollProgress` converts your
//   position within the runway into 0 → 1, which every animation below reads.
//
//   Longer RUNWAY_VH = slower, more gradual zoom.
//
// EVERYTHING ANIMATES WITH transform / opacity ONLY, so the browser can hand
// this to the GPU instead of recalculating page layout on every frame.
// ─────────────────────────────────────────────────────────────────────────────

// === ART (all on static.igem.wiki, per the wiki asset rules) ===
// NB: the previous path (…/homepage/wiki-home-europemap.avif) now returns 403 —
// the file was moved into the scene0 folder, which is why the map disappeared.
const MAP_IMG =
  "https://static.igem.wiki/teams/6060/wiki/homepage/scene0/wiki-home-map-europe.avif";
// The two hills, both drawn on the same 2160×1620 canvas as the windmill parts
// and both running full width down to the canvas bottom — so unlike the old
// grass art they need no trim compensation at all.
export const LANDSCAPE_1_IMG =
  "https://static.igem.wiki/teams/6060/wiki/homepage/scene1/landscape-1.avif";
export const LANDSCAPE_2_IMG =
  "https://static.igem.wiki/teams/6060/wiki/homepage/scene1/landscape-2.avif";

const CAR_IMG =
  "https://static.igem.wiki/teams/6060/wiki/homepage/scene2/wiki-home-car.avif";

// OPTIONAL intermediate layer — a mid-way view of Denmark that bridges the
// dot-matrix map and the painted landscape. Set this to its iGEM URL once
// drawn; leave null and the sequence simply runs map → landscape.
// See the drawing brief at the bottom of this file.
// Disabled for now — the painted fields didn't sit well against the dot map.
// Set this back to the URL below to re-enable; the fade windows re-arrange
// themselves automatically for three layers.
//   "https://static.igem.wiki/teams/6060/wiki/homepage/scene0/landscape-intermediate.avif"
const INTERMEDIATE_IMG: string | null = null;

// === TUNEABLE ===
// One runway for the WHOLE sequence — zoom, then drive. Splitting these into
// two sticky sections made the page visibly jump at the hand-over, because the
// first section unpinned as the second pinned. One stage never unpins.
// Lengthened for the full sequence: zoom → drive → stop → fall → slide out
// into the field → focus on one blade. Each beat needs its own stretch of
// scroll, and they all share this one runway.
// Lengthened again once the four soil strata arrived: the descent is now the
// part of the scene with the most to look at, and at the previous length it
// went past too fast to read a fact before the next arrived.
const RUNWAY_VH = 1500;

// ONE STAGE, ONE SCROLL. The descent into the dirt was briefly a second sticky
// section, which meant the first unpinned and the second pinned showing the
// same landscape again — the page appeared to play the scene twice. It is now
// the tail of this same runway: everything before SCENE_SPLIT is the landscape
// above ground, everything after is the camera continuing down into it.
//
// The beat sheet below is still written in terms of the ABOVE-GROUND half, so
// `scene` (p rescaled to 0→1 across that half) drives it and none of those
// numbers had to change when the descent was added.
// Below-ground now gets 45% of the runway rather than 35%. Combined with the
// longer runway that is ~675vh of scroll for 150vh of travel — about 4.5vh of
// scrolling per 1vh the section moves, against 2.7 before, so the descent
// takes noticeably longer and each stratum holds the screen.
const SCENE_SPLIT = 0.55;
const MAX_ZOOM = 40; // total magnification across the whole zoom

// Where the zoom converges, as % of the map image. This is Denmark — the
// default would be `center`, which would zoom into central Germany instead.
// EVERY layer uses this same origin, so they all expand from the same point on
// screen; different origins would make the layers slide against each other and
// break the illusion of one continuous move.
const ZOOM_X = "51%";
const ZOOM_Y = "28%";

// ── The handover ─────────────────────────────────────────────────────────────
// Each layer is "full size" at a particular point in the zoom, and rides the
// SAME exponential curve either side of it. That is what makes the sequence
// read as one continuous approach rather than pictures being swapped: nothing
// ever stops moving, it just hands over which layer you happen to be looking at.
//
//   scale = zoom / <layer's handover zoom>
//
// so a layer is smaller than 1 before its moment and keeps growing after it.
// Zoom at which the intermediate is full size. Measured from the artwork: the
// dot-matrix map stops reading as geography somewhere around 3× — beyond that
// the dots are just large flat circles. So the intermediate has to take over
// while the map is still recognisable, not after.
const HANDOVER_MID = 3;

// Cross-fades are deliberately SHORT and happen at high magnification, where
// the outgoing layer is already blown up into abstract colour. A long fade
// gives the eye time to compare the two pictures and notice they differ.
//
// The windows differ depending on whether the intermediate exists, because
// EVERY moment must have some layer visible. With a two-layer sequence the map
// and landscape fades have to OVERLAP; with three, the intermediate covers the
// middle and the outer two can sit further apart.
const HAS_MID = INTERMEDIATE_IMG !== null;

// With the intermediate present the map leaves EARLY, while it is still
// legible — pushing it later just shows the viewer a screen of giant dots.
const MAP_FADE = HAS_MID ? ([0.14, 0.22] as const) : ([0.16, 0.26] as const);
const MID_FADE_IN = [0.2, 0.3] as const;
const MID_FADE_OUT = [0.48, 0.6] as const;
// Note the start is BEFORE MAP_FADE ends — that overlap is what stops the
// screen going momentarily empty.
const LAND_FADE = HAS_MID ? ([0.26, 0.36] as const) : ([0.15, 0.26] as const);

// Zoom level at which the landscape is full size — set to the zoom reached at
// the end of its fade, so it finishes arriving exactly as it finishes
// appearing, then holds there for the drive.
const HANDOVER_LAND = Math.pow(MAX_ZOOM, LAND_FADE[1]);

// Blur as a layer dissolves. Real optics lose focus during a fast zoom, and it
// hides the detail mismatch between a dot-matrix map and painted hills.
const MAX_BLUR_PX = 14;

// The car joins once the landscape has settled, then drives across. Because it
// shares this stage, nothing re-pins and the page never jumps — the car simply
// enters an already-established scene.
// The drive now FINISHES before the blades react, so the beats read in order:
// the car crosses, the turbines stop, everything holds still, then the blades
// drop. Previously the car was still moving during the fall, which muddled it.
const CAR_START = 0.28; // appears from the left
const CAR_END = 0.44; // fully off the right — nothing else happens until then
const CAR_WIDTH_PCT = 9; // car width as % of the stage
// The car only needs a horizontal path now — its height comes from RIDGE_1, so
// it follows the painted curve rather than a straight line between two guesses.
const CAR_FROM_X = -10; // off-screen left
const CAR_TO_X = 110; // off-screen right
// Nudge the car down into the hill so its wheels sit in the grass rather than
// balancing on the outline.
const CAR_SINK = 1.2;

// ── Hill ridges, measured from the artwork's alpha channel ───────────────────
// (% across the hill → % down the 2160×1620 canvas). These are the actual
// painted silhouettes, so anything placed with them sits exactly on the ground.
// Re-measure if the art changes.
const RIDGE_1: [number, number][] = [
  [0, 56.7],
  [10, 56.3],
  [20, 57.6],
  [30, 60.4],
  [40, 64.1],
  [50, 67.6],
  [60, 70.5],
  [70, 73.6],
  [80, 74.3],
  [90, 74.3],
  [100, 73.3],
];
const RIDGE_2: [number, number][] = [
  [10, 98.6],
  [20, 96.0],
  [30, 93.3],
  [40, 88.9],
  [50, 77.5],
  [60, 72.0],
  [70, 65.9],
  [80, 59.4],
  [90, 56.3],
  [100, 54.7],
];

/** Height of a ridge at a given % across, linearly interpolated between samples. */
function ridgeAt(ridge: [number, number][], xPct: number) {
  if (xPct <= ridge[0][0]) return ridge[0][1];
  const last = ridge[ridge.length - 1];
  if (xPct >= last[0]) return last[1];
  for (let i = 1; i < ridge.length; i++) {
    const [x0, y0] = ridge[i - 1];
    const [x1, y1] = ridge[i];
    if (xPct <= x1) return y0 + ((xPct - x0) / (x1 - x0)) * (y1 - y0);
  }
  return last[1];
}

// ── Turbine placement ────────────────────────────────────────────────────────
// `x` is the tower's centre and `width` its size, both as % of the HILL artwork
// (not the screen) — so they stay put at any window size. `y` is derived from
// the ridge, so a turbine always stands on the ground: change `x` and it walks
// along the slope by itself. Add entries freely.
const onHill = (
  ridge: [number, number][],
  x: number,
  width: number,
  spinSeconds: number,
  sink = 1.5, // % dug into the hill, so it doesn't look perched on the edge
) => ({ x, y: ridgeAt(ridge, x) + sink, width, spinSeconds });

// Back hill — smaller, because it is further away.
const WINDMILLS_HILL_1 = [
  onHill(RIDGE_1, 18, 9, 9),
  onHill(RIDGE_1, 46, 8, 11),
];
// Front hill — noticeably bigger, which is what sells the depth. The first
// entry sits low-left where RIDGE_2 drops to ~92%, i.e. nearest the viewer, so
// it is the largest of all and its blade pile is what the next scene zooms into.
const WINDMILLS_HILL_2 = [
  onHill(RIDGE_2, 34, 27, 5),
  onHill(RIDGE_2, 62, 17, 7),
  onHill(RIDGE_2, 88, 21, 6),
];

// ── The full beat sheet, in order ────────────────────────────────────────────
// Written as fractions of the ABOVE-GROUND half (see SCENE_SPLIT), not of the
// whole runway.
//
//   0.00–0.26  map zooms in and dissolves into the landscape
//   0.28–0.44  the car drives across and leaves
//   0.44       the turbines stop turning
//   … hold …   everything motionless — this pause IS the drama
//   0.48–0.58  the blades let go and drop into piles
//   … hold …   the fallen blades sit there
//   0.60–0.90  the landfill grows: 25 drawn blades arrive one at a time
//   0.90–1.00  two blades fall into the foreground and jam into the ground
//
// Each hold is just the gap between two windows. Lower the earlier constant to
// lengthen a pause; raising the later one squeezes the motion that follows.
//
// Beats must not OVERLAP unless they are meant to be simultaneous: the field
// used to start before the fall had finished, which read as the landfill
// arriving by itself while the turbines were still shedding.
const BLADE_STOP = 0.44;
const BLADE_FALL = [0.48, 0.58] as const;

// The blades leave their turbines and become the field. The turbines' own
// blades fade out across this same window while BladeField fades in — the swap
// happens while everything is still, so it cannot be seen.
// Starts only once BLADE_FALL has finished, so the beats read in order: the
// turbines shed their blades, THEN the landscape fills with them. Overlapping
// the two made the landfill look like it was arriving on its own while the
// turbines were still coming apart.
//
// The pause between 0.58 and 0.60 is deliberate — a beat of stillness with the
// fallen blades on the ground before the field starts to grow.
const BLADE_SLIDE = [0.6, 0.9] as const;
// The two foreground blades fall and jam into the ground. They must be fully
// landed and still by the end of the above-ground half, because the descent
// opens on exactly that frame.
const BLADE_DROP = [0.9, 1.0] as const;

/**
 * DEV ONLY — scrubbing without scrolling.
 *
 * Add `?scrub` to the URL and a slider appears that drives the scene's progress
 * directly. Returns null otherwise, so it can never appear on the real wiki.
 *
 * Exists because tuning a scroll-driven scene by scrolling is slow, and in some
 * environments impossible. This makes every moment reachable and repeatable,
 * which is what makes the sequence tunable at all.
 */
function useScrub(): number | null {
  const enabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("scrub");
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    // Also drivable from the console: __scrub(0.75)
    (window as unknown as Record<string, unknown>).__scrub = (v: number) =>
      setValue(Math.min(1, Math.max(0, v)));
  }, [enabled]);

  if (!enabled) return null;
  return value;
}

/** DEV ONLY — the slider itself. */
function ScrubBar({ value }: { value: number }) {
  const set = (v: number) => {
    const fn = (window as unknown as Record<string, unknown>).__scrub;
    if (typeof fn === "function") (fn as (n: number) => void)(v);
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        right: 12,
        zIndex: 99999,
        background: "rgba(0,0,0,0.82)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        font: "12px/1.5 monospace",
      }}
    >
      <div style={{ marginBottom: 6 }}>
        scene progress <b>{value.toFixed(3)}</b> — drag to scrub
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={value}
        onChange={(e) => set(+e.target.value)}
        style={{ width: "100%" }}
      />
    </div>
  );
}

/** Maps a value from one range to another, clamped to 0–1. */
function ramp(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

/**
 * Width of the page's content area, excluding the scrollbar.
 *
 * `100vw` would be the obvious choice for a full-bleed section, but it INCLUDES
 * the scrollbar (~15px), so the section ends up wider than the page and adds a
 * horizontal scrollbar. `documentElement.clientWidth` excludes it.
 */
function useViewportWidth() {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setWidth(document.documentElement.clientWidth);
    update();
    // ResizeObserver rather than the `resize` event: it fires whenever the
    // element's box actually changes, including cases the window event misses
    // (zoom, a scrollbar appearing, devtools docking). A stale width here
    // silently breaks the full-bleed, so it needs to be reliable.
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return width;
}

export function ZoomToLandscape() {
  const runwayRef = useRef<HTMLElement>(null);
  const scrollP = useScrollProgress(runwayRef); // 0 → 1 across the whole scene
  // DEV ONLY — lets the scene be scrubbed without scrolling. Add ?scrub to the
  // URL to get a slider. Never active in normal use.
  const scrub = useScrub();
  const p = scrub ?? scrollP;
  // Above-ground half, as its own 0 → 1 — what the beat sheet is written in.
  const scene = Math.min(p / SCENE_SPLIT, 1);
  // Below-ground half: the descent through the dirt.
  const descent = ramp(p, SCENE_SPLIT, 1);
  // In vw — the dirt artwork's height is always 75vw, so this lands its bottom
  // edge on the bottom of the viewport at every window size. See DirtDescent.
  const travel = ramp(descent, 0.02, 1) * DESCENT_TRAVEL_VW;
  const bleedWidth = useViewportWidth();

  // The map grows from 1× to MAX_ZOOM, then dissolves.
  // EXPONENTIAL zoom. Scale is multiplicative in a real zoom — each unit of
  // scroll multiplies what you see. A linear ramp (1 + p*9) feels frantic at
  // the start and stuck at the end, because 1→2 doubles the view while 9→10
  // barely changes it. Math.pow keeps the *perceived* rate constant.
  const zoom = Math.pow(MAX_ZOOM, scene);

  // Every layer is the same zoom divided by where it becomes full size, so all
  // of them grow together on one continuous curve.
  const mapScale = zoom;
  const midScale = zoom / HANDOVER_MID;
  // Clamped at 1: the landscape grows into place, then SETTLES. Without the
  // clamp it would keep inflating past full size while the car drives across,
  // pushing the hills off screen.
  const landScale = Math.min(1, zoom / HANDOVER_LAND);

  const mapOpacity = 1 - ramp(scene, MAP_FADE[0], MAP_FADE[1]);
  const midOpacity = INTERMEDIATE_IMG
    ? ramp(scene, MID_FADE_IN[0], MID_FADE_IN[1]) *
      (1 - ramp(scene, MID_FADE_OUT[0], MID_FADE_OUT[1]))
    : 0;

  // Each layer blurs as it hands over, masking the change of artwork.
  const mapBlur = ramp(scene, MAP_FADE[0], MAP_FADE[1]) * MAX_BLUR_PX;
  const midBlur = ramp(scene, MID_FADE_OUT[0], MID_FADE_OUT[1]) * MAX_BLUR_PX;
  // The landscape arrives slightly soft and sharpens as it settles.
  const landBlur =
    (1 - ramp(scene, LAND_FADE[0], LAND_FADE[1])) * MAX_BLUR_PX * 0.5;

  // The landscape fades in, and its layers rise into place at different rates —
  // the foreground travels furthest, which is what reads as depth.
  const landIn = ramp(scene, LAND_FADE[0], LAND_FADE[1]);
  const midRise = (1 - landIn) * 60; // px still to travel
  const foreRise = (1 - landIn) * 140;

  // Blades stop spinning and drop into a pile near the end of the scene.
  const bladeFall = ramp(scene, BLADE_FALL[0], BLADE_FALL[1]);
  // Then they hand over to the field layer and lay themselves out.
  const bladeSlide = ramp(scene, BLADE_SLIDE[0], BLADE_SLIDE[1]);
  // The closing beat: two blades fall into the foreground and stick.
  const bladeDrop = ramp(scene, BLADE_DROP[0], BLADE_DROP[1]);
  // (The turbines' fallen blades now vanish one at a time via each Windmill's
  // own `vanish`/`vanishDelay`, rather than all fading together.)

  // The car's own 0→1, running from CAR_START to the end of the scene.
  const drive = ramp(scene, CAR_START, CAR_END);
  const carX = CAR_FROM_X + drive * (CAR_TO_X - CAR_FROM_X);
  // Height read straight off the painted ridge, so the car tracks every bump.
  const carY = ridgeAt(RIDGE_1, carX) + CAR_SINK;

  // Shared box for a hill: full width, bottom-anchored, and holding the
  // artwork's own aspect ratio so children can be positioned in canvas %.
  const hillBox: React.CSSProperties = {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    aspectRatio: "2160 / 1620",
    willChange: "transform",
  };

  return (
    <section
      ref={runwayRef}
      style={{
        position: "relative",
        height: `${RUNWAY_VH}vh`,
        // FULL BLEED. The home page renders inside `.page-container`, which is
        // max-width 85% with 10% padding — so a plain `width: 100%` would only
        // fill ~64% of the screen. Measuring clientWidth (rather than using
        // 100vw) keeps the section exactly as wide as the page, so it reaches
        // both edges without adding a horizontal scrollbar.
        width: bleedWidth ? `${bleedWidth}px` : "100%",
        marginLeft: bleedWidth ? `calc(50% - ${bleedWidth / 2}px)` : 0,
        marginRight: bleedWidth ? `calc(50% - ${bleedWidth / 2}px)` : 0,
      }}
      aria-label="Zooming from a map of Europe into a Danish windmill landscape"
    >
      {/* Spin keyframes, declared once for every turbine on the page */}
      <WindmillKeyframes />
      {scrub !== null && <ScrubBar value={scrub} />}
      {/* Pinned viewport-sized stage. Stays put while the runway scrolls past. */}
      <div
        style={{
          // While scrubbing, pin the stage to the viewport instead of relying
          // on sticky — otherwise the scene sits below the page header and you
          // are looking at it half off-screen, which makes it impossible to
          // judge. Normal (non-scrub) behaviour is untouched.
          position: scrub !== null ? "fixed" : "sticky",
          top: 0,
          left: scrub !== null ? 0 : undefined,
          width: scrub !== null ? "100vw" : undefined,
          zIndex: scrub !== null ? 9998 : undefined,
          height: "100vh",
          overflow: "hidden", // clips the map once it grows past the edges
          backgroundColor: "transparent", // let the page-wide sky gradient show through
        }}
      >
        {/* ── THE MAP ─────────────────────────────────────────────────────── */}
        <img
          src={MAP_IMG}
          alt="Map of Europe showing wind turbine distribution"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain", // never crop the map — countries stay whole
            transform: `scale(${mapScale})`,
            transformOrigin: `${ZOOM_X} ${ZOOM_Y}`,
            opacity: mapOpacity,
            filter: mapBlur > 0.1 ? `blur(${mapBlur}px)` : undefined,
            willChange: "transform, opacity, filter",
          }}
        />

        {/* ── INTERMEDIATE (optional) ──────────────────────────────────────
            Bridges the dot-matrix map and the painted hills. Rides the same
            exponential curve, so it arrives already moving. */}
        {INTERMEDIATE_IMG && (
          <img
            src={INTERMEDIATE_IMG}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${midScale})`,
              transformOrigin: `${ZOOM_X} ${ZOOM_Y}`,
              opacity: midOpacity,
              filter: midBlur > 0.1 ? `blur(${midBlur}px)` : undefined,
              willChange: "transform, opacity, filter",
            }}
          />
        )}

        {/* ── THE COLUMN ────────────────────────────────────────────────────
            The landscape and the ground beneath it, stacked in normal flow and
            slid upward as one during the descent. Stacking them (rather than
            giving the dirt a hand-picked offset) is what guarantees the dirt
            starts exactly where the ground ends at every window size. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            transform: `translate3d(0, ${-travel}vw, 0)`,
            willChange: "transform",
          }}
        >
          {/* The above-ground scene, one viewport tall. The blades that drop into
            it are anchored to the BOTTOM of this block, which is the ground
            line the dirt below picks up. */}
          <div style={{ position: "relative", height: "100vh" }}>
            {/* ── THE LANDSCAPE ───────────────────────────────────────────────── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: landIn,
                // The landscape rides the SAME zoom curve as the map: it arrives
                // already growing rather than appearing at rest, so the motion
                // never stops at the handover. Same origin as every other layer,
                // so it expands from the same point on screen.
                transform: `scale(${landScale})`,
                transformOrigin: `${ZOOM_X} ${ZOOM_Y}`,
                filter: landBlur > 0.1 ? `blur(${landBlur}px)` : undefined,
                willChange: "transform, opacity, filter",
                pointerEvents: "none",
              }}
            >
              {/* ── LANDSCAPE WRAPPER ─────────────────────────────────────────
              Holds the hills AND the blade field. It used to carry a closing
              zoom onto one blade in the field; that beat is now the two
              foreground blades dropping in (see SurfaceBlades below), so this
              simply groups the landscape. */}
              <div style={{ position: "absolute", inset: 0 }}>
                {/* ── HILL 1 (back) ────────────────────────────────────────────
              Everything belonging to this hill lives INSIDE its wrapper, so
              child percentages are percentages of the ARTWORK rather than of
              the screen. That is what keeps the car glued to the ridge and the
              turbines planted on the slope at every window size — the hill is
              sized by width, but the stage's height follows the viewport, so
              screen-relative coordinates would drift as the window changes. */}
                <div
                  style={{
                    ...hillBox,
                    transform: `translate3d(0,${midRise}px,0)`,
                  }}
                >
                  <img
                    src={LANDSCAPE_1_IMG}
                    alt=""
                    style={{ display: "block", width: "100%" }}
                  />

                  {/* The car, following hill 1's painted ridge. Drawn before the
                turbines so they pass in front of it.

                NOT RENDERED until the drive begins. Parking it off-screen at
                CAR_FROM_X isn't enough: during the zoom the whole landscape is
                scaled DOWN toward the anchor, which drags that off-screen
                position back into view — so the car was visible sitting in the
                fields while we were still descending. */}
                  {drive > 0 && (
                    <img
                      src={CAR_IMG}
                      alt="A car driving through the windmill landscape"
                      style={{
                        position: "absolute",
                        left: `${carX}%`,
                        top: `${carY}%`,
                        width: `${CAR_WIDTH_PCT}%`,
                        height: "auto",
                        // Anchor by the car's bottom edge and centre, so its wheels sit
                        // on the ridge rather than its roof.
                        transform: "translate(-50%, -100%)",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {WINDMILLS_HILL_1.map((w, i) => (
                    <Windmill
                      key={i}
                      {...w}
                      zIndex={2}
                      fall={bladeFall}
                      vanish={bladeSlide}
                      vanishDelay={i * 0.1}
                      stopped={scene >= BLADE_STOP}
                    />
                  ))}
                </div>

                {/* ── MIDDLE-GROUND BLADES ─────────────────────────────────────
                Drawn BEFORE the foreground hill, so the hill overlaps them and
                they sit convincingly further away. */}
                <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                  <BladeLayers slide={bladeSlide} part="behind" />
                </div>

                {/* ── HILL 2 (front) ───────────────────────────────────────────── */}
                <div
                  style={{
                    ...hillBox,
                    transform: `translate3d(0,${foreRise}px,0)`,
                    zIndex: 3,
                  }}
                >
                  <img
                    src={LANDSCAPE_2_IMG}
                    alt="Rolling hills with wind turbines"
                    style={{ display: "block", width: "100%" }}
                  />
                  {WINDMILLS_HILL_2.map((w, i) => (
                    <Windmill
                      key={i}
                      {...w}
                      zIndex={2}
                      fall={bladeFall}
                      vanish={bladeSlide}
                      vanishDelay={0.2 + i * 0.1}
                      stopped={scene >= BLADE_STOP}
                    />
                  ))}
                </div>

                {/* ── THE FIELD ─────────────────────────────────────────────────
              Sits above both hills. Takes over from the turbines' own fallen
              blades and lays far more of them out across the ground, then
              closes in on one. */}
                <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
                  <BladeLayers
                    slide={bladeSlide}
                    part="front"
                    maskImg={LANDSCAPE_2_IMG}
                  />
                </div>
              </div>
            </div>

            {/* ── THE CLOSING BEAT — two blades fall into the ABSOLUTE FOREGROUND
              and jam into the ground.

              Deliberately OUTSIDE the landscape wrapper: these are between the
              viewer and the whole scene, not part of it, so nothing the
              landscape does may move them.

              They land at exactly the position the descent opens on — both
              halves render the same SurfaceBlades component, which is the only
              thing that knows where these blades sit. */}
            <SurfaceBlades drop={bladeDrop} />
          </div>

          {/* ── THE DESCENT — the cross-section below the field, with the
              buried ends of those same two blades continuing into it. */}
          <Underground travelVw={travel} descent={descent} />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWING BRIEF — the intermediate layer
//
// WHY IT HELPS
//   The map is a dot-matrix graphic; the hills are painted. Blown up, the dots
//   become large flat circles that look nothing like grass, so the eye notices
//   the swap. An intermediate view gives the sequence a stepping stone, so
//   neither cross-fade has to bridge the whole stylistic gap at once.
//
// DO NOT TRY TO MATCH THE MAP'S COASTLINE.
//   Measured from the artwork: the map stops reading as geography at about 3x
//   magnification — past that it is just circles, with no Denmark shape left to
//   line up against. So the intermediate does NOT need an accurate outline.
//   Its job is to bridge STYLE and ALTITUDE, not to be a map.
//
// WHAT TO DRAW
//   Danish countryside seen from high above — the view from a plane window:
//     * Painted in the hills' palette and texture, NOT dots. Sampled from the
//       real artwork: landscape-1 #246048 / #247854, landscape-2 #48A854.
//     * Soft patchwork of fields in those greens, a suggestion of coastline or
//       water toward one edge, maybe a road thread. No hard outlines.
//     * A scatter of tiny white turbine marks, tying the map's data to the
//       hills you are about to land on.
//     * Keep it LOW in detail. It is on screen briefly and blurred at both
//       ends, so texture and colour matter far more than accuracy.
//
// CANVAS AND FRAMING
//   * 2560 x 1440 (16:9) — rendered with objectFit: "cover".
//   * Put the visual centre of interest at 51% across, 28% down, matching
//     ZOOM_X / ZOOM_Y. Every layer expands from that point, so content placed
//     elsewhere will appear to slide sideways during the handover.
//   * Fill the whole canvas. No transparency and no empty margins, or the page
//     blue shows through mid-zoom.
//
// THEN
//   Upload it, set INTERMEDIATE_IMG at the top of this file, and it joins
//   automatically — the fade windows re-arrange themselves for three layers.
//   Tune HANDOVER_MID if it arrives at the wrong size.
// ─────────────────────────────────────────────────────────────────────────────
