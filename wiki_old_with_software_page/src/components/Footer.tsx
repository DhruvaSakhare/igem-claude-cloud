import { stringToSlug } from "../utils";
import { DirtBand, DIRT_COLOR } from "./DirtBand";

/* Define our sponsors etc. and their logos */
/* `logo` is the image shown in the strip; `url` is where clicking goes.
   TODO: replace the "#" urls with each sponsor's real website. Entries with no
   `logo` fall back to showing their name as text. */
const SPONSORS = [
  {
    name: "Anthropic",
    url: "#",
    logo: "https://static.igem.wiki/teams/6060/wiki/attributions/anthropic.avif",
  },
  {
    name: "GenScript",
    url: "#",
    logo: "https://static.igem.wiki/teams/6060/wiki/attributions/genscript-primary.avif",
  },
  {
    name: "Integrated DNA Technologies",
    url: "#",
    logo: "https://static.igem.wiki/teams/6060/wiki/attributions/integrated-dna-technologies-logo.avif",
  },
  {
    name: "Twist Bioscience",
    url: "#",
    logo: "https://static.igem.wiki/teams/6060/wiki/attributions/twist-bioscience.avif",
  },
  { name: "Sponsor 5", url: "#", logo: "" },
  { name: "Sponsor 6", url: "#", logo: "" },
];

/* Define the links to our social media */
const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:your@email.com",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
];

/* Make the footer */
export function Footer() {
  const teamYear = import.meta.env.VITE_TEAM_YEAR;
  const teamName = import.meta.env.VITE_TEAM_NAME;
  const teamSlug = stringToSlug(teamName);

  // Duplicate sponsors so the scroll loops seamlessly
  const scrollItems = [...SPONSORS, ...SPONSORS, ...SPONSORS, ...SPONSORS];

  return (
    <>
      {/* Wavy dirt edge — the soil the windmill stands in */}
      <DirtBand />

      <footer
        className="pb-5 footer text-white"
        style={{
          backgroundColor: DIRT_COLOR,
          marginTop: 0,
          paddingTop: "1rem",
        }}
      >
        <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .sponsor-track {
          display: flex;
          width: max-content;
          animation: ticker 12s linear infinite;
        }
        .sponsor-track:hover {
          animation-play-state: paused;
        }
      `}</style>

        {/* Social icons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            margin: "0.2rem 0",
          }}
        >
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              target={s.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              style={{
                color: "rgba(255,255,255,0.55)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0a74e")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
              }
            >
              {s.icon}
            </a>
          ))}
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.15)" }} />

        {/* Sponsor scroll strip */}
        <div style={{ overflow: "hidden", marginBottom: "2rem" }}>
          <div className="sponsor-track">
            {scrollItems.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "160px",
                  height: "80px",
                  margin: "0 1.5rem",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
              >
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt={s.name}
                    style={{
                      maxWidth: "80%",
                      maxHeight: "70%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  s.name
                )}
              </a>
            ))}
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.15)" }} />

        {/* Required iGEM license notice — do not remove */}
        <div className="container">
          <div className="row mt-4">
            <div className="col">
              <p className="mb-0">
                <small>
                  © {teamYear} - Content on this site is licensed under a{" "}
                  <a
                    className="subfoot footer-link-blue"
                    href="https://creativecommons.org/licenses/by/4.0/"
                    rel="license"
                  >
                    Creative Commons Attribution 4.0 International license
                  </a>
                  .
                </small>
              </p>
              <p>
                <small>
                  The repository used to create this website is available at{" "}
                  <a
                    href={`https://gitlab.igem.org/${teamYear}/${teamSlug}`}
                    className="footer-link-blue"
                  >
                    gitlab.igem.org/{teamYear}/{teamSlug}
                  </a>
                </small>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
