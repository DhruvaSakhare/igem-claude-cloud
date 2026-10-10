import { TextBox } from "../../components/TextBox";
import TOC from "../../components/TOC";
import { Inspirations, InspirationLink } from "../../components/Inspirations";

export function Results() {
  const links: InspirationLink[] = [
    { year: 2025, teamName: "Heidelberg", pageName: "results" },
    { year: 2025, teamName: "McGill", pageName: "results" },
    { year: 2025, teamName: "EPFL", pageName: "results" },
    { year: 2025, teamName: "Marburg", pageName: "results" },
    { year: 2025, teamName: "Munich", pageName: "results" },
    { year: 2025, teamName: "Freiburg", pageName: "results" },
  ];

  return (
    <>
      <TOC />

      <div className="page-start">
        <TextBox as="section" id="Results">
          <h1>Results</h1>

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

          <a href="https://igem.org">Test to see if links work. Link to iGEM</a>
        </TextBox>

        <TextBox as="section" id="Analysis-summary">
          <h1>Analysis-summary</h1>

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

          <a href="https://igem.org">Test to see if links work. Link to iGEM</a>
        </TextBox>

        <TextBox as="section" id="Future-insights">
          <h1>Future insights</h1>

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

          <a href="https://igem.org">Test to see if links work. Link to iGEM</a>
        </TextBox>

        <TextBox as="section" id="Impact-statement">
          <h1>Impact statement</h1>

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

          <a href="https://igem.org">Test to see if links work. Link to iGEM</a>
        </TextBox>
      </div>

      <div className="row mt-4">
        <div className="col-lg-8">
          <h2>What Should this Page Contain?</h2>
          <hr />
          <ul>
            <li>
              Clearly and objectively describe the results of your experiments
              and research.
            </li>
            <li>Use tables, graphs, and images to visualize your data.</li>
            <li>
              Discuss the implications of your findings in the context of your
              project goals.
            </li>
            <li>
              Highlight any trends, patterns, or significant observations.
            </li>
            <li>
              Include an analysis summary section to synthesize your findings
              and discuss their overall significance.
            </li>
            <li>
              Outline your future plans for the project, including potential
              applications, further research, and development.
            </li>
            <li>
              Explain what went wrong and what you learned from these
              experiences.
            </li>
            <li>Discuss potential improvements or alternative approaches.</li>
            <li>
              Emphasize the importance of scientific honesty and transparency.
            </li>
          </ul>
        </div>
        <Inspirations inspirationLinkList={links} />
      </div>
    </>
  );
}
