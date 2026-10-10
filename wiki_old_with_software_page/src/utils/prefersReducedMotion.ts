/**
 * Whether the visitor has asked their system for less motion.
 *
 * Lives here rather than in BackToTop.tsx — which also exports it, and still
 * does for the navbar — because BackToTop imports pages.ts to build its menu,
 * and pages.ts pulls in every content page. A content page reaching back into
 * BackToTop for this one helper closed that loop, and the circular import left
 * `Pages` uninitialised at runtime. This module imports nothing, so anything
 * may use it.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
