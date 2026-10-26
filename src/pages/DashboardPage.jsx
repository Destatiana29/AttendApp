import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAttendanceRecords } from '../data/attendanceGenerator';
import { partitionRecords } from '../utils/validators';
import { getPersonStats, getStudentsStats, getAggregateStats } from '../utils/attendanceStats';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format today's date in Indonesian locale */
function todayFormatted() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Horizontal progress bar for a status category */
function StatusBar({ label, count, total, colorClass, bgClass }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-12 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 tabular-nums">{count}</span>
    </div>
  );
}

/** Card linking to a page section */
function SummaryCard({ to, title, subtitle, icon, stats, linkLabel, accentFrom, accentTo }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${accentFrom} ${accentTo} p-6 text-white flex flex-col gap-4`}>
      {/* Decorative circle */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-3xl mb-2">{icon}</div>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          <p className="text-sm text-white/75 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Inline mini stats */}
      {stats && (
        <div className="relative z-10 grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
              <p className="text-xl font-bold leading-none">{s.value}</p>
              <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <Link
        to={to}
        className="relative z-10 inline-flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2 self-start"
      >
        {linkLabel}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, allUsers } = useAuth();

  // ── Personal stats (always available — local data) ────────────────────────
  const personalStats = useMemo(() => {
    const records = getAllAttendanceRecords().filter((r) => r.personId === user.id);
    const { validRecords } = partitionRecords(records);
    return getPersonStats(validRecords);
  }, [user.id]);

  // ── Student stats (only if allUsers is cached from login) ─────────────────
  const studentSummary = useMemo(() => {
    if (!allUsers) return null;
    const students = allUsers
      .filter((u) => u.role === 'user' && u.id !== user.id)
      .slice(0, 20);
    if (students.length === 0) return null;

    const studentIds = new Set(students.map((s) => s.id));
    const records = getAllAttendanceRecords().filter((r) => studentIds.has(r.personId));
    const { validRecords } = partitionRecords(records);
    const statsArr = getStudentsStats(validRecords, students);
    const agg = getAggregateStats(statsArr);
    return { count: students.length, agg };
  }, [allUsers, user.id]);

  return (
    <div className="space-y-8">
      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat datang, {user.firstName}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">{todayFormatted()}</p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
          <img
            src={user.image}
            alt={user.firstName}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
          />
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 capitalize">{user.role} · {user.email}</p>
          </div>
        </div>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          to="/personal"
          icon="🧑‍🏫"
          title="Absensi Saya"
          subtitle="Rekap kehadiran pribadi Anda"
          accentFrom="from-blue-600"
          accentTo="to-indigo-700"
          linkLabel="Lihat rincian"
          stats={[
            { value: personalStats.hadir,      label: 'Hadir' },
            { value: `${personalStats.percentage}%`, label: 'Kehadiran' },
            { value: personalStats.izin,       label: 'Izin' },
            { value: personalStats.alpha,      label: 'Alpha' },
          ]}
        />

        <SummaryCard
          to="/students"
          icon="👥"
          title="Data Murid"
          subtitle={
            studentSummary
              ? `${studentSummary.count} murid terdaftar`
              : 'Login ulang untuk melihat data'
          }
          accentFrom="from-violet-600"
          accentTo="to-purple-700"
          linkLabel="Lihat data murid"
          stats={
            studentSummary
              ? [
                  { value: studentSummary.count,                     label: 'Total Murid' },
                  { value: `${studentSummary.agg.percentage}%`,       label: 'Rerata Hadir' },
                  { value: studentSummary.agg.hadir,                 label: 'Total Hadir' },
                  { value: studentSummary.agg.alpha,                 label: 'Total Alpha' },
                ]
              : [
                  { value: '—', label: 'Total Murid' },
                  { value: '—', label: 'Rerata Hadir' },
                ]
          }
        />
      </div>

      {/* ── Personal distribution chart ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-800">Distribusi Kehadiran Saya</h2>
            <p className="text-xs text-slate-400 mt-0.5">Berdasarkan 60 hari kerja terakhir</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{personalStats.percentage}%</span>
        </div>

        <div className="space-y-3">
          <StatusBar label="Hadir"  count={personalStats.hadir}  total={personalStats.total} colorClass="bg-green-500" />
          <StatusBar label="Izin"   count={personalStats.izin}   total={personalStats.total} colorClass="bg-blue-500"  />
          <StatusBar label="Sakit"  count={personalStats.sakit}  total={personalStats.total} colorClass="bg-yellow-500"/>
          <StatusBar label="Alpha"  count={personalStats.alpha}  total={personalStats.total} colorClass="bg-red-500"   />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-slate-50">
          {[
            { label: 'Hadir',  count: personalStats.hadir,  color: 'bg-green-500'  },
            { label: 'Izin',   count: personalStats.izin,   color: 'bg-blue-500'   },
            { label: 'Sakit',  count: personalStats.sakit,  color: 'bg-yellow-500' },
            { label: 'Alpha',  count: personalStats.alpha,  color: 'bg-red-500'    },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-xs font-semibold text-slate-700">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick navigation tiles ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            to: '/personal',
            label: 'Absensi Saya',
            desc: 'Lihat riwayat & filter kehadiran',
            icon: '📋',
            bg: 'hover:bg-blue-50 hover:border-blue-200',
          },
          {
            to: '/students',
            label: 'Data Murid',
            desc: 'Rekap dan statistik per murid',
            icon: '📊',
            bg: 'hover:bg-violet-50 hover:border-violet-200',
          },
          {
            to: '/personal',
            label: 'Filter Laporan',
            desc: 'Saring per tanggal dan status',
            icon: '🔍',
            bg: 'hover:bg-slate-100 hover:border-slate-300',
          },
        ].map((item) => (
          <Link
            key={item.to + item.label}
            to={item.to}
            className={`flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-150 ${item.bg} group`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-sm text-slate-800 group-hover:text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
