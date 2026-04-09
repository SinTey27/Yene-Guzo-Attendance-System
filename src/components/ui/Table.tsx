import { ReactNode } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key.toString()}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key.toString()}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
