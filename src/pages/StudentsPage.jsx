import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../services/api';
import { getAllAttendanceRecords } from '../data/attendanceGenerator';
import { partitionRecords } from '../utils/validators';
import { getStudentsStats, getAggregateStats } from '../utils/attendanceStats';
import { applyRecordFilters, filterByName, DEFAULT_FILTERS } from '../utils/attendanceFilter';

import StatsCard from '../components/attendance/StatsCard';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceFilter from '../components/attendance/AttendanceFilter';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';

// ─── Table column definitions ─────────────────────────────────────────────────

/** Mini horizontal bar that visualizes a percentage value */
function PercentageBar({ value }) {
  const num = parseFloat(value);
  const color = num >= 80 ? 'bg-green-500' : num >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min(num, 100)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-11 text-right tabular-nums">
        {value}%
      </span>
    </div>
  );
}

const STUDENT_COLUMNS = [
  {
    header: 'Nama Murid',
    render: (row) => (
      <div className="flex items-center gap-2.5 min-w-[160px]">
        <img
          src={row.image}
          alt={row.firstName}
          className="w-8 h-8 rounded-full object-cover border-2 border-slate-100 shrink-0"
        />
        <div>
          <p className="font-medium text-slate-800 leading-none text-sm">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: 'Hadir',
    className: 'text-right',
    render: (row) => <span className="font-semibold text-green-600 tabular-nums">{row.hadir}</span>,
  },
  {
    header: 'Izin',
    className: 'text-right',
    render: (row) => <span className="font-semibold text-blue-600 tabular-nums">{row.izin}</span>,
  },
  {
    header: 'Sakit',
    className: 'text-right',
    render: (row) => <span className="font-semibold text-yellow-600 tabular-nums">{row.sakit}</span>,
  },
  {
    header: 'Alpha',
    className: 'text-right',
    render: (row) => <span className="font-semibold text-red-600 tabular-nums">{row.alpha}</span>,
  },
  {
    header: 'Total',
    className: 'text-right',
    render: (row) => <span className="text-slate-600 tabular-nums">{row.total}</span>,
  },
  {
    header: '% Kehadiran',
    render: (row) => <PercentageBar value={row.percentage} />,
  },
];

// ─── Aggregate stats cards ────────────────────────────────────────────────────

function buildAggregateCards(agg, studentCount) {
  return [
    { title: 'Total Murid',   value: studentCount,     subtitle: 'Terdaftar',             accentClass: 'bg-slate-400', icon: '👥' },
    { title: 'Total Hari',    value: agg.total,        subtitle: 'Record valid',           accentClass: 'bg-slate-400', icon: '📅' },
    { title: 'Hadir',         value: agg.hadir,        subtitle: `${agg.percentage}% kehadiran`, accentClass: 'bg-green-500', icon: '✅' },
    { title: 'Izin',          value: agg.izin,         subtitle: agg.total > 0 ? `${((agg.izin/agg.total)*100).toFixed(1)}%` : '0.0%', accentClass: 'bg-blue-500', icon: '📝' },
    { title: 'Sakit',         value: agg.sakit,        subtitle: agg.total > 0 ? `${((agg.sakit/agg.total)*100).toFixed(1)}%` : '0.0%', accentClass: 'bg-yellow-500', icon: '🤒' },
    { title: 'Alpha',         value: agg.alpha,        subtitle: agg.total > 0 ? `${((agg.alpha/agg.total)*100).toFixed(1)}%` : '0.0%', accentClass: 'bg-red-500', icon: '⚠️' },
    {
      title: '% Kehadiran Keseluruhan',
      value: `${agg.percentage}%`,
      subtitle: `${agg.hadir} hadir dari ${agg.total}`,
      accentClass: parseFloat(agg.percentage) >= 80 ? 'bg-green-500' : parseFloat(agg.percentage) >= 60 ? 'bg-yellow-500' : 'bg-red-500',
      icon: '📊',
    },
  ];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { user, allUsers, setAllUsers, isInstructor } = useAuth();

  // Users state — prefer context cache to avoid re-fetch
  const [usersData, setUsersData] = useState(allUsers);
  const [loading, setLoading] = useState(!allUsers);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Fetch users only if not already cached in AuthContext (e.g. after page refresh)
  useEffect(() => {
    if (allUsers) return;

    let cancelled = false;
    setLoading(true);
    fetchUsers()
      .then((users) => {
        if (!cancelled) {
          setUsersData(users);
          setAllUsers(users);
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Student list: role='user', exclude logged-in instructor, max 20 ─────────
  const students = useMemo(() => {
    if (!usersData) return [];
    return usersData
      .filter((u) => u.role === 'user' && u.id !== user.id)
      .slice(0, 20);
  }, [usersData, user.id]);

  // ── Attendance data pipeline ──────────────────────────────────────────────
  const studentIds = useMemo(() => new Set(students.map((s) => s.id)), [students]);

  // Raw records for all students
  const rawRecords = useMemo(
    () => getAllAttendanceRecords().filter((r) => studentIds.has(r.personId)),
    [studentIds]
  );

  // Validate
  const { validRecords, invalidCount } = useMemo(
    () => partitionRecords(rawRecords),
    [rawRecords]
  );

  // Apply date/status filters → changes both stats AND table
  const filteredRecords = useMemo(
    () => applyRecordFilters(validRecords, filters),
    [validRecords, filters]
  );

  // Per-student stats from filtered records
  const studentStats = useMemo(
    () => getStudentsStats(filteredRecords, students),
    [filteredRecords, students]
  );

  // Aggregate stats from ALL filtered records (not affected by name filter)
  const aggregateStats = useMemo(
    () => getAggregateStats(studentStats),
    [studentStats]
  );

  const aggregateCards = useMemo(
    () => buildAggregateCards(aggregateStats, students.length),
    [aggregateStats, students.length]
  );

  // Apply name filter only for table display
  const visibleStudents = useMemo(
    () => filterByName(studentStats, filters.name),
    [studentStats, filters.name]
  );

  // Sort by hadir descending
  const sortedStudents = useMemo(
    () => [...visibleStudents].sort((a, b) => b.hadir - a.hadir),
    [visibleStudents]
  );

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  // ── Loading & error states ────────────────────────────────────────────────
  if (loading) return <Spinner label="Memuat data murid…" size="lg" />;
  if (error)   return <ErrorMessage message={error} onRetry={() => { setError(null); setLoading(true); }} />;

  // ── Role guard: hanya instructor (admin/moderator) yang boleh akses ────────
  if (!isInstructor) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div className="text-center max-w-sm">
          <p className="font-semibold text-slate-800 text-lg mb-2">Akses Dibatasi</p>
          <p className="text-sm text-slate-500">
            Halaman Data Murid hanya dapat diakses oleh <strong>instructor</strong> (admin / moderator).
            Akun Anda terdaftar sebagai <strong>murid</strong>.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Murid</h1>
        <p className="text-slate-500 text-sm mt-1">
          Rekap absensi <span className="font-medium text-slate-700">{students.length} murid</span> — 60 hari kerja terakhir
        </p>
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

      {/* Aggregate stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {aggregateCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Filter */}
      <AttendanceFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        showNameSearch={true}
      />

      {/* Results summary */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">
          Menampilkan{' '}
          <span className="font-semibold text-slate-800">{sortedStudents.length}</span>
          {' '}dari{' '}
          <span className="font-semibold text-slate-800">{students.length}</span>
          {' '}murid
        </p>
        <p className="text-xs text-slate-400">
          Statistik dihitung dari {filteredRecords.length} record (setelah filter tanggal/status)
        </p>
      </div>

      {/* Per-student table */}
      <AttendanceTable
        rows={sortedStudents}
        columns={STUDENT_COLUMNS}
        keyExtractor={(row) => row.id}
        emptyTitle="Tidak ada murid ditemukan"
        emptyMessage="Tidak ada murid yang cocok dengan nama yang dicari."
      />
    </div>
  );
}
