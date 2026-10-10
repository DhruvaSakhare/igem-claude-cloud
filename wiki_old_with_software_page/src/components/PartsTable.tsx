import "./PartsTable.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type Part = {
  id: React.ReactNode;
  name: React.ReactNode;
  type: string;
  sizeBp: number;
  status: string;
};

type TableProps = {
  data: Part[];
};

export default function PartsTable({ data }: TableProps) {
  return (
    <DataTable value={data} className="parts-table">
      <Column field="id" header="BioBrick ID" />
      <Column field="name" header="Name" />
      <Column field="description" header="Description" />
      <Column field="type" header="Type" />
      <Column field="sizeBp" header="Size (bp)" />
      <Column field="status" header="Status" />
    </DataTable>
  );
}