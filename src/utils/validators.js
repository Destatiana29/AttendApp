/**
 * validators.js
 *
 * Pure functions to validate attendance records.
 * Invalid records are filtered out before stats calculation and display.
 */

/** Accepted status values — anything else is considered invalid. */
const VALID_STATUSES = ['hadir', 'izin', 'sakit', 'alpha'];

/**
 * Strict YYYY-MM-DD date pattern.
 * Does NOT allow slashes, dots, or other separators.
 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Check whether a single attendance record is structurally valid.
 *
 * A record is valid if:
 * 1. It is a non-null object.
 * 2. `date` matches YYYY-MM-DD and parses as a real calendar date.
 * 3. `status` is one of the four accepted values.
 *
 * @param {any} record
 * @returns {boolean}
 */
export function isValidRecord(record) {
  if (!record || typeof record !== 'object') return false;

  // Validate date format
  if (typeof record.date !== 'string') return false;
  if (!DATE_REGEX.test(record.date)) return false;

  // Validate date is a real calendar date (e.g. not 2024-02-30)
  const parsed = new Date(record.date);
  if (isNaN(parsed.getTime())) return false;

  // Validate status
  if (!VALID_STATUSES.includes(record.status)) return false;

  return true;
}

/**
 * Partition a record array into valid and invalid subsets.
 *
 * @param {Object[]} records
 * @returns {{ validRecords: Object[], invalidCount: number }}
 */
export function partitionRecords(records) {
  const validRecords = [];
  let invalidCount = 0;

  for (const record of records) {
    if (isValidRecord(record)) {
      validRecords.push(record);
    } else {
      invalidCount++;
    }
  }

  return { validRecords, invalidCount };
}
