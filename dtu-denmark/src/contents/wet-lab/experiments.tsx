import { useState } from "react";
import {
  ClickableTextBox,
  ClickableTextBoxToggle,
} from "../../components/ClickableTextBox";
import { Inspirations, InspirationLink } from "../../components/Inspirations";
import TOC from "../../components/TOC";

export function Experiments() {
  const [openAll, setOpenAll] = useState(false);

  const links: InspirationLink[] = [
    { year: 2025, teamName: "Heidelberg", pageName: "experiments" },
    { year: 2025, teamName: "McGill", pageName: "experiments" },
    { year: 2025, teamName: "EPFL", pageName: "experiments" },
  ];

  return (
    <>
      <TOC />

      <div className="page-start">
        <div className="d-flex justify-content-end mb-4">
          <ClickableTextBoxToggle
            open={openAll}
            onClick={() => setOpenAll(!openAll)}
          />
        </div>

        <h1>Enzyme 1 track</h1>

        <section id="Genetic design and assembly" className="mt-4">
          <h1 className="h2">Genetic design and assembly</h1>
          <ClickableTextBox title="Title of protocol here" openAll={openAll}>
            <p> Text here.</p>
          </ClickableTextBox>
        </section>

        <br />

        <section id="Plasmid propagation" className="mt-4">
          <h1 className="h2">Plasmid propagation</h1>
          <ClickableTextBox title="Title of protocol here" openAll={openAll}>
            <p> Text here.</p>
          </ClickableTextBox>
        </section>

        <br />
        <section id="Protein expression" className="mt-4">
          <h1 className="h2">Protein expression</h1>
          <ClickableTextBox title="Title of protocol here" openAll={openAll}>
            <p> Text here.</p>
          </ClickableTextBox>
        </section>

        <br />

        <section id="Protein purification" className="mt-4">
          <h1 className="h2">Protein purification</h1>
          <ClickableTextBox title="Title of protocol here" openAll={openAll}>
            <p> Text here.</p>
          </ClickableTextBox>
        </section>

        <br />
        <section id="Enzyme assays" className="mt-4">
          <h1 className="h2">Enzyme assays</h1>
          <ClickableTextBox title="Title of protocol here" openAll={openAll}>
            <p> Text here.</p>
          </ClickableTextBox>
        </section>

        <div className="row mt-4">
          <div className="col-lg-8">
            <h2>What Should this Page Contain?</h2>
            <hr />
            <p>
              Provide comprehensive, step-by-step protocols for all experiments
              conducted. Include a list of materials, reagents, and equipment
              used. Specify concentrations, volumes, incubation times,
              temperatures, and other critical parameters. Document any
              modifications or optimizations made to standard protocols.
            </p>
            <p>
              Explain the purpose of each experiment and its relevance to your
              project goals. Describe the experimental design, including
              controls and replicates. Provide a clear rationale for the chosen
              methods and approaches.
            </p>
            <p>
              Document any troubleshooting steps taken and optimizations made
              during the experimental process. Share any lessons learned that
              could benefit future teams.
            </p>
          </div>
          <Inspirations inspirationLinkList={links} />
        </div>
      </div>
    </>
  );
}
