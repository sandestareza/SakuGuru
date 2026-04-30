# Arsitektur Teknologi & Tech Stack: SakuGuru SaaS

**Fase:** Produksi & Skalabilitas Tinggi  
**Kategori:** Modern Web App / Progressive Web App (PWA)

---

## 1. Core Stack (Sesuai Permintaan)

| Kategori | Teknologi | Rasionalisasi & Peran di SakuGuru |
| :--- | :--- | :--- |
| **Framework UI** | **Next.js (App Router) terbaru** | Rendering super cepat (Server-Side Rendering). Sangat aman karena logika sensitif (seperti validasi jadwal) bisa disembunyikan di *server components*. |
| **Styling** | **Tailwind CSS terbaru** | Membangun UI yang responsif untuk HP guru dengan ukuran *file* yang sangat kecil, membuat aplikasi cepat dimuat bahkan di area susah sinyal. |
| **Animasi** | **Framer Motion** | Memberikan transisi halaman dan interaksi tombol yang mulus, sehingga aplikasi web terasa hidup seperti aplikasi *native* Android/iOS. |
| **Manajemen Form** | **React Hook Form** | Sangat ringan dan tidak membuat aplikasi lambat (*lag*) saat guru mengetik laporan jurnal yang panjang. |
| **Validasi Data** | **Zod** | "Polisi data" kita. Zod akan memastikan form jurnal **tidak bisa dikirim** jika data tidak sesuai format, atau jika diisi di luar jadwal yang diizinkan (Time-Gate Logic). |
| **State Management** | **TanStack Query** | Mengurus *caching* data. Jika koneksi internet guru tiba-tiba putus sebentar, data absen tidak langsung hilang dan bisa dikirim ulang otomatis saat sinyal kembali. |
| **Autentikasi** | **NextAuth.js (Auth.js) terbaru** | Sistem *login* standar industri yang aman. Mendukung manajemen sesi (sesion) terenkripsi untuk membedakan hak akses Guru, Admin, dan Superadmin. |
| **Database ORM** | **Drizzle ORM** | Jauh lebih cepat dan ringan dibanding Prisma. Sangat cocok untuk *query* kompleks dan memastikan tidak ada tipe data yang bocor (*Type-Safe*). |
| **Database Utama** | **PostgreSQL** | Tangguh untuk struktur *multi-tenant* (SaaS). Data sekolah A dan sekolah B dipisah secara relasional dengan aman. |

---

## 2. Solusi Tambahan

Untuk menyempurnakan fitur *Anti-Fraud*, PWA, dan pengembangan antarmuka, saya menambahkan standar *tools* berikut ke dalam ekosistem kita:

* **UI Components: `shadcn/ui`**
  * *Mengapa:* Ini bukan *library* komponen biasa, melainkan komponen berbasis Tailwind yang kodenya bisa kita ubah 100%. Mempercepat pembuatan tabel admin, kalender jadwal, dan *dropdown* modern tanpa mengorbankan performa.
* **Date Management: `date-fns` atau `dayjs`**
  * *Mengapa:* Kunci utama SakuGuru adalah validasi waktu (Toleransi 15 menit sebelum dan 30 menit sesudah jadwal). *Library* ini sangat presisi untuk memanipulasi dan memvalidasi zona waktu secara ketat di sisi *server*.
* **Camera API: `react-webcam` + Native WebRTC**
  * *Mengapa:* Solusi paling stabil untuk mengambil alih kamera depan/belakang langsung dari dalam *browser* (tanpa galeri) dengan dukungan di berbagai jenis HP Android dan iPhone.
* **PWA Enabler: `@serwist/next`**
  * *Mengapa:* Standar terbaru untuk mengubah Next.js menjadi *Progressive Web App* agar SakuGuru bisa diinstal di *homescreen* HP, memiliki ikon aplikasi sendiri, dan mendukung fitur *offline-fallback* sederhana.
* **Cloud Storage: AWS S3 atau Supabase Storage**
  * *Mengapa:* *Database* PostgreSQL tidak boleh digunakan untuk menyimpan foto bukti mengajar. Foto akan diunggah ke *Cloud Storage*, dan PostgreSQL hanya menyimpan *URL link* foto tersebut agar server tetap ringan.