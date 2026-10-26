/**
 * StatsCard — displays a single attendance statistic.
 *
 * ACCENT_MAP uses explicit static class names so Tailwind can detect them.
 * Palette: zinc (neutral), emerald (hadir), sky (izin), amber (sakit), rose (alpha)
 */

const ACCENT_MAP = {
  'bg-zinc-600':    { border: 'bg-zinc-500',    bubble: 'bg-zinc-100',    iconText: 'text-zinc-600'    },
  'bg-emerald-600': { border: 'bg-emerald-500', bubble: 'bg-emerald-50',  iconText: 'text-emerald-600' },
  'bg-sky-600':     { border: 'bg-sky-500',     bubble: 'bg-sky-50',      iconText: 'text-sky-600'     },
  'bg-amber-600':   { border: 'bg-amber-500',   bubble: 'bg-amber-50',    iconText: 'text-amber-600'   },
  'bg-rose-600':    { border: 'bg-rose-500',    bubble: 'bg-rose-50',     iconText: 'text-rose-600'    },
};

export default function StatsCard({ title, value, subtitle, accentClass = 'bg-zinc-600', icon }) {
  const accent = ACCENT_MAP[accentClass] ?? ACCENT_MAP['bg-zinc-600'];

  return (
    <div className="relative bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex items-start gap-3 overflow-hidden hover:shadow-md transition-shadow duration-200">
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
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 leading-none">{title}</p>
        <p className="text-2xl font-bold text-stone-900 leading-none tabular-nums">{value}</p>
        {subtitle && <p className="text-[11px] text-stone-400 mt-1.5 leading-none">{subtitle}</p>}
      </div>
    </div>
  );
}
