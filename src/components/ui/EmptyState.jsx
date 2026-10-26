/**
 * EmptyState — displayed when a data list is empty (after filter or no records).
 * @param {{ title?: string, message?: string, icon?: React.ReactNode }} props
 */
export default function EmptyState({
  title = 'Tidak ada data',
  message = 'Tidak ada data yang cocok dengan filter saat ini.',
  icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        {icon ?? (
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      <div className="text-center max-w-xs">
        <p className="font-semibold text-slate-700 mb-1">{title}</p>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}
