import type { ReactNode } from "react";
import type { NotebookEntry } from "../contents/wet-lab/notebook-data";
import { missingFields } from "../contents/wet-lab/notebook-data";

/**
 * One day's entry, rendered in the team's fixed notebook format.
 *
 * Takes a whole `NotebookEntry` rather than ten separate props, so the page and
 * the data file can never drift apart: adding a field to the template means
 * adding it in notebook-data.ts and rendering it here, nowhere else.
 *
 * Fields that have not been transcribed from Benchling yet are omitted rather
 * than printed empty, so an entry can go in the moment it happens.
 */
export default function DailyLog({ entry }: { entry: NotebookEntry }) {
  const {
    date,
    title,
    location,
    people,
    purpose,
    protocolName,
    protocolLink,
    deviations,
    upstreamInputs,
    downstreamOutputs,
  } = entry;

  // "Building 221 - AG", but correct when only one of the two is known.
  const byline = [location, people].filter(Boolean).join(" - ");
  const missing = missingFields(entry);

  return (
    <article className="daily-log">
      <h2 id={date}>
        {date} – {title}
      </h2>

      {byline && (
        <p>
          <i>{byline}</i>
        </p>
      )}

      <Field label="Purpose">{purpose}</Field>

      <Field label="Protocol">
        {protocolName &&
          (protocolLink ? (
            <a href={protocolLink}>{protocolName}</a>
          ) : (
            protocolName
          ))}
      </Field>

      <Field label="Deviations">{deviations}</Field>
      <Field label="Upstream inputs">{upstreamInputs}</Field>
      <Field label="Downstream outputs">{downstreamOutputs}</Field>

      {/* Transcription reminder — `yarn dev` only, never in the built wiki. */}
      {import.meta.env.DEV && missing.length > 0 && (
        <p className="daily-log-todo">
          Still to transcribe from Benchling: {missing.join(", ")}
        </p>
      )}
    </article>
  );
}

/** One "Label: value" line, rendered only when there is a value. */
function Field({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p>
      <b>{label}:</b> {children}
    </p>
  );
}
