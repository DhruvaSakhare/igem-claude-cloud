import "./Navbar.css";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Pages from "../pages";
import navbarSvg from "https://static.igem.wiki/teams/6060/wiki/logos/bbb-logo-finished-22-08.avif";

function Dropdown({
  title,
  landingPath,
  subpages,
}: {
  title: string;
  landingPath: string;
  subpages: { name: string; path: string }[];
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 10); // stays open for 10 ms
  };

  return (
    <div
      className="dropdown"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link to={landingPath} className="navbar-link">
        {title}
      </Link>

      {open && (
        <div className="dropdown-menu">
          {subpages.map((page) => (
            <Link key={page.path} to={page.path} className="dropdown-link">
              {page.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      // Always show at the very top
      if (currentScrollY <= 10) {
        setShowNavbar(true);
      }
      // Scrolling down -> hide
      else if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      }
      // Scrolling up -> show
      else {
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    }

    function handleMouseMove(e: MouseEvent) {
      // Show when mouse is near the top
      if (e.clientY < 100) {
        setShowNavbar(true);
      }
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <header className={`navbar ${showNavbar ? "show" : "hide"}`}>
      <img src={navbarSvg} className="navbar-bg" alt="" />

      <Link to="/" className="navbar-logo-link" aria-label="Home" />

      <div className="navbar-content">
        <nav className="navbar-links">
          {Pages.map((page, index) => {
            if ("folder" in page && page.folder) {
              const subpages = page.folder
                .filter((sub) => sub.path)
                .map((sub) => ({
                  name: sub.name ?? "",
                  path: sub.path!,
                }));

              return (
                <Dropdown
                  key={index}
                  title={page.name ?? ""}
                  landingPath={page.path ?? subpages[0].path}
                  subpages={subpages}
                />
              );
            }

            return (
              <Link key={index} to={page.path ?? "/"} className="navbar-link">
                {page.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
