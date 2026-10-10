import "./Header.css";
import { SubpageCards, type Subpage } from "./SubpageCards";

interface HeaderProps {
  title: string;
  lead: string;
  noMargin?: boolean;
  /** Fill the whole viewport, so the page opens on the title alone. */
  fullHeight?: boolean;
  /** Section overview pages: one illustrated card per subpage. */
  subpages?: Subpage[];
}

export function Header({
  title,
  lead,
  noMargin,
  fullHeight,
  subpages,
}: HeaderProps) {
  return (
    <header
      className={`page-header${noMargin ? "" : " mb-5"}${fullHeight ? " page-header-full" : ""}`}
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
            {subpages && subpages.length > 0 && (
              <SubpageCards
                pages={subpages}
                label={`${title} subpages`}
                className="header-subpage-cards"
                // One row sized to however many subpages the section has
                // (Wet Lab has five, Engagement three), rather than wrapping.
                style={
                  {
                    "--subpage-card-columns": subpages.length,
                    "--subpage-cards-max-width": `${subpages.length * 190}px`,
                  } as React.CSSProperties
                }
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
