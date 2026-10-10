import { Link } from "react-router-dom";

import { TextBox } from "../../components/TextBox";
import TOC from "../../components/TOC";
import { DetailsBox } from "../dry-lab/DetailsBox";
import { DescCite, DescriptionReferences, Todo } from "./DescriptionCite";
import {
  DESCRIPTION_REFERENCE_ORDER,
  type DescriptionCitationKey,
} from "./descriptionReferences";
import { FutureFlow } from "./FutureFlow";
import "./description.css";

/** Works cited only in the laccase / UPO boxes, which moved to the Engineering
 *  page. They stay in descriptionReferences.ts (the Engineering page cites them
 *  from there) but no longer belong in this page's list. */
const MOVED_TO_ENGINEERING: DescriptionCitationKey[] = [
  "Ali2019",
  "Shah2023",
  "Bizente",
];

/* ========================================================================== *
 *  Project Description
 *
 *  Text from the team's source document, docs/sources/Project Description.docx,
 *  kept as written apart from typographic fixes. The docx's "infobox"
 *  sections are the collapsible DetailsBox used on the Discovery page. Its
 *  "More about laccases" and "More about UPOs" boxes now live on the
 *  Engineering page (engineering-cycles.tsx), so the works only they cite are
 *  left out of this page's reference list (MOVED_TO_ENGINEERING below).
 *
 *  <Todo> markers flag problems still open in the source (a missing citation,
 *  a citation that does not appear to fit its sentence, a placeholder source).
 *  Resolve them in the docx, then here — do not paper over them with a guessed
 *  reference. See .claude/RESPONSIBLE_AI_USE.md.
 * ========================================================================== */
export function Description() {
  return (
    <>
      <TOC />

      <div className="page-start desc">
        <TextBox as="section" id="Abstract">
          <h1>Abstract</h1>

          <p>
            Wind power is central to Europe&apos;s green transition, and Denmark
            is at the forefront: wind supplied around 60% of Danish electricity
            in 2025 <DescCite ids={["Energistyrelsen2026"]} />. But wind turbine
            blades, made of glass fibre-reinforced polymer (GFRP), are among the
            hardest parts of a turbine to recycle, and most reach the end of
            their life with nowhere to go but landfill or incineration.
          </p>

          <p>
            <strong>ByeByeBlade</strong>, this year&apos;s DTU BioBuilders team,
            aimed to tackle this challenge at the molecular level. We searched
            for enzymes capable of breaking down the epoxy compounds that bind
            wind turbine blades together, and we engineered these enzymes to
            work even better. Our approach combined computational and
            experimental work, and by placing our enzymes downstream of a mild
            solvolysis step, we hope to develop a biological route towards a
            more sustainable way of recycling wind turbine blades.
          </p>
        </TextBox>

        <TextBox as="section" id="Legacy-of-wind">
          <h1>The legacy of wind</h1>

          <p>
            Wind turbines are a symbol of clean energy, but a problem hides
            inside their blades. The thermoset epoxy resin that makes a blade
            strong enough to last decades is built to resist weather, mechanical
            stress, and time, and that resistance is exactly what makes them so
            hard to break down.
          </p>

          <p>
            As wind turbines worldwide reach the end of their roughly 20-year
            service lives, blade waste is a growing concern. In Europe,
            decommissioned blade material is rising from about 20,000 tonnes a
            year today to a projected 55,000 tonnes a year by 2030, with Germany
            and Spain the first countries to feel it{" "}
            <DescCite ids={["SiemensGamesa", "WindEurope"]} />.
          </p>

          <div id="blade-materials" data-toc-title="What are blades made of?">
            <h2>What are blades made of?</h2>

            <p>
              A blade has to meet two competing requirements: it must be as
              light as possible while still resisting mechanical and
              environmental stress. Metals are too heavy and conventional
              plastics too brittle, so blades are built from
              glass-fibre-reinforced polymer (GFRP) or, in longer blades,
              carbon-fibre-reinforced polymer (CFRP): a lightweight foam or wood
              core, stiff glass or carbon fibres, and an epoxy thermoset resin
              that binds it all together. That resin is a dense
              three-dimensional network of aromatic compounds, and it is this
              part that resists recycling <DescCite ids={["Mishnaevsky2017"]} />
              .
            </p>

            <figure className="desc-fig">
              <img
                src="https://static.igem.wiki/teams/6060/wiki/description/1-s2-0-s1364032125002916-gr3.avif"
                alt="Cross-section of a wind turbine blade showing its interior architecture"
              />
              <figcaption>
                Blade interior architecture <DescCite ids={["Riley2025"]} />.
              </figcaption>
            </figure>

            <DetailsBox label="Why do thermosets not melt?">
              <p>
                Most plastics are made of linear polymer chains. Heat lets the
                chains slide past one another, and the material melts, which is
                what makes it easier to recycle{" "}
                <DescCite ids={["PlasticsEurope"]} />.
              </p>
              <p>
                The epoxy thermoset in wind turbine blades has to withstand
                greater stress. During manufacture, epoxy resin such as
                bisphenol A diglycidyl ether (BADGE) reacts with curing agents
                such as amine hardeners to form a three-dimensional covalent
                network that cannot melt, even at high temperatures. Recycling
                such a material means breaking those covalent bonds, which is
                energy-intensive, and most existing processes do not recover the
                raw material at all, but downcycle it into a lower-value use{" "}
                <DescCite ids={["Echer2026"]} />.
              </p>
            </DetailsBox>
          </div>

          <div
            id="blade-end-of-life"
            data-toc-title="Where do blades end up today?"
          >
            <h2>Where do blades end up today?</h2>

            <p>
              The cheapest way to dispose of a wind turbine blade is to landfill
              it. Besides being unsustainable, this practice is being restricted
              in several European countries, including the Netherlands and
              Germany. From 1 January 2026 the wind industry has committed to
              stop landfilling blades across Europe. That commitment is a
              voluntary industry pledge and not yet law, though WindEurope is
              lobbying to have it written into EU regulation{" "}
              {/* The source cites [5] here, which is Plastics Europe's page on
                  thermoplastics — it does not appear to support this sentence.
                  Kept as written, and flagged. */}
              <DescCite ids={["PlasticsEurope", "Wei2026"]} />{" "}
              <Todo>check reference</Todo>.
            </p>

            <p>
              The next options up are incineration and cement co-processing.
              Both require the blade crushed first, followed by being burned for
              energy or fed into cement production, where the mineral fraction
              substitutes for raw materials such as sand{" "}
              <DescCite ids={["Echer2026"]} />. A small fraction of blades is
              repurposed, as pedestrian bridges and bicycle shelters, but none
              of these routes recovers the raw material{" "}
              <DescCite ids={["Echer2026", "DiezCanamero2023"]} />.
            </p>

            <p>
              No large-scale process currently recovers the raw materials from a
              wind turbine blade. The most promising candidate is chemical
              solvolysis, which can recover both the glass fibre (comparable to
              virgin fibre) and resin chemicals. But it relies on solvents that
              can be aggressive and sometimes toxic to the environment{" "}
              <DescCite ids={["Morin2012"]} />.
            </p>

            <figure className="desc-fig">
              <img
                src="https://static.igem.wiki/teams/6060/wiki/description/screenshot-2026-10-05-at-10-00-18.avif"
                alt="Diagram of the end-of-life routes for wind turbine blades"
              />
              <figcaption>
                Life cycle management of wind turbine blades{" "}
                <DescCite ids={["DiezCanamero2023"]} />.
              </figcaption>
            </figure>
          </div>
        </TextBox>

        <TextBox as="section" id="Our-solution">
          <h1>Our solution</h1>

          <p>
            ByeByeBlade proposes enzymatic degradation as a downstream partner
            to solvolysis. Solvolysis breaks the solid network apart and
            releases fragments into solution. Our idea is a mild solvolysis step
            releasing soluble resin fragments into solution followed by enzymes
            that act with the aim of converting the mixture into defined
            compounds. Sharing the cleavage burden allows for the solvolysis to
            be performed at milder conditions{" "}
            <DescCite ids={["Wongwattanarat2025", "Dolz2022"]} />.
          </p>

          <p>
            The value in this approach is in the resin, not the glass. Recovered
            glass fibre has to compete with virgin glass fibre, which is cheap,
            roughly USD 0.75–3 per kg. The resin chemicals are different.
            Recycling approaches that can recover and treat the resin-rich
            fraction to organic monomers are adding value and represent an
            economic opportunity <DescCite ids={["Keith2025"]} />. Of course
            this all depends on a selective process that can turn the mixed
            organic products into defined product. This selectivity is what an
            enzyme provides and why a biological approach could be a solution.
          </p>

          <div
            id="tertiary-amine"
            data-toc-title="Our target: the tertiary amine bond"
          >
            <h2>Our target: the tertiary amine bond</h2>

            <p>
              The cured resin is made of the curing reaction between an epoxy
              monomer, such as BADGE, and a curing agent, which leads to the
              formation of strong crosslinked bonds{" "}
              <DescCite ids={["Wongwattanarat2025"]} />. Of these, we focus on
              the tertiary amine bonds, the carbon–nitrogen bonds left where a
              nitrogen has reacted with the epoxide rings.
            </p>

            <p>
              Measuring activity directly on blade material is not a sensible
              starting point. So we begin with
              N,N-bis(2-hydroxypropyl)-p-toluidine (NNBT), a soluble model of
              the tertiary-amine scaffold found in cured epoxy resin, and
              compatible with quantitative assays. Candidates that show activity
              on NNBT move on to more complex substrates, and eventually to
              solvolysis pre-treated fragments from neat resin.
            </p>

            <p>
              This is where the current field stops. The Bizente project
              screened engineered peroxygenases on NNBT as a soluble model of
              the resin cross-link <DescCite ids={["Dolz2022"]} />, and
              Wongwattanarat et al. combined chemical pre-treatment and
              enzymatic treatment on tetraglycidyl methylene dianiline (TGMDA),
              an epoxy resin used in glass fibre composites{" "}
              <DescCite ids={["Wongwattanarat2025", "Pesonen2015"]} />. No one
              has yet taken an engineered enzyme through to real glass-fibre
              blade material.
            </p>
          </div>

          <div
            id="laccases-and-upos"
            data-toc-title="Our enzymes: Laccases and UPOs"
          >
            <h2>Our enzymes: Laccases and UPOs</h2>

            <p>
              We worked with two enzyme families, laccases and unspecific
              peroxygenases (UPOs).
            </p>

            <p>Concretely, we:</p>
            <ol>
              <li>
                Established{" "}
                <Link to="/measurement">quantitative assays on NNBT</Link> as a
                model for the tertiary amine bond.
              </li>
              <li>
                Identified enzyme candidates with our{" "}
                <Link to="/model-discovery">
                  computational discovery pipelines
                </Link>
                .
              </li>
              <li>
                <Link to="/experiments">Expressed and tested</Link> these
                candidates in the wetlab, first on NNBT and then on more complex
                fragments, downstream of a solvolysis step.
              </li>
              <li>
                <Link to="/model-engineering">Engineered</Link> the
                best-performing candidates from the wetlab.
              </li>
            </ol>

            <p>
              The detailed process behind our design-build-test-learn (DBTL)
              cycles is shown on our <Link to="/engineering">Engineering</Link>{" "}
              page, and the resulting parts can be found on our{" "}
              <Link to="/parts">Parts</Link> page.
            </p>
          </div>
        </TextBox>

        <TextBox as="section" id="Beyond-the-lab">
          <h1>Beyond the lab</h1>

          <p>
            Blade waste is not only a science problem. It is also very much a
            stakeholder problem (who is responsible, who pays, who is
            interested, etc.). Our interactions with turbine manufacturers,
            recycling groups, and the public are described on our{" "}
            <Link to="/human-practices">Human Practices</Link> and{" "}
            <Link to="/education">Education</Link> pages.
          </p>

          <p>
            We are based at DTU Bioengineering, a department with a strong iGEM
            record and access to leading enzyme experts. We also draw on DTU
            Wind and DTU Construct specialists with practical experience in
            blade materials, giving us the combination of enzyme-engineering and
            blade-materials expertise this project needs.
          </p>
        </TextBox>

        <TextBox as="section" id="Future-prospects">
          <h1>Future prospects</h1>

          <FutureFlow />

          <p>
            Our project treats the laccases and the UPOs as separate. The
            question is whether the two can be run together as a single
            cocktail, acting on the solvolysis output in one pot. That would
            remove a separation step and make the process cheaper.
          </p>

          <p>
            Laccases would act on the larger fragments that solvolysis releases.
            They are oxidative enzymes that can work through mediators, small
            molecules that carry the oxidising power to places the enzyme itself
            cannot reach, and their role in our pipeline is to break those
            fragments down further.
          </p>

          <p>
            UPOs act second. Their active site sits at the end of a channel, so
            the substrate has to be small enough to enter, which the products of
            the laccase oxidation step should be. UPOs are known to carry out
            N-dealkylation, which is exactly the reaction needed at a tertiary
            amine, and they generally yield more defined reaction products than
            laccases <DescCite ids={["Monterrey2023"]} />.
          </p>

          <p>
            It is not straightforward, however. Laccases use molecular oxygen
            for their reaction, while UPOs need hydrogen peroxide. There is also
            the open question of whether the laccase mediators could interfere
            with the UPO. We have not tested any of this and it goes beyond what
            we can do in one season, but it is where we would take the project
            next.
          </p>
        </TextBox>

        <TextBox as="section" id="References">
          <h1>References</h1>
          <DescriptionReferences
            ids={DESCRIPTION_REFERENCE_ORDER.filter(
              (id) => !MOVED_TO_ENGINEERING.includes(id),
            )}
          />
        </TextBox>
      </div>
    </>
  );
}
