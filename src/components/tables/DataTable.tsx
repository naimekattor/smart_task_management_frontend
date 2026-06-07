import React, { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  renderRow: (item: T, idx: number) => ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  renderRow,
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/75 dark:border-zinc-800 dark:bg-zinc-950">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 ${
                    col.className || ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-violet-600"></div>
                    <span>Loading data records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500"
                >
                  No records found in this table.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => renderRow(item, idx))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
