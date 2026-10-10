/**
 * ISO-8601 week number for a date.
 *
 * ISO weeks start on Monday, and week 1 is the week containing 4 January. This
 * is the definition Denmark (and Benchling's date pickers) use, so the numbers
 * here match the "week 24" a lab member would write in their own notes.
 *
 * Shared by the Calendar and the notebook so a day cell and the notebook
 * section it links to can never end up under different week numbers.
 */
export function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Shift to the Thursday of this week: the ISO year is whichever year that
  // Thursday falls in, which is what makes the turn of the year work.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

/** Parses a "YYYY-MM-DD" string as a LOCAL date.
 *
 * `new Date("2026-04-24")` parses as UTC, which lands on the previous evening
 * anywhere west of Greenwich and can report the wrong day — and therefore the
 * wrong week. Splitting the parts avoids that entirely. */
export function parseISODate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Monday of the ISO week containing `date`. */
export function startOfISOWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
