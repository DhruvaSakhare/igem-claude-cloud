import { useEffect, useRef, useState, type ReactNode } from "react";
import TOC from "../../components/TOC";
import {
  ClickableTextBox,
  ClickableTextBoxToggle,
} from "../../components/ClickableTextBox";
import "./education.css";
import { Link } from "react-router-dom";

/* ========================================================================== *
 *  Education page  (Engagement → Education, route /education)
 *
 *  Styled to match the Model pages (.edu-* mirrors the model card aesthetic —
 *  dark-blue headings, orange accent, light-blue page background). Layout:
 *     • #overview        → award card + our approach
 *     • #events          → "Educational events" heading, then one section per
 *                          event. Each event has a title, a couple of intro
 *                          lines, and any number of subheadings; each
 *                          subheading is text on one side + a photo carousel on
 *                          the other (sides alternate).
 *
 *  TOC: the shared <TOC/> lists every `section[id] h1`, indented by how deeply
 *  the section is nested. So each event is a <section id> (its <h1> = title)
 *  and each subheading is a nested <section id> (its <h1> = subheading) — the
 *  title shows in the TOC with its subheadings nested under it. Cards jump to a
 *  section id.
 *
 *  To add an event, append to EDU_EVENTS; to add a subheading, append to that
 *  event's `sections`. Each `body` is an array of paragraphs (one <p> each).
 *  Fill `images` with real photo paths; an empty `src` shows a labelled
 *  placeholder box. Styling lives in education.css (.edu-*).
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  Data — add / edit entries here                                             */
/* -------------------------------------------------------------------------- */
type EduImage = {
  src: string; // photo path, e.g. "/education/workshop-1.jpg" ("" → placeholder)
  alt: string; // description of the photo (also the placeholder label)
};

type PdfLink = {
  href: string; // URL to the PDF
  /*label: string; // human-readable name */
};

type BodyBlock = string | { heading: string } | { pdf: PdfLink };

type EduSubsection = {
  id: string; // anchor id — TOC entry + scroll target (must be unique)
  subheading: string;
  body: BodyBlock[]; // paragraphs, inline headings and inline PDFs
  images: EduImage[];
  pdfs?: PdfLink[]; // PDFs shown after the text
};

type EduEvent = {
  id: string; // anchor id — the event's TOC entry (must be unique)
  title: string;
  summary: string; // short blurb (not shown at the moment)
  intro: string; // a couple of lines under the title, before the subheadings
  sections: EduSubsection[];
};

// utils/static.ts
const STATIC = "https://static.igem.wiki/teams/6060/wiki/";
const staticFile = (path: string) => `${STATIC}${path}`;

function pdfFriendlyName(href: string) {
  const file = href.split("/").pop() ?? "PDF";
  return decodeURIComponent(file.replace(/\.[^/.]+$/, ""));
}

const EDU_EVENTS: EduEvent[] = [
  {
    id: "event-1",
    title: "Connecting with the community",
    summary:
      "See all of our events done for and with other iGEM teams from Europe",
    intro:
      "A couple of intro lines about this event, shown full width under the title — what it was overall and why the team ran it. The subheadings below break it into parts.",
    sections: [
      {
        id: "event-1-a",
        subheading: "Biobrick workshop",
        body: [
          "From April 17th to 19th, 2026, DTU Biobuilders hosted the 12th edition of the BioBrick Workshop at the Technical University of Denmark's campus in Kongens Lyngby. The workshop has become a fixture of the Nordic iGEM calendar, bringing together student teams from across Europe for a weekend dedicated to hands-on molecular biology training, project exchange and community building ahead of the iGEM competition season.","This year's edition welcomed 53 participants representing teams from 7 different universities: the University of Southern Denmark, the University of Copenhagen, Aarhus University, Lund University, KTH Royal Institute of Technology, the University of Oslo and Universität Hamburg, alongside the host team, DTU Biobuilders. Over three days, participants took part in expert-led lectures on the practical and strategic realities of running an iGEM project, an intensive wetlab exercise covering a core synthetic biology technique, informative drylab workshop and opportunities to present and discuss each team's ongoing work.","As in previous years, the workshop was organized entirely by DTU Biobuilders and offered at low cost to participants, with the team providing meals, drinks and on-campus accommodation throughout the weekend to keep the event accessible to teams travelling from across the region.",
          "This year's workshop followed the format that has defined the event for over a decade, while continuing to adapt its content to reflect where participating teams are in their project timelines each spring. The weekend was organized around three days, each with its own character and purpose, moving participants from arrival and orientation, through the technical core of the event, to a closing day of reflection and discussion.",
          { heading: "Schedule overview" }, "Friday afternoon was dedicated to arrival and settling in. Participants checked in from mid-afternoon, were welcomed with an introductory session, and spent the evening getting to know the other teams through a dedicated Meet the Teams session, a campus tour, and dinner together. This first evening set the tone for the rest of the weekend: informal, collaborative, and focused as much on the people behind each project as on the science itself.","Saturday was the most intensive day of the program, combining the full hands-on wetlab exercise with sessions on documentation practices and closing with a lecture on human practices and wiki development. It was the day where most of the weekend's technical work took place, with participants moving between the lab bench, computer desk and lecture room.","Sunday brought the weekend to a close with a review of the previous day's lab results, two further lectures, and an open discussion and Q&A panel session before teams departed after lunch. This final day gave participants the chance to consolidate what they had learned, ask remaining questions and interpret the outcome of their own experimental work together as a group.","Alongside the scheduled program, the weekend gave every participating team the chance to present their 2026 project to the wider group, exchange feedback and begin building the informal connections between teams that tend to carry through to the competition itself later in the year.",
          { heading: "Wetlab Workshop" },
          { pdf: { href: staticFile("education/pdf/wetlab-protocol-biobrick.pdf")} },
          "The technical centerpiece of the weekend was a hands-on wetlab exercise introducing participants to USER cloning, a PCR-based DNA assembly method widely used across synthetic biology for precise, directional assembly of genetic parts. Working in teams, participants assembled a functional plasmid from three standard BioBrick parts sourced from the iGEM Registry, with success visible directly in the form of pigmented bacterial colonies. Over the course of the day, the exercise was run in multiple rounds, with the goal of expressing the tsPurple part (BBa_K1033906) under the constitutive promoter BBa_J23101, assembled into the pSB1C30 backbone (BBa_J04450).","The exercise unfolded across three stages, carried out over the course of Saturday and reviewed on Sunday morning. Teams first ran a USER PCR, amplifying their three DNA fragments with primers designed to leave uracil-containing overhangs that would allow each fragment to align precisely with its neighbor. In the USER reaction that followed, a USER enzyme mix processed those overhangs into single-stranded sticky ends, allowing the fragments to anneal in the correct order - a step run alongside a negative control to confirm the reaction's specificity. Finally, in the transformation and plating stage, the assembled plasmid was introduced into competent E. coli via heat shock and plated together with positive and negative controls to verify that both the transformation procedure and the cells themselves were behaving as expected.","The exercise concluded on Sunday morning, when teams examined their overnight plates together. A successful assembly was visible as distinctly pigmented colonies on the experimental plate, contrasted against the expected appearance of each control - giving every participant a direct, visual confirmation of a technique they could carry forward into their own project work, along with a short discussion of how to interpret a failed PCR or USER reaction scientifically.",
          { heading: "Drylab Workshop" },
          { pdf: { href: staticFile("education/pdf/drylab1-biobrick.pdf")} },
          { pdf: { href: staticFile("education/pdf/drylab2-biobrick.pdf")} },
          "Our drylab track kicked off with a How to wiki session — including a Hw to git tutorial — to help teams launch their own wikis on the right foot. From there, we dove into the drylab toolkit: BLAST, UniProt, PDB, PyMOL and docking. We built the exercises as an interactive Streamlit app, with all the code fully available on our contribution page [link]. Best of all, the session sparked lively discussions on how to put these tools to their best use.",
          {heading: "Lectures"}, "Beyond the exercises, the workshop placed significant emphasis on the softer skills and strategic thinking that shape a successful iGEM season, drawing on a mix of academic, industry and iGEM-community perspectives.","The lecture program opened with Karen Therkelsen and Signe Vangsgaard - PhD students and DTU Biobuilders' PIs - who presented on the transition from team member to supervisor, drawing on their own experience stepping into that role. Arriën Symon Rauh, PhD Fellow at the University of Copenhagen working in molecular modelling, structural bioinformatics and machine learning, also gave a presentation, as did Rasmus Böhme, iGEM Ambassador for Europe, sharing his perspective on shaping a successful iGEM journey. The weekend's closing Q&A panel brought together Kristian Barrett, DTU Biobuilders' main project supervisor, alongside Arriën Symon Rauh and iGEM Ambassadors for Europe Rasmus Böhme and Teri Wenyu Liao, giving participants the chance to put open questions to a panel spanning academic, technical and iGEM-community perspectives.","Topics covered over the three days included:","The shift in responsibility and perspective that comes with stepping into a supervisory role within a student team.", "How to approach and structure an iGEM project from its earliest stages, and how a team's direction tends to evolve over the course of a season.","Best practices for building and maintaining a team wiki, alongside an introduction to version control workflows for managing project documentation as a team.","The role of human practices in shaping a scientifically and socially responsible project, and how to weave this thinking into a project from the outset rather than treating it as an afterthought.", "The underlying principles of molecular transport relevant to a wide range of synthetic biology applications.","A concluding, practically oriented Q&A distilling competition-tested advice on what tends to distinguish strong iGEM projects from the rest.","Each session was kept intentionally interactive, with time built in for questions and discussion, reflecting the workshop's broader goal of peer learning across teams rather than one-directional instruction. Taken together, the lecture program was structured to complement the technical wetlab and drylab work with the organizational, communicative and strategic skills that are just as central to a successful iGEM project.", 
        ],
        images: [
          { src: staticFile("education/photos/biobrick-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/biobrick-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-3.avif"), alt: "Add photo 3" },
          { src: staticFile("education/photos/biobrick-4.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-5.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-6.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-8.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-9.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-10.jpg"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-11.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-12.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-14.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-15.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-16.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-17.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/biobrick-18.avif"), alt: "Add photo 2" },
        ],
      },
      {
        id: "event-1-b",
        subheading: "Nordic iGEM conference",
        body: [
          "The Nordic iGEM Conference in Oslo was one of the most eye-opening experiences of our journey. Acting as a mini-Jamboree before the main event in Paris, it brought together four thorough jury members and several strong competing teams. And through both jury comments and conversations with other teams during the Poster session and the Presentation round, it gave us an honest look at where we stood.", "The feedback was clear: our core science was solid. An original idea and a 30-assay experimental approach are noteworthy from a research standpoint. But during our presentation, it was pointed out that we did not weave our human practices, stakeholder interviews, and outreach into the project narrative itself. They existed, but they weren't visibly shaping our pipeline. This is something we're taking seriously, because the gap between academic research and real-world application is exactly where human practices live. One cannot credibly claim industry relevance without showing that the people in that industry helped shape the team’s thinking.", "Hence, it was a very valuable experience because it is better to learn this in Oslo than in Paris. Despite that gap, we placed second, which we're proud of. And beyond the jury feedback, some of the most valuable moments came from the other teams themselves. A highlight was the Around the World exercise, where teams were mixed to discuss the practical challenges of iGEM: managing team dynamics, distributing wiki work, securing funding, and building networks. Hearing how teams at different stages had handled these problems, and seeing the range in the teams’ progressions– some well ahead of us, some in the same boat– gave us perspective that no supervisor or paper could have provided.",
        ],
        images: [
          { src: staticFile("education/photos/nic-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/nic-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/nic-3.avif"), alt: "Add photo 3" },
          { src: staticFile("education/photos/nic-4.avif"), alt: "Add photo 3" },
        ],
      },
      {
        id: "event-1-c",
        subheading: "Podcast - The Sequence",
        body: [
          "We had the pleasure to be invited to The Sequence - the podcast from iGEM Lund. The first time we met our hosts was at the start of our project. We discussed different approaches for brainstorming ideas for our tophotos, how to form a team with complementary skills, and what we would do differently in hindsight. This conversation was genuinely insightful and we came out with inspiration to pass on for the future teams. For example You can listen to the episode here [link].",
        ],
        images: [
          {src: staticFile("education/photos/podcast-2.avif"), alt: "Pic 1"},
          {src: staticFile("education/photos/podcast-3.avif"), alt: "Pic 1"},
        ],
      },
    ],
  },
  {
    id: "event-2",
    title: "Connecting with the industry",
    summary: "Learn more about how we connected with different industries",
    intro:
      "A couple of intro lines about this event, shown full width under the title. The subheadings below break it into parts.",
    sections: [
      {
        id: "event-2-a",
        subheading: "State of Green visit",
        body: [
          "After months of our team actively seeking out investors and green industry stakeholders, we were pleasantly surprised when the outreach went the other way! Maja Østergaard, Head of Partnerships at State of Green, contacted us for a visit. What was the most encouraging part of this contact was that State of Green is a public-private partnership between the Danish government and its three leading business associations. Therefore, we were meeting with the Head of Partnerships of a key industrial partner for our project.", "The meeting was mutually educational. For us, it was a chance to move beyond the researcher perspective and understand what makes a project genuinely attractive to industry. For Maja, it was an introduction to a new biological approach to windmill blade waste treatment.", "One question cut straight to the core of our project: why biological, rather than traditional engineering? ", "Our answer was simple. Conventional recycling methods are energy-intensive, expensive, and require significant infrastructure, creating new environmental problems while trying to solve existing ones. Our biological solution sidesteps all of that. It's cheaper, greener, and crucially, it lowers the barrier to entry for companies who don't want to build a factory or invest in heavy industrial processes just to recover carbon fibre.",
          "Maja's response validated this thinking. She remarked that she could see our project becoming a startup, filling a real gap in the Danish green industry.",
          "One honest limitation was that the visit was scheduled when our wet lab team had just begun working on our pipeline in the lab. So we hadn't yet completed our 30+ assays and did not have results to show. Had the timing allowed, we would have loved to bring Maja into the lab and show our pipeline, which for the future we know makes a far more memorable and credible experience than a presentation!",
        ],
        images: [
          { src: staticFile("education/photos/sog-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/sog-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/sog-3.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/sog-4.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/sog-5.avif"), alt: "Add photo 2" },
        ],
      },
      {
        id: "event-2-b",
        subheading: "Introduction to Biomanufacturing",
        body: [
          "We were part of DTU Lifelong learning course titled Introduction to Biomanufacturing, organized by the Center of the Biosolutions. The purpose of this course is to give foundational knowledge about cutting-edge technology and methods in biotechnology in Denmark and globally. We joined industry and academia experts for the presentation panel and networking on the second day of the course, and got the chance to present for a diverse audience composed of experts from the ministries, universities and companies that bring together scientists and academia within and outside of the energy sector. We also got inspired by the startup talks and learned how to push the limits of our projects to make it to the market. After this event we understood better how to market our project and present complicated technical details to potential stakeholders with non-technical background.",
        ],
        images: [
          { src: staticFile("education/photos/biomanufacturing-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/biomanufacturing-2.avif"), alt: "Add photo 2" },
        ],
        pdfs: [{ href: staticFile("education/pdf/intro-biomanufacturing.pdf")}],
      },
      {
        id: "event-2-c",
        subheading: "Carlos meeting?",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: staticFile("education/carlos-meeting-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/carlos-meeting-2.avif"), alt: "Add photo 2" },
        ],
      },
      {
        id: "event-2-d",
        subheading: "Ampliqon",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: staticFile("education/photos/amp-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/amp-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/amp-3.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/amp-4.avif"), alt: "Add photo 2" },
        ],
        pdfs: [{ href: staticFile("education/pdf/ampliqon.pdf")}],
      },
    ],
  },
  {
    id: "event-3",
    title: "Connecting with the next generation",
    summary:
      "Check out how what we did with the next generation of scientists and engineers",
    intro:
      "A couple of intro lines about this event, shown full width under the title. The subheadings below break it into parts.",
    sections: [
      {
        id: "event-3-a",
        subheading: "Lecture at the International High School of Hellerup",
        body: [
          "In May, we had the opportunity to introduce young students to the world of Synthetic Biology. Students from the International School in Hellerup, currently in 10th grade, are about to choose their topics for their final semester report, and we wanted to show them a possible research direction — along with the open doors to the lecturers at our university. During the lecture, we discussed where to find inspiration, how structuring the work in DBTL cycles helps with organisation of the project, and why communicating results clearly matters, both within the team and to different audiences. We also got more specific and introduced them to plasmids and did a small exercise about the use of restriction enzymes. For most of the students, the term synthetic biology is new, so we discussed possible backgrounds and foundational knowledge to have in order to get into the field. This event taught us how to build a lecture for a younger audience with limited engineering background, and we took this opportunity to spread the word about the current issue of end-of-life treatment of wind turbine blades."
        ],
        images: [
          { src: staticFile("education/photos/ish-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/ish-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/ish-3.avif"), alt: "Add photo 3" },
          { src: staticFile("education/photos/ish-4.avif"), alt: "Add photo 4" },
        ],
        pdfs: [{ href: staticFile("education/pdf/ish-wiki.pdf") }],
      },
      {
        id: "event-3-aa",
        subheading: "Other High School lecture?",
        body: [
          "Placeholder text. Describe this part of the event: what happened, who took part, and what everyone learned.",
        ],
        images: [
          { src: staticFile("education/other-high-school-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/other-high-school-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/other-high-school-3.avif"), alt: "Add photo 3" },
        ],
      },
      {
        id: "event-3-b",
        subheading: "DSE job fair",
        body: [
          "On the 25th of March, the team had the chance to present the project at the DSE Fair on DTU Campus Lyngby. DSE is a large, non-profit, student-run organization at the Technical University of Denmark (DTU) and Aalborg University (AAU) that connects engineering and technical students with the business community.", "The DTU BioBuilders were lucky enough to be offered a booth in the startup area to present their project and interact with potential stakeholders from industry and academia, as well as interested students. Overall, loads of people showed interest in the project, and these different interactions helped the team to get a sense of the importance of the issue to the broader population.",
        ],
        images: [
          
          { src: staticFile("education/photos/dse-2.avif"), alt: "Add photo 2" },
          { src: staticFile("education/photos/dse-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/photos/dse-3.avif"), alt: "Add photo 3" },
        ],
      },
      {
        id: "event-3-c",
        subheading: "SBE",
        body: [
          "The Society of Biology Engineers (SBE) is a student-run association that aims to connect students with industry and show them the different possibilities in Biotech. They organize events and meetings regularly, and invited us to present our project at their lunch meeting on the 29th of April.","Gunnar made a 45-minute presentation on that day, going into the technical details of our project. The audience was very interested and asked a lot of questions, and it was very fulfilling to see how future scientists were inspired by our project and synthetic biology in general.",
        ],
        images: [
          { src: staticFile("education/sbe-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/sbe-2.avif"), alt: "Add photo 2" },
        ],
        /*pdfs: [{ href: staticFile("education/pdf/intro_week.pdf"), label: "Lecture slides (PDF)" }],*/
      },
      {
        id: "event-3-d",
        subheading: "Intro Week and Open House",
        body: [
          "In late August, before the semester started at DTU, we were invited to present in front of new MSc and BSc students. During the whole day we spoke to curious students about iGEM and DTU Biobuilders, the opportunities this competition offers and……..", "Every year DTU hosts a day for prospective students in the Bachelor’s and Master’s programmes to learn more about all DTU programmes. This year, the event took place on March 5th. Besides finding out more about Bachelor’s programmes and a tour around the campus, the new students have the opportunity to talk to participants of different extracurricular activities, such as iGEM and the DTU Biobuilders.","In our booth, Frederik, Ridhima, Kristine, and Gunnar presented what iGEM is, and what our project is about. This has been an interesting opportunity for us to engage with new and excited students."
        ],
        images: [
          { src: staticFile("education/intro-week-1.avif"), alt: "Add photo 1" },
          { src: staticFile("education/intro-week-2.avif"), alt: "Add photo 2" },
        ],
        pdfs: [{ href: staticFile("education/pdf/intro-week.pdf") }],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  EduGallery — one image at a time, with prev/next arrows + dots              */
/*  Wraps around; an empty image `src` renders a labelled placeholder box.      */
/* -------------------------------------------------------------------------- */
function EduGallery({ images }: { images: EduImage[] }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const count = images.length || 1;
  const img = images[i] ?? { src: "", alt: "No image available" };

  const go = (delta: number) => {
    setI((prev) => (prev + delta + count) % count);
  };

  useEffect(() => {
    if (!zoom) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, count]);

  return (
    <div className="edu-gallery">
      <div className="edu-gallery-frame">
        {img.src ? (
          <img
            className="edu-gallery-img"
            src={img.src}
            alt={img.alt}
            onClick={() => setZoom(true)}
          />
        ) : (
          <div className="edu-gallery-placeholder">🖼️ {img.alt}</div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              className="edu-gallery-arrow edu-gallery-prev"
              onClick={() => go(-1)}
              aria-label="Previous photo"
            >
              <span className="edu-arrow-icon">‹</span>
            </button>
            <button
              type="button"
              className="edu-gallery-arrow edu-gallery-next"
              onClick={() => go(1)}
              aria-label="Next photo"
            >
              <span className="edu-arrow-icon">›</span>
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="edu-gallery-dots">
          {images.map((_, d) => (
            <button
              key={d}
              type="button"
              className={`edu-gallery-dot ${d === i ? "is-active" : ""}`}
              onClick={() => setI(d)}
              aria-label={`Go to photo ${d + 1}`}
            />
          ))}
        </div>
      )}

      {zoom && img.src && (
        <div className="edu-modal" onClick={() => setZoom(false)}>
          <div
            className="edu-modal-inner is-image"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="edu-modal-close"
              onClick={() => setZoom(false)}
              aria-label="Close"
            >
              ×
            </button>

            <img className="edu-modal-img" src={img.src} alt={img.alt} />

            {count > 1 && (
              <>
                <button
                  type="button"
                  className="edu-modal-arrow edu-modal-prev"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                >
                  <span className="edu-arrow-icon">‹</span>
                </button>
                <button
                  type="button"
                  className="edu-modal-arrow edu-modal-next"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                >
                  <span className="edu-arrow-icon">›</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduPdf — a PDF preview framed like the gallery; click to zoom (modal)       */
/* -------------------------------------------------------------------------- */
function EduPdf({ pdf }: { pdf: PdfLink }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const title = pdfFriendlyName(pdf.href);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || inView) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="edu-pdf">
      <div className="edu-pdf-frame" ref={boxRef}>
        {inView && (
          <iframe
            className="edu-pdf-preview"
            src={`${pdf.href}#view=FitH`}
            title={title}
            loading="lazy"
          />
        )}
        <button
          type="button"
          className="edu-pdf-zoombtn"
          onClick={() => setOpen(true)}
          aria-label={`Open PDF: ${title}`}
        >
          ⤢
        </button>
      </div>

      {open && (
        <div className="edu-modal" onClick={() => setOpen(false)}>
          <div className="edu-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="edu-modal-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <iframe
              className="edu-modal-pdf"
              src={pdf.href}
              title={title}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduCollapsible — clips long content to ~one screen with a "Read more"      */
/*  button. Short content renders normally (no button).                         */
/* -------------------------------------------------------------------------- */
function EduCollapsible({
  children,
  screens = 1.2, // collapsed height as a fraction of the viewport height
}: {
  children: ReactNode;
  screens?: number;
}) {
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [tooLong, setTooLong] = useState(false);

  // Re-measure when the content grows (images/iframes load) or the window resizes.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const check = () =>
      setTooLong(inner.scrollHeight > window.innerHeight * screens);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(inner);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [screens]);

  const collapsed = tooLong && !open;

  const toggle = () => {
    // When collapsing, jump back to the top of the section so the reader
    // isn't left further down the page.
    if (open) clipRef.current?.closest("section")?.scrollIntoView({ behavior: "smooth" });
    setOpen(!open);
  };

  return (
    <div className="edu-collapse">
      <div
        ref={clipRef}
        className={`edu-collapse-clip ${collapsed ? "is-collapsed" : ""}`}
        style={collapsed ? { maxHeight: `${screens * 100}vh` } : undefined}
      >
        <div ref={innerRef}>{children}</div>
      </div>

      {tooLong && (
        <button
          type="button"
          className="edu-collapse-btn"
          onClick={toggle}
          aria-expanded={open}
        >
          {open ? "Show less ▲" : "Read more ▼"}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduBody — renders body blocks: paragraph | heading | inline PDF             */
/* -------------------------------------------------------------------------- */
function EduBody({ blocks }: { blocks: BodyBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (typeof block === "string")
          return <p className="edu-detail-body" key={i}>{block}</p>;
        if ("heading" in block)
          return <h2 className="edu-detail-heading" key={i}>{block.heading}</h2>;
        return <EduPdf key={i} pdf={block.pdf} />;
      })}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduSubsectionBlock — one subheading: text on one side, gallery on the other */
/* -------------------------------------------------------------------------- */
function EduSubsectionBlock({
  sub,
  flip,
}: {
  sub: EduSubsection;
  flip: boolean;
}) {
  return (
    <section id={sub.id} className="edu-detail-sub">
      <h1 className="edu-h3">{sub.subheading}</h1>

      <EduCollapsible>
        <div className={`edu-flow ${flip ? "edu-flow-flip" : ""}`}>
          <EduGallery images={sub.images} />
          <EduBody blocks={sub.body} />
          {sub.pdfs?.map((pdf) => <EduPdf key={pdf.href} pdf={pdf} />)}
        </div>
      </EduCollapsible>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduEventBox — one event as the shared ClickableTextBox (same expandable    */
/*  box as the Experiments page). Collapsed: just the title. Open: intro +     */
/*  all subheadings.                                                            */
/* -------------------------------------------------------------------------- */
function EduEventBox({ event, openAll }: { event: EduEvent; openAll: boolean }) {
  return (
    <section id={event.id} className="mt-4">
      <ClickableTextBox title={event.title} openAll={openAll}>
        <p className="edu-intro">{event.intro}</p>
        {event.sections.map((sub, i) => (
          <EduSubsectionBlock key={sub.id} sub={sub} flip={i % 2 === 1} />
        ))}
      </ClickableTextBox>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
export function Education() {
  // Match the Model pages' constant light-blue page background while mounted.
  useEffect(() => {
    document.body.classList.add("edu-bg");
    return () => document.body.classList.remove("edu-bg");
  }, []);

  // "Open all / Close all" for every event box (same as Experiments).
  const [openAll, setOpenAll] = useState(false);

  return (
    <>
      <TOC />

      <div className="page-start row mt-4">
        <div className="col-lg-12">
          {/* ---- Overview card ---- */}
          <section id="overview">
            <h1 className="edu-h1">Overview</h1>

            <div className="edu-overview">
              <p>
                The activities we have organized over the year were designed for a range of audiences, from high school students, through university student, to industry stakeholders. Our goal was to spread awareness of the environmental problem that wind energy faces, and inspire others to take action.
              </p>
              <hr className="edu-rule" />
              <p className="edu-approach">
                {/* PLACEHOLDER — replace with our own approach in a sentence. */}
                The collection of lectures, workshops and guides that can be used by other teams, students, or curious minds can be found on our contribution page by clicking the link below.
              </p>
              <Link className="edu-link" to="/Contribution">
                See the contributions page &rarr;
              </Link>
            </div>
          </section>

          {/* ---- Events: one expandable box each (ClickableTextBox) ---- */}
          <section id="events" className="mt-5">
            <h1 className="edu-h1">Educational events</h1>
            {EDU_EVENTS.map((event) => (
              <EduEventBox key={event.id} event={event} openAll={openAll} />
            ))}
            <div className="d-flex justify-content-end mb-2">
              <ClickableTextBoxToggle
                open={openAll}
                onClick={() => setOpenAll(!openAll)}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}