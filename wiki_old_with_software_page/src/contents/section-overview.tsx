import { Link, useLocation } from "react-router-dom";
import Pages from "../pages.ts";
import { stringToSlug } from "../utils";

// A reusable overview page shown when a user clicks a section title in the
// navbar (e.g. "Wet Lab"). It figures out which section it is from the current
// URL and renders a card linking to each of that section's subpages.
export function SectionOverview() {
  const location = useLocation();

  // Strip the team-name prefix the same way App.tsx does, to get "/wet-lab" etc.
  const currentPath =
    location.pathname
      .split(`${stringToSlug(import.meta.env.VITE_TEAM_NAME)}`)
      .pop() || "/";

  // Find the folder whose own path matches the current route.
  const folder = Pages.find(
    (item) => "folder" in item && item.path === currentPath,
  );

  const subpages =
    folder && "folder" in folder && folder.folder
      ? folder.folder.filter((sub) => sub.path)
      : [];

  return (
    <div className="row">
      {subpages.map((sub) => (
        <div className="col-md-6 col-lg-4 mb-4" key={sub.path}>
          <Link to={sub.path as string} className="text-decoration-none">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{sub.name}</h5>
                <p className="card-text text-muted">{sub.lead}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
