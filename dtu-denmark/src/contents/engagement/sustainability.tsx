import "./sustainability.css";

/* ================= Data (edit here only) ================= */

// SDG icons hosted on the iGEM server. Upload them as sdg-1.png … sdg-17.png,
// then paste the folder URL here (copy it from an uploaded file's link).
const SDG_ICON_BASE = "https://static.igem.wiki/teams/6060/wiki/sustainability/sdg-icons";
const sdgIcon = (id: number) =>
  `${SDG_ICON_BASE}/e-web-goal-${String(id).padStart(2, "0")}.avif`;

type Group = "direct" | "indirect" | "negative";

// Static info per SDG (official colours)
const SDG_INFO: Record<number, { title: string; color: string }> = {
  2:  { title: "Zero Hunger",                            color: "#DDA63A" },
  3:  { title: "Good Health and Well-being",             color: "#4C9F38" },
  6:  { title: "Clean Water and Sanitation",             color: "#26BDE2" },
  7:  { title: "Affordable and Clean Energy",            color: "#FCC30B" },
  9:  { title: "Industry, Innovation and Infrastructure", color: "#FD6925" },
  12: { title: "Responsible Consumption and Production", color: "#BF8B2E" },
  13: { title: "Climate Action",                         color: "#3F7E44" },
  15: { title: "Life on Land",                           color: "#56C02B" },
  17: { title: "Partnerships for the Goals",             color: "#19486A" },
};

// One entry per target. The same SDG can appear in several groups.
export interface Target {
  sdg: number;
  code: string;
  title: string;
  group: Group;
  text?: string; // leave empty to show lorem ipsum
}

const TARGETS: Target[] = [
  // Direct
  { sdg: 12, code: "12.2", title: "Efficient use of natural resources",       group: "direct" },
  { sdg: 12, code: "12.4", title: "Sound management of chemicals and waste",  group: "direct" },
  { sdg: 12, code: "12.5", title: "Reduce waste generation",                  group: "direct" },
  { sdg: 12, code: "12.6", title: "Sustainable practices in companies",       group: "direct" },
  { sdg: 9,  code: "9.4",  title: "Clean, resource-efficient industry",       group: "direct" },
  { sdg: 9,  code: "9.5",  title: "Research and technological capability",    group: "direct" },
  // Indirect
  { sdg: 3,  code: "3.9",  title: "Fewer illnesses from pollution",           group: "indirect" },
  { sdg: 7,  code: "7.2",  title: "Share of renewable energy",                group: "indirect" },
  { sdg: 7,  code: "7.a",  title: "Cooperation on clean energy research",     group: "indirect" },
  { sdg: 13, code: "13.2", title: "Climate measures in policy",               group: "indirect" },
  { sdg: 13, code: "13.3", title: "Climate education and awareness",          group: "indirect" },
  { sdg: 15, code: "15.1", title: "Conservation of terrestrial ecosystems",   group: "indirect" },
  { sdg: 17, code: "17.17", title: "Public-private partnerships",             group: "indirect" },
  // Negative / trade-offs
  { sdg: 3,  code: "3.9",  title: "Hazardous byproducts",                     group: "negative" },
  { sdg: 6,  code: "6.3",  title: "Water quality and hazardous releases",     group: "negative" },
  { sdg: 6,  code: "6.4",  title: "Water-use efficiency",                     group: "negative" },
  { sdg: 2,  code: "2.x",  title: "Food and land competition",                group: "negative" },
  { sdg: 15, code: "15.1", title: "Land use from sugar feedstocks",           group: "negative" },
];

// Placeholder scores for the graph (0–100). Replace with LCA-mapped results.
export interface ImpactScore {
  sdg: number;
  strongPos: number; pos: number;  // drawn above the axis
  neg: number; strongNeg: number;  // drawn below the axis
}

const IMPACT_SCORES: ImpactScore[] = [
  { sdg: 2,  strongPos: 0,  pos: 5,  neg: 25, strongNeg: 10 },
  { sdg: 3,  strongPos: 10, pos: 30, neg: 20, strongNeg: 5  },
  { sdg: 6,  strongPos: 0,  pos: 5,  neg: 35, strongNeg: 25 },
  { sdg: 7,  strongPos: 15, pos: 35, neg: 5,  strongNeg: 0  },
  { sdg: 9,  strongPos: 30, pos: 45, neg: 5,  strongNeg: 0  },
  { sdg: 12, strongPos: 45, pos: 40, neg: 10, strongNeg: 0  },
  { sdg: 13, strongPos: 20, pos: 40, neg: 10, strongNeg: 5  },
  { sdg: 15, strongPos: 5,  pos: 25, neg: 30, strongNeg: 10 },
  { sdg: 17, strongPos: 0,  pos: 30, neg: 0,  strongNeg: 0  },
];

const GROUPS: { key: Group; title: string }[] = [
  { key: "direct",   title: "Direct impact" },
  { key: "indirect", title: "Indirect impact" },
  { key: "negative", title: "Negative impact and trade-offs" },
];

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor " +
  "incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud " +
  "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

/* ================= Reusable components ================= */

// Dashed frame with caption; pass an <img> as children, or leave empty.
export function FigurePlaceholder({ caption, height = 360, children }: {
  caption: string; height?: number; children?: React.ReactNode;
}) {
  return (
    <figure className="sus-figure">
      <div className="sus-figure__frame" style={{ minHeight: children ? undefined : height }}>
        {children ?? <span className="sus-figure__hint">Figure placeholder</span>}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

// Diverging stacked bar chart: alignment above the axis, misalignment below.
// Bar heights are % of the largest total, so any scale of input works.
export function ImpactChart({ data }: { data: ImpactScore[] }) {
  const max = Math.max(...data.flatMap((d) => [d.strongPos + d.pos, d.neg + d.strongNeg]), 1);
  const h = (v: number) => `${(v / max) * 100}%`;
  return (
    <div className="impact-chart" role="img" aria-label="Placeholder: positive and negative impact per SDG">
      <div className="impact-chart__cols">
        {data.map((d) => (
          <div className="impact-col" key={d.sdg}>
            <div className="impact-col__half is-up">
              <div className="bar bar--pos" style={{ height: h(d.pos) }} title={`Aligned: ${d.pos}`} />
              <div className="bar bar--strong-pos" style={{ height: h(d.strongPos) }} title={`Strongly aligned: ${d.strongPos}`} />
            </div>
            <SdgIcon id={d.sdg} className="sdg-icon--chart" />
            <div className="impact-col__half is-down">
              <div className="bar bar--neg" style={{ height: h(d.neg) }} title={`Misaligned: ${d.neg}`} />
              <div className="bar bar--strong-neg" style={{ height: h(d.strongNeg) }} title={`Strongly misaligned: ${d.strongNeg}`} />
            </div>
          </div>
        ))}
      </div>
      <ul className="impact-legend">
        <li><i className="bar--strong-pos" />Strongly aligned</li>
        <li><i className="bar--pos" />Aligned</li>
        <li><i className="bar--neg" />Misaligned</li>
        <li><i className="bar--strong-neg" />Strongly misaligned</li>
      </ul>
    </div>
  );
}

// Official SDG icon. Use className to size it per context.
export function SdgIcon({ id, className = "" }: { id: number; className?: string }) {
  return (
    <img
      className={`sdg-icon ${className}`}
      src={sdgIcon(id)}
      alt={`SDG ${id}: ${SDG_INFO[id].title}`}
      loading="lazy"
    />
  );
}

// One SDG block: heading + a paragraph per target.
export function SdgSection({ sdg, targets }: { sdg: number; targets: Target[] }) {
  const info = SDG_INFO[sdg];
  return (
    <section className="sdg-section" style={{ borderColor: info.color }}>
      <h4><SdgIcon id={sdg} />{info.title}</h4>
      {targets.map((t) => (
        <div className="sdg-target" key={`${t.group}-${t.code}`}>
          <h5>{t.code} {t.title}</h5>
          <p>{t.text ?? LOREM}</p>
        </div>
      ))}
    </section>
  );
}

// All SDGs of one group, in the order they first appear in TARGETS.
export function ImpactGroup({ title, targets }: { title: string; targets: Target[] }) {
  const sdgs = [...new Set(targets.map((t) => t.sdg))];
  return (
    <div className="sdg-group">
      <h3>{title}</h3>
      {sdgs.map((id) => (
        <SdgSection key={id} sdg={id} targets={targets.filter((t) => t.sdg === id)} />
      ))}
    </div>
  );
}

/* ================= Page ================= */

export function Sustainability() {
  return (
    <div className="sus-page">
      <header className="sus-intro">
        <h1>Sustainability</h1>
        <p>
          Our project is tackling what has a potential of becoming one of the biggest problems in recycling and green energy globally. Closing the loop of end-of-life treatment of wind turbine blade waste can contribute to Paris agreement, lowering the negative impact on the environment and human health. However, anthropic activities do not influence nature only in one way. The need of addressing both sides of the coin, the positive and the negative impact, is the only way we can identify the gaps, and focus the innovation in that direction.{" "}
          Our two way enzymatic treatment of thermoset resins present in decommissioned wind turbine blade waste can present a baseline for further development of a bioalternative to current degradation pathways that have a heavy negative impact on the environment and human health. In order to quantify the sustainability of this process, we performed a Life Cycle Assessment (LCA), and mapped the results to chosen SDGs. Apart from quantitative results, we target some of the goals qualitatively, through our human practices and educational work. All of the SDGs are divided in three impact categories - direct, indirect, negative.{" "}
          Read below how Bye Bye Blade activities maps to specific SDGs or jump to section:
        </p>
      </header>

      <section className="sus-block">
        <h2>Life cycle assessment</h2>
        <p>LCA analysis was performed in the SimaPro Faculty license provided by collaboration with DTU’s Department of Environmental and Resource Engineering. The following information and the flow-chart provides necessary background to understand how the processes were modeled.
        {""}
        Goal and Scope
        1kg of treated blade
        Cradle to gate - system boundary definition
        Thanks to input from daniel, we were able to adjust our system boundary so we can perform the analysis + feedback on perspective lca
        explain our three scenarios
        {""}
        Assumptions
        Lorry distances?
        Enzyme everything list
        Talk about prospective lca and 
        landfil/cement as our reference?
        {""}
        Limitations
        Mention chemicals, values, that were approximated, meaning either because of lack of data or ecoinvent proxies
        Same but for the ideal scenario
        Distance approximations
        Final product is still a question 
        </p>
        <FigurePlaceholder caption="Figure 1. Process flowchart (placeholder)." height={420} />
        <p>{LOREM}</p>
      </section>

      <section className="sus-block">
        <h2>Impact on the Sustainable Development Goals</h2>
        <p>We mapped the quantitative results of the LCA to chosen SDGs. The green represents the positive impact…
          {""}
        Categories contributing to each SDG can be found here:
        Mapping was based on the outputs of SimaPro, this code can be used to map any LCA output to chosen SDGs. Qualitative and indirect impacts are not visible. Find the code [here] and help us make it better!  
        </p>
        <FigurePlaceholder caption="Figure 2. Positive and negative impact per SDG (placeholder data).">
          <ImpactChart data={IMPACT_SCORES} />
        </FigurePlaceholder>
        {GROUPS.map((g) => (
          <ImpactGroup key={g.key} title={g.title} targets={TARGETS.filter((t) => t.group === g.key)} />
        ))}
      </section>
    </div>
  );
}