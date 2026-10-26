import Button from '../ui/Button';
import { DEFAULT_FILTERS } from '../../utils/attendanceFilter';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'hadir', label: 'Hadir' },
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'alpha', label: 'Alpha' },
];

/**
 * AttendanceFilter — filter UI for attendance pages.
 * Used on both PersonalPage and StudentsPage.
 *
 * @param {{
 *   filters: { startDate: string, endDate: string, status: string, name: string },
 *   onChange: (filters: object) => void,
 *   onReset: () => void,
 *   showNameSearch?: boolean,  // show name search field (StudentsPage only)
 * }} props
 */
export default function AttendanceFilter({ filters, onChange, onReset, showNameSearch = false }) {
  const isActive =
    filters.startDate || filters.endDate || filters.status || filters.name;

  const set = (key, value) => onChange({ ...filters, [key]: value });

  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';
  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 focus:bg-white transition-all duration-150';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Start date */}
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="filter-start" className={labelClass}>Dari Tanggal</label>
          <input
            id="filter-start"
            type="date"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(e) => set('startDate', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* End date */}
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="filter-end" className={labelClass}>Sampai Tanggal</label>
          <input
            id="filter-end"
            type="date"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(e) => set('endDate', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Status */}
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="filter-status" className={labelClass}>Status</label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => set('status', e.target.value)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Name search — StudentsPage only */}
        {showNameSearch && (
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="filter-name" className={labelClass}>Cari Nama Murid</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="filter-name"
                type="text"
                placeholder="Ketik nama murid…"
                value={filters.name}
                onChange={(e) => set('name', e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        )}

        {/* Reset button */}
        <div className="shrink-0 self-end">
          <Button
            id="btn-reset-filter"
            variant={isActive ? 'danger' : 'ghost'}
            size="md"
            onClick={onReset}
            disabled={!isActive}
            title="Reset semua filter"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </Button>
        </div>
      </div>

      {/* Active filter indicator */}
      {isActive && (
        <p className="mt-3 text-xs text-stone-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
          Filter aktif — statistik dan tabel dihitung ulang
        </p>
      )}
    </div>
  );
}
