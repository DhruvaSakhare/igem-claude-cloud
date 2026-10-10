import "./Header.css";
import { Link } from "react-router-dom";
import type { Subpage } from "./SubpageCards";
import { iconStyle } from "./PageHero";

interface HeaderProps {
  title: string;
  lead: string;
  noMargin?: boolean;
  /** Fill the whole viewport, so the page opens on the title alone. */
  fullHeight?: boolean;
  /**
   * Section overview pages (Project, Wet Lab, Engagement…): the subpages of
   * that section, built from pages.ts by getPathMapping(). Each is shown as
   * its illustration linking to the page, with the page title underneath.
   */
  subpages?: Subpage[];
}

export function Header({
  title,
  lead,
  noMargin,
  fullHeight,
  subpages,
}: HeaderProps) {
  const links = subpages ?? [];
  const isOverview = links.length > 0;

  const classes = ["page-header"];
  if (!noMargin) classes.push("mb-5");
  if (fullHeight) classes.push("page-header-full");
  if (isOverview) classes.push("page-header-overview");

  return (
    <header
      className={classes.join(" ")}
      style={
        noMargin
          ? {
              marginBottom: 0,
              paddingBottom: 0,
              overflow: "hidden",
              borderBottom: "none",
              boxShadow: "none",
            }
          : undefined
      }
    >
      <div className="container h-100">
        <div className="row h-100 align-items-center">
          <div className="col-lg-12">
            <h1 className="page-header-title-orange display-4 mt-5 mb-2">
              {title}
            </h1>
            <p
              className={`page-header-lead lead${noMargin ? " mb-3" : " mb-5"}`}
            >
              {lead}
            </p>

            {isOverview && (
              <nav className="overview-links" aria-label={`${title} pages`}>
                {links.map((page) => (
                  <Link key={page.to} to={page.to} className="overview-link">
                    <span className="overview-link-image">
                      {page.img ? (
                        // Cropped to the drawing using `box` in pages.ts, the
                        // same way as the icon in each page's own hero.
                        <img
                          src={page.img}
                          alt=""
                          loading="lazy"
                          style={iconStyle(
                            page.box ?? [0, 0, 100, 100],
                            page.aspect,
                          )}
                        />
                      ) : (
                        // No illustration in pages.ts yet.
                        <span className="overview-link-placeholder" />
                      )}
                    </span>
                    <span className="overview-link-title">{page.title}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
