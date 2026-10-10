import { BladeField } from "./BladeField";
import { BLADES, type PlacedBlade } from "./blades.generated";

// ─────────────────────────────────────────────────────────────────────────────
// BLADE LAYERS — the landfill, drawn by hand
//
// The field of discarded blades: individually drawn blades that arrive one
// after another as you scroll, so the landscape fills up over time.
//
// This replaces BladeField, which stamped one blade image into a computed grid.
// That was scaffolding — a drawn field can have blades overlapping, part
// buried, at angles and in perspective, which a grid cannot.
//
// ── HOW THE ART GETS HERE ────────────────────────────────────────────────────
// You draw each blade on a FULL 2160×1620 canvas, in the position it should
// occupy, and export them named so they sort into the order you want them to
// appear (blade-01 … blade-50). Then:
//
//     bash scripts/crop_blades.sh <folder-of-exports> public/blades
//     mv public/blades/blades.generated.ts src/components/blades.generated.ts
//
// That crops every file to its own blade, converts it to AVIF, records where it
// sat as a percentage of the canvas, and writes the list this file imports.
//
// WHY CROPPED RATHER THAN FULL CANVASES
//   A 2160×1620 image costs ~14 MB of memory once decoded, however little is
//   drawn on it. Fifty of those would be several hundred MB — enough to stutter
//   badly and to crash phones. Cropped, a blade is a few percent of that, and
//   the recorded position puts it back exactly where it was drawn, so nothing
//   about the result changes.
//
// While BLADES is empty the scene falls back to the old computed field, so the
// page still works and you can add blades a few at a time.
//
// DRAWING NOTES
//   * Draw each blade in place on the full canvas — never crop it yourself, or
//     the recorded position will be wrong.
//   * Bigger and fewer toward the bottom, smaller and denser toward the back:
//     that is what makes the field recede.
//   * The last blades to arrive are the ones that make it feel overwhelming —
//     worth drawing with that rhythm in mind.
// ─────────────────────────────────────────────────────────────────────────────

/** Where the cropped blade art lives. Swap for the iGEM URL before deploying. */
const ART = `${import.meta.env.BASE_URL}blades/`;

/**
 * Blades drawn in FRONT of the foreground hill, by index in BLADES. Those are
 * clipped to the hill's silhouette; everything else is drawn behind it, so the
 * hill overlaps it and the blades read as further away.
 *
 * Kept here rather than in the generated file so re-running the script never
 * overwrites the decision — the script only knows pixels, not depth.
 *
 * INDICES ARE 0-BASED positions in BLADES, so 18 is Blades19. These seven were
 * drawn across the near slope, where the foreground hill covers them: in the
 * behind pass they rendered at full opacity and were simply never seen.
 */
const FRONT_BLADES = new Set<number>([18, 19, 20, 21, 22, 23, 24]);

// A blade simply APPEARS, whole and in place.
//
// It does not fade in (a half-transparent blade reads as a rendering glitch,
// and 25 of them at once washed the landscape out) and it does not slide into
// position afterwards (movement after arrival makes the field look unsettled,
// as if the blades were still falling). The only thing that changes across the
// fill window is HOW MANY blades are there.

// How much of the window the arrivals are spread over. Below 1 they all land
// before the end, leaving the full field on screen for a beat — which is the
// moment the point lands.
const ARRIVAL_SPAN = 0.85;

// Arrivals accelerate: >1 means the first blades are spaced out and the last
// come in a rush. 1 would space them evenly. Kept gentle — at 1.6 the last
// third of the blades piled in almost together.
const ARRIVAL_CURVE = 1.25;

/** When blade `i` of `n` starts arriving, as a fraction of the fill window. */
function arrivalStart(i: number, n: number) {
  return Math.pow(i / Math.max(n, 1), ARRIVAL_CURVE) * ARRIVAL_SPAN;
}

/**
 * The drawn landfill.
 *
 * @param slide 0 → empty landscape, 1 → every blade arrived.
 * @param part  which side of the foreground hill to draw.
 * @param maskImg the hill artwork, used to clip the "front" pass to it.
 */
export function BladeLayers({
  slide,
  part,
  maskImg,
}: {
  slide: number;
  part: "behind" | "front";
  maskImg?: string;
}) {
  // Until the art exists, keep the old computed field so the scene still plays.
  if (BLADES.length === 0) {
    return <BladeField slide={slide} focus={0} part={part} maskImg={maskImg} />;
  }

  if (slide <= 0) return null;

  const wantFront = part === "front";
  // Each blade keeps its index in the FULL list, so its arrival time does not
  // change when the two passes are split apart.
  const mine = BLADES.map((blade, i) => ({ blade, i })).filter(
    ({ i }) => FRONT_BLADES.has(i) === wantFront,
  );
  if (mine.length === 0) return null;

  return (
    <div
      style={{
        // THE CANVAS BOX, not the stage.
        //
        // Every blade's position is a % of the 2160×1620 artwork, so the box
        // those percentages resolve against must BE that artwork's box — same
        // as the hills use (see hillBox in ZoomToLandscape). Given `inset: 0`
        // instead, the percentages resolved against the viewport's height and
        // from its top edge, which put every blade too low and drifting as the
        // window changed shape.
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        aspectRatio: "2160 / 1620",
        pointerEvents: "none",
        // The front pass is clipped to the hill, so blades drawn for the near
        // slope cannot spill over its skyline.
        ...(wantFront && maskImg
          ? {
              WebkitMaskImage: `url(${maskImg})`,
              maskImage: `url(${maskImg})`,
              WebkitMaskSize: "100% auto",
              maskSize: "100% auto",
              WebkitMaskPosition: "bottom",
              maskPosition: "bottom",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }
          : null),
      }}
    >
      {mine.map(({ blade, i }) => (
        <Blade
          key={blade.img}
          blade={blade}
          arrived={slide >= arrivalStart(i, BLADES.length)}
          zIndex={i}
        />
      ))}
    </div>
  );
}

/**
 * One blade, put back where it was drawn — static once it is there.
 *
 * Only the WIDTH is set: the image keeps its own aspect ratio, so a blade can
 * never come out squashed, and the height follows from the crop automatically.
 */
function Blade({
  blade,
  arrived,
  zIndex,
}: {
  blade: PlacedBlade;
  arrived: boolean;
  zIndex: number;
}) {
  if (!arrived) return null;
  return (
    <img
      src={ART + blade.img}
      alt=""
      // The browser only fetches a blade as it is about to be needed, rather
      // than all fifty up front.
      loading="lazy"
      decoding="async"
      style={{
        position: "absolute",
        left: `${blade.left}%`,
        top: `${blade.top}%`,
        width: `${blade.width}%`,
        zIndex,
      }}
    />
  );
}
