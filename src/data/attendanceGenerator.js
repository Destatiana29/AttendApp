/**
 * attendanceGenerator.js
 *
 * Generates deterministic fake attendance data using the mulberry32 seeded PRNG.
 * - Covers the last 60 business days (Mon–Fri), skipping weekends.
 * - Status weights: ~85% hadir, 5% izin, 5% sakit, 5% alpha.
 * - checkIn/checkOut are null for non-hadir statuses.
 * - Intentionally includes 3 invalid records to verify data-validation logic.
 * - Data is cached in a module-level singleton so generation runs only once.
 *
 * User IDs 1–30 match DummyJSON GET /users?limit=30 response.
 */

// ─── PRNG ────────────────────────────────────────────────────────────────────

/** mulberry32 — fast, high-quality 32-bit seeded PRNG (returns 0-1 float) */
function mulberry32(seed) {
  return function () {
    // eslint-disable-next-line no-param-reassign
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Format a Date object to 'YYYY-MM-DD'. */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Collect the last `count` business days (Mon–Fri) in ascending order.
 * Walking backwards from today so the list is always up-to-date.
 */
function getLastBusinessDays(count) {
  const days = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.length < count) {
    const dow = cursor.getDay(); // 0 = Sun, 6 = Sat
    if (dow !== 0 && dow !== 6) {
      days.unshift(formatDate(new Date(cursor)));
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return days; // chronological (oldest → newest)
}

/** Choose an attendance status based on weighted probability. */
function pickStatus(rng) {
  const r = rng();
  if (r < 0.85) return 'hadir';
  if (r < 0.90) return 'izin';
  if (r < 0.95) return 'sakit';
  return 'alpha';
}

/**
 * Format an HH:mm string from a base hour + random spread.
 * Always consumes exactly one rng() call so PRNG state stays deterministic.
 */
function randomTime(rng, baseHour, spreadHours) {
  const raw = rng(); // single rng call
  const totalMinutes = Math.floor(raw * (spreadHours * 60));
  const hour = baseHour + Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// ─── GENERATOR ────────────────────────────────────────────────────────────────

// Fixed seed base — keeps data stable between runs on the same day.
const BASE_SEED = 20240101;

// Person IDs to generate attendance for (mirrors DummyJSON /users?limit=30).
const PERSON_IDS = Array.from({ length: 30 }, (_, i) => i + 1);

/**
 * Build the full attendance record set for all persons.
 * Each person gets a unique PRNG stream (BASE_SEED + personId * 997).
 *
 * @returns {Object[]} Flat array of attendance records including 3 invalid ones.
 */
function generateAttendance() {
  const days = getLastBusinessDays(60);
  const records = [];
  let id = 1;

  for (const personId of PERSON_IDS) {
    // Unique seed per person — prime multiplier avoids seed collisions
    const rng = mulberry32(BASE_SEED + personId * 997);

    for (const date of days) {
      const status = pickStatus(rng);

      // Always consume 2 rng calls (for checkIn & checkOut) regardless of status,
      // ensuring each day advances the PRNG by the same amount → full determinism.
      const checkInRaw = randomTime(rng, 7, 2);   // 07:00 – 08:59
      const checkOutRaw = randomTime(rng, 15, 3); // 15:00 – 17:59

      const isPresent = status === 'hadir';

      records.push({
        id: id++,
        personId,
        date,
        status,
        checkIn: isPresent ? checkInRaw : null,
        checkOut: isPresent ? checkOutRaw : null,
      });
    }
  }

  // ── Intentionally invalid records (for testing isValidRecord) ──────────────
  // #1 — date is not YYYY-MM-DD format
  records.push({ id: id++, personId: 1, date: 'invalid-date', status: 'hadir', checkIn: '08:00', checkOut: '17:00' });
  // #2 — date uses slashes instead of hyphens
  records.push({ id: id++, personId: 2, date: '2024/01/15', status: 'hadir', checkIn: '08:00', checkOut: '17:00' });
  // #3 — unknown status value
  records.push({ id: id++, personId: 3, date: days[0], status: 'unknown_status', checkIn: null, checkOut: null });

  return records;
}

// ─── SINGLETON CACHE ──────────────────────────────────────────────────────────

/** Module-level cache — generated once per app session. */
let _allRecords = null;

/**
 * Return all attendance records (valid + invalid).
 * Subsequent calls return the cached result without re-generating.
 */
export function getAllAttendanceRecords() {
  if (!_allRecords) {
    _allRecords = generateAttendance();
  }
  return _allRecords;
}

/**
 * Convenience: return records for a specific person ID.
 * @param {number} personId
 */
export function getAttendanceByPerson(personId) {
  return getAllAttendanceRecords().filter((r) => r.personId === personId);
}

/** Expose PERSON_IDS for components that need the full ID list. */
export { PERSON_IDS };
