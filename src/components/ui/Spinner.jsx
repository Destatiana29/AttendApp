/**
 * Spinner — centered full-area loading indicator.
 * @param {{ size?: 'sm'|'md'|'lg', label?: string }} props
 */
export default function Spinner({ size = 'md', label = 'Memuat data…' }) {
  const sizeClass = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-label={label}>
      <div className={`${sizeClass} border-blue-500 border-t-transparent rounded-full animate-spin`} />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
