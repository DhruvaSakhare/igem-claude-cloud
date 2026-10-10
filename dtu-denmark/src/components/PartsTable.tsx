import "./PartsTable.css";
import type { ReactNode } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

/** One column: which field of each row it shows, and its header. `rowHeader`
 *  marks the column a reader scans down (an ID, a group name) — it is set in
 *  bold and kept from wrapping. */
export type TableColumn = {
  field: string;
  header?: ReactNode;
  rowHeader?: boolean;
};

/** A row: one value per column field. Cells may hold markup (italics, links,
 *  citations), not only text. */
export type TableRow = Record<string, ReactNode>;

// The Parts page's columns — what this table shows when none are given.
const PARTS_COLUMNS: TableColumn[] = [
  { field: "id", header: "BioBrick ID" },
  { field: "name", header: "Name" },
  { field: "description", header: "Description" },
  { field: "type", header: "Type" },
  { field: "sizeBp", header: "Size (bp)" },
  { field: "status", header: "Status" },
];

type TableProps = {
  data: TableRow[];
  /** Defaults to the Parts page's columns. */
  columns?: TableColumn[];
  /** Shown under the table. */
  caption?: ReactNode;
  /** Makes the table numbered ("Table N." before the caption) inside a
   *  NumberedFigures root, and the id `<TabNum of=…>` refers to it by. */
  numberId?: string;
  /** Merge consecutive rows sharing this field's value into one tall cell
   *  (PrimeReact's rowspan grouping). Rows must already be in group order. */
  groupRowsBy?: string;
  /** Hide the header row, for a table whose rows are labelled instead. */
  showHeaders?: boolean;
};

export default function PartsTable({
  data,
  columns = PARTS_COLUMNS,
  caption,
  numberId,
  groupRowsBy,
  showHeaders = true,
}: TableProps) {
  // The first row of each merged group after the first, so a rule can be
  // drawn above it — otherwise the striping runs straight across the
  // boundary and it is hard to see where one group ends.
  const groupStarts = new Set(
    groupRowsBy
      ? data.filter(
          (row, i) => i > 0 && row[groupRowsBy] !== data[i - 1][groupRowsBy],
        )
      : [],
  );

  const table = (
    <DataTable
      value={data}
      className="parts-table"
      showHeaders={showHeaders}
      rowGroupMode={groupRowsBy ? "rowspan" : undefined}
      groupRowsBy={groupRowsBy}
      rowClassName={(row) =>
        groupStarts.has(row as TableRow) ? "parts-table-groupstart" : ""
      }
    >
      {columns.map((col) => (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          bodyClassName={col.rowHeader ? "parts-table-rowhead" : undefined}
        />
      ))}
    </DataTable>
  );

  // Without a caption or number the table renders bare, exactly as on the
  // Parts page.
  if (caption === undefined && numberId === undefined) return table;

  return (
    <figure
      className={`parts-table-figure${numberId ? " numtab" : ""}`}
      data-tab={numberId}
    >
      {table}
      {caption !== undefined && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
