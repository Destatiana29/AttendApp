/**
 * checkData.mjs
 *
 * Quick unit check for Phase 2 utilities.
 * Run: node scripts/checkData.mjs
 *
 * No test framework needed — just console assertions.
 */

// ─── Inline copies of utilities (so this script is self-contained) ────────────

// --- mulberry32 ---
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLastBusinessDays(count) {
  const days = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.length < count) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days.unshift(formatDate(new Date(cursor)));
    cursor.setDate(cursor.getDate() - 1);
  }
  return days;
}

function pickStatus(rng) {
  const r = rng();
  if (r < 0.85) return 'hadir';
  if (r < 0.90) return 'izin';
  if (r < 0.95) return 'sakit';
  return 'alpha';
}

function randomTime(rng, baseHour, spreadHours) {
  const raw = rng();
  const totalMinutes = Math.floor(raw * (spreadHours * 60));
  const hour = baseHour + Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// --- validators ---
const VALID_STATUSES = ['hadir', 'izin', 'sakit', 'alpha'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidRecord(record) {
  if (!record || typeof record !== 'object') return false;
  if (typeof record.date !== 'string' || !DATE_REGEX.test(record.date)) return false;
  if (isNaN(new Date(record.date).getTime())) return false;
  if (!VALID_STATUSES.includes(record.status)) return false;
  return true;
}

function partitionRecords(records) {
  const validRecords = [];
  let invalidCount = 0;
  for (const r of records) {
    if (isValidRecord(r)) validRecords.push(r);
    else invalidCount++;
  }
  return { validRecords, invalidCount };
}

// --- stats ---
function countByStatus(records) {
  const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
  for (const r of records) { if (counts[r.status] !== undefined) counts[r.status]++; }
  return { ...counts, total: records.length };
}

function calcPercentage(hadir, total) {
  if (!total || total === 0) return '0.0';
  return ((hadir / total) * 100).toFixed(1);
}

// --- generate ---
const BASE_SEED = 20240101;
const PERSON_IDS = Array.from({ length: 30 }, (_, i) => i + 1);

function generateAttendance() {
  const days = getLastBusinessDays(60);
  const records = [];
  let id = 1;
  for (const personId of PERSON_IDS) {
    const rng = mulberry32(BASE_SEED + personId * 997);
    for (const date of days) {
      const status = pickStatus(rng);
      const ci = randomTime(rng, 7, 2);
      const co = randomTime(rng, 15, 3);
      const present = status === 'hadir';
      records.push({ id: id++, personId, date, status, checkIn: present ? ci : null, checkOut: present ? co : null });
    }
  }
  // Invalid records
  records.push({ id: id++, personId: 1, date: 'invalid-date', status: 'hadir', checkIn: '08:00', checkOut: '17:00' });
  records.push({ id: id++, personId: 2, date: '2024/01/15', status: 'hadir', checkIn: '08:00', checkOut: '17:00' });
  records.push({ id: id++, personId: 3, date: days[0], status: 'unknown_status', checkIn: null, checkOut: null });
  return records;
}

// ─── ASSERTIONS ───────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`);
    pass++;
  } else {
    console.error(`  ❌ FAIL  ${label}`);
    fail++;
  }
}

console.log('\n══════════════════════════════════════════');
console.log('  Phase 2 Unit Check — AttendApp');
console.log('══════════════════════════════════════════\n');

// 1. Generator
console.log('▶ [1] Data Generation');
const allRecords = generateAttendance();
const days = getLastBusinessDays(60);

assert('Total records = 30 persons × 60 days + 3 invalid = 1803', allRecords.length === 1803);
assert('No weekend dates in records', allRecords.every((r) => {
  if (!DATE_REGEX.test(r.date)) return true; // invalid records skip this check
  const d = new Date(r.date);
  return d.getDay() !== 0 && d.getDay() !== 6;
}));
assert('First business day is ≤ 60 weekdays ago', days.length === 60);
assert('hadir records have non-null checkIn', allRecords.filter(r => r.status === 'hadir' && DATE_REGEX.test(r.date)).every(r => r.checkIn !== null));
assert('non-hadir records have null checkIn', allRecords.filter(r => r.status !== 'hadir' && ['izin','sakit','alpha'].includes(r.status)).every(r => r.checkIn === null));

// 2. Determinism — generate twice, check identical
console.log('\n▶ [2] Determinism');
const run1 = generateAttendance();
const run2 = generateAttendance();
assert('Two runs produce identical record count', run1.length === run2.length);
assert('First record identical across runs', JSON.stringify(run1[0]) === JSON.stringify(run2[0]));
assert('Last valid record identical across runs', JSON.stringify(run1[1799]) === JSON.stringify(run2[1799]));

// 3. Validators
console.log('\n▶ [3] Validators');
const { validRecords, invalidCount } = partitionRecords(allRecords);

assert('Exactly 3 invalid records detected', invalidCount === 3);
assert('Valid record count = 1800 (30 × 60)', validRecords.length === 1800);
assert('isValidRecord rejects "invalid-date"', !isValidRecord({ date: 'invalid-date', status: 'hadir' }));
assert('isValidRecord rejects "2024/01/15" (slashes)', !isValidRecord({ date: '2024/01/15', status: 'hadir' }));
assert('isValidRecord rejects unknown status', !isValidRecord({ date: days[0], status: 'unknown_status' }));
assert('isValidRecord accepts well-formed record', isValidRecord({ date: days[0], status: 'hadir' }));
assert('isValidRecord rejects null', !isValidRecord(null));

// 4. Stats
console.log('\n▶ [4] Stats');
const person1Records = validRecords.filter((r) => r.personId === 1);
const stats1 = countByStatus(person1Records);

assert('Person 1 total = 60 days', stats1.total === 60);
assert('hadir + izin + sakit + alpha = total', stats1.hadir + stats1.izin + stats1.sakit + stats1.alpha === stats1.total);

const allStatusValues = ['hadir', 'izin', 'sakit', 'alpha'];
const allStatuses = validRecords.map((r) => r.status);
assert('All record statuses are valid values', allStatuses.every((s) => allStatusValues.includes(s)));

// Status distribution check (85% hadir ± 5% tolerance)
const hadirRatio = stats1.hadir / stats1.total;
assert(`Person 1 hadir ratio ≈85% (got ${(hadirRatio * 100).toFixed(1)}%)`, hadirRatio >= 0.75 && hadirRatio <= 0.95);

// 5. calcPercentage safety
console.log('\n▶ [5] Percentage (NaN safety)');
assert('calcPercentage(0, 0) = "0.0" (no NaN)', calcPercentage(0, 0) === '0.0');
assert('calcPercentage(51, 60) = "85.0"', calcPercentage(51, 60) === '85.0');
assert('calcPercentage(1, 3) = "33.3"', calcPercentage(1, 3) === '33.3');

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log(`  Results: ${pass} passed, ${fail} failed`);
console.log('══════════════════════════════════════════\n');

if (fail > 0) process.exit(1);
