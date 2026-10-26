/**
 * attendanceStats.js
 *
 * Pure functions for computing attendance statistics.
 * Components call these with pre-filtered, pre-validated records — no side effects.
 */

// ─── CORE COUNTERS ────────────────────────────────────────────────────────────

/**
 * Count records grouped by status.
 *
 * @param {Object[]} records - Must be valid records (already passed isValidRecord).
 * @returns {{ hadir: number, izin: number, sakit: number, alpha: number, total: number }}
 */
export function countByStatus(records) {
  const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

  for (const record of records) {
    if (counts[record.status] !== undefined) {
      counts[record.status]++;
    }
  }

  return { ...counts, total: records.length };
}

// ─── PERCENTAGE ───────────────────────────────────────────────────────────────

/**
 * Calculate attendance percentage: hadir / total × 100.
 * Returns '0.0' when total is 0 to prevent NaN in the UI.
 *
 * @param {number} hadir
 * @param {number} total
 * @returns {string} e.g. '91.7'
 */
export function calcPercentage(hadir, total) {
  if (!total || total === 0) return '0.0';
  return ((hadir / total) * 100).toFixed(1);
}

// ─── SINGLE PERSON ────────────────────────────────────────────────────────────

/**
 * Compute full stats for a single person's records.
 *
 * @param {Object[]} records - Valid records belonging to one personId.
 * @returns {{ hadir, izin, sakit, alpha, total, percentage: string }}
 */
export function getPersonStats(records) {
  const counts = countByStatus(records);
  return {
    ...counts,
    percentage: calcPercentage(counts.hadir, counts.total),
  };
}

// ─── STUDENTS (multi-person) ──────────────────────────────────────────────────

/**
 * Compute per-student stats, merging user info with attendance counts.
 *
 * @param {Object[]} records  - Valid attendance records for all students.
 * @param {Object[]} students - User objects [{ id, firstName, lastName, ... }].
 * @returns {Object[]} Merged array: { ...student, hadir, izin, sakit, alpha, total, percentage }
 */
export function getStudentsStats(records, students) {
  return students.map((student) => {
    const studentRecords = records.filter((r) => r.personId === student.id);
    const stats = getPersonStats(studentRecords);
    return { ...student, ...stats };
  });
}

/**
 * Compute aggregate (totals across all students).
 *
 * @param {Object[]} studentStats - Output of getStudentsStats.
 * @returns {{ hadir, izin, sakit, alpha, total, percentage: string }}
 */
export function getAggregateStats(studentStats) {
  const totals = studentStats.reduce(
    (acc, s) => ({
      hadir: acc.hadir + s.hadir,
      izin: acc.izin + s.izin,
      sakit: acc.sakit + s.sakit,
      alpha: acc.alpha + s.alpha,
      total: acc.total + s.total,
    }),
    { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 }
  );

  return {
    ...totals,
    percentage: calcPercentage(totals.hadir, totals.total),
  };
}
