import { useEffect, useRef, useState, useCallback } from "react";
import { COLLAPSE_AFTER_PX } from "./CloudNavbar";

// ─── TUNEABLE CONSTANTS ──────────────────────────────────────────────────────
const BAR_HEIGHT = 24; // px — height of the whole bar
const BEAVER_WIDTH = 48; // px — width of the beaver SVG
const BEAVER_HEIGHT = 44; // px — height of the beaver SVG
const CHOMP_INTERVAL_MS = 100; // ms per jaw open/close cycle (lower = faster)
const CHUNK_COUNT = 5; // number of chunks spawned per chomp
const CHUNK_FALL_MS = 700; // ms chunks take to fall and fade out
// Shard clip-path shapes — randomised per chunk for variety
const SHARD_SHAPES = [
  "polygon(50% 0%, 0% 100%, 100% 100%)", // triangle up
  "polygon(0% 0%, 100% 50%, 0% 100%)", // triangle right
  "polygon(100% 0%, 0% 50%, 100% 100%)", // triangle left
  "polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%)", // skewed quad
  "polygon(50% 0%, 100% 100%, 0% 70%)", // asymmetric shard
  "polygon(0% 30%, 100% 0%, 70% 100%)", // leaning shard
];

// ─── CHUNK PARTICLE ──────────────────────────────────────────────────────────
type Chunk = {
  id: number;
  x: number; // px from left of viewport
  y: number; // px from top of viewport
  dx: number; // horizontal travel px (can be negative)
  dy: number; // vertical travel px (negative = upward)
  rot: number; // spin degrees over animation
  shape: string; // clip-path value
  w: number; // width px
  h: number; // height px
};

let chunkId = 0;

export function BeaverProgressBar() {
  const [progress, setProgress] = useState(0); // 0–1
  const [jawOpen, setJawOpen] = useState(false); // toggles for chomp animation
  const [chunks, setChunks] = useState<Chunk[]>([]); // falling white pieces
  const [isScrolling, setIsScrolling] = useState(false);
  // Shown only once the cloud navbar has collapsed, so the two appear together.
  const [visible, setVisible] = useState(false);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chompTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Scroll listener ─────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    setProgress(maxScroll > 0 ? scrollY / maxScroll : 0);
    setVisible(scrollY > COLLAPSE_AFTER_PX);
    setIsScrolling(true);

    // Stop "scrolling" state 300ms after last scroll event
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => setIsScrolling(false), 300);
  }, []);

  useEffect(() => {
    handleScroll(); // set the correct state on first render (e.g. restored scroll)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── Chomp animation — only runs while scrolling ──────────────────────────
  useEffect(() => {
    // Only chomp while the bar is actually on screen.
    if (isScrolling && visible) {
      chompTimer.current = setInterval(() => {
        setJawOpen((o) => !o);

        // Spawn white blade chunks at the beaver's mouth. The bar is vertical
        // on the right edge, so the mouth tracks Y and sits at a fixed X.
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const beaverY = progress * (vh - BEAVER_HEIGHT);
        const mouthX = vw - BAR_HEIGHT * 0.5;
        const mouthY = beaverY + BEAVER_HEIGHT * 0.85;

        // === CHUNKS: tweak color, size, count, fall speed in TUNEABLE CONSTANTS above ===
        const newChunks: Chunk[] = Array.from({ length: CHUNK_COUNT }, () => ({
          id: chunkId++,
          x: mouthX,
          y: mouthY + (Math.random() - 0.5) * 12,
          // Fly leftward off the bar and scatter vertically.
          dx: -(20 + Math.random() * 70),
          dy: (Math.random() - 0.5) * 90,
          rot: (Math.random() - 0.5) * 360, // full spin
          shape: SHARD_SHAPES[Math.floor(Math.random() * SHARD_SHAPES.length)],
          w: 10 + Math.random() * 16,
          h: 8 + Math.random() * 14,
        }));
        setChunks((c) => [...c, ...newChunks]);

        // Remove chunks after they finish animating
        setTimeout(() => {
          setChunks((c) =>
            c.filter((ch) => !newChunks.find((n) => n.id === ch.id)),
          );
        }, CHUNK_FALL_MS);
      }, CHOMP_INTERVAL_MS);
    } else {
      if (chompTimer.current) clearInterval(chompTimer.current);
      setJawOpen(false);
    }
    return () => {
      if (chompTimer.current) clearInterval(chompTimer.current);
    };
  }, [isScrolling, progress, visible]);


  // Beaver's vertical position in px (clamped so it never leaves the bar).
  // The bar runs top→bottom down the right edge, so progress maps to Y.
  const vpHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const beaverTop = Math.max(
    0,
    Math.min(progress * (vpHeight - BEAVER_HEIGHT), vpHeight - BEAVER_HEIGHT),
  );

  return (
    <>
      {/* ── Bar container ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: `${BAR_HEIGHT}px`, // thickness of the vertical bar
          height: "100vh", // runs the full height of the viewport
          zIndex: 999,
          backgroundColor: "transparent", // everything above the beaver is transparent
          overflow: "visible",
          pointerEvents: "none",
          // Fades in once you start scrolling (same trigger as the navbar collapse).
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        {/* ── BLADE ──────────────────────────────────────────────────────────
            The blade runs vertically down the right edge. The `clipPath` hides
            the eaten (upper) portion as progress grows, so the beaver appears
            to chew downward from the top.

            TO SWAP TO A PNG:
              Replace the <svg> with an <img> and clip it with the same rect:
              clipPath: `inset(${progress * 100}% 0 0 0)`.
        ─────────────────────────────────────────────────────────────────── */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          preserveAspectRatio="none"
          viewBox="0 0 24 1000"
        >
          <defs>
            {/* Clip starts at progress% down and runs to the bottom edge */}
            <clipPath id="blade-clip">
              <rect
                x="0"
                y={progress * 1000}
                width="24"
                height={1000 - progress * 1000}
              />
            </clipPath>
          </defs>

          {/* === BLADE PATH: aerofoil — pointed tip at the top, wide base at
              the bottom. This is the horizontal path with X and Y swapped. */}
          <g clipPath="url(#blade-clip)">
            <path
              d="M 12,0 Q 4,80 3,300 Q 1,600 0,900 L 0,1000 L 24,1000 L 24,900 Q 23,600 21,300 Q 20,80 12,0 Z"
              fill="white"
              opacity="1"
            />
          </g>
        </svg>
      </div>

      {/* ── BEAVER — rendered outside bar div so zIndex is independent ─────────
          TO SWAP TO A PNG: replace the <svg> with an <img> using the same
          position/rotate styles below.
      ───────────────────────────────────────────────────────────────────────── */}
      <svg
        style={{
          position: "fixed",
          // Travels down the right edge as progress grows.
          top: `${beaverTop}px`,
          right: `${BAR_HEIGHT - BEAVER_HEIGHT / 2}px`,
          width: `${BEAVER_WIDTH}px`,
          height: `${BEAVER_HEIGHT}px`,
          // The art is drawn facing right; rotate it a quarter turn so the
          // teeth point downward into the vertical blade.
          transform: "rotate(90deg)",
          transformOrigin: "center",
          overflow: "visible",
          zIndex: 1031,
          pointerEvents: "none",
          // Fades in with the bar so the beaver never appears on its own.
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
        viewBox="0 0 48 44"
      >
        {/* === BEAVER SVG: replace this group when you have real artwork === */}
        <ellipse
          cx="12"
          cy="34"
          rx="13"
          ry="6"
          fill="#6B3F1A"
          transform="rotate(15 12 34)"
        />
        <line
          x1="4"
          y1="30"
          x2="20"
          y2="40"
          stroke="#5A2A0A"
          strokeWidth="0.7"
          opacity="0.5"
        />
        <line
          x1="6"
          y1="27"
          x2="22"
          y2="37"
          stroke="#5A2A0A"
          strokeWidth="0.7"
          opacity="0.5"
        />
        <ellipse
          cx="22"
          cy="30"
          rx="16"
          ry="12"
          fill="#8B5A2B"
          transform="rotate(-8 22 30)"
        />
        <ellipse
          cx="32"
          cy="20"
          rx="12"
          ry="11"
          fill="#A0693A"
          transform="rotate(15 32 20)"
        />
        <ellipse cx="24" cy="10" rx="5" ry="6" fill="#8B5A2B" />
        <ellipse cx="24" cy="10" rx="3" ry="4" fill="#C4846A" />
        <ellipse cx="36" cy="15" rx="4" ry="4.5" fill="white" />
        <ellipse cx="37" cy="16" rx="2.5" ry="3" fill="#1a1a1a" />
        <circle cx="38" cy="15" r="1" fill="white" />
        <ellipse cx="26" cy="14" rx="5.5" ry="6.5" fill="white" />
        <ellipse cx="27" cy="15" rx="3.5" ry="4" fill="#1a1a1a" />
        <circle cx="28" cy="13" r="1.5" fill="white" />
        <ellipse
          cx="41"
          cy="21"
          rx="3"
          ry="2"
          fill="#5A2A0A"
          transform="rotate(10 41 21)"
        />
        <path
          d="M 37,24 Q 42,22 46,24"
          stroke="#5A2A0A"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d={jawOpen ? "M 37,30 Q 42,40 46,36" : "M 37,26 Q 42,27 46,26"}
          stroke="#5A2A0A"
          strokeWidth="1.2"
          fill="#C4846A"
        />
        <rect
          x="39"
          y="24"
          width="3.5"
          height={jawOpen ? "12" : "3"}
          rx="1"
          fill="#FFF8DC"
        />
        <rect
          x="43"
          y="24"
          width="3.5"
          height={jawOpen ? "12" : "3"}
          rx="1"
          fill="#FFF8DC"
        />
        <ellipse
          cx="40"
          cy="32"
          rx="5"
          ry="3"
          fill="#8B5A2B"
          transform="rotate(-15 40 32)"
        />
      </svg>

      {/* ── FALLING CHUNKS ─────────────────────────────────────────────────────
          Rendered outside the bar div so they can fall below it.

          === CHUNKS: to change appearance, edit the div style below.
              Change backgroundColor for a different color (currently white).
              Change width/height for bigger/smaller pieces. ===
      ───────────────────────────────────────────────────────────────────────── */}
      {chunks.map((chunk) => (
        <div
          key={chunk.id}
          style={{
            position: "fixed",
            left: `${chunk.x}px`,
            top: `${chunk.y}px`,
            width: `${chunk.w}px`,
            height: `${chunk.h}px`,
            clipPath: chunk.shape, // === SHARD SHAPE ===
            backgroundColor: "white", // === CHUNK COLOR: change here ===
            opacity: 1,
            pointerEvents: "none",
            zIndex: 998,
            // Pass per-chunk travel distance into the keyframe via CSS vars
            ["--dx" as string]: `${chunk.dx}px`,
            ["--dy" as string]: `${chunk.dy}px`,
            ["--rot" as string]: `${chunk.rot}deg`,
            animation: `beaverChunkFall ${CHUNK_FALL_MS}ms ease-out forwards`,
          }}
        />
      ))}

      {/* Chunk fall keyframes — uses CSS custom props set inline above */}
      <style>{`
        @keyframes beaverChunkFall {
          0%   { opacity: 1; transform: translate(0, 0) rotate(0deg); }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); }
        }
      `}</style>
    </>
  );
}
