/**
 * Button — reusable button with variant and size presets.
 * Primary = dark zinc, not electric blue.
 */

const VARIANTS = {
  primary:   'bg-zinc-900 hover:bg-zinc-700 text-white shadow-sm hover:shadow-md disabled:bg-zinc-400',
  secondary: 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 shadow-sm',
  danger:    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:bg-rose-300',
  ghost:     'bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-900',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
