import { ZoomToLandscape } from "../components/ZoomToLandscape";

export function Home() {
  return (
    <>
      {/* ONE scene, one scroll. The Europe map zooms into Denmark and becomes a
          landscape, a car drives through, the turbines stop and shed their
          blades, the field fills with them, two blades drop into the foreground
          and jam into the ground — and the camera then keeps going down into
          the dirt beneath.

          It is deliberately a single sticky stage: the descent was briefly a
          second section, which replayed the landscape as the first unpinned and
          the second pinned. ZoomToLandscape.tsx holds the whole sequence, with
          the underground half in DirtDescent.tsx; the constants at the top of
          each tune it. */}
      <ZoomToLandscape />
    </>
  );
}
