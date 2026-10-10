import { useEffect, useState } from "react";

// ─── SHARED TYPES & STYLE ────────────────────────────────────────────────────
export type TocSection = {
  id: string; // must match the id of the section element on the page
  label: string; // shown as the blade / marker text
};

// Official palette
const MAST_COLOR = "#27476E"; // dark blue — the windmill tower/bar
const BLADE_COLOR = "#ffffff"; // white blades
const ACCENT_COLOR = "#de7033"; // orange — active marker

// The ToC hides below this width (it's a fixed left sidebar that would
// otherwise overlap page content on small screens).
const MIN_WIDTH = 992;

// ─── SCROLL SPY HOOK ─────────────────────────────────────────────────────────
// Returns the index of the section currently in view. Shared by all versions
// (also used by WindmillTocDrawn).
export function useActiveSection(sections: TocSection[]) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top that is intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          const idx = sections.findIndex((s) => s.id === id);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      // Trigger when a section reaches the upper third of the viewport.
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return activeIndex;
}

// Smoothly scroll a section into view when its marker/blade is clicked.
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Small helper: only render the ToC on wide screens.
function useIsWide() {
  const [wide, setWide] = useState(
    typeof window !== "undefined" ? window.innerWidth >= MIN_WIDTH : true,
  );
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= MIN_WIDTH);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return wide;
}

// ─── VERSION 1: SIMPLE MAST ──────────────────────────────────────────────────
// Just the windmill "bar" (tower) fixed on the left, with a marker per section.
// The active section's marker is highlighted. Clicking a marker scrolls to it.
export function WindmillToc({ sections }: { sections: TocSection[] }) {
  const activeIndex = useActiveSection(sections);
  const wide = useIsWide();
  if (!wide || sections.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      style={{
        position: "fixed",
        left: 28,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* The mast — a rounded vertical bar */}
      <div
        style={{
          width: 10,
          minHeight: sections.length * 44,
          borderRadius: 6,
          background: MAST_COLOR,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          padding: "12px 0",
        }}
      >
        {sections.map((section, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              title={section.label}
              style={{
                position: "absolute",
                left: "50%",
                top: `${((i + 0.5) / sections.length) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: active ? 22 : 14,
                height: active ? 22 : 14,
                borderRadius: "50%",
                border: `3px solid ${MAST_COLOR}`,
                background: active ? ACCENT_COLOR : BLADE_COLOR,
                cursor: "pointer",
                padding: 0,
                transition: "all 0.25s ease",
              }}
            />
          );
        })}
      </div>

      {/* Active section label next to the mast */}
      <span
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 600,
          color: MAST_COLOR,
          fontSize: "1rem",
          whiteSpace: "nowrap",
        }}
      >
        {sections[activeIndex]?.label}
      </span>
    </nav>
  );
}

// ─── VERSION 2: MAST + SPINNING BLADES ───────────────────────────────────────
// The same mast, topped with a rotor of blades — one blade per section. As you
// scroll to the next section the rotor spins so that section's blade becomes
// horizontal, and that horizontal blade carries the section title (acting as
// the header of that section).
export function WindmillBladeToc({ sections }: { sections: TocSection[] }) {
  const activeIndex = useActiveSection(sections);
  const wide = useIsWide();
  if (!wide || sections.length === 0) return null;

  const n = sections.length;
  const step = 360 / n; // angular spacing between blades
  // Rotate the whole rotor so the active blade lands at 0° (horizontal, right).
  const rotorAngle = -activeIndex * step;

  const HUB = 78; // px from left — where the rotor hub sits
  const BLADE_LEN = 132; // blade length (px)
  const BLADE_W = 26; // blade width at the base (px)

  return (
    <nav
      aria-label="Table of contents"
      style={{
        position: "fixed",
        left: HUB,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 900,
        width: 0,
        height: 0,
      }}
    >
      {/* Vertical mast dropping below the hub */}
      <div
        style={{
          position: "absolute",
          left: -5,
          top: 0,
          width: 10,
          height: "38vh",
          borderRadius: 6,
          background: MAST_COLOR,
        }}
      />

      {/* Rotor: rotates so the active blade is horizontal */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          transform: `rotate(${rotorAngle}deg)`,
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {sections.map((section, i) => {
          const active = i === activeIndex;
          const bladeAngle = i * step; // fixed position on the rotor
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              title={section.label}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: BLADE_LEN,
                height: BLADE_W,
                transformOrigin: "0% 50%",
                transform: `rotate(${bladeAngle}deg) translateY(-50%)`,
                // aerofoil-ish blade shape, pointed at the hub, wide at the tip
                clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)",
                background: active ? ACCENT_COLOR : BLADE_COLOR,
                border: "none",
                cursor: "pointer",
                padding: 0,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                transition: "background 0.4s ease",
              }}
            />
          );
        })}
      </div>

      {/* Hub cap */}
      <div
        style={{
          position: "absolute",
          left: -12,
          top: -12,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: MAST_COLOR,
          border: `3px solid ${BLADE_COLOR}`,
        }}
      />

      {/* Header label — sits on the horizontal (active) blade */}
      <span
        style={{
          position: "absolute",
          left: BLADE_LEN + 18,
          top: 0,
          transform: "translateY(-50%)",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 700,
          fontSize: "1.4rem",
          color: MAST_COLOR,
          whiteSpace: "nowrap",
        }}
      >
        {sections[activeIndex]?.label}
      </span>
    </nav>
  );
}
