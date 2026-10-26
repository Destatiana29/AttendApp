/**
 * StatsCard — displays a single attendance statistic.
 * Used in rows of cards on PersonalPage and StudentsPage.
 *
 * accentClass controls the left border color AND the icon bubble color.
 * We use an explicit lookup table instead of string manipulation so Tailwind
 * can statically detect all class names during tree-shaking.
 *
 * @param {{
 *   title: string,
 *   value: string|number,
 *   subtitle?: string,
 *   accentClass?: string,
 *   icon?: string,
 * }} props
 */

// Explicit map → Tailwind scanner picks up every class at build time
const ACCENT_MAP = {
  'bg-slate-400':  { border: 'bg-slate-400',  bubble: 'bg-slate-100',  iconText: 'text-slate-500'  },
  'bg-green-500':  { border: 'bg-green-500',  bubble: 'bg-green-50',   iconText: 'text-green-600'  },
  'bg-blue-500':   { border: 'bg-blue-500',   bubble: 'bg-blue-50',    iconText: 'text-blue-600'   },
  'bg-yellow-500': { border: 'bg-yellow-500', bubble: 'bg-yellow-50',  iconText: 'text-yellow-600' },
  'bg-red-500':    { border: 'bg-red-500',    bubble: 'bg-red-50',     iconText: 'text-red-600'    },
};

export default function StatsCard({ title, value, subtitle, accentClass = 'bg-blue-500', icon }) {
  const accent = ACCENT_MAP[accentClass] ?? ACCENT_MAP['bg-blue-500'];

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent.border}`} />

      {/* Icon bubble */}
      {icon && (
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${accent.bubble}`}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 leading-none">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none tabular-nums">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1.5 leading-none">{subtitle}</p>}
      </div>
    </div>
  );
}
