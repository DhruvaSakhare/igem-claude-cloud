import "./Calendar.css";
import { Fragment, useMemo, useState } from "react";
import { getISOWeek } from "../utils/isoWeek";

export interface CalendarEvent {
  date: string;
  /** Days that produced a result. Drawn circled, as in a paper notebook. */
  highlight?: boolean;
}

interface CalendarProps {
  events: CalendarEvent[];
}

const months = [
  { year: 2026, month: 3 }, // April
  { year: 2026, month: 4 }, // May
  { year: 2026, month: 5 }, // June
  { year: 2026, month: 6 }, // July
  { year: 2026, month: 7 }, // August
  { year: 2026, month: 8 }, // September
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar({ events }: CalendarProps) {
  const [monthIndex, setMonthIndex] = useState(0);

  const current = months[monthIndex];

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.date)),
    [events],
  );

  const highlighted = useMemo(
    () => new Set(events.filter((e) => e.highlight).map((e) => e.date)),
    [events],
  );

  function scrollTo(id: string) {
    window.dispatchEvent(
      new CustomEvent("openNotebookEntry", {
        detail: id,
      }),
    );

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);
  }

  const firstDay = new Date(current.year, current.month, 1);

  const startOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const totalRows = Math.ceil((startOffset + daysInMonth) / 7);

  const weeks = [];

  let dayCounter = 1;

  for (let row = 0; row < totalRows; row++) {
    const days = [];

    const monday = new Date(
      current.year,
      current.month,
      dayCounter - (row === 0 ? startOffset : 0),
    );

    for (let col = 0; col < 7; col++) {
      const cell = row * 7 + col;

      if (cell < startOffset || dayCounter > daysInMonth) {
        days.push(null);
      } else {
        const date = `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;

        days.push({
          day: dayCounter,
          date,
          hasEntry: eventDates.has(date),
          highlight: highlighted.has(date),
        });

        dayCounter++;
      }
    }

    weeks.push({
      weekNumber: getISOWeek(monday),
      days,
    });
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          onClick={() => setMonthIndex((m) => Math.max(0, m - 1))}
          disabled={monthIndex === 0}
        >
          <span className="pi pi-chevron-left" />
        </button>

        <h3>
          {monthNames[current.month]} {current.year}
        </h3>

        <button
          onClick={() =>
            setMonthIndex((m) => Math.min(months.length - 1, m + 1))
          }
          disabled={monthIndex === months.length - 1}
        >
          <span className="pi pi-chevron-right" />
        </button>
      </div>

      <div className="calendar-table">
        <div className="calendar-header-cell week-header">Week</div>

        {weekdays.map((day) => (
          <div key={day} className="calendar-header-cell">
            {day}
          </div>
        ))}

        {weeks.map((week) => (
          <Fragment key={week.weekNumber}>
            <div
              className="calendar-week-number"
              onClick={() => scrollTo(`week-${week.weekNumber}`)}
            >
              {week.weekNumber}
            </div>

            {week.days.map((day, index) => {
              if (!day) {
                return <div key={index} className="calendar-empty" />;
              }

              return (
                <div
                  key={day.date}
                  className={`calendar-day ${
                    day.hasEntry ? "calendar-day-active" : ""
                  } ${day.highlight ? "calendar-day-circled" : ""}`}
                  onClick={() => day.hasEntry && scrollTo(day.date)}
                >
                  {day.day}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
