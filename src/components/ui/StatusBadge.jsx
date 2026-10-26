/**
 * StatusBadge — colored pill badge for attendance status.
 * Refined palette: emerald / sky / amber / rose  (not generic green/blue/yellow/red)
 */

const STATUS_CONFIG = {
  hadir:  { label: 'Hadir',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  izin:   { label: 'Izin',   bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500',     border: 'border-sky-200'     },
  sakit:  { label: 'Sakit',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200'   },
  alpha:  { label: 'Alpha',  bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500',    border: 'border-rose-200'    },
};

/**
 * @param {{ status: 'hadir'|'izin'|'sakit'|'alpha', size?: 'sm'|'md' }} props
 */
export default function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status];

  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-xs font-medium border border-stone-200">
        {status ?? '—'}
      </span>
    );
  }

  const sizeClass = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
