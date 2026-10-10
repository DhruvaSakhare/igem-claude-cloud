import TOC from "../../components/TOC";
import { MaldiViewer } from "../../components/MaldiViewer";

export function Measurement() {
  return (
    <>
      <TOC />

      <div className="page-start">
        <section id="Bradford" className="mt-4">
          <h1>Bradford Assay</h1>
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

        <section id="General Activity Assays" className="mt-4">
          <h1>General Activity Assays - NBD and ABTS</h1>
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

        <section id="Substrate Assay" className="mt-4">
          <h1>Substrate Assay - Colorometric Purpald on NNBT</h1>
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
        {/* ── MALDI-TOF ──────────────────────────────────────────────────────
            PLACEHOLDER SECTION. The viewer is wired to the real spectra
            (public/measurements/spectra, extracted from the raw Bruker folders
            by scripts/extract_maldi.py), but the surrounding text and the peak
            annotations are not written yet — see PEAKS in MaldiViewer.tsx. */}
        <section id="MALDI-TOF" className="mt-4">
          <h1>MALDI-TOF</h1>
          <p>
            PLACEHOLDER — describe the experiment here: what was measured, the
            matrix and instrument used, how the samples were prepared, and what
            the controls (water, heat-shocked) establish.
          </p>
          <MaldiViewer />
        </section>
      </div>
    </>
  );
}
