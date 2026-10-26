/**
 * StatsCard — displays a single attendance statistic.
 * Used in rows of 3–6 cards on PersonalPage and StudentsPage.
 *
 * @param {{
 *   title: string,
 *   value: string|number,
 *   subtitle?: string,
 *   accentClass?: string,   // Tailwind bg class for the left accent bar
 *   icon?: React.ReactNode,
 * }} props
 */
export default function StatsCard({ title, value, subtitle, accentClass = 'bg-blue-500', icon }) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accentClass}`} />

      {/* Icon bubble */}
      {icon && (
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-opacity-10 ${accentClass.replace('bg-', 'bg-').replace('-500', '-50')}`}>
          <span className={`text-lg ${accentClass.replace('bg-', 'text-')}`}>{icon}</span>
        </div>
      )}

      {/* Content */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
