import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE SCROLL TOOLKIT
//
// Three building blocks for the scrolling home page:
//
//   useInView(ref)   → true once an element scrolls into view. Drives the
//                      "slide in" reveals.
//   <ParallaxLayer>  → one PNG that moves at a fraction of scroll speed. Stack
//                      several at different speeds to get depth.
//   <FallingBlades>  → blades drifting down once a scene is reached.
//
// EVERYTHING ANIMATES WITH `transform` / `opacity` ONLY. Those are composited
// by the GPU, so the browser can skip re-doing layout on every frame. Animating
// `top`/`margin`/`width` instead would recalculate the page layout 60×/second
// and stutter — especially with this many large images on screen at once.
// ─────────────────────────────────────────────────────────────────────────────

/** True once `ref`'s element has scrolled into view (stays true afterwards). */
export function useInView<T extends Element>(
  ref: React.RefObject<T | null>,
  { once = true, rootMargin = "-10% 0px -10% 0px" } = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, rootMargin]);

  return inView;
}

/**
 * How far you have scrolled *through* a given element, as 0 → 1.
 *
 * `useInView` only answers "is it visible?" and `useScrollY` gives absolute
 * pixels. Neither can drive an animation that plays out across one section.
 * This does: 0 when the element's top reaches the top of the viewport, 1 when
 * its bottom does. Pair it with a tall element containing a `position: sticky`
 * child and the scroll distance becomes an animation timeline.
 */
export function useScrollProgress<T extends Element>(
  ref: React.RefObject<T | null>,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      // Distance this element can scroll before it has fully passed by.
      const scrollable = height - window.innerHeight;
      if (scrollable <= 0) return;
      // `top` starts at 0 and goes negative as you scroll down.
      setProgress(Math.min(1, Math.max(0, -top / scrollable)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return progress;
}

// ── Shared scroll position ───────────────────────────────────────────────────
// ONE listener for the whole page, throttled to the browser's paint rate with
// requestAnimationFrame. Every layer reads from this instead of adding its own
// listener, so scrolling stays cheap no matter how many layers exist.
let scrollY = 0;
const subscribers = new Set<(y: number) => void>();
let ticking = false;

function onScroll() {
  scrollY = window.scrollY;
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      subscribers.forEach((fn) => fn(scrollY));
      ticking = false;
    });
  }
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    if (subscribers.size === 0) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    subscribers.add(setY);
    setY(window.scrollY);
    return () => {
      subscribers.delete(setY);
      if (subscribers.size === 0) {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, []);
  return y;
}

/**
 * One image layer that drifts as you scroll.
 *
 * `speed` is how fast it moves relative to the page:
 *   0    = pinned, moves with the page (furthest away, e.g. sky)
 *   0.3  = drifts slowly (distant hills)
 *   0.8  = drifts fast (foreground grass)
 * Larger = feels closer to the viewer.
 */
export function ParallaxLayer({
  src,
  speed = 0.3,
  bottom = 0,
  zIndex = 0,
  height = "auto",
  placeholderColor,
}: {
  src?: string;
  speed?: number;
  bottom?: number | string;
  zIndex?: number;
  height?: number | string;
  /** Shown instead of an image while you're still drawing the art. */
  placeholderColor?: string;
}) {
  const y = useScrollY();
  const shift = y * speed;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom,
        width: "100%",
        height,
        zIndex,
        // translate3d nudges the browser into giving this its own GPU layer.
        transform: `translate3d(0, ${shift}px, 0)`,
        willChange: "transform",
        pointerEvents: "none",
        backgroundColor: placeholderColor,
      }}
    >
      {src && (
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>
  );
}

/**
 * A full-viewport scene. Children slide up and fade in the first time it
 * scrolls into view.
 */
export function Scene({
  children,
  minHeight = "100vh",
  background,
}: {
  children: React.ReactNode;
  minHeight?: number | string;
  background?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight,
        overflow: "hidden",
        background,
        // The reveal: slides up 40px and fades in when the scene is reached.
        transform: inView ? "translateY(0)" : "translateY(40px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
      }}
    >
      {children}
    </section>
  );
}

// ── Falling blades ───────────────────────────────────────────────────────────
type Blade = { id: number; left: number; delay: number; dur: number; drift: number; size: number };
let bladeId = 0;

/**
 * Blades drifting down the scene once it comes into view. Same idea as the
 * beaver's chunk particles, just slower and larger.
 */
export function FallingBlades({
  src,
  count = 12,
  placeholderColor = "rgba(255,255,255,0.9)",
}: {
  src?: string;
  count?: number;
  placeholderColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [blades, setBlades] = useState<Blade[]>([]);

  useEffect(() => {
    if (!inView) return;
    setBlades(
      Array.from({ length: count }, () => ({
        id: bladeId++,
        left: Math.random() * 100, // vw position
        delay: Math.random() * 4, // stagger so they don't fall in unison
        dur: 6 + Math.random() * 6, // slower = heavier feel
        drift: (Math.random() - 0.5) * 160, // sideways travel
        size: 40 + Math.random() * 60,
      })),
    );
  }, [inView, count]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <style>{`
        @keyframes bladeFall {
          0%   { opacity: 0; transform: translate3d(0, -10vh, 0) rotate(0deg); }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { opacity: 0;
                 transform: translate3d(var(--drift), 110vh, 0) rotate(var(--spin)); }
        }
      `}</style>

      {blades.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 0.25,
            backgroundColor: src ? undefined : placeholderColor,
            borderRadius: src ? undefined : 4,
            ["--drift" as string]: `${b.drift}px`,
            ["--spin" as string]: `${(Math.random() - 0.5) * 720}deg`,
            animation: `bladeFall ${b.dur}s linear ${b.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        >
          {src && (
            <img src={src} alt="" style={{ width: "100%", height: "100%", display: "block" }} />
          )}
        </div>
      ))}
    </div>
  );
}
