sakuguru/
├── src/
│   ├── app/                      # (1) NEXT.JS APP ROUTER (Halaman & Rute API)
│   │   ├── (auth)/               # Grup rute untuk Login/Register
│   │   │   └── login/page.tsx    
│   │   ├── (dashboard)/          # Grup rute terproteksi (Harus Login)
│   │   │   ├── admin/page.tsx    # Halaman Dashboard Admin
│   │   │   └── teacher/          
│   │   │       ├── page.tsx      # Halaman Jadwal Guru
│   │   │       └── journal/page.tsx # Halaman Form Jurnal Mengajar
│   │   ├── api/                  # Backend API Routes (Endpoint untuk dipanggil Frontend)
│   │   │   └── journal/route.ts  # Endpoint menyimpan jurnal ke database
│   │   └── layout.tsx            # Struktur utama aplikasi (Navbar, Sidebar, Footer)
│   │
│   ├── components/               # (2) REUSABLE UI COMPONENTS
│   │   ├── ui/                   # Komponen dasar (Tombol, Input Text, Modal)
│   │   └── features/             # Komponen khusus fitur yang kompleks
│   │       ├── CameraModule.tsx  # Modul WebRTC untuk foto anti-fraud
│   │       └── ScheduleLock.tsx  # Komponen pengunci waktu
│   │
│   ├── lib/                      # (3) LIBRARY & CONFIGURATION
│   │   ├── db.ts                 # Koneksi ke PostgreSQL (Prisma/Drizzle ORM)
│   │   └── utils.ts              # Fungsi bantuan (misal: format tanggal/jam)
│   │
│   ├── hooks/                    # (4) CUSTOM REACT HOOKS (Logika Bisnis)
│   │   ├── useCamera.ts          # Logika untuk switch kamera depan/belakang
│   │   └── useTimeValidation.ts  # Logika validasi jadwal (Buffer time 15 menit)
│   │
│   └── types/                    # (5) TYPESCRIPT DEFINITIONS
│       └── index.ts              # Definisi tipe data (misal: Tipe Guru, Siswa, Jurnal)
│
├── public/                       # Aset statis (Logo Sekolah, Ikon PWA)
├── .eslintrc.json                # Aturan linter (Pengecek error kode)
└── package.json                  # Daftar dependensi aplikasi