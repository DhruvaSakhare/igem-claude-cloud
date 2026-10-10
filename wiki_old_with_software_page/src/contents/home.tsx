import { Scene, ParallaxLayer, FallingBlades } from "../components/Landscape";
import { ZoomToLandscape } from "../components/ZoomToLandscape";

export function Home() {
  return (
    <>
      {/* ── SCROLLING LANDSCAPE ────────────────────────────────────────────
          Placeholder blocks stand in for the drawn PNGs so the motion can be
          tuned before the art is final. To use real art, add `src={...}` with
          the iGEM URL and delete the `placeholderColor`.

          `speed` is the parallax rate: 0 = pinned/furthest away, higher =
          drifts faster = feels closer to the viewer.
      ─────────────────────────────────────────────────────────────────────── */}
      {/* Scene 1 — the Europe map zooms into Denmark and becomes a landscape.
          Self-contained: the map, the zoom and the two grass layers all live
          in ZoomToLandscape.tsx, tuned by the constants at the top of it. */}
      <ZoomToLandscape />

      {/* Scene 2 — blades falling */}
      <Scene background="#b9e6ff">
        <ParallaxLayer
          placeholderColor="#7ab98d"
          speed={0.35}
          bottom={0}
          height={220}
          zIndex={1}
        />
        <FallingBlades count={14} />
      </Scene>
    </>
  );
}
