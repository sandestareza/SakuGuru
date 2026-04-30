# Product Requirements Document (PRD): SakuGuru SaaS

**Versi:** 1.1  
**Status:** Draft Tahap Awal  
**Perancang:** Freelancer Web Developer  
**Tujuan:** Digitalisasi Jurnal Mengajar & Absensi Guru (Anti-Fraud)

---

## 1. Pendahuluan
SakuGuru adalah platform SaaS (Software as a Service) yang dirancang untuk membantu instansi pendidikan memantau kegiatan belajar mengajar secara real-time. Fokus utama aplikasi ini adalah validitas data melalui integrasi jadwal yang ketat dan dokumentasi fisik yang tidak dapat dimanipulasi.

## 2. Tujuan & Sasaran
* **Meningkatkan Kedisiplinan:** Memastikan guru hadir di kelas sesuai jadwal yang telah ditentukan.
* **Akurasi Data:** Menghilangkan pengisian jurnal "susulan" atau manipulasi foto melalui fitur locking system.
* **Efisiensi Pelaporan:** Mengotomatiskan rekapitulasi jurnal dan absensi siswa untuk kebutuhan administrasi sekolah/akreditasi.

## 3. User Personas
| Role | Deskripsi | Kepentingan Utama |
| :--- | :--- | :--- |
| **Guru** | Pengguna yang mengajar di kelas | Kemudahan input jurnal, absensi cepat, dan dokumentasi langsung. |
| **Admin Sekolah** | Kepala Sekolah atau Staf Tata Usaha | Monitoring real-time, manajemen jadwal, dan ekspor laporan. |
| **Superadmin** | Pemilik Platform (SaaS Owner) | Manajemen sekolah (tenant), billing, dan kontrol infrastruktur. |

## 4. Fitur Utama (Functional Requirements)

### 4.1 Modul Jurnal Mengajar & Absensi (Schedule-Locked)
* **Sinkronisasi Jadwal:** Sistem hanya menampilkan form jurnal untuk mata pelajaran dan kelas yang sesuai dengan jadwal guru saat itu.
* **Time-Gate Logic:**
    * Form hanya terbuka `X menit` sebelum jadwal dimulai.
    * Form otomatis terkunci (tidak bisa diedit/diisi) `Y menit` setelah jadwal berakhir.
* **Data Input:** Nama Kelas, Mata Pelajaran, Ringkasan Materi, dan Daftar Kehadiran Siswa (H/S/I/A).

### 4.2 Modul Dokumentasi Anti-Fraud (In-App Camera)
* **Direct Access:** Menggunakan modul kamera internal di dalam aplikasi (WebRTC).
* **Dual Camera Support:** Mendukung perpindahan kamera depan (selfie dengan siswa) dan kamera belakang (foto suasana kelas/papan tulis).
* **Gallery Block:** Sistem **tidak menyediakan** tombol unggah dari galeri. Foto harus diambil secara langsung saat itu juga.
* **Auto-Watermark:** Foto yang tersimpan akan memiliki overlay teks berisi: *Tanggal, Waktu, Lokasi, dan Nama Sekolah*.

### 4.3 Dashboard & Reporting
* **Live Feed:** Admin dapat melihat daftar guru yang sedang mengajar dan yang belum mengisi jurnal secara real-time.
* **Export Engine:** Mengunduh laporan per tanggal range, filter kelas, filter guru, dalam format Excel (.xlsx) atau PDF .
* **Struktur Tabel Data:** No | Waktu Pelaksanaan | Pengajar & Kelas | Mata Pelajaran | Ringkasan Materi | Rekap Kehadiran | Bukti KBM (Foto)

### 4.4 Manajemen SaaS (Multi-Tenancy)
* **Isolasi Data:** Data antar sekolah dipisahkan secara aman di level database.
* **Subscription Management:** Kontrol akses fitur berdasarkan paket langganan sekolah.

---

## 5. Catatan Revisi & Keputusan Bisnis
* **Kamera:** Disepakati mendukung kamera depan dan belakang untuk fleksibilitas guru.
* **Keamanan:** Akses galeri ditutup total untuk mencegah penggunaan foto lama.