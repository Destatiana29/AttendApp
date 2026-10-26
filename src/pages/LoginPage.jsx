import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { fetchUsers } from '../services/api';

// ─── Email validation regex ───────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Form validation ──────────────────────────────────────────────────────────
function validateForm(email, password) {
  const errs = {};
  if (!email.trim()) {
    errs.email = 'Email tidak boleh kosong.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errs.email = 'Format email tidak valid.';
  }
  if (!password) {
    errs.password = 'Password tidak boleh kosong.';
  }
  return errs;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated background blobs for the hero panel */
function HeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 flex-col items-center justify-center p-12">
      {/* Subtle texture — two soft orbs, very low opacity */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400 rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-zinc-400 rounded-full opacity-10 blur-3xl" />

      <div className="relative z-10 text-center text-white max-w-sm">
        {/* Logo mark */}
        <div className="w-16 h-16 bg-white/10 border border-white/15 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3 tracking-tight">AttendApp</h1>
        <p className="text-zinc-400 text-base leading-relaxed mb-10">
          Sistem absensi instructor &amp; murid yang efisien dan mudah digunakan.
        </p>

        {/* Feature list */}
        <ul className="space-y-3 text-left">
          {[
            { text: 'Dashboard statistik real-time' },
            { text: 'Riwayat absensi 60 hari terakhir' },
            { text: 'Filter canggih per tanggal & status' },
            { text: 'Pantau absensi seluruh murid' },
          ].map(({ text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-zinc-300 text-sm">{text}</span>
            </li>
          ))}
        </ul>

        {/* Bottom tagline */}
        <p className="mt-12 text-zinc-600 text-xs">Coding Test · Front-End Engineer</p>
      </div>
    </div>
  );
}

/** Skeleton loader for demo account cards */
function DemoSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-2.5 bg-slate-100 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Clickable demo account card */
function DemoCard({ user, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 text-left w-full group"
    >
      <img
        src={user.image}
        alt={user.firstName}
        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-stone-700 group-hover:text-zinc-900 truncate">
          {user.firstName} {user.lastName}
          <span className={`ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            user.role === 'admin'
              ? 'bg-zinc-800 text-zinc-100'
              : 'bg-stone-200 text-stone-600'
          }`}>
            {user.role}
          </span>
        </p>
        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
        <p className="text-[11px] text-slate-400 font-mono truncate">pw: {user.password}</p>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, user, setAllUsers } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Fetch users once for: (a) login validation, (b) demo accounts display
  const { data: users, loading: usersLoading, error: usersError } = useFetch(fetchUsers);

  // Pick 2 demo accounts from real DummyJSON data — one admin/moderator, one user
  const demoAccounts = useMemo(() => {
    if (!users) return [];
    const instructor = users.find((u) => u.role !== 'user');
    const student = users.find((u) => u.role === 'user');
    return [instructor, student].filter(Boolean);
  }, [users]);

  // Auto-fill form when clicking a demo account
  const handleDemoSelect = (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setFieldErrors({});
    setLoginError('');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const errs = validateForm(email, password);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoginError('');

    if (!users) {
      setLoginError('Data pengguna belum siap. Coba beberapa saat lagi.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate a tiny delay so the loading state is visible
      await new Promise((r) => setTimeout(r, 400));

      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (found) {
        login(found);
        setAllUsers(users); // cache all users in context for other pages
        navigate('/');
      } else {
        setLoginError('Email atau password salah. Periksa kembali kredensial Anda.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* ── Left: hero panel (desktop only) ── */}
      <HeroPanel />

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-slate-800">AttendApp</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Selamat datang kembali 👋</h2>
            <p className="text-slate-500 mt-1">Masuk untuk mengelola absensi Anda</p>
          </div>

          {/* ── Login form ── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                  setLoginError('');
                }}
                placeholder="nama@email.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-150
                  ${fieldErrors.email
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white'
                  }`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                    setLoginError('');
                  }}
                  placeholder="Masukkan password"
                  className={`w-full pl-4 pr-11 py-2.5 rounded-xl border text-sm outline-none transition-all duration-150
                    ${fieldErrors.password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Login error (wrong credentials / API error) */}
            {(loginError || usersError) && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">
                  {loginError || `Gagal memuat data pengguna: ${usersError}`}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              id="btn-login"
              type="submit"
              disabled={isSubmitting || usersLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memverifikasi…
                </>
              ) : usersLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memuat data…
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* ── Demo accounts ── */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-slate-100" />
              <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Akun demo</p>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {usersLoading ? (
              <DemoSkeleton />
            ) : usersError ? (
              <p className="text-xs text-slate-400 text-center py-2">
                Gagal memuat akun demo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((u) => (
                  <DemoCard key={u.id} user={u} onSelect={handleDemoSelect} />
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Klik kartu di atas untuk mengisi otomatis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
