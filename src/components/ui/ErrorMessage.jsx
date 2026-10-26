import Button from './Button';

/**
 * ErrorMessage — displays an API/runtime error with a "Coba lagi" button.
 *
 * @param {{ message: string, onRetry?: () => void }} props
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      {/* Message */}
      <div className="text-center max-w-sm">
        <p className="font-semibold text-slate-800 mb-1">Terjadi Kesalahan</p>
        <p className="text-sm text-slate-500">{message}</p>
      </div>

      {/* Retry button */}
      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Coba lagi
        </Button>
      )}
    </div>
  );
}
