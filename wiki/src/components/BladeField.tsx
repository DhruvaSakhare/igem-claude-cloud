import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// BLADE FIELD — the landfill beat
//
// Takes over once the fallen blades are lying still, and carries three ideas:
//
//   1. SLIDE     the blades move right and lay themselves out in rows.
//   2. ACCUMULATE far more blades arrive than fell — the point being that this
//                 is not five turbines' worth, it is an industry's worth.
//   3. FOCUS      the field zooms into one blade, which becomes the subject of
//                 the cross-section that follows.
//
// Rows fill FRONT FIRST and get denser toward the back, so the field reads as
// filling up over time rather than appearing all at once.
//
// The hand-over from the turbines' own blades is a cross-fade during the still
// period after the fall — nothing is moving then, so the swap is invisible and
// we avoid having to re-parent blades out of their turbines mid-animation.
// ─────────────────────────────────────────────────────────────────────────────

const BLADE_IMG =
  "https://static.igem.wiki/teams/6060/wiki/homepage/scene1/windmill-blade1.avif";

// === TUNEABLE — the rows ===
// One entry per row, FRONT first. `y` is where the row sits (% down the stage),
// `count` how many blades it holds, `scale` their size. Rows further back sit
// higher, hold more, and are smaller — which is what makes the field recede.
// `front: true` puts a row on the FOREGROUND hill — drawn in front of it and
// clipped to its silhouette. Everything else is middle-ground, drawn BEHIND the
// foreground hill so the hill overlaps it.
//
// Note the deliberate size gap: the largest middle-ground blade (0.72 → 18.7%)
// is smaller than the smallest foreground one, so the two groups never read as
// the same distance away.
const ROWS = [
  { y: 92, count: 4, scale: 1.0, front: true }, // 26.0% — the big front row
  { y: 86.5, count: 6, scale: 0.72, front: true }, // 18.7%

  { y: 82, count: 9, scale: 0.55, front: false }, // 14.3% — middle ground…
  { y: 78, count: 12, scale: 0.46, front: false }, // 12.0%
  { y: 74.5, count: 15, scale: 0.39, front: false }, // 10.1%
  { y: 71.5, count: 17, scale: 0.33, front: false }, // 8.6%
  { y: 69, count: 19, scale: 0.28, front: false }, // 7.3%
];

// ── Blade artwork compensation ───────────────────────────────────────────────
// windmill-blade1.avif is a 2160×1620 canvas on which the blade itself occupies
// only 22.5% of the width — the rest is transparent margin, and the blade is
// not centred in it either. Sizing the <img> directly therefore makes the blade
// look far smaller than the number suggests (38% width rendered an 8.6% blade).
//
// These let BLADE_LEN_PCT mean the LENGTH OF THE VISIBLE BLADE, which is what
// you actually want to tune. Re-measure from the alpha channel if the art changes.
const CONTENT_FRAC_W = 0.225; // fraction of the canvas the blade fills
const CONTENT_OFFSET_X = -12.82; // % the blade's centre sits from canvas centre
const CONTENT_OFFSET_Y = -5.03;

/** Visible length of a front-row blade, as % of the stage. */
const BLADE_LEN_PCT = 20.8; // 20% smaller than the previous 26
/** …which needs this much <img> to achieve, once the padding is accounted for. */
const BLADE_W_PCT = BLADE_LEN_PCT / CONTENT_FRAC_W;

// ── Where the blades slide FROM ──────────────────────────────────────────────
// Roughly where each turbine's pile lands, as % of the stage. Blades travel out
// of the nearest pile rather than in from the screen edge, so the field reads
// as being fed by the turbines you just watched shed them.
//
// Approximate by design: the hills are sized by width while the stage's height
// follows the viewport, so exact stage coordinates shift with the window. Since
// this is only the START of a slide, close enough reads correctly.
const PILE_SOURCES = [
  { x: 18, y: 51 }, // hill 1, back-left
  { x: 46, y: 61 }, // hill 1, mid
  { x: 34, y: 92 }, // hill 2, the big near one
  { x: 62, y: 67 }, // hill 2, mid
  { x: 88, y: 50 }, // hill 2, far right
];

/** The pile a given slot's blade came from — whichever is nearest horizontally. */
function nearestPile(x: number) {
  return PILE_SOURCES.reduce((best, s) =>
    Math.abs(s.x - x) < Math.abs(best.x - x) ? s : best,
  );
}
const FIELD_LEFT = 4; // rows span this…
const FIELD_RIGHT = 97; // …to this, % of stage

// Stretches the gaps BETWEEN rows without moving the front row, by pushing each
// row further from it. 1 = as authored above, 1.1 = 10% more spacing.
// Applied as a multiplier so the whole field can be opened up or tightened with
// one number, rather than re-deriving seven y values by hand.
const ROW_SPACING = 1.45;

// Gap between the bottom of the front row's blades and the bottom of the
// screen, as % of stage height. A few pixels, so they sit ON the bottom edge
// rather than being cut off by it.
const FRONT_ROW_BOTTOM_GAP = 1.2;

// How many blades appear at once. They fade in WHERE THEY BELONG rather than
// travelling there — sliding 87 blades across the frame read as chaotic, and
// nothing about a landfill implies motion. Appearing in scattered batches makes
// the field accumulate instead.
const BLADES_PER_BATCH = 10;
const FRONT_ROW_Y = ROWS[0].y;

/** A row's y after the spacing multiplier is applied. */
function spacedY(y: number) {
  return FRONT_ROW_Y - (FRONT_ROW_Y - y) * ROW_SPACING;
}

// Blades stand UPRIGHT rather than lying flat. The artwork points right, so 90°
// turns it on end; the jitter keeps the rows from looking stamped out.
// The artwork is NOT drawn horizontally — measured from its alpha mask, the
// blade's principal axis sits at −21.5°. So a plain 90° turn left it 21.5° off
// vertical, which is the lean that kept showing up. 90 + 21.5 corrects for it.
const BLADE_ART_TILT = 21.5;
const BLADE_UPRIGHT_DEG = 90 + BLADE_ART_TILT;
const BLADE_ANGLE_JITTER = 0; // ± degrees; 0 = dead vertical

// ── The ground the rows sit on ───────────────────────────────────────────────
// The hills are not flat, so rows laid on plain horizontal lines float free on
// the left and sink into the slope on the right. This contour lifts each row to
// follow the ground, which rises toward the right the way the front hill does.
// (% across the stage → % to shift the row; negative = higher up the screen)
const CONTOUR: [number, number][] = [
  [0, 5.5],
  [25, 2],
  [50, -1],
  [75, -4.5],
  [100, -7.5],
];

function contourAt(x: number) {
  if (x <= CONTOUR[0][0]) return CONTOUR[0][1];
  const last = CONTOUR[CONTOUR.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < CONTOUR.length; i++) {
    const [x0, y0] = CONTOUR[i - 1];
    const [x1, y1] = CONTOUR[i];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return last[1];
}

// Which blade the final zoom closes in on. Row 0 is the front row.
const FOCUS_ROW = 0;
const FOCUS_COL = 2;
const FOCUS_ZOOM = 7; // how far in the focus pushes

/** Clamped 0→1 ramp. */
function ramp(v: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

/** Deterministic pseudo-random in [0,1) so layout is stable across renders. */
function jitter(seed: number) {
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

type Slot = {
  key: string;
  x: number; // % across the stage
  y: number; // % down the stage
  w: number; // % width
  rot: number;
  order: number; // 0→1, when this blade arrives
  fromX: number; // the pile it slides out of, % across
  fromY: number; // …and % down
  front: boolean; // on the foreground hill, or behind it
};

/** Build every blade's resting slot once — the layout never changes. */
function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  let placed = 0;

  ROWS.forEach((row, ri) => {
    for (let c = 0; c < row.count; c++) {
      // Spread the row evenly, then jitter slightly so it isn't mechanical.
      const t = row.count === 1 ? 0.5 : c / (row.count - 1);
      const x = FIELD_LEFT + t * (FIELD_RIGHT - FIELD_LEFT);
      const j = jitter(ri * 31 + c);
      const slotX = x + (j - 0.5) * 2.5;
      const pile = nearestPile(slotX);
      slots.push({
        key: `${ri}-${c}`,
        x: slotX,
        // Row height plus the ground contour at this x, so the row follows the
        // hill instead of cutting a flat line across it.
        y: spacedY(row.y) + contourAt(slotX) + (jitter(ri * 17 + c) - 0.5) * 1.2,
        w: BLADE_W_PCT * row.scale,
        // Upright, with a little lean either side.
        rot: BLADE_UPRIGHT_DEG + (j - 0.5) * BLADE_ANGLE_JITTER * 2,
        // Filled in below, once every slot exists and can be shuffled.
        order: 0,
        fromX: pile.x,
        fromY: pile.y,
        front: row.front,
      });
      placed++;
    }
  });

  // ── Arrival order ──────────────────────────────────────────────────────────
  // Blades appear in BATCHES, scattered across the whole field rather than
  // marching row by row. A deterministic shuffle keeps the layout identical on
  // every render while still looking unplanned.
  const shuffled = slots
    .map((s, i) => ({ s, k: jitter(i * 7.13 + 3) }))
    .sort((a, b) => a.k - b.k)
    .map((v) => v.s);

  const batches = Math.max(1, Math.ceil(shuffled.length / BLADES_PER_BATCH));
  shuffled.forEach((s, i) => {
    s.order = Math.floor(i / BLADES_PER_BATCH) / Math.max(1, batches - 1);
  });

  return slots;
}

const SLOTS = buildSlots();

/**
 * Where the closing zoom converges, as % of the stage.
 *
 * Exported because the zoom is NOT applied inside this component — it is
 * applied to a wrapper containing the hills as well, so the whole scene grows
 * together and the blade keeps its true size relative to the landscape. Scaling
 * only the field would make the blades swell against a fixed background.
 */
export const FOCUS_POINT = (() => {
  const s = SLOTS.find((v) => v.key === `${FOCUS_ROW}-${FOCUS_COL}`) ?? SLOTS[0];
  return { x: s.x, y: s.y };
})();

/** Total magnification of the closing zoom, used by the parent wrapper. */
export const FOCUS_ZOOM_FACTOR = FOCUS_ZOOM;

export interface BladeFieldProps {
  /** 0 → nothing here yet. 1 → the field is full. */
  slide: number;
  /** 0 → whole field visible. 1 → zoomed into the focus blade. */
  focus: number;
  /**
   * Which half of the field to draw. Rendered as two passes so they can sit on
   * opposite sides of the foreground hill:
   *   "behind" → drawn before the hill, so the hill overlaps them
   *   "front"  → drawn after it, clipped to the hill's own silhouette
   */
  part: "behind" | "front";
  /** The foreground hill artwork, used as the clip mask for the front pass. */
  maskImg?: string;
}

/**
 * Viewport aspect, needed to bottom-anchor the front row.
 *
 * The blades are rotated 90°, so their on-screen HEIGHT comes from a length
 * expressed as a % of the stage WIDTH. Converting that into a % of the stage
 * HEIGHT therefore depends on the aspect ratio — a fixed number would sit right
 * on one window shape and be cut off or floating on another.
 */
function useStageAspect() {
  const [aspect, setAspect] = useState(16 / 9);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      if (el.clientHeight > 0) setAspect(el.clientWidth / el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);
  return aspect;
}

export function BladeField({ slide, focus, part, maskImg }: BladeFieldProps) {
  if (slide <= 0) return null;

  const focusKey = `${FOCUS_ROW}-${FOCUS_COL}`;

  const wantFront = part === "front";
  const slots = SLOTS.filter((s) => s.front === wantFront);

  // ── Bottom-anchor the front row ────────────────────────────────────────────
  // A front-row blade is BLADE_LEN_PCT of the stage WIDTH long, and stands
  // upright, so half of it reaches this far up/down in % of stage HEIGHT:
  const aspect = useStageAspect();
  const halfBladeH = (BLADE_LEN_PCT / 2) * aspect;
  // Put the bottom of those blades just above the bottom of the screen…
  const targetFrontY = 100 - FRONT_ROW_BOTTOM_GAP - halfBladeH;
  // …and shift the whole field by however far that is from where it was laid
  // out, so the rows keep their relative spacing.
  const fieldOffsetY = targetFrontY - spacedY(ROWS[0].y);

  // The front pass is CLIPPED to the foreground hill's own shape, using the
  // hill artwork as an alpha mask. That is what makes the blades get cut off by
  // the hill's curve — they only exist where the hill does, so any part that
  // would stick up past the ridge into the sky is simply not drawn.
  const mask =
    wantFront && maskImg
      ? {
          maskImage: `url(${maskImg})`,
          WebkitMaskImage: `url(${maskImg})`,
          maskSize: "100% auto",
          WebkitMaskSize: "100% auto",
          maskPosition: "bottom",
          WebkitMaskPosition: "bottom",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }
      : undefined;

  // NOTE: no scale here. The closing zoom is applied by the parent to a wrapper
  // that also contains the hills, so the entire scene magnifies as one and the
  // blade keeps its real size relative to the landscape.
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ...mask,
      }}
      aria-label={
        wantFront
          ? "Discarded turbine blades stacked on the near hill"
          : "A field filling with discarded turbine blades"
      }
    >
      {slots.map((s) => {
        // Each blade has its own slice of the slide, so they arrive in sequence
        // rather than all at once. `0.55` overlaps them generously — a shorter
        // window would make them march in one at a time, too mechanically.
        // Each batch gets a short window; batches overlap slightly so the field
        // fills continuously rather than in visible steps.
        const arrive = ramp(slide, s.order * 0.82, s.order * 0.82 + 0.18);

        // No travel — the blade appears exactly where it belongs. It only
        // settles the last couple of percent downward, which reads as landing
        // rather than materialising.
        const x = s.x;
        const y = s.y + fieldOffsetY - (1 - arrive) * 1.5;
        const w = s.w;

        // Non-focus blades fade as the zoom closes in, so the subject is clear.
        const isFocus = s.key === focusKey;
        const opacity = arrive * (isFocus ? 1 : 1 - focus * 0.85);

        return (
          <img
            key={s.key}
            src={BLADE_IMG}
            alt=""
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: "auto",
              // Positioned and rotated about the BLADE's centre, not the
              // canvas's — the blade sits off-centre in its artwork, so using
              // the default would both misplace it and make it swing rather
              // than turn on the spot.
              transformOrigin: `${50 + CONTENT_OFFSET_X}% ${50 + CONTENT_OFFSET_Y}%`,
              transform: `translate(${-(50 + CONTENT_OFFSET_X)}%, ${-(50 + CONTENT_OFFSET_Y)}%) rotate(${s.rot}deg)`,
              opacity,
              // NO will-change here, deliberately. It promotes an element to
              // its own GPU layer, which is a win for one or two elements and a
              // disaster for ~90: each blade image is ~1330×1000px (the blade
              // fills only 22.5% of its canvas), so promoting them all asked for
              // roughly 460 MB of layer memory. The compositor responded by
              // dropping layers — whole frames rendered blank and the hills
              // vanished. Left unpromoted, the browser batches them normally.
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEXT STEP — the cross-section
//
// `focus` drives the zoom into one blade; what it zooms INTO is still a
// placeholder (it is currently just the blade art magnified). To finish it:
//
//   1. Draw a cross-section of a blade — the layered build-up through its
//      shell. Export it the same way as the other art and upload it.
//   2. Add it here as a layer that cross-fades in once `focus` passes ~0.6,
//      using the same handover technique as the map → landscape zoom: keep it
//      riding the same scale curve so nothing stops moving.
//   3. Add callout labels for each layer.
//
// The materials and any figures must come from your own sourced research — I
// have deliberately not filled in names or numbers, since this is judged work.
// ─────────────────────────────────────────────────────────────────────────────
