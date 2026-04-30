# SakuGuru SaaS — Frontend Implementation Plan (REVISED)

> **Tujuan:** Membangun frontend lengkap dengan data dummy & CRUD fungsional untuk review client.
> **Scope:** Frontend only — semua data menggunakan state management lokal + dummy data.
> **Bahasa UI:** Seluruh antarmuka dalam Bahasa Indonesia.

---

## Keputusan Desain (Dari Feedback Client)

- ✅ **Semua role menggunakan Mobile-First PWA** dengan Bottom Navigation Bar
- ✅ **1 halaman login** untuk 3 role (bukan akses terpisah)
- ✅ **Build bertahap**: Guru → Admin → Super Admin
- ✅ **Bahasa Indonesia** untuk seluruh UI

---

## Phase 1: Project Scaffolding & Design System ⏳

### Project Init
- Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Dependencies: framer-motion, react-hook-form, zod, @tanstack/react-query, date-fns, lucide-react, recharts

### Design System (Islamic Theme)
- Primary: Nabawi Green `#1B4332`
- Secondary: Desert Gold `#D4AF37`
- Background: Sand White `#F8F9FA`
- Warning: Terra Red
- Font: Plus Jakarta Sans
- Card: rounded-2xl, shadow-sm

### Dummy Data & Store
- Data guru, siswa, kelas, mapel, jadwal, jurnal, kalender, tenant, billing
- Context + useReducer untuk CRUD lokal + localStorage persist

---

## Phase 2: Modul Guru (Mobile PWA) ⏳

### Login (`/login`)
- 1 halaman login untuk 3 role
- Form email/NIP + password
- Islamic decorative background

### Layout Guru
- Bottom Navigation: Beranda, Akademik, Kalender, Profil

### Beranda — Smart Schedule (`/teacher`)
- Sapaan "Selamat Pagi, Ustadz [Nama]"
- Kartu jadwal hari ini:
  - ✅ Selesai → abu-abu + centang hijau
  - 🟢 Aktif → hijau zamrud, pulse
  - 🔴 Terkunci/Terlewat → **merah redup**

### Form Jurnal — Wizard (`/teacher/journal`)
- Step 1: Absensi siswa (toggle H/S/I/A)
- Step 2: Materi (textarea)
- Step 3: Foto — **min 1, max 3 foto** (simulasi kamera)
- Step 4: **Review semua data** + tombol Kirim
- Step 5: Animasi sukses + redirect ke beranda

### Akademik (`/teacher/academic`)
- Tab Rekap Absensi: progress bar per siswa
- Tab Rekap Nilai: spreadsheet mini (NH, UTS, UAS, NA auto-calc)
- Filter Kelas & Mapel

### Kalender (`/teacher/calendar`)
- Kalender bulanan, **kotak aktif saja** (tanpa dot)
- Agenda list saat klik tanggal

### Profil (`/teacher/profile`)
- Info profil guru
- **Tab History Jurnal** — riwayat jurnal yang sudah dikirim
- **Keamanan** — ganti password
- Tombol logout

---

## Phase 3: Modul Admin Sekolah (Mobile PWA) 🔜

### Layout Admin — **Bottom Navigation** (seperti Guru)
- Menu: Dashboard, Master Data, Jadwal, Laporan, Lainnya

### Live Dashboard
- Hero Metrics: Total Kelas, Guru Hadir %, Kelas Kosong
- Tabel Live Feed KBM

### CRUD Master Data
- Data Guru: NIP, Nama, Email (**tanpa Mata Pelajaran**)
- Data Kelas & Mapel
- Data Siswa (+ Impor Excel UI)

### Jadwal Pelajaran
- Matriks grid (Hari vs Jam)
- Anti-bentrok warning

### Kalender Akademik CRUD

### Laporan (Export Center)
1. Pilih jenis laporan
2. Filter parameter
3. **Tampilkan data preview** + tombol Cetak PDF & Cetak Excel

### **Tagihan** (Menu baru)
- Halaman tagihan/billing untuk admin sekolah

---

## Phase 4: Modul Super Admin (Dark Mode) 🔜

### Executive Dashboard
- Metric Cards: Active Tenants, Total Teachers, **Total Students**, Storage
- Line Chart traffic harian
- **Fitur pendapatan billing** chart/cards

### CRUD Tenant, Tenant Detail, Billing, System Logs

---

## Verification Plan
- `npm run build` — no errors
- Browser test semua flow per role
- Responsive test di viewport mobile (375-428px)
