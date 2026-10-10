import PartsTable from "../../components/PartsTable";
import TOC from "../../components/TOC";

export function Parts() {
  const basicParts = [
    {
      id: "Hyperlink of ID to parts registry",
      name: "Name of part",
      description: "Description of part",
      type: "Type",
      sizeBp: 0,
      status: "Existing/New",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
  ];

  const compositeParts = [
    {
      id: "Hyperlink of ID to parts registry",
      name: "Name of part",
      description: "Description of part",
      type: "Type",
      sizeBp: 0,
      status: "Existing/New",
    },
    {
      id: "",
      name: "",
      description: "",
      type: "",
      sizeBp: 0,
      status: "",
    },
  ];

  return (
    <>
      <TOC />

      <div className="page-start">
        <section id="Our parts" className="mt-4">
          <h1>Our parts</h1>
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
        </section>

        <section id="Basic parts" className="mt-4">
          <h1>Basic parts</h1>
          <PartsTable data={basicParts} />
        </section>

        <section id="Composite parts" className="mt-4">
          <h1>Composite parts</h1>
          <PartsTable data={compositeParts} />
        </section>
      </div>
    </>
  );
}
