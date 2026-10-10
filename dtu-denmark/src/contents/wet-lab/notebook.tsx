import { useEffect, useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import {
  ClickableTextBox,
  ClickableTextBoxToggle,
} from "../../components/ClickableTextBox";
import TOC from "../../components/TOC";
import DailyLog from "../../components/DailyLog";
import LabBook from "../../components/LabBook";
import {
  getNotebookEventDates,
  getNotebookWeeks,
  weekNumberOf,
} from "./notebook-data";
import "./notebook.css";

// This page renders ENTIRELY from notebook-data.ts — the weeks, the spreads of
// the lab book, the calendar dots and every anchor are derived from the entries
// there. To add a lab day, edit that file; nothing here needs to change.
//
// TWO VIEWS OF THE SAME WEEKS
//   The lab book is the presentation, but a two-page spread cannot hold
//   readable text on a phone. So the same weeks are also rendered as a plain
//   list, and CSS shows exactly one of them: the book above 780px, the list
//   below (see LabBook.css and notebook.css). Both are always in the DOM, which
//   also means the list stays available to search and to screen readers.

export function Notebook() {
  const weeks = useMemo(() => getNotebookWeeks(), []);
  const events = useMemo(() => getNotebookEventDates(), []);

  // Which spread the book is turned to, as an index into `weeks`.
  const [spread, setSpread] = useState(0);
  // The book starts shut on its cover, and is opened either by its own
  // "Explore our work" button or by picking a date in the calendar.
  const [bookOpen, setBookOpen] = useState(false);
  // The list view's mirror of the same choice: which week is expanded.
  const [openAll, setOpenAll] = useState(true);
  const [openedWeek, setOpenedWeek] = useState<number | null>(null);

  // The Calendar announces the id it wants shown ("2026-04-24" for a day,
  // "week-18" for a week number). Turn the book to that week, and open the
  // matching week in the list view for the narrow-screen case.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const weekNumber = id.startsWith("week-")
        ? Number(id.slice("week-".length))
        : weekNumberOf(id);
      if (Number.isNaN(weekNumber)) return;

      setOpenedWeek(weekNumber);
      const index = weeks.findIndex((w) => w.weekNumber === weekNumber);
      if (index >= 0) {
        setSpread(index);
        // Picking a date is itself a request to open the book.
        setBookOpen(true);
      }
    };
    window.addEventListener("openNotebookEntry", onOpen);
    return () => window.removeEventListener("openNotebookEntry", onOpen);
  }, [weeks]);

  return (
    <>
      <TOC />

      <div className="page-start">
        <Calendar events={events} />

        <LabBook
          weeks={weeks}
          spread={spread}
          open={bookOpen}
          onOpen={() => {
            // Always opens at the first week, wherever it was shut — the book
            // is read from the beginning, not resumed. Picking a date in the
            // calendar still opens straight to that week.
            setSpread(0);
            setOpenedWeek(weeks[0]?.weekNumber ?? null);
            setBookOpen(true);
          }}
          onClose={() => setBookOpen(false)}
          onSpreadChange={(index) => {
            setSpread(index);
            setOpenedWeek(weeks[index]?.weekNumber ?? null);
          }}
        />

        {/* Narrow screens, and anything reading the page as a document. */}
        <div className="notebook-list">
          <div className="d-flex justify-content-end mb-4">
            <ClickableTextBoxToggle
              open={openAll}
              onClick={() => setOpenAll(!openAll)}
            />
          </div>

          {weeks.map((week) => (
            <section id={week.id} key={week.weekNumber}>
              <h1>
                Week {week.weekNumber}{" "}
                <span className="week-dates">{week.dateRange}</span>
              </h1>

              {week.summary && <p>{week.summary}</p>}

              <ClickableTextBox
                title={`Weekly notebook (${week.entries.length} ${
                  week.entries.length === 1 ? "entry" : "entries"
                })`}
                openAll={openAll || openedWeek === week.weekNumber}
              >
                {week.days.map((day, dayIndex) => (
                  <div key={day.date}>
                    {dayIndex > 0 && <hr className="week-divider" />}
                    {day.entries.map((entry, entryIndex) => (
                      <div key={`${entry.date}-${entryIndex}`}>
                        <DailyLog entry={entry} />
                        {entry.result && (
                          <a
                            className="notebook-result"
                            href={entry.result.href}
                          >
                            {entry.result.label}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </ClickableTextBox>
            </section>
          ))}
        </div>

        <br />
      </div>
    </>
  );
}
