import { Inspirations, InspirationLink } from "../../components/Inspirations";
import TOC from "../../components/TOC";

export function Measurement() {
  const links: InspirationLink[] = [
    { year: 2025, teamName: "Aalto-Helsinki", pageName: "measurement" },
    { year: 2025, teamName: "EPFL", pageName: "measurement" },
    { year: 2025, teamName: "BNDS-China", pageName: "measurement" },
    { year: 2025, teamName: "Groningen", pageName: "measurement" },
    { year: 2025, teamName: "McMaster-Canada", pageName: "measurement" },
    { year: 2025, teamName: "Stuttgart", pageName: "measurement" },
  ];

  return (
    <>
      <TOC />

      <div className="page-start">
        <section id="Assay 1" className="mt-4">
          <h1>Assay 1</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sodales
            nisl id dui suscipit iaculis. Aliquam non malesuada nisi. Vivamus
            consectetur eros non mauris mattis, non finibus sapien tincidunt. In
            lectus velit, imperdiet id viverra ut, blandit sed turpis. Sed
            venenatis, elit vel euismod faucibus, ligula lorem sagittis justo,
            in cursus orci mi ut nisi. Proin nec ultrices mauris, at imperdiet
            mauris. Pellentesque sed accumsan leo. Ut lobortis euismod euismod.
            Suspendisse dapibus tortor vel ex varius, vitae interdum est
            venenatis. Vestibulum et interdum turpis. Sed congue tellus ligula,
            non blandit arcu luctus in. Vivamus placerat commodo nunc, in
            sodales nisi egestas et. Fusce dui urna, pretium ac mi et, convallis
            molestie purus.
          </p>

          <div className="row">
            <div className="col-4">
              <img
                src="public\Pada_1_Surface.png"
                alt="Measurement1"
                className="img-fluid"
              />
            </div>

            <div className="col-4">
              <img
                src="public\Pada_1_Surface.png"
                alt="Measurement2"
                className="img-fluid"
              />
            </div>

            <div className="col-4">
              <img
                src="public\Pada_1_Surface.png"
                alt="Measurement3"
                className="img-fluid"
              />
            </div>
          </div>
        </section>

        <br />

        <section id="Assay 2" className="mt-4">
          <h1>Assay 2</h1>
          <div className="row">
            <div className="col-8">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                sodales nisl id dui suscipit iaculis. Aliquam non malesuada
                nisi. Vivamus consectetur eros non mauris mattis, non finibus
                sapien tincidunt. In lectus velit, imperdiet id viverra ut,
                blandit sed turpis. Sed venenatis, elit vel euismod faucibus,
                ligula lorem sagittis justo, in cursus orci mi ut nisi. Proin
                nec ultrices mauris, at imperdiet mauris. Pellentesque sed
                accumsan leo. Ut lobortis euismod euismod. Suspendisse dapibus
                tortor vel ex varius, vitae interdum est venenatis. Vestibulum
                et interdum turpis. Sed congue tellus ligula, non blandit arcu
                luctus in. Vivamus placerat commodo nunc, in sodales nisi
                egestas et. Fusce dui urna, pretium ac mi et, convallis molestie
                purus.
              </p>
            </div>

            <div className="col-4">
              <img
                src="public\Pada_1_Surface.png"
                alt="Measurement4"
                className="img-fluid"
              />
            </div>
          </div>
        </section>

        <br />

        <section id="Assay 3" className="mt-4">
          <h1>Assay 3</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sodales
            nisl id dui suscipit iaculis. Aliquam non malesuada nisi. Vivamus
            consectetur eros non mauris mattis, non finibus sapien tincidunt. In
            lectus velit, imperdiet id viverra ut, blandit sed turpis. Sed
            venenatis, elit vel euismod faucibus, ligula lorem sagittis justo,
            in cursus orci mi ut nisi. Proin nec ultrices mauris, at imperdiet
            mauris. Pellentesque sed accumsan leo. Ut lobortis euismod euismod.
            Suspendisse dapibus tortor vel ex varius, vitae interdum est
            venenatis. Vestibulum et interdum turpis. Sed congue tellus ligula,
            non blandit arcu luctus in. Vivamus placerat commodo nunc, in
            sodales nisi egestas et. Fusce dui urna, pretium ac mi et, convallis
            molestie purus.
          </p>

          <div>
            <img
              src="public\Pada_1_Surface.png"
              alt="Measurement5"
              className="img-fluid"
            />
          </div>
        </section>

        <div className="row mt-4">
          <div className="col">
            <div className="bd-callout bd-callout-info">
              <h4>Best Measurement</h4>
              <p>
                Measurements are how you show that a system, physical or
                computational, behaves as expected, that data are reliable, and
                that a result actually matters. Strong contenders pick
                meaningful targets to measure, capture them precisely through
                experimental or computational methods, and report results
                clearly with appropriate units or metrics.
              </p>
              <hr />
              <p>
                Visit the{" "}
                <a href="https://competition.igem.org/judging/awards/special">
                  Special Awards page
                </a>{" "}
                for more information.
              </p>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-lg-8">
            <h2>Overview</h2>
            <hr />
            <p>
              {" "}
              If you've done excellent work in measurement, you should consider
              nominating your team for this special award. Synthetic Biology
              needs great measurement approaches for characterizing parts, and
              efficient new methods for characterizing many parts at once. If
              you've done something exciting in the area of Measurement,
              describe it here!
            </p>
          </div>
          <Inspirations inspirationLinkList={links} />
        </div>
      </div>
    </>
  );
}
