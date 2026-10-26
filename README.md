# AttendApp — Sistem Absensi Instructor

Aplikasi web untuk instructor yang mengelola absensi kehadiran pribadi dan murid.
Dibangun sebagai coding test posisi **Front-End Engineer**.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| **Login** | Autentikasi dengan email + password, validasi form, sesi persisten di localStorage |
| **Akun Demo** | Ditampilkan langsung di halaman login, diambil real-time dari DummyJSON |
| **Protected Routes** | Halaman selain `/login` memerlukan autentikasi; redirect otomatis |
| **Dashboard** | Ringkasan statistik personal + murid, distribusi kehadiran, navigasi cepat |
| **Absensi Saya** | Riwayat 60 hari kerja, 6 kartu statistik, filter tanggal & status |
| **Data Murid** | Rekap per murid (hadir/izin/sakit/alpha/%), 7 kartu aggregate, filter + pencarian nama |
| **Filter Terpadu** | Filter tanggal & status mengubah **tabel DAN statistik** sekaligus |
| **Penanganan Invalid Data** | 3 record sengaja invalid → disaring `isValidRecord`, ditampilkan sebagai peringatan |
| **Responsive** | Mobile-first layout dengan hamburger menu di mobile |

---

## 🎭 Akun Demo

Akun demo ditampilkan langsung di halaman login dan diambil secara real-time dari DummyJSON —
**klik kartu akun demo untuk mengisi form otomatis**.

> Karena data berasal dari API publik DummyJSON, kredensial yang ditampilkan selalu valid.

---

## 🚀 Cara Menjalankan

```bash
# 1. Clone repository
git clone <repo-url>
cd skilltest

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
# → Buka http://localhost:5173
```

---

## 🛠️ Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| **React** | 19.x | UI library |
| **Vite** | 8.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first CSS (via `@tailwindcss/vite` plugin) |
| **React Router DOM** | 7.x | Client-side routing |
| **Fetch API** | Native | HTTP requests (tanpa Axios) |
| **JavaScript (ES2022)** | — | Tanpa TypeScript |
| **Git** | — | Version control |

### Library Tambahan

Tidak ada library tambahan di luar tech stack yang diwajibkan.

---

## 📁 Struktur Folder

```
src/
├── components/
│   ├── ui/                    # Komponen UI reusable
│   │   ├── Button.jsx         # Tombol dengan variant & size
│   │   ├── Input.jsx          # Input dengan label & error
│   │   ├── Spinner.jsx        # Loading indicator
│   │   ├── ErrorMessage.jsx   # Tampilan error + tombol "Coba lagi"
│   │   ├── EmptyState.jsx     # Tampilan data kosong
│   │   └── StatusBadge.jsx    # Badge berwarna per status absensi
│   ├── attendance/            # Komponen khusus absensi
│   │   ├── StatsCard.jsx      # Kartu statistik (dipakai di semua halaman)
│   │   ├── AttendanceTable.jsx # Tabel generik dengan kolom via props
│   │   └── AttendanceFilter.jsx # Panel filter (tanggal, status, nama)
│   └── layout/
│       ├── Navbar.jsx         # Header navigasi + hamburger mobile
│       └── ProtectedRoute.jsx # Auth guard + layout wrapper
├── pages/
│   ├── LoginPage.jsx          # Halaman login + demo accounts
│   ├── DashboardPage.jsx      # Ringkasan + distribusi kehadiran
│   ├── PersonalPage.jsx       # Absensi pribadi instructor
│   └── StudentsPage.jsx       # Rekap absensi semua murid
├── services/
│   └── api.js                 # Semua fetch ke DummyJSON
├── data/
│   └── attendanceGenerator.js # Generator data absensi lokal (mulberry32 PRNG)
├── utils/
│   ├── attendanceStats.js     # Pure functions: hitung statistik
│   ├── attendanceFilter.js    # Pure functions: filter records & nama
│   └── validators.js          # isValidRecord, partitionRecords
├── hooks/
│   └── useFetch.js            # Custom hook: { data, loading, error, refetch }
├── context/
│   └── AuthContext.jsx        # Sesi login + cache allUsers
├── App.jsx                    # Router + provider setup
├── main.jsx                   # Entry point
└── index.css                  # Tailwind v4 + design tokens + Google Fonts
```

---

## 📊 Data Absensi

DummyJSON **tidak memiliki endpoint absensi**, sehingga data absensi dibuat secara lokal di
`src/data/attendanceGenerator.js` dengan ketentuan:

- **PRNG**: mulberry32 seeded (`BASE_SEED = 20240101`) — data **konsisten antar refresh**
- **Cakupan**: 60 hari kerja terakhir (Senin–Jumat, lewati Sabtu & Minggu)
- **Users**: 30 user dari DummyJSON (`/users?limit=30`); instructor = user yang login, murid = `role: "user"`
- **Bobot status**: ~85% hadir, 5% izin, 5% sakit, 5% alpha
- **checkIn/checkOut**: diisi hanya untuk status `hadir`; `null` untuk izin/sakit/alpha
- **3 record invalid** sengaja disertakan (tanggal rusak / status tidak dikenal) untuk membuktikan penanganan data tidak valid

### Rumus Persentase Kehadiran

```
Persentase Kehadiran = (hadir / total hari valid) × 100
```

- **total hari valid** = jumlah record yang lolos `isValidRecord` (setelah filter tanggal/status aktif)
- Aman terhadap `total = 0` → hasil `"0.0"` (tidak NaN)
- Format: 1 desimal, misal `"86.7"`

---

## ✅ Unit Check

```bash
node scripts/checkData.mjs
# → 22 assertions, semua PASS
```

Memverifikasi: generator determinism, validator, stat calculation, NaN safety.

---

## 🔐 Keamanan & Catatan

- Password disimpan dalam plaintext sesuai data DummyJSON (bukan untuk production)
- Sesi disimpan di `localStorage` — logout menghapusnya
- Tidak ada operasi push/server-side — semua data absensi ada di memory client
