import { useEffect, useState } from "react";
import TOC from "../../components/TOC";
import "./education.css";

/* ========================================================================== *
 *  Education page  (Engagement → Education, route /education)
 *
 *  Styled to match the Model pages (.edu-* mirrors the model card aesthetic —
 *  dark-blue headings, orange accent, light-blue page background). Layout:
 *     • #overview        → award card + our approach + the clickable cards
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

// One subheading within an event: its own heading, text and photo carousel.
type EduSubsection = {
  id: string; // anchor id — TOC entry + scroll target (must be unique)
  subheading: string;
  body: string[]; // one string per paragraph
  images: EduImage[];
  pdf?: { href: string; label: string }; // optional downloadable PDF
};

type EduEvent = {
  id: string; // anchor id — the card's target + the event's TOC entry
  title: string;
  summary: string; // 1–2 lines for the card
  intro: string; // a couple of lines under the title, before the subheadings
  sections: EduSubsection[];
};

const EDU_EVENTS: EduEvent[] = [
  // PLACEHOLDER entries — replace with real events (no fabricated outcomes).
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
          "Placeholder text. Describe this part of the event: what happened, who took part, and what everyone (including the team) learned.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
      },
      {
        id: "event-1-b",
        subheading: "Nordic iGEM conference",
        body: [
          "Placeholder text. Another part of the same event, in the same format — text on one side, photos on the other.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
          { src: "", alt: "Add photo 3" },
        ],
      },
      {
        id: "event-1-c",
        subheading: "Podcast - The Sequence",
        body: [
          "Placeholder text. Another part of the same event, in the same format — text on one side, photos on the other.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
          { src: "", alt: "Add photo 3" },
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
          "Placeholder text. Describe this part of the event: what happened, who took part, and what everyone learned.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
      },
      {
        id: "event-2-b",
        subheading: "Introduction to Biomanufacturing",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
      },
      {
        id: "event-2-c",
        subheading: "Carlos meeting?",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
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
        subheading: "International High School lecture",
        body: [
          "In May, we had the opportunity to introduce young students to the world of Synthetic Biology. Students from the International School in Hellerup, currently in 10th grade, are about to choose their topics for their final semester report, and we wanted to show them a possible research direction — along with the open doors to the lecturers at our university. During the lecture, we discussed where to find inspiration, how structuring the work in DBTL cycles helps with organisation of the project, and why communicating results clearly matters, both within the team and to different audiences. We also got more specific and introduced them to plasmids and did a small exercise about the use of restriction enzymes.",
          "For most of the students, the term synthetic biology is new, so we discussed possible backgrounds and foundational knowledge to have in order to get into the field.",
          "This event taught us how to build a lecture for a younger audience with limited engineering background, and we took this opportunity to spread the word about the current issue of end-of-life treatment of wind turbine blades.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
          { src: "", alt: "Add photo 3" },
        ],
        pdf: {
    href: "/education/international-high-school.pdf", // replace with the real file
    label: "Lecture slides (PDF)",
  },
      },
      {
        id: "event-3-aa",
        subheading: "Other High School lecture?",
        body: [
          "Placeholder text. Describe this part of the event: what happened, who took part, and what everyone learned.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
          { src: "", alt: "Add photo 3" },
        ],
      },
      {
        id: "event-3-b",
        subheading: "DSE job fair",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
      },
      {
        id: "event-3-c",
        subheading: "SBE",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
      },
      {
        id: "event-3-d",
        subheading: "Intro Week and Open House",
        body: [
          "Placeholder text. Another part of the same event, in the same format.",
        ],
        images: [
          { src: "", alt: "Add photo 1" },
          { src: "", alt: "Add photo 2" },
        ],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  EduEventCard — one reusable event card (links to its detail block)          */
/* -------------------------------------------------------------------------- */
function EduEventCard({ event }: { event: EduEvent }) {
  return (
    <a className="edu-card" href={`#${event.id}`}>
      <h4 className="edu-card-title">{event.title}</h4>
      <p className="edu-card-summary">{event.summary}</p>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduGallery — one image at a time, with prev/next arrows + dots              */
/*  Wraps around; an empty image `src` renders a labelled placeholder box.      */
/* -------------------------------------------------------------------------- */
function EduGallery({ images }: { images: EduImage[] }) {
  const [i, setI] = useState(0);
  const count = images.length;
  // step forward/back with wrap-around
  const go = (delta: number) => setI((prev) => (prev + delta + count) % count);
  const img = images[i];

  return (
    <div className="edu-gallery">
      <div className="edu-gallery-frame">
        {img.src ? (
          <img className="edu-gallery-img" src={img.src} alt={img.alt} />
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
              ‹
            </button>
            <button
              type="button"
              className="edu-gallery-arrow edu-gallery-next"
              onClick={() => go(1)}
              aria-label="Next photo"
            >
              ›
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
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/*  EduPdf — a PDF preview framed like the gallery; click to zoom (modal)       */
/* -------------------------------------------------------------------------- */
function EduPdf({ pdf }: { pdf: { href: string; label: string } }) {
  const [open, setOpen] = useState(false);

  // Close the zoom modal on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="edu-pdf">
      <button
        type="button"
        className="edu-pdf-frame"
        onClick={() => setOpen(true)}
        aria-label={`Open ${pdf.label}`}
      >
        {/* Non-interactive preview — the button takes the click. */}
        <iframe
          className="edu-pdf-preview"
          src={`${pdf.href}#toolbar=0&navpanes=0&view=FitH`}
          title={pdf.label}
          tabIndex={-1}
        />
        <span className="edu-pdf-overlay" aria-hidden="true">
          <span className="edu-pdf-zoom">⤢</span>
        </span>
      </button>
      <span className="edu-pdf-label">📄 {pdf.label}</span>

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
            <iframe className="edu-modal-pdf" src={pdf.href} title={pdf.label} />
          </div>
        </div>
      )}
    </div>
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
    // Nested <section id> so its <h1> (the subheading) is a TOC entry. The
    // gallery floats to one side and the paragraphs flow around it; `flip`
    // switches the side.
    <section id={sub.id} className="edu-detail-sub">
      <h1 className="edu-h3">{sub.subheading}</h1>

      <div className={`edu-flow ${flip ? "edu-flow-flip" : ""}`}>
        <EduGallery images={sub.images} />

        {sub.body.map((para, i) => (
          <p className="edu-detail-body" key={i}>
            {para}
          </p>
        ))}

        
        {sub.pdf && <EduPdf pdf={sub.pdf} />} 
        
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  EduEventDetail — event title + intro lines, then its subheadings            */
/* -------------------------------------------------------------------------- */
function EduEventDetail({ event }: { event: EduEvent }) {
  return (
    // <section id> whose <h1> is the title → the event's TOC entry (and the
    // card's target). Each subheading below is its own nested <section id>.
    <section id={event.id} className="edu-detail-block">
      <h1 className="edu-h2">{event.title}</h1>
      <p className="edu-intro">{event.intro}</p>

      {event.sections.map((sub, i) => (
        <EduSubsectionBlock key={sub.id} sub={sub} flip={i % 2 === 1} />
      ))}
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

  return (
    <>
      <TOC />

      <div className="page-start row mt-4">
        <div className="col-lg-12">
          {/* ---- Overview card + clickable event cards ---- */}
          <section id="overview">
            <h1 className="edu-h1">Overview</h1>

            <div className="edu-overview">
              <p>
                Innovative educational and outreach activities open a two-way
                dialogue with new communities about the science and public
                values behind synthetic biology. Activities need not relate
                directly to our project — they can address wider issues in iGEM
                or synthetic biology. The only requirement is that they promote
                scientific learning rather than market iGEM or synthetic biology.
              </p>
              <hr className="edu-rule" />
              <p className="edu-approach">
                {/* PLACEHOLDER — replace with our own approach in a sentence. */}
                Placeholder — one or two sentences on how our team approached
                education this year and the through-line across the events below.
              </p>
              <a
                className="edu-link"
                href="https://competition.igem.org/judging/awards/special"
              >
                See the contributions page &rarr;
              </a>
            </div>

            {/* ---- Jump-to-section label above the cards ---- */}
            <p className="edu-jump-label">Jump to section</p>

            {/* ---- Clickable event cards, right under the overview card ---- */}
            <div className="edu-grid mt-4">
              {EDU_EVENTS.map((event) => (
                <EduEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {/* ---- Event details ----
              #events is a top-level TOC entry; each event nests under it, and
              each subheading nests under its event. */}
          <section id="events" className="mt-5">
            <h1 className="edu-h1">Educational events</h1>
            {EDU_EVENTS.map((event) => (
              <EduEventDetail key={event.id} event={event} />
            ))}
          </section>
        </div>
      </div>
    </>
  );
}