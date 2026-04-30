# Spesifikasi Modul Super Admin: E-Guru SaaS (SaaS Owner Control Panel)

**Target Pengguna:** Pemilik Aplikasi, Manajer Bisnis SaaS, Tim Support IT.
**Perangkat Utama:** PC Desktop / Laptop
**Tujuan Utama:** Manajemen tenant (klien sekolah), pemantauan kapasitas infrastruktur, dan administrasi berlangganan (billing).

---

## Bagian 1: Product Requirements Document (PRD) - Fungsionalitas Super Admin

### 1.1 Autentikasi & Keamanan Tingkat Tinggi
* **Kebutuhan:** Karena Super Admin memegang akses ke seluruh data sekolah, halaman ini tidak boleh mudah ditemukan.
* **Fungsionalitas:**
  * Rute *login* disembunyikan (Contoh: tidak menggunakan `/login`, melainkan `/system-auth/su-portal`).
  * Menerapkan pembatasan percobaan *login* (Rate Limiting) untuk mencegah serangan *brute-force*.

### 1.2 Global Dashboard (Pusat Kendali Bisnis)
* **Kebutuhan:** Pemantauan metrik bisnis dan beban *server* secara sekilas.
* **Fungsionalitas:**
  * Menampilkan **Total Klien Aktif** (Sekolah yang berlangganan).
  * Menampilkan **Total Pengguna Aktif** (Akumulasi seluruh guru dari berbagai sekolah).
  * Menampilkan **Pemakaian S3 Storage** (Seberapa banyak kapasitas Biznet NEO Object Storage yang sudah terpakai oleh foto-foto *anti-fraud*).

### 1.3 Manajemen Tenant (Sekolah/Instansi)
* **Kebutuhan:** Mendaftarkan sekolah baru, memblokir sekolah yang menunggak, atau menghapus data sekolah yang berhenti berlangganan.
* **Fungsionalitas (CRUD Tenant):**
  * Super Admin dapat membuat entitas "Sekolah Baru". Saat sekolah dibuat, sistem otomatis menggenerasi 1 akun "Admin Sekolah" pertama untuk diserahkan ke klien.
  * **Status Toggle:** Super Admin dapat mengubah status sekolah menjadi `ACTIVE`, `SUSPENDED` (dibekukan karena telat bayar), atau `TRIAL` (Masa percobaan gratis).
  * *Efek Suspensi:* Jika di-set `SUSPENDED`, seluruh guru dan admin di sekolah tersebut otomatis ter-logout dan tidak bisa mengakses aplikasi hingga status diaktifkan kembali.

### 1.4 Modul Penagihan & Paket Berlangganan (Billing)
* **Kebutuhan:** Mencatat riwayat pembayaran dari setiap klien.
* **Fungsionalitas:**
  * Menetapkan kuota maksimal (misal: "Sekolah A batas maksimal 100 santri", "Sekolah B batas maksimal 500 santri").
  * Mengatur tanggal jatuh tempo (Due Date) berlangganan per sekolah.

### 1.5 Fitur Dukungan IT (Impersonation / Login-As) - *Fitur Premium*
* **Kebutuhan:** Jika Admin Sekolah klien mengalami kendala/bug dan meminta bantuan (Technical Support), Super Admin harus bisa melihat apa yang dilihat klien tanpa perlu meminta *password* mereka.
* **Fungsionalitas:** Super Admin memiliki tombol rahasia **"Login sebagai Admin Sekolah ini"**. Sistem akan mem-bypass keamanan (tanpa *password*) dan membawa Super Admin masuk ke dalam *dashboard* sekolah tersebut untuk melakukan perbaikan. Segala tindakan akan dicatat di sistem *log* untuk keamanan.

---

## Bagian 2: User Interface (UI) Flow & Interaksi

Super Admin tidak akan berbagi antarmuka yang sama dengan UI sekolah. Desainnya dibuat lebih "Tech/Corporate", menggunakan warna dasar hitam/gelap (*Dark Mode*) untuk membedakannya secara psikologis dari antarmuka pengguna biasa.

### Layar 1: Halaman Login Superadmin (Hidden Portal)
* Antarmuka minimalis, layar gelap, tanpa logo mencolok. Hanya ada kotak *login* terenkripsi di tengah layar.

### Layar 2: Executive Dashboard
*Diakses pertama kali saat berhasil login.*
* **Atas (Bussiness Metrics):** Kartu data berjejer berisi statistik finansial dan penggunaan:
  * "Active Tenants: 12 Instansi"
  * "Total Teachers: 840 Pengguna"
  * "Storage Usage: 15 GB / 50 GB (Biznet S3)"
* **Tengah (Grafik Aktivitas):** Grafik garis (Line Chart) menunjukkan jumlah *traffic* harian guru yang melakukan pengisian jurnal. Membantu Anda memprediksi kapan VPS perlu di-*upgrade*.

### Layar 3: Manajemen Instansi (Tenant List)
*Diakses melalui menu sidebar "Tenants".*
* **Tabel Utama:** Daftar seluruh sekolah yang terdaftar.
  * *Kolom:* ID | Nama Instansi | Kuota Santri | Status | Jatuh Tempo | Aksi.
  * *Visual UX:* Status `ACTIVE` (Badge Hijau), `TRIAL` (Badge Biru), `SUSPENDED` (Badge Merah).
* **Interaksi (Tombol Aksi):** Klik icon ⚙️ (Gear) di sebelah nama sekolah akan membuka halaman pengaturan spesifik untuk sekolah tersebut.

### Layar 4: Tenant Detail & Billing Control
*Diakses setelah menekan nama sekolah tertentu pada Layar 3.*
* **Header:** Menampilkan nama instansi klien (Contoh: "Pondok Pesantren Darussalam").
* **Area Kiri (Informasi & Kuota):** Form untuk mengedit nama instansi, menaikkan/menurunkan batas maksimal santri dan guru, serta mengganti status masa aktif.
* **Area Kanan (Danger Zone & Support):**
  * Tombol Merah Terang: **[Bekukan Instansi (Suspend)]**
  * Tombol Hitam: **[🔑 Login sebagai Admin Sekolah Ini]** (Fitur Impersonation).

### Layar 5: System Logs (Log Sistem Server)
*Diakses melalui menu "System Logs".*
* Tabel sederhana berbasis teks untuk melihat riwayat aktivitas *backend*. Jika ada *error* pada *server* atau koneksi *database* gagal, akan tercatat di sini sehingga Anda bisa langsung memberikan laporan kepada *developer* untuk diperbaiki tanpa harus masuk ke terminal VPS Biznet.