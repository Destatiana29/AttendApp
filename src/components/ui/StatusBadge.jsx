/**
 * StatusBadge — colored pill badge for attendance status.
 * hadir=green | izin=blue | sakit=yellow | alpha=red
 */

const STATUS_CONFIG = {
  hadir:  { label: 'Hadir',  bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  izin:   { label: 'Izin',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  sakit:  { label: 'Sakit',  bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  alpha:  { label: 'Alpha',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
};

/**
 * @param {{ status: 'hadir'|'izin'|'sakit'|'alpha', size?: 'sm'|'md' }} props
 */
export default function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status];

  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
        {status ?? '—'}
      </span>
    );
  }

  const sizeClass = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
