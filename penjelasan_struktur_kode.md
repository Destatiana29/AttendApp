# Penjelasan Struktur Kode AttendApp

---

## 🗂️ Gambaran Besar

Bayangkan aplikasi ini seperti sebuah gedung dengan beberapa lantai:
- **Lantai 1** — Pintu masuk (Login)
- **Lantai 2** — Otak aplikasi (Konteks & State)
- **Lantai 3** — Sumber data (API + Data Lokal)
- **Lantai 4** — Prosesor data (Utils)
- **Lantai 5** — Bata-bata UI (Komponen)
- **Lantai 6** — Ruangan lengkap (Halaman/Pages)

---

## 1. 🚪 Pintu Masuk Aplikasi

### `index.html` + `src/main.jsx`

```
index.html      ← File HTML kosong, hanya ada <div id="root">
src/main.jsx    ← React "menyuntikkan" dirinya ke dalam div#root itu
```

**Cara kerjanya:**
Browser buka `index.html`, React ambil alih, lalu seluruh tampilan dirender oleh JavaScript.
`main.jsx` hanya 3 baris penting:

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />   // ← semua berawal dari sini
)
```

---

## 2. 🗺️ Peta Navigasi

### `src/App.jsx`

```
src/App.jsx   ← Peta yang menentukan URL mana buka halaman apa
```

Di sini kita daftarkan:
```
URL /login   → buka LoginPage
URL /        → buka DashboardPage  (harus login dulu)
URL /personal→ buka PersonalPage   (harus login dulu)
URL /students→ buka StudentsPage   (harus login dulu)
URL apa pun lain → redirect ke /
```

Yang bertanda **"harus login dulu"** dibungkus `<ProtectedRoute>` —
jika belum login, otomatis diarahkan ke `/login`.

---

## 3. 🔐 Sistem Login & Sesi

### `src/context/AuthContext.jsx`

```
src/context/AuthContext.jsx   ← "Lemari penyimpanan" status login
```

Ini adalah **tempat penyimpanan global** yang bisa diakses semua komponen.
Isinya:
| Variabel | Isi |
|---|---|
| `user` | Data user yang sedang login (nama, email, foto, role) |
| `isLoading` | `true` saat aplikasi pertama dibuka (mengecek sesi lama) |
| `allUsers` | Daftar semua user dari DummyJSON (di-cache setelah login) |
| `isInstructor` | `true` kalau role = `admin` atau `moderator` |

**Kenapa perlu ini?**
Supaya halaman mana pun bisa tahu "siapa yang lagi login" tanpa perlu kirim data bolak-balik.

Saat pertama buka → dicek dulu di `localStorage` (memori browser):
```
localStorage → ada data lama? → otomatis login lagi (sesi persisten)
             → tidak ada?     → tampilkan halaman login
```

### `src/components/layout/ProtectedRoute.jsx`

```
src/components/layout/ProtectedRoute.jsx   ← Satpam halaman
```

Cara kerjanya:
```
Mau buka /dashboard?
  → Belum login → "Maaf, balik ke /login dulu"
  → Sudah login → "Silakan masuk, tampilkan Navbar + halaman yang diminta"
```

---

## 4. 🔑 Halaman Login

### `src/pages/LoginPage.jsx`

```
src/pages/LoginPage.jsx   ← Seluruh tampilan & logika halaman login
```

Halaman ini terdiri dari 3 bagian utama:

**A. Panel kiri (HeroPanel)** — Dekorasi gelap dengan nama app + fitur-fitur
**B. Panel kanan** — Form login yang sesungguhnya

Alur ketika user klik **Masuk**:
```
1. Validasi form (email kosong? format benar? password ada?)
2. Ambil semua user dari DummyJSON API
3. Cari user yang email + password-nya cocok
4. Cocok?  → Simpan ke AuthContext → Redirect ke /
   Tidak?  → Tampilkan pesan error
```

**Fitur Demo Accounts:**
Kartu-kartu demo di bawah form diambil langsung dari API.
Klik kartunya → form langsung terisi otomatis.

---

## 5. 🌐 Mengambil Data dari Internet (API)

### `src/services/api.js`

```
src/services/api.js   ← Semua perintah "ambil data dari internet" ada di sini
```

Kita hanya punya **satu fungsi**:
```js
fetchUsers()
// → Kirim permintaan ke: https://dummyjson.com/users?limit=30
// → Dapat balasan: array 30 user dengan nama, email, password, foto, role
// → Kalau internet error → lempar pesan error
```

**Mengapa DummyJSON?**
Karena aplikasi ini tidak punya server sendiri.
DummyJSON adalah layanan gratis yang menyediakan data user palsu untuk latihan.

### `src/hooks/useFetch.js`

```
src/hooks/useFetch.js   ← "Asisten" yang mengurus loading/error saat fetch
```

Daripada setiap komponen nulis kode loading sendiri-sendiri, pakai hook ini:
```js
const { data, loading, error } = useFetch(fetchUsers)
// data    = hasil fetch (atau null kalau belum selesai)
// loading = true saat sedang menunggu
// error   = pesan error kalau gagal
```

---

## 6. 📦 Data Absensi Lokal (Bukan dari Internet)

### `src/data/attendanceGenerator.js`

```
src/data/attendanceGenerator.js   ← "Pabrik" data absensi palsu
```

**Kenapa tidak dari API?**
DummyJSON tidak punya endpoint absensi, jadi kita buat sendiri di sisi client.

**Cara kerjanya:**
```
Ambil 60 hari kerja terakhir (Senin–Jumat, skip Sabtu-Minggu)
Untuk setiap user (30 orang) × setiap hari (60 hari) = 1.800 record

Setiap record punya:
  - personId : siapa orangnya
  - date     : tanggal (format YYYY-MM-DD)
  - status   : hadir / izin / sakit / alpha  (acak tapi konsisten)
  - checkIn  : jam masuk (hanya kalau hadir)
  - checkOut : jam pulang (hanya kalau hadir)
```

**Mengapa datanya selalu sama walaupun di-refresh?**
Pakai **seeded PRNG** (mulberry32) — angka acaknya ditentukan oleh benih tetap (`20240101`).
Benih yang sama → urutan angka yang sama → data yang sama.

**3 record invalid yang sengaja dimasukkan:**
```js
{ date: 'invalid-date', status: 'hadir' }   // format tanggal rusak
{ date: '2024/01/15',   status: 'hadir' }   // pakai slash, bukan hyphen
{ date: '2024-08-05',   status: 'unknown' } // status tidak dikenal
```
Tujuannya: membuktikan validator berjalan dengan benar.

---

## 7. 🔬 Pengolah Data (Utils)

### `src/utils/validators.js`

```
src/utils/validators.js   ← Pemeriksa: apakah record ini valid?
```

Aturannya:
1. `date` harus format `YYYY-MM-DD` dengan tanda `-`
2. `date` harus tanggal kalender nyata (bukan `2024-02-30`)
3. `status` harus salah satu dari: `hadir`, `izin`, `sakit`, `alpha`

Fungsi `partitionRecords()` memisahkan:
```
1800 records total
  → 1797 valid   (masuk ke perhitungan)
  → 3 invalid    (dibuang, ditampilkan sebagai peringatan)
```

### `src/utils/attendanceStats.js`

```
src/utils/attendanceStats.js   ← Mesin penghitung statistik
```

Fungsi-fungsi di sini:
| Fungsi | Hasil |
|---|---|
| `getPersonStats(records)` | { hadir: 51, izin: 3, sakit: 4, alpha: 2, total: 60, percentage: "85.0" } |
| `getStudentsStats(records, students)` | Array stats per murid (dipakai di tabel StudentsPage) |
| `getAggregateStats(studentStatsArray)` | Gabungan semua murid (dipakai di kartu angka besar) |

### `src/utils/attendanceFilter.js`

```
src/utils/attendanceFilter.js   ← Mesin penyaring data
```

Fungsi-fungsi:
| Fungsi | Kegunaan |
|---|---|
| `applyRecordFilters(records, filters)` | Saring berdasarkan tanggal & status |
| `filterByName(studentStats, name)` | Saring berdasarkan nama murid (StudentsPage) |
| `DEFAULT_FILTERS` | Nilai awal filter (semua kosong = tampilkan semua) |

---

## 8. 🧱 Komponen UI (Bata-bata Tampilan)

### `src/components/ui/` — Komponen Umum

```
Button.jsx       ← Tombol (4 warna: primary/secondary/danger/ghost)
Input.jsx        ← Kolom input teks dengan label & pesan error
Spinner.jsx      ← Animasi loading (lingkaran berputar)
ErrorMessage.jsx ← Tampilan error merah + tombol "Coba lagi"
EmptyState.jsx   ← Tampilan "tidak ada data" dengan ikon
StatusBadge.jsx  ← Label berwarna kecil: Hadir/Izin/Sakit/Alpha
```

Ini seperti **lego** — dibuat sekali, dipakai berulang di banyak halaman.

### `src/components/attendance/` — Komponen Khusus Absensi

```
StatsCard.jsx        ← Kotak statistik (angka besar + label + garis warna)
AttendanceTable.jsx  ← Tabel data (fleksibel: bisa untuk personal & murid)
AttendanceFilter.jsx ← Panel filter (tanggal, status, nama)
```

**AttendanceTable** adalah yang paling canggih — dia tidak tahu mau tampilkan kolom apa.
Yang menentukan adalah `columns` prop yang dikirim dari halaman:

```jsx
// Di PersonalPage — kolom: Tanggal, Status, Jam Masuk, Jam Pulang
// Di StudentsPage — kolom: Nama, Hadir, Izin, Sakit, Alpha, Total, %
```

### `src/components/layout/` — Struktur Halaman

```
Navbar.jsx        ← Bar navigasi atas (logo, menu, user info, logout)
ProtectedRoute.jsx← Satpam + layout wrapper (Navbar + konten halaman)
```

---

## 9. 📄 Halaman-Halaman (Pages)

### `src/pages/DashboardPage.jsx`

```
src/pages/DashboardPage.jsx   ← Halaman utama setelah login
```

Isi:
- Sapaan "Selamat datang, [Nama]!"
- Kartu **Absensi Saya** (ringkasan singkat, link ke /personal)
- Kartu **Data Murid** (hanya untuk instructor/admin)
- Grafik batang distribusi kehadiran pribadi
- Tombol navigasi cepat

### `src/pages/PersonalPage.jsx`

```
src/pages/PersonalPage.jsx   ← Absensi pribadi si instructor yang login
```

Alur data:
```
AuthContext (siapa yang login?)
  → Generator (ambil 60 record milik user ini)
  → Validator (buang yang tidak valid)
  → Filter (terapkan filter tanggal/status)
  → Stats  (hitung statistik dari hasil filter)
  → Tampilkan: 6 kartu + filter panel + tabel riwayat
```

### `src/pages/StudentsPage.jsx`

```
src/pages/StudentsPage.jsx   ← Data absensi semua murid
```

Alur data:
```
API DummyJSON (ambil semua user)
  → Saring: role='user' && bukan user yang login = murid
  → Generator (ambil record semua murid)
  → Validator (buang yang tidak valid)
  → Filter tanggal/status → ubah STATISTIK + TABEL
  → Filter nama           → ubah TABEL SAJA (statistik tetap)
  → Tampilkan: 7 kartu aggregate + filter panel + tabel per murid
```

---

## 10. 🔄 Alur Lengkap: Dari Buka Browser Sampai Lihat Data

```
1. Buka browser → index.html → main.jsx → App.jsx
2. App.jsx cek URL:
   → /login   : tampilkan LoginPage
   → lain-lain: ProtectedRoute cek AuthContext
                → belum login → redirect /login
                → sudah login → tampilkan halaman + Navbar
3. Di LoginPage:
   → useFetch(fetchUsers) → api.js → DummyJSON → dapat 30 user
   → User isi form → klik Masuk
   → Cari yang cocok → login(user) → simpan ke localStorage
   → Redirect ke /
4. Di Dashboard:
   → Baca user dari AuthContext
   → Generator buat 1800 record (atau dari cache)
   → Filter milik user ini → hitung stats → tampilkan
5. Di PersonalPage / StudentsPage:
   → Sama, tapi dengan filter interaktif
   → Setiap filter berubah → useMemo recalculate → tampilan update
```

---

## 🗂️ Ringkasan Lokasi File

```
d:\Skilltest\src\
├── main.jsx                         ← Entry point React
├── App.jsx                          ← Router & semua route
├── index.css                        ← Styling global (Tailwind + font)
│
├── context\
│   └── AuthContext.jsx              ← State login global
│
├── services\
│   └── api.js                       ← Fetch ke DummyJSON
│
├── hooks\
│   └── useFetch.js                  ← Hook untuk loading/error/data
│
├── data\
│   └── attendanceGenerator.js       ← Generator data absensi lokal
│
├── utils\
│   ├── validators.js                ← Cek validitas record
│   ├── attendanceStats.js           ← Hitung statistik
│   └── attendanceFilter.js         ← Saring data
│
├── components\
│   ├── ui\                          ← Komponen umum (Button, Input, dll)
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Spinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── EmptyState.jsx
│   │   └── StatusBadge.jsx
│   ├── attendance\                  ← Komponen khusus absensi
│   │   ├── StatsCard.jsx
│   │   ├── AttendanceTable.jsx
│   │   └── AttendanceFilter.jsx
│   └── layout\                      ← Struktur halaman
│       ├── Navbar.jsx
│       └── ProtectedRoute.jsx
│
└── pages\                           ← Halaman-halaman lengkap
    ├── LoginPage.jsx
    ├── DashboardPage.jsx
    ├── PersonalPage.jsx
    └── StudentsPage.jsx
```
