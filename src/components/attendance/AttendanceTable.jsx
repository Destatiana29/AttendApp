import EmptyState from '../ui/EmptyState';

/**
 * AttendanceTable — generic, column-configurable data table.
 *
 * Used on PersonalPage (attendance history rows) and StudentsPage
 * (per-student summary rows) via different `columns` definitions.
 *
 * Column definition shape:
 *   { header: string, render: (record) => ReactNode, className?: string }
 *
 * @param {{
 *   rows: Object[],
 *   columns: { header: string, render: (row: Object) => React.ReactNode, className?: string }[],
 *   emptyTitle?: string,
 *   emptyMessage?: string,
 *   keyExtractor?: (row: Object) => string|number,
 * }} props
 */
export default function AttendanceTable({
  rows,
  columns,
  emptyTitle = 'Tidak ada data',
  emptyMessage = 'Tidak ada data yang cocok dengan filter yang dipilih.',
  keyExtractor = (row) => row.id,
}) {
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, rowIdx) => (
            <tr
              key={keyExtractor(row)}
              className={`transition-colors hover:bg-slate-50 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
