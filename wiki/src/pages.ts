import type { ArtBox } from "./components/SubpageCards";
import {
  Contribution,
  Description,
  Engineering,
  Experiments,
  Home,
  HumanPractices,
  Notebook,
  Results,
  SafetyAndSecurity,
  Members,
  Education,
  Measurement,
  Model,
  ModelMethods,
  ModelDiscovery,
  ModelEngineering,
  Software,
  Sustainability,
  SectionOverview,
  Parts,
} from "./contents";

interface Base {
  name: string | undefined;
}

class Folder implements Base {
  name: string | undefined;
  folder: Page[] | undefined;
  // Where the section title in the navbar goes, when that should NOT be the
  // folder's own overview page below. The Dry Lab folder sets it so the title
  // opens the Model page directly; its overview page stays routed but is no
  // longer linked from anywhere. Omit it and the title behaves as it always
  // has — `path` if there is one, otherwise the first subpage.
  navPath?: string;
  // Optional overview page shown when the section title is clicked in the
  // navbar, unless `navPath` above sends it somewhere else.
  path?: string;
  title?: string;
  component?: React.FC;
  lead?: string;
  fullWidth?: boolean;
  // Skip the shared dark-blue title/lead banner — set when the page component
  // renders its own hero section instead.
  hideHeader?: boolean;
  // Make the shared banner fill the whole viewport, so the page opens on its
  // title alone and everything else is below the fold.
  fullHeightHeader?: boolean;
}

class Page implements Base {
  name: string | undefined;
  title: string | undefined;
  path: string | undefined;
  component: React.FC | undefined;
  lead: string | undefined;
  fullWidth?: boolean;
  // Skip the shared dark-blue title/lead banner — set when the page component
  // renders its own hero section instead.
  hideHeader?: boolean;
  // Make the shared banner fill the whole viewport, so the page opens on its
  // title alone and everything else is below the fold.
  fullHeightHeader?: boolean;
  // Header illustration for this page's card on its section's overview page.
  // Omit and the card shows a placeholder. `box` is where the drawing sits on
  // its canvas; `aspect` is the canvas's own width / height, needed only when
  // the file is not 4:3 — see components/SubpageCards.tsx.
  illustration?: { img: string; box?: ArtBox; aspect?: number };
  // Shorter name for that card, when `name` carries a prefix meant for the
  // menu (e.g. "Model · Methods" → "Methods"). Defaults to `name`.
  cardTitle?: string;
  // Show the shared header's subpage cards on THIS page too, listing the other
  // pages in its section. Normally only a section's own overview route gets
  // them; set this on a subpage that acts as the section's landing page.
  showSectionCards?: boolean;
}

const Pages: (Page | Folder)[] = [
  {
    name: "Home",
    title: "Bye Bye Blade",
    path: "/",
    component: Home,
    lead: "By DTU BioBuilders 2026",
    fullHeightHeader: true,
  },
  {
    name: "Team",
    title: "Meet the DTU BioBuilders",
    path: "/team",
    component: Members,
    lead: "Breaking Blades, Not the Planet — The people powering a greener end-of-life",
    fullHeightHeader: true,
  },
  {
    name: "Project",
    path: "/project",
    title: "Project",
    component: SectionOverview,
    lead: "An overview of our project — explore the sections below.",
    fullHeightHeader: true,
    folder: [
      {
        name: "Description",
        title: "Project Description",
        path: "/description",
        component: Description,
        fullHeightHeader: true,
        lead: "Describe how and why you chose your iGEM project.",
      },
      {
        name: "Engineering",
        title: "Engineering Success",
        path: "/engineering",
        component: Engineering,
        fullHeightHeader: true,
        lead: "Demonstrate engineering success in a technical aspect of your project by going through at least one iteration of the engineering design cycle.",
      },
      {
        name: "Results",
        title: "Results",
        path: "/results",
        component: Results,
        fullHeightHeader: true,
        lead: "Present the results of your project, along with a detailed analysis and discussion of their significance. Also outline future plans and reflections on the impact of your project.",
      },
      {
        name: "Contribution",
        title: "Contribution",
        path: "/contribution",
        component: Contribution,
        fullHeightHeader: true,
        lead: "Make a useful contribution for future iGEM teams and document it on this page.",
      },
    ],
  },
  {
    name: "Wet Lab",
    path: "/wet-lab",
    title: "Wet Lab",
    component: SectionOverview,
    fullHeightHeader: true,
    lead: "Our experimental work in the lab — explore the sections below.",
    folder: [
      {
        name: "Experiments",
        title: "Experiments",
        path: "/experiments",
        component: Experiments,
        cardTitle: "Experiments",
        // illustration: {
        //   img: "https://static.igem.wiki/teams/6060/wiki/header-illustrations/wetlab-experiments-yeast.avif",
        //   aspect: 1505 / 1878,
        // },
        illustration: {
          img: "https://static.igem.wiki/teams/6060/wiki/header-illustrations/wetlab-experiments-flask.avif",
          aspect: 747 / 1138,
        },
        fullHeightHeader: true,
        lead: "Describe the research, experiments, and protocols you used in your project. It is designed to provide sufficient information for other teams to replicate our work.",
      },
      {
        name: "Notebook",
        title: "Notebook",
        path: "/notebook",
        component: Notebook,
        fullHeightHeader: true,
        lead: "This serves as a chronological record of your team's progress throughout the season. It documents your daily activities, experiments, discussions, and decisions.",
      },
      {
        name: "Measurement",
        title: "Measurement",
        path: "/measurement",
        cardTitle: "Measurements",
        illustration: {
          img: "https://static.igem.wiki/teams/6060/wiki/header-illustrations/wetlab-measurements-sds.avif",
          // Measured from the file: 973 × 647, drawing filling nearly all of it.
          box: [1, 1.5, 99, 98.5],
          aspect: 973 / 647,
        },
        component: Measurement,
        fullHeightHeader: true,
        lead: "Synthetic Biology needs great measurement approaches for characterizing parts, and efficient new methods for characterizing many parts at once. Describe your measurement approaches on this page.",
      },
      {
        name: "Parts",
        title: "Parts",
        path: "/parts",
        component: Parts,
        fullHeightHeader: true,
        lead: "Describe the biological parts you have designed, implemented, or characterized in your project.",
      },
      {
        name: "Safety and Security",
        title: "Safety and Security",
        path: "/safety-and-security",
        component: SafetyAndSecurity,
        fullHeightHeader: true,
        lead: "Detail the safety and security considerations of your project, adressing potential risks and outlining the measures taken to mitigate them.",
      },
    ],
  },
  {
    name: "Model",
    // The navbar title opens the Model page itself rather than the section
    // overview, which is why this section is called "Model" there. The overview
    // at /dry-lab still resolves, it is just not linked from anywhere for now.
    navPath: "/model",
    path: "/dry-lab",
    title: "Model",
    component: SectionOverview,
    fullHeightHeader: true,
    lead: "Our computational work — explore the sections below.",
    folder: [
      {
        // "Overview", not "Model": the section this sits in is itself called
        // "Model" in the navbar (see `name` above), so calling the page that
        // too put the same word at both levels of the menu, on two entries
        // that go to the same place. "Overview" is also what MODEL_PAGES in
        // contents/dry-lab/ModelNav.tsx calls this page in the table of
        // contents, so the two now agree. `title` stays "Model" — it is the
        // browser-tab title, where there is no section above it to repeat.
        name: "Overview",
        title: "Model",
        path: "/model",
        component: Model,
        fullHeightHeader: true,
        // Was the iGEM template text; this is the team's own intro, carried over
        // from the custom hero this page used to have.
        lead: "Breaking Blades, Not the Planet: computational discovery and engineering of laccases and UPOs, from the binding pocket to a designed variant.",
        // Uses the shared header (like Wet Lab, Engagement…) with a card for
        // each other page in this section, instead of its own custom hero.
        showSectionCards: true,
        fullWidth: true,
      },
      {
        name: "Model · Methods",
        title: "Model — Methods",
        path: "/model-methods",
        cardTitle: "Methods",
        illustration: {
          img: "https://static.igem.wiki/teams/6060/wiki/header-illustrations/model-methods.avif",
          box: [25.4, 24.0, 61.1, 68.0],
        },
        component: ModelMethods,
        fullHeightHeader: true,
        lead: "The computational methods behind the model: pocket detection, docking, molecular dynamics, sequence search and the enzyme-design pipeline.",
        hideHeader: true,
        fullWidth: true,
      },
      {
        name: "Model · Discovery",
        title: "Model — Discovery",
        path: "/model-discovery",
        cardTitle: "Discovery",
        illustration: {
          img: "https://static.igem.wiki/teams/6060/wiki/header-illustrations/model-discovery.avif",
          box: [26.1, 6.9, 86.6, 87.3],
        },
        component: ModelDiscovery,
        fullHeightHeader: true,
        lead: "Enzyme-discovery results: mapping the pocket, docking the substrate and the molecular-dynamics walk-through.",
        hideHeader: true,
        fullWidth: true,
      },
      {
        name: "Model · Engineering",
        title: "Model — Engineering",
        path: "/model-engineering",
        cardTitle: "Engineering",
        illustration: {
          img: "https://static.igem.wiki/teams/6060/wiki/header-illustrations/model-engineering2.avif",
          box: [9.5, 25.9, 83.4, 74.5],
          // Measured ignoring its solid white background — re-measure once it
          // is re-exported with transparency.
        },
        component: ModelEngineering,
        fullHeightHeader: true,
        lead: "Enzyme-engineering results: designed variants and how they were evaluated.",
        hideHeader: true,
        fullWidth: true,
      },
      {
        name: "Software",
        title: "Software",
        path: "/software",
        component: Software,
        fullHeightHeader: true,
        // Was the iGEM template blurb; this is what the tool actually does.
        lead: "channel-design — widening an enzyme's substrate access tunnel by putting the measurement inside the redesign loop.",
        fullWidth: true,
      },
    ],
  },
  {
    name: "Engagement",
    path: "/engagement",
    title: "Engagement",
    component: SectionOverview,
    fullHeightHeader: true,
    lead: "How we engage with the world — explore the sections below.",
    folder: [
      {
        name: "Human Practices",
        title: "Human Practices",
        path: "/human-practices",
        component: HumanPractices,
        fullHeightHeader: true,
        lead: "We ask every team to think deeply and creatively about whether their project is responsible and good for the world. Consider how the world affects your work and how your work affects the world.",
      },
      {
        name: "Education",
        title: "Education",
        path: "/education",
        component: Education,
        fullHeightHeader: true,
        lead: "Innovative educational tools and outreach activities have the ability to establish a two-way dialogue with new communities by discussing public values and the science behind synthetic biology.",
      },
      {
        name: "Sustainability",
        title: "Sustainability",
        path: "/sustainability",
        component: Sustainability,
        fullHeightHeader: true,
        lead: "Describe how you have evaluated your project ideas against one or more of the SDGs.",
      },
    ],
  },
];

export default Pages;
