import { getISOWeek, parseISODate, startOfISOWeek } from "../../utils/isoWeek";

// ─────────────────────────────────────────────────────────────────────────────
// THE NOTEBOOK — ONE FILE, ONE ENTRY PER LAB DAY
//
// This is the ONLY place notebook content is written. The page, the calendar
// dots, the week headings, the week numbers and every anchor link are all
// derived from the array below — so adding an entry here is the whole job, and
// nothing can fall out of sync.
//
// HOW TO ADD AN ENTRY (from Benchling)
//   1. Copy the object under "TEMPLATE" to the bottom of NOTEBOOK_ENTRIES.
//   2. Paste the text from the Benchling entry into the matching fields.
//   3. Save. The entry appears under its week automatically, and its day
//      lights up in the calendar.
//
// RULES THAT KEEP IT STRUCTURED
//   * `date` is ALWAYS "YYYY-MM-DD" (so 24 April 2026 is "2026-04-24", NOT
//     "24-04-2026"). This is what sorts the notebook and groups it into weeks.
//   * Order does not matter — entries are sorted by date when rendered.
//   * Two entries can share a date; they stay in the order written here.
//   * Only `date` and `title` are required. Fields left out are simply not
//     shown, so an entry can be committed as soon as it happens and completed
//     later — while `yarn dev` is running, an entry with missing fields shows a
//     small reminder listing them, which never appears on the built wiki.
//   * Write what actually happened. If a step deviated from the protocol, say
//     so in `deviations` — "None." is a claim like any other.
// ─────────────────────────────────────────────────────────────────────────────

export interface NotebookEntry {
  /** "YYYY-MM-DD". Required — this is what places the entry in the notebook. */
  date: string;
  /** Short name of the day's work, e.g. "Itl-03 miniprep". Required. */
  title: string;
  /** Where it was done, e.g. "Building 221". */
  location?: string;
  /** Who did it — initials are fine, e.g. "AG, KTJ". */
  people?: string;
  /** Why this experiment was done. */
  purpose?: string;
  /** Name of the protocol followed, e.g. "Heat shock transformation". */
  protocolName?: string;
  /** Link to that protocol, normally on the Experiments page. Optional: with
   *  no link the protocol name is shown as plain text. */
  protocolLink?: string;
  /** Any deviation from the standard protocol; write "None." if there were none. */
  deviations?: string;
  /** What went in — material, sample or result this builds on. */
  upstreamInputs?: string;
  /** What came out, and what it feeds into next. */
  downstreamOutputs?: string;
  /** Set this on the days that produced a result worth reading. Those days are
   *  circled in pen — in the calendar and again in the lab book — and the
   *  circle links to the result on the Measurement page. Use it sparingly:
   *  circling everything circles nothing. */
  result?: {
    /** What the reader will find, e.g. "SDS-PAGE gel". */
    label: string;
    /** Where it lives, e.g. "/dtu-denmark/measurement#itl-03-sds". */
    href: string;
  };
}

// ── TEMPLATE — copy this, don't edit it ──────────────────────────────────────
// {
//   date: "2026-00-00",
//   title: "",
//   location: "",
//   people: "",
//   purpose: "",
//   protocolName: "",
//   protocolLink: "/dtu-denmark/experiments",
//   deviations: "",
//   upstreamInputs: "",
//   downstreamOutputs: "",
// },

/**
 * Every lab day, in any order.
 *
 * The entries below are stubs: the date and title of each Benchling entry, with
 * the rest still to be transcribed. Fill them in from Benchling rather than
 * writing them from memory.
 */
export const NOTEBOOK_ENTRIES: NotebookEntry[] = [
  // ── EXAMPLE — DELETE ME ────────────────────────────────────────────────────
  // A fully filled-in entry, so the page shows what a finished day looks like
  // and you can see which text lands where. It describes NO real experiment.
  // Delete this object once a real entry has been transcribed.
  
  // --- DAILY LOGS - FILL IN FROM BENCHLING --- (has "NOT DONE !!!" if work is still needed - otherwise: "DONE")
  { // NOT DONE!!! Alisha
    date: "2026-04-24",
    title: "Itl-03 transformation into DH5α",
    people: "Alisha",
    purpose:
      "Transforming DH5α with our plasmid of Itl-03",
    protocolName: "",
    protocolLink: "/dtu-denmark/experiments",
    deviations:
      'Anything done differently from the protocol: a changed volume, a longer incubation, a substituted reagent. Write "None." only if there genuinely were none.',
    upstreamInputs:
      "What went in, and which earlier entry it came from — e.g. the plasmid prep from the previous week.",
    downstreamOutputs:
      "What came out and what it feeds into next — e.g. plates carried forward to the colony PCR.",
  },

  {
    date: "2026-04-29",
    title: "Restriction digest of purified Itl-03 plasmids",
    location: "XXX",
    people: "Felipe & Pricilla",
    purpose:
      "Confirm the 3 minipreps of itl 03",
    protocolName: "",
    protocolLink: "/dtu-denmark/experiments",
    deviations:
      'Anything done differently from the protocol: a changed volume, a longer incubation, a substituted reagent. Write "None." only if there genuinely were none.',
    upstreamInputs:
      "What went in, and which earlier entry it came from — e.g. the plasmid prep from the previous week.",
    downstreamOutputs:
      "What came out and what it feeds into next — e.g. plates carried forward to the colony PCR.",
  },

  {
    date: "2026-04-29",
    title: "Itl-03 digest",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-04-29",
    title: "Itl-03 miniprep",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-06-09",
    title: "Itl-03 purification and Bradford assay",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-06-10",
    title: "Itl-03 dialysis",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-06-10",
    title: "Itl-03 SDS",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-06-24",
    title: "Itl-03 expression (replication)",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-06-30",
    title: "CueO transformation into BL21",
    protocolLink: "/dtu-denmark/experiments",
  },
  {
    date: "2026-06-30",
    title: "CueO transformation into DH5α",
    protocolLink: "/dtu-denmark/experiments",
  },
];

/**
 * Optional one-paragraph summary per ISO week, keyed by week number.
 *
 * A week with no summary here simply shows its entries. Keep these to what the
 * week actually established — this is the part a judge reads to follow the
 * story between experiments.
 */
export const WEEK_SUMMARIES: Record<number, string> = {
  // Example — replace with what week 17 actually established, or delete the line.
  17: "Weekly summary: a short paragraph on what this week established, written for someone reading the notebook straight through. Delete or replace this example.",
};

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED VIEWS — nothing below needs editing when entries are added
// ─────────────────────────────────────────────────────────────────────────────

/** One calendar day that has at least one entry. */
export interface NotebookDay {
  /** "YYYY-MM-DD" */
  date: string;
  /** Anchor id for this day, used by the calendar's day cells. */
  id: string;
  entries: NotebookEntry[];
}

/** One ISO week of the notebook — the unit a lab-book spread shows. */
export interface NotebookWeek {
  weekNumber: number;
  /** Anchor id for this week, used by the calendar's week-number column. */
  id: string;
  /** Monday and Sunday of the week, for a "20–26 April 2026" style heading. */
  start: Date;
  end: Date;
  /** e.g. "20–26 April 2026" */
  dateRange: string;
  summary?: string;
  days: NotebookDay[];
  /** Every entry in the week, flattened — handy for counts and previews. */
  entries: NotebookEntry[];
}

const DAY_MS = 86400000;

/** "20–26 April 2026", collapsing the month and year when they are shared. */
function formatRange(start: Date, end: Date): string {
  const month = (d: Date) => d.toLocaleString("en-GB", { month: "long" });
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  const left = sameMonth
    ? `${start.getDate()}`
    : `${start.getDate()} ${month(start)}${sameYear ? "" : ` ${start.getFullYear()}`}`;
  return `${left}–${end.getDate()} ${month(end)} ${end.getFullYear()}`;
}

/**
 * The notebook grouped into weeks, each week grouped into days, everything in
 * chronological order.
 *
 * This is the shape the page renders from — and the shape a page-turning lab
 * book would use directly: one week per spread, `days` down the page.
 */
export function getNotebookWeeks(
  entries: NotebookEntry[] = NOTEBOOK_ENTRIES,
): NotebookWeek[] {
  const byWeek = new Map<number, NotebookEntry[]>();

  for (const entry of entries) {
    const week = getISOWeek(parseISODate(entry.date));
    const existing = byWeek.get(week);
    if (existing) existing.push(entry);
    else byWeek.set(week, [entry]);
  }

  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekNumber, weekEntries]) => {
      // Stable sort by date: entries sharing a day keep the order written in
      // NOTEBOOK_ENTRIES, which is how the team ordered that day's work.
      const sorted = [...weekEntries].sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      const days: NotebookDay[] = [];
      for (const entry of sorted) {
        const last = days[days.length - 1];
        if (last && last.date === entry.date) last.entries.push(entry);
        else days.push({ date: entry.date, id: entry.date, entries: [entry] });
      }

      const start = startOfISOWeek(parseISODate(sorted[0].date));
      const end = new Date(start.getTime() + 6 * DAY_MS);

      return {
        weekNumber,
        id: `week-${weekNumber}`,
        start,
        end,
        dateRange: formatRange(start, end),
        summary: WEEK_SUMMARIES[weekNumber],
        days,
        entries: sorted,
      };
    });
}

/** Which week a given "YYYY-MM-DD" belongs to — used to open the right week
 *  when a day is clicked in the calendar. */
export function weekNumberOf(date: string): number {
  return getISOWeek(parseISODate(date));
}

/** Every date that has an entry, in the shape the Calendar wants. `highlight`
 *  marks the days that produced a result, so the calendar can circle them. */
export function getNotebookEventDates(
  entries: NotebookEntry[] = NOTEBOOK_ENTRIES,
): { date: string; highlight?: boolean }[] {
  const withResult = new Set(
    entries.filter((e) => e.result).map((e) => e.date),
  );
  return [...new Set(entries.map((e) => e.date))].sort().map((date) => ({
    date,
    highlight: withResult.has(date) || undefined,
  }));
}

/** Fields an entry still needs. Drives the dev-only reminder in DailyLog, so
 *  half-transcribed entries are visible while writing and invisible once the
 *  wiki is built. */
export const REQUIRED_FOR_COMPLETE = [
  "location",
  "people",
  "purpose",
  "protocolName",
  "deviations",
  "upstreamInputs",
  "downstreamOutputs",
] as const satisfies readonly (keyof NotebookEntry)[];

export function missingFields(entry: NotebookEntry): string[] {
  return REQUIRED_FOR_COMPLETE.filter((field) => !entry[field]?.trim());
}
