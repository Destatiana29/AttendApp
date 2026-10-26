import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllAttendanceRecords } from '../data/attendanceGenerator';
import { partitionRecords } from '../utils/validators';
import { getPersonStats } from '../utils/attendanceStats';
import { applyRecordFilters, DEFAULT_FILTERS } from '../utils/attendanceFilter';

import StatsCard from '../components/attendance/StatsCard';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceFilter from '../components/attendance/AttendanceFilter';
import StatusBadge from '../components/ui/StatusBadge';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format 'YYYY-MM-DD' → 'Senin, 21 Okt 2024' (Indonesian locale) */
function formatDisplayDate(dateStr) {
  // Append T00:00:00 to avoid UTC-offset shift on date-only strings
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Stats card definitions ───────────────────────────────────────────────────

function buildStatsCards(stats) {
  return [
    {
      title: 'Total Hari',
      value: stats.total,
      subtitle: 'Hari kerja dalam rentang filter',
      accentClass: 'bg-slate-400',
      icon: '📅',
    },
    {
      title: 'Hadir',
      value: stats.hadir,
      subtitle: `${stats.percentage}% kehadiran`,
      accentClass: 'bg-green-500',
      icon: '✅',
    },
    {
      title: 'Izin',
      value: stats.izin,
      subtitle: stats.total > 0 ? `${((stats.izin / stats.total) * 100).toFixed(1)}%` : '0.0%',
      accentClass: 'bg-blue-500',
      icon: '📝',
    },
    {
      title: 'Sakit',
      value: stats.sakit,
      subtitle: stats.total > 0 ? `${((stats.sakit / stats.total) * 100).toFixed(1)}%` : '0.0%',
      accentClass: 'bg-yellow-500',
      icon: '🤒',
    },
    {
      title: 'Alpha',
      value: stats.alpha,
      subtitle: stats.total > 0 ? `${((stats.alpha / stats.total) * 100).toFixed(1)}%` : '0.0%',
      accentClass: 'bg-red-500',
      icon: '⚠️',
    },
    {
      title: 'Persentase Kehadiran',
      value: `${stats.percentage}%`,
      subtitle: `${stats.hadir} hadir dari ${stats.total} hari`,
      accentClass: stats.percentage >= 80 ? 'bg-green-500' : stats.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500',
      icon: '📊',
    },
  ];
}

// ─── Table column definitions ─────────────────────────────────────────────────

const PERSONAL_COLUMNS = [
  {
    header: 'Tanggal',
    render: (row) => (
      <span className="text-slate-700 font-medium whitespace-nowrap">
        {formatDisplayDate(row.date)}
      </span>
    ),
  },
  {
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'Jam Masuk',
    render: (row) => (
      <span className={row.checkIn ? 'font-mono text-slate-700' : 'text-slate-300'}>
        {row.checkIn ?? '—'}
      </span>
    ),
  },
  {
    header: 'Jam Pulang',
    render: (row) => (
      <span className={row.checkOut ? 'font-mono text-slate-700' : 'text-slate-300'}>
        {row.checkOut ?? '—'}
      </span>
    ),
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PersonalPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── Data pipeline (all synchronous — local data) ──────────────────────────

  // 1. Get all records for the logged-in instructor
  const rawRecords = useMemo(
    () => getAllAttendanceRecords().filter((r) => r.personId === user.id),
    [user.id]
  );

  // 2. Partition valid / invalid
  const { validRecords, invalidCount } = useMemo(
    () => partitionRecords(rawRecords),
    [rawRecords]
  );

  // 3. Apply filters (affects both table AND stats)
  const filteredRecords = useMemo(
    () => applyRecordFilters(validRecords, filters),
    [validRecords, filters]
  );

  // 4. Sort newest first for display
  const sortedRecords = useMemo(
    () => [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredRecords]
  );

  // 5. Compute stats from filtered data
  const stats = useMemo(() => getPersonStats(filteredRecords), [filteredRecords]);

  const statsCards = useMemo(() => buildStatsCards(stats), [stats]);

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Absensi Saya</h1>
          <p className="text-slate-500 text-sm mt-1">
            Riwayat kehadiran{' '}
            <span className="font-medium text-slate-700">
              {user.firstName} {user.lastName}
            </span>{' '}
            — 60 hari kerja terakhir
          </p>
        </div>

        {/* Instructor badge */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <img
            src={user.image}
            alt={user.firstName}
            className="w-7 h-7 rounded-full object-cover border border-white"
          />
          <div>
            <p className="text-xs font-semibold text-blue-800 leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-blue-500 mt-0.5 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Invalid data warning */}
      {invalidCount > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>{invalidCount} data tidak valid</strong> diabaikan (tanggal atau status tidak dikenal)
          </span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Filter */}
      <AttendanceFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        showNameSearch={false}
      />

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Menampilkan{' '}
          <span className="font-semibold text-slate-800">{sortedRecords.length}</span>
          {' '}dari{' '}
          <span className="font-semibold text-slate-800">{validRecords.length}</span>
          {' '}record
        </p>
      </div>

      {/* Attendance table */}
      <AttendanceTable
        rows={sortedRecords}
        columns={PERSONAL_COLUMNS}
        keyExtractor={(row) => row.id}
        emptyTitle="Tidak ada data absensi"
        emptyMessage="Tidak ada record yang cocok dengan filter yang aktif. Coba reset filter."
      />
    </div>
  );
}
