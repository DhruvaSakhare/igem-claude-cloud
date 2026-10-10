import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NAV_SECTIONS, prefersReducedMotion, scrollToTop } from "./BackToTop";
import type { NavSection } from "./BackToTop";

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD NAVBAR
//
// Two states, driven by scroll position:
//
//   EXPANDED (at the top of the page)
//     One cloud per top-level page, floating across the top. Folders open a
//     dropdown of their subpages on hover.
//
//   COLLAPSED (scrolled past COLLAPSE_AFTER_PX)
//     The clouds drift right and merge into a single cloud pinned top-right,
//     clearing the page for reading. Clicking it opens the full menu, which
//     also carries a "Back to top" action.
//
//   Scrolling back to the top expands the clouds again automatically.
//
// The nav data and scroll helpers are shared with BackToTop.tsx so both
// controls always list the same pages.
// ─────────────────────────────────────────────────────────────────────────────

// === ART ===
const CLOUD_IMGS = [
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-1.avif",
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-2.avif",
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-3.avif",
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-4.avif",
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-5.avif",
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-6.avif",
];

const COLLAPSED_IMG =
  "https://static.igem.wiki/teams/6060/wiki/navbar/cloud-collapsed.avif"; // cloud for the collapsed button

// === TUNEABLE ===
// Scroll distance before the clouds collapse. Exported so BeaverProgressBar
// can fade in at exactly the same moment.
export const COLLAPSE_AFTER_PX = 120;
const CLOUD_W = 110; // px — width of one nav cloud
const CLOUD_H = 80; // px — height of one nav cloud
const COLLAPSED_W = 110; // px — width of the single collapsed cloud
const COLLAPSED_H = 80; // px — height of the single collapsed cloud
const TEXT_COLOR = "var(--color-darkblue)";
// Feathered edges so the clouds read as real cloud rather than flat vector
// shapes. Because the artwork is a solid white fill, blurring only changes the
// alpha at the silhouette's edge — the interior stays fully opaque white. The
// outermost pixels end up most transparent, fading inward over the blur radius.
// Raise for a softer, wispier edge; "0px" disables it. Only the image is
// affected, never the label text.
const CLOUD_OPACITY = 1; // keep the body solid; edges are softened by the blur
const CLOUD_EDGE_BLUR = "0px"; // ≈ how many px the fade ramps over
// How far right the whole cloud group sits. The subtraction is what makes this
// genuinely responsive: below ~715px viewport the expression goes negative and
// clamps to 0, so narrow screens get no shift at all. Above that it grows with
// the viewport up to the 520px cap. Raise the 35vw to shift further right.
const CLOUD_SHIFT_RIGHT = "clamp(0px, calc(50vw - 180px), 650px)";
// Below this width the row of clouds cannot fit, so the navbar shows only the
// single collapsed cloud instead of wrapping over the page content.
const NARROW_BREAKPOINT_PX = 900;
// Breathing room above the clouds. The header grows to match, so nothing clips.
const NAV_TOP_PADDING = 14;
// Vertical offset of the expanded cloud row. Kept separate from
// NAV_TOP_PADDING (which positions the collapsed badge + cloud) so the clouds
// can sit high enough to fall entirely within the swoop's top strip — that
// strip is 81/263 of the swoop height, i.e. ~61px at a 1440px viewport.
const CLOUD_ROW_TOP = 4;
// Gradient of the nav bar
const SKY_HEIGHT = "500px"; // how far the sky reaches down the page
// ── Alisha's curved swoop + the team logo ────────────────────────────────────
// The swoop and the logo are drawn as SEPARATE images on purpose.
//
// Navbar_with_logo.svg looks like vector art, but the logo inside it is a
// 203 × 308 PNG embedded as base64 and stretched across a 1920-wide canvas —
// so on screen it was being blown up 2–4× and looked blurry, even though the
// logo file itself is sharp. navbar-swoop.svg is that same file with the
// embedded bitmap stripped out, leaving only the (genuinely vector) swoop, and
// the real logo is layered over it at full resolution.
// const SWOOP_IMG = `${import.meta.env.BASE_URL}navbar-swoop.svg`;
const LOGO_IMG =
  "https://static.igem.wiki/teams/6060/wiki/logos/bbb-logo-finished-22-08.avif";
const SWOOP_W = 1920; // native canvas width
const SWOOP_H = 263; // native canvas height
// Where the logo sits on that canvas — the rect the old baked-in logo filled.
// Expressed as % of the swoop so it scales with it at any viewport width.
// Only the top and height are pinned; the width follows the logo's own aspect
// ratio, which differs slightly from the old rect's.
const LOGO_LEFT_PCT = (20 / SWOOP_W) * 100;
const LOGO_TOP_PCT = (15 / SWOOP_H) * 100;
const LOGO_HEIGHT_PCT = (160 / SWOOP_H) * 100;
// Height of the logo inside the collapsed corner badge.
const BADGE_LOGO_H = 120;
const BADGE_PAD = 20; // padding on the left
// How far the dropdown tucks up under the cloud. The artwork has transparent
// margin below the drawn shape, so a plain CLOUD_H offset leaves a visible gap;
// this pulls the menu up into the cloud's soft underside. Raise to tuck further.
const DROPDOWN_TUCK = 20;

/** One cloud in the expanded bar; opens its subpages on hover. */
function CloudItem({
  section,
  index,
  collapsed,
}: {
  section: NavSection;
  index: number;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasSubpages = section.subpages.length > 0;
  const animate = !prefersReducedMotion();

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={section.landingPath}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: CLOUD_W,
          height: CLOUD_H,
          transform: collapsed
            ? `translateX(${(NAV_SECTIONS.length - index) * 40}px) scale(0.4)`
            : "translateX(0) scale(1)",
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          transition: animate
            ? `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 40}ms, opacity 0.4s ease ${index * 40}ms`
            : "none",
        }}
      >
        <img
          src={CLOUD_IMGS[index % CLOUD_IMGS.length]}
          alt={section.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
            pointerEvents: "none",
            opacity: CLOUD_OPACITY,
            filter: `blur(${CLOUD_EDGE_BLUR})`,
          }}
        />
      </Link>

      {/* Subpage dropdown, tucked under the cloud. Styled as a soft puff so it
          reads as part of the cloud rather than a hard-edged box: no outline,
          generous rounding, and a diffuse shadow to match the feathered art. */}
      {hasSubpages && open && !collapsed && (
        <div
          style={{
            position: "absolute",
            top: CLOUD_H - DROPDOWN_TUCK,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.96)",
            borderRadius: 18,
            padding: "10px 0",
            minWidth: 170,
            boxShadow: "0 8px 26px rgba(39, 71, 110, 0.18)",
            zIndex: 10,
            // Fades and drifts down, like the cloud is releasing the menu.
            animation: animate ? "cloudDropIn 0.22s ease-out both" : "none",
          }}
        >
          {section.subpages.map((sub) => (
            <Link
              key={sub.path}
              to={sub.path}
              style={{
                display: "block",
                padding: "7px 16px",
                color: "var(--color-orange)",
                textDecoration: "none",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** The single cloud shown once collapsed; click to open the full menu. */
function CollapsedCloud({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const animate = !prefersReducedMotion();

  // Close the menu whenever we expand back to the full cloud bar.
  useEffect(() => {
    if (!visible) {
      setOpen(false);
      setOpenSection(null);
    }
  }, [visible]);

  return (
    <div
      style={{
        position: "absolute",
        top: NAV_TOP_PADDING, // sits at the same height as the expanded clouds
        right: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.6)",
        pointerEvents: visible ? "auto" : "none",
        transition: animate
          ? "opacity 0.35s ease 0.15s, transform 0.35s ease 0.15s"
          : "none",
      }}
      onMouseLeave={() => {
        setOpen(false);
        setOpenSection(null);
      }}
    >
      {/* The cloud button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open navigation"
        aria-expanded={open}
        style={{
          position: "relative",
          width: COLLAPSED_W,
          height: COLLAPSED_H,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={COLLAPSED_IMG}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
            opacity: CLOUD_OPACITY,
            filter: `blur(${CLOUD_EDGE_BLUR})`,
          }}
        />
        {/* Hamburger lines, drawn over the cloud */}
        <span style={{ position: "relative", lineHeight: 0 }}>
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
            {[2, 8, 14].map((y) => (
              <rect
                key={y}
                x="1"
                y={y}
                width="20"
                height="2.4"
                rx="1.2"
                fill={TEXT_COLOR}
              />
            ))}
          </svg>
        </span>
      </button>

      {/* The menu the cloud expands into */}
      <nav aria-label="Site navigation" aria-hidden={!open}>
        <ul
          style={{
            background: "var(--color-darkblue)",
            borderRadius: 14,
            padding: "8px 0",
            minWidth: 185,
            marginTop: 4,
            listStyle: "none",
            boxShadow: "0 6px 20px var(--color-shadow)",
            transformOrigin: "top right",
            transform: open ? "scale(1)" : "scale(0)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: animate
              ? "transform 0.25s ease, opacity 0.2s ease"
              : "none",
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <li
              key={section.landingPath}
              style={{ position: "relative" }}
              onMouseEnter={() => setOpenSection(section.landingPath)}
              onMouseLeave={() => setOpenSection(null)}
            >
              <Link
                to={section.landingPath}
                style={{
                  display: "block",
                  padding: "8px 18px",
                  color: "var(--color-orange)",
                  textDecoration: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {section.title}
                {section.subpages.length > 0 && (
                  <span aria-hidden="true"> ‹</span>
                )}
              </Link>

              {/* Subpages fly out to the left */}
              {section.subpages.length > 0 &&
                openSection === section.landingPath && (
                  <ul
                    style={{
                      position: "absolute",
                      right: "100%",
                      top: 0,
                      marginRight: 8,
                      background: "var(--color-offwhite)",
                      outline: "2px solid var(--color-brightblue-shadow)",
                      borderRadius: 10,
                      padding: "6px 0",
                      minWidth: 170,
                      listStyle: "none",
                      boxShadow: "0 6px 20px var(--color-shadow)",
                    }}
                  >
                    {section.subpages.map((sub) => (
                      <li key={sub.path}>
                        <Link
                          to={sub.path}
                          style={{
                            display: "block",
                            padding: "7px 16px",
                            color: "var(--color-orange)",
                            textDecoration: "none",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}

          {/* Back to top — reuses the helper shared with BackToTop.tsx */}
          <li
            style={{
              borderTop: "1px solid var(--color-brightblue-shadow)",
              marginTop: 6,
              paddingTop: 6,
            }}
          >
            <button
              type="button"
              onClick={() => {
                scrollToTop();
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "8px 18px",
                background: "transparent",
                border: "none",
                color: "var(--color-offwhite)",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              Back to top
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function CloudNavbar() {
  const [scrollY, setScrollY] = useState(0);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll(); // set the correct state on first render
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track viewport width so the full cloud row can be swapped for the single
  // collapsed cloud when there isn't room for it.
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT_PX}px)`);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Collapse when scrolled down, or whenever the screen is too narrow for the row.
  const collapsed = scrollY > COLLAPSE_AFTER_PX || narrow;
  // 0 at the top of the page, 1 once fully scrolled past the collapse point.
  // Drives the sky's fade, so it thins out gradually rather than snapping.
  const skyFade = narrow ? 1 : Math.min(scrollY / COLLAPSE_AFTER_PX, 1);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        // Expanded, tall enough for the full-width swoop (which keeps its
        // 1920:263 ratio, so its height tracks the viewport width). Collapsed,
        // it shrinks back to just the badge + cloud button.
        height: collapsed
          ? NAV_TOP_PADDING + CLOUD_H + 16
          : `calc(100vw * ${SWOOP_H} / ${SWOOP_W})`,
        transition: "height 0.45s ease",
        zIndex: 1030,
        pointerEvents: "none", // children re-enable it, so the page stays usable
      }}
    >
      {/* Dropdown entrance. Keeps the translateX(-50%) centring from the
          element's own transform, or the menu would jump sideways. */}
      <style>{`
        @keyframes cloudDropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* ── Alisha's curved swoop + logo, full width behind the clouds ─────
          Wrapped together so the logo can be positioned in % of the SWOOP
          rather than of the viewport: the swoop img sits in normal flow and
          gives the wrapper its height, so the logo's top/height percentages
          resolve against the artwork itself and stay put at any width. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          // The swoop's old 1920:263 box. The sky no longer provides it (it
          // is taken out of flow so SKY_HEIGHT can reach further down the
          // page), but the logo is still positioned in % of this box.
          height: `calc(100vw * ${SWOOP_H} / ${SWOOP_W})`,
          // Stays put at the top and thins out as you scroll, like sky
          // receding. No transition: skyFade already follows the scroll
          // position frame by frame, and easing on top of that feels laggy.
          opacity: 1 - skyFade,
          pointerEvents: "none",
          zIndex: 0, // behind the clouds
        }}
      >
        {/* Sky: darkest at the very top, fading to nothing further down.
              Taken out of flow so SKY_HEIGHT can reach past the header without
              moving the logo, which is positioned in % of the wrapper.
              Fades to rgba(...,0) rather than `transparent`, which some
              browsers interpolate through grey. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: SKY_HEIGHT,
            background:
              "linear-gradient(to bottom, rgb(54, 125, 172) 0%, rgba(58, 139, 193, 0.55) 45%, rgba(6, 120, 195, 0) 100%)",
          }}
        />
        <img
          src={LOGO_IMG}
          alt="Bye Bye Blade"
          style={{
            position: "absolute",
            left: `${LOGO_LEFT_PCT}%`,
            top: `${LOGO_TOP_PCT}%`,
            height: `${LOGO_HEIGHT_PCT}%`,
            width: "auto", // keeps the logo's own aspect ratio
          }}
        />
      </div>

      {/* Invisible clickable area over the logo (from Alisha's .navbar-logo-link) */}
      <Link
        to="/"
        aria-label="Home"
        style={{
          position: "absolute",
          top: 20,
          left: 45,
          width: 120,
          height: 155,
          zIndex: 2,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* ── Collapsed: just the logo, pinned in the corner ────────────────── */}
      <Link
        to="/"
        aria-label="Home"
        style={{
          position: "absolute",
          top: NAV_TOP_PADDING,
          left: 16, // stays in the left corner, where the full-size logo sits
          padding: BADGE_PAD,
          lineHeight: 0,
          opacity: collapsed ? 1 : 0,
          transform: collapsed ? "scale(1)" : "scale(0.6)",
          pointerEvents: collapsed ? "auto" : "none",
          transition: "opacity 0.35s ease 0.15s, transform 0.35s ease 0.15s",
          zIndex: 2,
        }}
      >
        <img
          src={LOGO_IMG}
          alt="Bye Bye Blade"
          style={{ display: "block", height: BADGE_LOGO_H, width: "auto" }}
        />
      </Link>

      {/* Expanded state: one cloud per page. Skipped entirely on narrow
          screens, where the row cannot fit and would overlap the page. */}
      {!narrow && (
        <nav
          aria-label="Main navigation"
          aria-hidden={collapsed}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 30,
            paddingTop: CLOUD_ROW_TOP,
            // Nudges the cloud group rightward; see CLOUD_SHIFT_RIGHT above.
            paddingLeft: CLOUD_SHIFT_RIGHT,
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          {NAV_SECTIONS.map((section, i) => (
            <CloudItem
              key={section.landingPath}
              section={section}
              index={i}
              collapsed={collapsed}
            />
          ))}
        </nav>
      )}

      {/* Collapsed state: a single cloud, top-right */}
      <div style={{ pointerEvents: collapsed ? "auto" : "none" }}>
        <CollapsedCloud visible={collapsed} />
      </div>
    </header>
  );
}
