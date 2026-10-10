import "./TOC.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Heading {
  id: string;
  text: string;
}

/** One entry in an optional page level above the section list. */
export interface TocPage {
  key: string;
  label: string;
  to: string;
}

interface TocProps {
  /** Sibling pages to list above the sections (e.g. the four Model pages).
   *  Omit for the normal single-page TOC — the other pages using this component
   *  are unaffected. */
  pages?: TocPage[];
  /** Which of `pages` is the page currently being viewed. Its sections are the
   *  ones rendered; the others are plain links. */
  activeKey?: string;
}

/**
 * Viewport width from which the TOC floats in the left gutter instead of
 * sitting in the page flow. MUST match the two media queries in TOC.css and
 * the `.page-container:has(.toc)` rule in App.css, which narrows the content
 * column from this width up so the gutter can hold the TOC.
 *
 * 1350px is chosen so that 1366px laptops — the narrowest common laptop —
 * still get the sidebar. It used to be 1620px, which no laptop reaches: below
 * it the TOC dropped into the flow as a full-width block (918px tall on the
 * Methods page, more than a screen of links before the first heading).
 */
const FLOAT_MIN_WIDTH = 1350;

export default function TOC({ pages, activeKey }: TocProps = {}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");
  const tocRef = useRef<HTMLElement>(null);
  // Whether the TOC is currently the floating sidebar. Read from the same
  // breakpoint the stylesheet uses, so the markup and the layout agree.
  const [floating, setFloating] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(min-width: ${FLOAT_MIN_WIDTH}px)`).matches,
  );
  // Stacked mode only: the list starts collapsed behind the "Contents" header,
  // so a long TOC costs one line instead of a screenful. Ignored while floating.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${FLOAT_MIN_WIDTH}px)`);
    const onChange = (e: MediaQueryListEvent) => setFloating(e.matches);
    setFloating(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("section[id] h1"));

    // Sections come from their <h1>, and that is the ONLY level listed.
    //
    // There used to be a second level: a subsection opted in by carrying an id
    // plus `data-toc-title` on its wrapper, and was rendered nested under its
    // section. That was dropped — it made the contents list the page twice over
    // (the Methods and Discovery pages ran to three levels once the page-level
    // links above are counted) and buried the sections it was meant to help you
    // find. The `data-toc-title` attributes are left in place in the content
    // files — inert as far as this component is concerned, but still marking
    // and naming each subsection, so restoring the level later means changing
    // this file rather than re-annotating three pages.
    const data: Heading[] = elements.map((heading) => {
      const section = heading.closest("section");
      return {
        id: section?.id ?? "",
        text: heading.textContent ?? "",
      };
    });

    setHeadings(data);

    function updatePosition() {
      const pageStart = document.querySelector(
        ".page-start",
      ) as HTMLElement | null;
      const footer = document.querySelector("footer") as HTMLElement | null;
      const toc = tocRef.current;

      if (!pageStart || !footer || !toc) return;

      const contentTop = pageStart.offsetTop;

      const footerTop = footer.getBoundingClientRect().top + window.scrollY;

      const tocHeight = toc.offsetHeight;

      const scrollY = window.scrollY;

      const fixedTop = 200;

      if (scrollY < contentTop - fixedTop) {
        toc.style.position = "absolute";
        toc.style.top = `${contentTop}px`;
      } else if (scrollY + fixedTop + tocHeight < footerTop - 30) {
        toc.style.position = "fixed";
        toc.style.top = `${fixedTop}px`;
      } else {
        toc.style.position = "absolute";
        toc.style.top = `${footerTop - tocHeight - 30}px`;
      }

      // --------------------------
      // Highlight current section
      // --------------------------

      // Sections only. This used to include `[data-toc-title][id]` so the
      // highlight could land on a subsection, which mattered when subsections
      // were listed; now that only sections are, a subsection id could never be
      // matched against the rendered list and would leave nothing highlighted.
      const sections = Array.from(
        document.querySelectorAll("section[id]"),
      ) as HTMLElement[];

      let current = sections[0]?.id ?? "";

      for (const section of sections) {
        const rect = section.getBoundingClientRect();

        if (rect.top <= 140) {
          current = section.id;
        }
      }

      setActiveId(current);
    }

    updatePosition();

    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const jumpTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  /* One flat list of sections. The `.current` class is kept even though there
   * is no longer a nested list for it to reveal: TOC.css still uses it, and it
   * is what tells the two display modes which section the reader is in. */
  const sectionList = (
    <ul>
      {headings.map((heading) => {
        const inSection = activeId === heading.id;

        return (
          <li
            key={heading.id}
            className={`toc-section${inSection ? " current" : ""}`}
          >
            <button
              className={`toc-link ${inSection ? "active" : ""}`}
              onClick={() => jumpTo(heading.id)}
            >
              {heading.text}
            </button>
          </li>
        );
      })}
    </ul>
  );

  /* The whole list, page level included. Rendered unconditionally while the
   * TOC floats; in stacked mode it is behind the toggle below. */
  const body = (
    <>
      {pages ? (
        /* Page level: all sibling pages stay listed at every scroll position,
         * and only the page you are on expands to show its own sections. */
        <ul className="toc-pages">
          {pages.map((page) => {
            const current = page.key === activeKey;
            return (
              <li
                key={page.key}
                className={`toc-page${current ? " current" : ""}`}
              >
                {current ? (
                  <button
                    className="toc-page-link active"
                    aria-current="page"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    {page.label}
                  </button>
                ) : (
                  <Link className="toc-page-link" to={page.to}>
                    {page.label}
                  </Link>
                )}

                {current && headings.length > 0 && sectionList}
              </li>
            );
          })}
        </ul>
      ) : (
        sectionList
      )}
    </>
  );

  /* Floating: a plain heading over an always-visible list, as before.
   * Stacked: the heading becomes a toggle and the list starts collapsed, so
   * the TOC costs one line at the top of the page rather than a screenful of
   * links the reader has to scroll past to reach the first section. */
  return (
    <nav
      ref={tocRef}
      className={`toc${floating ? "" : " toc-stacked"}${open ? " open" : ""}`}
    >
      {floating ? (
        <h3>Contents</h3>
      ) : (
        <button
          type="button"
          className="toc-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Contents
          <span className="toc-caret" aria-hidden="true">
            ▾
          </span>
        </button>
      )}

      {(floating || open) && body}
    </nav>
  );
}
