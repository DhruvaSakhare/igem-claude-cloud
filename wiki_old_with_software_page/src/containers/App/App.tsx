import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { getPathMapping, stringToSlug } from "../../utils";
import { useEffect } from "react";
import { CloudNavbar } from "../../components/CloudNavbar";
import { Header } from "../../components/Header";
import { NotFound } from "../../components/NotFound";
import { Footer } from "../../components/Footer";
import { BeaverProgressBar } from "../../components/BeaverProgressBar";

const App = () => {
  const pathMapping = getPathMapping();
  const { pathname } = useLocation();
  const currentPath =
    location.pathname
      .split(`${stringToSlug(import.meta.env.VITE_TEAM_NAME)}`)
      .pop() || "/";

  // Reset scroll to the top on every route change — React Router keeps the
  // previous scroll offset, so without this a new page opens part-way down.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Set Page Title
  const title =
    currentPath in pathMapping ? pathMapping[currentPath].title : "Not Found";

  useEffect(() => {
    document.title = `${title || ""} | ${import.meta.env.VITE_TEAM_NAME} - iGEM ${import.meta.env.VITE_TEAM_YEAR}`;
  }, [title]);

  return (
    <>
      {/* Navigation — clouds at the top, collapsing to a single cloud on scroll */}
      <CloudNavbar />

      {/* Scroll progress bar — beaver eats the windmill blade as you scroll */}
      <BeaverProgressBar />

      {/* Header and PageContent */}
      <Routes>
        {Object.entries(pathMapping).map(
          ([
            path,
            {
              title,
              lead,
              fullWidth,
              hideHeader,
              fullHeightHeader,
              subpages,
              component: Component,
            },
          ]) => (
            <Route
              key={path}
              path={path}
              element={
                <>
                  {!hideHeader && (
                    <Header
                      title={title || ""}
                      lead={lead || ""}
                      noMargin={fullWidth}
                      fullHeight={fullHeightHeader}
                      subpages={subpages}
                    />
                  )}
                  {fullWidth ? (
                    <Component />
                  ) : (
                    <div className="page-container">
                      <Component />
                    </div>
                  )}
                </>
              }
            />
          ),
        )}
        <Route
          path="*"
          element={
            <>
              <Header
                title="Not Found"
                lead="The requested URL was not found on this server."
              />
              <NotFound />
            </>
          }
        />
      </Routes>

      {/* Footer */}
      {/* MUST mention license AND have a link to team wiki's repository on gitlab.igem.org */}
      <Footer />
    </>
  );
};

export default App;
