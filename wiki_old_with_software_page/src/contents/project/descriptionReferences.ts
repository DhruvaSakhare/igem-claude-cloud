/* ========================================================================== *
 *  References for the Project Description page
 *
 *  TRANSCRIBED FROM THE TEAM'S SOURCE DOCUMENT (docs/sources/Project
 *  Description.docx), field for field. Nothing is looked up, inferred or
 *  completed from memory: when the docx gives no DOI, URL, title or year, the
 *  field is simply left out. Do NOT add a reference that is not in the source,
 *  and do not "fill in" a missing field — see .claude/RESPONSIBLE_AI_USE.md.
 *
 *  Page-local on purpose. The Dry Lab pages have their own bibliography
 *  (contents/dry-lab/bibliography.ts), but every entry there must carry a DOI,
 *  and several of the sources here are web pages. Keeping this list separate
 *  also means editing it cannot change any other page.
 *
 *  Keys follow the Dry Lab convention (first author + year, or organisation).
 *  The docx numbers its references [1]–[17]; the number each key had there is
 *  noted beside it so the text can be checked against the source. The docx
 *  labels both Echer et al. and Wei et al. as "6"; Wei et al. is the seventh
 *  item in the list, so it is treated as [7] here.
 *
 *  Rendered by DescriptionCite.tsx: `<DescCite ids={[…]} />` inline and
 *  `<DescriptionReferences ids={…} />` for the References section.
 * ========================================================================== */

export type DescriptionEntry = {
  /** Inline form, e.g. "Dolz et al., 2022" or "WindEurope". */
  short: string;
  authors?: string;
  year?: number;
  title?: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  /** Free-form container for anything that is not a journal article, e.g. a
   *  book chapter's book and publisher, written as the source gives it. */
  source?: string;
  doi?: string;
  url?: string;
  /** Visible TODO shown after the entry — for a problem the team flagged in
   *  the source, or one found while transcribing it. */
  todo?: string;
};

export const DESCRIPTION_REFERENCES = {
  // [1]
  SpaceDaily2025: {
    short: "SpaceDaily",
    title: "Denmark's electricity production from wind in 2025",
    source: "SpaceDaily",
    todo: "Replace with a primary source (e.g. Energinet or the Danish Energy Agency) and confirm the publication date",
  },
  // [2]
  SiemensGamesa: {
    short: "Siemens Gamesa",
    authors: "Siemens Gamesa",
    title: "RecyclableBlade",
    url: "https://www.siemensgamesa.com/global/en/home/explore/journal/recyclable-blade.html",
  },
  // [3]
  WindEurope: {
    short: "WindEurope",
    authors: "WindEurope",
    url: "https://windeurope.org/news/where-do-wind-turbine-blades-go-when-they-are-decommissioned/",
  },
  // [4]
  Mishnaevsky2017: {
    short: "Mishnaevsky et al., 2017",
    authors:
      "Mishnaevsky, L., Branner, K., Petersen, H. N., Beauson, J., McGugan, M., & Sørensen, B. F.",
    year: 2017,
    title: "Materials for wind turbine blades: An overview",
    journal: "Materials",
    volume: "10",
    number: "11",
    pages: "1285",
    doi: "10.3390/ma10111285",
  },
  // [5]
  PlasticsEurope: {
    short: "Plastics Europe",
    authors: "Plastics Europe",
    url: "https://plasticseurope.org/plastics-explained/a-large-family/thermoplastics/",
  },
  // [6]
  Echer2026: {
    short: "Echer et al., 2026",
    authors: "Echer, L., Iturrioz, I., & Lacidogna, G.",
    year: 2026,
    title:
      "End-of-life management of advanced composite materials: A review focused on wind turbine blade waste and cement co-processing",
    journal: "Developments in the Built Environment",
    volume: "26",
    pages: "100904",
    doi: "10.1016/j.dibe.2026.100904",
  },
  // [7] — labelled "6." in the docx; see the header note.
  Wei2026: {
    short: "Wei et al., 2026",
    authors: "Wei, W., Huang, S., Fan, X. et al.",
    year: 2026,
    title:
      "Recycling strategies for decommissioned wind turbine blades: advances, challenges, and prospects",
    journal: "Resources, Conservation and Recycling",
    volume: "229",
    pages: "108873",
  },
  // [8]
  DiezCanamero2023: {
    short: "Diez-Cañamero & Mendoza, 2023",
    authors: "Diez-Cañamero, B., & Mendoza, J. M. F.",
    year: 2023,
    title:
      "Circularity and greenhouse-gas performance across end-of-life routes for wind turbine blades",
    journal: "Waste Management",
    volume: "164",
    pages: "94",
  },
  // [9]
  Morin2012: {
    short: "Morin et al., 2012",
    authors: "Morin, C., Loppinet-Serani, A., Cansell, F., & Aymonier, C.",
    year: 2012,
    title:
      "Near- and supercritical solvolysis of carbon fibre reinforced polymers (CFRPs) for recycling carbon fibers as a valuable resource: State of the art",
    journal: "The Journal of Supercritical Fluids",
    volume: "66",
    pages: "232–240",
    doi: "10.1016/j.supflu.2012.02.001",
  },
  // [10] — listed in the docx but not cited anywhere in its text.
  Branfoot2023: {
    short: "Branfoot et al., 2023",
    authors: "Branfoot, C., Folkvord, H., Keith, M., & Leeke, G. A.",
    year: 2023,
    title:
      "Recovery of chemical recyclates from fibre-reinforced composites: A review of progress",
    journal: "Polymer Degradation and Stability",
    volume: "215",
    pages: "110447",
    doi: "10.1016/j.polymdegradstab.2023.110447",
  },
  // [11]
  Wongwattanarat2025: {
    short: "Wongwattanarat et al., 2025",
    authors:
      "Wongwattanarat, S., Schorn, A., Klose, L., Carré, C., Malvis Romero, A., Liese, A., Pérez-García, P., & Streit, W. R.",
    year: 2025,
    title:
      "A combined chemo-enzymatic treatment for the oxidation of epoxy-based carbon fiber-reinforced polymers (CFRPs)",
    journal: "Frontiers in Bioengineering and Biotechnology",
    volume: "13",
    doi: "10.3389/fbioe.2025.1670548",
    todo: "The Model pages cite the bioRxiv preprint of this work (doi:10.1101/2025.06.04.657587); agree on one version",
  },
  // [12]
  Dolz2022: {
    short: "Dolz et al., 2022",
    authors:
      "Dolz, M., Mateljak, I., Méndez-Sánchez, D., Sánchez-Moreno, I., Gomez de Santos, P., Viña-Gonzalez, J., & Alcalde, M.",
    year: 2022,
    title:
      "Colorimetric high-throughput screening assay to engineer fungal peroxygenases for the degradation of thermoset composite epoxy resins",
    journal: "Frontiers in Catalysis",
    volume: "2",
    doi: "10.3389/fctls.2022.883263",
  },
  // [13]
  Keith2025: {
    short: "Keith et al., 2025",
    authors: "Keith, M. J., Al-Duri, B., McDonald, T. O., & Leeke, G. A.",
    year: 2025,
    title:
      "Solvent-Based Recycling as a Waste Management Strategy for Fibre-Reinforced Polymers: Current State of the Art",
    journal: "Polymers (Basel)",
    volume: "17",
    number: "7",
    pages: "843",
    doi: "10.3390/polym17070843",
  },
  // [14]
  Ali2019: {
    short: "Ali et al., 2019",
    authors:
      "Ali, J., Sharma, D. C., Bano, A., Gupta, A., Sharma, S., Bajpai, P., & Pathak, N.",
    year: 2019,
    title: "Exploiting microbial enzymes for augmenting crop production",
    source: "In Enzymes in Food Biotechnology (pp. 503–519). Elsevier",
    doi: "10.1016/B978-0-12-813280-7.00029-3",
  },
  // [15]
  Shah2023: {
    short: "Shah et al., 2023",
    authors:
      "Shah, S. W. A., Xu, Q., Ullah, M. W., Zahoor, Sethupathy, S., Morales, G. M., Sun, J., & Zhu, D.",
    year: 2023,
    title:
      "Lignin-based additive materials: A review of current status, challenges, and future perspectives",
    journal: "Additive Manufacturing",
    volume: "74",
    pages: "103711",
    doi: "10.1016/j.addma.2023.103711",
  },
  // [16]
  Monterrey2023: {
    short: "Monterrey et al., 2023",
    authors:
      "Monterrey, D. T., Menés-Rubio, A., Keser, M., Gonzalez-Perez, D., & Alcalde, M.",
    year: 2023,
    title:
      "Unspecific peroxygenases: The pot of gold at the end of the oxyfunctionalization rainbow?",
    journal: "Current Opinion in Green and Sustainable Chemistry",
    volume: "41",
    pages: "100786",
    doi: "10.1016/j.cogsc.2023.100786",
  },
  // [17]
  Bizente: {
    short: "Bizente project",
    authors: "Bizente project",
    url: "https://bizente.eu/",
  },
} satisfies Record<string, DescriptionEntry>;

export type DescriptionCitationKey = keyof typeof DESCRIPTION_REFERENCES;

/** Display order of the References list: the docx's own order. */
export const DESCRIPTION_REFERENCE_ORDER = Object.keys(
  DESCRIPTION_REFERENCES,
) as DescriptionCitationKey[];

export function descriptionEntry(id: DescriptionCitationKey): DescriptionEntry {
  return DESCRIPTION_REFERENCES[id];
}
