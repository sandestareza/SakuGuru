# Spesifikasi Modul Admin Sekolah: SakuGuru SaaS (Mobile-First)

**Target Pengguna:** Staf Tata Usaha, Admin Kurikulum, Kepala Sekolah
**Perangkat Utama:** PC Desktop / Laptop
**Tujuan Utama:** Memberikan visibilitas *real-time* terkait aktivitas KBM, kemudahan mengelola data master, dan kecepatan mencetak laporan (Export to Excel/PDF).

---

## Bagian 1: Product Requirements Document (PRD) - Fungsionalitas Admin

### 1.1 Autentikasi & Otorisasi
* **Kebutuhan:** Akses panel admin harus sangat aman dan terpisah secara visual maupun fungsional dari akses Guru.
* **Sistem:** Menggunakan NextAuth dengan pengecekan `role === 'ADMIN'`. Jika Guru mencoba mengakses rute `/admin`, sistem otomatis me-redirect ke halaman *login* atau memunculkan halaman 403 (Akses Ditolak).

### 1.2 Live Dashboard (Pusat Pemantauan)
* **Kebutuhan:** Admin perlu mengetahui status sekolah hari ini dalam satu pandangan cepat (Glanceable view).
* **Fitur Utama:**
  * **Statistik Cepat (Top Metrics):** Menampilkan total sesi kelas hari ini, persentase kehadiran guru, dan total siswa absen hari ini.
  * **Live KBM Feed:** Tabel dinamis yang terus diperbarui (menggunakan *polling* atau WebSocket via TanStack Query) menampilkan status *real-time* setiap kelas: "Sedang Berlangsung", "Belum Dimulai", "Kosong (Guru Belum Masuk)", atau "Selesai".
  * **Aksi Cepat:** Admin dapat menekan tombol "Lihat Laporan" pada baris kelas yang sudah selesai untuk langsung melihat foto bukti mengajar.

### 1.3 Manajemen Data Master (CRUD)
* **Kebutuhan:** Admin membutuhkan antarmuka yang bersih untuk Menambah (Create), Membaca (Read), Memperbarui (Update), dan Menghapus (Delete) data utama.
* **Modul Master Data yang Dikelola:**
  1. **Data Guru / Ustadz:** Mengelola NIP/NIK, Nama, dan Kredensial Login.
  2. **Data Kelas & Mata Pelajaran:** Struktur akademik.
  3. **Data Siswa:** Mengelola data siswa berdasarkan kelas (Fokus pada fitur "Impor dari Excel" agar admin tidak perlu mengetik ratusan nama secara manual).
  4. **Data Jadwal Pelajaran (Schedules):** Mengaitkan Guru, Kelas, Mata Pelajaran, dan Jam Pelajaran. Ini adalah pengaturan paling vital karena menentukan berfungsinya fitur *Time-Gate* di sisi Guru.

### 1.4 Modul Kelola Kalender Akademik
* **Kebutuhan:** Admin menetapkan tanggal-tanggal penting (Ujian, Libur Nasional, Rapat).
* **Fungsionalitas:** Admin memilih rentang tanggal di kalender interaktif, lalu memberikan deskripsi (misal: "Libur Idul Fitri") dan menetapkan status acara tersebut (Libur/Aktif). *Status Libur akan otomatis menonaktifkan tagihan jurnal pada rentang tanggal tersebut.*

### 1.5 Export Engine (Pusat Pelaporan)
* **Kebutuhan:** Menghasilkan dokumen legal/resmi yang siap dicetak untuk kebutuhan Rapor atau Akreditasi Dinas Pendidikan.
* **Tipe Ekspor (Format: `.xlsx` dan `.pdf`):**
  * **Rekap Jurnal & Absensi Guru:** Memilih rentang tanggal (Bulan X) -> Menghasilkan laporan daftar kehadiran guru dan materi yang diajarkan (beserta lampiran *thumbnail* foto bukti).
  * **Rekap Absensi Siswa:** Persentase kehadiran siswa dalam 1 semester.
  * **Rekap Nilai (Gradebook):** Mengunduh *spreadsheet* berisi Nilai Harian, UTS, UAS, dan Nilai Akhir yang siap di-*copy-paste* ke sistem Dapodik/e-Rapor.

---

## Bagian 2: User Interface (UI) Flow & Interaksi

Karena diakses via Desktop, aplikasi ini menggunakan tata letak **Layout Sidebar Klasik**. Panel navigasi utama berada di sisi kiri (Sidebar), sedangkan area konten utama berada di sebelah kanan.

### Layar 1: Halaman Login Khusus Admin
* Desain elegan dan profesional. Terdapat logo instansi pengguna (Tenant) dan form *login* sederhana (Username/Email & Password).

### Layar 2: Live Dashboard (Beranda Admin)
*Diakses saat pertama kali masuk.*
* **Atas (Hero Metrics):** Tiga kartu besar berjejer mendatar: "Total Kelas Hari Ini", "Guru Hadir (🟢 85%)", "Kelas Kosong (🔴 3 Kelas)".
* **Tengah (Tabel Live Feed KBM):**
  * Tabel lebar dengan kolom: Jam | Kelas | Mapel | Guru | Status | Aksi.
  * *Visual UX (Color Coding):* Baris tabel dengan status "Kelas Kosong" (melewati batas waktu *start_time* dan guru belum mengisi jurnal) di-*highlight* dengan warna *Alert Red* (Merah Muda/Kuning).
  * *Interaksi:* Menekan tombol "Aksi -> Detail" akan membuka *Pop-up* Modal berisi deskripsi materi dan *preview* foto yang baru saja diunggah guru.

### Layar 3: Manajemen Data Master (Contoh: Data Siswa)
*Diakses via menu "Master Data -> Siswa" di Sidebar.*
* **Atas:** Tombol aksi utama **[+ Tambah Siswa Baru]** dan **[📥 Impor dari Excel]**.
* **Area Tabel:** Tabel data siswa. 
  * Di atas tabel terdapat *Search Bar* yang sangat responsif (mencari nama tanpa me-refresh halaman).
  * Terdapat filter "Berdasarkan Kelas" untuk memudahkan pencarian.
* **Interaksi (Impor Excel):** Saat menekan tombol Impor, muncul *Modal Pop-up* yang menyediakan *link* "Unduh Template Kosong (.xlsx)". Admin mengunggah *file* yang sudah diisi, sistem memvalidasi (*drag and drop*), lalu menyimpannya ke *database* secara massal (*bulk insert*).

### Layar 4: Manajemen Jadwal Pelajaran (Schedules)
*Diakses via menu "Manajemen Jadwal" di Sidebar.*
* **Tampilan Tipe Kalender/Grid:** Berbeda dengan tabel biasa, jadwal ditampilkan dalam bentuk matriks grid (Hari vs Jam Pelajaran) agar admin mudah melihat jadwal yang "Bentrok" (Clash).
* **Interaksi Penjadwalan:**
  * Admin menekan sel kotak yang kosong (Misal: Senin, 08:00).
  * Muncul *Pop-up* untuk memilih `Kelas`, `Mata Pelajaran`, dan `Guru`.
  * Sistem memberikan peringatan otomatis jika guru yang sama diplot di kelas berbeda pada jam yang sama (Anti-Bentrok).

### Layar 5: Pusat Laporan (Export Center)
*Diakses via menu "Laporan & Unduhan" di Sidebar.*
* **Tampilan Step-by-Step Generator:**
  1. **Langkah 1 (Pilih Jenis Laporan):** Admin memilih antara "Laporan Jurnal Guru", "Absensi Siswa", atau "Rekap Nilai Akhir".
  2. **Langkah 2 (Filter Parameter):** Memilih Kelas, Mata Pelajaran, dan Rentang Tanggal (*Date Range Picker*, misal: 1 April - 30 April).
  3. **Langkah 3 (Unduh):** Muncul tombol besar **[📥 Unduh Excel (.xlsx)]** dan **[📄 Cetak PDF]**.
  * *Visual UX:* Saat tombol ditekan, muncul *loading bar* yang berputar (*spinner*) hingga *file* berhasil terunduh.