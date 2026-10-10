/* ========================================================================== *
 *  Bibliography for the Dry Lab pages
 *
 *  One entry per cited work, keyed by the citation key the team's source
 *  documents use (`@RamirezEscudero2018` → `RamirezEscudero2018`), so a
 *  citation in a draft can be carried onto the page without renaming anything.
 *
 *  TRANSCRIBED FROM THE TEAM'S OWN BIBTEX, field for field — authors, year,
 *  title, journal, volume/number/pages and DOI. Nothing here is looked up,
 *  inferred or completed from memory: an entry with a field the source did not
 *  give simply omits that field. Do NOT add a reference here that is not in a
 *  source document, and do not "fill in" a missing page range or number.
 *
 *  Rendered by Cite.tsx: `<Cite id="…" />` for the inline (author, year) and
 *  `referenceNodes([…])` for the list a page hands to `<ReferenceBar />`.
 * ========================================================================== */

export type Entry = {
  /** Inline form: "Barros-Reguera et al., 2025". Written out rather than
   *  derived, because the et-al cut and hyphenated surnames are not something
   *  to reconstruct from an author list with a rule. */
  short: string;
  /** Full author list, in the source's order and spelling. */
  authors: string;
  year: number;
  title: string;
  /** Omitted when the source gives none — see the preprint below. */
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  doi: string;
};

export const BIBLIOGRAPHY = {
  RamirezEscudero2018: {
    short: "Ramirez-Escudero et al., 2018",
    authors:
      "Ramirez-Escudero, M., Molina-Espeja, P., Gomez de Santos, P., Hofrichter, M., Sanz-Aparicio, J., & Alcalde, M.",
    year: 2018,
    title:
      "Structural Insights into the Substrate Promiscuity of a Laboratory-Evolved Peroxygenase",
    journal: "ACS Chemical Biology",
    volume: "13",
    number: "12",
    pages: "3259–3268",
    doi: "10.1021/acschembio.8b00500",
  },
  RamirezRamirez2020: {
    short: "Ramirez-Ramirez et al., 2020",
    authors:
      "Ramirez-Ramirez, J., Martin-Diaz, J., Pastor, N., Alcalde, M., & Ayala, M.",
    year: 2020,
    title:
      "Exploring the Role of Phenylalanine Residues in Modulating the Flexibility and Topography of the Active Site in the Peroxygenase Variant PaDa-I",
    journal: "International Journal of Molecular Sciences",
    volume: "21",
    number: "16",
    pages: "5734",
    doi: "10.3390/ijms21165734",
  },
  BarrosReguera2025: {
    short: "Barros-Reguera et al., 2025",
    authors:
      "Barros-Reguera, M., Lopez-Tavera, E., Schröder, G. C., Nardini, G., Kristoffersen, K. A., Ayuso-Fernández, I., Eijsink, V. G. H., & Sørlie, M.",
    year: 2025,
    title:
      "Structure–function relationships in unspecific peroxygenases revealed by a comparative study of their action on the phenolic lignin monomer 4-propylguaiacol",
    journal: "Biotechnology for Biofuels and Bioproducts",
    volume: "18",
    number: "1",
    doi: "10.1186/s13068-025-02675-w",
  },
  Dolz2022: {
    short: "Dolz et al., 2022",
    authors:
      "Dolz, M., Mateljak, I., Méndez-Sánchez, D., Sánchez-Moreno, I., Gomez de Santos, P., Viña-Gonzalez, J., & Alcalde, M.",
    year: 2022,
    title:
      "Colorimetric High-Throughput Screening Assay to Engineer Fungal Peroxygenases for the Degradation of Thermoset Composite Epoxy Resins",
    journal: "Frontiers in Catalysis",
    volume: "2",
    doi: "10.3389/fctls.2022.883263",
  },
  LeGuilloux2009: {
    short: "Le Guilloux et al., 2009",
    authors: "Le Guilloux, V., Schmidtke, P., & Tuffery, P.",
    year: 2009,
    title: "Fpocket: An open source platform for ligand pocket detection",
    journal: "BMC Bioinformatics",
    volume: "10",
    number: "1",
    pages: "168",
    doi: "10.1186/1471-2105-10-168",
  },
  Chovancova2012: {
    short: "Chovancova et al., 2012",
    authors:
      "Chovancova, E., Pavelka, A., Benes, P., Strnad, O., Brezovsky, J., Kozlikova, B., Gora, A., Sustr, V., Klvana, M., Medek, P., Biedermannova, L., Sochor, J., & Damborsky, J.",
    year: 2012,
    title:
      "CAVER 3.0: A Tool for the Analysis of Transport Pathways in Dynamic Protein Structures",
    journal: "PLoS Computational Biology",
    volume: "8",
    number: "10",
    pages: "e1002708",
    doi: "10.1371/journal.pcbi.1002708",
  },
  Knorrscheidt2021: {
    short: "Knorrscheidt et al., 2021",
    authors:
      "Knorrscheidt, A., Soler, J., Hünecke, N., Püllmann, P., Garcia-Borràs, M., & Weissenborn, M. J.",
    year: 2021,
    title:
      "Accessing Chemo- and Regioselective Benzylic and Aromatic Oxidations by Protein Engineering of an Unspecific Peroxygenase",
    journal: "ACS Catalysis",
    volume: "11",
    number: "12",
    pages: "7327–7338",
    doi: "10.1021/acscatal.1c00847",
  },
  Riniker2015: {
    short: "Riniker & Landrum, 2015",
    authors: "Riniker, S., & Landrum, G. A.",
    year: 2015,
    title:
      "Better Informed Distance Geometry: Using What We Know To Improve Conformation Generation",
    journal: "Journal of Chemical Information and Modeling",
    volume: "55",
    number: "12",
    pages: "2562–2574",
    doi: "10.1021/acs.jcim.5b00654",
  },
  Trott2009: {
    short: "Trott & Olson, 2009",
    authors: "Trott, O., & Olson, A. J.",
    year: 2009,
    title:
      "AutoDock Vina: Improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading",
    journal: "Journal of Computational Chemistry",
    volume: "31",
    number: "2",
    pages: "455–461",
    doi: "10.1002/jcc.21334",
  },
  Eberhardt2021: {
    short: "Eberhardt et al., 2021",
    authors: "Eberhardt, J., Santos-Martins, D., Tillack, A. F., & Forli, S.",
    year: 2021,
    title:
      "AutoDock Vina 1.2.0: New Docking Methods, Expanded Force Field, and Python Bindings",
    journal: "Journal of Chemical Information and Modeling",
    volume: "61",
    number: "8",
    pages: "3891–3898",
    doi: "10.1021/acs.jcim.1c00203",
  },
  Eastman2023: {
    short: "Eastman et al., 2023",
    authors:
      "Eastman, P., Galvelis, R., Peláez, R. P., Abreu, C. R. A., Farr, S. E., Gallicchio, E., Gorenko, A., Henry, M. M., Hu, F., Huang, J., Krämer, A., Michel, J., Mitchell, J. A., Pande, V. S., Rodrigues, J. P. G. L. M., Rodriguez-Guerra, J., Simmonett, A. C., Singh, S., Swails, J., Turner, P., Wang, Y., Zhang, I., Chodera, J. D., De Fabritiis, G., & Markland, T. E.",
    year: 2023,
    title:
      "OpenMM 8: Molecular Dynamics Simulation with Machine Learning Potentials",
    journal: "The Journal of Physical Chemistry B",
    volume: "128",
    number: "1",
    pages: "109–116",
    doi: "10.1021/acs.jpcb.3c06662",
  },
  Maier2015: {
    short: "Maier et al., 2015",
    authors:
      "Maier, J. A., Martinez, C., Kasavajhala, K., Wickstrom, L., Hauser, K. E., & Simmerling, C.",
    year: 2015,
    title:
      "ff14SB: Improving the Accuracy of Protein Side Chain and Backbone Parameters from ff99SB",
    journal: "Journal of Chemical Theory and Computation",
    volume: "11",
    number: "8",
    pages: "3696–3713",
    doi: "10.1021/acs.jctc.5b00255",
  },
  Jorgensen1983: {
    short: "Jorgensen et al., 1983",
    authors:
      "Jorgensen, W. L., Chandrasekhar, J., Madura, J. D., Impey, R. W., & Klein, M. L.",
    year: 1983,
    title:
      "Comparison of simple potential functions for simulating liquid water",
    journal: "The Journal of Chemical Physics",
    volume: "79",
    number: "2",
    pages: "926–935",
    doi: "10.1063/1.445869",
  },
  Boothroyd2023: {
    short: "Boothroyd et al., 2023",
    authors:
      "Boothroyd, S., Behara, P. K., Madin, O. C., Hahn, D. F., Jang, H., Gapsys, V., Wagner, J. R., Horton, J. T., Dotson, D. L., Thompson, M. W., Maat, J., Gokey, T., Wang, L.-P., Cole, D. J., Gilson, M. K., Chodera, J. D., Bayly, C. I., Shirts, M. R., & Mobley, D. L.",
    year: 2023,
    title:
      "Development and Benchmarking of Open Force Field 2.0.0: The Sage Small Molecule Force Field",
    journal: "Journal of Chemical Theory and Computation",
    volume: "19",
    number: "11",
    pages: "3251–3275",
    doi: "10.1021/acs.jctc.3c00039",
  },
  Jakalian2002: {
    short: "Jakalian et al., 2002",
    authors: "Jakalian, A., Jack, D. B., & Bayly, C. I.",
    year: 2002,
    title:
      "Fast, efficient generation of high-quality atomic charges. AM1-BCC model: II. Parameterization and validation",
    journal: "Journal of Computational Chemistry",
    volume: "23",
    number: "16",
    pages: "1623–1641",
    doi: "10.1002/jcc.10128",
  },
  Case2023: {
    short: "Case et al., 2023",
    authors:
      "Case, D. A., Aktulga, H. M., Belfon, K., Cerutti, D. S., Cisneros, G. A., Cruzeiro, V. W. D., Forouzesh, N., Giese, T. J., Götz, A. W., Gohlke, H., Izadi, S., Kasavajhala, K., Kaymak, M. C., King, E., Kurtzman, T., Lee, T.-S., Li, P., Liu, J., Luchko, T., Luo, R., Manathunga, M., Machado, M. R., Nguyen, H. M., O’Hearn, K. A., Onufriev, A. V., Pan, F., Pantano, S., Qi, R., Rahnamoun, A., Risheh, A., Schott-Verdugo, S., Shajan, A., Swails, J., Wang, J., Wei, H., Wu, X., Wu, Y., Zhang, S., Zhao, S., Zhu, Q., Cheatham, T. E., Roe, D. R., Roitberg, A., Simmerling, C., York, D. M., Nagan, M. C., & Merz, K. M.",
    year: 2023,
    title: "AmberTools",
    journal: "Journal of Chemical Information and Modeling",
    volume: "63",
    number: "20",
    pages: "6183–6191",
    doi: "10.1021/acs.jcim.3c01153",
  },
  Leimkuhler2012: {
    short: "Leimkuhler & Matthews, 2012",
    authors: "Leimkuhler, B., & Matthews, C.",
    year: 2012,
    title:
      "Rational Construction of Stochastic Numerical Methods for Molecular Sampling",
    journal: "Applied Mathematics Research eXpress",
    doi: "10.1093/amrx/abs010",
  },
  qvist2004: {
    short: "Åqvist et al., 2004",
    authors:
      "Åqvist, J., Wennerström, P., Nervall, M., Bjelic, S., & Brandsdal, B. O.",
    year: 2004,
    title:
      "Molecular dynamics simulations of water and biomolecules with a Monte Carlo constant pressure algorithm",
    journal: "Chemical Physics Letters",
    volume: "384",
    number: "4-6",
    pages: "288–294",
    doi: "10.1016/j.cplett.2003.12.039",
  },
  Hopkins2015: {
    short: "Hopkins et al., 2015",
    authors: "Hopkins, C. W., Le Grand, S., Walker, R. C., & Roitberg, A. E.",
    year: 2015,
    title:
      "Long-Time-Step Molecular Dynamics through Hydrogen Mass Repartitioning",
    journal: "Journal of Chemical Theory and Computation",
    volume: "11",
    number: "4",
    pages: "1864–1874",
    doi: "10.1021/ct5010406",
  },
  McGibbon2015: {
    short: "McGibbon et al., 2015",
    authors:
      "McGibbon, R. T., Beauchamp, K. A., Harrigan, M. P., Klein, C., Swails, J. M., Hernández, C. X., Schwantes, C. R., Wang, L.-P., Lane, T. J., & Pande, V. S.",
    year: 2015,
    title:
      "MDTraj: A Modern Open Library for the Analysis of Molecular Dynamics Trajectories",
    journal: "Biophysical Journal",
    volume: "109",
    number: "8",
    pages: "1528–1532",
    doi: "10.1016/j.bpj.2015.08.015",
  },
  /* The two laccase-discovery references are given in the team's source as
   * plain prose citations rather than BibTeX, so they carry only what that
   * prose states. Wongwattanarat 2025 is a preprint and names no journal —
   * the field is omitted rather than guessed from the DOI prefix. */
  Wongwattanarat2025: {
    short: "Wongwattanarat et al., 2025",
    /* The published version, from the team's Rational design document. This
     * entry used to hold the bioRxiv preprint (10.1101/2025.06.04.657587). */
    authors:
      "Wongwattanarat, S., Schorn, A., Klose, L., Carré, C., Malvis Romero, A., Liese, A., Pérez-García, P., & Streit, W. R.",
    year: 2025,
    title:
      "A combined chemo-enzymatic treatment for the oxidation of epoxy-based carbon fiber-reinforced polymers (CFRPs)",
    journal: "Frontiers in Bioengineering and Biotechnology",
    volume: "13",
    doi: "10.3389/fbioe.2025.1670548",
  },
  /* --- Cited by the laccase discovery method boxes on the Discovery page.
   *     Transcribed from the reference lists in the team's "CUPP Explained",
   *     "ESP" and "Enzyme_discovery_methods" documents. --- */
  Barrett2020: {
    short: "Barrett et al., 2020",
    authors: "Barrett, K., Hunt, C. J., Lange, L., & Meyer, A. S.",
    year: 2020,
    title:
      "Conserved unique peptide patterns (CUPP) online platform: peptide-based functional annotation of carbohydrate active enzymes",
    journal: "Nucleic Acids Research",
    volume: "48",
    number: "W1",
    pages: "W110–W115",
    doi: "10.1093/nar/gkaa375",
  },
  Rives2021: {
    short: "Rives et al., 2021",
    authors:
      "Rives, A., Meier, J., Sercu, T., Goyal, S., Lin, Z., Liu, J., Guo, D., Ott, M., Zitnick, C. L., Ma, J., & Fergus, R.",
    year: 2021,
    title:
      "Biological structure and function emerge from scaling unsupervised learning to 250 million protein sequences",
    journal: "Proceedings of the National Academy of Sciences",
    volume: "118",
    number: "15",
    pages: "e2016239118",
    doi: "10.1073/pnas.2016239118",
  },
  Aza2023: {
    short: "Aza & Camarero, 2023",
    authors: "Aza, P., & Camarero, S.",
    year: 2023,
    title:
      "Fungal Laccases: Fundamentals, Engineering and Classification Update",
    journal: "Biomolecules",
    volume: "13",
    pages: "1716",
    doi: "10.3390/biom13121716",
  },
  /* --- Cited by the Engineering page (contents/project/engineering-cycles.tsx).
   *     Transcribed from the reference lists in the team's Engineering
   *     document, with the DOIs the team confirmed. --- */
  Kataoka2007: {
    short: "Kataoka et al., 2007",
    authors:
      "Kataoka, K., Komori, H., Ueki, Y., Konno, Y., Kamitaka, Y., Kurose, S., Tsujimura, S., Higuchi, Y., Kano, K., Seo, D., & Sakurai, T.",
    year: 2007,
    title:
      "Structure and Function of the Engineered Multicopper Oxidase CueO from Escherichia coli — Deletion of the Methionine-Rich Helical Region Covering the Substrate-Binding Site",
    journal: "Journal of Molecular Biology",
    volume: "373",
    number: "1",
    pages: "141–152",
    doi: "10.1016/j.jmb.2007.07.041",
  },
  Kataoka2013: {
    short: "Kataoka et al., 2013",
    /* The team's document abbreviates this to "Kataoka K, et al."; the four
     * names are as Crossref returns them for the DOI below, which also agrees
     * with the document on title, volume, issue and pages. */
    authors: "Kataoka, K., Kogi, H., Tsujimura, S., & Sakurai, T.",
    year: 2013,
    title:
      "Modifications of laccase activities of copper efflux oxidase, CueO by synergistic mutations in the first and second coordination spheres of the type I copper center",
    journal: "Biochemical and Biophysical Research Communications",
    volume: "431",
    number: "3",
    pages: "393–397",
    doi: "10.1016/j.bbrc.2013.01.040",
  },
  MolinaEspeja2014: {
    short: "Molina-Espeja et al., 2014",
    authors:
      "Molina-Espeja, P., Garcia-Ruiz, E., Gonzalez-Perez, D., Ullrich, R., Hofrichter, M., & Alcalde, M.",
    year: 2014,
    title:
      "Directed Evolution of Unspecific Peroxygenase from Agrocybe aegerita",
    journal: "Applied and Environmental Microbiology",
    volume: "80",
    number: "11",
    pages: "3496–3507",
    doi: "10.1128/AEM.00490-14",
  },
  Kroll2023: {
    short: "Kroll et al., 2023",
    authors: "Kroll, A., Ranjan, S., Engqvist, M. K. M., & Lercher, M. J.",
    year: 2023,
    title:
      "A general model to predict small molecule substrates of enzymes based on machine and deep learning",
    journal: "Nature Communications",
    volume: "14",
    pages: "2787",
    doi: "10.1038/s41467-023-38347-2",
  },
  MolinaEspeja2021: {
    short: "Molina-Espeja et al., 2021",
    authors:
      "Molina-Espeja, P., Beltran-Nogal, A., Alfuzzi, M. A., Guallar, V., & Alcalde, M.",
    year: 2021,
    title:
      "Mapping Potential Determinants of Peroxidative Activity in an Evolved Fungal Peroxygenase from Agrocybe aegerita",
    journal: "Frontiers in Bioengineering and Biotechnology",
    volume: "9",
    pages: "741282",
    doi: "10.3389/fbioe.2021.741282",
  },
  /* --- Cited by the UPO CUPP discovery box on the Discovery page.
   *     Transcribed from the reference list in the team's
   *     "CUPP_Database_Discovery" document. Barrett2019 and Kroll2024 are
   *     different papers from Barrett2020 (the CUPP web platform) and
   *     Kroll2023 (ESP) above. --- */
  Sayers2024: {
    short: "Sayers et al., 2024",
    authors:
      "Sayers, E. W., Beck, J., Bolton, E. E., Brister, J. R., Chan, J., Connor, R., Feldgarden, M., Fine, A. M., Funk, K., Hoffman, J., Kannan, S., Kelly, C., Klimke, W., Kim, S., Lathrop, S., Marchler-Bauer, A., Murphy, T. D., O’Sullivan, C., Schmieder, E., Skripchenko, Y., Stine, A., Thibaud-Nissen, F., Wang, J., Ye, J., Zellers, E., Schneider, V. A., & Pruitt, K. D.",
    year: 2024,
    title:
      "Database resources of the National Center for Biotechnology Information in 2025",
    journal: "Nucleic Acids Research",
    volume: "53",
    number: "D1",
    pages: "D20–D29",
    doi: "10.1093/nar/gkae979",
  },
  Gabler2020: {
    short: "Gabler et al., 2020",
    authors:
      "Gabler, F., Nam, S.-Z., Till, S., Mirdita, M., Steinegger, M., Söding, J., Lupas, A. N., & Alva, V.",
    year: 2020,
    title: "Protein Sequence Analysis Using the MPI Bioinformatics Toolkit",
    journal: "Current Protocols in Bioinformatics",
    volume: "72",
    number: "1",
    doi: "10.1002/cpbi.108",
  },
  Zimmermann2018: {
    short: "Zimmermann et al., 2018",
    authors:
      "Zimmermann, L., Stephens, A., Nam, S.-Z., Rau, D., Kübler, J., Lozajic, M., Gabler, F., Söding, J., Lupas, A. N., & Alva, V.",
    year: 2018,
    title:
      "A Completely Reimplemented MPI Bioinformatics Toolkit with a New HHpred Server at its Core",
    journal: "Journal of Molecular Biology",
    volume: "430",
    number: "15",
    pages: "2237–2243",
    doi: "10.1016/j.jmb.2017.12.007",
  },
  Barrett2019: {
    short: "Barrett & Lange, 2019",
    authors: "Barrett, K., & Lange, L.",
    year: 2019,
    title:
      "Peptide-based functional annotation of carbohydrate-active enzymes by conserved unique peptide patterns (CUPP)",
    journal: "Biotechnology for Biofuels",
    volume: "12",
    number: "1",
    doi: "10.1186/s13068-019-1436-5",
  },
  Kroll2024: {
    short: "Kroll et al., 2024",
    authors: "Kroll, A., Ranjan, S., & Lercher, M. J.",
    year: 2024,
    title:
      "A multimodal Transformer Network for protein-small molecule interactions enhances predictions of kinase inhibition and enzyme-substrate relationships",
    journal: "PLOS Computational Biology",
    volume: "20",
    number: "5",
    pages: "e1012100",
    doi: "10.1371/journal.pcbi.1012100",
  },
  Passaro2025: {
    short: "Passaro et al., 2025",
    authors:
      "Passaro, S., Corso, G., Wohlwend, J., Reveiz, M., Thaler, S., Somnath, V. R., Getz, N., Portnoi, T., Roy, J., Stark, H., Kwabi-Addo, D., Beaini, D., Jaakkola, T., & Barzilay, R.",
    year: 2025,
    title: "Boltz-2: Towards Accurate and Efficient Binding Affinity Prediction",
    doi: "10.1101/2025.06.14.659707",
  },
  Wohlwend2024: {
    short: "Wohlwend et al., 2024",
    authors:
      "Wohlwend, J., Corso, G., Passaro, S., Getz, N., Reveiz, M., Leidal, K., Swiderski, W., Atkinson, L., Portnoi, T., Chinn, I., Silterra, J., Jaakkola, T., & Barzilay, R.",
    year: 2024,
    title: "Boltz-1 Democratizing Biomolecular Interaction Modeling",
    doi: "10.1101/2024.11.19.624167",
  },
  Mirdita2022: {
    short: "Mirdita et al., 2022",
    authors:
      "Mirdita, M., Schütze, K., Moriwaki, Y., Heo, L., Ovchinnikov, S., & Steinegger, M.",
    year: 2022,
    title: "ColabFold: making protein folding accessible to all",
    journal: "Nature Methods",
    volume: "19",
    number: "6",
    pages: "679–682",
    doi: "10.1038/s41592-022-01488-1",
  },
  /* --- Cited by the laccase rational-design section on the Engineering page.
   *     Transcribed from the reference list in the team's "Engineering
   *     section: Rational design" document. --- */
  Djoko2010: {
    short: "Djoko et al., 2010",
    authors: "Djoko, K. Y., Chong, L. X., Wedd, A. G., & Xiao, Z.",
    year: 2010,
    title:
      "Reaction Mechanisms of the Multicopper Oxidase CueO from Escherichia coli Support Its Functional Role as a Cuprous Oxidase",
    journal: "Journal of the American Chemical Society",
    volume: "132",
    number: "6",
    pages: "2005–2015",
    doi: "10.1021/ja9091903",
  },
  Grass2004: {
    short: "Grass et al., 2004",
    authors:
      "Grass, G., Thakali, K., Klebba, P. E., Thieme, D., Müller, A., Wildner, G. F., & Rensing, C.",
    year: 2004,
    title:
      "Linkage between Catecholate Siderophores and the Multicopper Oxidase CueO in Escherichia coli",
    journal: "Journal of Bacteriology",
    volume: "186",
    number: "17",
    pages: "5826–5833",
    doi: "10.1128/jb.186.17.5826-5833.2004",
  },
  Tiberti2022: {
    short: "Tiberti et al., 2022",
    authors:
      "Tiberti, M., Terkelsen, T., Degn, K., Beltrame, L., Cremers, T. C., da Piedade, I., Di Marco, M., Maiani, E., & Papaleo, E.",
    year: 2022,
    title:
      "MutateX: an automated pipeline for in silico saturation mutagenesis of protein structures and structural ensembles",
    journal: "Briefings in Bioinformatics",
    volume: "23",
    number: "3",
    doi: "10.1093/bib/bbac074",
  },
  /* --- Cited by the UPOs literature discovery introduction on the Discovery
   *     page. Transcribed from the team's "Introduction_Literature_Discovery"
   *     document. --- */
  Hofrichter2014: {
    short: "Hofrichter & Ullrich, 2014",
    authors: "Hofrichter, M., & Ullrich, R.",
    year: 2014,
    title: "Oxidations catalyzed by fungal peroxygenases",
    journal: "Current Opinion in Chemical Biology",
    volume: "19",
    pages: "116–125",
    doi: "10.1016/j.cbpa.2014.01.015",
  },
} as const satisfies Record<string, Entry>;

/** Every key the bibliography defines — what `<Cite>` and `referenceNodes`
 *  accept, so a typo in a citation key is a type error rather than a silently
 *  missing reference. */
export type CitationKey = keyof typeof BIBLIOGRAPHY;

/** Read one entry as an `Entry`.
 *
 *  Needed because `as const` above narrows every record to its own literal
 *  shape, so indexing BIBLIOGRAPHY directly gives a union in which the OPTIONAL
 *  fields (`number`, `pages`) exist only on the entries that happen to set
 *  them — reading `.pages` off the union is then a type error even though the
 *  field is declared optional. `as const` is what makes CitationKey the exact
 *  set of keys, so it stays; this widens back to the declared type at the point
 *  of use. */
export const entry = (id: CitationKey): Entry => BIBLIOGRAPHY[id];
