# 🎤 Panduan Presentasi AttendApp

---

## ⚡ Persiapan Sebelum Presentasi

```bash
# Pastikan app sudah jalan
cd d:\Skilltest
npm run dev
# Buka http://localhost:5173
```

Buka juga:
- Tab browser: `http://localhost:5173`
- VS Code dengan file `src/` terbuka (untuk tunjukkan kode kalau ditanya)
- Jangan lupa matikan notifikasi HP/laptop

---

## 🎬 Urutan Demo (± 10–15 menit)

---

### STEP 1 — Buka Halaman Login
**Yang ditunjukkan:** `http://localhost:5173/login`

**Ucapkan:**
> "Ini halaman login aplikasi. Data usernya diambil langsung dari API publik DummyJSON secara real-time — bukan data hardcode."

**Tunjukkan:**
- Kartu demo account muncul setelah loading selesai
- Ada avatar, nama, email, dan role-nya
- Klik salah satu kartu → form langsung terisi otomatis

**Ucapkan:**
> "Saya buat fitur klik-untuk-isi supaya demo lebih mudah, tapi user bisa juga ketik manual."

---

### STEP 2 — Login sebagai Instructor (admin/moderator)
**Pilih akun dengan role `admin` atau `moderator`**

**Ucapkan:**
> "Saya login dulu sebagai instructor. Nanti saya tunjukkan perbedaannya dengan akun biasa."

- Klik **Masuk**
- Tunggu redirect ke Dashboard

---

### STEP 3 — Dashboard
**Yang ditunjukkan:** `/`

**Ucapkan:**
> "Ini halaman Dashboard. Ada dua ringkasan sekaligus — absensi pribadi saya di kiri, dan overview data murid di kanan."

**Tunjukkan:**
- Kartu "Absensi Saya" dengan angka hadir/izin/sakit/alpha
- Kartu "Data Murid" dengan total murid dan persentase
- Grafik batang distribusi kehadiran di bawah
- Role badge di pojok kanan atas: `admin · Instructor`

---

### STEP 4 — Halaman Absensi Saya
**Yang ditunjukkan:** `/personal`

**Ucapkan:**
> "Ini halaman absensi pribadi saya. Data 60 hari kerja terakhir — senin sampai jumat."

**Tunjukkan berurutan:**
1. **6 kartu statistik** — total hari, hadir, izin, sakit, alpha, persentase
2. **Bar info data tersedia** — "Data tersedia: X — Y"

   > "Saya tambahkan info rentang tanggal ini supaya user tahu tanggal berapa saja yang bisa difilter."

3. **Filter tanggal** — pilih dari tanggal tertentu

   > "Kalau saya filter, statistiknya langsung berubah bersama-sama dengan tabelnya."

4. **Filter status** — pilih "Alpha" saja

   > "Bisa filter per status. Berguna misalnya untuk lihat siapa yang paling sering alpha."

5. **Reset filter** — klik tombol Reset

6. **Tabel riwayat** — scroll ke bawah
   > "Tabelnya otomatis diurutkan dari tanggal terbaru."

7. **Peringatan data invalid** (kalau ada)
   > "Kalau ada data yang rusak — misalnya format tanggal salah atau status tidak dikenal — sistem otomatis tandai dan abaikan. Ini salah satu fitur validasi data yang saya buat."

---

### STEP 5 — Halaman Data Murid
**Yang ditunjukkan:** `/students`

**Ucapkan:**
> "Ini halaman rekap absensi seluruh murid. Datanya difilter dari DummyJSON — yang tampil di sini hanya user dengan role 'user', bukan admin atau moderator."

**Tunjukkan:**
1. **7 kartu aggregate** — total murid, total hari, hadir, izin, sakit, alpha, dan % keseluruhan

2. **Filter nama murid**:
   > "Saya bisa cari murid tertentu pakai kolom pencarian ini."
   - Ketik sebagian nama → tabel langsung filter

3. **Filter tanggal**:
   > "Kalau filter tanggal, statistik aggregate di atas juga ikut berubah. Tapi kalau filter nama, yang berubah cuma tabelnya — statistiknya tetap menghitung semua murid."

4. **Progress bar % kehadiran** di kolom terakhir:
   > "Setiap murid ada progress bar-nya — hijau kalau ≥80%, kuning kalau 60–79%, merah kalau di bawah itu."

5. **Tabel terurut** dari hadir terbanyak ke paling sedikit

---

### STEP 6 — Tunjukkan Role-Based Access
**Ucapkan:**
> "Sekarang saya tunjukkan perbedaan antara akun instructor dan akun murid biasa."

1. Klik **Logout**
2. Login pakai akun dengan role `user`
3. Tunjukkan perbedaannya:

| Yang Berubah | Instructor | Murid |
|---|---|---|
| Navbar | Ada "Data Murid" | Tidak ada |
| Dashboard | 2 kartu | 1 kartu saja |
| Badge role | `· Instructor` ungu | `· Murid` biru |
| Buka /students | ✅ Bisa | ❌ "Akses Dibatasi" |

---

### STEP 7 — Tunjukkan Responsif (Opsional)
> "Tampilannya juga responsif untuk mobile."

- Perkecil jendela browser ke ukuran mobile
- Tunjukkan hamburger menu di navbar
- Tunjukkan kartu-kartu yang menyesuaikan lebar

---

## 💬 Poin Teknis yang Bisa Disebutkan

### "Datanya dari mana?"
> "Ada dua sumber:
> 1. **Data user** — dari DummyJSON API saat login (`GET /users?limit=30`)
> 2. **Data absensi** — dibuat sendiri di client pakai algoritma PRNG deterministik (mulberry32) — konsisten setiap refresh."

### "Kenapa data absensi selalu sama?"
> "Pakai seeded PRNG — 'benih' tetap (BASE_SEED = 20240101) menghasilkan urutan angka yang selalu identik."

### "Kalau filter berubah, ada request ke server?"
> "Tidak. Semua filter diproses di memory client pakai `useMemo` — sangat cepat, tidak butuh internet setelah login."

### "Bagaimana validasi data invalid?"
> "Ada `isValidRecord` di `validators.js` — cek format tanggal YYYY-MM-DD dan status harus hadir/izin/sakit/alpha. Saya sengaja masukkan 3 record rusak di generator untuk membuktikan validasi berjalan."

### "Apa perbedaan admin dan user biasa?"
> "Admin/moderator = instructor → akses semua halaman. User biasa = murid → hanya bisa lihat absensi pribadi."

---

## ⚠️ Antisipasi Masalah

| Masalah | Solusi |
|---|---|
| App tidak bisa buka | Jalankan `npm run dev` |
| Demo account tidak muncul | Tunggu sebentar, atau refresh |
| Login gagal | Coba akun lain dari kartu demo |
| Halaman kosong/error | Refresh browser |

---

## 🏆 Kalimat Penutup

> "Aplikasi ini mendemonstrasikan pengambilan data dari API publik, pembuatan data lokal deterministik, validasi data, autentikasi berbasis role, serta tampilan responsif — semua menggunakan React + Vite + Tailwind sesuai tech stack yang diminta. Terima kasih."

---

## 📂 File Kunci (kalau ditanya kode)

| Topik | File |
|---|---|
| Login logic | `src/pages/LoginPage.jsx` baris 170–195 |
| API fetch | `src/services/api.js` |
| Data generator | `src/data/attendanceGenerator.js` baris 91–130 |
| Validator | `src/utils/validators.js` baris 28–43 |
| Role check | `src/context/AuthContext.jsx` baris 44–46 |
| Filter logic | `src/utils/attendanceFilter.js` |
| Stats hitung | `src/utils/attendanceStats.js` |
