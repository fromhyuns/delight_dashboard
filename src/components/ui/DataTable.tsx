import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
};

export function DataTable<T>({ columns, rows, getRowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`border-b border-line px-3 py-2 font-semibold ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-stone-50/70">
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-2.5 align-middle text-ink ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
