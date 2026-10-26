/**
 * Button — reusable button with variant and size presets.
 * Variants: primary | secondary | danger | ghost
 */

const VARIANTS = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md disabled:bg-blue-300',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:bg-red-300',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'danger'|'ghost',
 *   size?: 'sm'|'md'|'lg',
 *   loading?: boolean,
 *   children: React.ReactNode,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
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
