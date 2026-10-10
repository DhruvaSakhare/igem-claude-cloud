/**
 * =============================================================================
 * BackToTop — scroll-to-top button that expands into a mini site nav
 * =============================================================================
 *
 * WHAT IT DOES
 *   A brightblue circular button with an orange arrowhead, fixed bottom-right.
 *   - Hidden until the user scrolls down `showAfterPx` (default 400); then
 *     fades in.
 *   - Click / tap: smooth-scrolls back to the top of the page.
 *   - Hover or keyboard focus: the circle expands into a darkblue box directly
 *     above it, listing the same top-level pages as the main Navbar. Hovering
 *     or focusing a section with subpages opens its dropdown as an offwhite
 *     flyout (orange text, brightblue-shadow outline) to the left.
 *
 * =============================================================================
 */

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import Pages from "../pages.ts";
import { prefersReducedMotion } from "../utils/prefersReducedMotion";

/* ---------- types matching the shape of src/pages.ts ---------- */

interface Subpage {
  name: string;
  path: string;
}

export interface NavSection {
  title: string;
  landingPath: string;
  subpages: Subpage[];
}

/* ---------- helpers (small, single-purpose) ---------- */

/** Flatten the Pages config into simple nav sections (same rules as Navbar). */
function toNavSections(): NavSection[] {
  const sections: NavSection[] = [];
  for (const item of Pages) {
    if ("folder" in item && item.folder) {
      const subpages = item.folder
        .filter((sub) => sub.path)
        .map((sub) => ({ name: sub.name ?? "", path: sub.path as string }));
      // A Folder entry may not declare a `path` of its own, so check for it
      // safely instead of accessing it directly. `navPath` wins where a folder
      // wants its title to open something other than its overview page (see
      // the Dry Lab / "Model" section in pages.ts).
      const ownPath =
        "path" in item && typeof item.path === "string" ? item.path : undefined;
      const navPath =
        "navPath" in item && typeof item.navPath === "string"
          ? item.navPath
          : undefined;
      sections.push({
        title: item.name ?? "",
        landingPath: navPath ?? ownPath ?? subpages[0]?.path ?? "/",
        subpages,
      });
    } else if ("path" in item && item.path) {
      sections.push({ title: item.name ?? "", landingPath: item.path, subpages: [] });
    }
  }
  return sections;
}

/** Pages is static config, so flatten it once at module load, not per render. */
export const NAV_SECTIONS = toNavSections();

/** True if the user prefers reduced motion. */
// Re-exported so the navbar can keep importing it from here; the definition
// lives in utils/ because content pages need it too and importing this file
// from one closes an import cycle through pages.ts.
export { prefersReducedMotion };

/** Smooth-scroll to the top (instant if the user prefers reduced motion). */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/* ---------- styles ---------- */

const styles: Record<string, CSSProperties> = {
  // The wrapper contains both the box and the button, so the pointer can
  // cross the visual gap between them without collapsing the menu.
  wrapper: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 1040, // above Bootstrap's fixed navbar (1030) so the menu is never hidden
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "none",
    background: "var(--color-brightblue)",
    cursor: "pointer",
    boxShadow: "0 4px 14px var(--color-shadow)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  // Darkblue box the circle "expands" into (grows from the button corner).
  menu: {
    background: "var(--color-darkblue)",
    borderRadius: 14,
    padding: "8px 0",
    minWidth: 175,
    boxShadow: "0 6px 20px var(--color-shadow)",
    listStyle: "none",
    margin: 0,
    transformOrigin: "bottom right",
  },
  menuItem: {
    position: "relative",
    display: "block",
  },
  menuLink: {
    display: "block",
    padding: "8px 18px",
    color: "var(--color-orange)",
    textDecoration: "none",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  // Offwhite flyout with orange text and a brightblue-shadow outline.
  flyout: {
    position: "absolute",
    right: "100%",
    top: 0,
    marginRight: 8,
    background: "var(--color-offwhite)",
    outline: "2px solid var(--color-brightblue-shadow)",
    borderRadius: 10,
    padding: "6px 0",
    minWidth: 170,
    boxShadow: "0 6px 20px var(--color-shadow)",
    listStyle: "none",
    margin: 0,
  },
  flyoutLink: {
    display: "block",
    padding: "7px 16px",
    color: "var(--color-orange)",
    textDecoration: "none",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
};

/* ---------- subcomponents ---------- */

/** Orange arrowhead (chevron only, no stem). Nudges up while hovered. */
function ArrowHead({ lifted, animate }: { lifted: boolean; animate: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        transform: lifted ? "translateY(-2px)" : "none",
        transition: animate ? "transform 0.2s ease" : "none",
      }}
    >
      <path
        d="M5 15l7-7 7 7"
        fill="none"
        stroke="var(--color-offwhite)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One top-level entry in the mini nav; shows its subpages on hover/focus. */
function MiniNavItem({ section }: { section: NavSection }) {
  const [open, setOpen] = useState(false);
  const hasSubpages = section.subpages.length > 0;

  return (
    <li
      style={styles.menuItem}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Link to={section.landingPath} style={styles.menuLink}>
        {section.title}
        {hasSubpages && <span aria-hidden="true"> ‹</span>}
      </Link>

      {hasSubpages && open && (
        <ul style={styles.flyout}>
          {section.subpages.map((sub) => (
            <li key={sub.path}>
              <Link to={sub.path} style={styles.flyoutLink}>
                {sub.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ---------- main component ---------- */

export interface BackToTopProps {
  /** Scroll distance (px) before the button appears. Defaults to 400. */
  showAfterPx?: number;
}

export function BackToTop({ showAfterPx = 600 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Track scroll position to decide visibility.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfterPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfterPx]);

  const animate = !prefersReducedMotion();
  const showMenu = visible && expanded;

  return (
    <div
      style={{
        ...styles.wrapper,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.6)",
        pointerEvents: visible ? "auto" : "none",
        transition: animate ? "opacity 0.25s ease, transform 0.25s ease" : "none",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
    >
      {/* Darkblue box the circle expands into (scales up from the button) */}
      <nav aria-label="Quick page navigation" aria-hidden={!showMenu}>
        <ul
          style={{
            ...styles.menu,
            transform: showMenu ? "scale(1)" : "scale(0)",
            opacity: showMenu ? 1 : 0,
            pointerEvents: showMenu ? "auto" : "none",
            transition: animate ? "transform 0.25s ease, opacity 0.2s ease" : "none",
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <MiniNavItem key={section.landingPath} section={section} />
          ))}
        </ul>
      </nav>

      {/* The brightblue circle with the orange arrowhead */}
      <button
        type="button"
        onClick={scrollToTop}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Back to top"
        title="Back to top"
        style={styles.button}
      >
        <ArrowHead lifted={hovered} animate={animate} />
      </button>
    </div>
  );
}
