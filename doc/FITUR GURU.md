# Spesifikasi Modul Guru: SakuGuru SaaS (Mobile-First)

**Target Pengguna:** Guru / Ustadz  
**Perangkat Utama:** Smartphone (Progressive Web App / PWA)  
**Tujuan Utama:** Mengurangi beban administrasi harian dengan alur input kurang dari 1 menit per sesi kelas, serta memberikan akses cepat ke data akademik (nilai, absen, dan agenda).

---

## Bagian 1: Product Requirements Document (PRD) - Fungsionalitas

### 1.1 Autentikasi & Keamanan (Login)
* **Kebutuhan:** Guru harus masuk menggunakan kredensial yang valid (Email/NISN/NIP dan Password).
* **Sistem:** Sesi *login* dijaga menggunakan NextAuth. Aplikasi akan tetap *login* (persistent session) selama 30 hari untuk memudahkan akses harian, kecuali guru menekan tombol *Logout*.

### 1.2 Dashboard Jadwal Pintar (Smart Schedule)
* **Kebutuhan:** Sistem otomatis mendeteksi hari dan jam saat ini, lalu menampilkan jadwal khusus untuk hari tersebut.
* **Aturan Time-Gate (Kunci Waktu):**
  * **Status Tunggu (Locked):** Jadwal yang jam mulainya masih lebih dari 15 menit ke depan tidak bisa diklik.
  * **Status Aktif (Ready):** Tombol terbuka tepat 15 menit sebelum kelas dimulai hingga 30 menit setelah kelas berakhir.
  * **Status Terlewat (Expired):** Jika guru tidak mengisi hingga batas waktu toleransi habis (+30 menit), form dikunci permanen dengan status "Terlewat" (butuh intervensi Admin untuk membuka).

### 1.3 Modul Pengisian Jurnal & Absensi Harian
* **Kebutuhan:** Antarmuka pengisian satu arah (Wizard/Step-by-step) untuk meminimalisir kebingungan.
* **Data Siswa:** Menarik daftar nama siswa secara otomatis berdasarkan kelas yang dipilih. Status default semua siswa adalah "Hadir".
* **Data Materi:** Kolom teks panjang (Textarea) yang wajib diisi (Required) untuk mencatat ringkasan pelajaran.

### 1.4 Modul Kamera Anti-Fraud (In-App Camera)
* **Kebutuhan:** Pengambilan gambar langsung dari dalam aplikasi (WebRTC).
* **Aturan Validasi:**
  * Tombol unggah (*upload*) dari galeri HP ditiadakan.
  * Fitur perpindahan kamera (Depan/Belakang) disediakan.
  * Gambar final otomatis dicap dengan *Watermark* (Tanggal, Waktu Server, Lokasi, Nama Sekolah) sebelum dikirim ke server *Cloud Storage*.

### 1.5 Modul Rekap Penilaian Akademik
* **Kebutuhan:** Fitur pengisian nilai semester yang fleksibel dan tersimpan otomatis (*auto-save*).
* **Perhitungan Otomatis:** Sistem mengeksekusi rumus secara *real-time*:
  $$\text{Nilai Akhir} = (0.20 \times \text{Nilai Harian}) + (0.40 \times \text{UTS}) + (0.40 \times \text{UAS})$$
* **Validasi Angka:** Batas input nilai adalah 0 hingga 100. Sistem menolak input huruf atau angka di luar batas.

### 1.6 Modul Kalender Akademik
* **Kebutuhan:** Guru memerlukan visibilitas terhadap agenda sekolah (hari libur, pekan ujian, rapat kerja) untuk merencanakan materi pembelajaran (RPP).
* **Fungsionalitas (Read-Only):** * Guru hanya dapat melihat agenda yang telah diatur oleh Admin Sekolah dengan penanda warna (*color coding*).
  * Terintegrasi dengan jadwal: Jika hari tersebut ditandai sebagai "Libur Nasional", sistem *Time-Gate* otomatis menonaktifkan tagihan pengisian jurnal harian.

### 1.7 Modul Rekap Kehadiran Siswa (Per Mata Pelajaran)
* **Kebutuhan:** Guru perlu melihat riwayat persentase kehadiran siswa di kelas yang diampunya sebagai bahan pertimbangan pembinaan.
* **Fungsionalitas:**
  * Menampilkan kalkulasi persentase kehadiran (Contoh: Siswa A hadir 90%, Alpa 10%).
  * Filter multi-level: Pemilihan "Kelas" dan "Mata Pelajaran".
  * Tampilan *Drill-down*: Mengklik nama siswa menampilkan riwayat tanggal rinci (kapan Sakit, Izin, atau Alpa).

---

## Bagian 2: User Interface (UI) Flow & Interaksi

Aplikasi didesain menggunakan **Bottom Navigation Bar** yang terdiri dari 4 ikon utama: **[Beranda]**, **[Akademik]**, **[Kalender]**, dan **[Profil]**. Berikut adalah alur per layarnya:

### Layar 1: Halaman Beranda (Today's Agenda)
*Diakses melalui menu "Beranda" (Default saat buka aplikasi).*
* **Header:** Sapaan "Selamat Pagi, Ustadz/Bapak [Nama]" dan tanggal hari ini.
* **Body:** Daftar kartu (Card) vertikal berisi jadwal hari ini.
  * *Kartu 1 (Sudah Selesai):* Warna abu-abu terang, terdapat tanda centang hijau (✅ Jurnal Terisi).
  * *Kartu 2 (Sedang Berlangsung):* Warna hijau zamrud, berdenyut perlahan (animasi). Tombol **"Isi Jurnal Sekarang"** aktif.
  * *Kartu 3 (Belum Mulai/Terlewat):* Warna abu-abu redup, ikon gembok (🔒 Terkunci).

### Layar 2: Form Absensi Harian (Step 1)
*Tampil setelah menekan "Isi Jurnal Sekarang".*
* **Header:** Nama mata pelajaran dan kelas (Contoh: "Matematika - Kelas X IPA 1").
* **Body:** Daftar nama siswa. Di sebelah kanan tiap nama terdapat *toggle/button* status: `[H]`, `[S]`, `[I]`, `[A]`. Default: Hijau `[H]`.
* **Bawah:** Tombol **"Selanjutnya: Isi Materi"**.

### Layar 3: Form Materi & Bukti Foto (Step 2 & 3)
* **Atas (Materi):** Kolom teks "Materi yang diajarkan hari ini...".
* **Tengah (Kamera):** * Kotak hitam (*viewfinder* kamera) dengan tombol *Shutter* putih.
  * Tombol panah melingkar di pojok kanan atas untuk menukar kamera depan/belakang.
  * Setelah difoto, muncul *preview* ber-*watermark* dan tombol "Ulangi Foto".
* **Bawah:** Tombol Utama **"Kirim Laporan Jurnal"**.

### Layar 4: Feedback Sukses (Notifikasi)
* Muncul animasi centang besar di tengah layar.
* Teks: *"Alhamdulillah, Jurnal dan Absensi Kelas X IPA 1 berhasil disimpan."*
* Aplikasi otomatis mengarahkan guru kembali ke Layar 1 dalam hitungan 3 detik.

### Layar 5: Halaman Pusat Akademik (Rekap Absensi & Nilai)
*Diakses melalui menu "Akademik" di Bottom Nav.*
* **Header:** Terdapat 2 *Tab* menu: **[Tab Rekap Absensi]** dan **[Tab Rekap Nilai]**.
* **Filter Global:** Dropdown untuk memilih "Kelas" dan "Mata Pelajaran".
* **Saat [Tab Rekap Absensi] Aktif:**
  * Menampilkan *progress bar* persentase kehadiran per siswa (Merah jika < 80%, Hijau jika aman).
  * *Interaksi:* Mengetuk nama siswa memunculkan *Bottom Sheet* berisi rincian tanggal ketidakhadiran.
* **Saat [Tab Rekap Nilai] Aktif:**
  * Tampilan menyerupai *spreadsheet* mini. (Kolom: Nama | NH | UTS | UAS | NA).
  * *Interaksi:* Mengetik angka memicu fitur *Auto-save* (muncul teks "Menyimpan..." di pojok). Kolom "NA" (Nilai Akhir) terisi/berubah otomatis.

### Layar 6: Halaman Kalender Akademik
*Diakses melalui menu "Kalender" di Bottom Nav.*
* **Atas:** Kalender bulanan. Hari ini dilingkari warna biru. Tanggal yang memiliki acara ditandai dengan titik (dot) berwarna.
* **Bawah (Agenda List):** Saat guru mengetuk tanggal yang memiliki titik, bagian bawah layar menampilkan detail acaranya. (Contoh: "15-20 Mei: Ujian Akhir Semester Genap").