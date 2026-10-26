/**
 * attendanceFilter.js
 *
 * Pure functions for filtering attendance data.
 * All functions return new arrays — no mutation of input.
 * Components pair these with attendanceStats to keep UI and logic separate.
 */

// ─── RECORD FILTERS ───────────────────────────────────────────────────────────

/**
 * Filter records to a date range (inclusive on both ends).
 * Pass null/undefined for either bound to leave it open.
 *
 * @param {Object[]} records
 * @param {string|null} startDate - 'YYYY-MM-DD'
 * @param {string|null} endDate   - 'YYYY-MM-DD'
 * @returns {Object[]}
 */
export function filterByDateRange(records, startDate, endDate) {
  return records.filter((r) => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });
}

/**
 * Filter records by a single status value.
 * Pass null/empty string to return all records unfiltered.
 *
 * @param {Object[]} records
 * @param {string|null} status - 'hadir' | 'izin' | 'sakit' | 'alpha' | null
 * @returns {Object[]}
 */
export function filterByStatus(records, status) {
  if (!status) return records;
  return records.filter((r) => r.status === status);
}

/**
 * Apply multiple record-level filters in one call.
 *
 * @param {Object[]} records
 * @param {{ startDate?: string, endDate?: string, status?: string }} filters
 * @returns {Object[]}
 */
export function applyRecordFilters(records, { startDate, endDate, status } = {}) {
  let result = records;
  result = filterByDateRange(result, startDate ?? null, endDate ?? null);
  result = filterByStatus(result, status ?? null);
  return result;
}

// ─── STUDENT LIST FILTER ──────────────────────────────────────────────────────

/**
 * Filter a student stats array by name (case-insensitive, partial match).
 * Matches against firstName + lastName combined.
 *
 * @param {Object[]} studentStats - Array with { firstName, lastName, ... }
 * @param {string}   query
 * @returns {Object[]}
 */
export function filterByName(studentStats, query) {
  if (!query || !query.trim()) return studentStats;
  const q = query.trim().toLowerCase();
  return studentStats.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
  );
}

/**
 * Empty / default filter state — use as initial useState value in components.
 */
export const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  status: '',
  name: '',
};
